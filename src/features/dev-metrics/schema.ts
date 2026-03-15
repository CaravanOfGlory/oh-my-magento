export const CREATE_SESSION_CONTEXT_TABLE = `
  CREATE TABLE IF NOT EXISTS session_context (
    session_id TEXT PRIMARY KEY,
    project_path TEXT NOT NULL,
    project_name TEXT NOT NULL,
    git_remote TEXT,
    git_branch TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`;

export const CREATE_GIT_SNAPSHOT_TABLE = `
  CREATE TABLE IF NOT EXISTS git_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    snapshot_type TEXT NOT NULL CHECK(snapshot_type IN ('start', 'end')),
    branch TEXT NOT NULL,
    head_commit TEXT NOT NULL,
    files_staged INTEGER NOT NULL DEFAULT 0,
    files_changed INTEGER NOT NULL DEFAULT 0,
    insertions INTEGER NOT NULL DEFAULT 0,
    deletions INTEGER NOT NULL DEFAULT 0,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES session_context(session_id)
  )
`;

export const CREATE_SESSION_OUTCOME_TABLE = `
  CREATE TABLE IF NOT EXISTS session_outcome (
    session_id TEXT PRIMARY KEY,
    commits_made INTEGER NOT NULL DEFAULT 0,
    files_changed INTEGER NOT NULL DEFAULT 0,
    lines_added INTEGER NOT NULL DEFAULT 0,
    lines_removed INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    branch_switched INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES session_context(session_id)
  )
`;

export const CREATE_INDICES = [
  `CREATE INDEX IF NOT EXISTS idx_snapshot_session ON git_snapshot(session_id)`,
  `CREATE INDEX IF NOT EXISTS idx_snapshot_type ON git_snapshot(snapshot_type)`,
  `CREATE INDEX IF NOT EXISTS idx_context_project ON session_context(project_name)`,
  `CREATE INDEX IF NOT EXISTS idx_context_branch ON session_context(git_branch)`,
  `CREATE INDEX IF NOT EXISTS idx_context_created ON session_context(created_at)`
];
