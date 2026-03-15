export interface TokenStats {
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheWrite: number
  total: number
}

export interface UsageRow {
  label: string
  calls: number
  tokens: TokenStats
  cost: number
  detail?: string
}

export interface SessionMeta {
  sessionId: string
  title: string
  startTime: Date
  durationMinutes: number
  messageCount: number
  totalTokens: number
  totalCost: number
}

export type GroupBy = "day" | "model" | "agent" | "provider" | "session" | "project" | "branch" | "project-branch"

export interface UsageOptions {
  days?: number
  since?: string
  by?: GroupBy
  limit?: number
  json?: boolean
  compare?: boolean
}

export interface ReportOptions {
  date?: string
  json?: boolean
  output?: string
}

export interface UsageReport {
  user: string
  date: string
  period: string
  summary: {
    sessions: number
    totalCalls: number
    totalTokens: number
    estimatedCost: number
  }
  modelBreakdown: Array<{
    model: string
    calls: number
    tokens: number
    percentage: number
  }>
  agentBreakdown: Array<{
    agent: string
    model: string
    calls: number
    tokens: number
  }>
  cacheEfficiency: Array<{
    model: string
    hitRate: number
  }>
}
