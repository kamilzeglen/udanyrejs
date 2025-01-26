import { MigrationInterface, QueryRunner } from "typeorm";

export class ItineraryEntity1737836813776 implements MigrationInterface {
    name = 'ItineraryEntity1737836813776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "itinerary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day" integer NOT NULL, "date" date NOT NULL, "cityId" uuid, "arrivalTime" character varying(10), "departureTime" character varying(10), "offerId" uuid NOT NULL, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_515a9607ae33d4536f40d60f85e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "offer" DROP COLUMN "itinerary"`);
        await queryRunner.query(`ALTER TABLE "itinerary" ADD CONSTRAINT "FK_7bf052f9d66151d47551ec89421" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary" ADD CONSTRAINT "FK_2034d5a0972386a63074078bad6" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary" ADD CONSTRAINT "FK_1d0b8d8c5e9ad1e3be270abd815" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itinerary" ADD CONSTRAINT "FK_484108178dc8eb89000915b43dd" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "itinerary" DROP CONSTRAINT "FK_484108178dc8eb89000915b43dd"`);
        await queryRunner.query(`ALTER TABLE "itinerary" DROP CONSTRAINT "FK_1d0b8d8c5e9ad1e3be270abd815"`);
        await queryRunner.query(`ALTER TABLE "itinerary" DROP CONSTRAINT "FK_2034d5a0972386a63074078bad6"`);
        await queryRunner.query(`ALTER TABLE "itinerary" DROP CONSTRAINT "FK_7bf052f9d66151d47551ec89421"`);
        await queryRunner.query(`ALTER TABLE "offer" ADD "itinerary" json`);
        await queryRunner.query(`DROP TABLE "itinerary"`);
    }

}
