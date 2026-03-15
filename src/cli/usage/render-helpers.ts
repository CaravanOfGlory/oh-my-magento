export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[\d+m/g, "")
}

export function padRight(str: string, len: number): string {
  if (stripAnsi(str).length > len) {
    let truncated = ""
    let visibleCount = 0
    let insideEscape = false
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

export function padLeft(str: string, len: number): string {
  const visibleLen = stripAnsi(str).length
  return visibleLen >= len ? str : " ".repeat(len - visibleLen) + str
}

export function sparkBar(value: number, maxValue: number, width = 8): string {
  if (maxValue <= 0 || value <= 0) return "░".repeat(width)
  const filled = Math.min(width, Math.max(1, Math.round((value / maxValue) * width)))
  return "█".repeat(filled) + "░".repeat(width - filled)
}
