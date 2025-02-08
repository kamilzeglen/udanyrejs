import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAddCompanies1733937034220 implements MigrationInterface {
  name = 'SeedAddCompanies1733937034220';

  public companies = [
    {
      id: '841d1a1b-09f4-499c-9f99-2836d32b22c2',
      name: 'MSC Cruises',
      key: 'MSC',
      isActive: true,
      description:
        'MSC Cruises powstało w 1960 roku w Neapolu. Jest liderem na rynku rejsów po Morzu Śródziemnym, pływając po tym obszarze przez cały rok. Dodatkowo oferuje szeroki wybór tras sezonowych jak: Europa Północna, rejsy przez Atlantyk, Karaiby, Ameryka Północna i Południowa, Kanada, Ocean Indyjski, Zachodnia i Południowa Afryka. Firma jest całkowicie europejska, ale posiada biura na całym świecie. Nowoczesna flota MSC to kilkanaście statków. Każdy z nich charakteryzuje się eleganckimi, stonowanymi wnętrzami, dbałością o szczegóły oraz włoską gościnnością którą można się cieszyć podczas rejsu. Na uwagę zasługują innowacyjne statki MSC Seaside i MSC Seaview, które wyróżniają się zewnętrzną promenadą biegnącą wokół statku. Na jej poziomie znajdują się bary i restauracje, co pozwala cieszyć się czasem na świeżym powietrzu. Armator stale powiększa flotę, inwestując w nowoczesne technologie i przyjazne środowisku rozwiązania. Jednocześnie dba o starsze jednostki, regularnie je remontując.',
      priceIncludes: [
        'zakwaterowanie w kabinie wybranej kategorii',
        'wyżywienie - 3 główne posiłki, przekąski między posiłkami',
        'napoje serwowane do śniadania i w bufetach samoobsługowych',
        'napiwki dla obsługi (kwota zależy od długości rejsu)',
        'serwis bagażowy podczas wejścia i zejścia ze statku',
        'serwis kabinowy',
        'korzystanie ze wszystkich urządzeń sportowo - rekreacyjnych znajdujących się na pokładzie statku (basen, jacuzzi, sala fitness, itp.)',
        'udział we wszystkich imprezach organizowanych na statku (przedstawienia w teatrze, koncerty, programy animacyjne itp.)',
        'opłaty portowe',
      ],
      priceExcludes: [
        'kosztów dojazdu do portu',
        'ewentualnych noclegów w hotelu przed oraz po rejsie i transferów',
        'wycieczek fakultatywnych w trakcie rejsu',
        'korzystania z barów, mini baru w kabinie oraz napojów zamawianych w restauracji',
        'korzystania z punktów usługowych (fryzjer, pralnia, fotograf, salon piękności i odnowy biologicznej, internet)',
        'wydatków osobistych',
        'ubezpieczenia KL, NNW i bagaż',
        'kosztów wiz (tam gdzie wymagane)',
      ],
    },
    {
      id: '83a07c58-5b60-4e2e-81d1-24689ad762a8',
      name: 'AIDA Cruises',
      key: 'AIDA',
      isActive: true,
      description:
        'Aida to niemiecka linia cruisingowa, która weszła na rynek w roku 1960. Początkowo została przejęta przez brytyjską firmę P&O Cruises, natomiast od roku 2003 jest członkiem korporacji Carnivala. Aida to nowoczesne statki wycieczkowe, operujących rejsy w rejonie Morza Śródziemnego i Wysp Kanaryjskich, Europy Północnej, Zatoki Perskiej, Karaibów, obu Ameryk oraz Azji. Aidę cechuje forma „casual” - bez eleganckich wieczorów galowych, oraz kompleksowe łączenie rejsów wraz z dolotem do portu zaokrętowania. Firma posiada mocno rozbudowane zaplecze również na lądzie i oferuje swoim gościom np. przejażdżki rowerami górskimi, rafting, safari czy nurkowanie. Armator polecany w szczególności rodzinom z dziećmi oraz osobom aktywnym. Statki - zwłaszcza te najnowsze - oferują moc atrakcji i udogodnień dla najmłodszych. Są to pokoje zabaw, baseny ze zjeżdzalniami, parki linowe, animacje. Dla dzieci do 3 lat - żłobek. Ponadto bufety z daniami uwielbianymi przez dzieci, podgrzewacze do butelek w kabinach, łóżeczka turystyczne, krzesełka do karmienia w restauracjach.Dla aktywnych pozytywnym aspektem będą ciekawe wycieczki fakultatywne, ale również pokładowa strefa fitness z w pełni wyposażoną siłownią, salą fitness, zajęciami grupowymi i indywidualnymi. Na pokładzie językiem oficjalnym i dominującym jest niemiecki. Obsługa porozumiewa się również w języku angielskim. ',
      priceIncludes: [
        'zakwaterowanie w kabinie wybranej kategorii',
        'wyżywienie - 3 główne posiłki oraz napoje podczas posiłków w bufetach (wybrane, ogólnodostępne napoje, takie jak: kawa z dystrybutorów, herbata, woda do śniadania, soki oraz dodatkowo piwo - jeden rodzaj i wino - house wine do lunchu i kolacji)',
        'serwis bagażowy podczas wejścia i zejścia ze statku',
        'serwis kabinowy',
        'napiwki dla obsługi statku',
        'korzystanie z urządzeń sportowo - rekreacyjnych znajdujących się na pokładzie statku (basen, jacuzzi, sala fitness, itp.)',
        'udział w imprezach organizowanych na statku (przedstawienia w teatrze, koncerty, programy animacyjne itp.)',
      ],
      priceExcludes: [
        'kosztów dojazdu do portu (na życzenie możliwość rezerwacji przelotu z niemieckich lotnisk w atrakcyjnej cenie)',
        'ewentualnych noclegów w hotelu przed\/po rejsie i transferów',
        'wycieczek fakultatywnych w trakcie rejsu',
        'korzystania z barów, mini baru w kabinie oraz napojów zamawianych poza porami posiłków',
        'napojów objętych dodatkowymi opłatami, zamawianych w bufetach podczas posiłków',
        'korzystania z punktów usługowych (fryzjer, pralnia, fotograf, salon piękności i odnowy biologicznej, internet)',
        'wydatków osobistych',
        'ubezpieczenia KL, NNW i bagaż (około €1 - €1,5 osoba\/dzień)',
        'kosztów wiz (tam gdzie wymagane)',
      ],
    },
    {
      id: '1e554f55-e1ab-40cf-b69c-59d92f2cd5dc',
      name: 'Costa Cruises',
      key: 'COSTA',
      isActive: true,
      description:
        'Costa Cruises to jedna z największych włoskich firm działająca w turystyce i firma cruisingowa nr 1 w Europie. Istnieje na rynku od marca 1948 (pierwszy rejs statku „Anna C” z Genui do Buenos Aires), na dzień dzisiejszy posiada najmłodszą flotę w Europie. W każdym z nich widać włoski styl i inspirację. Statki Costa Cruises pływają po Morzu Śródziemnym, odwiedzają państwa Europy Północnej, Grenlandię, kraje bałtyckie, a z dalszych destynacji – Karaiby, Amerykę Południową, Zjednoczone Emiraty Arabskie, Daleki Wschód. W ofercie są też rejsy po Oceanie Indyjskim. Ogółem 250 różnych destynacji.Załoga statków jest międzynarodowa (80 państw), dzięki czemu każdy z gości może poczuć się na pokładzie jak w domu. Obsługa posługuje się pięcioma językami: włoskim, angielskim, francuskim, niemieckim i hiszpańskim (na wybranych statkach dodatkowo rosyjskim i portugalskim.) Na pokładzie statków na pasażerów czeka mnóstwo atrakcji, można pójść na basen, skorzystać z siłowni, sauny czy jacuzzi, wieczorem zaś posiedzieć w jednej z restauracji czy barów, albo przetańczyć noc w dyskotece. Nowsze jednostki oferują nowoczesne centrum odnowy biologicznej – Samsara Spa, połączone bezpośrednio z wybranymi apartamentami i ekskluzywnymi kabinami Samsara.',
      priceIncludes: [
        'zakwaterowanie w kabinie wybranej kategorii',
        'wyżywienie - 3 główne posiłki, przekąski między posiłkami',
        'napoje serwowane do śniadania i w bufetach samoobsługowych',
        'serwis bagażowy podczas wejścia i zejścia ze statku',
        'serwis kabinowy',
        'korzystanie ze wszystkich urządzeń sportowo - rekreacyjnych znajdujących się na pokładzie statku (basen, jacuzzi, sala fitness, itp.)',
        'udział we wszystkich imprezach organizowanych na statku (przedstawienia w teatrze, koncerty, programy animacyjne itp.)',
        'opłaty portowe',
      ],
      priceExcludes: [
        'kosztów dojazdu do portu',
        'ewentualnych noclegów w hotelu przed\/po rejsie i transferów',
        'wycieczek fakultatywnych w trakcie rejsu',
        'korzystania z barów, mini baru w kabinie oraz napojów zamawianych w restauracji',
        'korzystania z punktów usługowych (fryzjer, pralnia, fotograf, salon piękności i odnowy biologicznej, internet) i wydatków osobistych',
        'opłaty serwisowej (service charge \/ napiwki) automatycznie doliczanej do rachunku na statku - kwota uzależniona od długości rejsu',
        'ubezpieczenia KL, NNW i bagaż',
        'obowiązkowych składek TFP i TFG',
        'kosztów wiz (tam gdzie wymagane)',
      ],
    },
    {
      id: 'ac589100-cd6f-4d0a-8da3-81e3654c211f',
      name: 'TUI Cruises',
      key: 'TUI',
      isActive: false,
    },
    {
      id: '618a898f-60eb-43a1-8bdb-ec4df66f73f3',
      name: 'Norwegian Cruise Line',
      key: 'NCL',
      isActive: true,
      description:
        'NCL Corporation to międzynarodowa linia cruisingowa z główną siedzibą w Miami na Florydzie. Na rynku istnieje od 1966 roku. W Europie działają dwa biura nadzorujące rejsy w Europie oraz europejski rynek sprzedaży. Znajdują się w Londynie i w Wiesbaden. Statki NCL odwiedzają Wyspy Karaibskie, Bermudy, Bahamy i Hawaje. W ofercie znajdują się również rejsy po Alasce, Kanadzie, Ameryce Środkowej i Południowej, Europie Północnej oraz Morzu Śródziemnym.',
      priceIncludes: [
        'zakwaterowanie w kabinie wybranej kategorii',
        'opłaty portowe',
        'wyżywienie - 3 główne posiłki (w formie bufetu lub serwowane), przekąski między posiłkami',
        'napoje z automatów w bufetach samoobsługowych',
        'serwis bagażowy podczas wejścia i zejścia ze statku',
        'serwis kabinowy',
        'korzystanie ze wszystkich urządzeń sportowo - rekreacyjnych znajdujących się na pokładzie statku (basen, jacuzzi, sala fitness, itp.)',
        'udział we wszystkich imprezach organizowanych na statku (przedstawienia w teatrze, koncerty, programy animacyjne itp.)',
      ],
      priceExcludes: [
        'kosztów dojazdu do portu',
        'ewentualnych noclegów w hotelu przed\/po rejsie i transferów',
        'wycieczek fakultatywnych w trakcie rejsu',
        'opłaty serwisowej (service charge \/ napiwki) automatycznie doliczanej do rachunku na statku - kwota uzależniona od długości rejsu',
        'korzystania z barów, mini baru w kabinie oraz napojów zamawianych w restauracjach',
        'korzystania z punktów usługowych (fryzjer, pralnia, fotograf, salon piękności i odnowy biologicznej, internet)',
        'wydatków osobistych',
        'ubezpieczenia KL, NNW i bagażu',
        'kosztów wiz (tam gdzie wymagane)',
      ],
    },
    {
      id: 'e676773f-d20d-4ffd-baa0-5e0248738605',
      name: 'Royal Caribbean',
      key: 'ROYAL',
      isActive: true,
      description:
        'Royal Caribbean International należy do najmłodszych i najbardziej nowatorskich linii cruisingowych pływających po morzach całego świata (ponad 160 portów). Dysponuje również największą flotą statków rejsowych – 19 jednostek (w budowie Allure of the Seas) podzielonych na klasy: Oasis (2 największe statki świata), Freedom, Radiance, Vision i Voyager. Na każdym z nich wyśmienita gastronomia: od wakacyjnej kawiarenki po wykwintną i ciepłą atmosferę restauracji. Goście mają mnóstwo propozycji spędzenia wolnego czasu: mini-golf, ścianka wspinaczkowa, boisko do koszykówki i siatkówki, ścieżka do joggingu, baseny, lodowisko. Dla spragnionych relaksu: Fitness Center wyposażony w najnowocześniejszy sprzęt sportowy oraz kąpiele Spa i zabiegi kosmetyczne. Najmłodsi pasażerowie również nie będą się nudzić – czeka na nich ciekawy program przygotowany z podziałem na 4 grupy wiekowe.',
      priceIncludes: [
        'zakwaterowanie w kabinie wybranej kategorii',
        'wyżywienie - 3 główne posiłki, przekąski między posiłkami',
        'napoje serwowane do śniadania i w bufetach samoobsługowych',
        'serwis bagażowy podczas wejścia i zejścia ze statku',
        'serwis kabinowy',
        'korzystanie ze wszystkich urządzeń sportowo - rekreacyjnych znajdujących się na pokładzie statku (basen, jacuzzi, sala fitness, itp.)',
        'udział we wszystkich imprezach organizowanych na statku (przedstawienia w teatrze, koncerty, programy animacyjne itp.)',
      ],
      priceExcludes: [
        'kosztów dojazdu do portu',
        'ewentualnych noclegów w hotelu przed\/po rejsie i transferów',
        'wycieczek fakultatywnych w trakcie rejsu',
        'korzystania z barów, mini baru w kabinie oraz napojów zamawianych w restauracji',
        'korzystania z punktów usługowych (fryzjer, pralnia, fotograf, salon piękności i odnowy biologicznej, internet) i wydatków osobistych',
        'napiwków dla obsługi na statku (kwota uzależniona od długości rejsu)',
        'ubezpieczenia KL, NNW i bagaż',
        'obowiązkowych składek TFP i TFG',
        'kosztów wiz (tam gdzie wymagane)',
      ],
    },
    {
      id: 'dc8cb607-cdab-4564-82d9-fbeb70162943',
      name: 'AmaWaterways',
      key: 'AMA',
      isActive: false,
    },
    {
      id: 'a93ab6e0-02f0-471e-b660-0883d789dbb1',
      name: 'American Cruise Lines',
      key: 'ACL',
      isActive: false,
    },
    {
      id: '217cfd91-1957-4d40-8455-37031d8f77be',
      name: 'Aqua Expeditions',
      key: 'AQUA',
      isActive: false,
    },
    {
      id: 'c7425461-8a71-465c-8094-3fe1521c4289',
      name: 'Aranui Cruises',
      key: 'ARANUI',
      isActive: false,
    },
    {
      id: 'e6ac7a3a-3590-4ede-9342-b7dd9a23fab5',
      name: 'Azamara Club Cruises',
      key: 'AZAMARA',
      isActive: false,
    },
    {
      id: '602e8b52-b110-4c1f-b0f7-dc3c3e0ac91b',
      name: 'Carnival Cruise Lines',
      key: 'CARNIVAL',
      isActive: false,
    },
    {
      id: '519d59e9-7158-4751-b909-ea8416e7802c',
      name: 'Celebrity Cruises',
      key: 'CELEBRITY',
      isActive: false,
    },
    {
      id: 'beeb83a2-d0c7-406c-a8c7-7274f6cedbd8',
      name: 'Celestyal Cruises',
      key: 'CELESTYAL',
      isActive: false,
    },
    {
      id: '8ea08d92-a4ca-49a8-8478-5b1bd5087d71',
      name: 'CroisiEurope',
      key: 'CE',
      isActive: false,
    },
    {
      id: '4db2c8d3-183e-48fd-a63f-aeef73fb38d5',
      name: 'Crystal Cruises',
      key: 'CRYSTAL',
      isActive: false,
    },
    {
      id: '7d4f8375-d316-434c-a8e0-888f93129f30',
      name: 'Cunard',
      key: 'CUNARD',
      isActive: false,
    },
    {
      id: '5fb3c916-d705-4c36-b6d7-316d5e159055',
      name: 'Disney Cruise Line',
      key: 'DISNEY',
      isActive: false,
    },
    {
      id: 'f6686c02-d5ca-4796-8e82-9b97e46b000b',
      name: 'Elixir Boutique Cruises',
      key: 'ELIXIR',
      isActive: false,
    },
    {
      id: 'aa3b2f37-d5a6-438e-a18b-035d4488ecc9',
      name: 'Explora Journeys',
      key: 'EXPLORA',
      isActive: false,
    },
    {
      id: '42dc5a0b-3dbf-4123-9b54-d2bc3d00138b',
      name: 'Hapag-Lloyd Cruises',
      key: 'HLC',
      isActive: false,
    },
    {
      id: '2c2f86e6-87fc-4c01-8d64-281b7c62a7e1',
      name: 'Hapag-Lloyd Expedition Cruises',
      key: 'HLEC',
      isActive: false,
    },
    {
      id: 'ffa93f63-476a-401e-b6eb-133760ae94d3',
      name: 'Holland America Line',
      key: 'HAL',
      isActive: false,
    },
    {
      id: '27f3d6cf-412a-44b0-a581-6b23de88854f',
      name: 'Hurtiguten Expeditions',
      key: 'HE',
      isActive: false,
    },
    {
      id: 'bb7554e2-e23f-4eec-8bff-db0c07f9fb8f',
      name: 'Katarina Line Cruises',
      key: 'KLC',
      isActive: false,
    },
    {
      id: '2b899885-8aae-4e6a-b674-07c0a4122426',
      name: 'Lotus Cruises',
      key: 'LC',
      isActive: false,
    },
    {
      id: '194f4545-5f34-4606-ac08-73b4ab8f267b',
      name: 'Nicko Cruises',
      key: 'NC',
      isActive: false,
    },
    {
      id: '7f831b42-9331-42bb-aea1-39a60565c3b7',
      name: 'Oceania Cruises',
      key: 'OC',
      isActive: false,
    },
    {
      id: 'df5499cf-6faf-4d52-9640-ca62c8d9ff92',
      name: 'P&O Cruises',
      key: 'POC',
      isActive: false,
    },
    {
      id: '728ea8f8-beb4-4c88-81be-1974b9ca5f9b',
      name: 'Pandaw River Expeditions',
      key: 'PRE',
      isActive: false,
    },
    {
      id: 'cdf64bb3-a3b4-4464-91c3-461e8a1eb08a',
      name: 'Paul Gauguin Cruises',
      key: 'PGC',
      isActive: false,
    },
    {
      id: '097315d6-f9c0-404a-9a0b-14b537b08bf6',
      name: 'Ponant - Yacht Cruises & Expeditions',
      key: 'PONANT',
      isActive: false,
    },
    {
      id: '3eeb4c10-bc9f-410e-9ab6-5af97e63a4b6',
      name: 'Princess Cruises',
      key: 'PRINCESS',
      isActive: false,
    },
    {
      id: '4abe8bd5-21b7-4a5d-8573-00b0ed30a93e',
      name: 'Quark Expedition',
      key: 'QUARK',
      isActive: false,
    },
    {
      id: 'c5c8abbe-ba24-48ed-b9ba-1353eaaee9ce',
      name: 'Regent Seven Seas Cruises',
      key: 'RSSC',
      isActive: false,
    },
    {
      id: '068453bc-a1f1-4d90-bbc6-6cd628b87c2d',
      name: 'Scubaspa Maldives',
      key: 'SM',
      isActive: false,
    },
    {
      id: '3c99189a-c0b3-4c41-b55c-fd3affee1981',
      name: 'Seabourn',
      key: 'SEABOURN',
      isActive: false,
    },
    {
      id: 'b6f58781-900e-470a-a2d6-29e8f453dbfd',
      name: 'SeaDream Yacht Club',
      key: 'SEADREAN',
      isActive: false,
    },
    {
      id: 'aeeb6d26-d0d6-4b68-ab10-71049dce6512',
      name: 'Silversea Cruises',
      key: 'SILVERSEA',
      isActive: false,
    },
    {
      id: 'c8c60a7c-e0f8-4f09-9c20-5acd11e0e45d',
      name: 'Star Clippers',
      key: 'STAR',
      isActive: false,
    },
    {
      id: 'f73b6c34-b206-4d71-8edf-30faf4e987a5',
      name: 'The Ritz-Carlton Yacht Collection',
      key: 'RITZ',
      isActive: false,
    },
    {
      id: '7d5e464a-835e-4c66-8aa9-37094d9c1761',
      name: 'Travelmarvel',
      key: 'TRAVELMARVEL',
      isActive: false,
    },
    {
      id: '03a0da4b-5f92-4785-aa1a-7cf6fb5d542c',
      name: 'Uniworld Boutique River Cruises',
      key: 'UBRC',
      isActive: false,
    },
    {
      id: 'af1884f6-eb2a-43cd-87cf-0680bdfbb5da',
      name: 'Variety Cruises',
      key: 'VAARIETY',
      isActive: false,
    },
    {
      id: 'bc6d0c19-e1ab-4bde-86e4-9060cd5177e5',
      name: 'Viking Cruises',
      key: 'VIKING',
      isActive: false,
    },
    {
      id: '0a993515-7517-42cb-bc28-680398c43d87',
      name: 'Virgin Voyages',
      key: 'VIRGIN',
      isActive: false,
    },
    {
      id: 'bef147b5-7bf4-4491-af21-c0d03a201771',
      name: 'Windstar Cruises',
      key: 'WINDSTAR',
      isActive: false,
    },
    {
      id: 'd118026d-7c8d-4482-8103-11907a2d019d',
      name: 'Yasawa Princess',
      key: 'YASAWA',
      isActive: false,
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const company of this.companies) {
      await queryRunner.query(
        `
    INSERT INTO "company" ("id", "name", "key", "isActive", "description", "priceIncludes", "priceExcludes", "createdById", "updatedById")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT ("id") DO NOTHING;
  `,
        [
          company.id,
          company.name,
          company.key,
          company.isActive || false,
          company.description || null,
          JSON.stringify(company.priceIncludes) || null,
          JSON.stringify(company.priceExcludes) || null,
          '12345678-3cf2-4e11-87c2-f6a75aa28f8d',
          '12345678-3cf2-4e11-87c2-f6a75aa28f8d',
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const company of this.companies) {
      await queryRunner.query(`
        DELETE FROM "company"
        WHERE "name" = '${company.name}'
      `);
    }
  }
}
