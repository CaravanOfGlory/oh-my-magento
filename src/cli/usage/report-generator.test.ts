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
    test("#given database with messages, #when generating report for today, #then returns complete report with investment section", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      //#when
      const report = generateReport(db, { date: dateStr })

      //#then
      expect(report.investment).toBeDefined()
      expect(report.investment.tokens).toBe(2900)
      expect(report.investment.cost).toBeCloseTo(0.018, 3)
      expect(report.investment.sessions).toBe(1)
      expect(report.investment.models_used.length).toBe(2)
    })

    test("#given database with messages, #when generating report, #then output and efficiency sections are present", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      //#when
      const report = generateReport(db, { date: dateStr })

      //#then
      // Output and efficiency may be null if no dev-metrics data
      expect(report).toHaveProperty("output")
      expect(report).toHaveProperty("efficiency")
    })
  })

  describe("renderReportAsMarkdown", () => {
    test("#given a usage report, #when rendering as markdown, #then contains investment section", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      const report = generateReport(db, { date: dateStr })

      //#when
      const markdown = renderReportAsMarkdown(report, { user: "test-user", date: dateStr })

      //#then
      expect(markdown).toContain("# AI Usage Report")
      expect(markdown).toContain("## Investment")
      expect(markdown).toContain("Tokens")
      expect(markdown).toContain("Cost")
    })

    test("#given a usage report, #when rendering, #then user field is populated", () => {
      //#given
      const db = new OpenCodeDB(dbPath)
      const today = new Date()
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
      const report = generateReport(db, { date: dateStr })

      //#when
      const markdown = renderReportAsMarkdown(report, { user: "test-user", date: dateStr })

      //#then
      expect(markdown).toContain("test-user")
    })
  })
})
