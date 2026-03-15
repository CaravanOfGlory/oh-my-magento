import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { OpenCodeDB } from "./opencode-db"
import { formatTokens, formatCost, renderReportAsTerminal } from "./render"
import type { ReportOptions } from "./types"
import { buildReportData } from "./report-data-aggregator"
import type { DevMetricsReportData } from "../../features/dev-metrics"

function getGitUserName(): string {
  try {
    return execSync("git config user.name", { encoding: "utf-8" }).trim()
  } catch {
    return "Unknown"
  }
}

function resolveReportDate(dateStr?: string): { date: Date; label: string } {
  if (dateStr) {
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date: '${dateStr}'. Use YYYY-MM-DD format.`)
    }
    return { date: parsed, label: dateStr }
  }

  const now = new Date()
  const label = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  return { date: now, label }
}

function buildDateRange(dateLabel: string): { since: Date; until: Date } {
  const since = new Date(`${dateLabel}T00:00:00`)
  const until = new Date(`${dateLabel}T23:59:59.999`)
  return { since, until }
}

export function generateReport(db: OpenCodeDB, options: ReportOptions): DevMetricsReportData {
  const { label: dateLabel } = resolveReportDate(options.date)
  const { since, until } = buildDateRange(dateLabel)

  return buildReportData({
    opencodeDb: db,
    dateRange: { since, until },
  })
}

export function renderReportAsMarkdown(report: DevMetricsReportData, options: { user: string; date: string }): string {
  const lines: Array<string> = []

  lines.push(`# AI Usage Report — ${options.date}`)
  lines.push("")
  lines.push(`**User**: ${options.user}  |  **Period**: ${options.date} full day`)
  lines.push("")

  lines.push("## Investment")
  lines.push("")
  lines.push("| Metric | Value |")
  lines.push("|--------|-------|")
  lines.push(`| Sessions | ${report.investment.sessions} |`)
  lines.push(`| Total Tokens | ${formatTokens(report.investment.tokens)} |`)
  lines.push(`| Estimated Cost | ${formatCost(report.investment.cost)} |`)
  lines.push(`| Models Used | ${report.investment.models_used.join(", ")} |`)
  lines.push("")

  if (report.output) {
    lines.push("## Output")
    lines.push("")
    lines.push("| Metric | Value |")
    lines.push("|--------|-------|")
    lines.push(`| Commits | ${report.output.commits} |`)
    lines.push(`| Files Changed | ${report.output.files_changed} |`)
    lines.push(`| Lines Added | ${report.output.lines_added.toLocaleString()} |`)
    lines.push(`| Lines Removed | ${report.output.lines_removed.toLocaleString()} |`)
    lines.push(`| Branches | ${report.output.branches.join(", ")} |`)
    lines.push("")
  }

  if (report.efficiency) {
    lines.push("## Efficiency")
    lines.push("")
    lines.push("| Metric | Value |")
    lines.push("|--------|-------|")
    if (report.efficiency.cost_per_commit !== null) {
      lines.push(`| Cost per Commit | ${formatCost(report.efficiency.cost_per_commit)} |`)
    }
    if (report.efficiency.tokens_per_loc !== null) {
      lines.push(`| Tokens per LOC | ${report.efficiency.tokens_per_loc.toFixed(2)} |`)
    }
    if (report.efficiency.output_density !== null) {
      lines.push(`| Output Density | ${report.efficiency.output_density.toFixed(2)} LOC/1000 tokens |`)
    }
    if (report.efficiency.session_productivity_score !== null) {
      lines.push(`| Session Productivity | ${report.efficiency.session_productivity_score.toFixed(2)} |`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

export function executeReport(options: ReportOptions): number {
  try {
    const db = new OpenCodeDB()
    const report = generateReport(db, options)
    const { label: dateLabel } = resolveReportDate(options.date)
    const userName = getGitUserName()

    if (options.json) {
      console.log(JSON.stringify(report, null, 2))
      return 0
    }

    if (options.output) {
      const markdown = renderReportAsMarkdown(report, { user: userName, date: dateLabel })
      writeFileSync(options.output, markdown, "utf-8")
      console.log(`Report saved to ${options.output}`)
    } else {
      renderReportAsTerminal(report, { user: userName, date: dateLabel })
    }

    return 0
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}
