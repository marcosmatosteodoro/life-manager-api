import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpenseParcels1785000000000 implements MigrationInterface {
  name = 'ExpenseParcels1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "expense" ADD "parcel_group_id" character varying(36)`,
    );
    await queryRunner.query(`ALTER TABLE "expense" ADD "parcel_number" integer`);
    // Busca rápida das parcelas de uma mesma compra (exclusão/agrupamento).
    await queryRunner.query(
      `CREATE INDEX "IDX_expense_parcel_group" ON "expense" ("parcel_group_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_expense_parcel_group"`);
    await queryRunner.query(
      `ALTER TABLE "expense" DROP COLUMN "parcel_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense" DROP COLUMN "parcel_group_id"`,
    );
  }
}
