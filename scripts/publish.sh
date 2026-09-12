#!/usr/bin/env bash
# Publish only the public files. Run on the web server with its web-root path.
set -euo pipefail
if [[ $# != 1 ]]; then
  echo "Usage: sudo bash scripts/publish.sh /path/to/existing-web-root" >&2
  exit 1
fi
source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
target_dir="$(realpath -e -- "$1")"
if [[ ! -d "$target_dir" || "$target_dir" == / || "$target_dir" == "$source_dir" || ! -f "$target_dir/index.html" ]]; then
  echo "Expected an existing website directory containing index.html." >&2
  exit 1
fi
files=(index.html styles.css motion.js assets/hole-control-banner.png assets/hole-control-banner-640.webp assets/hole-control-banner-1280.webp assets/hole-control-banner-1920.webp)
for file in "${files[@]}"; do
  [[ -f "$source_dir/$file" && ! -L "$source_dir/$file" ]] || { echo "Missing or symlinked source: $file" >&2; exit 1; }
done
# Backup is a sibling of the web root, never inside publicly served content.
backup_dir="$(mktemp -d -- "${target_dir}.backup.XXXXXX")"
cp -a -- "$target_dir/." "$backup_dir/"
stage_dir="$(mktemp -d -- "${target_dir}.stage.XXXXXX")"
trap 'rm -rf -- "$stage_dir"' EXIT
mkdir -p -- "$stage_dir/assets"
for file in "${files[@]}"; do install -m 644 -- "$source_dir/$file" "$stage_dir/$file"; done
# Publish dependencies first and the page last. No Caddy configuration changes.
install -d -m 755 -- "$target_dir/assets"
for file in "${files[@]:1}"; do
  install -m 644 -- "$stage_dir/$file" "$target_dir/$file"
done
install -m 644 -- "$stage_dir/index.html" "$target_dir/index.html"
for file in "${files[@]}"; do cmp --silent -- "$stage_dir/$file" "$target_dir/$file"; done
printf 'Published and checked all website files. Backup: %s\n' "$backup_dir"
