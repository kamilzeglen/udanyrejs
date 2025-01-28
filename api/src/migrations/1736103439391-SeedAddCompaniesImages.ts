import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddCompaniesImages1736103439391 implements MigrationInterface {
  name = 'SeedAddCompaniesImages1736103439391';

  public imagesPath = process.env.COMPANIES_IMAGES_PATH;
  public companyImages = [
    {
      companyName: 'MSC Cruises',
      originalName: 'MSC.png',
    },
    {
      companyName: 'Royal Caribbean',
      originalName: 'ROYAL_CARIBBEAN.png',
    },
    {
      companyName: 'Costa Cruises',
      originalName: 'COSTA.png',
    },
    {
      companyName: 'Norwegian Cruise Line',
      originalName: 'NCL.png',
    },
    {
      companyName: 'AIDA Cruises',
      originalName: 'AIDA.png',
    },
    {
      companyName: 'TUI Cruises',
      originalName: 'TUI.png',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const image of this.companyImages) {
      const companyIdResult = await queryRunner.query(`
        SELECT "id" FROM "company" WHERE "name" = '${image.companyName}'
      `);
      const companyId = companyIdResult[0]?.id;
      const fileName = companyId + '.png';
      const filePath = this.imagesPath + companyId + '.png';

      await queryRunner.query(
        `
        INSERT INTO "image_file" ("id", "name", "originalName", "path", "createdById", "updatedById")
        VALUES (uuid_generate_v4(), $1, $2, $3, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d')
      `,
        [fileName, image.originalName, filePath],
      );

      const imageIdResult = await queryRunner.query(
        `
        SELECT id FROM "image_file" WHERE "path" = $1 LIMIT 1
      `,
        [filePath],
      );

      const imageId = imageIdResult[0]?.id;

      if (imageId) {
        await queryRunner.query(
          `
          UPDATE "company"
          SET "imageFileId" = $1
          WHERE "id" = $2
        `,
          [imageId, companyId],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const image of this.companyImages) {
      const companyIdResult = await queryRunner.query(`
        SELECT "id" FROM "company" WHERE "name" = '${image.companyName}'
      `);
      const companyId = companyIdResult[0]?.id;

      await queryRunner.query(
        `
        UPDATE "company"
        SET "imageFileId" = NULL
        WHERE "id" = $1
      `,
        [companyId],
      );

      await queryRunner.query(
        `
        DELETE FROM "image_file"
        WHERE "path" = $1
      `,
        [this.imagesPath + companyId + '.png'],
      );
    }
  }
}
