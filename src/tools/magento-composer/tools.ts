import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { spawn } from "child_process"
import { ALLOWED_COMPOSER_COMMANDS } from "./types"
import type { ComposerResult } from "./types"

function runComposer(projectRoot: string, command: string, args: string[]): Promise<ComposerResult> {
  return new Promise((resolve) => {
    const fullCommand = `composer ${command} ${args.join(" ")}`.trim()
    const start = Date.now()
    const child = spawn("composer", [command, "--no-interaction", ...args], {
      cwd: projectRoot,
      timeout: 120_000,
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString()
    })
    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString()
    })

    child.on("close", (code) => {
      resolve({
        command: fullCommand,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? 1,
        duration: Date.now() - start,
      })
    })

    child.on("error", (err) => {
      resolve({
        command: fullCommand,
        stdout: "",
        stderr: err.message,
        exitCode: 1,
        duration: Date.now() - start,
      })
    })
  })
}

export function createMagentoComposerTool(ctx: PluginInput): Record<string, ToolDefinition> {
  const magentoComposer: ToolDefinition = tool({
    description:
      "Execute read-only Composer commands for Magento 2 dependency analysis. " +
      "Only safe, non-destructive commands are allowed (show, info, outdated, depends, validate, audit, etc.). " +
      "Use this to inspect package versions, check compatibility, and analyze dependency trees.",
    args: {
      command: tool.schema
        .enum(ALLOWED_COMPOSER_COMMANDS as unknown as [string, ...string[]])
        .describe("The Composer command to execute"),
      args: tool.schema
        .array(tool.schema.string())
        .optional()
        .describe("Additional arguments (e.g. package names, flags like --direct, --format=json)"),
      project_root: tool.schema
        .string()
        .optional()
        .describe("Magento project root directory. Defaults to current working directory."),
    },
    execute: async (params) => {
      const projectRoot = params.project_root ?? ctx.directory
      const commandArgs = params.args ?? []

      const result = await runComposer(projectRoot, params.command, commandArgs)

      const output = [`$ composer ${params.command}`, `Exit code: ${result.exitCode} (${result.duration}ms)`]
      if (result.stdout) output.push(`\nOutput:\n${result.stdout}`)
      if (result.stderr) output.push(`\nStderr:\n${result.stderr}`)

      return output.join("\n")
    },
  })

  return { magento_composer: magentoComposer }
}
