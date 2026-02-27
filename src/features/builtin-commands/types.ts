import type { CommandDefinition } from "../claude-code-command-loader"

export type BuiltinCommandName = "init-deep" | "ralph-loop" | "cancel-ralph" | "ulw-loop" | "refactor" | "start-work" | "stop-continuation" | "handoff" | "magento-upgrade" | "magento-new-module" | "magento-payment-setup" | "hyva-new-theme" | "hyva-compat-module"

export interface BuiltinCommandConfig {
  disabled_commands?: BuiltinCommandName[]
}

export type BuiltinCommands = Record<string, CommandDefinition>
