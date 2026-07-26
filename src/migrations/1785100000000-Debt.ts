import { MigrationInterface, QueryRunner } from 'typeorm';

export class Debt1785100000000 implements MigrationInterface {
  name = 'Debt1785100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "debt" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "total_amount" numeric(10,2) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_debt" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "debt_payment" ("id" SERIAL NOT NULL, "debt_id" integer NOT NULL, "value" numeric(10,2) NOT NULL, "date" date NOT NULL, "description" text, "expense_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_debt_payment" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_debt_payment_debt" ON "debt_payment" ("debt_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "debt_payment" ADD CONSTRAINT "FK_debt_payment_debt" FOREIGN KEY ("debt_id") REFERENCES "debt"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "debt_payment" ADD CONSTRAINT "FK_debt_payment_expense" FOREIGN KEY ("expense_id") REFERENCES "expense"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "debt_payment" DROP CONSTRAINT "FK_debt_payment_expense"`,
    );
    await queryRunner.query(
      `ALTER TABLE "debt_payment" DROP CONSTRAINT "FK_debt_payment_debt"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_debt_payment_debt"`);
    await queryRunner.query(`DROP TABLE "debt_payment"`);
    await queryRunner.query(`DROP TABLE "debt"`);
  }
}
