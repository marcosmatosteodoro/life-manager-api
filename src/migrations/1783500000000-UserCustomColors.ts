import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCustomColors1783500000000 implements MigrationInterface {
  name = 'UserCustomColors1783500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "custom_colors" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "custom_colors"`);
  }
}
