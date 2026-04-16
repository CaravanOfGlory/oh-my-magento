/**
 * Fork-specific CLI commands for oh-my-magento.
 *
 * All commands unique to our fork live here so upstream merges only
 * touch a single `registerForkCommands(program)` call in cli-program.ts,
 * not the command definitions themselves.
 */
import type { Command } from "commander"
import { copilotXCli } from "./copilot-x"
import { createUsageCommand } from "./usage"

export const FORK_COMMAND_NAMES = ["copilot-x", "usage"] as const

export function registerForkCommands(program: Command): void {
  program
    .command("copilot-x")
    .description("Manage multiple GitHub Copilot accounts")
    .addHelpText("after", `
Examples:
  $ bunx oh-my-magento copilot-x

This command provides an interactive CLI for managing GitHub Copilot accounts:
  - Add account (OAuth) - GitHub device flow authentication
  - Add account (manual) - Paste token directly
  - Import from auth.json - Auto-detect from OpenCode
  - Check models - View available & disabled models
  - Refresh identity - Update usernames & orgs
  - Switch account - Change active Copilot account
  - Remove account - Delete a stored account
  - Remove all accounts - Destructive cleanup
`)
    .action(async () => {
      const exitCode = await copilotXCli()
      process.exit(exitCode)
    })

  program.addCommand(createUsageCommand())
}
