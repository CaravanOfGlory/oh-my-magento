import { createConnection, createTimeFilter } from "./opencode-db-connection"

export function cacheEfficiency(
  dbPath: string,
  since?: Date,
  until?: Date,
): Array<{ model: string; hitRate: number }> {
  const { clause, params } = createTimeFilter(since, until)

  const sql = `
    SELECT
      json_extract(data, '$.modelID') AS model,
      COALESCE(SUM(json_extract(data, '$.tokens.cache.read')), 0) AS cache_read,
      COALESCE(SUM(json_extract(data, '$.tokens.input')), 0) AS input_tokens
    FROM message
    WHERE json_extract(data, '$.role') = 'assistant'
      AND json_extract(data, '$.tokens.total') IS NOT NULL
      ${clause}
    GROUP BY model
  `

  const db = createConnection(dbPath)
  try {
    const rows = db.prepare(sql).all(...params) as Array<Record<string, unknown>>
    const result: Array<{ model: string; hitRate: number }> = []

    for (const r of rows) {
      const model = r.model as string
      const cacheRead = r.cache_read as number
      const inputTokens = r.input_tokens as number
      const denominator = inputTokens + cacheRead
      if (model && denominator > 0) {
        result.push({ model, hitRate: cacheRead / denominator })
      }
    }

    return result
  } finally {
    db.close()
  }
}
