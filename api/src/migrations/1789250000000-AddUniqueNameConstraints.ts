import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueNameConstraints1789250000000
  implements MigrationInterface
{
  public readonly name = 'AddUniqueNameConstraints1789250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.assertNoDuplicates(queryRunner, 'category', ['name']);
    await this.assertNoDuplicates(queryRunner, 'destination', ['name']);
    await this.assertNoDuplicates(queryRunner, 'ship', ['companyId', 'name']);
    await queryRunner.query(
      'ALTER TABLE "category" ADD CONSTRAINT "UQ_category_name" UNIQUE ("name")',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" ADD CONSTRAINT "UQ_destination_name" UNIQUE ("name")',
    );
    await queryRunner.query(
      'ALTER TABLE "ship" ADD CONSTRAINT "UQ_ship_companyId_name" UNIQUE ("companyId", "name")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "ship" DROP CONSTRAINT "UQ_ship_companyId_name"',
    );
    await queryRunner.query(
      'ALTER TABLE "destination" DROP CONSTRAINT "UQ_destination_name"',
    );
    await queryRunner.query(
      'ALTER TABLE "category" DROP CONSTRAINT "UQ_category_name"',
    );
  }

  private async assertNoDuplicates(
    queryRunner: QueryRunner,
    table: string,
    columns: string[],
  ): Promise<void> {
    const columnList = columns.map((column) => `"${column}"`).join(', ');
    const duplicates = await queryRunner.query(
      `SELECT ${columnList} FROM "${table}" GROUP BY ${columnList} HAVING COUNT(*) > 1`,
    );
    if (duplicates.length > 0) {
      throw new Error(
        `Migration blocked: table "${table}" has ${duplicates.length} duplicate ${columnList} value(s) - resolve manually before re-running.`,
      );
    }
  }
}
