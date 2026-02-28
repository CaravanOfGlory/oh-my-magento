#!/usr/bin/env bash
# Publish all platform-specific packages to npm

set -e

PACKAGES_DIR="/Users/hu/Projects/oh-my-magento/packages"
FAILED_PACKAGES=()

echo "🚀 Publishing platform packages..."
echo ""

for dir in "$PACKAGES_DIR"/*/; do
  pkgname=$(basename "$dir")
  
  # Skip if no binaries
  if [ ! -d "$dir/bin" ] || [ -z "$(ls -A $dir/bin 2>/dev/null)" ]; then
    echo "⚠️  Skipping $pkgname (no binaries)"
    continue
  fi
  
  echo "📦 Publishing $pkgname..."
  
  cd "$dir"
  
  if npm publish --access public; then
    echo "✅ Published $pkgname"
  else
    echo "❌ Failed to publish $pkgname"
    FAILED_PACKAGES+=("$pkgname")
  fi
  
  echo ""
done

cd "$PACKAGES_DIR/.."

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ${#FAILED_PACKAGES[@]} -eq 0 ]; then
  echo "✅ All packages published successfully!"
else
  echo "❌ Failed packages:"
  for pkg in "${FAILED_PACKAGES[@]}"; do
    echo "   - $pkg"
  done
  exit 1
fi
