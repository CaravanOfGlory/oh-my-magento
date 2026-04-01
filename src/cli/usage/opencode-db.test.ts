import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { Database } from "bun:sqlite"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { OpenCodeDB } from "./opencode-db"

function createTestDb(dir: string): string {
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

  db.close()
  return dbPath
}

function insertMessage(
  dbPath: string,
  opts: {
    id: string
    sessionId: string
    role?: string
    agent?: string
    modelID?: string
    providerID?: string
    tokensInput?: number
    tokensOutput?: number
    tokensReasoning?: number
    tokensTotal?: number
    cacheRead?: number
    cacheWrite?: number
    cost?: number
    createdMs?: number
  },
): void {
  const data = {
    role: opts.role ?? "assistant",
    agent: opts.agent ?? "Sisyphus",
    modelID: opts.modelID ?? "claude-sonnet-4",
    providerID: opts.providerID ?? "anthropic",
    tokens: {
      input: opts.tokensInput ?? 100,
      output: opts.tokensOutput ?? 50,
      reasoning: opts.tokensReasoning ?? 0,
      total: opts.tokensTotal ?? 150,
      cache: {
        read: opts.cacheRead ?? 20,
        write: opts.cacheWrite ?? 10,
      },
    },
    cost: opts.cost ?? 0.005,
    time: {
      created: opts.createdMs ?? Date.now(),
    },
  }

  const db = new Database(dbPath)
  db.prepare("INSERT INTO message (id, session_id, data) VALUES (?, ?, ?)").run(
    opts.id,
    opts.sessionId,
    JSON.stringify(data),
  )
  db.close()
}

function insertSession(dbPath: string, id: string, title: string): void {
  const db = new Database(dbPath)
  db.prepare("INSERT INTO session (id, title) VALUES (?, ?)").run(id, title)
  db.close()
}

