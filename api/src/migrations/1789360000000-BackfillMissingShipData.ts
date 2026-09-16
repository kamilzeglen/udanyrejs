import { MigrationInterface, QueryRunner } from 'typeorm';

interface ShipDataCorrection {
  name: string;
  description?: string;
  yearBuilt?: number;
  length?: number;
  width?: number;
  tonnage?: number;
  passengersDecks?: number;
  passengers?: number;
  crew?: number;
}

export const SHIP_DATA_CORRECTIONS: ShipDataCorrection[] = [
  { name: 'AIDAdiva', tonnage: 71304 },
  { name: 'AIDAluna', tonnage: 71304 },
  { name: 'AIDAmar', tonnage: 71304 },
  { name: 'AIDAsol', tonnage: 71304 },
  {
    name: 'Adventure of the Seas',
    yearBuilt: 2001,
    length: 311,
    width: 39,
    tonnage: 137276,
    passengersDecks: 15,
    passengers: 3114,
    crew: 1185,
  },
  {
    name: 'Allure of the Seas',
    yearBuilt: 2010,
    length: 360,
    width: 66,
    tonnage: 225282,
    passengersDecks: 16,
    passengers: 5484,
    crew: 2200,
  },
  {
    name: 'Brilliance of the Seas',
    yearBuilt: 2002,
    length: 293,
    width: 32,
    tonnage: 90090,
    passengersDecks: 12,
    passengers: 2112,
    crew: 848,
  },
  {
    name: 'Enchantment of the Seas',
    description:
      'Enchantment of the Seas to statek klasy Vision, który zadebiutował w 1997 roku, a w 2005 roku został wydłużony o 22 metry. Dzięki temu zyskał większą przestrzeń dla gości i dodatkowe atrakcje na pokładzie.\n\nNa statku znajdują się m.in. baseny, solarium, ściana wspinaczkowa, park wodny dla dzieci, teatr, kasyno oraz promenada z restauracjami i barami. Jest dobrym wyborem dla osób szukających kameralnego rejsu z typowymi atrakcjami Royal Caribbean.',
    yearBuilt: 1997,
    length: 301,
    width: 32,
    tonnage: 82910,
    passengersDecks: 11,
    passengers: 2252,
    crew: 842,
  },
  {
    name: 'Explorer of the Seas',
    yearBuilt: 2000,
    length: 311,
    width: 39,
    tonnage: 138194,
    passengersDecks: 15,
    passengers: 3286,
    crew: 1181,
  },
  {
    name: 'Freedom of the Seas',
    yearBuilt: 2006,
    length: 339,
    width: 56,
    tonnage: 154407,
    passengersDecks: 15,
    passengers: 3634,
    crew: 1360,
  },
  {
    name: 'Grandeur of the Seas',
    yearBuilt: 1996,
    length: 279,
    width: 32,
    tonnage: 73817,
    passengersDecks: 11,
    passengers: 1992,
    crew: 760,
  },
  {
    name: 'Harmony of the Seas',
    yearBuilt: 2016,
    length: 362,
    width: 66,
    tonnage: 226963,
    passengersDecks: 16,
    passengers: 5479,
    crew: 2200,
  },
  {
    name: 'Independence of the Seas',
    yearBuilt: 2008,
    length: 339,
    width: 56,
    tonnage: 154407,
    passengersDecks: 15,
    passengers: 3858,
    crew: 1360,
  },
  {
    name: 'Jewel of the Seas',
    yearBuilt: 2004,
    length: 293,
    width: 32,
    tonnage: 90090,
    passengersDecks: 12,
    passengers: 2191,
    crew: 859,
  },
  {
    name: 'Liberty of the Seas',
    yearBuilt: 2007,
    length: 339,
    width: 56,
    tonnage: 155889,
    passengersDecks: 15,
    passengers: 3798,
    crew: 1360,
  },
  {
    name: 'MEIN SCHIFF 1',
    description:
      'MEIN SCHIFF 1 to jednostka TUI Cruises z 2018 roku, zaprojektowana z myślą o wypoczynku w swobodnej atmosferze Premium All Inclusive. Przestronne pokłady i duża strefa zewnętrzna sprzyjają relaksowi podczas rejsów po Europie i Karaibach.\n\nNa pokładzie czekają restauracje, bary, teatr, spa, centrum fitness, basen i strefy rozrywki. Statek wyróżnia się dużą liczbą miejsc wypoczynkowych na świeżym powietrzu oraz nowoczesnymi kabinami.',
    yearBuilt: 2018,
    length: 316,
    width: 36,
    tonnage: 111500,
    passengersDecks: 15,
    passengers: 2894,
    crew: 1000,
  },
  {
    name: 'MEIN SCHIFF 5',
    description:
      'MEIN SCHIFF 5, należący do TUI Cruises, wszedł do służby w 2016 roku. Jednostka oferuje formułę Premium All Inclusive, dzięki której większość restauracji, barów i aktywności jest dostępna w cenie rejsu.\n\nNa pokładzie znajdują się baseny, strefa spa, teatr, klub sportowy, restauracje oraz liczne miejsca do odpoczynku na otwartych pokładach.',
    passengersDecks: 15,
    crew: 1000,
  },
  {
    name: 'MEIN SCHIFF 6',
    description:
      'MEIN SCHIFF 6 to statek TUI Cruises, który zadebiutował w 2017 roku. Łączy nowoczesne wnętrza, komfortowe kabiny i formułę Premium All Inclusive z bogatą ofertą wypoczynku oraz rozrywki.\n\nGoście mają do dyspozycji restauracje, bary, teatr, spa, centrum fitness, baseny i przestrzenie rekreacyjne na zewnątrz.',
    length: 295,
    width: 36,
    tonnage: 99800,
    passengersDecks: 15,
    crew: 1000,
  },
  { name: 'MSC Sinfonia', passengersDecks: 13 },
  {
    name: 'MSC World America',
    tonnage: 216638,
    passengersDecks: 22,
    passengers: 6764,
    crew: 2138,
  },
  {
    name: 'Mariner of the Seas',
    yearBuilt: 2003,
    length: 311,
    width: 39,
    tonnage: 138279,
    passengersDecks: 15,
    passengers: 3114,
    crew: 1185,
  },
  {
    name: 'Navigator of the Seas',
    yearBuilt: 2002,
    length: 311,
    width: 39,
    tonnage: 139570,
    passengersDecks: 15,
    passengers: 3114,
    crew: 1185,
  },
  {
    name: 'Norwegian Luna',
    yearBuilt: 2026,
    length: 322,
    width: 41,
    tonnage: 156300,
    passengersDecks: 20,
    passengers: 3571,
    crew: 1597,
  },
  { name: 'Norwegian Prima', width: 41, passengersDecks: 20, crew: 1506 },
  {
    name: 'Oasis of the Seas',
    yearBuilt: 2009,
    length: 360,
    width: 66,
    tonnage: 225282,
    passengersDecks: 16,
    passengers: 5484,
    crew: 2394,
  },
  {
    name: 'Quantum of the Seas',
    yearBuilt: 2014,
    length: 348,
    width: 41,
    tonnage: 168666,
    passengersDecks: 14,
    passengers: 4180,
    crew: 1500,
  },
  {
    name: 'Radiance of the Seas',
    yearBuilt: 2001,
    length: 293,
    width: 32,
    tonnage: 90090,
    passengersDecks: 12,
    passengers: 2143,
    crew: 859,
  },
  {
    name: 'Rhapsody of the Seas',
    yearBuilt: 1997,
    length: 279,
    width: 32,
    tonnage: 78491,
    passengersDecks: 11,
    passengers: 2416,
    crew: 765,
  },
  {
    name: 'Serenade of the Seas',
    yearBuilt: 2003,
    length: 293,
    width: 32,
    tonnage: 90090,
    passengersDecks: 12,
    passengers: 2143,
    crew: 891,
  },
  {
    name: 'Spectrum of the Seas',
    description:
      'Spectrum of the Seas to pierwszy statek klasy Quantum Ultra, zbudowany dla rynku azjatyckiego i wprowadzony do służby w 2019 roku. Łączy zaawansowane technologie z szeroką ofertą rozrywki charakterystyczną dla Royal Caribbean.\n\nNa pokładzie znajdują się m.in. kapsuła widokowa North Star, symulator skoków RipCord by iFLY, strefa wirtualnej rzeczywistości, teatr Two70, restauracje oraz rozbudowane przestrzenie rodzinne.',
    yearBuilt: 2019,
    length: 348,
    width: 41,
    tonnage: 169379,
    passengersDecks: 14,
    passengers: 4246,
    crew: 1551,
  },
  {
    name: 'Symphony of the Seas',
    yearBuilt: 2018,
    length: 362,
    width: 66,
    tonnage: 228081,
    passengersDecks: 16,
    passengers: 5518,
    crew: 2200,
  },
  {
    name: 'Vision of the Seas',
    yearBuilt: 1998,
    length: 279,
    width: 32,
    tonnage: 78340,
    passengersDecks: 11,
    passengers: 2050,
    crew: 742,
  },
  {
    name: 'Voyager of the Seas',
    yearBuilt: 1999,
    length: 311,
    width: 39,
    tonnage: 137276,
    passengersDecks: 15,
    passengers: 3114,
    crew: 1181,
  },
  {
    name: 'Wonder of the Seas',
    description:
      'Wonder of the Seas to statek klasy Oasis i jedna z największych jednostek Royal Caribbean. Do służby wszedł w 2022 roku, oferując osiem tematycznych dzielnic, w tym Central Park z żywą roślinnością oraz przestrzeń Suite Neighborhood.\n\nNa pokładzie znajdują się baseny, park wodny dla dzieci, symulator surfingu FlowRider, tyrolka, lodowisko, teatr, AquaTheater, Ultimate Abyss oraz szeroki wybór restauracji i barów. Statek jest przeznaczony zarówno dla rodzin, jak i gości szukających intensywnej oferty rozrywkowej.',
    yearBuilt: 2022,
    length: 362,
    width: 65,
    tonnage: 235600,
    passengersDecks: 16,
    passengers: 5734,
    crew: 2204,
  },
];

