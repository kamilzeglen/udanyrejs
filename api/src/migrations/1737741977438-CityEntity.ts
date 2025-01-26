import { MigrationInterface, QueryRunner } from "typeorm";

export class CityEntity1737741977438 implements MigrationInterface {
    name = 'CityEntity1737741977438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(255), "country" character varying(255), "imageFileId" uuid, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "REL_a28bdc109464ceee15cf738dca" UNIQUE ("imageFileId"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_a28bdc109464ceee15cf738dca6" FOREIGN KEY ("imageFileId") REFERENCES "image_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_0e5b4733e944fc94c53596eaf95" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_c763694681c8b6033ab3fef5f9f" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_c763694681c8b6033ab3fef5f9f"`);
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_0e5b4733e944fc94c53596eaf95"`);
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_a28bdc109464ceee15cf738dca6"`);
        await queryRunner.query(`DROP TABLE "city"`);
    }

}
