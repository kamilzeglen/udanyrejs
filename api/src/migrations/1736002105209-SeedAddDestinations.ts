import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedAddDestinations1736002105209 implements MigrationInterface {
    name = 'SeedAddDestinations1736002105209'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "destination" ("id", "name")
      VALUES 
        (uuid_generate_v4(), 'Afryka'),
        (uuid_generate_v4(), 'Alaska'),
        (uuid_generate_v4(), 'Ameryka Północna'),
        (uuid_generate_v4(), 'Ameryka Południowa'),
        (uuid_generate_v4(), 'Ameryka Środkowa'),
        (uuid_generate_v4(), 'Antarktyda'),
        (uuid_generate_v4(), 'Arktyka'),
        (uuid_generate_v4(), 'Australia i Nowa Zelandia'),
        (uuid_generate_v4(), 'Azja'),
        (uuid_generate_v4(), 'Bahamy'),
        (uuid_generate_v4(), 'Bermudy'),
        (uuid_generate_v4(), 'Dubaj i Zjednoczone Emiraty Arabskie'),
        (uuid_generate_v4(), 'Europa'),
        (uuid_generate_v4(), 'Europa Północna'),
        (uuid_generate_v4(), 'Galapagos'),
        (uuid_generate_v4(), 'Hawaje'),
        (uuid_generate_v4(), 'Kanada i Nowa Anglia'),
        (uuid_generate_v4(), 'Kanał Panamski'),
        (uuid_generate_v4(), 'Karaiby'),
        (uuid_generate_v4(), 'Morze Adriatyckie'),
        (uuid_generate_v4(), 'Morze Bałtyckie'),
        (uuid_generate_v4(), 'Morze Egejskie'),
        (uuid_generate_v4(), 'Morze Śródziemne'),
        (uuid_generate_v4(), 'Norweskie Fiordy'),
        (uuid_generate_v4(), 'Ocean Indyjski'),
        (uuid_generate_v4(), 'Polinezja Francuska'),
        (uuid_generate_v4(), 'Południowy Pacyfik'),
        (uuid_generate_v4(), 'Półwysep Arabski'),
        (uuid_generate_v4(), 'Riwiera Meksykańska'),
        (uuid_generate_v4(), 'Wyspy Greckie'),
        (uuid_generate_v4(), 'Wyspy Kanaryjskie'),
        (uuid_generate_v4(), 'Wyspy Oceanu Atlantyckiego');
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
