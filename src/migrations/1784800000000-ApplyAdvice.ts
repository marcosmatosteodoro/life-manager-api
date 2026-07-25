import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Candidaturas: flag humano/robô, conselho da extensão (1-4) e motivo da decisão.
 */
export class ApplyAdvice1784800000000 implements MigrationInterface {
  name = 'ApplyAdvice1784800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "apply" ADD "is_human" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "apply" ADD "advice_status" smallint`);
    await queryRunner.query(
      `ALTER TABLE "apply" ADD "decision_description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "apply" DROP COLUMN "decision_description"`,
    );
    await queryRunner.query(`ALTER TABLE "apply" DROP COLUMN "advice_status"`);
    await queryRunner.query(`ALTER TABLE "apply" DROP COLUMN "is_human"`);
  }
}
