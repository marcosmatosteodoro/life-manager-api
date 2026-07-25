import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * BACKFILL ÚNICO (remover após aplicado em produção).
 *
 * Prepara o app para multiusuário: associa TODO o dado atual ao único usuário
 * existente (menor id = o admin) antes de ligar o escopo por usuário.
 * - Individual → `creator_id` = primeiro usuário (garante dono).
 * - Compartilhado → `creator_id` = NULL (visível para todos).
 *
 * Tabelas-filhas (*_photo, *_audio, flash_card_image) não têm creator_id:
 * herdam o dono do registro-pai por CASCADE.
 */
export class AssignDataToFirstUser1784500000000 implements MigrationInterface {
  name = 'AssignDataToFirstUser1784500000000';

  // Individual: dono garantido no primeiro usuário.
  private readonly individualTables = [
    'problem', // Sobre mim
    'problem_category',
    'diary',
    'flash_card_group', // Estudos
    'flash_card',
    'article',
    'weight',
    'todo', // Afazeres
    'todo_check',
    'feedback', // Feedback IA (pessoal)
    'backlog_item', // Próximos passos (admin)
  ];

  // Compartilhado: sem dono (visível para todos).
  private readonly sharedTables = [
    'dog', // Cães
    'dog_walk',
    'dog_walk_location',
    'dog_weight',
    'expense', // Finanças
    'expense_category',
    'apply', // Vagas
    'company',
    'country',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = (await queryRunner.query(
      `SELECT id FROM "users" ORDER BY id ASC LIMIT 1`,
    )) as Array<{ id: number }>;
    const firstUserId = rows?.[0]?.id;
    if (!firstUserId) {
      // Sem usuário cadastrado: nada a associar.
      return;
    }

    for (const table of this.individualTables) {
      await queryRunner.query(
        `UPDATE "${table}" SET "creator_id" = $1`,
        [firstUserId],
      );
    }

    for (const table of this.sharedTables) {
      await queryRunner.query(
        `UPDATE "${table}" SET "creator_id" = NULL WHERE "creator_id" IS NOT NULL`,
      );
    }
  }

  public async down(): Promise<void> {
    // Backfill de dados não é revertível (o vínculo anterior não é recuperável).
    // No-op proposital.
  }
}
