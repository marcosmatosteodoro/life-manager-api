import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Flashcards de imagem: `type` no grupo (text|image) e tabela `flash_card_image`
 * (1:1 com o card) guardando a referência do Vercel Blob privado.
 */
export class FlashCardImageType1784400000000 implements MigrationInterface {
  name = 'FlashCardImageType1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flash_card_group" ADD "type" character varying(16) NOT NULL DEFAULT 'text'`,
    );
    await queryRunner.query(
      `CREATE TABLE "flash_card_image" ("id" SERIAL NOT NULL, "flash_card_id" integer NOT NULL, "pathname" character varying(512) NOT NULL, "url" character varying(1024) NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_flash_card_image_card" UNIQUE ("flash_card_id"), CONSTRAINT "PK_flash_card_image" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "flash_card_image" ADD CONSTRAINT "FK_flash_card_image_card" FOREIGN KEY ("flash_card_id") REFERENCES "flash_card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "flash_card_image" DROP CONSTRAINT "FK_flash_card_image_card"`,
    );
    await queryRunner.query(`DROP TABLE "flash_card_image"`);
    await queryRunner.query(
      `ALTER TABLE "flash_card_group" DROP COLUMN "type"`,
    );
  }
}
