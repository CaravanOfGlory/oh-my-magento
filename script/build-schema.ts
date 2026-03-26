#!/usr/bin/env bun
import { createOhMyMagentoJsonSchema, createOhMyMagentoJsonSchema } from "./build-schema-document"

async function main() {
  console.log("Generating JSON Schema...")

  // Generate oh-my-magento schema (our primary)
  const magentoSchema = createOhMyMagentoJsonSchema()
  await Bun.write("assets/oh-my-magento.schema.json", JSON.stringify(magentoSchema, null, 2))
  await Bun.write("dist/oh-my-magento.schema.json", JSON.stringify(magentoSchema, null, 2))
  console.log("✓ oh-my-magento schema generated")

  // Generate oh-my-magento schema (for compatibility)
  const opencodeSchema = createOhMyMagentoJsonSchema()
  await Bun.write("assets/oh-my-magento.schema.json", JSON.stringify(opencodeSchema, null, 2))
  await Bun.write("dist/oh-my-magento.schema.json", JSON.stringify(opencodeSchema, null, 2))
  console.log("✓ oh-my-magento schema generated")
}

main()
