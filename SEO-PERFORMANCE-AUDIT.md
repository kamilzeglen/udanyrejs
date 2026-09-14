# Audyt SEO, wydajności i cache

Data: 14.09.2026. Zakres: kod Angular/NestJS, produkcyjny build oraz lokalny Nginx z plikami tego buildu. Bez wdrożenia, pomiarów ruchu produkcyjnego i zmian bazy danych.

## Wprowadzone poprawki

| Obszar | Problem | Zmiana |
| --- | --- | --- |
| JavaScript | Wspólny moduł importował 35 modułów NG-ZORRO, mimo wykorzystania pięciu. | Pozostawiono button, card, form, image i input. Kompilacja wszystkich szablonów przechodzi. |
| robots.txt | Plik był dostępny pod `/assets/robots.txt`, poza lokalizacją odczytywaną przez roboty. | Publikacja `/robots.txt` i `/sitemap.xml` przez katalog `public`; stare adresy przekierowują przez 301. |
| Sitemap | Inna domena niż `WEB_URL`, adres logowania i duplikat strony głównej. | Zgodność z aktualnym `environment.prod.ts`: `https://udanyrejs.kamilzeglen.pl`; wyłącznie kanoniczne strony publiczne. |
| Canonical | Parametry śledzące, fragmenty i warianty terminów tworzyły odrębne adresy. | Oczyszczanie URL; `/offers` wskazuje `/`; kolejne strony zachowują `?page=N`; JSON-LD używa tego samego adresu co canonical. |
| Metadane | Zdjęcie poprzedniej oferty pozostawało po przejściu do strony bez zdjęcia. | Czyszczenie Open Graph, Twitter i danych strukturalnych poprzedniej strony. |
| Indeksowanie panelu | Brak zakazu indeksowania w odpowiedzi HTTP dla panelu i stron technicznych. | `X-Robots-Tag: noindex, nofollow` dla admin, login, error, share i kontaktu dotyczącego konkretnej oferty. Robot może pobrać stronę i odczytać ten nagłówek. |
| Paginacja | Zmiana parametru strony przez historię przeglądarki nie pobierała wyników i nie odświeżała metadanych. | Wspólna obsługa kategorii i numeru strony, walidacja numeru, brak powtórnego pobierania identycznej strony oraz zamykanie subskrypcji. |
| Cache słowników | Powtórne pobieranie firm, kategorii i kierunków przez wiele komponentów. | Cache w pamięci aplikacji, współdzielenie trwającego GET i TTL pięć minut od odpowiedzi. |
| Unieważnianie | Ryzyko pozostawienia starych słowników po edycji. | Udany zapis lub usunięcie przez `CommonHttpService` czyści cache. Błędy nie są cachowane; spóźnione zapytanie sprzed edycji nie odtwarza wpisu cache. |
| Nginx | Brak kompresji i polityki dla zwykłych zasobów. | Gzip z `Vary: Accept-Encoding`; zasoby `/assets/` mają godzinny cache z rewalidacją, wersjonowane pliki buildu zachowują roczny cache immutable, HTML wymaga rewalidacji. |
| Brakujące pliki | Fallback SPA mógł odpowiadać HTML-em ze statusem 200 dla brakującego zasobu. | Brakujące obrazy, skrypty i inne rozpoznawane zasoby otrzymują 404. |
| SQL | Zapytania strony i liczby wyników zawsze dołączały kategorie i kierunki, mnożąc wiersze. | JOIN-y tylko przy użyciu odpowiedniego filtra. Dodatkowe sortowanie po ID terminu stabilizuje strony przy identycznej cenie/dacie. |

Cache słowników działa w jednej instancji aplikacji w przeglądarce. Zmiany z innej karty, innego administratora lub synchronizacji zostaną pobrane przy kolejnym odczycie po upływie TTL; nie jest to automatyczne odświeżanie otwartego ekranu. Cache ma trzy możliwe klucze. Ceny, wyniki wyszukiwania, logi i dane uwierzytelniania nie zostały objęte tym cache.

Zdjęcia API mogą być nadpisywane pod tym samym adresem. Nie nadano im długiego cache immutable; wymagałoby to wersjonowania adresów zdjęć.

## Wyniki weryfikacji

