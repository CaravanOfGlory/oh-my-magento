import pc from "picocolors"
import type { UsageRow } from "./types"
import { formatTokens, formatCost, formatDelta } from "./render-format"
import { padRight, padLeft, sparkBar } from "./render-helpers"
import { topBorder, separator, bottomBorder, headerRow } from "./render-borders"

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
