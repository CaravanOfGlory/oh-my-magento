export const MAGENTO_NEW_MODULE_TEMPLATE = `Scaffold a new Magento 2 module with best-practice structure.

This command will:
1. Load skill "magento-module-scaffold" for module structure conventions
2. Create the full module directory tree under app/code/{Vendor}/{Module}/
3. Generate essential files:
   - registration.php
   - etc/module.xml with proper dependencies
   - etc/di.xml (global scope)
   - composer.json for the module
4. Optionally generate additional components based on flags

Arguments:
- Module name in Vendor_Module format (e.g. "Acme_CustomShipping")
- Optional: --with-api (generate Api/ interfaces + repository)
- Optional: --with-admin (generate adminhtml routes, controllers, layout)
- Optional: --with-frontend (generate frontend routes, controllers, layout)
- Optional: --with-db (generate db_schema.xml + entity model + resource model)
- Optional: --with-hyva (generate Hyva-compatible ViewModels + Alpine.js templates)
- Optional: --with-all (include all optional components)

Follow Magento 2 coding standards:
- PSR-4 autoloading
- Service contracts for all public APIs
- Declarative schema (db_schema.xml)
- Dependency injection via constructor
- Proper module.xml <sequence> declarations`
