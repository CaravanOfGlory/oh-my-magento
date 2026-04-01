import { Database } from "bun:sqlite"
import { join } from "node:path"
import { existsSync } from "node:fs"
import { getDataDir } from "../../shared/data-path"
import type { TokenStats, UsageRow, SessionMeta, GroupBy } from "./types"

function getDbPath(): string {
  const envPath = process.env.OPENCODE_DB
  if (envPath) return envPath
  return join(getDataDir(), "opencode", "opencode.db")
}

function createTokenStats(row: Record<string, number>): TokenStats {
  return {
    input: row.input_tokens ?? 0,
    output: row.output_tokens ?? 0,
    reasoning: row.reasoning_tokens ?? 0,
    cacheRead: row.cache_read ?? 0,
    cacheWrite: row.cache_write ?? 0,
    total: row.total_tokens ?? 0,
  }
}

export class OpenCodeDB {
  private readonly path: string

  constructor(dbPath?: string) {
    this.path = dbPath ?? getDbPath()
    if (!existsSync(this.path)) {
      throw new Error(
        `OpenCode database not found at ${this.path}\nSet OPENCODE_DB env var to override.`,
      )
    }
  }

  private connect(): InstanceType<typeof Database> {
    return new Database(this.path, { readonly: true })
  }

  private timeFilter(
    since: Date | undefined,
    until: Date | undefined,
    col = "data",
  ): { clause: string; params: Array<number> } {
    const clauses: Array<string> = []
    const params: Array<number> = []

    if (since) {
      clauses.push(`AND json_extract(${col}, '$.time.created') >= ?`)
      params.push(since.getTime())
    }
    if (until) {
      clauses.push(`AND json_extract(${col}, '$.time.created') < ?`)
      params.push(until.getTime())
    }

    return { clause: clauses.join(" "), params }
  }

  private baseQuery(
    groupExpr: string,
    since?: Date,
    until?: Date,
    order = "total_tokens DESC",
    limit?: number,
  ): Array<UsageRow> {
    const { clause, params } = this.timeFilter(since, until)

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

    const db = this.connect()
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

  daily(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return this.baseQuery(
      "date(json_extract(data, '$.time.created') / 1000, 'unixepoch', 'localtime')",
      since,
      until,
      "label DESC",
      limit,
    )
  }

  byModel(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return this.baseQuery(
      "json_extract(data, '$.modelID')",
      since,
      until,
      "total_tokens DESC",
      limit,
    )
  }

  byAgent(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    const { clause, params } = this.timeFilter(since, until)

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

    const db = this.connect()
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

  byProvider(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return this.baseQuery(
      "json_extract(data, '$.providerID')",
      since,
      until,
      "total_tokens DESC",
      limit,
    )
  }

  bySession(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    const { clause, params } = this.timeFilter(since, until, "m.data")

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

    const db = this.connect()
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

  totals(since?: Date, until?: Date): UsageRow {
    const rows = this.baseQuery("'total'", since, until)
    if (rows.length > 0) return rows[0]
    return {
      label: "total",
      calls: 0,
      tokens: { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      cost: 0,
    }
  }

  sessionCount(since?: Date, until?: Date): number {
    const { clause, params } = this.timeFilter(since, until, "m.data")

    const sql = `
      SELECT COUNT(DISTINCT m.session_id) AS count
      FROM message m
      WHERE json_extract(m.data, '$.role') = 'assistant'
        AND json_extract(m.data, '$.tokens.total') IS NOT NULL
        ${clause}
    `

    const db = this.connect()
    try {
      const row = db.prepare(sql).get(...params) as Record<string, number> | undefined
      return row?.count ?? 0
    } finally {
      db.close()
    }
  }

  cacheEfficiency(since?: Date, until?: Date): Array<{ model: string; hitRate: number }> {
    const { clause, params } = this.timeFilter(since, until)

    const sql = `
      SELECT
        json_extract(data, '$.modelID') AS model,
        COALESCE(SUM(json_extract(data, '$.tokens.cache.read')), 0) AS cache_read,
        COALESCE(SUM(json_extract(data, '$.tokens.input')), 0) AS input_tokens
      FROM message
      WHERE json_extract(data, '$.role') = 'assistant'
        AND json_extract(data, '$.tokens.total') IS NOT NULL
        ${clause}
      GROUP BY model
    `

    const db = this.connect()
    try {
      const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>
      const result: Array<{ model: string; hitRate: number }> = []

      for (const r of rows) {
        const model = r.model as string
        const cacheRead = r.cache_read as number
        const inputTokens = r.input_tokens as number
        const denominator = inputTokens + cacheRead
        if (model && denominator > 0) {
          result.push({ model, hitRate: cacheRead / denominator })
        }
      }

      return result
    } finally {
      db.close()
    }
  }

  fetchRows(
    groupBy: GroupBy,
    since?: Date,
    until?: Date,
    limit?: number,
  ): Array<UsageRow> {
    switch (groupBy) {
      case "day":
        return this.daily(since, until, limit)
      case "model":
        return this.byModel(since, until, limit)
      case "agent":
        return this.byAgent(since, until, limit)
      case "provider":
        return this.byProvider(since, until, limit)
      case "session":
        return this.bySession(since, until, limit)
    }
  }

  toJSON(rows: Array<UsageRow>): Array<Record<string, unknown>> {
    return rows.map((r) => {
      const d: Record<string, unknown> = {
        label: r.label,
        calls: r.calls,
        tokens: {
          input: r.tokens.input,
          output: r.tokens.output,
          reasoning: r.tokens.reasoning,
          cache_read: r.tokens.cacheRead,
          cache_write: r.tokens.cacheWrite,
          total: r.tokens.total,
        },
        cost: Math.round(r.cost * 10000) / 10000,
      }
      if (r.detail !== undefined) {
        d.model = r.detail
      }
      return d
    })
  }
}
