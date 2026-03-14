import { execSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { OpenCodeDB } from "./opencode-db"
import { formatTokens, formatCost } from "./render"
import type { ReportOptions, UsageReport } from "./types"

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

export function generateReport(db: OpenCodeDB, options: ReportOptions): UsageReport {
  const { label: dateLabel } = resolveReportDate(options.date)
  const { since, until } = buildDateRange(dateLabel)
  const userName = getGitUserName()

  const total = db.totals(since, until)
  const sessions = db.sessionCount(since, until)
  const modelRows = db.byModel(since, until)
  const agentRows = db.byAgent(since, until)
  const cacheData = db.cacheEfficiency(since, until)

  const totalTokens = total.tokens.total || 1

  return {
    user: userName,
    date: dateLabel,
    period: `${dateLabel} full day`,
    summary: {
      sessions,
      totalCalls: total.calls,
      totalTokens: total.tokens.total,
      estimatedCost: total.cost,
    },
    modelBreakdown: modelRows.map((r) => ({
      model: r.label,
      calls: r.calls,
      tokens: r.tokens.total,
      percentage: Math.round((r.tokens.total / totalTokens) * 100),
    })),
    agentBreakdown: agentRows.map((r) => ({
      agent: r.label,
      model: r.detail ?? "(unknown)",
      calls: r.calls,
      tokens: r.tokens.total,
    })),
    cacheEfficiency: cacheData.map((c) => ({
      model: c.model,
      hitRate: Math.round(c.hitRate * 100),
    })),
  }
}

export function renderReportAsMarkdown(report: UsageReport): string {
  const lines: Array<string> = []

  lines.push(`# AI Usage Report — ${report.date}`)
  lines.push("")
  lines.push(`**User**: ${report.user}  |  **Period**: ${report.period}`)
  lines.push("")

  lines.push("## Summary")
  lines.push("")
  lines.push("| Metric | Value |")
  lines.push("|--------|-------|")
  lines.push(`| Sessions | ${report.summary.sessions} |`)
  lines.push(`| Total Calls | ${report.summary.totalCalls.toLocaleString()} |`)
  lines.push(`| Total Tokens | ${formatTokens(report.summary.totalTokens)} |`)
  lines.push(`| Estimated Cost | ${formatCost(report.summary.estimatedCost)} |`)
  lines.push("")

  if (report.modelBreakdown.length > 0) {
    lines.push("## Model Usage")
    lines.push("")
    lines.push("| Model | Calls | Tokens | Share |")
    lines.push("|-------|-------|--------|-------|")
    for (const m of report.modelBreakdown) {
      lines.push(`| ${m.model} | ${m.calls} | ${formatTokens(m.tokens)} | ${m.percentage}% |`)
    }
    lines.push("")
  }

  if (report.agentBreakdown.length > 0) {
    lines.push("## Agent Usage")
    lines.push("")
    lines.push("| Agent | Model | Calls | Tokens |")
    lines.push("|-------|-------|-------|--------|")
    for (const a of report.agentBreakdown) {
      lines.push(`| ${a.agent} | ${a.model} | ${a.calls} | ${formatTokens(a.tokens)} |`)
    }
    lines.push("")
  }

  if (report.cacheEfficiency.length > 0) {
    lines.push("## Cache Efficiency")
    lines.push("")
    lines.push("| Model | Hit Rate |")
    lines.push("|-------|----------|")
    for (const c of report.cacheEfficiency) {
      lines.push(`| ${c.model} | ${c.hitRate}% |`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

export function executeReport(options: ReportOptions): number {
  try {
    const db = new OpenCodeDB()
    const report = generateReport(db, options)

    if (options.json) {
      console.log(JSON.stringify(report, null, 2))
      return 0
    }

    const markdown = renderReportAsMarkdown(report)

    if (options.output) {
      writeFileSync(options.output, markdown, "utf-8")
      console.log(`Report saved to ${options.output}`)
    } else {
      console.log(markdown)
    }

    return 0
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`)
    return 1
  }
}
