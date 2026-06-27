import { MigrationInterface, QueryRunner } from 'typeorm';

export class Feedback1782600000000 implements MigrationInterface {
  name = 'Feedback1782600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."feedback_period_enum" AS ENUM('7d', '15d', '30d', '60d', '1y', 'all')`,
    );
    await queryRunner.query(
      `CREATE TABLE "feedback" ("id" SERIAL NOT NULL, "period" "public"."feedback_period_enum" NOT NULL, "period_start" date, "period_end" date NOT NULL, "input_data" text NOT NULL, "prompt" text NOT NULL, "response" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_feedback" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feedback"`);
    await queryRunner.query(`DROP TYPE "public"."feedback_period_enum"`);
  }
}
