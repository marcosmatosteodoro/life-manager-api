import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompanyObservation1782800000000 implements MigrationInterface {
  name = 'CompanyObservation1782800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" ADD "observation" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "observation"`);
  }
}
