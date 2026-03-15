import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { Database } from "bun:sqlite"
import { mkdtempSync, rmSync, existsSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { DevMetricsDB } from "../../features/dev-metrics"
import { OpenCodeDB } from "./opencode-db"
import { buildReportData } from "./report-data-aggregator"

describe("report-data-aggregator", () => {
  let tempDir: string
  let opencodeDbPath: string
  let devMetricsDbPath: string
  let devMetricsDb: DevMetricsDB

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "report-data-"))
    opencodeDbPath = join(tempDir, "opencode.db")
    devMetricsDbPath = join(tempDir, "dev-metrics.db")
    setupOpenCodeDb(opencodeDbPath)
    devMetricsDb = new DevMetricsDB(devMetricsDbPath)
    seedDevMetrics(devMetricsDb)
  })

  afterEach(() => {
    devMetricsDb.close()
    rmSync(tempDir, { recursive: true, force: true })
  })

  test("#given dev-metrics db missing, #when building report, #then returns investment only", () => {
    //#given
    const missingPath = join(tempDir, "missing-dev.db")
    if (existsSync(missingPath)) {
      rmSync(missingPath)
    }
    const opencodeDb = new OpenCodeDB(opencodeDbPath)

    //#when
    const report = buildReportData({ opencodeDb, devMetricsDbPath: missingPath })

    //#then
    expect(report.investment.tokens).toBe(3000)
    expect(isWithin(report.investment.cost, 0.03, 0.0001)).toBe(true)
    expect(report.output).toBe(null)
    expect(report.efficiency).toBe(null)
  })

  test("#given dev-metrics db, #when building report, #then aggregates output and efficiency", () => {
    //#given
    const opencodeDb = new OpenCodeDB(opencodeDbPath)

    //#when
    const report = buildReportData({ opencodeDb, devMetricsDbPath })

    //#then
    expect(report.investment.sessions).toBe(2)
    expect(report.investment.models_used.sort()).toEqual([
      "claude-opus-4-6",
      "gpt-5.3-codex",
    ])
    expect(report.output?.commits).toBe(5)
    expect(report.output?.files_changed).toBe(9)
    expect(report.output?.lines_added).toBe(150)
    expect(report.output?.lines_removed).toBe(50)
    expect(report.output?.branches).toEqual(["dev", "main"])
    expect(isWithin(report.efficiency?.cost_per_commit ?? 0, 0.006, 0.0001)).toBe(true)
    expect(report.efficiency?.tokens_per_loc).toBe(15)
    expect(isWithin(report.efficiency?.output_density ?? 0, 0.4, 0.0001)).toBe(true)
    expect(
      isWithin(report.efficiency?.session_productivity_score ?? 0, 3.889, 0.001),
    ).toBe(true)
  })
})

function setupOpenCodeDb(dbPath: string): void {
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS message (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      data TEXT NOT NULL
    )
  `)

  const now = Date.now()
  const insert = db.prepare("INSERT INTO message (id, session_id, data) VALUES (?, ?, ?)")

  insert.run(
    "msg-1",
    "sess-1",
    JSON.stringify({
      role: "assistant",
      agent: "sisyphus",
      modelID: "claude-opus-4-6",
      providerID: "anthropic",
      tokens: { input: 600, output: 400, reasoning: 0, cache: { read: 0, write: 0 }, total: 1000 },
      cost: 0.01,
      time: { created: now },
    }),
  )

  insert.run(
    "msg-2",
    "sess-2",
    JSON.stringify({
      role: "assistant",
      agent: "hephaestus",
      modelID: "gpt-5.3-codex",
      providerID: "openai",
      tokens: { input: 1200, output: 800, reasoning: 0, cache: { read: 0, write: 0 }, total: 2000 },
      cost: 0.02,
      time: { created: now + 1000 },
    }),
  )

  db.close()
}

function seedDevMetrics(db: DevMetricsDB): void {
  const now = new Date().toISOString()
  db.insertSessionContext({
    session_id: "sess-1",
    project_path: "/repo",
    project_name: "repo",
    git_remote: null,
    git_branch: "main",
    created_at: now,
  })
  db.insertSessionContext({
    session_id: "sess-2",
    project_path: "/repo",
    project_name: "repo",
    git_remote: null,
    git_branch: "dev",
    created_at: now,
  })

  db.upsertSessionOutcome({
    session_id: "sess-1",
    commits_made: 3,
    files_changed: 5,
    lines_added: 120,
    lines_removed: 30,
    duration_minutes: 45,
    branch_switched: false,
  })
  db.upsertSessionOutcome({
    session_id: "sess-2",
    commits_made: 2,
    files_changed: 4,
    lines_added: 30,
    lines_removed: 20,
    duration_minutes: 15,
    branch_switched: false,
  })
}

function isWithin(value: number, target: number, epsilon: number): boolean {
  return Math.abs(value - target) <= epsilon
}
