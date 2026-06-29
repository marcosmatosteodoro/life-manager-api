import { MigrationInterface, QueryRunner } from 'typeorm';

export class Todo1782900000000 implements MigrationInterface {
  name = 'Todo1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "todo" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "start_date" date NOT NULL, "end_date" date, "days" text NOT NULL, "tag" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_todo" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "todo_check" ("id" SERIAL NOT NULL, "todo_id" integer NOT NULL, "date" date NOT NULL, "checked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "UQ_todo_check_todo_date" UNIQUE ("todo_id", "date"), CONSTRAINT "PK_todo_check" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_check" ADD CONSTRAINT "FK_todo_check_todo" FOREIGN KEY ("todo_id") REFERENCES "todo"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "todo_check" DROP CONSTRAINT "FK_todo_check_todo"`,
    );
    await queryRunner.query(`DROP TABLE "todo_check"`);
    await queryRunner.query(`DROP TABLE "todo"`);
  }
}
