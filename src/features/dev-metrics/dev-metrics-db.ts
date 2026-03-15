import { Database } from "bun:sqlite"
import { join } from "node:path"
import { existsSync, mkdirSync } from "node:fs"
import { getDataDir } from "../../shared/data-path"
import type { SessionContext, GitSnapshot, SessionOutcome } from "./types"
import {
  CREATE_SESSION_CONTEXT_TABLE,
  CREATE_GIT_SNAPSHOT_TABLE,
  CREATE_SESSION_OUTCOME_TABLE,
  CREATE_INDICES,
} from "./schema"

export class DevMetricsDB {
  private readonly db: Database
  private readonly path: string

  constructor(dbPath?: string) {
    this.path = dbPath ?? join(getDataDir(), "oh-my-magento", "dev-metrics.db")

    const dir = this.path.substring(0, this.path.lastIndexOf("/"))
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }

    this.db = new Database(this.path)
    this.initializeSchema()
  }

  private initializeSchema(): void {
    this.db.prepare(CREATE_SESSION_CONTEXT_TABLE).run()
    this.db.prepare(CREATE_GIT_SNAPSHOT_TABLE).run()
    this.db.prepare(CREATE_SESSION_OUTCOME_TABLE).run()
    for (const indexSql of CREATE_INDICES) {
      this.db.prepare(indexSql).run()
    }
  }
  insertSessionContext(context: SessionContext): void {
    const stmt = this.db.prepare(`
      INSERT INTO session_context (session_id, project_path, project_name, git_remote, git_branch, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      context.session_id,
      context.project_path,
      context.project_name,
      context.git_remote,
      context.git_branch,
      context.created_at,
    )
  }
  insertGitSnapshot(snapshot: GitSnapshot): void {
    const stmt = this.db.prepare(`
      INSERT INTO git_snapshot (session_id, snapshot_type, branch, head_commit, files_staged, files_changed, insertions, deletions, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      snapshot.session_id,
      snapshot.snapshot_type,
      snapshot.branch,
      snapshot.head_commit,
      snapshot.files_staged,
      snapshot.files_changed,
      snapshot.insertions,
      snapshot.deletions,
      snapshot.timestamp,
    )
  }
  upsertSessionOutcome(outcome: SessionOutcome): void {
    const stmt = this.db.prepare(`
      INSERT INTO session_outcome (session_id, commits_made, files_changed, lines_added, lines_removed, duration_minutes, branch_switched)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        commits_made = excluded.commits_made,
        files_changed = excluded.files_changed,
        lines_added = excluded.lines_added,
        lines_removed = excluded.lines_removed,
        duration_minutes = excluded.duration_minutes,
        branch_switched = excluded.branch_switched
    `)
    stmt.run(
      outcome.session_id,
      outcome.commits_made,
      outcome.files_changed,
      outcome.lines_added,
      outcome.lines_removed,
      outcome.duration_minutes,
      outcome.branch_switched ? 1 : 0,
    )
  }
  getSessionContext(sessionId: string): SessionContext | null {
    const stmt = this.db.prepare("SELECT * FROM session_context WHERE session_id = ?")
    const row = stmt.get(sessionId) as Record<string, unknown> | undefined
    if (!row) return null
    return {
      session_id: row.session_id as string,
      project_path: row.project_path as string,
      project_name: row.project_name as string,
      git_remote: row.git_remote as string | null,
      git_branch: row.git_branch as string,
      created_at: row.created_at as string,
    }
  }
  getSnapshotsForSession(sessionId: string): GitSnapshot[] {
    const stmt = this.db.prepare(
      "SELECT * FROM git_snapshot WHERE session_id = ? ORDER BY timestamp",
    )
    const rows = stmt.all(sessionId) as Array<Record<string, unknown>>
    return rows.map((row) => ({
      id: row.id as number,
      session_id: row.session_id as string,
      snapshot_type: row.snapshot_type as "start" | "end",
      branch: row.branch as string,
      head_commit: row.head_commit as string,
      files_staged: row.files_staged as number,
      files_changed: row.files_changed as number,
      insertions: row.insertions as number,
      deletions: row.deletions as number,
      timestamp: row.timestamp as string,
    }))
  }
  getOutcome(sessionId: string): SessionOutcome | null {
    const stmt = this.db.prepare("SELECT * FROM session_outcome WHERE session_id = ?")
    const row = stmt.get(sessionId) as Record<string, unknown> | undefined
    if (!row) return null
    return {
      session_id: row.session_id as string,
      commits_made: row.commits_made as number,
      files_changed: row.files_changed as number,
      lines_added: row.lines_added as number,
      lines_removed: row.lines_removed as number,
      duration_minutes: row.duration_minutes as number,
      branch_switched: Boolean(row.branch_switched),
    }
  }
  getContextsByProject(
    projectName: string,
    dateRange?: { since?: Date; until?: Date },
  ): SessionContext[] {
    let sql = "SELECT * FROM session_context WHERE project_name = ?"
    const params: Array<string | number> = [projectName]

    if (dateRange?.since) {
      sql += " AND created_at >= ?"
      params.push(dateRange.since.toISOString())
    }
    if (dateRange?.until) {
      sql += " AND created_at < ?"
      params.push(dateRange.until.toISOString())
    }

    const stmt = this.db.prepare(sql)
    const rows = stmt.all(...params) as Array<Record<string, unknown>>
    return rows.map((row) => ({
      session_id: row.session_id as string,
      project_path: row.project_path as string,
      project_name: row.project_name as string,
      git_remote: row.git_remote as string | null,
      git_branch: row.git_branch as string,
      created_at: row.created_at as string,
    }))
  }
  getContextsByBranch(
    branch: string,
    dateRange?: { since?: Date; until?: Date },
  ): SessionContext[] {
    let sql = "SELECT * FROM session_context WHERE git_branch = ?"
    const params: Array<string | number> = [branch]

    if (dateRange?.since) {
      sql += " AND created_at >= ?"
      params.push(dateRange.since.toISOString())
    }
    if (dateRange?.until) {
      sql += " AND created_at < ?"
      params.push(dateRange.until.toISOString())
    }

    const stmt = this.db.prepare(sql)
    const rows = stmt.all(...params) as Array<Record<string, unknown>>
    return rows.map((row) => ({
      session_id: row.session_id as string,
      project_path: row.project_path as string,
      project_name: row.project_name as string,
      git_remote: row.git_remote as string | null,
      git_branch: row.git_branch as string,
      created_at: row.created_at as string,
    }))
  }
  close(): void {
    this.db.close()
  }
}
