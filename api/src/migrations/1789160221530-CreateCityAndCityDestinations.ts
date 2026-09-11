import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCityAndCityDestinations1789160221530
  implements MigrationInterface
{
  name = 'CreateCityAndCityDestinations1789160221530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_f8c0858628830a35f19efdc0ecf" UNIQUE ("name"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "city_destinations" ("cityId" uuid NOT NULL, "destinationId" uuid NOT NULL, CONSTRAINT "PK_f50beafc2da38e1a133bb661899" PRIMARY KEY ("cityId", "destinationId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9aea095e8c50bfc93cc3cbede9" ON "city_destinations" ("cityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_824027df9f94d44b0e1bf024f8" ON "city_destinations" ("destinationId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_0e5b4733e944fc94c53596eaf95" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" ADD CONSTRAINT "FK_c763694681c8b6033ab3fef5f9f" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "city_destinations" ADD CONSTRAINT "FK_9aea095e8c50bfc93cc3cbede90" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "city_destinations" ADD CONSTRAINT "FK_824027df9f94d44b0e1bf024f87" FOREIGN KEY ("destinationId") REFERENCES "destination"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "city_destinations" DROP CONSTRAINT "FK_824027df9f94d44b0e1bf024f87"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city_destinations" DROP CONSTRAINT "FK_9aea095e8c50bfc93cc3cbede90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "FK_c763694681c8b6033ab3fef5f9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "city" DROP CONSTRAINT "FK_0e5b4733e944fc94c53596eaf95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_824027df9f94d44b0e1bf024f8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9aea095e8c50bfc93cc3cbede9"`,
    );
    await queryRunner.query(`DROP TABLE "city_destinations"`);
    await queryRunner.query(`DROP TABLE "city"`);
  }
}
