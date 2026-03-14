import { log } from "../../shared"

import type { AccountEntry, GitHubUserInfo, QuotaSnapshot } from "./types"

const CLIENT_ID = "Ov23li8tweQw6odWQebz"
const OAUTH_POLLING_SAFETY_MARGIN_MS = 3000

export function getGitHubToken(entry: AccountEntry): string {
  const ghPrefixes = ["ghu_", "gho_", "ghp_", "github_pat_"]
  const isGhToken = (t: string) => ghPrefixes.some((p) => t.startsWith(p))

  if (entry.access && isGhToken(entry.access)) return entry.access
  if (entry.refresh && isGhToken(entry.refresh)) return entry.refresh
  if (entry.refresh?.startsWith("ghr_") && entry.access && !entry.access.startsWith("ghr_")) {
    return entry.access
  }
  return entry.refresh || entry.access
}

function normalizeDomain(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function getUrls(domain: string): { DEVICE_CODE_URL: string; ACCESS_TOKEN_URL: string } {
  return {
    DEVICE_CODE_URL: `https://${domain}/login/device/code`,
    ACCESS_TOKEN_URL: `https://${domain}/login/oauth/access_token`,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildSnapshot(raw?: {
  entitlement?: number
  remaining?: number
  used?: number
  unlimited?: boolean
  percent_remaining?: number
}): QuotaSnapshot | undefined {
  if (!raw) return undefined
  const entitlement = raw.entitlement
  const remaining = raw.remaining
  const used =
    raw.used ?? (entitlement !== undefined && remaining !== undefined ? entitlement - remaining : undefined)
  return {
    entitlement,
    remaining,
    used,
    unlimited: raw.unlimited,
    percentRemaining: raw.percent_remaining,
  }
}

export async function fetchUser(entry: AccountEntry): Promise<GitHubUserInfo | undefined> {
  try {
    const token = getGitHubToken(entry)
    const base = entry.enterpriseUrl
      ? `https://api.${normalizeDomain(entry.enterpriseUrl)}`
      : "https://api.github.com"

    const headers = {
      Accept: "application/json",
      Authorization: `token ${token}`,
    }

    const userRes = await fetch(`${base}/user`, { headers })
    if (!userRes.ok) return undefined

    const userData = (await userRes.json()) as { login?: string; email?: string }
    const login = userData.login
    const email = userData.email

    let orgs: string[] = []
    try {
      const orgsRes = await fetch(`${base}/user/orgs`, { headers })
      if (orgsRes.ok) {
        const orgsData = (await orgsRes.json()) as Array<{ login?: string }>
        orgs = orgsData.map((o) => o.login).filter(Boolean) as string[]
      }
    } catch {
      log("[copilot-auth] failed to fetch orgs")
    }

    return { login, email, orgs }
  } catch (error) {
    log("[copilot-auth] fetchUser failed", { error: String(error) })
    return undefined
  }
}

export async function fetchQuota(
  entry: AccountEntry,
): Promise<AccountEntry["quota"] | undefined> {
  try {
    const headers = {
      Accept: "application/json",
      Authorization: `token ${getGitHubToken(entry)}`,
      "User-Agent": "GitHubCopilotChat/0.26.7",
      "Editor-Version": "vscode/1.96.2",
      "Copilot-Integration-Id": "vscode-chat",
      "X-Github-Api-Version": "2025-04-01",
    }
    const base = entry.enterpriseUrl
      ? `https://api.${normalizeDomain(entry.enterpriseUrl)}`
      : "https://api.github.com"

    const quotaRes = await fetch(`${base}/copilot_internal/v2/token`, { headers })
    if (!quotaRes.ok) {
      return { error: `HTTP ${quotaRes.status}`, updatedAt: Date.now() }
    }

    const quotaData = (await quotaRes.json()) as {
      chat_enabled?: boolean
      sku?: string
      limited_access?: boolean
      refresh_in?: number
      annotations_enabled?: boolean
      endpoints?: Record<string, unknown>
    }

    const metricsRes = await fetch(`${base}/copilot_internal/user/metrics`, { headers })

    if (!metricsRes.ok) {
      return {
        sku: quotaData.sku,
        updatedAt: Date.now(),
      }
    }

    const metricsData = (await metricsRes.json()) as {
      copilot_ide_code_completions?: {
        quotas?: Array<{
          quota_type?: string
          overage_allowed?: boolean
          limited?: boolean
          pre_unlimited?: boolean
          entitlement?: number
          remaining?: number
          used?: number
          unlimited?: boolean
          percent_remaining?: number
          reset_at?: string
        }>
      }
    }

    const quotas = metricsData.copilot_ide_code_completions?.quotas ?? []
    const findQuota = (type: string) => quotas.find((q) => q.quota_type === type)

    const premiumRaw = findQuota("premium_chat")
    const chatRaw = findQuota("chat")
    const completionsRaw = findQuota("completions")

    return {
      sku: quotaData.sku,
      reset: premiumRaw?.reset_at ?? chatRaw?.reset_at,
      updatedAt: Date.now(),
      snapshots: {
        premium: buildSnapshot(premiumRaw),
        chat: buildSnapshot(chatRaw),
        completions: buildSnapshot(completionsRaw),
      },
    }
  } catch (error) {
    log("[copilot-auth] fetchQuota failed", { error: String(error) })
    return { error: String(error), updatedAt: Date.now() }
  }
}

export async function fetchModels(
  entry: AccountEntry,
): Promise<{ available: string[]; disabled: string[] } | { error: string }> {
  try {
    const headers = {
      Accept: "application/json",
      Authorization: `token ${getGitHubToken(entry)}`,
      "User-Agent": "GitHubCopilotChat/0.26.7",
      "Editor-Version": "vscode/1.96.2",
      "Copilot-Integration-Id": "vscode-chat",
    }
    const base = entry.enterpriseUrl
      ? `https://api.${normalizeDomain(entry.enterpriseUrl)}`
      : "https://api.github.com"

    const res = await fetch(`${base}/copilot_internal/v2/token`, { headers })
    if (!res.ok) return { error: `HTTP ${res.status}` }

    const data = (await res.json()) as {
      endpoints?: Record<string, { models?: string[] }>
      models?: Array<{ id?: string; name?: string; is_disabled?: boolean }>
    }

    const available: string[] = []
    const disabled: string[] = []

    if (Array.isArray(data.models)) {
      for (const m of data.models) {
        const id = m.id ?? m.name ?? ""
        if (!id) continue
        if (m.is_disabled) {
          disabled.push(id)
        } else {
          available.push(id)
        }
      }
    }

    return { available, disabled }
  } catch (error) {
    return { error: String(error) }
  }
}

export async function loginOauth(
  deployment: "github.com" | "enterprise",
  enterpriseUrl?: string,
): Promise<AccountEntry> {
  const domain = deployment === "enterprise" ? normalizeDomain(enterpriseUrl ?? "") : "github.com"
  const urls = getUrls(domain)

  const deviceResponse = await fetch(urls.DEVICE_CODE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      scope: "read:user user:email",
    }),
  })

  if (!deviceResponse.ok) throw new Error("Failed to initiate device authorization")

  const deviceData = (await deviceResponse.json()) as {
    verification_uri: string
    user_code: string
    device_code: string
    interval: number
  }

  console.log(`Go to: ${deviceData.verification_uri}`)
  console.log(`Enter code: ${deviceData.user_code}`)

  while (true) {
    const response = await fetch(urls.ACCESS_TOKEN_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code: deviceData.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      }),
    })

    if (!response.ok) throw new Error("Failed to poll token")

    const data = (await response.json()) as {
      access_token?: string
      error?: string
      interval?: number
    }

    if (data.access_token) {
      const entry: AccountEntry = {
        name: deployment === "enterprise" ? `enterprise:${domain}` : "github.com",
        refresh: data.access_token,
        access: data.access_token,
        expires: 0,
        enterpriseUrl: deployment === "enterprise" ? domain : undefined,
        addedAt: Date.now(),
        source: "auth",
      }
      const user = await fetchUser(entry)
      if (user?.login) entry.user = user.login
      if (user?.email) entry.email = user.email
      if (user?.orgs?.length) entry.orgs = user.orgs
      return entry
    }

    if (data.error === "authorization_pending") {
      await sleep(deviceData.interval * 1000 + OAUTH_POLLING_SAFETY_MARGIN_MS)
      continue
    }

    if (data.error === "slow_down") {
      const serverInterval = data.interval
      const next = (serverInterval && serverInterval > 0 ? serverInterval : deviceData.interval + 5) * 1000
      await sleep(next + OAUTH_POLLING_SAFETY_MARGIN_MS)
      continue
    }

    throw new Error("Authorization failed")
  }
}
