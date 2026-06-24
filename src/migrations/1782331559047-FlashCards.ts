import { MigrationInterface, QueryRunner } from "typeorm";

export class FlashCards1782331559047 implements MigrationInterface {
    name = 'FlashCards1782331559047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "flash_card_group" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_1780796681179b34921fda4a1c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "flash_card" ("id" SERIAL NOT NULL, "term" character varying(255) NOT NULL, "value" character varying(255), "picture" character varying(255), "correct_answers" integer NOT NULL DEFAULT '0', "wrong_answers" integer NOT NULL DEFAULT '0', "score" integer NOT NULL DEFAULT '0', "last_review" date, "flash_card_group_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_4ed5054d4eddd35b19fa1972c0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "flash_card" ADD CONSTRAINT "FK_56f07fd1e3123fe89fa3cfc652c" FOREIGN KEY ("flash_card_group_id") REFERENCES "flash_card_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "flash_card" DROP CONSTRAINT "FK_56f07fd1e3123fe89fa3cfc652c"`);
        await queryRunner.query(`DROP TABLE "flash_card"`);
        await queryRunner.query(`DROP TABLE "flash_card_group"`);
    }

}
