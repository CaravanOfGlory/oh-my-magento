import { DevMetricsDB } from "../../features/dev-metrics"
import type { DimensionBreakdownEntry } from "../../features/dev-metrics"
import type { OpenCodeDB } from "./opencode-db"
import { getAggregatedByBranch, getAggregatedByProject } from "./cross-db-query"
import type { ProjectAggregation, BranchAggregation } from "./cross-db-query-types"

type Aggregation = ProjectAggregation | BranchAggregation

function mapToBreakdownEntry(agg: Aggregation): DimensionBreakdownEntry {
  return {
    label: agg.label,
    sessions: agg.sessions,
    tokens: agg.tokens.total,
    cost: agg.cost,
    commits: agg.commits,
    lines_added: agg.linesAdded,
  }
}

export function fetchBreakdowns(
  opencodeDb: OpenCodeDB,
  devMetricsDbPath: string,
  dateRange?: { since?: Date; until?: Date },
): { project: DimensionBreakdownEntry[]; branch: DimensionBreakdownEntry[] } {
  let devMetricsDb: DevMetricsDB | undefined
  try {
    devMetricsDb = new DevMetricsDB(devMetricsDbPath)
    const projectAggs = getAggregatedByProject(devMetricsDb, opencodeDb, dateRange)
    const branchAggs = getAggregatedByBranch(devMetricsDb, opencodeDb, dateRange)
    return {
      project: projectAggs.map(mapToBreakdownEntry),
      branch: branchAggs.map(mapToBreakdownEntry),
    }
  } catch {
    return { project: [], branch: [] }
  } finally {
    devMetricsDb?.close()
  }
}
