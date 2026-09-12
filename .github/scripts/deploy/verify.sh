set -uo pipefail
compose=(docker compose --project-directory "$PWD" --env-file "$RELEASE_DIR/images.env" -f "$RELEASE_DIR/compose.yml")

api_port=$(grep -E "^[[:space:]]*APP_PORT[[:space:]]*=" ./api/.env | tail -n 1 | cut -d= -f2 | tr -d ' \r"'\''')
api_port=${api_port:-5006}

scraper_port=$(grep -E "^[[:space:]]*PORT[[:space:]]*=" ./scraper/.env | tail -n 1 | cut -d= -f2 | tr -d ' \r"'\''')
scraper_port=${scraper_port:-5010}

check() {
  service="$1"
  port="$2"
  path="$3"
  # wget działa w alpine (api, web); obraz scrapera (playwright jammy) go nie
  # gwarantuje, więc dla niego używamy Node - tak samo jak w jego własnym
  # Dockerfile HEALTHCHECK.
  tool="${4:-wget}"

  for attempt in $(seq 1 20); do
    if [ "$tool" = "node" ]; then
      probe_ok=$("${compose[@]}" exec -T "$service" node -e "require('http').get('http://127.0.0.1:${port}${path}', (r) => { let b=''; r.on('data', c => b+=c); r.on('end', () => { process.stdout.write(b); process.exit(r.statusCode === 200 ? 0 : 1); }); }).on('error', () => process.exit(1))" 2>/dev/null < /dev/null > /tmp/health-check.out && echo ok)
    else
      probe_ok=$("${compose[@]}" exec -T "$service" wget -q -T 5 -O - "http://127.0.0.1:${port}${path}" > /tmp/health-check.out 2>/dev/null < /dev/null && echo ok)
    fi

    if [ "$probe_ok" = "ok" ]; then
      echo "OK ${service}${path} (próba ${attempt}): $(head -c 200 /tmp/health-check.out)"
      return 0
    fi

    sleep 5
  done

  echo "NIEDOSTĘPNE ${service}${path} po 20 próbach."
  return 1
}

failed=0
check udanyrejs-backend "$api_port" /health || failed=1
check udanyrejs-frontend 80 / || failed=1
check udanyrejs-scraper "$scraper_port" /health node || failed=1

if [ "$failed" -ne 0 ]; then
  echo "Stan usług:"
  "${compose[@]}" ps
  echo "--- ostatnie logi ---"
  "${compose[@]}" logs --tail 80
  echo "Wycofanie obrazów: bash $RELEASE_DIR/scripts/rollback.sh $RELEASE_DIR"
  echo "a jeśli wdrożenie zepsuło dane — przywróć ostatni zrzut z ./backups."
  exit 1
fi

echo "Wdrożenie zweryfikowane: API i frontend odpowiadają."
