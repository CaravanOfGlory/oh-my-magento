import type { UsageRow } from "./types"
import { createConnection, createTimeFilter } from "./opencode-db-connection"

function createTokenStats(row: Record<string, number>) {
  return {
    input: row.input_tokens ?? 0,
    output: row.output_tokens ?? 0,
    reasoning: row.reasoning_tokens ?? 0,
    cacheRead: row.cache_read ?? 0,
    cacheWrite: row.cache_write ?? 0,
    total: row.total_tokens ?? 0,
  }
}

export function byAgent(
  dbPath: string,
  since?: Date,
  until?: Date,
  limit?: number,
): Array<UsageRow> {
  const { clause, params } = createTimeFilter(since, until)

  let sql = `
    SELECT
      json_extract(data, '$.agent')   AS agent,
      json_extract(data, '$.modelID') AS model,
      COUNT(*)                                           AS calls,
      COALESCE(SUM(json_extract(data, '$.tokens.input')),     0) AS input_tokens,
      COALESCE(SUM(json_extract(data, '$.tokens.output')),    0) AS output_tokens,
      COALESCE(SUM(json_extract(data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
      COALESCE(SUM(json_extract(data, '$.tokens.cache.read')),  0) AS cache_read,
      COALESCE(SUM(json_extract(data, '$.tokens.cache.write')), 0) AS cache_write,
      COALESCE(SUM(json_extract(data, '$.tokens.total')),    0) AS total_tokens,
      COALESCE(SUM(json_extract(data, '$.cost')),            0) AS cost
    FROM message
    WHERE json_extract(data, '$.role') = 'assistant'
      AND json_extract(data, '$.tokens.total') IS NOT NULL
      ${clause}
    GROUP BY agent, model
    ORDER BY agent, total_tokens DESC
  `

  if (limit) {
    sql += " LIMIT ?"
    params.push(limit)
  }

  const db = createConnection(dbPath)
  try {
    const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>
    return rows.map((r) => ({
      label: (r.agent as string) ?? "(unknown)",
      calls: r.calls as number,
      tokens: createTokenStats(r as Record<string, number>),
      cost: r.cost as number,
      detail: r.model as string | undefined,
    }))
  } finally {
    db.close()
  }
}

export function bySession(
  dbPath: string,
  since?: Date,
  until?: Date,
  limit?: number,
): Array<UsageRow> {
  const { clause, params } = createTimeFilter(since, until, "m.data")

  let sql = `
    SELECT
      COALESCE(s.title, m.session_id) AS label,
      COUNT(*) AS calls,
      COALESCE(SUM(json_extract(m.data, '$.tokens.input')),     0) AS input_tokens,
      COALESCE(SUM(json_extract(m.data, '$.tokens.output')),    0) AS output_tokens,
      COALESCE(SUM(json_extract(m.data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
      COALESCE(SUM(json_extract(m.data, '$.tokens.cache.read')),  0) AS cache_read,
      COALESCE(SUM(json_extract(m.data, '$.tokens.cache.write')), 0) AS cache_write,
      COALESCE(SUM(json_extract(m.data, '$.tokens.total')),    0) AS total_tokens,
      COALESCE(SUM(json_extract(m.data, '$.cost')),            0) AS cost
    FROM message m
    LEFT JOIN session s ON m.session_id = s.id
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(m.data, '$.tokens.total') IS NOT NULL
      ${clause}
    GROUP BY m.session_id
    ORDER BY total_tokens DESC
  `

  if (limit) {
    sql += " LIMIT ?"
    params.push(limit)
  }

  const db = createConnection(dbPath)
  try {
    const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>
    return rows.map((r) => ({
      label: (r.label as string) ?? "(untitled)",
      calls: r.calls as number,
      tokens: createTokenStats(r as Record<string, number>),
      cost: r.cost as number,
    }))
  } finally {
    db.close()
  }
}

export function sessionCount(dbPath: string, since?: Date, until?: Date): number {
  const { clause, params } = createTimeFilter(since, until, "m.data")

  const sql = `
    SELECT COUNT(DISTINCT m.session_id) AS count
    FROM message m
    WHERE json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(m.data, '$.tokens.total') IS NOT NULL
      ${clause}
  `

  const db = createConnection(dbPath)
  try {
    const row = db.prepare(sql).get(...params) as Record<string, number> | undefined
    return row?.count ?? 0
  } finally {
    db.close()
  }
}
