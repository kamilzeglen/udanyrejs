# Udany Rejs API

Backend API for the Udany Rejs cruise offer platform. The application manages cruise offers, categories, destinations, companies, ships, uploaded images, offer PDF files, users, authentication, email contact requests, logs, and share statistics.

The project is built with NestJS, PostgreSQL, TypeORM, JWT authentication, and file-based storage for uploaded assets.

## Tech Stack

- Node.js 18+
- NestJS 10
- TypeScript
- PostgreSQL
- TypeORM
- JWT authentication
- Multer file uploads
- Nodemailer / NestJS Mailer
- Docker support

## Features

- Authentication with JWT and HTTP-only cookies
- User, role, company, ship, destination, category, and offer modules
- Offer search and offer activation/deactivation
- Image upload and update support for offers, ships, and companies
- PDF upload and update support for offers
- Static serving for uploaded images
- Contact email endpoint
- Database migrations and seed data
- Health check endpoint

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL database

## Installation

Clone the repository and go to the API directory:

```bash
cd api
```

Install dependencies:

```bash
npm install
```

If your npm version reports peer dependency conflicts, use:

```bash
npm install --legacy-peer-deps
```

Create the local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Create folders for uploaded files:

```bash
mkdir -p files/OFFERS_IMAGES files/SHIPS_IMAGES files/COMPANIES_IMAGES files/OFFERS_PDFS
```

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force files/OFFERS_IMAGES, files/SHIPS_IMAGES, files/COMPANIES_IMAGES, files/OFFERS_PDFS
```

Update `.env` with your local database, JWT, frontend URL, email, and file path settings.

## Environment Variables

Example `.env` file:

```dotenv
APP_ENV=local
APP_PORT=5006
WEB_URL=http://localhost:4200

DAYS_BEFORE_INACTIVE=7

JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRATION_SECONDS=3600

HTTPS_ENABLED=DISABLED
DOMAINS_WHITELIST=localhost

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=udanyrejs
DATABASE_PASSWORD=udanyrejs
DATABASE_NAME=udanyrejs
DB_SYNC=false

MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_USER=noreply@example.com
MAIL_PASSWORD=change-me
MAIL_SECURE=true

OFFERS_IMAGES_PATH=./files/OFFERS_IMAGES
SHIPS_IMAGES_PATH=./files/SHIPS_IMAGES
COMPANIES_IMAGES_PATH=./files/COMPANIES_IMAGES
OFFERS_PDFS_PATH=./files/OFFERS_PDFS
```

### Variable Reference

| Variable | Description |
| --- | --- |
| `APP_ENV` | Application environment name, for example `local` or `production`. |
| `APP_PORT` | Port used by the NestJS server. Defaults to `3000` when empty. |
| `WEB_URL` | Frontend URL allowed by CORS. |
| `DAYS_BEFORE_INACTIVE` | Number of days before selected offer-related inactivity logic applies. |
| `JWT_SECRET` | Secret key used to sign JWT tokens. Use a long random value. |
| `JWT_EXPIRATION_SECONDS` | JWT and auth cookie lifetime in seconds. |
| `HTTPS_ENABLED` | Set to `ENABLED` when cookies should use `secure` and `sameSite=none`. Use `DISABLED` locally. |
| `DOMAINS_WHITELIST` | Cookie domain used by auth responses. For local development, `localhost` is usually enough. |
| `DATABASE_HOST` | PostgreSQL host. |
| `DATABASE_PORT` | PostgreSQL port. |
| `DATABASE_USERNAME` | PostgreSQL user. |
| `DATABASE_PASSWORD` | PostgreSQL password. |
| `DATABASE_NAME` | PostgreSQL database name. |
| `DB_SYNC` | TypeORM schema synchronization flag. Keep `false` when using migrations. |
| `MAIL_HOST` | SMTP host. |
| `MAIL_PORT` | SMTP port. |
| `MAIL_USER` | SMTP username. |
| `MAIL_PASSWORD` | SMTP password. |
| `MAIL_SECURE` | Whether SMTP uses a secure connection. |
| `OFFERS_IMAGES_PATH` | Directory where offer images are stored. |
| `SHIPS_IMAGES_PATH` | Directory where ship images are stored. |
| `COMPANIES_IMAGES_PATH` | Directory where company images are stored. |
| `OFFERS_PDFS_PATH` | Directory where offer PDF files are stored. |

Never commit real `.env` files or production credentials to the repository.

## Database Setup

Create a PostgreSQL user and database for local development:

```sql
CREATE ROLE udanyrejs WITH LOGIN PASSWORD 'udanyrejs';
CREATE DATABASE udanyrejs OWNER udanyrejs;

