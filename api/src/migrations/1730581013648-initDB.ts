import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1730581013648 implements MigrationInterface {
    name = 'InitDB1730581013648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."offer_company_enum" AS ENUM('MSC', 'AIDA', 'COSTA', 'NORWEGIAN')`);
        await queryRunner.query(`CREATE TABLE "offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "company" "public"."offer_company_enum" NOT NULL, "price" numeric NOT NULL, "shipName" character varying NOT NULL, "nights" integer NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "imageFileName" character varying NOT NULL, "pdfFileName" character varying NOT NULL, "itinerary" json, CONSTRAINT "PK_57c6ae1abe49201919ef68de900" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(30) NOT NULL, "email" character varying(40) NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "offer"`);
        await queryRunner.query(`DROP TYPE "public"."offer_company_enum"`);
    }

}
