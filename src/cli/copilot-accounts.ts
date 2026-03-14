import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

import {
  readStore,
  writeStore,
  authPath,
  toAccountInfo,
  loginOauth,
  importFromAuth,
  switchAccount,
  removeAccount,
  removeAllAccounts,
  addAccount,
  checkQuotas,
  checkModels,
  refreshIdentity,
  toggleLoopSafety,
  toggleNetworkRetry,
} from "../features/copilot-account-switcher"
import type { AccountEntry, AccountInfo, StoreFile } from "../features/copilot-account-switcher"

async function promptText(message: string): Promise<string> {
  const rl = createInterface({ input, output })
  try {
    const answer = await rl.question(message)
    return answer.trim()
  } finally {
    rl.close()
  }
}

async function promptChoice(message: string, choices: string[]): Promise<number> {
  console.log(`\n${message}`)
  choices.forEach((c, i) => console.log(`  ${i + 1}) ${c}`))
  while (true) {
    const answer = await promptText("Choice: ")
    const num = parseInt(answer, 10)
    if (num >= 1 && num <= choices.length) return num - 1
    console.log("Invalid choice, try again.")
  }
}

function formatQuota(s?: { remaining?: number; entitlement?: number; unlimited?: boolean }): string {
  if (!s) return "?"
  if (s.unlimited) return "unlimited"
  if (s.remaining !== undefined && s.entitlement !== undefined) return `${s.remaining}/${s.entitlement}`
  return "?"
}

