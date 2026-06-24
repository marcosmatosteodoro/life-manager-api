import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1782295591904 implements MigrationInterface {
    name = 'Init1782295591904'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "country" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "code" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "website" character varying(255) NOT NULL, "country_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."apply_status_enum" AS ENUM('APPLIED', 'REJECTED', 'IGNORED', 'INTERVIEW_SCHEDULED', 'TECHNICAL_TEST', 'AWAITING_RESPONSE', 'APPROVED')`);
        await queryRunner.query(`CREATE TABLE "apply" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "link" character varying(255), "date" date NOT NULL, "status" "public"."apply_status_enum" NOT NULL, "description" text, "company_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_c61ed680472aa0f58499175d902" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "article" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "reading_time" integer NOT NULL, "time_read" integer NOT NULL, "time_write" integer, "summary" text, "summary_corrected" text, "score" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "daily_check" ("id" SERIAL NOT NULL, "reading_skills" boolean NOT NULL DEFAULT false, "writing_skills" boolean NOT NULL DEFAULT false, "listening_skills" boolean NOT NULL DEFAULT false, "speaking_skills" boolean NOT NULL DEFAULT false, "apply_jobs" boolean NOT NULL DEFAULT false, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_20a329639f0dc4cf04b26b8ea1a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "weight" ("id" SERIAL NOT NULL, "value" numeric(6,2) NOT NULL, "date" date NOT NULL, "time" TIME, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_d62a2bdd27e5c173f24c4c73a41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "FK_da8d0ef69eca5c05097d839d854" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "apply" ADD CONSTRAINT "FK_fd5679fbdeb42ea5e83717f32af" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apply" DROP CONSTRAINT "FK_fd5679fbdeb42ea5e83717f32af"`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "FK_da8d0ef69eca5c05097d839d854"`);
        await queryRunner.query(`DROP TABLE "weight"`);
        await queryRunner.query(`DROP TABLE "daily_check"`);
        await queryRunner.query(`DROP TABLE "article"`);
        await queryRunner.query(`DROP TABLE "apply"`);
        await queryRunner.query(`DROP TYPE "public"."apply_status_enum"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "country"`);
    }

}
