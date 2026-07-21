import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProblemCategory1783700000000 implements MigrationInterface {
  name = 'ProblemCategory1783700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "problem_category" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "color" character varying(16) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_problem_category" PRIMARY KEY ("id"))`,
    );

    // Sem categorias pré-definidas — o usuário cria as próprias.

    // FK opcional em problem; ON DELETE SET NULL preserva o problema.
    await queryRunner.query(`ALTER TABLE "problem" ADD "category_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "problem" ADD CONSTRAINT "FK_problem_category" FOREIGN KEY ("category_id") REFERENCES "problem_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "problem" DROP CONSTRAINT "FK_problem_category"`,
    );
    await queryRunner.query(`ALTER TABLE "problem" DROP COLUMN "category_id"`);
    await queryRunner.query(`DROP TABLE "problem_category"`);
  }
}
