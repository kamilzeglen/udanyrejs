import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedAddShips1735169911932 implements MigrationInterface {
  name = 'SeedAddShips1735169911932'

    public ships = [
      { name: 'MSC Armonia', companyName: 'MSC Cruises' },
      { name: 'MSC Bellissima', companyName: 'MSC Cruises' },
      { name: 'MSC Divina', companyName: 'MSC Cruises' },
      { name: 'MSC Euribia', companyName: 'MSC Cruises' },
      { name: 'MSC Fantasia', companyName: 'MSC Cruises' },
      { name: 'MSC Grandiosa', companyName: 'MSC Cruises' },
      { name: 'MSC Lirica', companyName: 'MSC Cruises' },
      { name: 'MSC Magnifica', companyName: 'MSC Cruises' },
      { name: 'MSC Meraviglia', companyName: 'MSC Cruises' },
      { name: 'MSC Musica', companyName: 'MSC Cruises' },
      { name: 'MSC Opera', companyName: 'MSC Cruises' },
      { name: 'MSC Orchestra', companyName: 'MSC Cruises' },
      { name: 'MSC Poesia', companyName: 'MSC Cruises' },
      { name: 'MSC Preziosa', companyName: 'MSC Cruises' },
      { name: 'MSC Seascape', companyName: 'MSC Cruises' },
      { name: 'MSC Seashore', companyName: 'MSC Cruises' },
      { name: 'MSC Seaside', companyName: 'MSC Cruises' },
      { name: 'MSC Seaview', companyName: 'MSC Cruises' },
      { name: 'MSC Sinfonia', companyName: 'MSC Cruises' },
      { name: 'MSC Splendida', companyName: 'MSC Cruises' },
      { name: 'MSC Virtuosa', companyName: 'MSC Cruises' },
      { name: 'MSC World America', companyName: 'MSC Cruises' },
      { name: 'MSC World Europa', companyName: 'MSC Cruises' },

      { name: 'AIDAbella', companyName: 'AIDA Cruises' },
      { name: 'AIDAblu', companyName: 'AIDA Cruises' },
      { name: 'AIDAcosma', companyName: 'AIDA Cruises' },
      { name: 'AIDAdiva', companyName: 'AIDA Cruises' },
      { name: 'AIDAluna', companyName: 'AIDA Cruises' },
      { name: 'AIDAmar', companyName: 'AIDA Cruises' },
      { name: 'AIDAnova', companyName: 'AIDA Cruises' },
      { name: 'AIDAperla', companyName: 'AIDA Cruises' },
      { name: 'AIDAprima', companyName: 'AIDA Cruises' },
      { name: 'AIDAsol', companyName: 'AIDA Cruises' },
      { name: 'AIDAstella', companyName: 'AIDA Cruises' },

      { name: 'Costa Deliziosa', companyName: 'Costa Cruises' },
      { name: 'Costa Diadema', companyName: 'Costa Cruises' },
      { name: 'Costa Fascinosa', companyName: 'Costa Cruises' },
      { name: 'Costa Favolosa', companyName: 'Costa Cruises' },
      { name: 'Costa Fortuna', companyName: 'Costa Cruises' },
      { name: 'Costa Pacifica', companyName: 'Costa Cruises' },
      { name: 'Costa Serena', companyName: 'Costa Cruises' },
      { name: 'Costa Smeralda', companyName: 'Costa Cruises' },
      { name: 'Costa Toscana', companyName: 'Costa Cruises' },

      { name: 'Norwegian Aqua', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Bliss', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Breakaway', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Dawn', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Encore', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Epic', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Escape', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Gem', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Gateway', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Jade', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Jewel', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Joy', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Luna', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Pearl', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Prima', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Sky', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Spirit', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Star', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Sun', companyName: 'Norwegian Cruise Line' },
      { name: 'Norwegian Viva', companyName: 'Norwegian Cruise Line' },
      { name: 'Pride Of America', companyName: 'Norwegian Cruise Line' },

      { name: 'Adventure of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Allure of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Anthem of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Brilliance of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Enchantment of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Explorer of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Freedom of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Grandeur of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Harmony of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Icon of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Independence of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Jewel of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Liberty of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Mariner of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Navigator of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Oasis of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Odyssey of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Ovation of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Quantum of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Radiance of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Rhapsody of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Serenade of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Spectrum of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Symphony of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Vision of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Voyager of the Seas', companyName: 'Royal Caribbean' },
      { name: 'Wonder of the Seas', companyName: 'Royal Caribbean' },

      { name: 'MEIN SCHIFF 1', companyName: 'TUI Cruises' },
      { name: 'MEIN SCHIFF 5', companyName: 'TUI Cruises' },
      { name: 'MEIN SCHIFF 6', companyName: 'TUI Cruises' },
    ];


  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const ship of this.ships) {
      await queryRunner.query(`
        INSERT INTO "ship" ("id", "name", "companyId")
        VALUES (
          uuid_generate_v4(),
          '${ship.name}',
          (SELECT "id" FROM "company" WHERE "name" = '${ship.companyName}')
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const ship of this.ships) {
      await queryRunner.query(`
        DELETE FROM "ship"
        WHERE "name" = '${ship.name}' AND "companyId" = (
          SELECT "id" FROM "company" WHERE "name" = '${ship.companyName}'
        );
      `);
    }
  }
}
