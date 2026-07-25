import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { tr } from '../i18n/translate';
import { BacklogAudioResponseDto } from './dto/backlog-audio-response.dto';
import { BacklogListResponseDto } from './dto/backlog-list-response.dto';
import { CreateBacklogItemDto } from './dto/create-backlog-item.dto';
import { SetBacklogAudioDto } from './dto/set-backlog-audio.dto';
import { UpdateBacklogItemDto } from './dto/update-backlog-item.dto';
import { BacklogItemAudio } from './entities/backlog-item-audio.entity';
import { BacklogItem } from './entities/backlog-item.entity';
import { type BacklogStatus } from './backlog.constants';

@Injectable()
export class BacklogService {
  constructor(
    @InjectRepository(BacklogItem)
    private readonly repository: Repository<BacklogItem>,
    @InjectRepository(BacklogItemAudio)
    private readonly audioRepository: Repository<BacklogItemAudio>,
  ) {}

  /** Cria um pendente no fim da fila (position = maior + 1). */
  async create(dto: CreateBacklogItemDto): Promise<BacklogItem> {
    const next = (await this.maxPendingPosition(this.repository.manager)) + 1;
    const item = this.repository.create({
      name: dto.name,
      description: dto.description ?? null,
      status: 'pendente',
      position: next,
    });
    return this.repository.save(item);
  }

  /**
   * Lista por status: pendentes por `position ASC`, concluídos por
   * `completedAt DESC`. Sem filtro: pendentes e depois concluídos.
   */
  async findAll(status?: BacklogStatus): Promise<BacklogListResponseDto> {
    let rows: BacklogItem[];
    if (status === 'pendente') {
      rows = await this.repository.find({
        where: { status: 'pendente' },
        order: { position: 'ASC' },
      });
    } else if (status === 'concluido') {
      rows = await this.repository.find({
        where: { status: 'concluido' },
        order: { completedAt: 'DESC' },
      });
    } else {
      const [pendentes, concluidos] = await Promise.all([
        this.repository.find({
          where: { status: 'pendente' },
          order: { position: 'ASC' },
        }),
        this.repository.find({
          where: { status: 'concluido' },
          order: { completedAt: 'DESC' },
        }),
      ]);
      rows = [...pendentes, ...concluidos];
    }
    await this.attachHasAudio(rows);
    return { count: rows.length, rows };
  }

  /** Marca `hasAudio` sem carregar o blob (uma query pelos ids das rows). */
  private async attachHasAudio(rows: BacklogItem[]): Promise<void> {
    if (rows.length === 0) return;
    const audios = await this.audioRepository.find({
      where: { backlogItemId: In(rows.map((r) => r.id)) },
      select: { backlogItemId: true },
    });
    const withAudio = new Set(audios.map((a) => a.backlogItemId));
    for (const row of rows) row.hasAudio = withAudio.has(row.id);
  }

  /** Nota de voz do item (base64). 404 quando não há. */
  async getAudio(id: number): Promise<BacklogAudioResponseDto> {
    const audio = await this.audioRepository.findOne({
      where: { backlogItemId: id },
    });
    if (!audio) {
      throw new NotFoundException(tr('backlog.audioNotFound', { id }));
    }
    return { data: audio.data, mimeType: audio.mimeType };
  }

  /** Grava/atualiza a nota de voz do item (upsert por backlogItemId). */
  async setAudio(
    id: number,
    dto: SetBacklogAudioDto,
  ): Promise<BacklogAudioResponseDto> {
    await this.findOne(id); // garante 404 se o item não existe
    const existing = await this.audioRepository.findOne({
      where: { backlogItemId: id },
    });
    const audio = existing
      ? Object.assign(existing, { data: dto.data, mimeType: dto.mimeType })
      : this.audioRepository.create({
          backlogItemId: id,
          data: dto.data,
          mimeType: dto.mimeType,
        });
    const saved = await this.audioRepository.save(audio);
    return { data: saved.data, mimeType: saved.mimeType };
  }

  /** Remove a nota de voz do item. 404 quando não há. */
  async removeAudio(id: number): Promise<void> {
    const result = await this.audioRepository.delete({ backlogItemId: id });
    if (!result.affected) {
      throw new NotFoundException(tr('backlog.audioNotFound', { id }));
    }
  }

