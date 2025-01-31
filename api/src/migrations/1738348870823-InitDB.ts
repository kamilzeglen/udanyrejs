import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1738348870823 implements MigrationInterface {
    name = 'InitDB1738348870823'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "isActive"`);
    }

}
