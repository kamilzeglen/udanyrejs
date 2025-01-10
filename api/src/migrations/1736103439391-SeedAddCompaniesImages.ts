import {MigrationInterface, QueryRunner} from "typeorm";
import * as path from 'path';

export class SeedAddCompaniesImages1736103439391 implements MigrationInterface {
    name = 'SeedAddCompaniesImages1736103439391'

  public imagesPath = process.env.COMPANIES_IMAGES_PATH;
  public companyImages = [
    {
      companyId: '9532e2a2-1ad2-452a-be02-f0a849a6f363',
      imageName: '9532e2a2-1ad2-452a-be02-f0a849a6f363.png',
      originalName: 'MSC.png',
      path: path.join(this.imagesPath, '9532e2a2-1ad2-452a-be02-f0a849a6f363.png'),
    },
    {
      companyId: '531a42ab-9cfb-4217-8532-ea6d5d08d123',
      imageName: '531a42ab-9cfb-4217-8532-ea6d5d08d123.png',
      originalName: 'ROYAL_CARIBBEAN.png',
      path: path.join(this.imagesPath, '531a42ab-9cfb-4217-8532-ea6d5d08d123.png'),
    },
    {
      companyId: '521a42ab-8cfb-4977-8532-ea6d5c08d953',
      imageName: '521a42ab-8cfb-4977-8532-ea6d5c08d953.png',
      originalName: 'COSTA.png',
      path: path.join(this.imagesPath, '521a42ab-8cfb-4977-8532-ea6d5c08d953.png'),
    },
    {
      companyId: '521a42ab-8cfb-4357-8532-ea6d5c08d123',
      imageName: '521a42ab-8cfb-4357-8532-ea6d5c08d123.png',
      originalName: 'NCL.png',
      path: path.join(this.imagesPath, '521a42ab-8cfb-4357-8532-ea6d5c08d123.png'),
    },
    {
      companyId: '521a19ab-8cfb-4977-8532-ea6d5c08d953',
      imageName: '521a19ab-8cfb-4977-8532-ea6d5c08d953.png',
      originalName: 'AIDA.png',
      path: path.join(this.imagesPath, '521a19ab-8cfb-4977-8532-ea6d5c08d953.png'),
    },
    {
      companyId: '123a45ab-7cfb-4217-8532-ea6d5d08d123',
      imageName: '123a45ab-7cfb-4217-8532-ea6d5d08d123.png',
      originalName: 'TUI.png',
      path: path.join(this.imagesPath, '123a45ab-7cfb-4217-8532-ea6d5d08d123.png'),
    },
  ]


  public async up(queryRunner: QueryRunner): Promise<void> {

    // Iterowanie przez dane i tworzenie rekordów
    for (const image of this.companyImages) {
      // Wstaw zdjęcie do tabeli ImageFile
      await queryRunner.query(
        `
        INSERT INTO "image_file" ("id", "name", "originalName", "path", "createdAt", "updatedAt")
        VALUES (uuid_generate_v4(), $1, $2, $3, NOW(), NOW())
      `,
        [image.imageName, image.originalName, image.path],
      );

      // Pobierz ID właśnie dodanego zdjęcia
      const imageIdResult = await queryRunner.query(`
        SELECT id FROM "image_file" WHERE "path" = $1 LIMIT 1
      `, [image.path]);

      const imageId = imageIdResult[0]?.id;

      // Zaktualizuj tabelę Company, przypisując id zdjęcia
      if (imageId) {
        await queryRunner.query(
          `
          UPDATE "company"
          SET "imageFileId" = $1
          WHERE "id" = $2
        `,
          [imageId, image.companyId],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    for (const image of this.companyImages) {
      // Najpierw usuń powiązania w tabeli "company"
      await queryRunner.query(
        `
        UPDATE "company"
        SET "imageFileId" = NULL
        WHERE "id" = $1
      `,
        [image.companyId],
      );

      // Następnie usuń rekord z tabeli "image_file"
      await queryRunner.query(
        `
        DELETE FROM "image_file"
        WHERE "path" = $1
      `,
        [image.path],
      );
    }
  }
}
