import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixedExpense1784900000000 implements MigrationInterface {
  name = 'FixedExpense1784900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fixed_expense" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "value" numeric(10,2) NOT NULL, "payment_day" smallint NOT NULL, "is_variable" boolean NOT NULL DEFAULT false, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_fixed_expense" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "fixed_expense"`);
  }
}
