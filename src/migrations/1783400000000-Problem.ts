import { MigrationInterface, QueryRunner } from 'typeorm';

export class Problem1783400000000 implements MigrationInterface {
  name = 'Problem1783400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "problem" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "status" character varying(16) NOT NULL DEFAULT 'pendente', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_problem" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "problem"`);
  }
}
