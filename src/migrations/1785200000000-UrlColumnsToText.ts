import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * URLs (company.website, apply.link) podem passar de 255 chars — ex.: URL de
 * busca do LinkedIn com muitos filtros. Antes eram varchar(255) e um POST com
 * URL longa estourava no banco (500). Passam a `text` (sem limite).
 */
export class UrlColumnsToText1785200000000 implements MigrationInterface {
  name = 'UrlColumnsToText1785200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company" ALTER COLUMN "website" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "apply" ALTER COLUMN "link" TYPE text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter pode truncar valores > 255 (USING para não falhar).
    await queryRunner.query(
      `ALTER TABLE "apply" ALTER COLUMN "link" TYPE character varying(255) USING LEFT("link", 255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ALTER COLUMN "website" TYPE character varying(255) USING LEFT("website", 255)`,
    );
  }
}
