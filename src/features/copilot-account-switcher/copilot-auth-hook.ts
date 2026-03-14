import type { AuthHook } from "@opencode-ai/plugin"

import { log } from "../../shared"

import { readStoreSafe } from "./store"
import { loadOfficialCopilotConfig } from "./copilot-loader"
import { createCopilotRetryingFetch } from "./copilot-network-retry"
import type { StoreFile, FetchLike } from "./types"

type CopilotAuthState = {
  type: string
  refresh?: string
  access?: string
  expires?: number
  enterpriseUrl?: string
}

type CopilotProviderConfig = {
  models?: Record<string, { id?: string; api: { url?: string; npm?: string }; cost?: unknown }>
}

export function createCopilotAuthHook(options?: {
  loadStore?: () => Promise<StoreFile | undefined>
  createRetryFetch?: (baseFetch: FetchLike) => FetchLike
}): AuthHook {
  const loadStore = options?.loadStore ?? readStoreSafe
  const createRetryFetch = options?.createRetryFetch ?? createCopilotRetryingFetch

  const loader: AuthHook["loader"] = async (getAuth, provider) => {
    const config = await loadOfficialCopilotConfig({
      getAuth: getAuth as () => Promise<CopilotAuthState | undefined>,
      provider: provider as Parameters<typeof loadOfficialCopilotConfig>[0]["provider"],
    })
    if (!config) return {}

    const store = await loadStore().catch(() => undefined)
    if (store?.networkRetryEnabled !== true) {
      return config
    }

    log("[copilot-auth-hook] network retry enabled, wrapping fetch")
    return {
      ...config,
      fetch: createRetryFetch(config.fetch),
    }
  }

  return {
    provider: "github-copilot",
    loader,
    methods: [],
  }
}
