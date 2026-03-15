import type {
  EnrichedSessionData,
  ProjectAggregation,
  ProjectBranchAggregation,
} from "./cross-db-query-types"

export function mapRowToEnriched(row: Record<string, unknown>): EnrichedSessionData {
  return {
    sessionId: row.session_id as string,
    title: row.title as string,
    projectPath: row.project_path as string,
    projectName: row.project_name as string,
    gitRemote: row.git_remote as string | null,
    gitBranch: row.git_branch as string,
    createdAt: row.created_at as string,
    calls: (row.calls as number) ?? 0,
    tokens: {
      input: (row.input_tokens as number) ?? 0,
      output: (row.output_tokens as number) ?? 0,
      reasoning: (row.reasoning_tokens as number) ?? 0,
      cacheRead: (row.cache_read as number) ?? 0,
      cacheWrite: (row.cache_write as number) ?? 0,
      total: (row.total_tokens as number) ?? 0,
    },
    cost: (row.cost as number) ?? 0,
    commits: (row.commits as number) ?? 0,
    linesAdded: (row.lines_added as number) ?? 0,
  }
}

export function mapRowToAggregation(row: Record<string, unknown>): ProjectAggregation {
  return {
    label: row.label as string,
    calls: (row.calls as number) ?? 0,
    tokens: {
      input: (row.input_tokens as number) ?? 0,
      output: (row.output_tokens as number) ?? 0,
      reasoning: (row.reasoning_tokens as number) ?? 0,
      cacheRead: (row.cache_read as number) ?? 0,
      cacheWrite: (row.cache_write as number) ?? 0,
      total: (row.total_tokens as number) ?? 0,
    },
    cost: (row.cost as number) ?? 0,
    sessions: (row.sessions as number) ?? 0,
    commits: (row.commits as number) ?? 0,
    linesAdded: (row.lines_added as number) ?? 0,
  }
}

export function mapRowToProjectBranch(
  row: Record<string, unknown>,
): ProjectBranchAggregation {
  return {
    label: row.label as string,
    project: row.project as string,
    branch: row.branch as string,
    calls: (row.calls as number) ?? 0,
    tokens: {
      input: (row.input_tokens as number) ?? 0,
      output: (row.output_tokens as number) ?? 0,
      reasoning: (row.reasoning_tokens as number) ?? 0,
      cacheRead: (row.cache_read as number) ?? 0,
      cacheWrite: (row.cache_write as number) ?? 0,
      total: (row.total_tokens as number) ?? 0,
    },
    cost: (row.cost as number) ?? 0,
    sessions: (row.sessions as number) ?? 0,
    commits: (row.commits as number) ?? 0,
    linesAdded: (row.lines_added as number) ?? 0,
  }
}
