import { execFileSync } from "node:child_process"
import type { GitSnapshot, SessionOutcome } from "./types"

export function isGitRepo(directory: string): boolean {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    })
    return true
  } catch {
    return false
  }
}

export function getGitRemote(directory: string): string | null {
  try {
    const output = execFileSync("git", ["remote", "get-url", "origin"], {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    })
    return output.trim() || null
  } catch {
    return null
  }
}

export function getGitBranch(directory: string): string {
  try {
    const output = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    })
    return output.trim() || "unknown"
  } catch {
    return "unknown"
  }
}

export function getHeadCommit(directory: string): string {
  try {
    const output = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    })
    return output.trim()
  } catch {
    return "unknown"
  }
}

export function getGitDiffStats(directory: string): {
  filesChanged: number
  insertions: number
  deletions: number
} {
  try {
    const output = execFileSync("git", ["diff", "--stat"], {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    })
    const lines = output.trim().split("\n")
    const summaryLine = lines[lines.length - 1] || ""
    
    const filesMatch = summaryLine.match(/(\d+) file/)
    const insertionsMatch = summaryLine.match(/(\d+) insertion/)
    const deletionsMatch = summaryLine.match(/(\d+) deletion/)
    
    return {
      filesChanged: filesMatch ? parseInt(filesMatch[1], 10) : 0,
      insertions: insertionsMatch ? parseInt(insertionsMatch[1], 10) : 0,
      deletions: deletionsMatch ? parseInt(deletionsMatch[1], 10) : 0,
    }
  } catch {
    return { filesChanged: 0, insertions: 0, deletions: 0 }
  }
}

export function getStagedFiles(directory: string): number {
  try {
    const output = execFileSync("git", ["diff", "--cached", "--numstat"], {
      cwd: directory,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    })
    return output.trim() ? output.trim().split("\n").length : 0
  } catch {
    return 0
  }
}

export function captureGitSnapshot(
  directory: string,
  sessionId: string,
  snapshotType: "start" | "end"
): GitSnapshot | null {
  if (!isGitRepo(directory)) {
    return null
  }

  const diffStats = getGitDiffStats(directory)
  
  return {
    session_id: sessionId,
    snapshot_type: snapshotType,
    branch: getGitBranch(directory),
    head_commit: getHeadCommit(directory),
    files_staged: getStagedFiles(directory),
    files_changed: diffStats.filesChanged,
    insertions: diffStats.insertions,
    deletions: diffStats.deletions,
    timestamp: new Date().toISOString(),
  }
}

export function computeSessionOutcome(
  startSnapshot: GitSnapshot,
  endSnapshot: GitSnapshot,
  directory: string
): SessionOutcome {
  let commitsMade = 0
  try {
    const output = execFileSync(
      "git",
      ["log", "--oneline", `${startSnapshot.head_commit}..${endSnapshot.head_commit}`],
      {
        cwd: directory,
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      }
    )
    commitsMade = output.trim() ? output.trim().split("\n").length : 0
  } catch {
    commitsMade = 0
  }

  let linesAdded = 0
  let linesRemoved = 0
  let filesChanged = 0
  
  try {
    const output = execFileSync(
      "git",
      ["diff", "--numstat", `${startSnapshot.head_commit}..${endSnapshot.head_commit}`],
      {
        cwd: directory,
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      }
    )
    
    const lines = output.trim().split("\n")
    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(\d+)\s+/)
      if (match) {
        linesAdded += parseInt(match[1], 10)
        linesRemoved += parseInt(match[2], 10)
        filesChanged++
      }
    }
  } catch {
    linesAdded = endSnapshot.insertions
    linesRemoved = endSnapshot.deletions
    filesChanged = endSnapshot.files_changed
  }

  const startTime = new Date(startSnapshot.timestamp).getTime()
  const endTime = new Date(endSnapshot.timestamp).getTime()
  const durationMinutes = Math.max(0, Math.round((endTime - startTime) / 60000))

  return {
    session_id: startSnapshot.session_id,
    commits_made: commitsMade,
    files_changed: filesChanged,
    lines_added: linesAdded,
    lines_removed: linesRemoved,
    duration_minutes: durationMinutes,
    branch_switched: startSnapshot.branch !== endSnapshot.branch,
  }
}
