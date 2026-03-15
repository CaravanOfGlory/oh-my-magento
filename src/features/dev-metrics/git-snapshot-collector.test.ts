import { describe, it, expect, beforeEach, afterEach } from "bun:test"
import { mkdtempSync, rmSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { join } from "node:path"
import { tmpdir } from "node:os"
import {
  isGitRepo,
  getGitRemote,
  getGitBranch,
  getHeadCommit,
  getGitDiffStats,
  getStagedFiles,
  captureGitSnapshot,
  computeSessionOutcome,
} from "./git-snapshot-collector"
import type { GitSnapshot } from "./types"

describe("git-snapshot-collector", () => {
  let testDir: string

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), "git-test-"))
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe("#given non-git directory", () => {
    describe("#when isGitRepo is called", () => {
      it("#then returns false", () => {
        expect(isGitRepo(testDir)).toBe(false)
      })
    })

    describe("#when captureGitSnapshot is called", () => {
      it("#then returns null", () => {
        const snapshot = captureGitSnapshot(testDir, "session-1", "start")
        expect(snapshot).toBeNull()
      })
    })
  })

  describe("#given git repository", () => {
    beforeEach(() => {
      execFileSync("git", ["init"], { cwd: testDir })
      execFileSync("git", ["config", "user.name", "Test User"], { cwd: testDir })
      execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: testDir })
      execFileSync("bash", ["-c", "echo 'test' > file.txt"], { cwd: testDir })
      execFileSync("git", ["add", "file.txt"], { cwd: testDir })
      execFileSync("git", ["commit", "-m", "Initial commit"], { cwd: testDir })
    })

    describe("#when isGitRepo is called", () => {
      it("#then returns true", () => {
        expect(isGitRepo(testDir)).toBe(true)
      })
    })

    describe("#when getGitBranch is called", () => {
      it("#then returns current branch name", () => {
        const branch = getGitBranch(testDir)
        expect(branch).toMatch(/main|master/)
      })
    })

    describe("#when getGitRemote is called without remote", () => {
      it("#then returns null", () => {
        expect(getGitRemote(testDir)).toBeNull()
      })
    })

    describe("#when getGitRemote is called with remote", () => {
      beforeEach(() => {
        execFileSync("git", ["remote", "add", "origin", "https://github.com/test/repo.git"], {
          cwd: testDir,
        })
      })

      it("#then returns remote URL", () => {
        expect(getGitRemote(testDir)).toBe("https://github.com/test/repo.git")
      })
    })

    describe("#when getHeadCommit is called without commits", () => {
      beforeEach(() => {
        execFileSync("git", ["init", testDir + "-no-commits"], { cwd: testDir })
      })

      it("#then returns unknown", () => {
        expect(getHeadCommit(testDir + "-no-commits")).toBe("unknown")
      })
    })

    describe("#when getHeadCommit is called with commits", () => {
      it("#then returns commit hash", () => {
        const commit = getHeadCommit(testDir)
        expect(commit).toMatch(/^[0-9a-f]{40}$/)
      })
    })

    describe("#when getGitDiffStats is called with no changes", () => {
      it("#then returns zero stats", () => {
        const stats = getGitDiffStats(testDir)
        expect(stats).toEqual({ filesChanged: 0, insertions: 0, deletions: 0 })
      })
    })

    describe("#when getGitDiffStats is called with unstaged changes", () => {
      beforeEach(() => {
        execFileSync("bash", ["-c", "echo 'modified' >> file.txt"], { cwd: testDir })
      })

      it("#then returns diff statistics", () => {
        const stats = getGitDiffStats(testDir)
        expect(stats.filesChanged).toBeGreaterThan(0)
        expect(stats.insertions).toBeGreaterThan(0)
      })
    })

    describe("#when getStagedFiles is called with no staged files", () => {
      it("#then returns zero", () => {
        expect(getStagedFiles(testDir)).toBe(0)
      })
    })

    describe("#when getStagedFiles is called with staged files", () => {
      beforeEach(() => {
        execFileSync("bash", ["-c", "echo 'new-file' > file2.txt"], { cwd: testDir })
        execFileSync("git", ["add", "file2.txt"], { cwd: testDir })
      })

      it("#then returns count of staged files", () => {
        expect(getStagedFiles(testDir)).toBe(1)
      })
    })

    describe("#when captureGitSnapshot is called", () => {
      it("#then returns valid snapshot", () => {
        const snapshot = captureGitSnapshot(testDir, "session-1", "start")
        expect(snapshot).not.toBeNull()
        expect(snapshot?.session_id).toBe("session-1")
        expect(snapshot?.snapshot_type).toBe("start")
        expect(snapshot?.branch).toMatch(/main|master/)
        expect(snapshot?.head_commit).toMatch(/^[0-9a-f]{40}$/)
        expect(snapshot?.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      })
    })

    describe("#when computeSessionOutcome is called", () => {
      let startSnapshot: GitSnapshot
      let endSnapshot: GitSnapshot

      beforeEach(() => {
        const snap1 = captureGitSnapshot(testDir, "session-1", "start")
        if (!snap1) throw new Error("Failed to capture start snapshot")
        startSnapshot = snap1

        execFileSync("bash", ["-c", "echo 'line2' >> file.txt"], { cwd: testDir })
        execFileSync("git", ["add", "file.txt"], { cwd: testDir })
        execFileSync("git", ["commit", "-m", "Second commit"], { cwd: testDir })

        const snap2 = captureGitSnapshot(testDir, "session-1", "end")
        if (!snap2) throw new Error("Failed to capture end snapshot")
        endSnapshot = snap2
      })

      it("#then returns outcome with commits made", () => {
        const outcome = computeSessionOutcome(startSnapshot, endSnapshot, testDir)
        expect(outcome.session_id).toBe("session-1")
        expect(outcome.commits_made).toBe(1)
        expect(outcome.files_changed).toBeGreaterThan(0)
        expect(outcome.lines_added).toBeGreaterThan(0)
        expect(outcome.branch_switched).toBe(false)
      })

      it("#then calculates duration correctly", () => {
        const outcome = computeSessionOutcome(startSnapshot, endSnapshot, testDir)
        expect(outcome.duration_minutes).toBeGreaterThanOrEqual(0)
      })
    })

    describe("#when computeSessionOutcome is called with branch switch", () => {
      let startSnapshot: GitSnapshot
      let endSnapshot: GitSnapshot

      beforeEach(() => {
        const snap1 = captureGitSnapshot(testDir, "session-1", "start")
        if (!snap1) throw new Error("Failed to capture start snapshot")
        startSnapshot = snap1

        execFileSync("git", ["checkout", "-b", "feature"], { cwd: testDir })

        const snap2 = captureGitSnapshot(testDir, "session-1", "end")
        if (!snap2) throw new Error("Failed to capture end snapshot")
        endSnapshot = snap2
      })

      it("#then detects branch switch", () => {
        const outcome = computeSessionOutcome(startSnapshot, endSnapshot, testDir)
        expect(outcome.branch_switched).toBe(true)
      })
    })
  })
})