describe("OpenCodeDB", () => {
  let tempDir: string
  let dbPath: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "opencode-usage-test-"))
    dbPath = createTestDb(tempDir)
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe("#given missing database", () => {
    test("#when constructing, #then throws error", () => {
      expect(() => new OpenCodeDB("/nonexistent/path/opencode.db")).toThrow(
        "OpenCode database not found",
      )
    })
  })

  describe("#given empty database", () => {
    test("#when querying totals, #then returns zero values", () => {
      //#given
      const db = new OpenCodeDB(dbPath)

      //#when
      const totals = db.totals()

      //#then
      expect(totals.calls).toBe(0)
      expect(totals.tokens.total).toBe(0)
      expect(totals.cost).toBe(0)
    })

    test("#when querying daily, #then returns empty array", () => {
      //#given
      const db = new OpenCodeDB(dbPath)

      //#when
      const rows = db.daily()

      //#then
      expect(rows).toEqual([])
    })
  })

  describe("#given database with messages", () => {
    beforeEach(() => {
      const now = Date.now()
      insertMessage(dbPath, {
        id: "msg_1",
        sessionId: "ses_1",
        agent: "Sisyphus",
        modelID: "claude-sonnet-4",
        providerID: "anthropic",
        tokensInput: 1000,
        tokensOutput: 500,
        tokensTotal: 1500,
        cacheRead: 200,
        cacheWrite: 100,
        cost: 0.01,
        createdMs: now,
      })
      insertMessage(dbPath, {
        id: "msg_2",
        sessionId: "ses_1",
        agent: "Hephaestus",
        modelID: "deepseek-r1",
        providerID: "deepseek",
        tokensInput: 2000,
        tokensOutput: 800,
        tokensReasoning: 500,
        tokensTotal: 3300,
        cacheRead: 0,
        cacheWrite: 50,
        cost: 0.02,
        createdMs: now,
      })
      insertMessage(dbPath, {
        id: "msg_3",
        sessionId: "ses_2",
        agent: "Sisyphus",
        modelID: "claude-sonnet-4",
        providerID: "anthropic",
        tokensInput: 500,
        tokensOutput: 200,
        tokensTotal: 700,
        cacheRead: 100,
        cacheWrite: 50,
        cost: 0.005,
        createdMs: now,
      })

      insertSession(dbPath, "ses_1", "Fix login bug")
      insertSession(dbPath, "ses_2", "Refactor auth")
    })

    describe("totals", () => {
      test("#when querying totals, #then returns aggregated values", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const totals = db.totals()

        //#then
        expect(totals.calls).toBe(3)
        expect(totals.tokens.total).toBe(5500)
        expect(totals.tokens.input).toBe(3500)
        expect(totals.tokens.output).toBe(1500)
        expect(totals.cost).toBeCloseTo(0.035, 4)
      })
    })

    describe("byModel", () => {
      test("#when querying by model, #then groups by model ID", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const rows = db.byModel()

        //#then
        expect(rows.length).toBe(2)
        const claude = rows.find((r) => r.label === "claude-sonnet-4")
        const deepseek = rows.find((r) => r.label === "deepseek-r1")
        expect(claude?.calls).toBe(2)
        expect(claude?.tokens.total).toBe(2200)
        expect(deepseek?.calls).toBe(1)
        expect(deepseek?.tokens.total).toBe(3300)
      })
    })

    describe("byAgent", () => {
      test("#when querying by agent, #then groups by agent and model", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const rows = db.byAgent()

        //#then
        expect(rows.length).toBe(3)
        const sisyphusRows = rows.filter((r) => r.label === "Sisyphus")
        expect(sisyphusRows.length).toBe(1)
        expect(sisyphusRows[0].detail).toBe("claude-sonnet-4")
      })
    })

    describe("byProvider", () => {
      test("#when querying by provider, #then groups by provider ID", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const rows = db.byProvider()

        //#then
        expect(rows.length).toBe(2)
        const anthropic = rows.find((r) => r.label === "anthropic")
        expect(anthropic?.calls).toBe(2)
      })
    })

    describe("bySession", () => {
      test("#when querying by session, #then uses session title as label", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const rows = db.bySession()

        //#then
        expect(rows.length).toBe(2)
        const loginBug = rows.find((r) => r.label === "Fix login bug")
        expect(loginBug?.calls).toBe(2)
      })
    })

    describe("sessionCount", () => {
      test("#when querying session count, #then returns distinct sessions", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const count = db.sessionCount()

        //#then
        expect(count).toBe(2)
      })
    })

    describe("cacheEfficiency", () => {
      test("#when querying cache efficiency, #then returns hit rates per model", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const efficiency = db.cacheEfficiency()

        //#then
        expect(efficiency.length).toBe(2)
        const claude = efficiency.find((e) => e.model === "claude-sonnet-4")
        expect(claude?.hitRate).toBeGreaterThan(0)
        expect(claude?.hitRate).toBeLessThan(1)
      })
    })

    describe("fetchRows", () => {
      test("#when fetching with limit, #then respects the limit", () => {
        //#given
        const db = new OpenCodeDB(dbPath)

        //#when
        const rows = db.fetchRows("model", undefined, undefined, 1)

        //#then
        expect(rows.length).toBe(1)
      })
    })

    describe("toJSON", () => {
      test("#when converting rows to JSON, #then returns serializable objects", () => {
        //#given
        const db = new OpenCodeDB(dbPath)
        const rows = db.byModel()

        //#when
        const json = db.toJSON(rows)

        //#then
        expect(json.length).toBe(2)
        expect(json[0]).toHaveProperty("label")
        expect(json[0]).toHaveProperty("calls")
        expect(json[0]).toHaveProperty("tokens")
        expect(json[0]).toHaveProperty("cost")
      })
    })
  })

  describe("#given time-filtered queries", () => {
    test("#when using since filter, #then excludes older messages", () => {
      //#given
      const now = Date.now()
      const oneDayAgo = now - 86400_000
      const twoDaysAgo = now - 2 * 86400_000

      insertMessage(dbPath, {
        id: "msg_old",
        sessionId: "ses_1",
        tokensTotal: 1000,
        createdMs: twoDaysAgo,
      })
      insertMessage(dbPath, {
        id: "msg_new",
        sessionId: "ses_1",
        tokensTotal: 2000,
        createdMs: now,
      })

      const db = new OpenCodeDB(dbPath)
      const since = new Date(oneDayAgo)

      //#when
      const totals = db.totals(since)

      //#then
      expect(totals.calls).toBe(1)
      expect(totals.tokens.total).toBe(2000)
    })
  })
})
