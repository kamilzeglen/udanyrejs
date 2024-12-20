import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedAddRoles1733920612874 implements MigrationInterface {
  name = 'SeedAddRoles1733920612874'

  public roles = [
    {
      id: "7862e2a2-1ad2-452a-be02-f0a849a6f151",
      name: "User",
      key: "USER",
    },
    {
      id: "632a19ab-8cfb-4977-8532-ea6d5c08d720",
      name: "Admin",
      key: "ADMIN",
    },
  ];


  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const role of this.roles) {
      await queryRunner.query(`
        INSERT INTO "role" ("id", "name", "key")
        VALUES (
          '${role.id}',
          '${role.name}',
          '${role.key}'
        ) ON CONFLICT ("id") DO NOTHING;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const role of this.roles) {
      await queryRunner.query(`
        DELETE FROM "role" WHERE "id" = '${role.id}';
      `);
    }
  }
}
