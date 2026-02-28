#!/usr/bin/env bash
# Fix platform package.json files

PACKAGES_DIR="/Users/hu/Projects/oh-my-magento/packages"

for dir in "$PACKAGES_DIR"/*/; do
  pkgname=$(basename "$dir")
  pkg_file="$dir/package.json"
  
  echo "Fixing $pkgname..."
  
  cat > "$pkg_file" << PKGJSON
{
  "name": "oh-my-magento-$pkgname",
  "version": "0.1.0",
  "description": "Platform-specific binary for oh-my-magento ($pkgname)",
  "license": "SUL-1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/CaravanOfGlory/oh-my-magento"
  },
  "files": [
    "bin"
  ],
  "bin": {
    "oh-my-magento": "./bin/oh-my-magento"
  }
}
PKGJSON
done

echo "✅ All platform packages fixed!"
