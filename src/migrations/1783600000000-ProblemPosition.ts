import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProblemPosition1783600000000 implements MigrationInterface {
  name = 'ProblemPosition1783600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona nullable, semeia posições contíguas (por data/id) e trava NOT NULL.
    await queryRunner.query(`ALTER TABLE "problem" ADD "position" integer`);
    await queryRunner.query(
      `UPDATE "problem" p SET "position" = o.rn
       FROM (
         SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
         FROM "problem"
       ) o
       WHERE p.id = o.id`,
    );
    await queryRunner.query(
      `ALTER TABLE "problem" ALTER COLUMN "position" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "problem" DROP COLUMN "position"`);
  }
}
