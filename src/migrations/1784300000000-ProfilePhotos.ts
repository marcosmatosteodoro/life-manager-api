import { MigrationInterface, QueryRunner } from 'typeorm';

/** Fotos de perfil (1:1) do cão e do usuário — referência do Vercel Blob privado. */
export class ProfilePhotos1784300000000 implements MigrationInterface {
  name = 'ProfilePhotos1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dog_photo" ("id" SERIAL NOT NULL, "dog_id" integer NOT NULL, "pathname" character varying(512) NOT NULL, "url" character varying(1024) NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dog_photo_dog" UNIQUE ("dog_id"), CONSTRAINT "PK_dog_photo" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_photo" ADD CONSTRAINT "FK_dog_photo_dog" FOREIGN KEY ("dog_id") REFERENCES "dog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE "user_photo" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "pathname" character varying(512) NOT NULL, "url" character varying(1024) NOT NULL, "mime_type" character varying(64) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_user_photo_user" UNIQUE ("user_id"), CONSTRAINT "PK_user_photo" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_photo" ADD CONSTRAINT "FK_user_photo_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_photo" DROP CONSTRAINT "FK_user_photo_user"`,
    );
    await queryRunner.query(`DROP TABLE "user_photo"`);
    await queryRunner.query(
      `ALTER TABLE "dog_photo" DROP CONSTRAINT "FK_dog_photo_dog"`,
    );
    await queryRunner.query(`DROP TABLE "dog_photo"`);
  }
}
