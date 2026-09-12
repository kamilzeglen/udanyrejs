set -euo pipefail

missing=""

check_required() {
  file="$1"
  shift
  for key in "$@"; do
    if ! grep -qE "^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*=" "$file"; then
      missing="${missing} ${file}:${key}"
    fi
  done
}

check_required ./api/.env JWT_SECRET DATABASE_HOST DATABASE_USERNAME DATABASE_PASSWORD DATABASE_NAME APP_PORT WEB_URL SCRAPER_URL SCRAPER_INTERNAL_TOKEN
check_required ./scraper/.env INTERNAL_TOKEN ALLOWED_SCRAPE_HOSTS

if [ -n "$missing" ]; then
  echo "Brak wymaganych zmiennych:${missing}" >&2
  echo "Usługi nie wystartują bez nich. Uzupełnij pliki na VPS i uruchom wdrożenie ponownie." >&2
  exit 1
fi

if grep -qE "^[[:space:]]*(export[[:space:]]+)?JWT_SECRET[[:space:]]*=[[:space:]]*\"?change-me-to-a-long-random-secret\"?[[:space:]]*$" ./api/.env; then
  echo "JWT_SECRET w ./api/.env ma wciąż wartość domyślną z .env.example." >&2
  echo "Ustaw prawdziwy sekret na serwerze i uruchom wdrożenie ponownie." >&2
  exit 1
fi

if grep -qE "^[[:space:]]*(export[[:space:]]+)?INTERNAL_TOKEN[[:space:]]*=[[:space:]]*\"?change-me-to-a-long-random-secret\"?[[:space:]]*$" ./scraper/.env; then
  echo "INTERNAL_TOKEN w ./scraper/.env ma wciąż wartość domyślną z .env.example." >&2
  echo "Ustaw prawdziwy sekret (zgodny z SCRAPER_INTERNAL_TOKEN w api/.env) i uruchom wdrożenie ponownie." >&2
  exit 1
fi
