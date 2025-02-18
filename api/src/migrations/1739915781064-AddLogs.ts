import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLogs1739915781064 implements MigrationInterface {
  name = 'AddLogs1739915781064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "log" ("id" SERIAL NOT NULL, "message" character varying NOT NULL, "createdById" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "log" ADD CONSTRAINT "FK_9baa67dcc2878f9a1ec5b9e8e27" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "log" DROP CONSTRAINT "FK_9baa67dcc2878f9a1ec5b9e8e27"`,
    );
    await queryRunner.query(`DROP TABLE "log"`);
  }
}
