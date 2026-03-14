import type { AuthHook } from "@opencode-ai/plugin"

import { log } from "../../shared"

import { readStoreSafe } from "./store"
import { loadOfficialCopilotConfig } from "./copilot-loader"
import { createCopilotRetryingFetch } from "./copilot-network-retry"
import { initiateDeviceFlow, pollDeviceFlow } from "./copilot-device-flow"
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
    methods: [
      {
        type: "oauth" as const,
        label: "GitHub.com",
        authorize: async () => {
          const flow = await initiateDeviceFlow("github.com")
          return {
            url: flow.verificationUri,
            instructions: `Enter code: ${flow.userCode}`,
            method: "auto" as const,
            callback: async () => {
              try {
                const result = await pollDeviceFlow(flow)
                return { type: "success" as const, ...result }
              } catch (error) {
                log("[copilot-auth-hook] device flow failed", { error: String(error) })
                return { type: "failed" as const }
              }
            },
          }
        },
      },
      {
        type: "oauth" as const,
        label: "GitHub Enterprise",
        prompts: [
          {
            type: "text" as const,
            key: "enterpriseUrl",
            message: "GitHub Enterprise URL",
            placeholder: "https://github.example.com",
            validate: (value: string) => {
              if (!value.trim()) return "Enterprise URL is required"
              return undefined
            },
          },
        ],
        authorize: async (inputs?: Record<string, string>) => {
          const enterpriseUrl = inputs?.enterpriseUrl
          const flow = await initiateDeviceFlow("enterprise", enterpriseUrl)
          return {
            url: flow.verificationUri,
            instructions: `Enter code: ${flow.userCode}`,
            method: "auto" as const,
            callback: async () => {
              try {
                const result = await pollDeviceFlow(flow)
                return { type: "success" as const, ...result }
              } catch (error) {
                log("[copilot-auth-hook] enterprise device flow failed", { error: String(error) })
                return { type: "failed" as const }
              }
            },
          }
        },
      },
    ],
  }
}
