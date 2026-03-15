import { createConnection } from "./opencode-db-connection"
import type { OpenCodeDB } from "./opencode-db"
import type { DevMetricsDB } from "../../features/dev-metrics"
import type {
  BranchAggregation,
  EnrichedSessionData,
  ProjectAggregation,
  ProjectBranchAggregation,
} from "./cross-db-query-types"
import { buildWhere, createDateFilters, createTokenFilters } from "./cross-db-query-filters"
import {
  mapRowToAggregation,
  mapRowToEnriched,
  mapRowToProjectBranch,
} from "./cross-db-query-row-mapper"
import { attachDevMetricsDb, BASE_SELECT, type OpenCodeDBWithPath } from "./cross-db-query-support"

function getDbPath(opencodeDb: OpenCodeDB): string {
  return (opencodeDb as OpenCodeDBWithPath).path
}

export function getEnrichedSessionData(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): EnrichedSessionData[] {
  const db = createConnection(getDbPath(opencodeDb))
  try {
    attachDevMetricsDb(db, devMetricsDb)
    const dateFilters = createDateFilters(dateRange)
    const tokenFilters = createTokenFilters(dateRange)
    const filters = [...dateFilters.filters, ...tokenFilters.filters]
    const sql = `
      ${BASE_SELECT}
      ${buildWhere(filters)}
      GROUP BY sc.session_id
      ORDER BY sc.created_at DESC
    `
    const rows = db
      .prepare(sql)
      .all(...dateFilters.params, ...tokenFilters.params) as Array<Record<string, unknown>>
    return rows.map(mapRowToEnriched)
  } finally {
    db.close()
  }
}

export function getAggregatedByProject(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): ProjectAggregation[] {
  const db = createConnection(getDbPath(opencodeDb))
  try {
    attachDevMetricsDb(db, devMetricsDb)
    const dateFilters = createDateFilters(dateRange)
    const tokenFilters = createTokenFilters(dateRange)
    const filters = [...dateFilters.filters, ...tokenFilters.filters]
    const sql = `
      SELECT
        sc.project_name AS label,
        COUNT(DISTINCT sc.session_id) AS sessions,
        COUNT(m.id) AS calls,
        COALESCE(SUM(json_extract(m.data, '$.tokens.input')), 0) AS input_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.output')), 0) AS output_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.cache.read')), 0) AS cache_read,
        COALESCE(SUM(json_extract(m.data, '$.tokens.cache.write')), 0) AS cache_write,
        COALESCE(SUM(json_extract(m.data, '$.tokens.total')), 0) AS total_tokens,
        COALESCE(SUM(json_extract(m.data, '$.cost')), 0) AS cost,
        COALESCE(SUM(so.commits_made), 0) AS commits,
        COALESCE(SUM(so.lines_added), 0) AS lines_added
      FROM dev.session_context sc
      LEFT JOIN dev.session_outcome so ON so.session_id = sc.session_id
      LEFT JOIN message m
        ON m.session_id = sc.session_id
        AND json_extract(m.data, '$.role') = 'assistant'
        AND json_extract(m.data, '$.tokens.total') IS NOT NULL
      ${buildWhere(filters)}
      GROUP BY sc.project_name
      ORDER BY total_tokens DESC
    `
    const rows = db
      .prepare(sql)
      .all(...dateFilters.params, ...tokenFilters.params) as Array<Record<string, unknown>>
    return rows.map(mapRowToAggregation)
  } finally {
    db.close()
  }
}

export function getAggregatedByBranch(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): BranchAggregation[] {
  const db = createConnection(getDbPath(opencodeDb))
  try {
    attachDevMetricsDb(db, devMetricsDb)
    const dateFilters = createDateFilters(dateRange)
    const tokenFilters = createTokenFilters(dateRange)
    const filters = [...dateFilters.filters, ...tokenFilters.filters]
    const sql = `
      SELECT
        sc.git_branch AS label,
        COUNT(DISTINCT sc.session_id) AS sessions,
        COUNT(m.id) AS calls,
        COALESCE(SUM(json_extract(m.data, '$.tokens.input')), 0) AS input_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.output')), 0) AS output_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.cache.read')), 0) AS cache_read,
        COALESCE(SUM(json_extract(m.data, '$.tokens.cache.write')), 0) AS cache_write,
        COALESCE(SUM(json_extract(m.data, '$.tokens.total')), 0) AS total_tokens,
        COALESCE(SUM(json_extract(m.data, '$.cost')), 0) AS cost,
        COALESCE(SUM(so.commits_made), 0) AS commits,
        COALESCE(SUM(so.lines_added), 0) AS lines_added
      FROM dev.session_context sc
      LEFT JOIN dev.session_outcome so ON so.session_id = sc.session_id
      LEFT JOIN message m
        ON m.session_id = sc.session_id
        AND json_extract(m.data, '$.role') = 'assistant'
        AND json_extract(m.data, '$.tokens.total') IS NOT NULL
      ${buildWhere(filters)}
      GROUP BY sc.git_branch
      ORDER BY total_tokens DESC
    `
    const rows = db
      .prepare(sql)
      .all(...dateFilters.params, ...tokenFilters.params) as Array<Record<string, unknown>>
    return rows.map(mapRowToAggregation)
  } finally {
    db.close()
  }
}

export function getAggregatedByProjectBranch(
  devMetricsDb: DevMetricsDB,
  opencodeDb: OpenCodeDB,
  dateRange?: { since?: Date; until?: Date },
): ProjectBranchAggregation[] {
  const db = createConnection(getDbPath(opencodeDb))
  try {
    attachDevMetricsDb(db, devMetricsDb)
    const dateFilters = createDateFilters(dateRange)
    const tokenFilters = createTokenFilters(dateRange)
    const filters = [...dateFilters.filters, ...tokenFilters.filters]
    const sql = `
      SELECT
        sc.project_name AS project,
        sc.git_branch AS branch,
        sc.project_name || ':' || sc.git_branch AS label,
        COUNT(DISTINCT sc.session_id) AS sessions,
        COUNT(m.id) AS calls,
        COALESCE(SUM(json_extract(m.data, '$.tokens.input')), 0) AS input_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.output')), 0) AS output_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
        COALESCE(SUM(json_extract(m.data, '$.tokens.cache.read')), 0) AS cache_read,
        COALESCE(SUM(json_extract(m.data, '$.tokens.cache.write')), 0) AS cache_write,
        COALESCE(SUM(json_extract(m.data, '$.tokens.total')), 0) AS total_tokens,
        COALESCE(SUM(json_extract(m.data, '$.cost')), 0) AS cost,
        COALESCE(SUM(so.commits_made), 0) AS commits,
        COALESCE(SUM(so.lines_added), 0) AS lines_added
      FROM dev.session_context sc
      LEFT JOIN dev.session_outcome so ON so.session_id = sc.session_id
      LEFT JOIN message m
        ON m.session_id = sc.session_id
        AND json_extract(m.data, '$.role') = 'assistant'
        AND json_extract(m.data, '$.tokens.total') IS NOT NULL
      ${buildWhere(filters)}
      GROUP BY sc.project_name, sc.git_branch
      ORDER BY total_tokens DESC
    `
    const rows = db
      .prepare(sql)
      .all(...dateFilters.params, ...tokenFilters.params) as Array<Record<string, unknown>>
    return rows.map(mapRowToProjectBranch)
  } finally {
    db.close()
  }
}
