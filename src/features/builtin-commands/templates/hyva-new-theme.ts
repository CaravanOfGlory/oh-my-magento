export const HYVA_NEW_THEME_TEMPLATE = `Create a new Hyva child theme for Magento 2.

This command will:
1. Load skill "hyva-theme" for Hyva theme conventions
2. Create theme directory structure under app/design/frontend/{Vendor}/{theme}/
3. Generate essential theme files:
   - registration.php
   - theme.xml (parent: Hyva/default)
   - etc/view.xml
   - web/tailwind/tailwind.config.js
   - web/tailwind/tailwind-source.css
   - package.json with Tailwind build scripts
4. Set up Tailwind CSS compilation pipeline

Arguments:
- Theme name in Vendor/theme-name format (e.g. "Acme/hyva-custom")
- Optional: --with-overrides (generate common template override stubs for catalog, checkout, customer)
- Optional: --color-primary=#HEX (set primary brand color in Tailwind config)
- Optional: --color-secondary=#HEX (set secondary brand color)

After creation:
1. cd to theme directory
2. Run npm install
3. Run npm run watch for development
4. Run npm run build for production
5. Enable theme: bin/magento content:theme:apply`
