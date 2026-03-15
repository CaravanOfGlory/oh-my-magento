import type { DevMetricsDB, SessionContext } from "../../features/dev-metrics"
import { createConnection } from "./opencode-db-connection"

type OpenCodeDB = OpenCodeDBWithPath

interface OpenCodeDBWithPath {
  readonly path: string
}

export interface ProjectAggregation {
  label: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  sessions: number
  commits: number
  linesAdded: number
}

export interface BranchAggregation {
  label: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  sessions: number
  commits: number
  linesAdded: number
}

export interface ProjectBranchAggregation {
  label: string
  project: string
  branch: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  sessions: number
  commits: number
  linesAdded: number
}

interface ProjectData {
  contexts: SessionContext[]
  sessionIds: Set<string>
}

export function queryByProject(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): ProjectAggregation[] {
  const allContexts = getAllContexts(devMetricsDb, dateRange)
  const projectMap = new Map<string, ProjectData>()

  for (const ctx of allContexts) {
    if (!projectMap.has(ctx.project_name)) {
      projectMap.set(ctx.project_name, { contexts: [], sessionIds: new Set() })
    }
    const entry = projectMap.get(ctx.project_name)!
    entry.contexts.push(ctx)
    entry.sessionIds.add(ctx.session_id)
  }

  const results: ProjectAggregation[] = []

  for (const [projectName, { contexts, sessionIds }] of projectMap) {
    const tokenData = aggregateTokenDataForSessions(
      opencodeDb,
      Array.from(sessionIds),
      dateRange,
    )
    const outcomeData = aggregateOutcomeDataForContexts(devMetricsDb, contexts)

    results.push({
      label: projectName,
      calls: tokenData.calls,
      tokens: tokenData.tokens,
      cost: tokenData.cost,
      sessions: sessionIds.size,
      commits: outcomeData.commits,
      linesAdded: outcomeData.linesAdded,
    })
  }

  return results.sort((a, b) => b.tokens.total - a.tokens.total)
}

export function queryByBranch(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): BranchAggregation[] {
  const allContexts = getAllContexts(devMetricsDb, dateRange)
  const branchMap = new Map<string, ProjectData>()

  for (const ctx of allContexts) {
    if (!branchMap.has(ctx.git_branch)) {
      branchMap.set(ctx.git_branch, { contexts: [], sessionIds: new Set() })
    }
    const entry = branchMap.get(ctx.git_branch)!
    entry.contexts.push(ctx)
    entry.sessionIds.add(ctx.session_id)
  }

  const results: BranchAggregation[] = []

  for (const [branchName, { contexts, sessionIds }] of branchMap) {
    const tokenData = aggregateTokenDataForSessions(
      opencodeDb,
      Array.from(sessionIds),
      dateRange,
    )
    const outcomeData = aggregateOutcomeDataForContexts(devMetricsDb, contexts)

    results.push({
      label: branchName,
      calls: tokenData.calls,
      tokens: tokenData.tokens,
      cost: tokenData.cost,
      sessions: sessionIds.size,
      commits: outcomeData.commits,
      linesAdded: outcomeData.linesAdded,
    })
  }

  return results.sort((a, b) => b.tokens.total - a.tokens.total)
}

export function queryByProjectBranch(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): ProjectBranchAggregation[] {
  const allContexts = getAllContexts(devMetricsDb, dateRange)
  const comboMap = new Map<string, ProjectData>()

  for (const ctx of allContexts) {
    const key = `${ctx.project_name}:${ctx.git_branch}`
    if (!comboMap.has(key)) {
      comboMap.set(key, { contexts: [], sessionIds: new Set() })
    }
    const entry = comboMap.get(key)!
    entry.contexts.push(ctx)
    entry.sessionIds.add(ctx.session_id)
  }

  const results: ProjectBranchAggregation[] = []

  for (const [key, { contexts, sessionIds }] of comboMap) {
    const [project, branch] = key.split(":")
    const tokenData = aggregateTokenDataForSessions(
      opencodeDb,
      Array.from(sessionIds),
      dateRange,
    )
    const outcomeData = aggregateOutcomeDataForContexts(devMetricsDb, contexts)

    results.push({
      label: key,
      project,
      branch,
      calls: tokenData.calls,
      tokens: tokenData.tokens,
      cost: tokenData.cost,
      sessions: sessionIds.size,
      commits: outcomeData.commits,
      linesAdded: outcomeData.linesAdded,
    })
  }

  return results.sort((a, b) => b.tokens.total - a.tokens.total)
}

