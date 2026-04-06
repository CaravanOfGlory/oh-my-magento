import { zodToJsonSchema } from "zod-to-json-schema"
import { OhMyMagentoConfigSchema } from "../src/config/schema"

export function createOhMyMagentoJsonSchema(): Record<string, unknown> {
  const jsonSchema = zodToJsonSchema(OhMyMagentoConfigSchema) as Record<string, unknown>

  return {
    ...jsonSchema,
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/caravanglory/oh-my-openagent/dev/assets/oh-my-magento.schema.json",
    title: "Oh My OpenCode Configuration",
    description: "Configuration schema for oh-my-magento plugin",
  }
}
