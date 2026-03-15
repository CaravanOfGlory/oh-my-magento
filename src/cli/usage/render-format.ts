import pc from "picocolors"

export function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatCost(c: number): string {
  if (c === 0) return "-"
  if (c < 0.01) return `$${c.toFixed(4)}`
  return `$${c.toFixed(2)}`
}

export function formatDelta(pct: number): string {
  if (pct > 0) return pc.red(`+${pct.toFixed(0)}%`)
  if (pct < 0) return pc.green(`${pct.toFixed(0)}%`)
  return pc.dim("0%")
}
