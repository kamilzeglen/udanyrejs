import {MigrationInterface, QueryRunner} from "typeorm";
import * as dotenv from 'dotenv';

dotenv.config();

export class SeedOffers1730583077962 implements MigrationInterface {

    public offers = [
      {
        name: "AFRYKA POŁUDNIOWA I MADAGASKAR",
        company: "NORWEGIAN",
        price: 2500,
        shipName: "NORWEGIAN SKY",
        nights: 13,
        startDate: new Date("2024-12-07"),
        endDate: new Date("2024-12-20"),
        imageFileName: 'afryka-poludniowa-i-madagaskar.jpg',
        pdfFileName: 'afryka-poludniowa-i-madagaskar.pdf',
        itinerary: [
          {
            "day": 1,
            "date": "07.12.2024",
            "port": "Kapsztad, Republika Południowej Afryki",
            "arrivalTime": null,
            "departureTime": "17:00"
          },
          {
            "day": 2,
            "date": "08.12.2024",
            "port": "Mossel Bay, Republika Południowej Afryki",
            "arrivalTime": "09:00",
            "departureTime": "18:00"
          },
          {
            "day": 3,
            "date": "09.12.2024",
            "port": "Port Elizabeth, Republika Południowej Afryki",
            "arrivalTime": "06:30",
            "departureTime": "14:30"
          },
          {
            "day": 4,
            "date": "10.12.2024",
            "port": "Durban, Republika Południowej Afryki",
            "arrivalTime": "13:00",
            "departureTime": "22:00"
          },
          {
            "day": 5,
            "date": "11.12.2024",
            "port": "Richards Bay, Republika Południowej Afryki",
            "arrivalTime": "08:00",
            "departureTime": null
          },
          {
            "day": 6,
            "date": "12.12.2024",
            "port": "Richards Bay, Republika Południowej Afryki",
            "arrivalTime": null,
            "departureTime": "15:00"
          },
          {
            "day": 7,
            "date": "13.12.2024",
            "port": "Dzień na morzu",
            "arrivalTime": null,
            "departureTime": null
          },
          {
            "day": 8,
            "date": "14.12.2024",
            "port": "Dzień na morzu",
            "arrivalTime": null,
            "departureTime": null
          },
          {
            "day": 9,
            "date": "15.12.2024",
            "port": "Nosy Be, Madagaskar",
            "arrivalTime": "13:00",
            "departureTime": "21:00"
          },
          {
            "day": 10,
            "date": "16.12.2024",
            "port": "Antsiranana, Madagaskar",
            "arrivalTime": "08:15",
            "departureTime": "17:00"
          },
          {
            "day": 11,
            "date": "17.12.2024",
            "port": "Dzień na morzu",
            "arrivalTime": null,
            "departureTime": null
          },
          {
            "day": 12,
            "date": "18.12.2024",
            "port": "Pointe des Galets, Francja",
            "arrivalTime": "07:00",
            "departureTime": "18:00"
          },
          {
            "day": 13,
            "date": "19.12.2024",
            "port": "Port Louis, Mauritius",
            "arrivalTime": "07:00",
            "departureTime": null
          },
          {
            "day": 14,
            "date": "20.12.2024",
            "port": "Port Louis, Mauritius",
            "arrivalTime": null,
            "departureTime": "07:30"
          }
        ]
        ,
      }
    ];


  public async up(queryRunner: QueryRunner): Promise<void> {

    for (const offer of this.offers) {
      const itineraryJSON = JSON.stringify(offer.itinerary);

      await queryRunner.query(`
        INSERT INTO "offer" ("name", "company", "price", "shipName", "nights", "startDate", "endDate", "imageFileName", "pdfFileName", "itinerary")
        VALUES ('${offer.name}', '${offer.company}', '${offer.price}', '${offer.shipName}', '${offer.nights}', '${offer.startDate.toISOString()}', '${offer.endDate.toISOString()}', '${offer.imageFileName}', '${offer.pdfFileName}', '${itineraryJSON}');
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Usunięcie danych w przypadku cofnięcia migracji
    for (const offer of this.offers) {
      await queryRunner.query(`
        DELETE FROM "offer" WHERE "name" IN ('${offer.name}')
    `);
    }
  }
}
