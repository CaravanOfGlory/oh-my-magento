export interface MagentoCliResult {
  command: string
  stdout: string
  stderr: string
  exitCode: number
  duration: number
}

export const ALLOWED_MAGENTO_COMMANDS = [
  "cache:clean",
  "cache:flush",
  "cache:status",
  "cache:enable",
  "cache:disable",
  "indexer:reindex",
  "indexer:status",
  "indexer:show-mode",
  "indexer:set-mode",
  "setup:upgrade",
  "setup:di:compile",
  "setup:static-content:deploy",
  "setup:db:status",
  "setup:db-schema:upgrade",
  "setup:db-declaration:generate-whitelist",
  "module:status",
  "module:enable",
  "module:disable",
  "deploy:mode:show",
  "deploy:mode:set",
  "dev:query-log:enable",
  "dev:query-log:disable",
  "dev:template-hints:enable",
  "dev:template-hints:disable",
  "dev:urn-catalog:generate",
  "config:show",
  "cron:run",
  "maintenance:enable",
  "maintenance:disable",
  "maintenance:status",
  "info:adminuri",
  "info:currency:list",
  "info:language:list",
  "store:list",
] as const
