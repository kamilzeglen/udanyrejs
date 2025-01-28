import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddRoles1733920612874 implements MigrationInterface {
  name = 'SeedAddRoles1733920612874';

  public roles = [
    {
      id: '08e454f2-4c07-4ae3-877d-6919376a94bc',
      name: 'User',
      key: 'USER',
    },
    {
      id: '01aeef01-0ffc-4979-a002-4e8892facf4f',
      name: 'Admin',
      key: 'ADMIN',
    },
    {
      id: '375a20b0-b358-44cd-bfd6-54b2ef3baee2',
      name: 'Super Admin',
      key: 'SUPER_ADMIN',
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
