import { padRight } from "./render-helpers"

export function separator(widths: Array<number>): string {
  return "├" + widths.map((w) => "─".repeat(w + 2)).join("┼") + "┤"
}

export function headerRow(headers: Array<string>, widths: Array<number>): string {
  const cells = headers.map((h, i) => ` ${padRight(h, widths[i])} `)
  return "│" + cells.join("│") + "│"
}

export function topBorder(widths: Array<number>): string {
  return "┌" + widths.map((w) => "─".repeat(w + 2)).join("┬") + "┐"
}

export function bottomBorder(widths: Array<number>): string {
  return "└" + widths.map((w) => "─".repeat(w + 2)).join("┴") + "┘"
}
