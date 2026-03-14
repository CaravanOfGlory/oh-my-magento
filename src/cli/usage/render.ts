import pc from "picocolors"
import type { UsageRow, UsageReport } from "./types"

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatCost(c: number): string {
  if (c === 0) return "-"
  if (c < 0.01) return `$${c.toFixed(4)}`
  return `$${c.toFixed(2)}`
}

function formatDelta(pct: number): string {
  if (pct > 0) return pc.red(`+${pct.toFixed(0)}%`)
  if (pct < 0) return pc.green(`${pct.toFixed(0)}%`)
  return pc.dim("0%")
}

function sparkBar(value: number, maxValue: number, width = 8): string {
  if (maxValue <= 0 || value <= 0) return "░".repeat(width)
  const filled = Math.min(width, Math.max(1, Math.round((value / maxValue) * width)))
  return "█".repeat(filled) + "░".repeat(width - filled)
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[\d+m/g, "")
}

function padRight(str: string, len: number): string {
  if (stripAnsi(str).length > len) {
    let truncated = ""
    let visibleCount = 0
    let insideEscape = false
    // Truncate while preserving ANSI codes
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "\\x1B") insideEscape = true
      if (!insideEscape) visibleCount++
      truncated += str[i]
      if (str[i] === "m" && insideEscape) insideEscape = false
      if (visibleCount >= len - 1 && !insideEscape) {
        truncated += "…"
        break
      }
    }
    return truncated
  }
  const visibleLen = stripAnsi(str).length
  return visibleLen >= len ? str : str + " ".repeat(len - visibleLen)
}

function padLeft(str: string, len: number): string {
  const visibleLen = stripAnsi(str).length
  return visibleLen >= len ? str : " ".repeat(len - visibleLen) + str
}

function separator(widths: Array<number>): string {
  return "├" + widths.map((w) => "─".repeat(w + 2)).join("┼") + "┤"
}

function headerRow(headers: Array<string>, widths: Array<number>): string {
  const cells = headers.map((h, i) => ` ${padRight(h, widths[i])} `)
  return "│" + cells.join("│") + "│"
}

function topBorder(widths: Array<number>): string {
  return "┌" + widths.map((w) => "─".repeat(w + 2)).join("┬") + "┐"
}

function bottomBorder(widths: Array<number>): string {
  return "└" + widths.map((w) => "─".repeat(w + 2)).join("┴") + "┘"
}

export function renderSummary(
  total: UsageRow,
  period: string,
  prevTotal?: UsageRow,
): void {
  const parts: Array<string> = []
  parts.push(`  Calls: ${pc.bold(pc.magenta(total.calls.toLocaleString()))}`)
  if (prevTotal && prevTotal.calls > 0) {
    const pct = ((total.calls - prevTotal.calls) / prevTotal.calls) * 100
    parts.push(` ${formatDelta(pct)}`)
  }
  parts.push(`  │  Tokens: ${pc.bold(formatTokens(total.tokens.total))}`)
  if (prevTotal && prevTotal.tokens.total > 0) {
    const pct = ((total.tokens.total - prevTotal.tokens.total) / prevTotal.tokens.total) * 100
    parts.push(` ${formatDelta(pct)}`)
  }
  parts.push(`  │  Cost: ${pc.bold(pc.red(formatCost(total.cost)))}`)
  if (prevTotal && prevTotal.cost > 0) {
    const pct = ((total.cost - prevTotal.cost) / prevTotal.cost) * 100
    parts.push(` ${formatDelta(pct)}`)
  }

  const content = parts.join("")
  const title = `OpenCode Usage — ${period}`
  const titleLine = `╭${"─".repeat(3)} ${pc.bold(title)} ${"─".repeat(3)}╮`

  console.log()
  console.log(titleLine)
  console.log(content)
  console.log(`╰${"─".repeat(titleLine.length - 2)}╯`)
}

