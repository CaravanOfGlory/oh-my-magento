import type { BuiltinSkill } from "../types"

export const magentoUpgradeAnalysisSkill: BuiltinSkill = {
  name: "magento-upgrade-analysis",
  description:
    "Magento 2 upgrade impact analysis — deprecated API detection, breaking change inventory, module-by-module migration planning",
  template: `# Magento 2 Upgrade Analysis

You perform systematic upgrade impact analysis for Magento 2 version migrations. Focus on identifying breaking changes, deprecated APIs, and generating module-by-module migration plans.

## Analysis Workflow
1. **Inventory**: Scan all custom modules under app/code/ and list them
2. **Dependency Map**: For each module, identify Magento core dependencies (di.xml preferences, plugins, class extends, layout references)
3. **Deprecation Check**: Cross-reference each dependency against known deprecations for the target version
4. **Impact Classification**: Rate each module as HIGH / MEDIUM / LOW impact
5. **Migration Plan**: Generate ordered migration steps per module

## Deprecated Patterns (2.4.6 → 2.4.7 → 2.4.8)

### PHP Version Requirements
- 2.4.6: PHP 8.1, 8.2
- 2.4.7: PHP 8.2, 8.3
- 2.4.8: PHP 8.3, 8.4 (minimum 8.3)

### Key Breaking Changes 2.4.7+
- \`Magento\\Framework\\DB\\Adapter\\Pdo\\Mysql\` — deprecated methods removed
- \`Zend_*\` classes fully removed (migrated to \`Laminas\\*\` since 2.4.4, but shims removed)
- jQuery UI widgets deprecated in favor of native JS / Alpine.js (Hyvä)
- \`Magento\\Framework\\Serialize\\Serializer\\Serialize\` → use \`Json\` serializer
- REST API: several v1 endpoints deprecated, v2 introduced
- GraphQL schema changes: deprecated fields removed
- Elasticsearch 7 removed, OpenSearch required
- RequireJS bundling changes for Luma

### Key Breaking Changes 2.4.8+
- PHP 8.3 minimum; PHP 8.4 dynamic property deprecations enforced
- MySQL 8.0 minimum; MariaDB 10.6 minimum
- Composer 2.7+ required
- Several \`@api\` interfaces changed signature (check adobe devdocs changelog)
- CSP (Content Security Policy) strict mode by default
- Admin 2FA cannot be disabled in production

## Impact Classification Criteria
- **HIGH**: Module extends/overrides core class that changed, or uses removed API
- **MEDIUM**: Module uses deprecated API that still works but will be removed next version
- **LOW**: Module has no direct core dependency changes, only needs PHP compat check

## Output Format
For each custom module, produce:
\`\`\`
Module: Vendor_ModuleName
Impact: HIGH | MEDIUM | LOW
Dependencies:
  - Magento\\Catalog\\Model\\Product (extends) → [status]
  - Magento\\Checkout\\Block\\Cart (plugin) → [status]
Breaking Changes:
  - [specific API/class change description]
Migration Steps:
  1. [ordered step]
  2. [ordered step]
Estimated Effort: X hours
\`\`\`

## Human-in-the-Loop Protocol
For HIGH impact modules:
1. Present analysis and proposed changes BEFORE making any edits
2. Wait for explicit approval on the migration strategy
3. Apply changes one module at a time
4. Run \`bin/magento setup:di:compile\` after each module to verify
`,
}
