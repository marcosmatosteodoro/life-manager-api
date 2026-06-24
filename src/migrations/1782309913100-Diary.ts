import { MigrationInterface, QueryRunner } from "typeorm";

export class Diary1782309913100 implements MigrationInterface {
    name = 'Diary1782309913100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."diary_type_enum" AS ENUM('DAILY', 'GRATITUDE')`);
        await queryRunner.query(`CREATE TABLE "diary" ("id" SERIAL NOT NULL, "day" date NOT NULL, "description" text NOT NULL, "type" "public"."diary_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_7422c55a0908c4271ff1918437d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "diary"`);
        await queryRunner.query(`DROP TYPE "public"."diary_type_enum"`);
    }

}
