#!/usr/bin/env bash
# Fix platform package.json for npm warnings

PACKAGES_DIR="/Users/hu/Projects/oh-my-magento/packages"

for dir in "$PACKAGES_DIR"/*/; do
  pkgname=$(basename "$dir")
  pkg_file="$dir/package.json"
  
  echo "Fixing $pkgname..."
  
  # Determine binary name (Windows needs .exe)
  if [[ "$pkgname" == windows-* ]]; then
    binary="bin/oh-my-magento.exe"
  else
    binary="bin/oh-my-magento"
  fi
  
  cat > "$pkg_file" << PKGJSON
{
  "name": "oh-my-magento-$pkgname",
  "version": "0.1.1",
  "description": "Platform-specific binary for oh-my-magento ($pkgname)",
  "license": "SUL-1.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/CaravanOfGlory/oh-my-magento.git"
  },
  "files": [
    "bin"
  ],
  "bin": {
    "oh-my-magento": "$binary"
  }
}
PKGJSON
done

echo "✅ All platform packages fixed!"