| Pomiar | Przed ograniczeniem importów | Po wszystkich poprawkach |
| --- | --- | --- |
| Początkowe pliki buildu Angular | 2,90 MB | 2,25 MB |
| Szacowany transfer tych plików przez Angular CLI | 513,12 kB | 401,42 kB |

Spadek szacowanego transferu wynosi około 22%. To rozmiar zasobów, a nie pomiar czasu ładowania lub Core Web Vitals. Oba porównywane buildy używały konfiguracji produkcyjnej.

- Frontend: 146 testów przeszło w Chrome Headless; regresje SEO, cache i paginacji odtworzono również przed poprawkami.
- API: 152 testy przeszły. Pełny zestaw uwzględnia też równoległe zmiany projektu poza tym audytem.
- Build produkcyjny frontendu i build API przeszły.
- Lint całego frontendu oraz zmienionego serwisu ofert i jego testów w API przeszedł.
- `nginx -t` przeszedł w lokalnym obrazie `nginx:1.27-alpine`.
- `node web/scripts/verify-serving.mjs` przeszedł z jednorazowym kontenerem Nginx na `http://127.0.0.1:18086`. Sprawdza treść i typ plików SEO, zgodność domeny sitemap z konfiguracją, przekierowania, noindex, gzip i jego treść, nagłówki cache, ETag/304 oraz 404 zasobów.

Skrypt serwowania przyjmuje alternatywny adres serwera jako pierwszy argument i wymaga aktualnego buildu w `web/dist/web/browser`. Przy zmianie domeny należy zaktualizować również oba pliki w `web/public`; skrypt wykrywa rozbieżność.

## Pozostałe ograniczenia i kolejność dalszych prac

1. **SSR lub prerender publicznych stron.** Nginx nadal zwraca powłokę SPA. Treść ofert i ich metadane powstają po wykonaniu JavaScriptu. Roboty podglądów społecznościowych mogą ich nie odczytać. Pełne rozwiązanie wymaga dostosowania kodu korzystającego z przeglądarki oraz sposobu uruchamiania frontendu.
2. **Dynamiczna sitemap ofert i kategorii oraz prawdziwe 404 stron.** Obecna mapa zawiera strony statyczne. Nieznany adres aplikacji nadal trafia do routera SPA, którego wildcard przekierowuje do ofert. Docelowo sitemap powinna wynikać z opublikowanych ofert, a brakujące oferty zwracać status HTTP 404.
3. **Dalsze zmniejszanie zasobów.** Globalny CSS nadal obejmuje pełne style NG-ZORRO, a wspólny moduł importuje szeroki zestaw Angular Material. Moment i moment-timezone powodują ostrzeżenia CommonJS. Rozdzielenie stylów i zależności panelu od publicznych stron wymaga kontroli wyglądu i działania formularzy dat.
4. **Pomiary bazy i indeksy.** Wykonać `EXPLAIN (ANALYZE, BUFFERS)` wyszukiwania na reprezentatywnych danych. Nie mierzono opóźnień SQL i nie dodawano indeksów na podstawie samego kodu. Pobieranie pełnych relacji do kart ofert nadal zasługuje na analizę wielkości odpowiedzi.
5. **Cache wyników API dopiero z regułami unieważniania.** Ewentualny cache cen i dostępności musi uwzględniać edycję, aktywację terminów, importy i synchronizację. Przy wielu procesach wymaga wspólnego magazynu lub innego mechanizmu spójności.
6. **Weryfikacja po wdrożeniu.** Powtórzyć test nagłówków przez produkcyjny reverse proxy, sprawdzić indeksowanie w Search Console i zebrać LCP/INP/CLS. Nie badano produkcyjnej konfiguracji proxy ani danych rzeczywistych użytkowników.

## Dokumentacja wykorzystana podczas audytu

- [Google: umieszczenie robots.txt w katalogu głównym](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).
- [Google: sitemap i adresy kanoniczne](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- [Google: ograniczenia SEO aplikacji JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- [Nginx: gzip i Vary](https://nginx.org/en/docs/http/ngx_http_gzip_module.html).
- [Nginx: nagłówki cache](https://nginx.org/en/docs/http/ngx_http_headers_module.html).
