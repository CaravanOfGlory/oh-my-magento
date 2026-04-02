import type { BuiltinSkill } from "../types"

export const magentoPerformanceSkill: BuiltinSkill = {
  name: "magento-performance",
  description: "Magento 2 performance optimization — caching, indexing, query optimization, Varnish, Redis, and profiling",
  template: `# Magento 2 Performance Optimization

You help optimize Magento 2 performance at code, infrastructure, and configuration levels.

## Caching Layers
1. **Full Page Cache (FPC)**: Varnish (recommended) or Built-in
2. **Block Cache**: \`cacheable="false"\` disables FPC for entire page — avoid this
3. **Config/Layout/Collection caches**: \`bin/magento cache:status\`
4. **Redis**: Session storage + default cache backend + FPC backend
5. **OPcache**: PHP bytecode cache — essential for production

## Redis Configuration (env.php)
\`\`\`php
'cache' => [
    'frontend' => [
        'default' => [
            'backend' => 'Magento\\Framework\\Cache\\Backend\\Redis',
            'backend_options' => [
                'server' => '127.0.0.1',
                'port' => '6379',
                'database' => '0',
            ],
        ],
        'page_cache' => [
            'backend' => 'Magento\\Framework\\Cache\\Backend\\Redis',
            'backend_options' => [
                'server' => '127.0.0.1',
                'port' => '6379',
                'database' => '1',
            ],
        ],
    ],
],
\`\`\`

## Query & Collection Optimization
- Always use \`addFieldToFilter()\` before \`load()\` — never load full collection
- Use \`getSelect()->columns()\` to select only needed columns
- Add database indexes for frequently filtered/sorted columns in db_schema.xml
- Use \`SearchCriteriaBuilder\` with repository pattern for API layer
- Avoid \`afterLoad()\` plugins on large collections
- Profile with: \`bin/magento dev:query-log:enable\`

## Indexing Best Practices
- Use "Update on Schedule" mode for all indexers in production
- Custom indexers: implement \`Magento\\Framework\\Indexer\\ActionInterface\`
- Partial reindex for entity-level changes via MView subscriptions
- Monitor: \`bin/magento indexer:status\`, \`bin/magento indexer:show-mode\`

## Code-Level Optimization
- Lazy-load dependencies via \`Proxy\` types in di.xml
- Avoid loading full models when only ID/attribute needed
- Use \`Magento\\Framework\\Api\\SearchCriteriaBuilder\` pagination
- Batch operations in data patches (process 1000 records at a time)
- Avoid \`ObjectManager::getInstance()\` — it bypasses compiled DI

## Production Deployment Checklist
\`\`\`bash
bin/magento deploy:mode:set production
bin/magento setup:di:compile
bin/magento setup:static-content:deploy -j4
bin/magento indexer:reindex
bin/magento cache:flush
\`\`\`

## Key Metrics to Monitor
- TTFB (Time to First Byte) < 200ms with Varnish
- MySQL slow query log (queries > 1s)
- Redis memory usage and eviction policy
- PHP-FPM pool utilization
- Cron execution time and overlap
`,
}
