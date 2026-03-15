import { getDbPath, createConnection } from "./opencode-db-connection"
import type { UsageRow, GroupBy } from "./types"
import * as tokenQueries from "./opencode-db-token-queries"
import * as sessionQueries from "./opencode-db-session-queries"
import * as cacheModule from "./opencode-db-cache"

export class OpenCodeDB {
  private readonly _path: string

  constructor(dbPath?: string) {
    this._path = dbPath ?? getDbPath()
    const db = createConnection(this._path)
    db.close()
  }

  get path(): string {
    return this._path
  }

  daily(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return tokenQueries.daily(this._path, since, until, limit)
  }

  byModel(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return tokenQueries.byModel(this._path, since, until, limit)
  }

  byAgent(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return sessionQueries.byAgent(this._path, since, until, limit)
  }

  byProvider(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return tokenQueries.byProvider(this._path, since, until, limit)
  }

  bySession(since?: Date, until?: Date, limit?: number): Array<UsageRow> {
    return sessionQueries.bySession(this._path, since, until, limit)
  }

  totals(since?: Date, until?: Date): UsageRow {
    const rows = tokenQueries.daily(this._path, since, until)
    if (rows.length > 0) return rows[0]
    return {
      label: "total",
      calls: 0,
      tokens: { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
      cost: 0,
    }
  }

  sessionCount(since?: Date, until?: Date): number {
    return sessionQueries.sessionCount(this._path, since, until)
  }

  cacheEfficiency(since?: Date, until?: Date): Array<{ model: string; hitRate: number }> {
    return cacheModule.cacheEfficiency(this._path, since, until)
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
