#!/usr/bin/env bash
# Rebrand: oh-my-opencode → oh-my-magento, code-yeongyu → CaravanOfGlory
# Preserves @code-yeongyu/ npm scope (dependency references)
#
# Usage: ./rebrand.sh [PROJECT_ROOT]
# Default PROJECT_ROOT: git rev-parse --show-toplevel

set -euo pipefail

ROOT="${1:-$(git rev-parse --show-toplevel)}"
EXCLUDE_DIRS=("node_modules" ".git" "dist" ".bun" "local-ignore" ".opencode/skills/upstream-merge")
TOTAL=0

find_files() {
  find "${ROOT}" -type f \
    \( -name '*.ts' -o -name '*.json' -o -name '*.md' -o -name '*.html' \
       -o -name '*.mjs' -o -name '*.js' -o -name '*.yaml' -o -name '*.yml' \
       -o -name '*.sh' -o -name '*.jsonc' \) \
    -not -path '*/node_modules/*' \
    -not -path '*/.git/*' \
    -not -path '*/dist/*' \
    -not -path '*/.bun/*' \
    -not -path '*/local-ignore/*' \
    -not -path '*/.opencode/skills/upstream-merge/*' \
    -not -name 'CLA.md' \
    -not -name 'signatures'
}

rebrand_file() {
  local file="$1"
  # Step 1: Protect @code-yeongyu/ npm scope by replacing with placeholder
  sed -i '' 's/@code-yeongyu\//@__PRESERVED_NPM_SCOPE__\//g' "$file"

  # Step 2: Apply rebrand replacements
  sed -i '' \
    -e 's/code-yeongyu\/oh-my-opencode/CaravanOfGlory\/oh-my-magento/g' \
    -e 's/code-yeongyu\/oh-my-magento/CaravanOfGlory\/oh-my-magento/g' \
    -e 's/code-yeongyu/CaravanOfGlory/g' \
    -e 's/oh-my-opencode/oh-my-magento/g' \
    -e 's/OhMyOpenCode/OhMyMagento/g' \
    "$file"

  # Step 3: Restore @code-yeongyu/ npm scope
  sed -i '' 's/@__PRESERVED_NPM_SCOPE__\//@code-yeongyu\//g' "$file"
}

echo "Scanning ${ROOT} for rebrand targets..."

while IFS= read -r file; do
  if grep -q 'oh-my-opencode\|OhMyOpenCode' "$file" 2>/dev/null; then
    rebrand_file "$file"
    TOTAL=$((TOTAL + 1))
    echo "  rebranded: ${file#${ROOT}/}"
  elif grep -q 'code-yeongyu' "$file" 2>/dev/null; then
    if grep -v '@code-yeongyu/' "$file" | grep -q 'code-yeongyu' 2>/dev/null; then
      rebrand_file "$file"
      TOTAL=$((TOTAL + 1))
      echo "  rebranded: ${file#${ROOT}/}"
    fi
  fi
done < <(find_files)

echo ""
echo "Done. Rebranded ${TOTAL} files."

# Verification pass
REMAINING=$(grep -rl 'oh-my-opencode\|OhMyOpenCode' "${ROOT}" \
  --include='*.ts' --include='*.json' --include='*.md' --include='*.html' --include='*.mjs' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.bun \
  --exclude-dir=local-ignore --exclude-dir=upstream-merge \
  --exclude=CLA.md --exclude=cla.json 2>/dev/null || true)
if [ -n "$REMAINING" ]; then
  echo ""
  echo "WARNING: stale references found in:"
  echo "$REMAINING"
  exit 1
fi

echo "Verification passed — no stale oh-my-opencode references."
