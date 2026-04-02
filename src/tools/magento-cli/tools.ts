import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { spawn } from "child_process"
import { ALLOWED_MAGENTO_COMMANDS } from "./types"
import type { MagentoCliResult } from "./types"

function runMagentoCli(projectRoot: string, command: string, args: string[]): Promise<MagentoCliResult> {
  return new Promise((resolve) => {
    const fullCommand = `bin/magento ${command} ${args.join(" ")}`.trim()
    const start = Date.now()
    const child = spawn("php", ["bin/magento", command, ...args], {
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

export function createMagentoCliTool(ctx: PluginInput): Record<string, ToolDefinition> {
  const magentoCli: ToolDefinition = tool({
    description:
      "Execute Magento 2 CLI commands (bin/magento). " +
      "Only allowed safe commands are permitted (cache, indexer, setup, module, deploy, dev, config, cron, maintenance, info, store). " +
      "Use this instead of running bin/magento directly via shell.",
    args: {
      command: tool.schema
        .enum(ALLOWED_MAGENTO_COMMANDS as unknown as [string, ...string[]])
        .describe("The Magento CLI command to execute"),
      args: tool.schema
        .array(tool.schema.string())
        .optional()
        .describe("Additional arguments for the command (e.g. module names, flags)"),
      project_root: tool.schema
        .string()
        .optional()
        .describe("Magento project root directory. Defaults to current working directory."),
    },
    execute: async (params) => {
      const projectRoot = params.project_root ?? ctx.directory
      const commandArgs = params.args ?? []

      const result = await runMagentoCli(projectRoot, params.command, commandArgs)

      const output = [`$ ${result.command}`, `Exit code: ${result.exitCode} (${result.duration}ms)`]
      if (result.stdout) output.push(`\nOutput:\n${result.stdout}`)
      if (result.stderr) output.push(`\nStderr:\n${result.stderr}`)

      return output.join("\n")
    },
  })

  return { magento_cli: magentoCli }
}
