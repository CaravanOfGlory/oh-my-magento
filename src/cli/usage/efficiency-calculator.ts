/**
 * Pure functions for calculating efficiency metrics from usage data.
 * All functions handle edge cases (division by zero) by returning null.
 */

export interface EfficiencyMetrics {
  costPerCommit: number | null
  tokensPerLoc: number | null
  outputDensity: number | null
  sessionProductivity: number | null
}

/**
 * Calculate cost per git commit.
 * @returns Cost per commit, or null if no commits
 */
export function calculateCostPerCommit(
  totalCost: number,
  commitCount: number,
): number | null {
  if (commitCount === 0) return null
  return totalCost / commitCount
}

/**
 * Calculate tokens consumed per line of code changed.
 * @returns Tokens per LOC, or null if no LOC changed
 */
export function calculateTokensPerLoc(
  totalTokens: number,
  linesOfCode: number,
): number | null {
  if (linesOfCode === 0) return null
  return totalTokens / linesOfCode
}

/**
 * Calculate output token density (output tokens / total tokens).
 * Higher = more model output relative to input.
 * @returns Ratio [0-1], or null if no tokens
 */
export function calculateOutputDensity(
  outputTokens: number,
  totalTokens: number,
): number | null {
  if (totalTokens === 0) return null
  return outputTokens / totalTokens
}

/**
 * Calculate session productivity score.
 * Formula: (commits * 100 + linesOfCode) / (durationMinutes * totalTokens / 1000)
 * @returns Productivity score, or null if duration or tokens are zero
 */
export function calculateSessionProductivity(
  commitCount: number,
  linesOfCode: number,
  durationMinutes: number,
  totalTokens: number,
): number | null {
  if (durationMinutes === 0 || totalTokens === 0) return null
  const numerator = commitCount * 100 + linesOfCode
  const denominator = (durationMinutes * totalTokens) / 1000
  return numerator / denominator
}

/**
 * Calculate all efficiency metrics at once.
 */
export function calculateAllMetrics(params: {
  totalCost: number
  totalTokens: number
  outputTokens: number
  commitCount: number
  linesOfCode: number
  durationMinutes: number
}): EfficiencyMetrics {
  return {
    costPerCommit: calculateCostPerCommit(params.totalCost, params.commitCount),
    tokensPerLoc: calculateTokensPerLoc(params.totalTokens, params.linesOfCode),
    outputDensity: calculateOutputDensity(
      params.outputTokens,
      params.totalTokens,
    ),
    sessionProductivity: calculateSessionProductivity(
      params.commitCount,
      params.linesOfCode,
      params.durationMinutes,
      params.totalTokens,
    ),
  }
}
