import type { BuiltinSkill } from "../types"

export const magentoModuleScaffoldSkill: BuiltinSkill = {
  name: "magento-module-scaffold",
  description: "Magento 2 module scaffolding — generates complete module structure following best practices",
  template: `# Magento 2 Module Scaffolding

You are creating a new Magento 2 module. Follow these conventions strictly.

## Module Structure
\`\`\`
app/code/{Vendor}/{Module}/
├── registration.php              # Module registration
├── etc/
│   ├── module.xml                # Module declaration + sequence dependencies
│   ├── di.xml                    # Dependency injection config (global scope)
│   ├── frontend/di.xml           # Frontend-scope DI
│   ├── adminhtml/di.xml          # Admin-scope DI
│   ├── events.xml                # Event observers
│   ├── routes.xml                # Frontend routes (if controller needed)
│   ├── adminhtml/routes.xml      # Admin routes
│   ├── db_schema.xml             # Declarative schema
│   └── db_schema_whitelist.json  # Schema whitelist (generated)
├── Api/
│   ├── {Entity}RepositoryInterface.php   # Service Contract
│   └── Data/{Entity}Interface.php        # Data interface
├── Model/
│   ├── {Entity}.php              # Entity model
│   ├── {Entity}Repository.php    # Repository implementation
│   └── ResourceModel/
│       ├── {Entity}.php          # Resource model
│       └── {Entity}/Collection.php
├── Block/                        # View blocks (Luma) or ViewModels (Hyvä)
├── Controller/                   # Controllers
├── ViewModel/                    # ViewModels (preferred for Hyvä)
├── Plugin/                       # Interceptor plugins
├── Observer/                     # Event observers
├── Setup/Patch/Data/             # Data patches
├── Setup/Patch/Schema/           # Schema patches
└── view/
    ├── frontend/layout/          # Layout XML
    ├── frontend/templates/       # phtml templates
    └── adminhtml/layout/         # Admin layout
\`\`\`

## Key Rules
- **registration.php**: \`ComponentRegistrar::register(ComponentRegistrar::MODULE, '{Vendor}_{Module}', __DIR__)\`
- **module.xml**: Always declare \`<sequence>\` for modules you depend on
- **di.xml**: Use \`<preference>\` to bind interface → implementation, \`<type>\` for constructor args
- **Declarative Schema**: Use db_schema.xml, NOT InstallSchema/UpgradeSchema (deprecated since 2.3)
- **Service Contracts**: Every public API must have an interface in Api/
- **Repository Pattern**: Always implement RepositoryInterface with SearchCriteria support
- **PSR-4**: Namespace = {Vendor}\\{Module}, autoload via composer.json or Magento autoloader
- **composer.json**: Include for marketplace/packagist distribution; declare magento version constraints
`,
}
