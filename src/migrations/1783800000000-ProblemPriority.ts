import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProblemPriority1783800000000 implements MigrationInterface {
  name = 'ProblemPriority1783800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // DEFAULT 'media' já preenche as linhas existentes; NOT NULL desde o início.
    await queryRunner.query(
      `ALTER TABLE "problem" ADD "priority" character varying(16) NOT NULL DEFAULT 'media'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "problem" DROP COLUMN "priority"`);
  }
}