export function renderDaily(rows: Array<UsageRow>, period: string): void {
  const title = pc.bold(`Daily Usage (${period})`)
  console.log()
  console.log(`  ${title}`)

  const widths = [12, 7, 7, 7, 7, 7, 8, 8, 10]
  const headers = ["Date", "Calls", "Input", "Output", "Cache R", "Cache W", "Total", "Cost", "Trend"]

  console.log(pc.dim(topBorder(widths)))
  console.log(pc.cyan(pc.bold(headerRow(headers, widths))))
  console.log(pc.dim(separator(widths)))

  const maxTokens = Math.max(...rows.map((r) => r.tokens.total), 1)

  for (const r of rows) {
    const cells = [
      ` ${padRight(r.label, widths[0])} `,
      ` ${padLeft(String(r.calls), widths[1])} `,
      ` ${padLeft(formatTokens(r.tokens.input), widths[2])} `,
      ` ${padLeft(formatTokens(r.tokens.output), widths[3])} `,
      ` ${padLeft(formatTokens(r.tokens.cacheRead), widths[4])} `,
      ` ${padLeft(formatTokens(r.tokens.cacheWrite), widths[5])} `,
      ` ${padLeft(formatTokens(r.tokens.total), widths[6])} `,
      ` ${padLeft(formatCost(r.cost), widths[7])} `,
      ` ${padRight(pc.cyan(sparkBar(r.tokens.total, maxTokens, widths[8])), widths[8])} `,
    ]
    console.log("│" + cells.join("│") + "│")
  }

  console.log(pc.dim(bottomBorder(widths)))
}

export function renderGrouped(
  rows: Array<UsageRow>,
  groupBy: string,
  period: string,
  deltas?: Array<number | undefined>,
): void {
  const labelMap: Record<string, string> = {
    model: "Model",
    agent: "Agent",
    provider: "Provider",
    session: "Session",
  }
  const labelHeader = labelMap[groupBy] ?? groupBy

  const showDetail = groupBy === "agent"
  const showBreakdown = groupBy !== "session" && groupBy !== "agent"

  const title = pc.bold(`Usage by ${labelHeader} (${period})`)
  console.log()
  console.log(`  ${title}`)

  const widths: Array<number> = [24]
  const headers: Array<string> = [labelHeader]

  if (showDetail) {
    widths.push(18)
    headers.push("Model")
  }
  widths.push(7)
  headers.push("Calls")
  if (showBreakdown) {
    widths.push(7, 7, 7, 7)
    headers.push("Input", "Output", "Cache R", "Cache W")
  }
  widths.push(8, 8)
  headers.push("Total", "Cost")
  if (deltas) {
    widths.push(7)
    headers.push("Delta")
  }

  console.log(pc.dim(topBorder(widths)))
  console.log(pc.cyan(pc.bold(headerRow(headers, widths))))
  console.log(pc.dim(separator(widths)))

  let prevLabel = ""

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]

    if (showDetail && prevLabel && r.label !== prevLabel) {
      console.log(pc.dim(separator(widths)))
    }

    const displayLabel = r.label !== prevLabel ? r.label : ""
    prevLabel = r.label

    const cells: Array<string> = [
      ` ${padRight(displayLabel, widths[0])} `,
    ]
    let colIdx = 1

    if (showDetail) {
      cells.push(` ${padRight(pc.dim(r.detail ?? ""), widths[colIdx])} `)
      colIdx++
    }
    cells.push(` ${padLeft(pc.magenta(String(r.calls)), widths[colIdx])} `)
    colIdx++

    if (showBreakdown) {
      cells.push(` ${padLeft(pc.green(formatTokens(r.tokens.input)), widths[colIdx])} `)
      colIdx++
      cells.push(` ${padLeft(pc.yellow(formatTokens(r.tokens.output)), widths[colIdx])} `)
      colIdx++
      cells.push(` ${padLeft(pc.dim(formatTokens(r.tokens.cacheRead)), widths[colIdx])} `)
      colIdx++
      cells.push(` ${padLeft(pc.dim(formatTokens(r.tokens.cacheWrite)), widths[colIdx])} `)
      colIdx++
    }

    cells.push(` ${padLeft(pc.bold(formatTokens(r.tokens.total)), widths[colIdx])} `)
    colIdx++
    cells.push(` ${padLeft(pc.red(formatCost(r.cost)), widths[colIdx])} `)
    colIdx++

    if (deltas) {
      const d = deltas[i]
      const deltaStr = d !== undefined ? formatDelta(d) : pc.dim("-")
      cells.push(` ${padLeft(deltaStr, widths[colIdx])} `)
    }

    console.log("│" + cells.join("│") + "│")
  }

  console.log(pc.dim(bottomBorder(widths)))
}

export function renderNoData(): void {
  console.log()
  console.log(pc.yellow("No usage data found for the specified period."))
  console.log(pc.dim("Make sure OpenCode has been used and the database exists."))
}

