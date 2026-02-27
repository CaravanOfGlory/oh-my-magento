import type { Hooks, PluginInput } from "@opencode-ai/plugin"
import { existsSync, readFileSync, readdirSync } from "fs"
import { join } from "path"
import { log } from "../../shared"

interface MagentoProjectInfo {
  magentoVersion?: string
  phpVersion?: string
  edition?: string
  isHyva: boolean
  customModuleCount: number
}

function detectMagentoProject(projectRoot: string): MagentoProjectInfo | null {
  const composerJsonPath = join(projectRoot, "composer.json")
  if (!existsSync(composerJsonPath)) return null

  try {
    const composerJson = JSON.parse(readFileSync(composerJsonPath, "utf-8"))
    const deps = composerJson.require ?? {}

    const isMagento =
      "magento/product-community-edition" in deps ||
      "magento/product-enterprise-edition" in deps ||
      "magento/magento2-base" in deps

    if (!isMagento) return null

    const magentoVersion =
      deps["magento/product-community-edition"] ??
      deps["magento/product-enterprise-edition"] ??
      deps["magento/magento2-base"] ??
      undefined

    const edition = deps["magento/product-enterprise-edition"]
      ? "enterprise"
      : "community"

    const phpVersion = deps.php ?? undefined

    const isHyva =
      "hyva-themes/magento2-default-theme" in deps ||
      "hyva-themes/magento2-theme-module" in deps

    let customModuleCount = 0
    const appCodePath = join(projectRoot, "app", "code")
    if (existsSync(appCodePath)) {
      try {
        const vendors = readdirSync(appCodePath, { withFileTypes: true })
        for (const vendor of vendors) {
          if (vendor.isDirectory()) {
            const modules = readdirSync(join(appCodePath, vendor.name), { withFileTypes: true })
            customModuleCount += modules.filter((m) => m.isDirectory()).length
          }
        }
      } catch {
        // not critical
      }
    }

    return { magentoVersion, phpVersion, edition, isHyva, customModuleCount }
  } catch {
    return null
  }
}

export function createMagentoContextInjectorHook(ctx: PluginInput): Hooks {
  const injectedSessions = new Set<string>()
  let cachedInfo: MagentoProjectInfo | null | undefined

  const getProjectInfo = (): MagentoProjectInfo | null => {
    if (cachedInfo !== undefined) return cachedInfo
    cachedInfo = detectMagentoProject(ctx.directory)
    if (cachedInfo) {
      log("[magento-context-injector] Detected Magento project", cachedInfo)
    }
    return cachedInfo
  }

  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string },
    ): Promise<void> => {
      const toolName = input.tool?.toLowerCase()
      if (toolName !== "write" && toolName !== "read" && toolName !== "edit" && toolName !== "bash") return

      if (injectedSessions.has(input.sessionID)) return

      const info = getProjectInfo()
      if (!info) return

      injectedSessions.add(input.sessionID)

      const parts: string[] = ["[Magento Project Context]"]
      if (info.edition) parts.push(`Edition: ${info.edition}`)
      if (info.magentoVersion) parts.push(`Version: ${info.magentoVersion}`)
      if (info.phpVersion) parts.push(`PHP: ${info.phpVersion}`)
      parts.push(`Frontend: ${info.isHyva ? "Hyv\u00e4 (Alpine.js + Tailwind)" : "Luma (jQuery + KnockoutJS)"}`)
      if (info.customModuleCount > 0) parts.push(`Custom modules: ${info.customModuleCount}`)

      output.message = parts.join("\n")
    },
  }
}
