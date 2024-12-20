import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAddCompanies1733937034220 implements MigrationInterface {
  name = 'SeedAddCompanies1733937034220'

  public companies = [
    {
      id: "9532e2a2-1ad2-452a-be02-f0a849a6f363",
      name: "MSC Cruises",
      key: "MSC",
    },
    {
      id: "521a19ab-8cfb-4977-8532-ea6d5c08d953",
      name: "AIDA Cruises",
      key: "AIDA",
    },
  ];


  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const company of this.companies) {
      await queryRunner.query(`
        INSERT INTO "company" ("id", "name", "key")
        VALUES (
          '${company.id}',
          '${company.name}',
          '${company.key}'
        ) ON CONFLICT ("id") DO NOTHING;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const company of this.companies) {
      await queryRunner.query(`
        DELETE FROM "company" WHERE "id" = '${company.id}';
      `);
    }
  }
}
