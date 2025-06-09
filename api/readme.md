
---

## 🧱 Environment
```dotenv
APP_ENV=local
API_PORT=""
WEB_URL=""
SCRAPPER_URL=""

JWT_SECRET=
JWT_EXPIRATION=

DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
DB_SYNC=false

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
MAIL_SECURE=true

OFFERS_IMAGES_PATH=
SHIPS_IMAGES_PATH=
COMPANIES_IMAGES_PATH=

OFFERS_PDFS_PATH=

```

## 🧱 Tworzenie użytkownika i bazy danych PostgreSQL od zera

Zaloguj się do PostgreSQL jako `postgres` (np. przez `psql` lub pgAdmin), a następnie wykonaj poniższe polecenia krok po kroku:

```sql
-- [1] Usuwanie starego użytkownika (jeśli istnieje)
REVOKE ALL ON SCHEMA public FROM udanyrejs;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM udanyrejs;
DROP ROLE IF EXISTS udanyrejs;

-- [2] Tworzenie użytkownika i bazy
CREATE ROLE udanyrejs WITH LOGIN PASSWORD 'udanyrejs';
CREATE DATABASE udanyrejs OWNER udanyrejs;

-- [3] Połączenie z nową bazą (jeśli używasz psql)
\c udanyrejs

-- [4] Nadanie pełnych uprawnień użytkownikowi
ALTER SCHEMA public OWNER TO udanyrejs;
GRANT ALL ON SCHEMA public TO udanyrejs;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO udanyrejs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO udanyrejs;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO udanyrejs;