function formatRelativeTime(timestamp: number | undefined): string {
  if (!timestamp) return "never"
  const days = Math.floor((Date.now() - timestamp) / 86400000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(timestamp).toLocaleDateString()
}

function displayAccounts(store: StoreFile): void {
  const entries = Object.entries(store.accounts)
  if (entries.length === 0) {
    console.log("\nNo accounts configured.")
    return
  }

  console.log("\nAccounts:")
  entries.forEach(([name, entry], i) => {
    const info = toAccountInfo(name, entry, i, store.active)
    const current = info.isCurrent ? " *" : ""
    const status = info.status === "expired" ? " [expired]" : ""
    const lastUsed = entry.lastUsed ? ` (last: ${formatRelativeTime(entry.lastUsed)})` : ""
    const quotaStr = entry.quota?.snapshots
      ? ` [P:${formatQuota(entry.quota.snapshots.premium)}|C:${formatQuota(entry.quota.snapshots.chat)}|Comp:${formatQuota(entry.quota.snapshots.completions)}]`
      : ""
    console.log(`  ${i + 1}. ${info.name}${current}${status}${lastUsed}${quotaStr}`)
  })
}

async function promptAccountEntry(existingNames: string[]): Promise<{ name: string; entry: AccountEntry }> {
  let name: string
  while (true) {
    name = await promptText("Account name: ")
    if (!name) continue
    if (!existingNames.includes(name)) break
    console.log(`Name already exists: ${name}`)
  }
  const refresh = await promptText("OAuth refresh/access token: ")
  const access = await promptText("Copilot access token (optional, press Enter to skip): ")
  const expiresRaw = await promptText("Access token expires (unix ms, optional): ")
  const enterpriseUrl = await promptText("Enterprise URL (optional): ")
  const expires = Number(expiresRaw)

  const entry: AccountEntry = {
    name,
    refresh,
    access: access || refresh,
    expires: Number.isFinite(expires) ? expires : 0,
    enterpriseUrl: enterpriseUrl || undefined,
    addedAt: Date.now(),
    source: "manual",
  }
  return { name, entry }
}

export async function copilotAccountsCli(): Promise<number> {
  while (true) {
    const store = await readStore()
    displayAccounts(store)

    console.log(`\nLoop Safety: ${store.loopSafetyEnabled ? "ON" : "OFF"}`)
    console.log(`Network Retry: ${store.networkRetryEnabled ? "ON" : "OFF"}`)

    const actions = [
      "Add account (OAuth device flow)",
      "Add account (manual token)",
      "Import from auth.json",
      "Check quotas",
      "Check models",
      "Refresh identity",
      `Toggle Loop Safety (currently ${store.loopSafetyEnabled ? "ON" : "OFF"})`,
      `Toggle Network Retry (currently ${store.networkRetryEnabled ? "ON" : "OFF"})`,
      "Switch account",
      "Remove account",
      "Remove all accounts",
      "Exit",
    ]

    const choice = await promptChoice("GitHub Copilot Account Manager", actions)

    try {
      switch (choice) {
        case 0: {
          const deployChoice = await promptChoice("Login target:", ["github.com", "Enterprise"])
          let enterpriseUrl: string | undefined
          if (deployChoice === 1) {
            enterpriseUrl = await promptText("Enterprise URL: ")
          }
          const deployment = deployChoice === 0 ? "github.com" as const : "enterprise" as const
          const entry = await loginOauth(deployment, enterpriseUrl)
          await addAccount(entry)
          console.log(`Account added: ${entry.name}`)
          break
        }
        case 1: {
          const existingNames = Object.keys(store.accounts)
          const { entry } = await promptAccountEntry(existingNames)
          await addAccount(entry)
          console.log(`Account added: ${entry.name}`)
          break
        }
        case 2: {
          const customPath = await promptText(`Import from (${authPath()}): `)
          const result = await importFromAuth(customPath || undefined)
          console.log(`Imported ${result.imported} account(s)`)
          break
        }
        case 3: {
          console.log("Checking quotas...")
          const quotaStore = await checkQuotas()
          for (const [name, entry] of Object.entries(quotaStore.accounts)) {
            if (entry.quota?.error) {
              console.log(`  ${name}: error — ${entry.quota.error}`)
            } else if (entry.quota?.snapshots) {
              const { premium, chat, completions } = entry.quota.snapshots
              console.log(`  ${name} (sku: ${entry.quota.sku ?? "?"}):`)
              console.log(`    Premium:     ${formatQuota(premium)}`)
              console.log(`    Chat:        ${formatQuota(chat)}`)
              console.log(`    Completions: ${formatQuota(completions)}`)
              if (entry.quota.reset) console.log(`    Resets:      ${entry.quota.reset}`)
            } else {
              console.log(`  ${name}: no quota data`)
            }
          }
          if (Object.keys(quotaStore.accounts).length === 0) {
            console.log("No accounts configured — add an account first.")
          }
          break
        }
        case 4: {
          console.log("Checking models...")
          const modelStore = await checkModels()
          for (const [name, entry] of Object.entries(modelStore.accounts)) {
            if (entry.models?.error) {
              console.log(`  ${name}: error — ${entry.models.error}`)
            } else if (entry.models) {
              console.log(`  ${name}: ${entry.models.available.length} available, ${entry.models.disabled.length} disabled`)
              if (entry.models.available.length > 0) {
                console.log(`    Available: ${entry.models.available.join(", ")}`)
              }
              if (entry.models.disabled.length > 0) {
                console.log(`    Disabled:  ${entry.models.disabled.join(", ")}`)
              }
            } else {
              console.log(`  ${name}: no model data`)
            }
          }
          if (Object.keys(modelStore.accounts).length === 0) {
            console.log("No accounts configured — add an account first.")
          }
          break
        }
        case 5: {
          console.log("Refreshing identity...")
          await refreshIdentity()
          console.log("Identity refreshed.")
          break
        }
        case 6: {
          const updated = await toggleLoopSafety()
          console.log(`Loop Safety: ${updated.loopSafetyEnabled ? "ON" : "OFF"}`)
          break
        }
        case 7: {
          const updated = await toggleNetworkRetry()
          console.log(`Network Retry: ${updated.networkRetryEnabled ? "ON" : "OFF"}`)
          break
        }
        case 8: {
          const entries = Object.keys(store.accounts)
          if (entries.length === 0) {
            console.log("No accounts to switch.")
            break
          }
          const idx = await promptChoice("Switch to:", entries)
          await switchAccount(entries[idx])
          console.log(`Switched to: ${entries[idx]}`)
          break
        }
        case 9: {
          const entries = Object.keys(store.accounts)
          if (entries.length === 0) {
            console.log("No accounts to remove.")
            break
          }
          const idx = await promptChoice("Remove:", entries)
          const confirm = await promptText(`Remove ${entries[idx]}? (y/N): `)
          if (confirm.toLowerCase() === "y") {
            await removeAccount(entries[idx])
            console.log(`Removed: ${entries[idx]}`)
          }
          break
        }
        case 10: {
          const confirm = await promptText("Remove ALL accounts? This cannot be undone. (y/N): ")
          if (confirm.toLowerCase() === "y") {
            await removeAllAccounts()
            console.log("All accounts removed.")
          }
          break
        }
        case 11:
          return 0
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
