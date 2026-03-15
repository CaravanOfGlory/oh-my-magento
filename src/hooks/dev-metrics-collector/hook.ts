import type { PluginInput } from "@opencode-ai/plugin"
import { DevMetricsDB } from "../../features/dev-metrics"
import type { GitSnapshot, SessionContext } from "../../features/dev-metrics"
import { getMainSessionID } from "../../features/claude-code-session-state"
import {
  captureGitSnapshot,
  computeSessionOutcome,
  getGitBranch,
  getGitRemote,
  isGitRepo,
} from "../../features/dev-metrics/git-snapshot-collector"

interface DevMetricsCollectorConfig {
  dbPath?: string
}

export interface DevMetricsCollector {
  handleSessionCreated(sessionId: string, directory: string): Promise<void>
  handleSessionDeleted(sessionId: string, directory: string): Promise<void>
}

export function createDevMetricsCollector(
  ctx: PluginInput,
  config: DevMetricsCollectorConfig = {}
): DevMetricsCollector {
  void ctx
  const db = new DevMetricsDB(config.dbPath)
  const sessionStartSnapshots = new Map<string, GitSnapshot>()

  return {
    async handleSessionCreated(sessionId: string, directory: string): Promise<void> {
      const mainSessionId = getMainSessionID()
      if (mainSessionId && sessionId !== mainSessionId) {
        return
      }

      try {
        const projectName = directory.split("/").pop() || "unknown"
        const repoAvailable = isGitRepo(directory)
        const context: SessionContext = {
          session_id: sessionId,
          project_path: directory,
          project_name: projectName,
          git_remote: repoAvailable ? getGitRemote(directory) : null,
          git_branch: repoAvailable ? getGitBranch(directory) : "",
          created_at: new Date().toISOString(),
        }
        db.insertSessionContext(context)

        const startSnapshot = captureGitSnapshot(directory, sessionId, "start")
        if (startSnapshot) {
          db.insertGitSnapshot(startSnapshot)
          sessionStartSnapshots.set(sessionId, startSnapshot)
        }
      } catch (error) {
        console.error("[dev-metrics] Failed to record session created:", error)
      }
    },

    async handleSessionDeleted(sessionId: string, directory: string): Promise<void> {
      const mainSessionId = getMainSessionID()
      if (mainSessionId && sessionId !== mainSessionId) {
        return
      }

      try {
        const endSnapshot = captureGitSnapshot(directory, sessionId, "end")
        if (endSnapshot) {
          db.insertGitSnapshot(endSnapshot)
        }

        const startSnapshot = sessionStartSnapshots.get(sessionId)
        if (startSnapshot && endSnapshot) {
          const outcome = computeSessionOutcome(startSnapshot, endSnapshot, directory)
          db.upsertSessionOutcome(outcome)
        }

        sessionStartSnapshots.delete(sessionId)
      } catch (error) {
        console.error("[dev-metrics] Failed to record session deleted:", error)
      }
    },
  }
}
