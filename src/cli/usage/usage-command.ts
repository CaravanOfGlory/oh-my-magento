import { Command } from "commander"
import { OpenCodeDB } from "./opencode-db"
import { renderSummary, renderDaily, renderGrouped, renderNoData } from "./render"
import { executeReport } from "./report-generator"
import type { UsageOptions, ReportOptions, GroupBy, UsageRow } from "./types"

function parseSince(value: string): Date {
  const match = value.trim().toLowerCase().match(/^(\d+)([dhwm])$/)
  if (match) {
    const n = parseInt(match[1], 10)
    const unit = match[2]
    const ms: Record<string, number> = {
      h: n * 3600_000,
      d: n * 86400_000,
      w: n * 7 * 86400_000,
      m: n * 30 * 86400_000,
    }
    return new Date(Date.now() - ms[unit])
  }

  const parsed = new Date(value)
  if (!isNaN(parsed.getTime())) return parsed

  throw new Error(`Invalid time spec: '${value}'. Use '7d', '2w', '30d', '3h', or ISO date.`)
}

function resolveSince(options: UsageOptions): { since: Date; period: string } {
  const now = new Date()

  if (options.since) {
    const since = parseSince(options.since)
    return { since, period: `Since ${since.toISOString().slice(0, 10)}` }
  }

  if (options.days !== undefined) {
    const since = new Date(now.getTime() - options.days * 86400_000)
    return { since, period: `Last ${options.days} days` }
  }

  const since = new Date(now.getTime() - 7 * 86400_000)
  return { since, period: "Last 7 days" }
}

function computeDeltas(
  current: Array<UsageRow>,
  previous: Array<UsageRow>,
): Array<number | undefined> {
  const prevMap = new Map<string, number>()
  for (const r of previous) {
    const key = r.detail ? `${r.label}:${r.detail}` : r.label
    prevMap.set(key, (prevMap.get(key) ?? 0) + r.tokens.total)
  }

  return current.map((r) => {
    const key = r.detail ? `${r.label}:${r.detail}` : r.label
    const prevVal = prevMap.get(key)
    if (prevVal && prevVal > 0) {
      return ((r.tokens.total - prevVal) / prevVal) * 100
    }
    return undefined
  })
}

function executeUsage(options: UsageOptions): number {
  try {
    const db = new OpenCodeDB()
    const { since, period } = resolveSince(options)
    const groupBy: GroupBy = options.by ?? "day"

    const rows = db.fetchRows(groupBy, since, undefined, options.limit)
    const total = db.totals(since)

    if (rows.length === 0) {
      if (options.json) {
        console.log(JSON.stringify({ period, total: db.toJSON([total])[0], rows: [] }, null, 2))
      } else {
        renderNoData()
      }
      return 0
    }

    let prevTotal: UsageRow | undefined
    let prevRows: Array<UsageRow> = []

    if (options.compare) {
      const periodLength = Date.now() - since.getTime()
      const prevSince = new Date(since.getTime() - periodLength)
      prevTotal = db.totals(prevSince, since)
      if (groupBy !== "day") {
        prevRows = db.fetchRows(groupBy, prevSince, since, options.limit)
      }
    }

    if (options.json) {
      const output: Record<string, unknown> = {
        period,
        total: db.toJSON([total])[0],
        rows: db.toJSON(rows),
      }
      if (prevTotal) {
        output.previous_total = db.toJSON([prevTotal])[0]
      }
      if (prevRows.length > 0) {
        output.previous_rows = db.toJSON(prevRows)
      }
      console.log(JSON.stringify(output, null, 2))
      return 0
    }

    renderSummary(total, period, prevTotal)

    const deltas = prevRows.length > 0 ? computeDeltas(rows, prevRows) : undefined

    if (groupBy === "day") {
      renderDaily(rows, period)
    } else {
      renderGrouped(rows, groupBy, period, deltas)
    }

    console.log()
    return 0
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}

export function createUsageCommand(): Command {
  const usage = new Command("usage")
    .description("Track and display OpenCode token usage statistics")
    .option("--days <n>", "Show last N days (default: 7)", parseInt)
    .option("--since <spec>", "Time filter: '7d', '2w', '30d', '3h', or ISO date")
    .option("--by <dimension>", "Group by: day, model, agent, provider, session")
    .option("--limit <n>", "Max rows to display", parseInt)
    .option("--json", "Output as JSON")
    .option("--compare", "Compare with previous period of same length")
    .addHelpText("after", `
Examples:
  $ bunx oh-my-magento usage                    # Last 7 days, daily breakdown
  $ bunx oh-my-magento usage --days 30          # Last 30 days
  $ bunx oh-my-magento usage --by model         # Group by model
  $ bunx oh-my-magento usage --by agent         # Agent x Model view
  $ bunx oh-my-magento usage --json             # JSON output
  $ bunx oh-my-magento usage --since 7d --compare  # Compare with previous period
`)
    .action(async (options) => {
      const usageOptions: UsageOptions = {
        days: options.days,
        since: options.since,
        by: options.by as GroupBy | undefined,
        limit: options.limit,
        json: options.json ?? false,
        compare: options.compare ?? false,
      }
      const exitCode = executeUsage(usageOptions)
      process.exit(exitCode)
    })

  usage
    .command("report")
    .description("Generate a daily AI usage report (Markdown or JSON)")
    .option("--date <yyyy-mm-dd>", "Report date (default: today)")
    .option("--json", "Output as JSON")
    .option("--output <path>", "Save report to file")
    .addHelpText("after", `
Examples:
  $ bunx oh-my-magento usage report                  # Today's report (Markdown)
  $ bunx oh-my-magento usage report --date 2026-03-14  # Specific date
  $ bunx oh-my-magento usage report --json            # JSON format
  $ bunx oh-my-magento usage report --output report.md  # Save to file
`)
    .action(async (options) => {
      const reportOptions: ReportOptions = {
        date: options.date,
        json: options.json ?? false,
        output: options.output,
      }
      const exitCode = executeReport(reportOptions)
      process.exit(exitCode)
    })

  return usage
}
