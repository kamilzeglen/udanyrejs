set -euo pipefail

cd "${1:?Project directory required}"
test -d .deploy
exec 9>.deploy/lock
flock -n 9 || exit 0

protected=$(mktemp)
trap 'rm -f -- "$protected"' EXIT

for pointer in .deploy/current .deploy/latest-attempt; do
  if [[ -s "$pointer" ]]; then
    release=$(cat "$pointer")
    for manifest in "$release/images.env" "$release/previous.env"; do
      if [[ -s "$manifest" ]]; then
        while IFS='=' read -r key reference; do
          docker image inspect --format '{{.Id}}' "$reference" >> "$protected"
        done < "$manifest"
      fi
    done
  fi
done

docker ps -aq | while read -r container; do
  docker inspect --format '{{.Image}}' "$container"
done >> "$protected"

cutoff=$(date -u -d '14 days ago' +%s)
docker image ls --filter label=pl.udanyrejs.application=true --format '{{.ID}}' --no-trunc | sort -u | while read -r candidate; do
  if grep -Fxq "$candidate" "$protected"; then
    continue
  fi
  created=$(docker image inspect --format '{{.Created}}' "$candidate")
  if [[ $(date -d "$created" +%s) -ge "$cutoff" ]]; then
    continue
  fi
  docker image inspect --format '{{range .RepoTags}}{{println .}}{{end}}' "$candidate" | while read -r tag; do
    if [[ -n "$tag" ]]; then
      docker image rm "$tag" || true
    fi
  done
  docker image rm "$candidate" 2>/dev/null || true
done

if [[ -d backups ]]; then
  find backups -maxdepth 1 -type f -name 'udanyrejs-*.sql.gz' -printf '%f\n' | sort -r | tail -n +8 | while read -r backup; do
    find backups -maxdepth 1 -type f -name "$backup" -mtime +14 -delete
  done
fi
