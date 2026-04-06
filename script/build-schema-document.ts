import { z } from "zod"
import { OhMyMagentoConfigSchema } from "../src/config/schema"

export function createOhMyMagentoJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(OhMyMagentoConfigSchema)

  return {
    ...jsonSchema,
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/caravanglory/oh-my-magento/dev/assets/oh-my-magento.schema.json",
    title: "Oh My Magento Configuration",
    description: "Configuration schema for oh-my-magento plugin",
  }
}
