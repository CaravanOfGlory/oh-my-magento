export interface EnrichedSessionData {
  sessionId: string
  title: string | null
  projectPath: string
  projectName: string
  gitRemote: string | null
  gitBranch: string
  createdAt: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  commits: number
  linesAdded: number
}

export interface ProjectAggregation {
  label: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  sessions: number
  commits: number
  linesAdded: number
}

export interface BranchAggregation {
  label: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  sessions: number
  commits: number
  linesAdded: number
}

export interface ProjectBranchAggregation {
  label: string
  project: string
  branch: string
  calls: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cacheRead: number
    cacheWrite: number
    total: number
  }
  cost: number
  sessions: number
  commits: number
  linesAdded: number
}
