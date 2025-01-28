import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddDestinations1736002105209 implements MigrationInterface {
  name = 'SeedAddDestinations1736002105209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "destination" ("id", "name", "createdById", "updatedById")
      VALUES 
        (uuid_generate_v4(), 'Afryka', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Alaska', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Ameryka Północna', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Ameryka Południowa', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Ameryka Środkowa', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Antarktyda', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Arktyka', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Australia i Nowa Zelandia', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Azja', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Bahamy', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Bermudy', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Dubaj i Zjednoczone Emiraty Arabskie', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Europa', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Europa Północna', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Galapagos', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Hawaje', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Kanada i Nowa Anglia', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Kanał Panamski', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Karaiby', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Morze Adriatyckie', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Morze Bałtyckie', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Morze Egejskie', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Morze Śródziemne', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Norweskie Fiordy', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Ocean Indyjski', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Polinezja Francuska', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Południowy Pacyfik', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Półwysep Arabski', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Riwiera Meksykańska', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Wyspy Greckie', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Wyspy Kanaryjskie', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        (uuid_generate_v4(), 'Wyspy Oceanu Atlantyckiego', '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "destination"
      WHERE "name" IN (
        'Afryka',
        'Alaska',
        'Ameryka Północna',
        'Ameryka Południowa',
        'Ameryka Środkowa',
        'Antarktyda',
        'Arktyka',
        'Australia i Nowa Zelandia',
        'Azja',
        'Bahamy',
        'Bermudy',
        'Dubaj i Zjednoczone Emiraty Arabskie',
        'Europa',
        'Europa Północna',
        'Galapagos',
        'Hawaje',
        'Kanada i Nowa Anglia',
        'Kanał Panamski',
        'Karaiby',
        'Morze Adriatyckie',
        'Morze Bałtyckie',
        'Morze Egejskie',
        'Morze Śródziemne',
        'Norweskie Fiordy',
        'Ocean Indyjski',
        'Polinezja Francuska',
        'Południowy Pacyfik',
        'Półwysep Arabski',
        'Riwiera Meksykańska',
        'Wyspy Greckie',
        'Wyspy Kanaryjskie',
        'Wyspy Oceanu Atlantyckiego'
      );
    `);
  }
}
