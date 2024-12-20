import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1733920136881 implements MigrationInterface {
    name = 'InitDB1733920136881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "key" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_128d7c8c9af53479d0b9e00eb58" UNIQUE ("key"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(40) NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "roleId" uuid NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "key" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_cdeeadf4df87a1b2932dc76ccbd" UNIQUE ("key"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pdf_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying(255) NOT NULL, "filePath" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "offerId" uuid NOT NULL, CONSTRAINT "PK_755efe31cd4ebf040dc679c3d26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "image_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fileName" character varying(255) NOT NULL, "filePath" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "offerId" uuid NOT NULL, CONSTRAINT "PK_a63c149156c13fef954c6f56398" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "offerUrl" character varying, "price" numeric NOT NULL, "shipName" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "itinerary" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "companyId" uuid NOT NULL, "imageFileId" uuid, "pdfFileId" uuid, "createdById" uuid NOT NULL, CONSTRAINT "REL_09a60e20a02a56c92e6ed9b171" UNIQUE ("imageFileId"), CONSTRAINT "REL_0c702471989d167d3f17a4d0ae" UNIQUE ("pdfFileId"), CONSTRAINT "PK_57c6ae1abe49201919ef68de900" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."file_type_enum" AS ENUM('PDF', 'IMAGE')`);
        await queryRunner.query(`CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "path" character varying(255) NOT NULL, "type" "public"."file_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "offerId" uuid NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pdf_file" ADD CONSTRAINT "FK_f52285d64ef013ec6b760a4bcc8" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_file" ADD CONSTRAINT "FK_c8d9be1e9c16dff4e5c41d4c9e0" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_7e3791c6351f63eaf655522c700" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_09a60e20a02a56c92e6ed9b1711" FOREIGN KEY ("imageFileId") REFERENCES "image_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_0c702471989d167d3f17a4d0aeb" FOREIGN KEY ("pdfFileId") REFERENCES "pdf_file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offer" ADD CONSTRAINT "FK_8ba57e6c9eb4defe589ee1f9283" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_6082030b1749bff5cbb67ce8ca9" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_6082030b1749bff5cbb67ce8ca9"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_8ba57e6c9eb4defe589ee1f9283"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_0c702471989d167d3f17a4d0aeb"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_09a60e20a02a56c92e6ed9b1711"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP CONSTRAINT "FK_7e3791c6351f63eaf655522c700"`);
        await queryRunner.query(`ALTER TABLE "image_file" DROP CONSTRAINT "FK_c8d9be1e9c16dff4e5c41d4c9e0"`);
        await queryRunner.query(`ALTER TABLE "pdf_file" DROP CONSTRAINT "FK_f52285d64ef013ec6b760a4bcc8"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TYPE "public"."file_type_enum"`);
        await queryRunner.query(`DROP TABLE "offer"`);
        await queryRunner.query(`DROP TABLE "image_file"`);
        await queryRunner.query(`DROP TABLE "pdf_file"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
    }

}
