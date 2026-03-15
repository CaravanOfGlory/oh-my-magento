import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { DevMetricsDB } from "./dev-metrics-db"
import type { SessionContext, GitSnapshot, SessionOutcome } from "./types"

describe("DevMetricsDB", () => {
  let tempDir: string
  let dbPath: string
  let db: DevMetricsDB

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "dev-metrics-test-"))
    dbPath = join(tempDir, "test.db")
    db = new DevMetricsDB(dbPath)
  })

  afterEach(() => {
    db.close()
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe("#schema initialization", () => {
    test("creates all 3 tables on construction", () => {
      const tables = db["db"]
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as Array<{ name: string }>
      const tableNames = tables.map((t) => t.name)

      expect(tableNames).toContain("session_context")
      expect(tableNames).toContain("git_snapshot")
      expect(tableNames).toContain("session_outcome")
    })

    test("creates indices on construction", () => {
      const indices = db["db"]
        .prepare("SELECT name FROM sqlite_master WHERE type='index'")
        .all() as Array<{ name: string }>
      const indexNames = indices.map((i) => i.name)

      expect(indexNames).toContain("idx_snapshot_session")
      expect(indexNames).toContain("idx_context_project")
    })
  })

  describe("#SessionContext operations", () => {
    test("#given valid context, when inserted, should retrieve correctly", () => {
      const context: SessionContext = {
        session_id: "sess_123",
        project_path: "/home/user/myproject",
        project_name: "myproject",
        git_remote: "git@github.com:user/myproject.git",
        git_branch: "main",
        created_at: new Date().toISOString(),
      }

      db.insertSessionContext(context)
      const retrieved = db.getSessionContext("sess_123")

      expect(retrieved).toEqual(context)
    })

    test("#when session not found, should return null", () => {
      const retrieved = db.getSessionContext("non_existent")
      expect(retrieved).toBeNull()
    })
  })

  describe("#GitSnapshot operations", () => {
    test("#given session context, when snapshot inserted, should retrieve with correct type", () => {
      const context: SessionContext = {
        session_id: "sess_456",
        project_path: "/home/user/project",
        project_name: "project",
        git_remote: null,
        git_branch: "feature",
        created_at: new Date().toISOString(),
      }
      db.insertSessionContext(context)

      const snapshot: GitSnapshot = {
        session_id: "sess_456",
        snapshot_type: "start",
        branch: "feature",
        head_commit: "abc123",
        files_staged: 2,
        files_changed: 5,
        insertions: 100,
        deletions: 20,
        timestamp: new Date().toISOString(),
      }

      db.insertGitSnapshot(snapshot)
      const snapshots = db.getSnapshotsForSession("sess_456")

      expect(snapshots).toHaveLength(1)
      expect(snapshots[0].session_id).toBe("sess_456")
      expect(snapshots[0].snapshot_type).toBe("start")
    })
  })

  describe("#SessionOutcome operations", () => {
    test("#given context, when outcome upserted, should retrieve correctly", () => {
      const context: SessionContext = {
        session_id: "sess_789",
        project_path: "/home/user/app",
        project_name: "app",
        git_remote: null,
        git_branch: "main",
        created_at: new Date().toISOString(),
      }
      db.insertSessionContext(context)

      const outcome: SessionOutcome = {
        session_id: "sess_789",
        commits_made: 3,
        files_changed: 10,
        lines_added: 150,
        lines_removed: 30,
        duration_minutes: 45,
        branch_switched: false,
      }

      db.upsertSessionOutcome(outcome)
      const retrieved = db.getOutcome("sess_789")

      expect(retrieved).toEqual(outcome)
    })

    test("#when upserting existing outcome, should update all fields", () => {
      const context: SessionContext = {
        session_id: "sess_upsert",
        project_path: "/home/user/app",
        project_name: "app",
        git_remote: null,
        git_branch: "main",
        created_at: new Date().toISOString(),
      }
      db.insertSessionContext(context)

      const outcome1: SessionOutcome = {
        session_id: "sess_upsert",
        commits_made: 1,
        files_changed: 5,
        lines_added: 50,
        lines_removed: 10,
        duration_minutes: 20,
        branch_switched: false,
      }
      db.upsertSessionOutcome(outcome1)

      const outcome2: SessionOutcome = {
        session_id: "sess_upsert",
        commits_made: 5,
        files_changed: 15,
        lines_added: 100,
        lines_removed: 20,
        duration_minutes: 60,
        branch_switched: true,
      }
      db.upsertSessionOutcome(outcome2)

      const retrieved = db.getOutcome("sess_upsert")
      expect(retrieved?.commits_made).toBe(5)
      expect(retrieved?.branch_switched).toBe(true)
    })
  })

  describe("#aggregate queries", () => {
    test("#given multiple projects, getContextsByProject filters correctly", () => {
      const ctx1: SessionContext = {
        session_id: "s1",
        project_path: "/home/user/proj-a",
        project_name: "project-alpha",
        git_remote: null,
        git_branch: "main",
        created_at: new Date().toISOString(),
      }
      const ctx2: SessionContext = {
        session_id: "s2",
        project_path: "/home/user/proj-b",
        project_name: "project-beta",
        git_remote: null,
        git_branch: "dev",
        created_at: new Date().toISOString(),
      }
      const ctx3: SessionContext = {
        session_id: "s3",
        project_path: "/home/user/proj-a",
        project_name: "project-alpha",
        git_remote: null,
        git_branch: "feature",
        created_at: new Date().toISOString(),
      }

      db.insertSessionContext(ctx1)
      db.insertSessionContext(ctx2)
      db.insertSessionContext(ctx3)

      const alphaContexts = db.getContextsByProject("project-alpha")
      expect(alphaContexts).toHaveLength(2)
      expect(alphaContexts.map((c) => c.session_id).sort()).toEqual(["s1", "s3"])

      const betaContexts = db.getContextsByProject("project-beta")
      expect(betaContexts).toHaveLength(1)
      expect(betaContexts[0].session_id).toBe("s2")
    })

    test("#given multiple branches, getContextsByBranch filters correctly", () => {
      const ctx1: SessionContext = {
        session_id: "s1",
        project_path: "/home/user/app",
        project_name: "app",
        git_remote: null,
        git_branch: "main",
        created_at: new Date().toISOString(),
      }
      const ctx2: SessionContext = {
        session_id: "s2",
        project_path: "/home/user/app",
        project_name: "app",
        git_remote: null,
        git_branch: "feature-x",
        created_at: new Date().toISOString(),
      }
      const ctx3: SessionContext = {
        session_id: "s3",
        project_path: "/home/user/app",
        project_name: "app",
        git_remote: null,
        git_branch: "main",
        created_at: new Date().toISOString(),
      }

      db.insertSessionContext(ctx1)
      db.insertSessionContext(ctx2)
      db.insertSessionContext(ctx3)

      const mainContexts = db.getContextsByBranch("main")
      expect(mainContexts).toHaveLength(2)

      const featureContexts = db.getContextsByBranch("feature-x")
      expect(featureContexts).toHaveLength(1)
    })

    test("#when filtering by date range, returns only sessions within range", () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const ctx1: SessionContext = {
        session_id: "s1",
        project_path: "/home/user/app",
        project_name: "myproject",
        git_remote: null,
        git_branch: "main",
        created_at: yesterday.toISOString(),
      }
      const ctx2: SessionContext = {
        session_id: "s2",
        project_path: "/home/user/app",
        project_name: "myproject",
        git_remote: null,
        git_branch: "main",
        created_at: lastWeek.toISOString(),
      }

      db.insertSessionContext(ctx1)
      db.insertSessionContext(ctx2)

      const recentContexts = db.getContextsByProject("myproject", {
        since: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      })
      expect(recentContexts).toHaveLength(1)
      expect(recentContexts[0].session_id).toBe("s1")
    })
  })
})
