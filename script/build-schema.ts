#!/usr/bin/env bun
import { createOhMyMagentoJsonSchema } from "./build-schema-document"

const SCHEMA_OUTPUT_PATH = "assets/oh-my-magento.schema.json"
const DIST_SCHEMA_OUTPUT_PATH = "dist/oh-my-magento.schema.json"

async function main() {
  console.log("Generating JSON Schema...")

  const schema = createOhMyMagentoJsonSchema()
  await Bun.write(SCHEMA_OUTPUT_PATH, JSON.stringify(schema, null, 2))
  await Bun.write(DIST_SCHEMA_OUTPUT_PATH, JSON.stringify(schema, null, 2))
  console.log("✓ oh-my-magento schema generated")
}

main()
