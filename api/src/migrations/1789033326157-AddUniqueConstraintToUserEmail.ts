import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToUserEmail1789033326157
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToUserEmail1789033326157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicates: { email: string }[] = await queryRunner.query(
      `SELECT email FROM "user" GROUP BY email HAVING COUNT(*) > 1`,
    );

    if (duplicates.length > 0) {
      const emails = duplicates.map((d) => d.email).join(', ');
      throw new Error(
        `Cannot add a unique constraint on user.email - duplicate emails already exist: ${emails}. Resolve them manually (merge or rename accounts) before running this migration.`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_user_email" UNIQUE ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_user_email"`,
    );
  }
}
