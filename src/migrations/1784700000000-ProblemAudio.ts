import { MigrationInterface, QueryRunner } from 'typeorm';

/** Nota de voz do problema (1:1, base64 no Postgres). Espelha backlog_item_audio. */
export class ProblemAudio1784700000000 implements MigrationInterface {
  name = 'ProblemAudio1784700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "problem_audio" ("id" SERIAL NOT NULL, "problem_id" integer NOT NULL, "data" text NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_problem_audio_problem" UNIQUE ("problem_id"), CONSTRAINT "PK_problem_audio" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "problem_audio" ADD CONSTRAINT "FK_problem_audio_problem" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "problem_audio" DROP CONSTRAINT "FK_problem_audio_problem"`,
    );
    await queryRunner.query(`DROP TABLE "problem_audio"`);
  }
}
