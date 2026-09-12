import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropScrapedOfferDraftPdfUrl1789181000000
  implements MigrationInterface
{
  name = 'DropScrapedOfferDraftPdfUrl1789181000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // PDF jest teraz scrapowany per termin (patrz ScrapedOfferDraft.terms[].pdfUrl,
    // pole w istniejącej kolumnie json - bez migracji), ta kolumna była
    // jednym adresem PDF na całą ofertę. Drafty to krótkotrwałe dane robocze
    // z poczekalni discovery, nic tu nie wymaga zachowania.
    await queryRunner.query(
      `ALTER TABLE "scraped_offer_draft" DROP COLUMN IF EXISTS "pdfUrl"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scraped_offer_draft" ADD COLUMN "pdfUrl" character varying`,
    );
  }
}
