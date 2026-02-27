import { z } from "zod"

export const MagentoConfigSchema = z.object({
  /** Magento version (e.g. "2.4.8") */
  magento_version: z.string().optional(),
  /** Magento edition: community (CE) or enterprise (EE) */
  edition: z.enum(["community", "enterprise"]).optional(),
  /** PHP version used by the project (e.g. "8.3") */
  php_version: z.string().optional(),
  /** Path to the composer binary (default: "composer") */
  composer_path: z.string().optional(),
  /** Magento project root directory (default: plugin ctx.directory) */
  project_root: z.string().optional(),
})

export type MagentoConfig = z.infer<typeof MagentoConfigSchema>
