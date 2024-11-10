import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteUpdateCreateColumn1731021610663 implements MigrationInterface {
    name = 'DeleteUpdateCreateColumn1731021610663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "offer" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "offer" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "offer" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TYPE "public"."offer_company_enum" RENAME TO "offer_company_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."offer_company_enum" AS ENUM('MSC', 'AIDA', 'COSTA', 'NORWEGIAN')`);
        await queryRunner.query(`ALTER TABLE "offer" ALTER COLUMN "company" TYPE "public"."offer_company_enum" USING "company"::"text"::"public"."offer_company_enum"`);
        await queryRunner.query(`DROP TYPE "public"."offer_company_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."offer_company_enum_old" AS ENUM('MSC', 'AIDA', 'COSTA', 'NORWEGIAN')`);
        await queryRunner.query(`ALTER TABLE "offer" ALTER COLUMN "company" TYPE "public"."offer_company_enum_old" USING "company"::"text"::"public"."offer_company_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."offer_company_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."offer_company_enum_old" RENAME TO "offer_company_enum"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
    }
}
