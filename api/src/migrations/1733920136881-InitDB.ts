import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDB1733920136881 implements MigrationInterface {
  name = 'InitDB1733920136881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "key" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_128d7c8c9af53479d0b9e00eb58" UNIQUE ("key"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(40) NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "roleId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "image_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "originalName" character varying(255) NOT NULL, "path" character varying(255) NOT NULL, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a63c149156c13fef954c6f56398" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ship" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "yearBuilt" integer, "length" numeric, "width" numeric, "tonnage" numeric, "passengersDecks" integer, "passengers" integer, "crew" integer, "currency" character varying(10), "companyId" uuid NOT NULL, "imageFileId" uuid, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "REL_43fee135257c5903f36ee5d310" UNIQUE ("imageFileId"), CONSTRAINT "PK_136d2c1d431c06ed161e6281661" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "key" character varying(100) NOT NULL, "description" text, "priceIncludes" json, "priceExcludes" json, "imageFileId" uuid, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_cdeeadf4df87a1b2932dc76ccbd" UNIQUE ("key"), CONSTRAINT "REL_9f803ab1c09ba30259926fc606" UNIQUE ("imageFileId"), CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "destination" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_e45b5ee5788eb3c7f0ae41746e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, "position" integer, "isActive" boolean NOT NULL DEFAULT true, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "offerUrl" character varying, "syncData" boolean NOT NULL DEFAULT false, "companyId" uuid NOT NULL, "shipId" uuid NOT NULL, "price" numeric NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "imageFileId" uuid, "pdfFileId" uuid, "itinerary" json, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "REL_09a60e20a02a56c92e6ed9b171" UNIQUE ("imageFileId"), CONSTRAINT "REL_0c702471989d167d3f17a4d0ae" UNIQUE ("pdfFileId"), CONSTRAINT "PK_57c6ae1abe49201919ef68de900" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pdf_file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "originalName" character varying(255) NOT NULL, "path" character varying(255) NOT NULL, "createdById" uuid, "updatedById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_755efe31cd4ebf040dc679c3d26" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offer_destinations" ("offerId" uuid NOT NULL, "destinationId" uuid NOT NULL, CONSTRAINT "PK_305646b4184f48589858db85e21" PRIMARY KEY ("offerId", "destinationId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a8758b487cb241a560e72e244d" ON "offer_destinations" ("offerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ce767a3285d94a59d9bedbe038" ON "offer_destinations" ("destinationId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "offer_categories" ("offerId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_b82b8e90cd899e7224a01a798e0" PRIMARY KEY ("offerId", "categoryId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7c3505ff98bc374f03bed21b79" ON "offer_categories" ("offerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58442b709393c2a421dbb6196b" ON "offer_categories" ("categoryId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image_file" ADD CONSTRAINT "FK_0ae71232fcc110d00af80a500c3" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "image_file" ADD CONSTRAINT "FK_3bacaea7417032e1520f07ee98b" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" ADD CONSTRAINT "FK_2f977c9169e460ad5f56377785a" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" ADD CONSTRAINT "FK_43fee135257c5903f36ee5d3104" FOREIGN KEY ("imageFileId") REFERENCES "image_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" ADD CONSTRAINT "FK_bcca99d1249ee9253ad94301e62" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" ADD CONSTRAINT "FK_5336b95d0fee44f645796365dc8" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD CONSTRAINT "FK_9f803ab1c09ba30259926fc6068" FOREIGN KEY ("imageFileId") REFERENCES "image_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD CONSTRAINT "FK_865ba8d77c1cb1478bf7e59c750" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" ADD CONSTRAINT "FK_fc412fe0b566cebef3f469332cd" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "destination" ADD CONSTRAINT "FK_894140d8d01cb0855ecd89c46db" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "destination" ADD CONSTRAINT "FK_a7ba15a03352a407a51e73be7d8" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_50c69cdc9b3e7494784a2fa2db4" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" ADD CONSTRAINT "FK_a5d7b5b0fc1f7358541b14b242d" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_7e3791c6351f63eaf655522c700" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_0cd06080ca85eae7defcf236e17" FOREIGN KEY ("shipId") REFERENCES "ship"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_09a60e20a02a56c92e6ed9b1711" FOREIGN KEY ("imageFileId") REFERENCES "image_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_0c702471989d167d3f17a4d0aeb" FOREIGN KEY ("pdfFileId") REFERENCES "pdf_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_8ba57e6c9eb4defe589ee1f9283" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_ed38909697ffa436870709b037c" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" ADD CONSTRAINT "FK_1221ff611caff4c237dc4667d5b" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" ADD CONSTRAINT "FK_acd20c7dfd23bccf5ae02056261" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_destinations" ADD CONSTRAINT "FK_a8758b487cb241a560e72e244dc" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_destinations" ADD CONSTRAINT "FK_ce767a3285d94a59d9bedbe0380" FOREIGN KEY ("destinationId") REFERENCES "destination"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_7c3505ff98bc374f03bed21b79d" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_58442b709393c2a421dbb6196b7" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_58442b709393c2a421dbb6196b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_7c3505ff98bc374f03bed21b79d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_destinations" DROP CONSTRAINT "FK_ce767a3285d94a59d9bedbe0380"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_destinations" DROP CONSTRAINT "FK_a8758b487cb241a560e72e244dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" DROP CONSTRAINT "FK_acd20c7dfd23bccf5ae02056261"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" DROP CONSTRAINT "FK_1221ff611caff4c237dc4667d5b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_ed38909697ffa436870709b037c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_8ba57e6c9eb4defe589ee1f9283"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_0c702471989d167d3f17a4d0aeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_09a60e20a02a56c92e6ed9b1711"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_0cd06080ca85eae7defcf236e17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_7e3791c6351f63eaf655522c700"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_a5d7b5b0fc1f7358541b14b242d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category" DROP CONSTRAINT "FK_50c69cdc9b3e7494784a2fa2db4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "destination" DROP CONSTRAINT "FK_a7ba15a03352a407a51e73be7d8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "destination" DROP CONSTRAINT "FK_894140d8d01cb0855ecd89c46db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP CONSTRAINT "FK_fc412fe0b566cebef3f469332cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP CONSTRAINT "FK_865ba8d77c1cb1478bf7e59c750"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company" DROP CONSTRAINT "FK_9f803ab1c09ba30259926fc6068"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" DROP CONSTRAINT "FK_5336b95d0fee44f645796365dc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" DROP CONSTRAINT "FK_bcca99d1249ee9253ad94301e62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" DROP CONSTRAINT "FK_43fee135257c5903f36ee5d3104"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ship" DROP CONSTRAINT "FK_2f977c9169e460ad5f56377785a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image_file" DROP CONSTRAINT "FK_3bacaea7417032e1520f07ee98b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "image_file" DROP CONSTRAINT "FK_0ae71232fcc110d00af80a500c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58442b709393c2a421dbb6196b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c3505ff98bc374f03bed21b79"`,
    );
    await queryRunner.query(`DROP TABLE "offer_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ce767a3285d94a59d9bedbe038"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a8758b487cb241a560e72e244d"`,
    );
    await queryRunner.query(`DROP TABLE "offer_destinations"`);
    await queryRunner.query(`DROP TABLE "pdf_file"`);
    await queryRunner.query(`DROP TABLE "offer"`);
    await queryRunner.query(`DROP TABLE "category"`);
    await queryRunner.query(`DROP TABLE "destination"`);
    await queryRunner.query(`DROP TABLE "company"`);
    await queryRunner.query(`DROP TABLE "ship"`);
    await queryRunner.query(`DROP TABLE "image_file"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