  async findOne(id: number): Promise<BacklogItem> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(tr('backlog.notFound', { id }));
    }
    return item;
  }

  /** Edita apenas nome/descrição (status e position têm rotas próprias). */
  async update(id: number, dto: UpdateBacklogItemDto): Promise<BacklogItem> {
    const item = await this.findOne(id);
    if (dto.name !== undefined) item.name = dto.name;
    if (dto.description !== undefined) item.description = dto.description;
    return this.repository.save(item);
  }

  /**
   * Conclui: zera a position, marca completedAt e fecha o buraco deixado
   * (decrementa os pendentes seguintes). Idempotente.
   */
  async complete(id: number): Promise<BacklogItem> {
    return this.repository.manager.transaction(async (manager) => {
      const item = await this.findOneManaged(manager, id);
      if (item.status === 'concluido') return item;

      const oldPosition = item.position;
      item.status = 'concluido';
      item.completedAt = new Date();
      item.position = null;
      const saved = await manager.save(item);

      if (oldPosition != null) {
        await this.shiftPendingAfter(manager, oldPosition, -1);
      }
      return saved;
    });
  }

  /** Reabre um concluído: volta a pendente no fim da fila. Idempotente. */
  async reopen(id: number): Promise<BacklogItem> {
    return this.repository.manager.transaction(async (manager) => {
      const item = await this.findOneManaged(manager, id);
      if (item.status === 'pendente') return item;

      item.status = 'pendente';
      item.completedAt = null;
      item.position = (await this.maxPendingPosition(manager)) + 1;
      return manager.save(item);
    });
  }

  /**
   * Reordena os pendentes conforme a lista de ids (position = índice + 1).
   * Exige exatamente o conjunto de pendentes (sem faltar/sobrar nem incluir
   * concluídos).
   */
  async reorder(orderedIds: number[]): Promise<BacklogListResponseDto> {
    return this.repository.manager.transaction(async (manager) => {
      const pendentes = await manager.find(BacklogItem, {
        where: { status: 'pendente' },
      });

      const pendingIds = new Set(pendentes.map((p) => p.id));
      const uniqueGiven = new Set(orderedIds);
      const sameSize =
        orderedIds.length === uniqueGiven.size &&
        uniqueGiven.size === pendingIds.size;
      const sameSet = [...uniqueGiven].every((id) => pendingIds.has(id));
      if (!sameSize || !sameSet) {
        throw new BadRequestException(tr('backlog.reorderMismatch'));
      }

      const byId = new Map(pendentes.map((p) => [p.id, p]));
      const toSave = orderedIds.map((id, index) => {
        const item = byId.get(id)!;
        item.position = index + 1;
        return item;
      });
      await manager.save(toSave);

      return {
        count: toSave.length,
        rows: [...toSave].sort((a, b) => a.position! - b.position!),
      };
    });
  }

  /** Remove; se era pendente, compacta as posições seguintes. */
  async remove(id: number): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      const item = await this.findOneManaged(manager, id);
      const oldPosition = item.position;
      await manager.remove(item);
      if (oldPosition != null) {
        await this.shiftPendingAfter(manager, oldPosition, -1);
      }
    });
  }

  /** Maior position entre os pendentes (0 se não houver). */
  private async maxPendingPosition(manager: EntityManager): Promise<number> {
    const raw = await manager
      .createQueryBuilder(BacklogItem, 'b')
      .select('MAX(b.position)', 'max')
      .where('b.status = :status', { status: 'pendente' })
      .getRawOne<{ max: number | null }>();
    return raw?.max ?? 0;
  }

  /** Desloca (delta) a position dos pendentes com position > threshold. */
  private async shiftPendingAfter(
    manager: EntityManager,
    threshold: number,
    delta: number,
  ): Promise<void> {
    await manager
      .createQueryBuilder()
      .update(BacklogItem)
      .set({ position: () => `position + ${delta}` })
      .where('status = :status AND position > :threshold', {
        status: 'pendente',
        threshold,
      })
      .execute();
  }

  private async findOneManaged(
    manager: EntityManager,
    id: number,
  ): Promise<BacklogItem> {
    const item = await manager.findOne(BacklogItem, { where: { id } });
    if (!item) {
      throw new NotFoundException(tr('backlog.notFound', { id }));
    }
    return item;
  }
}
