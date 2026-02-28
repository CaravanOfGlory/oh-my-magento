#!/usr/bin/env bash
# Unpublish platform packages from npm

set -e

PACKAGES=(
  "oh-my-magento-darwin-arm64"
  "oh-my-magento-darwin-x64-baseline"
  "oh-my-magento-linux-arm64"
  "oh-my-magento-linux-arm64-musl"
  "oh-my-magento-linux-x64"
  "oh-my-magento-linux-x64-baseline"
  "oh-my-magento-linux-x64-musl"
  "oh-my-magento-linux-x64-musl-baseline"
  "oh-my-magento-windows-x64-baseline"
)

echo "🗑️  Unpublishing platform packages..."
echo ""

for pkg in "${PACKAGES[@]}"; do
  echo "📦 Unpublishing $pkg@0.1.0..."
  
  if npm unpublish "$pkg@0.1.0" --force; then
    echo "✅ Unpublished $pkg@0.1.0"
  else
    echo "⚠️  Failed to unpublish $pkg@0.1.0 (may not exist)"
  fi
  
  echo ""
done

echo "✅ Done!"
