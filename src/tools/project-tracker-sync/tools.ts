import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import type { TrackerProvider } from "./types"

export function createProjectTrackerSyncTool(): Record<string, ToolDefinition> {
  const trackerSync: ToolDefinition = tool({
    description:
      "Sync project tasks with external project trackers. " +
      "Currently supports Linear (via MCP). Jira support is planned but not yet implemented. " +
      "Use this to update issue status, add comments, or link commits to tracker issues.",
    args: {
      provider: tool.schema
        .enum(["linear", "jira"] as [string, ...string[]])
        .describe("The project tracker provider to sync with"),
      action: tool.schema
        .enum(["status", "comment", "link"] as [string, ...string[]])
        .describe("The sync action to perform"),
      issue_id: tool.schema.string().describe("The issue/ticket ID in the tracker (e.g. MAG-123)"),
      message: tool.schema.string().optional().describe("Message content for comment or link actions"),
    },
    execute: async (params) => {
      const provider = params.provider as TrackerProvider

      if (provider === "jira") {
        return (
          "[project-tracker-sync] Jira integration is not yet implemented. " +
          "This is a reserved placeholder for future Jira support. " +
          "Currently, you can use Linear via the Linear MCP server."
        )
      }

      if (provider === "linear") {
        return (
          "[project-tracker-sync] Linear sync should be performed via the Linear MCP server. " +
          `Action: ${params.action}, Issue: ${params.issue_id}` +
          (params.message ? `, Message: ${params.message}` : "") +
          "\n\nUse the Linear MCP tools directly for full functionality."
        )
      }

      return `[project-tracker-sync] Unknown provider: ${provider}`
    },
  })

  return { project_tracker_sync: trackerSync }
}
