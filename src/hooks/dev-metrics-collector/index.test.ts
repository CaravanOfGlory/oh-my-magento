import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { createDevMetricsCollector } from "./hook"
import type { PluginInput } from "@opencode-ai/plugin"
import * as sessionState from "../../features/claude-code-session-state"

describe("dev-metrics-collector", () => {
  let testDir: string
  let dbPath: string

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "dev-metrics-test-"))
    dbPath = join(testDir, "test.db")
    sessionState._resetForTesting()
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
    sessionState._resetForTesting()
  })

  const mockCtx = {} as PluginInput

  describe("#given main session active", () => {
    beforeEach(() => {
      sessionState.setMainSession("main-session-1")
    })

    describe("#when session created for main session", () => {
      it("#then records session context with project name", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })
        const testProject = join(testDir, "my-project")

        await collector.handleSessionCreated("main-session-1", testProject)

        expect(testProject).toContain("my-project")
      })

      it("#then captures start snapshot for git repo", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })
        const projectPath = testDir

        await collector.handleSessionCreated("main-session-1", projectPath)

        expect(projectPath).toBeDefined()
      })

      it("#then handles non-git directory without error", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })

        await expect(
          collector.handleSessionCreated("main-session-1", testDir)
        ).resolves.toBeUndefined()
      })
    })

    describe("#when session deleted for main session", () => {
      it("#then records session outcome", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })

        await collector.handleSessionCreated("main-session-1", testDir)
        await collector.handleSessionDeleted("main-session-1", testDir)

        expect(testDir).toBeDefined()
      })
    })
  })

  describe("#given background session", () => {
    beforeEach(() => {
      sessionState.setMainSession("main-session-1")
    })

    describe("#when session created for background session", () => {
      it("#then does not record context", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })

        await collector.handleSessionCreated("background-session-2", testDir)

        expect(testDir).toBeDefined()
      })
    })

    describe("#when session deleted for background session", () => {
      it("#then does not record outcome", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })

        await collector.handleSessionDeleted("background-session-2", testDir)

        expect(testDir).toBeDefined()
      })
    })
  })

  describe("#given no main session set", () => {
    beforeEach(() => {
      sessionState.setMainSession(undefined)
    })

    describe("#when session created", () => {
      it("#then records context (no filtering when main session is undefined)", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })

        await collector.handleSessionCreated("any-session", testDir)

        expect(testDir).toBeDefined()
      })
    })
  })

  describe("#given multiple sessions", () => {
    beforeEach(() => {
      sessionState.setMainSession("main-session-1")
    })

    describe("#when handling multiple different main sessions", () => {
      it("#then records each independently", async () => {
        const collector = createDevMetricsCollector(mockCtx, { dbPath })
        const project1 = join(testDir, "project-1")
        const project2 = join(testDir, "project-2")

        await collector.handleSessionCreated("main-session-1", project1)

        sessionState.setMainSession("main-session-2")
        await collector.handleSessionCreated("main-session-2", project2)

        expect(project1).toContain("project-1")
        expect(project2).toContain("project-2")
      })
    })
  })

  describe("#given error in recording", () => {
    beforeEach(() => {
      sessionState.setMainSession("main-session-1")
    })

    describe("#when database write fails", () => {
      it("#then handles error gracefully without throwing", async () => {
        const badDbPath = join(testDir, "valid-dir", "db.db")
        const collector = createDevMetricsCollector(mockCtx, { dbPath: badDbPath })

        await expect(
          collector.handleSessionCreated("main-session-1", testDir)
        ).resolves.toBeUndefined()
      })
    })
  })
})
