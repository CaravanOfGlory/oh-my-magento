import type { PluginInput } from "@opencode-ai/plugin"
import { createDevMetricsCollector } from "./hook"

export interface DevMetricsCollectorHookConfig {
  dbPath?: string
}

export function createDevMetricsCollectorHook(
  ctx: PluginInput,
  config: DevMetricsCollectorHookConfig = {}
) {
  const collector = createDevMetricsCollector(ctx, config)

  return {
    name: "dev-metrics-collector",

    async onSessionCreated(sessionId: string, directory: string): Promise<void> {
      await collector.handleSessionCreated(sessionId, directory)
    },

    async onSessionDeleted(sessionId: string, directory: string): Promise<void> {
      await collector.handleSessionDeleted(sessionId, directory)
    },
  }
}

export { createDevMetricsCollector } from "./hook"
export type { DevMetricsCollector } from "./hook"
