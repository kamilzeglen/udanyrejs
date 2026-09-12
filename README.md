# Udany Rejs

Cruise offer platform — a public catalogue of cruises with search, filtering, offer details and contact requests, plus an authenticated admin panel for managing offers, companies, ships, categories, destinations and uploaded assets.

## Authors

| Author | Backend | Frontend |
| :---: | :---: | :---: |
| **Kamil Żegleń** ([kamyrdol32](https://github.com/kamyrdol32)) | 100% | 100% |

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Angular 18, TypeScript, NgRx (Store/Effects/Router-Store), RxJS, Angular Material, NG-ZORRO, ng-select, SCSS |
| Backend | NestJS 10, TypeScript, PostgreSQL, TypeORM (migrations + seeds), JWT + Passport, class-validator, Terminus, Throttler |
| Scraper | Express, Playwright (headless Chromium), internal-token auth, rejsy4you.pl offer/listing extraction |
| Files & Mail | Multer uploads (images, PDFs), static serving, Nodemailer via `@nestjs-modules/mailer` |
| Tooling | Docker, Docker Compose, Nginx, ESLint + Prettier |

## Highlights

- **Public offer catalogue** — offer list, category filtering, detail pages with images, ship and company data, and PDF attachments.
- **Contact flow** — general contact form plus offer-specific requests sent over SMTP from mail templates.
- **Share tracking** — `/share/:platform/:offerId/:termId` route records share statistics per platform and per term before redirecting to that term's offer page; the admin offer list groups terms by route and shows both a per-term breakdown and a route-level total.
- **Admin panel** — protected CRUD for offers, companies, ships, categories and destinations, plus an application log view.
- **Asset management** — image and PDF upload/update per offer, ship and company; files stored on disk and served through API static routes.
- **Cookie-based auth** — JWT issued by the API in an HTTP-only cookie, guarded admin routes on the frontend, role-based users on the backend.
- **Offer lifecycle** — manual activation/deactivation and `DAYS_BEFORE_INACTIVE` handling for stale offers.
- **Offer scraping (rejsy4you.pl)** — a dedicated Playwright-based scraper service. Admins can import a single offer by URL, or bulk-**discover** offers for chosen shipowners (count + allowlist), which land in a review queue (`ScrapedOfferDraft`) for the admin to complete and confirm before they become real offers.
- **Price sync** — a scheduled job re-checks each active offer's source URL and updates cabin prices, deactivating offers whose page has disappeared.

## Architecture

```
┌────────────┐      ┌────────────┐      ┌────────────┐
│    web     │ ───▶ │    api     │ ───▶ │ PostgreSQL │
│ Angular SPA│ HTTP │ NestJS API │      │ (external) │
└────────────┘      └─────┬──────┘      └────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        ┌─────▼──────┐         ┌──────▼──────┐
        │ file store │         │   scraper   │
        └────────────┘         └──────┬──────┘
         (images, PDFs)                │
                                        ▼
                                  rejsy4you.pl
```

- **web** — Angular SPA built and served by Nginx, deep links routed through `index.html`.
- **api** — auth, persistence, offer normalization, uploads, mail and scraper orchestration.
- **scraper** — internal-only Express service (authenticated with a shared token), drives headless Chromium against rejsy4you.pl to scrape single offers and discover offer listings per shipowner.
- **PostgreSQL** — external database, not part of the compose stack.
- Containers publish no host ports; they join the `nginx-proxy-manager_default` network and are exposed by the reverse proxy. `scraper` is reachable only from `api`, over the internal `udanyrejs_default` network.

## Installation

### Requirements

- Docker & Docker Compose
- External PostgreSQL
- Node.js 18+ and npm (local development only)

### Environment Variables

**`api/.env`**

```bash
# --- App ---
APP_ENV=local
APP_PORT=5006
WEB_URL=http://localhost:4200
DAYS_BEFORE_INACTIVE=7

# --- Auth ---
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRATION_SECONDS=3600
HTTPS_ENABLED=DISABLED
DOMAINS_WHITELIST=localhost

# --- Database ---
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=udanyrejs
DATABASE_PASSWORD=udanyrejs
DATABASE_NAME=udanyrejs
DB_SYNC=false

# --- Mail ---
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_USER=noreply@example.com
MAIL_PASSWORD=change-me
MAIL_SECURE=true

# --- File storage ---
OFFERS_IMAGES_PATH=./files/OFFERS_IMAGES
SHIPS_IMAGES_PATH=./files/SHIPS_IMAGES
COMPANIES_IMAGES_PATH=./files/COMPANIES_IMAGES
OFFERS_PDFS_PATH=./files/OFFERS_PDFS

# --- Scraper ---
SCRAPER_URL=http://localhost:5010
SCRAPER_INTERNAL_TOKEN=change-me-to-a-long-random-secret
ALLOWED_SCRAPE_HOSTS=rejsy4you.pl
```

For Docker deployments point the file paths at the mounted container directories, and `SCRAPER_URL` at the compose service name:

```bash
OFFERS_IMAGES_PATH=/api/files/OFFERS_IMAGES
SHIPS_IMAGES_PATH=/api/files/SHIPS_IMAGES
COMPANIES_IMAGES_PATH=/api/files/COMPANIES_IMAGES
OFFERS_PDFS_PATH=/api/files/OFFERS_PDFS
SCRAPER_URL=http://udanyrejs-scraper:5010
```

**`scraper/.env`**

```bash
PORT=5010
INTERNAL_TOKEN=change-me-to-a-long-random-secret # must match api's SCRAPER_INTERNAL_TOKEN
ALLOWED_SCRAPE_HOSTS=rejsy4you.pl
MAX_TERMS_PER_SCRAP=100
MIN_DELAY_MS=2000
MAX_DELAY_MS=5000
MAX_DISCOVERY_PAGES_PER_HOST=20

# Optional: use a locally installed Chrome instead of downloading Playwright's
# bundled Chromium (useful on dev machines without network access to the
# Playwright CDN). Leave unset in the Docker image, which bundles Chromium.
PLAYWRIGHT_CHANNEL=
```

**`web/src/environments/environment.ts`** — the frontend uses build-time environment files, not `.env`:

```ts
export const environment = {
  PRODUCTION: false,
  WEB_URL: 'http://localhost:4200',
  API_URL: 'http://localhost:5006',
};
```

### Run with Docker

```bash
cp api/.env.example api/.env
# fill in the values, then:
docker compose up -d --build
```

Services are reachable through the reverse proxy on the shared `nginx-proxy-manager_default` network.

### Run locally

```bash
cd api && npm install && npm run migration:run && npm run start:dev
cd web && npm install && npm start
cd scraper && npm install && npm run start:dev
```

- App: http://localhost:4200
- API: http://localhost:5006
- Health: http://localhost:5006/health
- Scraper: http://localhost:5010 (internal-only, not meant to be reached directly from the browser)

If npm reports peer dependency conflicts, use `npm install --legacy-peer-deps`.

### Database migrations

```bash
cd api
npm run migration:generate --name=MigrationName
npm run migration:run
```

Migrations create the schema and seed initial data (roles, users, companies, ships, categories, destinations).

## Project Structure

```text
api/      NestJS backend — modules, migrations, mail templates
web/      Angular frontend — public pages, admin panel, NgRx state, Nginx config
scraper/  Express + Playwright service — offer scraping and discovery for rejsy4you.pl
files/    Uploaded images and PDFs mounted into the backend container
```

Per-application details live in [api/readme.md](api/readme.md) and [web/README.md](web/README.md).

## Demo

🔗 **Live:** [udanyrejs.kamilzeglen.pl](https://udanyrejs.kamilzeglen.pl)

## Screenshots

<img width="3840" height="2160" alt="1" src="https://github.com/user-attachments/assets/ac6e1800-a21a-4d3d-80a1-8169c46fb59f" />
<img width="3840" height="2160" alt="2" src="https://github.com/user-attachments/assets/7fe4cbf1-35f1-449a-953d-98388b544b72" />
<img width="3840" height="2160" alt="3" src="https://github.com/user-attachments/assets/257177aa-6d59-4dd1-a2a2-f54c4bd29526" />
<img width="3840" height="2160" alt="4" src="https://github.com/user-attachments/assets/2cc29aeb-b327-4a19-8ec8-52c301af66a8" />
