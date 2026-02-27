import type { Hooks, PluginInput } from "@opencode-ai/plugin"
import { isAbsolute, normalize, resolve, relative } from "path"
import { log } from "../../shared"

const VENDOR_WARNING =
  "[Magento Vendor Guard] You are about to modify a file inside vendor/. " +
  "Changes to vendor/ will be lost on next `composer install`. " +
  "Consider creating a plugin, preference, or patch instead. " +
  "If you are intentionally patching vendor/ (e.g. for debugging), proceed with caution."

function resolveFilePath(directory: string, filePath: string): string {
  return normalize(isAbsolute(filePath) ? filePath : resolve(directory, filePath))
}

function isVendorPath(resolvedPath: string, projectRoot: string): boolean {
  const rel = relative(projectRoot, resolvedPath)
  return rel.startsWith("vendor/") || rel.startsWith("vendor\\")
}

export function createMagentoVendorGuardHook(ctx: PluginInput): Hooks {
  return {
    "tool.execute.before": async (
      input: { tool: string; sessionID: string; callID: string },
      output: { args: Record<string, unknown>; message?: string },
    ): Promise<void> => {
      const toolName = input.tool?.toLowerCase()
      if (toolName !== "write" && toolName !== "edit") return

      const filePath = (output.args?.filePath ?? output.args?.path ?? output.args?.file_path ?? output.args?.file) as string | undefined
      if (!filePath) return

      const resolvedPath = resolveFilePath(ctx.directory, filePath)
      if (!isVendorPath(resolvedPath, ctx.directory)) return

      log("[magento-vendor-guard] Warning: vendor/ file modification detected", {
        tool: toolName,
        filePath,
        resolvedPath,
      })

      output.message = VENDOR_WARNING
    },
  }
}
