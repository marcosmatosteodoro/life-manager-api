import { MigrationInterface, QueryRunner } from 'typeorm';

// Remove a tabela de hábitos (daily_check), substituída pelos afazeres (todo).
export class DropDailyCheck1783000000000 implements MigrationInterface {
  name = 'DropDailyCheck1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "daily_check"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "daily_check" ("id" SERIAL NOT NULL, "reading_skills" boolean NOT NULL DEFAULT false, "writing_skills" boolean NOT NULL DEFAULT false, "listening_skills" boolean NOT NULL DEFAULT false, "speaking_skills" boolean NOT NULL DEFAULT false, "apply_jobs" boolean NOT NULL DEFAULT false, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_20a329639f0dc4cf04b26b8ea1a" PRIMARY KEY ("id"))`,
    );
  }
}
