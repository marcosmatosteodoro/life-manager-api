import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

/**
 * Módulo de IA reutilizável. Exporta o AiService para os módulos de recurso
 * (ex.: article) que precisam falar com o provedor. ConfigModule já é global.
 */
@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
