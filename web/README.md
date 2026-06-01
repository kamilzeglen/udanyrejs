# Udany Rejs Web

Frontend application for the Udany Rejs cruise offer platform. The web app lets users browse cruise offers, view offer details, filter available trips, share offers, and send contact requests. It also includes an authenticated admin panel for managing offers, companies, ships, categories, destinations, uploaded assets, and logs.

The project is built with Angular, TypeScript, SCSS, NgRx, Angular Material, and NG-ZORRO.

## Tech Stack

- Angular 18
- TypeScript
- SCSS
- RxJS
- NgRx Store and Effects
- Angular Material
- NG-ZORRO
- ng-select
- Docker and Nginx for production serving

## Features

- Public cruise offer listing
- Offer filtering and category-based browsing
- Offer details pages with images and ship information
- Contact form, including offer-specific contact requests
- Share tracking route integration
- Login flow using API-issued auth cookies
- Protected admin panel
- Admin CRUD screens for offers, companies, ships, categories, and destinations
- Admin log list
- Image and PDF upload flows through the API
- Responsive UI built with Angular components and SCSS

## Requirements

- Node.js 18 or newer
- npm
- Running Udany Rejs API instance

## Installation

Clone the repository and go to the web application directory:

```bash
cd web
```

Install dependencies:

```bash
npm install
```

If your npm version reports peer dependency conflicts, use:

```bash
npm install --legacy-peer-deps
```

## Environment Configuration

This Angular application uses build-time environment files instead of a runtime `.env` file.

Environment files are located in:

```text
src/environments/
  environment.ts
  environment.prod.ts
  environment.dev.ts
  environment.local.ts
```

For local development, update `src/environments/environment.ts`:

```ts
export const environment = {
  PRODUCTION: false,
  WEB_URL: 'http://localhost:4200',
  API_URL: 'http://localhost:5006',
};
```

For production builds, update `src/environments/environment.prod.ts`:

```ts
export const environment = {
  PRODUCTION: true,
  WEB_URL: 'https://your-frontend-domain.com',
  API_URL: 'https://your-api-domain.com',
};
```

### Variable Reference

| Variable | Description |
| --- | --- |
| `PRODUCTION` | Indicates whether the build targets a production environment. |
| `WEB_URL` | Public frontend URL used when generating links, for example contact offer links. |
| `API_URL` | Backend API base URL used by HTTP services and image/PDF asset URLs. |

Make sure the API CORS configuration allows the selected `WEB_URL`.

## Running the Application

Start the development server:

```bash
npm start
```

The application is available by default at:

```text
http://localhost:4200
```

Start the app on port `3006`:

```bash
npm run start:prod
```

Start the app on the current local network IP:

```bash
npm run start:localnet
```

This script detects the machine IP from the Wi-Fi or Ethernet interface and starts Angular with that host.

## Build

Create a production build:

```bash
npm run build
```

The compiled application is written to:

```text
dist/web/browser
```

Watch for changes and rebuild in development mode:

```bash
npm run watch
```

## Tests

Run unit tests with Karma:

```bash
npm test
```

## Main Routes

Public routes:

- `/` - offer list
- `/offers` - offer list
- `/offers/:category` - category-filtered offer list
- `/offers/details/:offerId` - offer details
- `/login` - admin login
- `/contact` - contact form
- `/contact/:offerId` - contact form for a selected offer
- `/about-us` - about page
- `/rules` - rules page
- `/share/:platform/:offerId` - share tracking route

Admin routes:

- `/admin/offers` - offer list
- `/admin/offers/add` - create offer
- `/admin/offers/edit/:offerId` - edit offer
- `/admin/companies` - company list
- `/admin/companies/add` - create company
- `/admin/companies/edit/:companyId` - edit company
- `/admin/ships` - ship list
- `/admin/ships/add` - create ship
- `/admin/ships/edit/:shipId` - edit ship
- `/admin/categories` - category list
- `/admin/categories/add` - create category
- `/admin/categories/edit/:categoryId` - edit category
- `/admin/destinations` - destination list
- `/admin/destinations/add` - create destination
- `/admin/destinations/edit/:destinationId` - edit destination
- `/admin/logs` - application logs

Admin routes are protected by the app auth guard and require a valid API session.

## API Integration

HTTP services use `environment.API_URL` as the backend base URL. The frontend expects the API to expose endpoints for:

- Authentication
- Offers
- Companies
- Ships
- Categories
- Destinations
- Image files
- PDF files
- Email contact requests
- Share statistics
- Logs

Uploaded images are loaded from API static routes such as:

```text
{API_URL}/offers/images/{fileName}
{API_URL}/ships/images/{fileName}
{API_URL}/companies/images/{fileName}
```

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Angular development server. |
| `npm run start:prod` | Start Angular development server on port `3006`. |
| `npm run start:localnet` | Start Angular on the current local network IP. |
| `npm run build` | Build the production application. |
| `npm run watch` | Rebuild on file changes using the development configuration. |
| `npm test` | Run unit tests with Karma. |

## Docker

The web app includes a multi-stage Dockerfile:

1. Builds the Angular app with Node.js 18.
2. Serves the compiled files with Nginx.

The root `docker-compose.yml` builds this service from the `web` directory and exposes it on port `3006`.

Run from the repository root:

```bash
docker compose up --build
```

The Nginx configuration serves Angular routes through `index.html`, so deep links such as `/offers/details/:offerId` work after page refresh.

## Project Structure

```text
web/
  nginx/              Nginx configuration for Docker serving
  src/
    app/
      _core/          Core services, HTTP clients, and guards
      _interfaces/    Shared TypeScript interfaces
      _shared/        Shared UI and helper code
      _state/         NgRx actions, reducers, selectors, and effects
      layout/         Global layout components
      layout-admin/   Protected admin panel
      layout-user/    Public user-facing pages
    assets/           Static frontend assets
    environments/     Angular build-time configuration
  Dockerfile
  angular.json
  package.json
```

## Notes for Public Repository Usage

- Do not commit production-only URLs or private service details if the repository is meant to be reused by others.
- Keep local and production API URLs clearly documented in environment files.
- Make sure the API and web app cookie/CORS settings use matching domains.
- Run a production build before publishing deployment changes.
- Review seeded admin credentials in the API before exposing a public demo.
