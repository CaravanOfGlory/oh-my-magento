import { getConfigDir } from "./config-context"
import { log } from "../../shared/logger"
import { spawnWithWindowsHide } from "../../shared/spawn-with-windows-hide"

const BUN_INSTALL_TIMEOUT_SECONDS = 60
const BUN_INSTALL_TIMEOUT_MS = BUN_INSTALL_TIMEOUT_SECONDS * 1000

export interface BunInstallResult {
  success: boolean
  timedOut?: boolean
  error?: string
}

export async function runBunInstall(): Promise<boolean> {
  const result = await runBunInstallWithDetails()
  return result.success
}

export async function runBunInstallWithDetails(): Promise<BunInstallResult> {
  try {
    const proc = spawnWithWindowsHide(["bun", "install"], {
      cwd: getConfigDir(),
      stdout: "pipe",
      stderr: "pipe",
    })

    let timeoutId: ReturnType<typeof setTimeout>
    const timeoutPromise = new Promise<"timeout">((resolve) => {
      timeoutId = setTimeout(() => resolve("timeout"), BUN_INSTALL_TIMEOUT_MS)
    })
    const exitPromise = proc.exited.then(() => "completed" as const)
    const result = await Promise.race([exitPromise, timeoutPromise])
    clearTimeout(timeoutId!)

    if (result === "timeout") {
      try {
        proc.kill()
      } catch {
        /* intentionally empty - process may have already exited */
      }
      return {
        success: false,
        timedOut: true,
        error: `bun install timed out after ${BUN_INSTALL_TIMEOUT_SECONDS} seconds. Try running manually: cd ${getConfigDir()} && bun i`,
      }
    }

    if (proc.exitCode !== 0) {
      const stderrText = proc.stderr ? await new Response(proc.stderr).text() : ""
      log("[bun-install] failed with exit code:", { exitCode: proc.exitCode, stderr: stderrText })
      return {
        success: false,
        error: `bun install failed with exit code ${proc.exitCode}`,
      }
    }

    log("[bun-install] completed successfully")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      error: `bun install failed: ${message}. Is bun installed? Try: curl -fsSL https://bun.sh/install | bash`,
    }
  }
}
