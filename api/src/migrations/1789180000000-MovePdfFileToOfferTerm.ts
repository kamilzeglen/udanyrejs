import { MigrationInterface, QueryRunner } from 'typeorm';

export class MovePdfFileToOfferTerm1789180000000 implements MigrationInterface {
  name = 'MovePdfFileToOfferTerm1789180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pdf_file" ADD COLUMN "termId" uuid`);

    // FK offer.pdfFileId -> pdf_file.id ma ON DELETE CASCADE po stronie
    // offer - trzeba ją zdjąć przed czyszczeniem pdf_file, inaczej DELETE
    // niżej skasowałby też każdą ofertę, która miała przypięty PDF.
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT IF EXISTS "FK_0c702471989d167d3f17a4d0aeb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT IF EXISTS "REL_0c702471989d167d3f17a4d0ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP COLUMN IF EXISTS "pdfFileId"`,
    );

    // PDF per oferta i PDF per termin to różne dane - świadoma decyzja:
    // nie próbujemy dopasować starego pliku do "właściwego" terminu, admin
    // wgra PDF od nowa dla każdego terminu.
    await queryRunner.query(`DELETE FROM "pdf_file"`);

    await queryRunner.query(
      `ALTER TABLE "pdf_file" ALTER COLUMN "termId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" ADD CONSTRAINT "UQ_pdf_file_termId" UNIQUE ("termId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" ADD CONSTRAINT "FK_pdf_file_termId" FOREIGN KEY ("termId") REFERENCES "offer_term"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offer" ADD COLUMN "pdfFileId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "REL_0c702471989d167d3f17a4d0ae" UNIQUE ("pdfFileId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "pdf_file" DROP CONSTRAINT IF EXISTS "FK_pdf_file_termId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pdf_file" DROP CONSTRAINT IF EXISTS "UQ_pdf_file_termId"`,
    );

    // Symetrycznie z up() - PDF per termin nie ma jednego "właściwego"
    // odpowiednika per oferta, więc down() też startuje od zera.
    await queryRunner.query(`DELETE FROM "pdf_file"`);

    await queryRunner.query(
      `ALTER TABLE "pdf_file" ALTER COLUMN "termId" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "pdf_file" DROP COLUMN "termId"`);

    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_0c702471989d167d3f17a4d0aeb" FOREIGN KEY ("pdfFileId") REFERENCES "pdf_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
