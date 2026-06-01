import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddUsers1733920612876 implements MigrationInterface {
  name = 'SeedAddUsers1733920612876';

  public users = [
    {
      id: '12345678-3cf2-4e11-87c2-f6a75aa28f8d',
      email: 'system@udanyrejs.pl',
      password: 'XTZ',
      isActive: false,
      roleId: '375a20b0-b358-44cd-bfd6-54b2ef3baee2',
    },
    {
      id: '0a71d016-3cf2-4e11-87c2-f6a75aa28f8d',
      email: 'XYZ@gmail.com',
      password: 'XYZ',
      isActive: true,
      roleId: '375a20b0-b358-44cd-bfd6-54b2ef3baee2',
    },
    {
      id: '8e2fd22c-508d-4519-86ca-e0725c717cf2',
      email: 'XYZ@gmail.com',
      password: 'XYZ',
      isActive: true,
      roleId: '01aeef01-0ffc-4979-a002-4e8892facf4f',
    },
    {
      id: '8e2fd22c-508d-4521-86ca-e0725c717cf3',
      email: 'XYZ@interia.pl',
      password: 'XYZ',
      isActive: true,
      roleId: '01aeef01-0ffc-4979-a002-4e8892facf4f',
    },
    {
      id: '8e2fd22c-538d-4521-86ca-e0725c717cf2',
      email: 'XYZ@gmail.com',
      password: 'XYZ',
      isActive: true,
      roleId: '01aeef01-0ffc-4979-a002-4e8892facf4f',
    },
    {
      id: '1e2fd22c-538d-4521-86cb-e0535c717cf2',
      email: 'XYZ@test.com',
      password: 'XYZ',
      isActive: false,
      roleId: '01aeef01-0ffc-4979-a002-4e8892facf4f',
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const user of this.users) {
      await queryRunner.query(`
        INSERT INTO "user" ("id", "email", "password", "isActive", "roleId")
        VALUES (
          '${user.id}',
          '${user.email}',
          '${user.password}',
          ${user.isActive},
          '${user.roleId}'
        ) ON CONFLICT ("id") DO NOTHING;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const user of this.users) {
      await queryRunner.query(`
        DELETE FROM "user" WHERE "id" = '${user.id}';
      `);
    }
  }
}
