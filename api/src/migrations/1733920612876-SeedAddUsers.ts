import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedAddUsers1733920612876 implements MigrationInterface {
  name = 'SeedAddUsers1733920612876'

  public users = [
      {
        id: "0a71d016-3cf2-4e11-87c2-f6a75aa28f8d",
        email: "kamyrdol32@gmail.com",
        password: "$2b$10$ZdSAZ7fO9DYZ7n0twonG8u1sDeIDdJjaerfViF40lSAdyJNAHxdWq",
        isActive: false,
        roleId: "632a19ab-8cfb-4977-8532-ea6d5c08d720"
      },
      {
        id: "8e2fd77c-508d-4519-86ca-e0725c717cf2",
        email: "kam.zeglen@gmail.com",
        password: "$2b$10$ljADmuBcENnlVNT0ZAQmDuSr9VX2IW.CF8BEA05ofolZ.wzpw3K.q",
        isActive: true,
        roleId: "632a19ab-8cfb-4977-8532-ea6d5c08d720"
      },
      {
        id: "8e2fd22c-508d-4519-86ca-e0725c717cf2",
        email: "kyno007@gmail.com",
        password: "$2b$10$ljADmuBcENnlVNT0ZAQmDuSr9VX2IW.CF8BEA05ofolZ.wzpw3K.q",
        isActive: true,
        roleId: "632a19ab-8cfb-4977-8532-ea6d5c08d720"
      },
      {
        id: "8e2fd22c-508d-4521-86ca-e0725c717cf3",
        email: "iwona.imar@interia.pl",
        password: "$2b$10$ljADmuBcENnlVNT0ZAQmDuSr9VX2IW.CF8BEA05ofolZ.wzpw3K.q",
        isActive: true,
        roleId: "632a19ab-8cfb-4977-8532-ea6d5c08d720"
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
