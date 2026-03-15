import type { Database } from "bun:sqlite"
import type { DevMetricsDB } from "../../features/dev-metrics"

export interface OpenCodeDBWithPath {
  path: string
}

export const DEFAULT_TITLE = "(untitled)"

export const BASE_SELECT = `
  SELECT
    sc.session_id AS session_id,
    COALESCE(s.title, '${DEFAULT_TITLE}') AS title,
    sc.project_path AS project_path,
    sc.project_name AS project_name,
    sc.git_remote AS git_remote,
    sc.git_branch AS git_branch,
    sc.created_at AS created_at,
    COUNT(m.id) AS calls,
    COALESCE(SUM(json_extract(m.data, '$.tokens.input')), 0) AS input_tokens,
    COALESCE(SUM(json_extract(m.data, '$.tokens.output')), 0) AS output_tokens,
    COALESCE(SUM(json_extract(m.data, '$.tokens.reasoning')), 0) AS reasoning_tokens,
    COALESCE(SUM(json_extract(m.data, '$.tokens.cache.read')), 0) AS cache_read,
    COALESCE(SUM(json_extract(m.data, '$.tokens.cache.write')), 0) AS cache_write,
    COALESCE(SUM(json_extract(m.data, '$.tokens.total')), 0) AS total_tokens,
    COALESCE(SUM(json_extract(m.data, '$.cost')), 0) AS cost,
    COALESCE(so.commits_made, 0) AS commits,
    COALESCE(so.lines_added, 0) AS lines_added
  FROM dev.session_context sc
  LEFT JOIN dev.session_outcome so ON so.session_id = sc.session_id
  LEFT JOIN message m
    ON m.session_id = sc.session_id
    AND json_extract(m.data, '$.role') = 'assistant'
    AND json_extract(m.data, '$.tokens.total') IS NOT NULL
  LEFT JOIN session s ON s.id = sc.session_id
`

export function attachDevMetricsDb(db: Database, devMetricsDb: DevMetricsDB): void {
  const devPath = (devMetricsDb as unknown as { path?: string }).path
  if (!devPath) {
    throw new Error("Dev metrics database path unavailable for cross-db query")
  }
  db.exec(`ATTACH DATABASE '${devPath}' AS dev`)
}
