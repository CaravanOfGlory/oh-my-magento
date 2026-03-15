import { createRequire } from "node:module"
import { unlinkSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { DevMetricsDB } from "../../features/dev-metrics"
import { OpenCodeDB } from "./opencode-db"
import {
  getEnrichedSessionData,
  getAggregatedByProject,
  getAggregatedByBranch,
  getAggregatedByProjectBranch,
} from "./cross-db-query"

const require = createRequire(import.meta.url)
const { describe, expect, beforeEach, afterEach, test } = require("bun:test") as {
  describe: (name: string, fn: () => void) => void
  test: (name: string, fn: () => void | Promise<void>) => void
  beforeEach: (fn: () => void | Promise<void>) => void
  afterEach: (fn: () => void | Promise<void>) => void
  expect: (value: unknown) => {
    toBe: (expected: unknown) => void
    toEqual: (expected: unknown) => void
    toBeGreaterThan: (expected: number) => void
    toBeLessThan: (expected: number) => void
  }
}
const { Database } = require("bun:sqlite") as {
  Database: new (path: string) => {
    prepare: (sql: string) => { run: (...args: Array<unknown>) => void }
    close: () => void
  }
}

describe("#cross-db-query", () => {
  let devMetricsDbPath: string
  let opencodeDbPath: string
  let devMetricsDb: DevMetricsDB
  let opencodeDb: OpenCodeDB

  beforeEach(() => {
    const tmpBase = join(tmpdir(), `test-cross-db-${Date.now()}`)
    devMetricsDbPath = `${tmpBase}-dev.db`
    opencodeDbPath = `${tmpBase}-oc.db`

    devMetricsDb = new DevMetricsDB(devMetricsDbPath)

    setupDevMetricsTestData(devMetricsDbPath)
    setupOpenCodeTestData(opencodeDbPath)

    opencodeDb = new OpenCodeDB(opencodeDbPath)
  })

  afterEach(() => {
    devMetricsDb.close()

    if (existsSync(devMetricsDbPath)) {
      unlinkSync(devMetricsDbPath)
    }
    if (existsSync(opencodeDbPath)) {
      unlinkSync(opencodeDbPath)
    }
  })

  describe("#given empty dev-metrics database", () => {
    describe("#when querying enriched sessions", () => {
      test("#then returns empty array", () => {
        const emptyDevDbPath = join(tmpdir(), `test-empty-dev-${Date.now()}.db`)
        const emptyDevDb = new DevMetricsDB(emptyDevDbPath)

        const results = getEnrichedSessionData(emptyDevDb, opencodeDb)

        expect(results).toEqual([])

        emptyDevDb.close()
        unlinkSync(emptyDevDbPath)
      })
    })
  })

  describe("#given session data", () => {
    describe("#when querying enriched sessions", () => {
      test("#then joins token and dev metrics data", () => {
        const results = getEnrichedSessionData(devMetricsDb, opencodeDb)

        expect(results.length).toBeGreaterThan(0)

        const first = results[0]
        expect(first.sessionId.length > 0).toBe(true)
        expect(first.projectName.length > 0).toBe(true)
        expect(first.gitBranch.length > 0).toBe(true)
        expect(first.tokens.total).toBeGreaterThan(0)
        expect(first.calls).toBeGreaterThan(0)
        expect(first.commits >= 0).toBe(true)
        expect(first.linesAdded >= 0).toBe(true)
      })

      test("#then supports date filters", () => {
        const since = new Date("2026-03-11T00:00:00Z")
        const until = new Date("2026-03-12T00:00:00Z")

        const results = getEnrichedSessionData(devMetricsDb, opencodeDb, { since, until })

        expect(results.every((r) => r.createdAt >= since.toISOString())).toBe(true)
      })
    })
  })

  describe("#given multiple projects", () => {
    describe("#when aggregating by project", () => {
      test("#then aggregates calls and tokens by project", () => {
        const results = getAggregatedByProject(devMetricsDb, opencodeDb)

        expect(results.length).toBeGreaterThan(0)

        const projectA = results.find((r) => r.label === "project-a")
        expect(projectA !== undefined).toBe(true)
        if (projectA) {
          expect(projectA.sessions).toBe(2)
          expect(projectA.tokens.total).toBeGreaterThan(0)
          expect(projectA.commits).toBeGreaterThan(0)
        }
      })

      test("#then sorts by total tokens descending", () => {
        const results = getAggregatedByProject(devMetricsDb, opencodeDb)

        for (let i = 1; i < results.length; i++) {
          expect(results[i - 1].tokens.total >= results[i].tokens.total).toBe(true)
        }
      })
    })
  })

  describe("#given multiple branches", () => {
    describe("#when aggregating by branch", () => {
      test("#then aggregates calls and tokens by branch", () => {
        const results = getAggregatedByBranch(devMetricsDb, opencodeDb)

        expect(results.length).toBeGreaterThan(0)
        const mainBranch = results.find((r) => r.label === "main")
        expect(mainBranch !== undefined).toBe(true)
        if (mainBranch) {
          expect(mainBranch.sessions).toBeGreaterThan(0)
          expect(mainBranch.tokens.total).toBeGreaterThan(0)
        }
      })
    })
  })

  describe("#given project-branch combinations", () => {
    describe("#when aggregating by project branch", () => {
      test("#then includes project and branch fields", () => {
        const results = getAggregatedByProjectBranch(devMetricsDb, opencodeDb)

        expect(results.length).toBeGreaterThan(0)
        const first = results[0]
        expect(first.project.length > 0).toBe(true)
        expect(first.branch.length > 0).toBe(true)
        expect(first.label).toBe(`${first.project}:${first.branch}`)
      })
    })
  })
})

function setupDevMetricsTestData(dbPath: string): void {
  const db = new Database(dbPath)

  db.prepare(`
    INSERT INTO session_context (session_id, project_path, project_name, git_remote, git_branch, created_at)
    VALUES
      ('sess-1', '/path/a', 'project-a', 'https://github.com/user/a', 'main', '2026-03-10T10:00:00Z'),
      ('sess-2', '/path/a', 'project-a', 'https://github.com/user/a', 'dev', '2026-03-11T10:00:00Z'),
      ('sess-3', '/path/b', 'project-b', 'https://github.com/user/b', 'main', '2026-03-12T10:00:00Z')
  `).run()

  db.prepare(`
    INSERT INTO session_outcome (session_id, commits_made, files_changed, lines_added, lines_removed, duration_minutes, branch_switched)
    VALUES
      ('sess-1', 3, 5, 120, 30, 45, 0),
      ('sess-2', 2, 3, 80, 10, 30, 0),
      ('sess-3', 4, 7, 200, 50, 60, 0)
  `).run()

  db.close()
}

function setupOpenCodeTestData(dbPath: string): void {
  const db = new Database(dbPath)

  db.prepare(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      title TEXT,
      data TEXT NOT NULL
    )
  `).run()

  db.prepare(`
    CREATE TABLE IF NOT EXISTS message (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      data TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES session(id)
    )
  `).run()

  const sess1Time = new Date("2026-03-10T10:00:00Z").getTime()
  const sess2Time = new Date("2026-03-11T10:00:00Z").getTime()
  const sess3Time = new Date("2026-03-12T10:00:00Z").getTime()

  db.prepare(`
    INSERT INTO session (id, title, data) VALUES (?, ?, ?)
  `).run(
    "sess-1",
    "Session 1",
    JSON.stringify({
      id: "sess-1",
      time: { created: sess1Time },
    }),
  )

  db.prepare(`
    INSERT INTO session (id, title, data) VALUES (?, ?, ?)
  `).run(
    "sess-2",
    "Session 2",
    JSON.stringify({
      id: "sess-2",
      time: { created: sess2Time },
    }),
  )

  db.prepare(`
    INSERT INTO session (id, title, data) VALUES (?, ?, ?)
  `).run(
    "sess-3",
    "Session 3",
    JSON.stringify({
      id: "sess-3",
      time: { created: sess3Time },
    }),
  )

  db.prepare(`INSERT INTO message (id, session_id, data) VALUES (?, ?, ?)`).run(
    "msg-1",
    "sess-1",
    JSON.stringify({
      id: "msg-1",
      session_id: "sess-1",
      role: "assistant",
      agent: "sisyphus",
      modelID: "claude-opus-4-6",
      provider: "anthropic",
      time: { created: sess1Time + 5000 },
      tokens: {
        input: 1000,
        output: 500,
        reasoning: 200,
        cache: { read: 100, write: 50 },
        total: 1850,
      },
      cost: 0.025,
    }),
  )

  db.prepare(`INSERT INTO message (id, session_id, data) VALUES (?, ?, ?)`).run(
    "msg-2",
    "sess-2",
    JSON.stringify({
      id: "msg-2",
      session_id: "sess-2",
      role: "assistant",
      agent: "sisyphus",
      modelID: "claude-opus-4-6",
      provider: "anthropic",
      time: { created: sess2Time + 5000 },
      tokens: {
        input: 800,
        output: 400,
        reasoning: 150,
        cache: { read: 80, write: 40 },
        total: 1470,
      },
      cost: 0.02,
    }),
  )

  db.prepare(`INSERT INTO message (id, session_id, data) VALUES (?, ?, ?)`).run(
    "msg-3",
    "sess-3",
    JSON.stringify({
      id: "msg-3",
      session_id: "sess-3",
      role: "assistant",
      agent: "hephaestus",
      modelID: "gpt-5.3-codex",
      provider: "openai",
      time: { created: sess3Time + 5000 },
      tokens: {
        input: 1200,
        output: 600,
        reasoning: 250,
        cache: { read: 120, write: 60 },
        total: 2230,
      },
      cost: 0.03,
    }),
  )

  db.close()
}
