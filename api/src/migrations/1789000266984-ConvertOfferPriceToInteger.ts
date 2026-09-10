import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertOfferPriceToInteger1789000266984
  implements MigrationInterface
{
  name = 'ConvertOfferPriceToInteger1789000266984';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // price przechowywał złote jako "decimal" (zwracane przez sterownik jako
    // string). Przechodzimy na integer w groszach - najmniejsza jednostka
    // waluty, bez ryzyka błędów zaokrągleń zmiennoprzecinkowych.
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "price" TYPE integer USING ROUND(price * 100)::integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offer" ALTER COLUMN "price" TYPE decimal USING (price::decimal / 100)`,
    );
  }
}