\c udanyrejs

ALTER SCHEMA public OWNER TO udanyrejs;
GRANT ALL ON SCHEMA public TO udanyrejs;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO udanyrejs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO udanyrejs;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO udanyrejs;
```

Run migrations:

```bash
npm run migration:run
```

The migrations create the schema and seed initial data such as roles, users, companies, ships, categories, and destinations.

## Running the Application

Start the API in development mode:

```bash
npm run start:dev
```

Build the application:

```bash
npm run build
```

Start the compiled production build:

```bash
npm run start:prod
```

When running locally with the example configuration, the API is available at:

```text
http://localhost:5006
```

Health check:

```text
GET /health
```

## API Areas

Main route groups:

- `auth` - register, login, and current user profile
- `user` - user management
- `role` - roles
- `company` - cruise companies
- `ship` - ships
- `destination` - destinations
- `category` - offer categories
- `offers` - offer listing, search, details, create, update, delete, activate, and deactivate
- `image-file` - image upload and update
- `pdf-file` - PDF upload, update, and retrieval
- `email` - contact email sending
- `share` - share statistics
- `log` - application logs

Uploaded images are served from:

- `/offers/images`
- `/ships/images`
- `/companies/images`

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm run start` | Start the NestJS application. |
| `npm run start:dev` | Start the application in watch mode. |
| `npm run build` | Compile the TypeScript project to `dist`. |
| `npm run start:prod` | Run the compiled application from `dist/main`. |
| `npm run lint` | Run ESLint with automatic fixes. |
| `npm run test` | Run unit tests. |
| `npm run test:cov` | Run tests with coverage. |
| `npm run migration:create --name=MigrationName` | Create a new empty migration file. |
| `npm run migration:generate --name=MigrationName` | Generate a migration from entity changes. |
| `npm run migration:run` | Build the project and run pending migrations. |
| `npm run migration:revert` | Revert the last executed migration. |

## Docker

The API includes a Dockerfile and can be run through the root `docker-compose.yml`.

The compose setup expects an `api/.env` file and mounts file storage directories into the backend container:

```text
./files/OFFERS_IMAGES
./files/SHIPS_IMAGES
./files/COMPANIES_IMAGES
./files/OFFERS_PDFS
```

For Docker deployments, set file paths inside `.env` to the container paths used by the compose volumes:

```dotenv
OFFERS_IMAGES_PATH=/api/files/OFFERS_IMAGES
SHIPS_IMAGES_PATH=/api/files/SHIPS_IMAGES
COMPANIES_IMAGES_PATH=/api/files/COMPANIES_IMAGES
OFFERS_PDFS_PATH=/api/files/OFFERS_PDFS
```

Then run from the repository root:

```bash
docker compose up --build
```

## Project Structure

```text
api/
  src/
    migrations/       Database migrations and seed data
    modules/          Feature modules
    templates/        Email templates
    typeorm.ts        TypeORM migration data source
    main.ts           Application bootstrap
  Dockerfile
  package.json
  readme.md
```

## Notes for Public Repository Usage

- Keep `.env` private and publish only `.env.example`.
- Use migrations instead of `DB_SYNC=true` for reliable schema changes.
- Replace local secrets and SMTP credentials before deployment.
- Ensure upload directories are writable by the Node.js process.
- Review seeded users before using the project in a public or production-like environment.
