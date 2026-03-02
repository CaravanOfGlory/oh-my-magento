import * as z from "zod"
import { OhMyMagentoConfigSchema } from "../src/config/schema"

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined
}

function dedupeCustomAgentOverrideSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const rootProperties = asRecord(schema.properties)
  const agentsSchema = asRecord(rootProperties?.agents)
  const builtInAgentProps = asRecord(agentsSchema?.properties)
  const customAgentsSchema = asRecord(rootProperties?.custom_agents)
  const customAdditionalProperties = asRecord(customAgentsSchema?.additionalProperties)

  if (!builtInAgentProps || !customAgentsSchema || !customAdditionalProperties) {
    return schema
  }

  const referenceAgentSchema = asRecord(
    builtInAgentProps.build
      ?? builtInAgentProps.oracle
      ?? builtInAgentProps.explore,
  )

  if (!referenceAgentSchema) {
    return schema
  }

  const defs = asRecord(schema.$defs) ?? {}
  defs.agentOverrideConfig = referenceAgentSchema
  schema.$defs = defs

  customAgentsSchema.additionalProperties = { $ref: "#/$defs/agentOverrideConfig" }

  return schema
}

export function createOhMyMagentoJsonSchema(): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(OhMyMagentoConfigSchema, {
    target: "draft-7",
    unrepresentable: "any",
  })

  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/dev/assets/oh-my-magento.schema.json",
    title: "Oh My OpenCode Configuration",
    description: "Configuration schema for oh-my-magento plugin",
    ...jsonSchema,
  }

  return dedupeCustomAgentOverrideSchema(schema)
}