export class BackfillMissingShipData1789360000000
  implements MigrationInterface
{
  public readonly name = 'BackfillMissingShipData1789360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const correction of SHIP_DATA_CORRECTIONS) {
      await queryRunner.query(
        `UPDATE "ship"
         SET "description" = CASE WHEN ("description" IS NULL OR BTRIM("description") = '') AND $2::text IS NOT NULL THEN $2::text ELSE "description" END,
             "yearBuilt" = CASE WHEN ("yearBuilt" IS NULL OR ("name" = 'Norwegian Luna' AND "yearBuilt" = 0)) AND $3::integer IS NOT NULL THEN $3::integer ELSE "yearBuilt" END,
             "length" = CASE WHEN ("length" IS NULL OR ("name" = 'Norwegian Luna' AND "length" = 0)) AND $4::numeric IS NOT NULL THEN $4::numeric ELSE "length" END,
             "width" = CASE WHEN ("width" IS NULL OR ("name" = 'Norwegian Luna' AND "width" = 0)) AND $5::numeric IS NOT NULL THEN $5::numeric ELSE "width" END,
             "tonnage" = CASE WHEN ("tonnage" IS NULL OR ("name" = 'Norwegian Luna' AND "tonnage" = 0)) AND $6::numeric IS NOT NULL THEN $6::numeric ELSE "tonnage" END,
             "passengersDecks" = CASE WHEN "passengersDecks" IS NULL AND $7::integer IS NOT NULL THEN $7::integer ELSE "passengersDecks" END,
             "passengers" = CASE WHEN "passengers" IS NULL AND $8::integer IS NOT NULL THEN $8::integer ELSE "passengers" END,
             "crew" = CASE WHEN "crew" IS NULL AND $9::integer IS NOT NULL THEN $9::integer ELSE "crew" END
         WHERE "name" = $1`,
        [
          correction.name,
          correction.description ?? null,
          correction.yearBuilt ?? null,
          correction.length ?? null,
          correction.width ?? null,
          correction.tonnage ?? null,
          correction.passengersDecks ?? null,
          correction.passengers ?? null,
          correction.crew ?? null,
        ],
      );
    }
  }

  public async down(): Promise<void> {}
}
