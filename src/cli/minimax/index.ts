import { Command } from "commander"
import { runMinimaxTui } from "./tui"

export function createMinimaxCommand(): Command {
  const minimax = new Command("minimax")
    .description("Replace configured models with Minimax")
    .addHelpText("after", `
Examples:
  $ bunx oh-my-magento minimax
`)
    .action(async () => {
      const exitCode = await runMinimaxTui()
      process.exit(exitCode)
    })

  return minimax
}
