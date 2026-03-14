import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { Database } from "bun:sqlite"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { OpenCodeDB } from "./opencode-db"
import { generateReport, renderReportAsMarkdown } from "./report-generator"

function setupTestDb(dir: string): string {
  const dbPath = join(dir, "opencode.db")
  const db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      title TEXT,
      parent_id TEXT,
      time_created INTEGER,
      time_updated INTEGER
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS message (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      data TEXT
    )
  `)

  const now = Date.now()

  const insertMsg = db.prepare(
    "INSERT INTO message (id, session_id, data) VALUES (?, ?, ?)",
  )

  insertMsg.run(
    "msg_1",
    "ses_1",
    JSON.stringify({
      role: "assistant",
      agent: "Sisyphus",
      modelID: "claude-sonnet-4",
      providerID: "anthropic",
      tokens: { input: 1000, output: 500, reasoning: 0, total: 1500, cache: { read: 200, write: 100 } },
      cost: 0.01,
      time: { created: now },
    }),
  )

  insertMsg.run(
    "msg_2",
    "ses_1",
    JSON.stringify({
      role: "assistant",
      agent: "Hephaestus",
      modelID: "deepseek-r1",
      providerID: "deepseek",
      tokens: { input: 800, output: 400, reasoning: 200, total: 1400, cache: { read: 0, write: 50 } },
      cost: 0.008,
      time: { created: now },
    }),
  )

  db.prepare("INSERT INTO session (id, title) VALUES (?, ?)").run("ses_1", "Fix login bug")
  db.close()
  return dbPath
}

describe("report-generator", () => {
  let tempDir: string
  let dbPath: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "report-test-"))
    dbPath = setupTestDb(tempDir)
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe("generateReport", () => {
    test("#given database with messages, #when generating report for today, #then returns complete report", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      //#when
      const report = generateReport(db, { date: dateStr })

      //#then
      expect(report.date).toBe(dateStr)
      expect(report.summary.totalCalls).toBe(2)
      expect(report.summary.totalTokens).toBe(2900)
      expect(report.modelBreakdown.length).toBe(2)
      expect(report.agentBreakdown.length).toBe(2)
    })

    test("#given database with messages, #when generating report, #then model percentages sum to ~100", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      //#when
      const report = generateReport(db, { date: dateStr })

      //#then
      const totalPct = report.modelBreakdown.reduce((sum, m) => sum + m.percentage, 0)
      expect(totalPct).toBeGreaterThanOrEqual(98)
      expect(totalPct).toBeLessThanOrEqual(102)
    })
  })

  describe("renderReportAsMarkdown", () => {
    test("#given a usage report, #when rendering as markdown, #then contains all sections", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      const report = generateReport(db, { date: dateStr })

      //#when
      const markdown = renderReportAsMarkdown(report)

      //#then
      expect(markdown).toContain("# AI Usage Report")
      expect(markdown).toContain("## Summary")
      expect(markdown).toContain("## Model Usage")
      expect(markdown).toContain("## Agent Usage")
      expect(markdown).toContain("claude-sonnet-4")
      expect(markdown).toContain("deepseek-r1")
      expect(markdown).toContain("Sisyphus")
      expect(markdown).toContain("Hephaestus")
    })

    test("#given a usage report, #when rendering, #then user field is populated", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      const report = generateReport(db, { date: dateStr })

      //#when
      const markdown = renderReportAsMarkdown(report)

      //#then
      expect(markdown).toContain("**User**:")
    })
  })
})
