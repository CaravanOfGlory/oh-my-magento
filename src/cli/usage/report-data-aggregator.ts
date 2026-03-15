import { Database } from "bun:sqlite"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { getDataDir } from "../../shared/data-path"
import type { DevMetricsReportData } from "../../features/dev-metrics"
import { OpenCodeDB } from "./opencode-db"
import { calculateAllMetrics } from "./efficiency-calculator"

export interface ReportDataAggregatorOptions {
  opencodeDb: OpenCodeDB
  dateRange?: { since?: Date; until?: Date }
  devMetricsDbPath?: string
}

export function buildReportData(
  options: ReportDataAggregatorOptions,
): DevMetricsReportData {
  const { opencodeDb, dateRange } = options
  const investmentTotals = opencodeDb.totals(dateRange?.since, dateRange?.until)
  const investmentModels = opencodeDb.byModel(dateRange?.since, dateRange?.until)
  const investmentSessions = opencodeDb.sessionCount(dateRange?.since, dateRange?.until)

  const investment: DevMetricsReportData["investment"] = {
    tokens: investmentTotals.tokens.total,
    cost: investmentTotals.cost,
    models_used: Array.from(new Set(investmentModels.map((row) => row.label))),
    sessions: investmentSessions,
  }

  const devMetricsPath = options.devMetricsDbPath ?? getDefaultDevMetricsDbPath()
  if (!existsSync(devMetricsPath)) {
    return { investment, output: null, efficiency: null }
  }

  const outputResult = readOutputData(devMetricsPath, dateRange)
  const outputData = outputResult.output
  if (!outputData) {
    return { investment, output: null, efficiency: null }
  }

  const metrics = calculateAllMetrics({
    totalCost: investment.cost,
    totalTokens: investment.tokens,
    outputTokens: investmentTotals.tokens.output,
    commitCount: outputData.commits,
    linesOfCode: outputData.lines_added + outputData.lines_removed,
    durationMinutes: outputResult.durationMinutes,
  })

  return {
    investment,
    output: outputData,
    efficiency: {
      cost_per_commit: metrics.costPerCommit,
      tokens_per_loc: metrics.tokensPerLoc,
      output_density: metrics.outputDensity,
      session_productivity_score: metrics.sessionProductivity,
    },
  }
}

function getDefaultDevMetricsDbPath(): string {
  return join(getDataDir(), "oh-my-magento", "dev-metrics.db")
}

function readOutputData(
  dbPath: string,
  dateRange?: { since?: Date; until?: Date },
): { output: DevMetricsReportData["output"] | null; durationMinutes: number } {
  const db = new Database(dbPath, { readonly: true })
  try {
    if (!hasDevMetricsData(db, dateRange)) {
      return { output: null, durationMinutes: 0 }
    }

    const outcomeFilters = buildOutcomeFilters(dateRange)
    const outcomeRow = db
      .prepare(outcomeFilters.sql)
      .get(...outcomeFilters.params) as Record<string, number> | undefined

    const branchFilters = buildBranchFilters(dateRange)
    const branchRows = db
      .prepare(branchFilters.sql)
      .all(...branchFilters.params) as Array<Record<string, string>>

    const output: DevMetricsReportData["output"] = {
      commits: outcomeRow?.commits ?? 0,
      files_changed: outcomeRow?.files_changed ?? 0,
      lines_added: outcomeRow?.lines_added ?? 0,
      lines_removed: outcomeRow?.lines_removed ?? 0,
      branches: branchRows.map((row) => row.branch),
    }

    return {
      output,
      durationMinutes: outcomeRow?.duration_minutes ?? 0,
    }
  } finally {
    db.close()
  }
}

function hasDevMetricsData(
  db: Database,
  dateRange?: { since?: Date; until?: Date },
): boolean {
  let sql = "SELECT COUNT(*) AS count FROM session_context"
  const params: Array<string> = []

  if (dateRange?.since || dateRange?.until) {
    sql += " WHERE 1 = 1"
    if (dateRange.since) {
      sql += " AND created_at >= ?"
      params.push(dateRange.since.toISOString())
    }
    if (dateRange.until) {
      sql += " AND created_at < ?"
      params.push(dateRange.until.toISOString())
    }
  }

  const row = db.prepare(sql).get(...params) as Record<string, number> | undefined
  return (row?.count ?? 0) > 0
}

function buildOutcomeFilters(dateRange?: { since?: Date; until?: Date }) {
  let sql = `
    SELECT
      COALESCE(SUM(so.commits_made), 0) AS commits,
      COALESCE(SUM(so.files_changed), 0) AS files_changed,
      COALESCE(SUM(so.lines_added), 0) AS lines_added,
      COALESCE(SUM(so.lines_removed), 0) AS lines_removed,
      COALESCE(SUM(so.duration_minutes), 0) AS duration_minutes
    FROM session_outcome so
    LEFT JOIN session_context sc ON sc.session_id = so.session_id
    WHERE 1 = 1
  `
  const params: Array<string> = []

  if (dateRange?.since) {
    sql += " AND sc.created_at >= ?"
    params.push(dateRange.since.toISOString())
  }
  if (dateRange?.until) {
    sql += " AND sc.created_at < ?"
    params.push(dateRange.until.toISOString())
  }

  return { sql, params }
}

function buildBranchFilters(dateRange?: { since?: Date; until?: Date }) {
  let sql = `
    SELECT DISTINCT sc.git_branch AS branch
    FROM session_context sc
    WHERE 1 = 1
  `
  const params: Array<string> = []

  if (dateRange?.since) {
    sql += " AND sc.created_at >= ?"
    params.push(dateRange.since.toISOString())
  }
  if (dateRange?.until) {
    sql += " AND sc.created_at < ?"
    params.push(dateRange.until.toISOString())
  }

  sql += " ORDER BY sc.git_branch"

  return { sql, params }
}
