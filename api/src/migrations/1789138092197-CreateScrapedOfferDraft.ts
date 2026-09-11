import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScrapedOfferDraft1789138092197
  implements MigrationInterface
{
  name = 'CreateScrapedOfferDraft1789138092197';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "scraped_offer_draft" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "shipName" character varying NOT NULL, "companyNameRaw" character varying NOT NULL, "matchedCompanyId" uuid, "matchedShipId" uuid, "imageUrl" character varying, "pdfUrl" character varying, "itinerary" json NOT NULL, "terms" json NOT NULL, "sourceUrl" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_scraped_offer_draft_source_url" UNIQUE ("sourceUrl"), CONSTRAINT "PK_scraped_offer_draft" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "scraped_offer_draft"`);
  }
}
