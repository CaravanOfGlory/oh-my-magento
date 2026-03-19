import * as p from "@clack/prompts"
import color from "picocolors"

import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs"

import { getOmoConfigPath } from "../config-manager/config-context"
import { ensureConfigDirectoryExists } from "../config-manager/ensure-config-directory-exists"
import { formatErrorWithSuggestion } from "../config-manager/format-error-with-suggestion"
import { deepMergeRecord } from "../config-manager/deep-merge-record"
import { parseJsonc } from "../../shared"

const MINIMAX_PROVIDER = "minimax-cn-coding-plan"
const MINIMAX_MODELS = ["MiniMax-M2.7", "MiniMax-M2.7-highspeed"] as const
type MinimaxModel = (typeof MINIMAX_MODELS)[number]

interface ModelAssignment {
  agents: string[]
  categories: string[]
}

interface ExistingConfig {
  agents?: Record<string, { model?: string }>
  categories?: Record<string, { model?: string }>
}

function buildAssignments(config: ExistingConfig): Map<string, ModelAssignment> {
  const map = new Map<string, ModelAssignment>()

  for (const [agent, cfg] of Object.entries(config.agents ?? {})) {
    const model = cfg.model
    if (!model) continue
    const entry = map.get(model) ?? { agents: [], categories: [] }
    entry.agents.push(agent)
    map.set(model, entry)
  }

  for (const [cat, cfg] of Object.entries(config.categories ?? {})) {
    const model = cfg.model
    if (!model) continue
    const entry = map.get(model) ?? { agents: [], categories: [] }
    entry.categories.push(cat)
    map.set(model, entry)
  }

  return map
}

function isEmptyOrWhitespace(content: string): boolean {
  return content.trim().length === 0
}

function hintForModel(_model: string, assignments: ModelAssignment): string {
  const parts: string[] = []
  if (assignments.agents.length) parts.push(`agents: ${assignments.agents.join(", ")}`)
  if (assignments.categories.length) parts.push(`categories: ${assignments.categories.join(", ")}`)
  return parts.join("  ")
}

export async function runMinimaxTui(): Promise<number> {
  p.intro(color.bgMagenta(color.black(" Minimax Model Replacement ")))

  // Step 1: pick Minimax model
  const minimaxModel = await p.select<MinimaxModel>({
    message: "Select Minimax model to replace with:",
    options: MINIMAX_MODELS.map((m) => ({
      value: m,
      label: m,
      hint: m === "MiniMax-M2.7-highspeed" ? "Premium plan required" : "Basic plan",
    })),
    initialValue: "MiniMax-M2.7",
  })
  if (p.isCancel(minimaxModel)) {
    p.outro(color.dim("Aborted."))
    return 0
  }

  const qualifiedModel = `${MINIMAX_PROVIDER}/${minimaxModel}`

  // Step 2: load existing config
  const configPath = getOmoConfigPath()
  let config: ExistingConfig = {}
  if (existsSync(configPath)) {
    try {
      const stat = statSync(configPath)
      if (stat.size > 0) {
        const content = readFileSync(configPath, "utf-8")
        if (!isEmptyOrWhitespace(content)) {
          const parsed = parseJsonc<ExistingConfig>(content)
          if (parsed && typeof parsed === "object") config = parsed
        }
      }
    } catch {
      // ignore, use empty config
    }
  }

  const assignments = buildAssignments(config)
  const models = Array.from(assignments.keys()).sort()

  if (models.length === 0) {
    p.log.warn("No models found in config — nothing to replace.")
    p.outro(color.dim("Done."))
    return 0
  }

  // Step 3: multiselect which models to replace
  const selected = await p.multiselect({
    message: `Replace with ${color.cyan(qualifiedModel)} (select models to swap):`,
    options: models.map((m) => ({
      value: m,
      label: m,
      hint: hintForModel(m, assignments.get(m)!),
    })),
    required: false,
  })
  if (p.isCancel(selected)) {
    p.outro(color.dim("Aborted."))
    return 0
  }
  if (!selected || (Array.isArray(selected) && selected.length === 0)) {
    p.outro(color.dim("No models selected — nothing changed."))
    return 0
  }

  // Step 4: build patch
  const patch: ExistingConfig = {}

  for (const model of selected as string[]) {
    const assign = assignments.get(model)
    if (!assign) continue

    for (const agent of assign.agents) {
      if (!patch.agents) patch.agents = {}
      patch.agents[agent] = { model: qualifiedModel }
    }

    for (const cat of assign.categories) {
      if (!patch.categories) patch.categories = {}
      patch.categories[cat] = { model: qualifiedModel }
    }
  }

  // Step 5: write config
  try {
    ensureConfigDirectoryExists()
  } catch (err) {
    console.error(formatErrorWithSuggestion(err, "create config directory"))
    return 1
  }

  try {
    if (existsSync(configPath)) {
      const stat = statSync(configPath)
      const content = readFileSync(configPath, "utf-8")

      if (stat.size > 0 && !isEmptyOrWhitespace(content)) {
        try {
          const existing = parseJsonc<Record<string, unknown>>(content)
          if (existing && typeof existing === "object" && !Array.isArray(existing)) {
            const merged = deepMergeRecord(existing as Record<string, unknown>, patch as Partial<Record<string, unknown>>)
            writeFileSync(configPath, JSON.stringify(merged, null, 2) + "\n")
          } else {
            writeFileSync(configPath, JSON.stringify(patch, null, 2) + "\n")
          }
        } catch {
          writeFileSync(configPath, JSON.stringify(patch, null, 2) + "\n")
        }
      } else {
        writeFileSync(configPath, JSON.stringify(patch, null, 2) + "\n")
      }
    } else {
      writeFileSync(configPath, JSON.stringify(patch, null, 2) + "\n")
    }
  } catch (err) {
    console.error(formatErrorWithSuggestion(err, "write oh-my-magento config"))
    return 1
  }

  p.log.success(
    `Replaced ${color.yellow(String(selected.length))} model(s) → ${color.cyan(qualifiedModel)} in ${color.dim(configPath)}`
  )
  p.outro(color.dim("Done."))
  return 0
}
