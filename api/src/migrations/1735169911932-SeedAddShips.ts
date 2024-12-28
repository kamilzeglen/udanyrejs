import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedAddShips1735169911932 implements MigrationInterface {
  name = 'SeedAddShips1735169911932'

  public ships = [
    // MSC Cruises
    {
      id: "b9c1f2ab-1c5d-4934-9e1a-1a0a74ebcd01",
      name: "MSC Bellissima",
      companyId: "9532e2a2-1ad2-452a-be02-f0a849a6f363",
    },
    {
      id: "c2e4a32b-44c8-4d6d-9c3a-2a1e57ed1234",
      name: "MSC Meraviglia",
      companyId: "9532e2a2-1ad2-452a-be02-f0a849a6f363",
    },
    {
      id: "f3e2b4ac-7d3a-4f9b-8e2a-3a2b58dc5678",
      name: "MSC Seaview",
      companyId: "9532e2a2-1ad2-452a-be02-f0a849a6f363",
    },

    // AIDA Cruises
    {
      id: "d4a2f1cb-3e5d-4f8a-8d2e-4c3f69fc6789",
      name: "AIDAperla",
      companyId: "521a19ab-8cfb-4977-8532-ea6d5c08d953",
    },
    {
      id: "e5b3c2da-2f6c-4e9a-7e3b-5d4e70ed7890",
      name: "AIDAnova",
      companyId: "521a19ab-8cfb-4977-8532-ea6d5c08d953",
    },
    {
      id: "f6c4d3eb-1e7b-4d8a-6f4c-6e5f81fe8901",
      name: "AIDAluna",
      companyId: "521a19ab-8cfb-4977-8532-ea6d5c08d953",
    },

    // Costa Cruises
    {
      id: "f6c4d3eb-1e7b-4d2a-5f4c-6e5f81fe8901",
      name: "Costa Smeralda",
      companyId: "521a42ab-8cfb-4977-8532-ea6d5c08d953",
    },
    {
      id: "f6c4d3eb-1e7b-4d2a-2f4c-1e5f81fe8901",
      name: "Costa Toscana",
      companyId: "521a42ab-8cfb-4977-8532-ea6d5c08d953",
    },
    {
      id: "f3c4d3eb-1e7b-4d2a-5f2c-6e5f81fe8921",
      name: "Costa Diadema",
      companyId: "521a42ab-8cfb-4977-8532-ea6d5c08d953",
    },

    // Norwegian Cruise Line
    {
      id: "f1c4d3eb-1e1b-4d1a-5f2c-6e5f81fe8921",
      name: "Norwegian Epic",
      companyId: "521a42ab-8cfb-4357-8532-ea6d5c08d123",
    },
    {
      id: "f1c8d9eb-1e1b-4d1a-5f2c-6e5f52fe8926",
      name: "Norwegian Bliss",
      companyId: "521a42ab-8cfb-4357-8532-ea6d5c08d123",
    },
    {
      id: "f2c8d9eb-1e1b-2d1a-5f4c-6e5f43fe8926",
      name: "Norwegian Prima",
      companyId: "521a42ab-8cfb-4357-8532-ea6d5c08d123",
    },

    // Royal Caribbean
    {
      id: "f2c8d9eb-8e6b-2d1a-5f4c-6e5f43fe8513",
      name: "Symphony of the Seas",
      companyId: "531a42ab-9cfb-4217-8532-ea6d5d08d123",
    },
    {
      id: "f9c8d1eb-8e6b-2d1a-5f2c-6e5f42fe8983",
      name: "Oasis of the Seas",
      companyId: "531a42ab-9cfb-4217-8532-ea6d5d08d123",
    },
    {
      id: "f9c8d1eb-8e6b-5d1a-5f2c-6e5f42fe8222",
      name: "Harmony of the Seas",
      companyId: "531a42ab-9cfb-4217-8532-ea6d5d08d123",
    },

    // TUI Cruises
    {
      id: "f9c8d1eb-8e6b-1d1a-5f3c-6e5f43fe8222",
      name: "Mein Schiff 1",
      companyId: "123a45ab-7cfb-4217-8532-ea6d5d08d123",
    },
    {
      id: "f1c8d1eb-8e6b-1d1a-5f3c-6e3f22fe8225",
      name: "Mein Schiff 2",
      companyId: "123a45ab-7cfb-4217-8532-ea6d5d08d123",
    },
    {
      id: "f7c8d1eb-8e6b-1d1a-6f3c-213f22fe8225",
      name: "Mein Schiff 3",
      companyId: "123a45ab-7cfb-4217-8532-ea6d5d08d123",
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const ship of this.ships) {
      await queryRunner.query(`
        INSERT INTO "ship" ("id", "name", "companyId")
        VALUES (
          '${ship.id}',
          '${ship.name}',
          '${ship.companyId}'
        ) ON CONFLICT ("id") DO NOTHING;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const ship of this.ships) {
      await queryRunner.query(`
        DELETE FROM "ship" WHERE "id" = '${ship.id}';
      `);
    }
  }
}
