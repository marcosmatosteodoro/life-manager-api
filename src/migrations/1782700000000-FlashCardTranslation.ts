import { MigrationInterface, QueryRunner } from 'typeorm';

export class FlashCardTranslation1782700000000 implements MigrationInterface {
  name = 'FlashCardTranslation1782700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flash_card" ADD "translation" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flash_card" DROP COLUMN "translation"`,
    );
  }
}
