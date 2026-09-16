import { MigrationInterface, QueryRunner } from 'typeorm';

type DestinationDescription = {
  slug: string;
  previousDescription: string;
  description: string;
};

const destinationDescriptions: DestinationDescription[] = [
  {
    slug: 'alaska',
    previousDescription:
      'Alaska zachwyca monumentalnymi lodowcami, górskimi panoramami i dziką przyrodą oglądaną prosto z pokładu statku. Rejs po Alasce pozwala odwiedzić porty takie jak Juneau, Skagway czy Ketchikan, a także zobaczyć fiordy i zatoki, do których trudno dotrzeć drogą lądową. Sprawdź aktualne rejsy po Alasce i wybierz termin swojej wyprawy.',
    description:
      'Alaska zachwyca monumentalnymi lodowcami, ośnieżonymi szczytami i dziką przyrodą, którą podczas rejsu można obserwować prosto z pokładu statku. Trasy prowadzą przez Inside Passage oraz w pobliże zatok i fiordów, gdzie często można wypatrzyć wieloryby, orły i lwy morskie. W portach takich jak Juneau, Skagway czy Ketchikan czekają spacery po historycznych miasteczkach, loty widokowe nad lodowcami i wyprawy w głąb alaskańskiej natury. Rejs po Alasce to propozycja dla osób, które chcą połączyć komfort podróży z prawdziwą przygodą i wyjątkowymi krajobrazami.',
  },
  {
    slug: 'caribbean',
    previousDescription:
      'Karaiby to wymarzony kierunek na rejs pełen słońca, kolorowych portów i spokojnych zatok. Podczas podróży można połączyć wypoczynek na plaży z odkrywaniem wysp, lokalnej kuchni i wyjątkowej atmosfery regionu. Sprawdź aktualne rejsy po Karaibach i wybierz trasę dopasowaną do swojego stylu podróżowania.',
    description:
      'Karaiby to wymarzony kierunek dla osób, które chcą połączyć wypoczynek na plaży z odkrywaniem wielu wysp podczas jednej podróży. Rejsy prowadzą do kolorowych portów, turkusowych zatok i miejsc, w których można snorkelować, nurkować lub po prostu odpocząć pod palmami. Każda wyspa ma własny charakter: od tętniących życiem miast i karaibskiej muzyki po spokojne, kameralne plaże. To świetny wybór zarówno na pierwszy rejs, jak i dla podróżników szukających słońca, lokalnych smaków oraz swobodnej atmosfery regionu.',
  },
  {
    slug: 'norwegian-fjords',
    previousDescription:
      'Norweskie Fiordy to wyjątkowy kierunek dla miłośników natury i spokojnych, spektakularnych widoków. Rejs prowadzi wśród stromych gór, wodospadów i urokliwych portów Skandynawii, oferując niezapomniane panoramy na każdym etapie podróży. Sprawdź aktualne rejsy po Norweskich Fiordach.',
    description:
      'Norweskie Fiordy to jeden z najbardziej malowniczych kierunków rejsowych w Europie. Statek płynie pomiędzy stromymi, zielonymi zboczami, wodospadami i niewielkimi miejscowościami, a zmieniające się widoki są atrakcją samą w sobie. Popularne trasy odwiedzają między innymi Bergen, Geiranger, Flåm czy Ålesund, skąd łatwo wyruszyć na punkt widokowy, przejażdżkę koleją lub górską wycieczkę. Rejs po fiordach sprawdzi się szczególnie u osób ceniących naturę, spokój i komfortowe zwiedzanie bez częstego zmieniania hoteli.',
  },
  {
    slug: 'baltic-sea',
    previousDescription:
      'Rejs po Morzu Bałtyckim pozwala wygodnie poznać porty północnej Europy, od skandynawskich stolic po klimatyczne miasta nad Bałtykiem. To propozycja dla osób, które chcą połączyć zwiedzanie, komfort podróży i różnorodne atrakcje w jednym rejsie. Sprawdź aktualne rejsy po Morzu Bałtyckim.',
    description:
      'Rejs po Morzu Bałtyckim pozwala wygodnie odkrywać najciekawsze porty północnej Europy bez codziennego pakowania walizek. W jednej podróży można połączyć skandynawskie stolice, hanzeatyckie miasta i nadbałtyckie zabytki, korzystając wieczorami z wygody statku. Trasy często prowadzą do Kopenhagi, Sztokholmu, Helsinek, Tallinna lub Gdańska, oferując wiele możliwości zwiedzania i poznawania lokalnej kultury. To doskonały wybór na pierwszy rejs oraz dla osób, które lubią miejski klimat, historię i różnorodne atrakcje w rozsądnym tempie.',
  },
  {
    slug: 'mediterranean-sea',
    previousDescription:
      'Morze Śródziemne to jeden z najchętniej wybieranych kierunków rejsowych w Europie. W jednej podróży można odwiedzić porty Włoch, Hiszpanii, Francji i Grecji, łącząc zwiedzanie zabytków z relaksem nad morzem. Zobacz aktualne rejsy po Morzu Śródziemnym i znajdź trasę idealną na swój urlop.',
    description:
      'Morze Śródziemne to klasyka rejsowych wakacji: dużo słońca, znakomita kuchnia i porty pełne historii. W zależności od trasy można odwiedzić Włochy, Hiszpanię, Francję, Grecję, Chorwację lub wyspy Morza Śródziemnego, łącząc zwiedzanie zabytków z chwilą relaksu nad wodą. Rano statek zawija do kolejnego miasta, a wieczorem można wrócić na pokład i cieszyć się komfortem rejsu. Ten kierunek jest dobry zarówno na krótki urlop, jak i dłuższą podróż dla par, rodzin oraz osób, które chcą poznać kilka krajów w jednym wyjeździe.',
  },
  {
    slug: 'europe',
    previousDescription:
      'Europa oferuje niezwykłą różnorodność tras rejsowych: od słonecznego Morza Śródziemnego, przez greckie wyspy, aż po skandynawskie fiordy i miasta nad Bałtykiem. Rejs to wygodny sposób, aby w czasie jednej podróży odwiedzić kilka krajów i portów. Poznaj aktualne rejsy po Europie.',
    description:
      'Europa oferuje niezwykłą różnorodność tras rejsowych — od słonecznego Morza Śródziemnego i greckich wysp po skandynawskie fiordy, miasta nad Bałtykiem oraz atlantyckie wybrzeża. Rejs jest wygodnym sposobem, aby w czasie jednej podróży odwiedzić kilka krajów, bez konieczności organizowania transportu i kolejnych noclegów. Każdy port może być początkiem spaceru po historycznym centrum, wycieczki kulinarnej albo dnia spędzonego na plaży. Europejskie rejsy są dobrym wyborem przez większą część roku i pozwalają dopasować długość oraz charakter podróży do własnego stylu wypoczynku.',
  },
  {
    slug: 'bahamas',
    previousDescription:
      'Bahamy to idealny kierunek na rejs dla osób marzących o białych plażach, krystalicznej wodzie i swobodnej atmosferze wysp. Podczas podróży można odkrywać kolorowe porty, korzystać z wodnych atrakcji i odpoczywać w karaibskim rytmie. Sprawdź aktualne rejsy na Bahamy i wybierz swoją trasę.',
    description:
      'Bahamy kuszą białymi plażami, krystalicznie czystą wodą i spokojnym tempem wyspiarskiego życia. Rejs pozwala odwiedzić kilka wysp podczas jednej podróży, korzystać z kąpieli, sportów wodnych i wycieczek do miejsc, które najlepiej pokazują karaibską przyrodę. W portach można wybrać relaks na plaży, pływanie z maską lub spacer po pastelowych uliczkach Nassau i innych miejscowości. To kierunek idealny dla osób szukających słońca, lekkiego wypoczynku i krótkiego, efektownego urlopu na morzu.',
  },
  {
    slug: 'north-america',
    previousDescription:
      'Rejs po Ameryce Północnej to połączenie wielkich miast, spektakularnych wybrzeży i różnorodnych kultur. Trasy prowadzą między innymi do portów USA i Kanady, pozwalając zobaczyć zarówno tętniące życiem metropolie, jak i spokojniejsze nadmorskie regiony. Sprawdź aktualne rejsy po Ameryce Północnej i zaplanuj podróż z UdanyRejs.',
    description:
      'Rejs po Ameryce Północnej łączy energię wielkich miast z różnorodnością wybrzeży Stanów Zjednoczonych i Kanady. W zależności od sezonu trasy prowadzą wzdłuż wschodniego lub zachodniego wybrzeża, do portów pełnych historii, nowoczesnej architektury i lokalnych smaków. Podczas jednej podróży można zobaczyć zarówno tętniące życiem metropolie, jak i spokojniejsze nadmorskie miejscowości oraz naturalne krajobrazy. To kierunek dla osób, które lubią aktywne zwiedzanie, miejskie atrakcje i komfortową bazę noclegową zawsze pod ręką.',
  },
  {
    slug: 'south-america',
    previousDescription:
      'Ameryka Południowa to kierunek pełen kontrastów: od tętniących życiem miast, przez tropikalne wybrzeża, po majestatyczne krajobrazy Patagonii. Rejs pozwala poznać różnorodne kultury, lokalne smaki i porty, które są doskonałym punktem wyjścia do odkrywania kontynentu. Zobacz aktualne rejsy po Ameryce Południowej.',
    description:
      'Ameryka Południowa to kierunek pełen kontrastów: od tętniących życiem miast Brazylii i Argentyny, przez tropikalne wybrzeża, po surowe krajobrazy Patagonii. Rejs pozwala wygodnie poznać różnorodne kultury, lokalną kuchnię i porty, które są świetnym punktem wyjścia do dalszego zwiedzania. Trasy mogą prowadzić przez Rio de Janeiro, Montevideo, Buenos Aires, chilijskie fiordy albo okolice Ziemi Ognistej. To propozycja dla ciekawych świata podróżników, którzy chcą połączyć egzotyczną wyprawę z wygodą pobytu na statku.',
  },
];

export class ExpandDestinationDescriptions1789300000000
  implements MigrationInterface
{
  name = 'ExpandDestinationDescriptions1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const destination of destinationDescriptions) {
      await queryRunner.query(
        'UPDATE "destination" SET "description" = $1 WHERE "slug" = $2',
        [destination.description, destination.slug],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const destination of destinationDescriptions) {
      await queryRunner.query(
        'UPDATE "destination" SET "description" = $1 WHERE "slug" = $2 AND "description" = $3',
        [
          destination.previousDescription,
          destination.slug,
          destination.description,
        ],
      );
    }
  }
}
