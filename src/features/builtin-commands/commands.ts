import type { CommandDefinition } from "../claude-code-command-loader"
import { isAgentRegistered } from "../claude-code-session-state"
import type { BuiltinCommandName, BuiltinCommands } from "./types"
import { INIT_DEEP_TEMPLATE } from "./templates/init-deep"
import { RALPH_LOOP_TEMPLATE, ULW_LOOP_TEMPLATE, CANCEL_RALPH_TEMPLATE } from "./templates/ralph-loop"
import { STOP_CONTINUATION_TEMPLATE } from "./templates/stop-continuation"
import { REFACTOR_TEMPLATE } from "./templates/refactor"
import { START_WORK_TEMPLATE } from "./templates/start-work"
import { HANDOFF_TEMPLATE } from "./templates/handoff"
import { REMOVE_AI_SLOPS_TEMPLATE } from "./templates/remove-ai-slops"
import { MAGENTO_UPGRADE_TEMPLATE } from "./templates/magento-upgrade"
import { MAGENTO_NEW_MODULE_TEMPLATE } from "./templates/magento-new-module"
import { MAGENTO_PAYMENT_SETUP_TEMPLATE } from "./templates/magento-payment-setup"
import { HYVA_NEW_THEME_TEMPLATE } from "./templates/hyva-new-theme"
import { HYVA_COMPAT_MODULE_TEMPLATE } from "./templates/hyva-compat-module"

export interface LoadBuiltinCommandsOptions {
  useRegisteredAgents?: boolean
}

function resolveStartWorkAgent(options?: LoadBuiltinCommandsOptions): "atlas" | "sisyphus" {
  if (options?.useRegisteredAgents) {
    return isAgentRegistered("atlas") ? "atlas" : "sisyphus"
  }

  return "atlas"
}

function createBuiltinCommandDefinitions(
  options?: LoadBuiltinCommandsOptions,
): Record<BuiltinCommandName, Omit<CommandDefinition, "name">> {
  return {
    "init-deep": {
      description: "(builtin) Initialize hierarchical AGENTS.md knowledge base",
      template: `<command-instruction>
${INIT_DEEP_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
      argumentHint: "[--create-new] [--max-depth=N]",
    },
     "ralph-loop": {
       description: "(builtin) Start self-referential development loop until completion",
       template: `<command-instruction>
${RALPH_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
       argumentHint: '"task description" [--completion-promise=TEXT] [--max-iterations=N] [--strategy=reset|continue]',
     },
     "ulw-loop": {
        description: "(builtin) Start ultrawork loop - continues until completion with ultrawork mode",
        template: `<command-instruction>
${ULW_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
        argumentHint: '"task description" [--completion-promise=TEXT] [--strategy=reset|continue]',
      },
    "cancel-ralph": {
      description: "(builtin) Cancel active Ralph Loop",
      template: `<command-instruction>
${CANCEL_RALPH_TEMPLATE}
</command-instruction>`,
    },
    refactor: {
      description:
        "(builtin) Intelligent refactoring command with LSP, AST-grep, architecture analysis, codemap, and TDD verification.",
      template: `<command-instruction>
${REFACTOR_TEMPLATE}
</command-instruction>`,
      argumentHint: "<refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]",
    },
    "start-work": {
      description: "(builtin) Start Sisyphus work session from Prometheus plan",
      agent: resolveStartWorkAgent(options),
      template: `<command-instruction>
${START_WORK_TEMPLATE}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
      argumentHint: "[plan-name]",
    },
    "stop-continuation": {
      description: "(builtin) Stop all continuation mechanisms (ralph loop, todo continuation, boulder) for this session",
      template: `<command-instruction>
${STOP_CONTINUATION_TEMPLATE}
</command-instruction>`,
    },
    "remove-ai-slops": {
      description: "(builtin) Remove AI-generated code smells from branch changes and critically review the results",
      template: `<command-instruction>
${REMOVE_AI_SLOPS_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    },
    handoff: {
      description: "(builtin) Create a detailed context summary for continuing work in a new session",
      template: `<command-instruction>
${HANDOFF_TEMPLATE}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
      </user-request>`,
      argumentHint: "[goal]",
    },
    "magento-upgrade": {
      description: "(builtin) Analyze and execute a Magento 2 upgrade workflow",
      template: `<command-instruction>
${MAGENTO_UPGRADE_TEMPLATE}
</command-instruction>`,
      argumentHint: '"2.4.8" [--dry-run] [--module=Vendor_Module]',
    },
    "magento-new-module": {
      description: "(builtin) Scaffold a new Magento 2 module",
      template: `<command-instruction>
${MAGENTO_NEW_MODULE_TEMPLATE}
</command-instruction>`,
      argumentHint: '"Vendor_Module" [--with-api] [--with-admin] [--with-frontend] [--with-db] [--with-hyva] [--with-all]',
    },
    "magento-payment-setup": {
      description: "(builtin) Set up a Magento 2 payment gateway integration",
      template: `<command-instruction>
${MAGENTO_PAYMENT_SETUP_TEMPLATE}
</command-instruction>`,
      argumentHint: '"gateway-name" [--sandbox-only] [--hyva-only] [--hosted]',
    },
    "hyva-new-theme": {
      description: "(builtin) Create a new Hyva child theme for Magento 2",
      template: `<command-instruction>
${HYVA_NEW_THEME_TEMPLATE}
</command-instruction>`,
      argumentHint: '"Vendor/theme-name" [--with-overrides] [--color-primary=#HEX] [--color-secondary=#HEX]',
    },
    "hyva-compat-module": {
      description: "(builtin) Create a Hyva compatibility module for a Luma-dependent extension",
      template: `<command-instruction>
${HYVA_COMPAT_MODULE_TEMPLATE}
</command-instruction>`,
      argumentHint: '"Vendor_Module" [--output=Vendor_HyvaCompatModule] [--templates-only] [--dry-run]',
    },
  }
}

export function loadBuiltinCommands(
  disabledCommands?: BuiltinCommandName[],
  options?: LoadBuiltinCommandsOptions,
): BuiltinCommands {
  const builtinCommandDefinitions = createBuiltinCommandDefinitions(options)
  const disabled = new Set(disabledCommands ?? [])
  const commands: BuiltinCommands = {}

  for (const [name, definition] of Object.entries(builtinCommandDefinitions)) {
    if (!disabled.has(name as BuiltinCommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition
    }
  }

  return commands
}
