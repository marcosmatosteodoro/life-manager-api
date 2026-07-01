import { MigrationInterface, QueryRunner } from 'typeorm';

export class BacklogItem1783300000000 implements MigrationInterface {
  name = 'BacklogItem1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "backlog_item" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "position" integer, "description" text, "status" character varying(16) NOT NULL DEFAULT 'pendente', "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_backlog_item" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "backlog_item"`);
  }
}
