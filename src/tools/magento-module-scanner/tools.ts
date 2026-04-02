import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { readFile, readdir, stat } from "fs/promises"
import { join, resolve } from "path"
import type { ModuleInfo, ScanResult } from "./types"

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function countPhpFiles(dir: string): Promise<number> {
  let count = 0
  try {
    const entries = await readdir(dir, { withFileTypes: true, recursive: true })
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".php")) {
        count++
      }
    }
  } catch {
    // directory may not exist
  }
  return count
}

async function scanModule(modulePath: string, vendor: string, module: string): Promise<ModuleInfo> {
  const name = `${vendor}_${module}`
  const info: ModuleInfo = {
    name,
    path: modulePath,
    dependencies: [],
    hasPlugins: false,
    hasPreferences: false,
    hasObservers: false,
    hasLayoutOverrides: false,
    hasDbSchema: false,
    phpClasses: 0,
  }

  const moduleXmlPath = join(modulePath, "etc", "module.xml")
  if (await exists(moduleXmlPath)) {
    try {
      const content = await readFile(moduleXmlPath, "utf-8")
      const versionMatch = content.match(/setup_version="([^"]*)"/)
      if (versionMatch) info.version = versionMatch[1]

      const depPattern = /<module\s+name="([^"]*)"\s*\/>/g
      let match: RegExpExecArray | null
      while ((match = depPattern.exec(content)) !== null) {
        info.dependencies.push(match[1])
      }
    } catch {
      // skip parse errors
    }
  }

  const diXmlPaths = [join(modulePath, "etc", "di.xml"), join(modulePath, "etc", "frontend", "di.xml"), join(modulePath, "etc", "adminhtml", "di.xml")]

  for (const diPath of diXmlPaths) {
    if (await exists(diPath)) {
      try {
        const content = await readFile(diPath, "utf-8")
        if (content.includes("<plugin ")) info.hasPlugins = true
        if (content.includes("<preference ")) info.hasPreferences = true
      } catch {
        // skip
      }
    }
  }

  const eventsXmlPath = join(modulePath, "etc", "events.xml")
  if (await exists(eventsXmlPath)) info.hasObservers = true

  const layoutDir = join(modulePath, "view", "frontend", "layout")
  if (await exists(layoutDir)) info.hasLayoutOverrides = true

  const dbSchemaPath = join(modulePath, "etc", "db_schema.xml")
  if (await exists(dbSchemaPath)) info.hasDbSchema = true

  info.phpClasses = await countPhpFiles(modulePath)

  return info
}

async function scanAppCode(projectRoot: string): Promise<ScanResult> {
  const start = Date.now()
  const appCodeDir = join(projectRoot, "app", "code")
  const modules: ModuleInfo[] = []

  if (!(await exists(appCodeDir))) {
    return { modules: [], totalModules: 0, scanDuration: Date.now() - start }
  }

  const vendors = await readdir(appCodeDir, { withFileTypes: true })
  for (const vendor of vendors) {
    if (!vendor.isDirectory()) continue
    const vendorPath = join(appCodeDir, vendor.name)
    const moduleEntries = await readdir(vendorPath, { withFileTypes: true })

    for (const mod of moduleEntries) {
      if (!mod.isDirectory()) continue
      const modulePath = join(vendorPath, mod.name)
      const info = await scanModule(modulePath, vendor.name, mod.name)
      modules.push(info)
    }
  }

  return { modules, totalModules: modules.length, scanDuration: Date.now() - start }
}

function formatScanResult(result: ScanResult): string {
  if (result.totalModules === 0) {
    return `No custom modules found in app/code/ (${result.scanDuration}ms)`
  }

  const lines: string[] = [`Found ${result.totalModules} custom modules (${result.scanDuration}ms)\n`]

  for (const mod of result.modules) {
    const flags = [
      mod.hasPlugins ? "plugins" : null,
      mod.hasPreferences ? "preferences" : null,
      mod.hasObservers ? "observers" : null,
      mod.hasLayoutOverrides ? "layout" : null,
      mod.hasDbSchema ? "db_schema" : null,
    ]
      .filter(Boolean)
      .join(", ")

    lines.push(`${mod.name}${mod.version ? ` v${mod.version}` : ""} (${mod.phpClasses} PHP files)`)
    if (flags) lines.push(`  Features: ${flags}`)
    if (mod.dependencies.length > 0) lines.push(`  Depends: ${mod.dependencies.join(", ")}`)
  }

  return lines.join("\n")
}

export function createMagentoModuleScanner(ctx: PluginInput): Record<string, ToolDefinition> {
  const moduleScanner: ToolDefinition = tool({
    description:
      "Scan Magento 2 project's app/code/ directory to inventory all custom modules. " +
      "Reports module names, dependencies, features (plugins, preferences, observers, layout, db_schema), " +
      "and PHP class count. Useful for upgrade planning and impact analysis.",
    args: {
      project_root: tool.schema
        .string()
        .optional()
        .describe("Magento project root directory. Defaults to current working directory."),
    },
    execute: async (params) => {
      const projectRoot = params.project_root ?? ctx.directory
      try {
        const result = await scanAppCode(resolve(projectRoot))
        return formatScanResult(result)
      } catch (err) {
        return `Error scanning modules: ${err instanceof Error ? err.message : String(err)}`
      }
    },
  })

  return { magento_module_scanner: moduleScanner }
}
