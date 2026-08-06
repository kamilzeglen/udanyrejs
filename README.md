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
| Files & Mail | Multer uploads (images, PDFs), static serving, Nodemailer via `@nestjs-modules/mailer` |
| Tooling | Docker, Docker Compose, Nginx, ESLint + Prettier |

## Highlights

- **Public offer catalogue** — offer list, category filtering, detail pages with images, ship and company data, and PDF attachments.
- **Contact flow** — general contact form plus offer-specific requests sent over SMTP from mail templates.
- **Share tracking** — `/share/:platform/:offerId` route records share statistics per platform before redirecting.
- **Admin panel** — protected CRUD for offers, companies, ships, categories and destinations, plus an application log view.
- **Asset management** — image and PDF upload/update per offer, ship and company; files stored on disk and served through API static routes.
- **Cookie-based auth** — JWT issued by the API in an HTTP-only cookie, guarded admin routes on the frontend, role-based users on the backend.
- **Offer lifecycle** — manual activation/deactivation and `DAYS_BEFORE_INACTIVE` handling for stale offers.

## Architecture

```
┌────────────┐      ┌────────────┐      ┌────────────┐
│    web     │ ───▶ │    api     │ ───▶ │ PostgreSQL │
│ Angular SPA│ HTTP │ NestJS API │      │ (external) │
└────────────┘      └─────┬──────┘      └────────────┘
                          │
                    ┌─────▼──────┐
                    │ file store │  (images, PDFs)
                    └────────────┘
```

- **web** — Angular SPA built and served by Nginx, deep links routed through `index.html`.
- **api** — auth, persistence, offer normalization, uploads and mail.
- **PostgreSQL** — external database, not part of the compose stack.
- Containers publish no host ports; they join the `nginx-proxy-manager_default` network and are exposed by the reverse proxy.

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
```

For Docker deployments point the file paths at the mounted container directories:

```bash
OFFERS_IMAGES_PATH=/api/files/OFFERS_IMAGES
SHIPS_IMAGES_PATH=/api/files/SHIPS_IMAGES
COMPANIES_IMAGES_PATH=/api/files/COMPANIES_IMAGES
OFFERS_PDFS_PATH=/api/files/OFFERS_PDFS
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
```

- App: http://localhost:4200
- API: http://localhost:5006
- Health: http://localhost:5006/health

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
api/     NestJS backend — modules, migrations, mail templates
web/     Angular frontend — public pages, admin panel, NgRx state, Nginx config
files/   Uploaded images and PDFs mounted into the backend container
```

Per-application details live in [api/readme.md](api/readme.md) and [web/README.md](web/README.md).

## Demo

🔗 **Live:** [udanyrejs.kamilzeglen.pl](https://udanyrejs.kamilzeglen.pl)

## Screenshots

<!--
Add screenshots after first deploy.
Example:
### Offer list
![Offer list](https://i.imgur.com/example.png)
-->
