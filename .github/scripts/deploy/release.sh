set -euo pipefail

RELEASE_DIR=$(realpath "${1:?Release directory required}")
IMAGE_PREFIX=${2:?Image prefix required}
RELEASE_TAG=${3:?Release tag required}
REGISTRY_USER=${4:?Registry user required}
export RELEASE_DIR

declare -A SERVICE_FOR=([api]=udanyrejs-backend [web]=udanyrejs-frontend [scraper]=udanyrejs-scraper)
declare -A ENV_KEY_FOR=([api]=API_IMAGE [web]=WEB_IMAGE [scraper]=SCRAPER_IMAGE)

mkdir -p .deploy
exec 9>.deploy/lock
flock -w 300 9

DOCKER_CONFIG=$(mktemp -d)
export DOCKER_CONFIG
trap 'rm -rf -- "$DOCKER_CONFIG"' EXIT
docker login ghcr.io --username "$REGISTRY_USER" --password-stdin
bash "$RELEASE_DIR/scripts/preflight.sh"

for app in api web scraper; do
  printf '%s=%s-%s:%s\n' "${ENV_KEY_FOR[$app]}" "$IMAGE_PREFIX" "$app" "$RELEASE_TAG"
done > "$RELEASE_DIR/images.env"

compose=(docker compose --project-directory "$PWD" --env-file "$RELEASE_DIR/images.env" -f "$RELEASE_DIR/compose.yml")
"${compose[@]}" config --quiet
"${compose[@]}" pull --policy always

for app in api web scraper; do
  digest=$(docker image inspect --format '{{index .RepoDigests 0}}' "$IMAGE_PREFIX-$app:$RELEASE_TAG")
  if [[ "$digest" != *@sha256:* ]]; then
    echo "Missing image digest for $app" >&2
    exit 1
  fi
  printf '%s=%s\n' "${ENV_KEY_FOR[$app]}" "$digest"
done > "$RELEASE_DIR/images.env.tmp"
mv "$RELEASE_DIR/images.env.tmp" "$RELEASE_DIR/images.env"

for app in api web scraper; do
  service=${SERVICE_FOR[$app]}
  container=$("${compose[@]}" ps --all -q "$service")
  if [[ -z "$container" ]]; then
    echo "Missing existing $service container; use the documented initial installation procedure." >&2
    exit 1
  fi
  previous=$(docker inspect --format '{{.Image}}' "$container")
  printf '%s=%s\n' "${ENV_KEY_FOR[$app]}" "$previous"
done > "$RELEASE_DIR/previous.env"

bash "$RELEASE_DIR/scripts/backup.sh"
if "${compose[@]}" up -d --no-build --pull never --wait --wait-timeout 180 --force-recreate && bash "$RELEASE_DIR/scripts/verify.sh"; then
  printf '%s\n' "$RELEASE_DIR" > .deploy/current.tmp
  mv .deploy/current.tmp .deploy/current
  printf '%s\n' "$RELEASE_DIR" > .deploy/latest-attempt
  echo "Release verified: $RELEASE_TAG"
  exit 0
fi

printf '%s\n' "$RELEASE_DIR" > .deploy/latest-attempt
"${compose[@]}" ps
echo "Deployment failed. Previous image references: $RELEASE_DIR/previous.env" >&2
echo "Check database migration compatibility before running: bash $RELEASE_DIR/scripts/rollback.sh $RELEASE_DIR" >&2
exit 1
