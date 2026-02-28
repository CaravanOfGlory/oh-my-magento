import * as z from "zod"
import { OhMyMagentoConfigSchema } from "../src/config/schema"

export function createOhMyMagentoJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(OhMyMagentoConfigSchema, {
    target: "draft-7",
    unrepresentable: "any",
  })

  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/master/assets/oh-my-magento.schema.json",
    title: "Oh My Magento Configuration",
    description: "Configuration schema for oh-my-magento plugin",
    ...jsonSchema,
  }
}
