import type { BuiltinSkill } from "../types"

export const magentoDebuggingSkill: BuiltinSkill = {
  name: "magento-debugging",
  description: "Magento 2 debugging — log analysis, Xdebug, DI compilation errors, layout debug, and common error resolution",
  template: `# Magento 2 Debugging Expert

You help diagnose and resolve Magento 2 issues systematically.

## Log Locations
- **System log**: \`var/log/system.log\`
- **Exception log**: \`var/log/exception.log\`
- **Debug log**: \`var/log/debug.log\` (enable in Stores > Config > Advanced > Developer)
- **Cron log**: \`var/log/cron.log\`
- **Report files**: \`var/report/\` (500 error detail files)
- **Apache/Nginx**: \`/var/log/apache2/error.log\` or \`/var/log/nginx/error.log\`

## Common Error Patterns

### DI Compilation Errors
\`\`\`bash
bin/magento setup:di:compile
\`\`\`
- "Incompatible argument type": Check constructor signature matches parent/interface
- "Non-existent class": Missing use statement or wrong namespace
- "Area code not set": Need \`$state->setAreaCode()\` before bootstrapping

### Layout/Template Issues
\`\`\`bash
# Enable template path hints
bin/magento dev:template-hints:enable

# Check layout XML merge result
bin/magento dev:layout-xml:dump frontend default catalog_product_view
\`\`\`
- Block not showing: Check \`cacheable="false"\` isn't killing FPC
- Template not found: Verify module/theme fallback path
- Layout XML errors: Validate against XSD

### Cache-Related Issues
\`\`\`bash
bin/magento cache:flush            # Nuclear option
bin/magento cache:clean            # Gentler, respects tags
rm -rf generated/code generated/metadata  # Clear compiled DI
rm -rf var/cache var/page_cache var/view_preprocessed
\`\`\`

### Database Issues
\`\`\`bash
# Check schema status
bin/magento setup:db:status

# Apply pending patches/schema
bin/magento setup:upgrade --keep-generated

# Declarative schema diff
bin/magento setup:db-declaration:generate-whitelist --module-name=Vendor_Module
\`\`\`

## Xdebug Setup
\`\`\`ini
; php.ini
xdebug.mode=debug
xdebug.start_with_request=trigger
xdebug.client_host=host.docker.internal  ; if using Docker
xdebug.client_port=9003
\`\`\`
Use \`XDEBUG_TRIGGER=1\` cookie/query param for on-demand debugging.

## Performance Debugging
\`\`\`bash
bin/magento dev:query-log:enable    # MySQL query log
bin/magento dev:profiler:enable     # Built-in profiler
\`\`\`

## Systematic Debug Approach
1. Check \`var/log/exception.log\` first
2. Enable developer mode: \`bin/magento deploy:mode:set developer\`
3. Clear all caches and generated code
4. Run \`setup:di:compile\` to catch DI issues
5. Check \`var/report/\` for detailed error traces
6. Use \`bin/magento --verbose\` for CLI command debugging
`,
}
