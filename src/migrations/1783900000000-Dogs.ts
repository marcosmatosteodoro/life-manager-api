import { MigrationInterface, QueryRunner } from 'typeorm';

export class Dogs1783900000000 implements MigrationInterface {
  name = 'Dogs1783900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "dog" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "breed" character varying(255) NOT NULL, "sex" character varying(16) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_dog" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dog_walk_location" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "address" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_dog_walk_location" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dog_walk" ("id" SERIAL NOT NULL, "started_at" TIMESTAMP NOT NULL, "ended_at" TIMESTAMP NOT NULL, "duration_seconds" integer NOT NULL, "location_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_dog_walk" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dog_weight" ("id" SERIAL NOT NULL, "dog_id" integer NOT NULL, "value" numeric(6,2) NOT NULL, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" integer, CONSTRAINT "PK_dog_weight" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "dog_walk_dogs" ("dog_walk_id" integer NOT NULL, "dog_id" integer NOT NULL, CONSTRAINT "PK_dog_walk_dogs" PRIMARY KEY ("dog_walk_id", "dog_id"))`,
    );

    // FKs
    await queryRunner.query(
      `ALTER TABLE "dog_walk" ADD CONSTRAINT "FK_dog_walk_location" FOREIGN KEY ("location_id") REFERENCES "dog_walk_location"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_weight" ADD CONSTRAINT "FK_dog_weight_dog" FOREIGN KEY ("dog_id") REFERENCES "dog"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_walk_dogs" ADD CONSTRAINT "FK_dog_walk_dogs_walk" FOREIGN KEY ("dog_walk_id") REFERENCES "dog_walk"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_walk_dogs" ADD CONSTRAINT "FK_dog_walk_dogs_dog" FOREIGN KEY ("dog_id") REFERENCES "dog"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // Seed dos cães pedidos.
    await queryRunner.query(
      `INSERT INTO "dog" ("name", "breed", "sex") VALUES
        ('Puffy', 'Poodle', 'femea'),
        ('Blue', 'Yorkshire', 'macho'),
        ('Lady', 'Yorkshire', 'femea')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dog_walk_dogs" DROP CONSTRAINT "FK_dog_walk_dogs_dog"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_walk_dogs" DROP CONSTRAINT "FK_dog_walk_dogs_walk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_weight" DROP CONSTRAINT "FK_dog_weight_dog"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dog_walk" DROP CONSTRAINT "FK_dog_walk_location"`,
    );
    await queryRunner.query(`DROP TABLE "dog_walk_dogs"`);
    await queryRunner.query(`DROP TABLE "dog_weight"`);
    await queryRunner.query(`DROP TABLE "dog_walk"`);
    await queryRunner.query(`DROP TABLE "dog_walk_location"`);
    await queryRunner.query(`DROP TABLE "dog"`);
  }
}
