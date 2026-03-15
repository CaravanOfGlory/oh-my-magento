import pc from "picocolors"
import type { UsageRow } from "./types"
import { formatCost, formatDelta, formatTokens } from "./render-format"
import { stripAnsi } from "./render-helpers"

export function renderSummary(
  total: UsageRow,
  period: string,
  prevTotal?: UsageRow,
): void {
  const parts: Array<string> = []
  parts.push(`Calls: ${pc.bold(pc.magenta(total.calls.toLocaleString()))}`)
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
  const rawContentLen = stripAnsi(content).length
  const title = `OpenCode Usage — ${period}`

  const innerWidth = Math.max(title.length + 6, rawContentLen + 2)
  const titlePad = innerWidth - title.length - 5

  const titleLine = `╭─── ${pc.bold(title)} ${"─".repeat(Math.max(1, titlePad))}╮`
  const contentLine = `│ ${content}${" ".repeat(Math.max(0, innerWidth - rawContentLen - 2))} │`
  const bottomLine = `╰${"─".repeat(innerWidth)}╯`

  console.log()
  console.log(titleLine)
  console.log(contentLine)
  console.log(bottomLine)
}
