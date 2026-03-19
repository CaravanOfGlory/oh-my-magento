export {
  OhMyOpenCodeConfigSchema,
} from "./schema"

// Backwards-compatible alias
export { OhMyOpenCodeConfigSchema as OhMyMagentoConfigSchema } from "./schema"

export type {
  OhMyOpenCodeConfig,
  AgentOverrideConfig,
  AgentOverrides,
  McpName,
  AgentName,
  HookName,
  BuiltinCommandName,
  SisyphusAgentConfig,
  ExperimentalConfig,
  DynamicContextPruningConfig,
  RalphLoopConfig,
  TmuxConfig,
  TmuxLayout,
  SisyphusConfig,
  SisyphusTasksConfig,
  RuntimeFallbackConfig,
  FallbackModels,
  CopilotAccountSwitcherConfig,
} from "./schema"

// Backwards-compatible alias
export type { OhMyOpenCodeConfig as OhMyMagentoConfig } from "./schema"
