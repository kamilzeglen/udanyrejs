set -euo pipefail

RELEASE_DIR=$(realpath "${1:?Release directory required}")
test -s "$RELEASE_DIR/previous.env"
exec 9>.deploy/lock
flock -w 60 9
docker compose --project-directory "$PWD" --env-file "$RELEASE_DIR/previous.env" -f "$RELEASE_DIR/compose.yml" up -d --no-build --pull never --wait --wait-timeout 180
cp "$RELEASE_DIR/previous.env" "$RELEASE_DIR/images.env"
export RELEASE_DIR
bash "$RELEASE_DIR/scripts/verify.sh"
printf '%s\n' "$RELEASE_DIR" > .deploy/current.tmp
mv .deploy/current.tmp .deploy/current
