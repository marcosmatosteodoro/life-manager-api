import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArticleStatusAndLink1782302416480 implements MigrationInterface {
  name = 'ArticleStatusAndLink1782302416480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" ADD "link" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."article_status_enum" AS ENUM('READING_IN_PROGRESS', 'SUMMARY_IN_PROGRESS', 'APPLYING_CORRECTION', 'COMPLETED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ADD "status" "public"."article_status_enum" NOT NULL DEFAULT 'READING_IN_PROGRESS'`,
    );
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "time_read" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article" ALTER COLUMN "time_read" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."article_status_enum"`);
    await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "link"`);
  }
}
