#!/bin/bash
# Preview a new resume, confirm, and publish it to the live site.
#
#   ./update-resume.sh                     uses ~/Documents/Thrishank Kuntimaddi Resume.pdf
#   ./update-resume.sh path/to/resume.pdf  uses another file
#
# Nothing is published unless you answer "y" after seeing the preview.
set -euo pipefail
cd "$(dirname "$0")"

SRC="${1:-$HOME/Documents/Thrishank Kuntimaddi Resume.pdf}"

[ -f "$SRC" ] || { echo "Resume not found: $SRC"; exit 1; }
[ "$(head -c 4 "$SRC")" = "%PDF" ] || { echo "That file is not a PDF: $SRC"; exit 1; }

echo "Opening a preview of: $SRC"
echo "Close the preview window (or press Esc) to continue."
qlmanage -p "$SRC" >/dev/null 2>&1 || true

read -r -p "Publish this resume to the live site? [y/N] " ANS
case "$ANS" in y|Y|yes|YES) ;; *) echo "Cancelled. Nothing was changed."; exit 0 ;; esac

mkdir -p resume
cp "$SRC" resume/Thrishank-Kuntimaddi-Resume.pdf
# First page as an image, so the on-site preview works on every phone and browser.
sips -s format jpeg -s formatOptions 86 -Z 1700 "$SRC" --out resume/preview.jpg >/dev/null
printf '{ "updated": "%s" }\n' "$(date +%Y-%m-%d)" > resume/meta.json

git add resume
if git diff --cached --quiet; then
  echo "The live resume is already this version. Nothing to publish."
  exit 0
fi
git commit -q -m "Update resume ($(date +%Y-%m-%d))"
git push -q
echo "Published. It will be live in about a minute."
