import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpensePhoto1784200000000 implements MigrationInterface {
  name = 'ExpensePhoto1784200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // O binário fica no Vercel Blob (privado); aqui guardamos só a referência.
    await queryRunner.query(
      `CREATE TABLE "expense_photo" ("id" SERIAL NOT NULL, "expense_id" integer NOT NULL, "pathname" character varying(512) NOT NULL, "url" character varying(1024) NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_expense_photo" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expense_photo_expense" ON "expense_photo" ("expense_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_photo" ADD CONSTRAINT "FK_expense_photo_expense" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expense_photo" DROP CONSTRAINT "FK_expense_photo_expense"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_expense_photo_expense"`);
    await queryRunner.query(`DROP TABLE "expense_photo"`);
  }
}
