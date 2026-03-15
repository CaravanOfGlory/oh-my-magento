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

function baseQuery(
  dbPath: string,
  groupExpr: string,
  since?: Date,
  until?: Date,
  order = "total_tokens DESC",
  limit?: number,
): Array<UsageRow> {
  const { clause, params } = createTimeFilter(since, until)

  let sql = `
    SELECT
      ${groupExpr} AS label,
      COUNT(*) AS calls,
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
    GROUP BY label
    ORDER BY ${order}
  `

  if (limit) {
    sql += " LIMIT ?"
    params.push(limit)
  }

  const db = createConnection(dbPath)
  try {
    const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>
    return rows.map((r) => ({
      label: (r.label as string) ?? "(unknown)",
      calls: r.calls as number,
      tokens: createTokenStats(r as Record<string, number>),
      cost: r.cost as number,
    }))
  } finally {
    db.close()
  }
}

export function daily(
  dbPath: string,
  since?: Date,
  until?: Date,
  limit?: number,
): Array<UsageRow> {
  return baseQuery(
    dbPath,
    "date(json_extract(data, '$.time.created') / 1000, 'unixepoch', 'localtime')",
    since,
    until,
    "label DESC",
    limit,
  )
}

export function byModel(
  dbPath: string,
  since?: Date,
  until?: Date,
  limit?: number,
): Array<UsageRow> {
  return baseQuery(
    dbPath,
    "json_extract(data, '$.modelID')",
    since,
    until,
    "total_tokens DESC",
    limit,
  )
}

export function byProvider(
  dbPath: string,
  since?: Date,
  until?: Date,
  limit?: number,
): Array<UsageRow> {
  return baseQuery(
    dbPath,
    "json_extract(data, '$.providerID')",
    since,
    until,
    "total_tokens DESC",
    limit,
  )
}
