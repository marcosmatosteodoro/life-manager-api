import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Papéis de usuário: coluna `role` em `users` (default 'member'). Todo usuário
 * já existente vira **admin** (o único usuário atual é o dono do app).
 */
export class UserRole1784600000000 implements MigrationInterface {
  name = 'UserRole1784600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" character varying(16) NOT NULL DEFAULT 'member'`,
    );
    // Usuários pré-existentes são admin (antes de haver members).
    await queryRunner.query(`UPDATE "users" SET "role" = 'admin'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }
}
