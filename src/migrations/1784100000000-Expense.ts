import { MigrationInterface, QueryRunner } from 'typeorm';

export class Expense1784100000000 implements MigrationInterface {
  name = 'Expense1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "expense_category" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "UQ_expense_category_name" UNIQUE ("name"), CONSTRAINT "PK_expense_category" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "value" numeric(10,2) NOT NULL, "type" character varying(16) NOT NULL DEFAULT 'debito', "installments" integer, "date" date NOT NULL, "category_id" integer, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_expense" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "expense_audio" ("id" SERIAL NOT NULL, "expense_id" integer NOT NULL, "data" text NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_expense_audio_expense" UNIQUE ("expense_id"), CONSTRAINT "PK_expense_audio" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" ADD CONSTRAINT "FK_expense_category" FOREIGN KEY ("category_id") REFERENCES "expense_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_audio" ADD CONSTRAINT "FK_expense_audio_expense" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expense_audio" DROP CONSTRAINT "FK_expense_audio_expense"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" DROP CONSTRAINT "FK_expense_category"`,
    );
    await queryRunner.query(`DROP TABLE "expense_audio"`);
    await queryRunner.query(`DROP TABLE "expense"`);
    await queryRunner.query(`DROP TABLE "expense_category"`);
  }
}
