import { MigrationInterface, QueryRunner } from 'typeorm';

export class BacklogAudio1784000000000 implements MigrationInterface {
  name = 'BacklogAudio1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "backlog_item_audio" ("id" SERIAL NOT NULL, "backlog_item_id" integer NOT NULL, "data" text NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_backlog_item_audio_item" UNIQUE ("backlog_item_id"), CONSTRAINT "PK_backlog_item_audio" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "backlog_item_audio" ADD CONSTRAINT "FK_backlog_item_audio_item" FOREIGN KEY ("backlog_item_id") REFERENCES "backlog_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "backlog_item_audio" DROP CONSTRAINT "FK_backlog_item_audio_item"`,
    );
    await queryRunner.query(`DROP TABLE "backlog_item_audio"`);
  }
}
