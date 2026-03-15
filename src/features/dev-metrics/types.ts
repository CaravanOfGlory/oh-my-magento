/**
 * SessionContext: Basic project/branch context for a session
 */
export interface SessionContext {
  session_id: string
  project_path: string
  project_name: string
  git_remote: string | null
  git_branch: string
  created_at: string // ISO timestamp
}

/**
 * GitSnapshot: Git state captured at a point in time
 */
export interface GitSnapshot {
  id?: number
  session_id: string
  snapshot_type: "start" | "end"
  branch: string
  head_commit: string
  files_staged: number
  files_changed: number
  insertions: number
  deletions: number
  timestamp: string // ISO timestamp
}

/**
 * SessionOutcome: Computed diff between start/end snapshots
 */
export interface SessionOutcome {
  session_id: string
  commits_made: number
  files_changed: number
  lines_added: number
  lines_removed: number
  duration_minutes: number
  branch_switched: boolean
}

export interface DimensionBreakdownEntry {
  label: string
  sessions: number
  tokens: number
  cost: number
  commits: number
  lines_added: number
}

/**
 * EfficiencyMetrics: Computed productivity metrics
 */
export interface EfficiencyMetrics {
  cost_per_commit: number | null
  tokens_per_loc: number | null
  output_density: number | null // LOC per 1000 tokens
  session_productivity_score: number | null
}

/**
 * DevMetricsReportData: Complete report structure
 */
export interface DevMetricsReportData {
  investment: {
    tokens: number
    cost: number
    models_used: string[]
    sessions: number
  }
  output: {
    commits: number
    files_changed: number
    lines_added: number
    lines_removed: number
    branches: string[]
  } | null
  efficiency: EfficiencyMetrics | null
  project_breakdown: DimensionBreakdownEntry[] | null
  branch_breakdown: DimensionBreakdownEntry[] | null
}