function getAllContexts(
  devMetricsDb: DevMetricsDB,
  dateRange?: { since?: Date; until?: Date },
): SessionContext[] {
  const db = (devMetricsDb as any).db
  if (!db) {
    return []
  }

  let sql = "SELECT * FROM session_context WHERE 1=1"
  const params: Array<string> = []

  if (dateRange?.since) {
    sql += " AND created_at >= ?"
    params.push(dateRange.since.toISOString())
  }
  if (dateRange?.until) {
    sql += " AND created_at < ?"
    params.push(dateRange.until.toISOString())
  }

  const stmt = db.prepare(sql)
  const rows = stmt.all(...params) as Array<Record<string, unknown>>
  
  return rows.map((row) => ({
    session_id: row.session_id as string,
    project_path: row.project_path as string,
    project_name: row.project_name as string,
    git_remote: row.git_remote as string | null,
    git_branch: row.git_branch as string,
    created_at: row.created_at as string,
  }))
}

function aggregateTokenDataForSessions(
  opencodeDb: OpenCodeDB,
  sessionIds: string[],
  dateRange?: { since?: Date; until?: Date },
) {
  if (sessionIds.length === 0) {
    return {
      calls: 0,
      tokens: { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      cost: 0,
    }
  }

  const dbPath = (opencodeDb as OpenCodeDBWithPath).path
  const db = createConnection(dbPath)

  try {
    const placeholders = sessionIds.map(() => "?").join(",")
    let sql = `
      SELECT
        COUNT(*) AS calls,
        COALESCE(SUM(json_extract(data, '$.tokens.input')), 0) AS input_tokens,
        COALESCE(SUM(json_extract(data, '$.tokens.output')), 0) AS output_tokens,
        COALESCE(SUM(json_extract(data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
        COALESCE(SUM(json_extract(data, '$.tokens.cache.read')), 0) AS cache_read,
        COALESCE(SUM(json_extract(data, '$.tokens.cache.write')), 0) AS cache_write,
        COALESCE(SUM(json_extract(data, '$.tokens.total')), 0) AS total_tokens,
        COALESCE(SUM(json_extract(data, '$.cost')), 0) AS cost
      FROM message
      WHERE json_extract(data, '$.role') = 'assistant'
        AND json_extract(data, '$.tokens.total') IS NOT NULL
        AND session_id IN (${placeholders})
    `

    const params: Array<string | number> = [...sessionIds]

    if (dateRange?.since) {
      sql += " AND json_extract(data, '$.time.created') >= ?"
      params.push(dateRange.since.getTime())
    }
    if (dateRange?.until) {
      sql += " AND json_extract(data, '$.time.created') < ?"
      params.push(dateRange.until.getTime())
    }

    const stmt = db.prepare(sql)
    const row = stmt.get(...params) as Record<string, number> | undefined

    if (!row) {
      return {
        calls: 0,
        tokens: { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        cost: 0,
      }
    }

    return {
      calls: row.calls || 0,
      tokens: {
        input: row.input_tokens || 0,
        output: row.output_tokens || 0,
        reasoning: row.reasoning_tokens || 0,
        cacheRead: row.cache_read || 0,
        cacheWrite: row.cache_write || 0,
        total: row.total_tokens || 0,
      },
      cost: row.cost || 0,
    }
  } finally {
    db.close()
  }
}

function aggregateOutcomeDataForContexts(
  devMetricsDb: DevMetricsDB,
  contexts: SessionContext[],
) {
  let totalCommits = 0
  let totalLinesAdded = 0

  for (const ctx of contexts) {
    const outcome = devMetricsDb.getOutcome(ctx.session_id)
    if (outcome) {
      totalCommits += outcome.commits_made
      totalLinesAdded += outcome.lines_added
    }
  }

  return {
    commits: totalCommits,
    linesAdded: totalLinesAdded,
  }
}
