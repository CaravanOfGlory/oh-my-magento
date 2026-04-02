#!/usr/bin/env bun
import { writeFile } from "node:fs/promises"
import { createOhMyOpenCodeJsonSchema } from "./build-schema-document"

const SCHEMA_OUTPUT_PATH = "assets/oh-my-magento.schema.json"
const DIST_SCHEMA_OUTPUT_PATH = "dist/oh-my-magento.schema.json"

async function main() {
  console.log("Generating JSON Schema...")

  const finalSchema = createOhMyOpenCodeJsonSchema()
  await writeFile(SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))
  await writeFile(DIST_SCHEMA_OUTPUT_PATH, JSON.stringify(finalSchema, null, 2))

  console.log(`✓ JSON Schema generated: ${SCHEMA_OUTPUT_PATH}`)
}

main()
