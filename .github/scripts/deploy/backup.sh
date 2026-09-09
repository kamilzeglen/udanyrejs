set -euo pipefail

read_env() {
  key="$1"
  line=$(grep -E "^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*=" ./api/.env | tail -n 1 || true)

  if [ -z "$line" ]; then
    echo "Brak zmiennej ${key} w ./api/.env." >&2
    exit 1
  fi

  value=${line#*=}
  value=${value%$'\r'}
  value=${value#"${value%%[![:space:]]*}"}

  case "$value" in
    \"*)
      value=${value#\"}
      value=${value%%\"*}
      ;;
    \'*)
      value=${value#\'}
      value=${value%%\'*}
      ;;
    *)
      value=${value%%[[:space:]]#*}
      value=${value%"${value##*[![:space:]]}"}
      ;;
  esac

  printf '%s' "$value"
}

DB_HOST=$(read_env DATABASE_HOST)
DB_USERNAME=$(read_env DATABASE_USERNAME)
DB_PASSWORD=$(read_env DATABASE_PASSWORD)
DB_NAME=$(read_env DATABASE_NAME)

container=$(docker ps --filter "name=^/${DB_HOST}$" --format '{{.Names}}' | head -n 1)

if [ -z "$container" ]; then
  container=$(docker ps --filter "network=postgres_default" --filter "ancestor=postgres" --format '{{.Names}}' | head -n 1)
fi

if [ -z "$container" ]; then
  echo "Nie znaleziono kontenera bazy danych dla DATABASE_HOST=${DB_HOST}."
  exit 1
fi

mkdir -p ./backups
umask 077
dump="./backups/udanyrejs-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"

printf '%s' "$DB_PASSWORD" | docker exec -i "$container" sh -c \
  'export PGPASSWORD="$(cat)"; exec pg_dump -U "$1" -d "$2" --clean --if-exists' \
  sh "$DB_USERNAME" "$DB_NAME" | gzip > "$dump.partial"

if [ ! -s "$dump.partial" ]; then
  echo "Zrzut bazy jest pusty, przerywam wdrożenie: $dump"
  rm -f "$dump.partial"
  exit 1
fi

gzip -t "$dump.partial"
mv "$dump.partial" "$dump"

echo "Backup bazy: $dump ($(du -h "$dump" | cut -f1)), kontener: $container"
