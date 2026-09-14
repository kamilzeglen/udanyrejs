import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSettings1789220000000 implements MigrationInterface {
  name = 'CreateSettings1789220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scrapingEnabled" boolean NOT NULL DEFAULT true, "scrapeHour" smallint NOT NULL DEFAULT 4, "scrapeMinute" smallint NOT NULL DEFAULT 0, "syncRequestDelayMs" integer NOT NULL DEFAULT 3000, "lastSyncStartedAt" TIMESTAMP WITH TIME ZONE, "lastSyncFinishedAt" TIMESTAMP WITH TIME ZONE, "lastSyncStatus" character varying, "lastSyncSummary" text, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_settings" PRIMARY KEY ("id"))`,
    );

    // Ustawienia to singleton - dokładnie jeden wiersz, zawsze obecny od
    // momentu wdrożenia tej migracji, żeby SettingsService.getSettings()
    // nigdy nie musiał obsługiwać przypadku "jeszcze nie ma ustawień".
    await queryRunner.query(`INSERT INTO "settings" DEFAULT VALUES`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
  }
}
