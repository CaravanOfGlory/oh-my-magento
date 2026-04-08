import { beforeEach } from "bun:test"
import { _resetForTesting as resetClaudeSessionState } from "./src/features/claude-code-session-state/state"
import { _resetForTesting as resetModelFallbackState } from "./src/hooks/model-fallback/hook"
import { _resetMemCacheForTesting as resetConnectedProvidersCache } from "./src/shared/connected-providers-cache"
import { resetServerCheck } from "./src/shared/tmux/tmux-utils"

const SERVER_RUNNING_KEY = Symbol.for("oh-my-magento:server-running-in-process")

beforeEach(() => {
  resetClaudeSessionState()
  resetModelFallbackState()
  resetConnectedProvidersCache()
  resetServerCheck()
  delete (globalThis as Record<symbol, unknown>)[SERVER_RUNNING_KEY]
})
