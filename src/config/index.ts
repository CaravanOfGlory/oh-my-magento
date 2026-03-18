export {
  OhMyOpenCodeConfigSchema,
  AgentOverrideConfigSchema,
  AgentOverridesSchema,
  CustomAgentOverridesSchema,
  McpNameSchema,
  AgentNameSchema,
  OverridableAgentNameSchema,
  HookNameSchema,
  BuiltinCommandNameSchema,
  SisyphusAgentConfigSchema,
  ExperimentalConfigSchema,
  RalphLoopConfigSchema,
  TmuxConfigSchema,
  TmuxLayoutSchema,
} from "./schema"

// Backwards-compatible alias
export { OhMyOpenCodeConfigSchema as OhMyMagentoConfigSchema } from "./schema"

export type {
  OhMyOpenCodeConfig,
  AgentOverrideConfig,
  AgentOverrides,
  CustomAgentOverrides,
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
