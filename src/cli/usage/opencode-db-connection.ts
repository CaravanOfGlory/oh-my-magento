import { Database } from "bun:sqlite"
import { join } from "node:path"
import { existsSync } from "node:fs"
import { getDataDir } from "../../shared/data-path"

export function getDbPath(): string {
  const envPath = process.env.OPENCODE_DB
  if (envPath) return envPath
  return join(getDataDir(), "opencode", "opencode.db")
}

export function createConnection(dbPath: string): InstanceType<typeof Database> {
  if (!existsSync(dbPath)) {
    throw new Error(
      `OpenCode database not found at ${dbPath}\nSet OPENCODE_DB env var to override.`,
    )
  }
  return new Database(dbPath, { readonly: true })
}

export interface TimeFilterResult {
  clause: string
  params: Array<number>
}

export function createTimeFilter(
  since: Date | undefined,
  until: Date | undefined,
  col = "data",
): TimeFilterResult {
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
