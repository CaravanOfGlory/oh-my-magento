export const MAGENTO_UPGRADE_TEMPLATE = `Perform a Magento 2 version upgrade analysis and execution.

This command will:
1. Scan all custom modules under app/code/ using the magento_module_scanner tool
2. Check current Magento version and target version from composer.json
3. Run the magento-upgrade-analysis skill for each module to classify impact (HIGH/MEDIUM/LOW)
4. Generate a module-by-module migration plan with dependency ordering

HUMAN-IN-THE-LOOP PROTOCOL:
- For HIGH impact modules: Present analysis and proposed changes FIRST, wait for explicit approval
- For MEDIUM impact modules: Present summary, proceed unless user objects
- For LOW impact modules: Apply changes and report

Execution steps:
1. Run magento_module_scanner to inventory modules
2. Run magento_composer with "outdated" to check package versions
3. Load skill "magento-upgrade-analysis" for deprecated pattern detection
4. For each module (ordered by dependency graph):
   a. Analyze core dependencies and breaking changes
   b. Classify impact level
   c. Present findings (pause for HIGH impact)
   d. Apply migrations after approval
   e. Run bin/magento setup:di:compile to verify
5. After all modules: run full setup:upgrade and setup:static-content:deploy

Arguments:
- Target version (e.g. "2.4.8")
- Optional: --dry-run (analysis only, no changes)
- Optional: --module=Vendor_Module (analyze single module)`