export function renderReportAsTerminal(report: UsageReport): void {
  const titleLine = `╭${"─".repeat(3)} ${pc.bold(`AI Usage Report — ${report.date}`)} ${"─".repeat(3)}╮`
  console.log()
  console.log(titleLine)
  console.log(`  User: ${pc.cyan(report.user)}  │  Period: ${report.period}`)
  console.log(`╰${"─".repeat(titleLine.length - 2)}╯`)

  // Summary Table
  const summaryTitle = pc.bold("Summary")
  console.log()
  console.log(`  ${summaryTitle}`)
  const sumW = [16, 12]
  console.log(pc.dim(topBorder(sumW)))
  console.log("│" + ` ${padRight("Metric", sumW[0])} ` + "│" + ` ${padRight("Value", sumW[1])} ` + "│")
  console.log(pc.dim(separator(sumW)))
  console.log("│" + ` ${padRight("Sessions", sumW[0])} ` + "│" + ` ${padLeft(String(report.summary.sessions), sumW[1])} ` + "│")
  console.log("│" + ` ${padRight("Total Calls", sumW[0])} ` + "│" + ` ${padLeft(report.summary.totalCalls.toLocaleString(), sumW[1])} ` + "│")
  console.log("│" + ` ${padRight("Total Tokens", sumW[0])} ` + "│" + ` ${padLeft(formatTokens(report.summary.totalTokens), sumW[1])} ` + "│")
  console.log("│" + ` ${padRight("Estimated Cost", sumW[0])} ` + "│" + ` ${padLeft(formatCost(report.summary.estimatedCost), sumW[1])} ` + "│")
  console.log(pc.dim(bottomBorder(sumW)))

  // Model Breakdown
  if (report.modelBreakdown.length > 0) {
    const modelTitle = pc.bold("Model Usage")
    console.log()
    console.log(`  ${modelTitle}`)
    const modelW = [24, 8, 10, 8]
    console.log(pc.dim(topBorder(modelW)))
    console.log(pc.cyan(pc.bold(headerRow(["Model", "Calls", "Tokens", "Share"], modelW))))
    console.log(pc.dim(separator(modelW)))
    for (const m of report.modelBreakdown) {
      const cells = [
        ` ${padRight(m.model, modelW[0])} `,
        ` ${padLeft(pc.magenta(String(m.calls)), modelW[1])} `,
        ` ${padLeft(pc.bold(formatTokens(m.tokens)), modelW[2])} `,
        ` ${padLeft(`${m.percentage}%`, modelW[3])} `,
      ]
      console.log("│" + cells.join("│") + "│")
    }
    console.log(pc.dim(bottomBorder(modelW)))
  }

  // Agent Breakdown
  if (report.agentBreakdown.length > 0) {
    const agentTitle = pc.bold("Agent Usage")
    console.log()
    console.log(`  ${agentTitle}`)
    const agentW = [20, 24, 8, 10]
    console.log(pc.dim(topBorder(agentW)))
    console.log(pc.cyan(pc.bold(headerRow(["Agent", "Model", "Calls", "Tokens"], agentW))))
    console.log(pc.dim(separator(agentW)))
    for (const a of report.agentBreakdown) {
      const cells = [
        ` ${padRight(a.agent, agentW[0])} `,
        ` ${padRight(pc.dim(a.model), agentW[1])} `,
        ` ${padLeft(pc.magenta(String(a.calls)), agentW[2])} `,
        ` ${padLeft(pc.bold(formatTokens(a.tokens)), agentW[3])} `,
      ]
      console.log("│" + cells.join("│") + "│")
    }
    console.log(pc.dim(bottomBorder(agentW)))
  }

  // Cache Efficiency
  if (report.cacheEfficiency.length > 0) {
    const cacheTitle = pc.bold("Cache Efficiency")
    console.log()
    console.log(`  ${cacheTitle}`)
    const cacheW = [24, 10]
    console.log(pc.dim(topBorder(cacheW)))
    console.log(pc.cyan(pc.bold(headerRow(["Model", "Hit Rate"], cacheW))))
    console.log(pc.dim(separator(cacheW)))
    for (const c of report.cacheEfficiency) {
      const cells = [
        ` ${padRight(c.model, cacheW[0])} `,
        ` ${padLeft(`${c.hitRate}%`, cacheW[1])} `,
      ]
      console.log("│" + cells.join("│") + "│")
    }
    console.log(pc.dim(bottomBorder(cacheW)))
  }
}

export { formatTokens, formatCost }
