import pc from "picocolors"
import type { DevMetricsReportData, DimensionBreakdownEntry } from "../../features/dev-metrics"
import { formatCost, formatTokens } from "./render-format"
import { stripAnsi, padRight, padLeft } from "./render-helpers"
import { topBorder, separator, bottomBorder, headerRow } from "./render-borders"

export function renderReportAsTerminal(report: DevMetricsReportData, options: { user: string; date: string }): void {
  const content = `User: ${pc.cyan(options.user)}  │  Period: ${options.date} full day`
  const rawContentLen = stripAnsi(content).length
  const title = `AI Usage Report — ${options.date}`

  const innerWidth = Math.max(title.length + 6, rawContentLen + 2)
  const titlePad = innerWidth - title.length - 5

  const titleLine = `╭─── ${pc.bold(title)} ${"─".repeat(Math.max(1, titlePad))}╮`
  const contentLine = `│ ${content}${" ".repeat(Math.max(0, innerWidth - rawContentLen - 2))} │`
  const bottomLine = `╰${"─".repeat(innerWidth)}╯`

  console.log()
  console.log(titleLine)
  console.log(contentLine)
  console.log(bottomLine)

  const investmentTitle = pc.bold("Investment")
  console.log()
  console.log(`  ${investmentTitle}`)
  const invW = [16, 12]
  console.log(pc.dim(topBorder(invW)))
  console.log("│" + ` ${padRight("Metric", invW[0])} ` + "│" + ` ${padRight("Value", invW[1])} ` + "│")
  console.log(pc.dim(separator(invW)))
  console.log("│" + ` ${padRight("Sessions", invW[0])} ` + "│" + ` ${padLeft(String(report.investment.sessions), invW[1])} ` + "│")
  console.log("│" + ` ${padRight("Total Tokens", invW[0])} ` + "│" + ` ${padLeft(formatTokens(report.investment.tokens), invW[1])} ` + "│")
  console.log("│" + ` ${padRight("Estimated Cost", invW[0])} ` + "│" + ` ${padLeft(formatCost(report.investment.cost), invW[1])} ` + "│")
  console.log("│" + ` ${padRight("Models Used", invW[0])} ` + "│" + ` ${padLeft(String(report.investment.models_used.length), invW[1])} ` + "│")
  console.log(pc.dim(bottomBorder(invW)))

  if (report.output) {
    const outputTitle = pc.bold("Output")
    console.log()
    console.log(`  ${outputTitle}`)
    const outW = [16, 12]
    console.log(pc.dim(topBorder(outW)))
    console.log("│" + ` ${padRight("Metric", outW[0])} ` + "│" + ` ${padRight("Value", outW[1])} ` + "│")
    console.log(pc.dim(separator(outW)))
    console.log("│" + ` ${padRight("Commits", outW[0])} ` + "│" + ` ${padLeft(String(report.output.commits), outW[1])} ` + "│")
    console.log("│" + ` ${padRight("Files Changed", outW[0])} ` + "│" + ` ${padLeft(String(report.output.files_changed), outW[1])} ` + "│")
    console.log("│" + ` ${padRight("Lines Added", outW[0])} ` + "│" + ` ${padLeft(report.output.lines_added.toLocaleString(), outW[1])} ` + "│")
    console.log("│" + ` ${padRight("Lines Removed", outW[0])} ` + "│" + ` ${padLeft(report.output.lines_removed.toLocaleString(), outW[1])} ` + "│")
    console.log("│" + ` ${padRight("Branches", outW[0])} ` + "│" + ` ${padLeft(String(report.output.branches.length), outW[1])} ` + "│")
    console.log(pc.dim(bottomBorder(outW)))
  }

  if (report.efficiency) {
    const efficiencyTitle = pc.bold("Efficiency")
    console.log()
    console.log(`  ${efficiencyTitle}`)
    const effW = [24, 16]
    console.log(pc.dim(topBorder(effW)))
    console.log("│" + ` ${padRight("Metric", effW[0])} ` + "│" + ` ${padRight("Value", effW[1])} ` + "│")
    console.log(pc.dim(separator(effW)))
    if (report.efficiency.cost_per_commit !== null) {
      console.log("│" + ` ${padRight("Cost per Commit", effW[0])} ` + "│" + ` ${padLeft(formatCost(report.efficiency.cost_per_commit), effW[1])} ` + "│")
    }
    if (report.efficiency.tokens_per_loc !== null) {
      console.log("│" + ` ${padRight("Tokens per LOC", effW[0])} ` + "│" + ` ${padLeft(report.efficiency.tokens_per_loc.toFixed(2), effW[1])} ` + "│")
    }
    if (report.efficiency.output_density !== null) {
      console.log("│" + ` ${padRight("Output Density", effW[0])} ` + "│" + ` ${padLeft(report.efficiency.output_density.toFixed(2) + " LOC/1k", effW[1])} ` + "│")
    }
    if (report.efficiency.session_productivity_score !== null) {
      console.log("│" + ` ${padRight("Session Productivity", effW[0])} ` + "│" + ` ${padLeft(report.efficiency.session_productivity_score.toFixed(2), effW[1])} ` + "│")
    }
    console.log(pc.dim(bottomBorder(effW)))
  }

  if (report.project_breakdown && report.project_breakdown.length > 1) {
    renderBreakdownTable("Project Breakdown", report.project_breakdown)
  }

  if (report.branch_breakdown && report.branch_breakdown.length > 0) {
    renderBreakdownTable("Branch Breakdown", report.branch_breakdown)
  }
}

function renderBreakdownTable(title: string, entries: DimensionBreakdownEntry[]): void {
  console.log()
  console.log(`  ${pc.bold(title)}`)

  const labelWidth = Math.max(16, ...entries.map((e) => e.label.length + 2))
  const colWidths = [labelWidth, 8, 10, 7, 8]
  const headers = ["Name", "Sessions", "Tokens", "Commits", "+Lines"]

  console.log(pc.dim(topBorder(colWidths)))
  console.log(headerRow(headers, colWidths))
  console.log(pc.dim(separator(colWidths)))

  for (const entry of entries) {
    console.log(
      "│" +
      ` ${padRight(entry.label, colWidths[0])} ` +
      "│" +
      ` ${padLeft(String(entry.sessions), colWidths[1])} ` +
      "│" +
      ` ${padLeft(formatTokens(entry.tokens), colWidths[2])} ` +
      "│" +
      ` ${padLeft(String(entry.commits), colWidths[3])} ` +
      "│" +
      ` ${padLeft(`+${entry.lines_added.toLocaleString()}`, colWidths[4])} ` +
      "│",
    )
  }

  console.log(pc.dim(bottomBorder(colWidths)))
}
