#!/usr/bin/env bun
import { createOhMyMagentoJsonSchema, createOhMyOpenCodeJsonSchema } from "./build-schema-document"

async function main() {
  console.log("Generating JSON Schema...")

  // Generate oh-my-magento schema (our primary)
  const magentoSchema = createOhMyMagentoJsonSchema()
  await Bun.write("assets/oh-my-magento.schema.json", JSON.stringify(magentoSchema, null, 2))
  await Bun.write("dist/oh-my-magento.schema.json", JSON.stringify(magentoSchema, null, 2))
  console.log("✓ oh-my-magento schema generated")

  // Generate oh-my-opencode schema (for compatibility)
  const opencodeSchema = createOhMyOpenCodeJsonSchema()
  await Bun.write("assets/oh-my-opencode.schema.json", JSON.stringify(opencodeSchema, null, 2))
  await Bun.write("dist/oh-my-opencode.schema.json", JSON.stringify(opencodeSchema, null, 2))
  console.log("✓ oh-my-opencode schema generated")
}

main()
