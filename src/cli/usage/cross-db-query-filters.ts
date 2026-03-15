export interface FilterResult {
  filters: Array<string>
  params: Array<string | number>
}

export function createDateFilters(dateRange?: { since?: Date; until?: Date }): FilterResult {
  const filters: Array<string> = []
  const params: Array<string | number> = []

  if (dateRange?.since) {
    filters.push("sc.created_at >= ?")
    params.push(dateRange.since.toISOString())
  }
  if (dateRange?.until) {
    filters.push("sc.created_at < ?")
    params.push(dateRange.until.toISOString())
  }

  return { filters, params }
}

export function createTokenFilters(dateRange?: { since?: Date; until?: Date }): FilterResult {
  const filters: Array<string> = []
  const params: Array<string | number> = []

  if (dateRange?.since) {
    filters.push("json_extract(m.data, '$.time.created') >= ?")
    params.push(dateRange.since.getTime())
  }
  if (dateRange?.until) {
    filters.push("json_extract(m.data, '$.time.created') < ?")
    params.push(dateRange.until.getTime())
  }

  return { filters, params }
}

export function buildWhere(filters: Array<string>): string {
  if (filters.length === 0) return ""
  return `WHERE ${filters.join(" AND ")}`
}
