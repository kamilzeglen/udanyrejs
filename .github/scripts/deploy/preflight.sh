set -euo pipefail

missing=""

for key in JWT_SECRET DATABASE_HOST DATABASE_USERNAME DATABASE_PASSWORD DATABASE_NAME APP_PORT WEB_URL; do
  if ! grep -qE "^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*=" ./api/.env; then
    missing="${missing} ${key}"
  fi
done

if [ -n "$missing" ]; then
  echo "Brak wymaganych zmiennych w ./api/.env:${missing}" >&2
  echo "API nie wystartuje bez nich. Uzupełnij plik na VPS i uruchom wdrożenie ponownie." >&2
  exit 1
fi

if grep -qE "^[[:space:]]*(export[[:space:]]+)?JWT_SECRET[[:space:]]*=[[:space:]]*\"?change-me-to-a-long-random-secret\"?[[:space:]]*$" ./api/.env; then
  echo "JWT_SECRET w ./api/.env ma wciąż wartość domyślną z .env.example." >&2
  echo "Ustaw prawdziwy sekret na serwerze i uruchom wdrożenie ponownie." >&2
  exit 1
fi
