import { describe, expect, test } from "bun:test"
import {
  calculateAllMetrics,
  calculateCostPerCommit,
  calculateOutputDensity,
  calculateSessionProductivity,
  calculateTokensPerLoc,
} from "./efficiency-calculator"

describe("efficiency-calculator", () => {
  describe("#calculateCostPerCommit", () => {
    describe("#given valid inputs", () => {
      describe("#when commits exist", () => {
        test("#then calculates cost per commit", () => {
          expect(calculateCostPerCommit(100, 10)).toBe(10)
          expect(calculateCostPerCommit(0, 5)).toBe(0)
          expect(calculateCostPerCommit(123.45, 5)).toBeCloseTo(24.69)
        })
      })

      describe("#when no commits", () => {
        test("#then returns null", () => {
          expect(calculateCostPerCommit(100, 0)).toBe(null)
          expect(calculateCostPerCommit(0, 0)).toBe(null)
        })
      })
    })
  })

  describe("#calculateTokensPerLoc", () => {
    describe("#given valid inputs", () => {
      describe("#when LOC changed", () => {
        test("#then calculates tokens per LOC", () => {
          expect(calculateTokensPerLoc(1000, 100)).toBe(10)
          expect(calculateTokensPerLoc(0, 50)).toBe(0)
          expect(calculateTokensPerLoc(12345, 100)).toBeCloseTo(123.45)
        })
      })

      describe("#when no LOC changed", () => {
        test("#then returns null", () => {
          expect(calculateTokensPerLoc(1000, 0)).toBe(null)
          expect(calculateTokensPerLoc(0, 0)).toBe(null)
        })
      })
    })
  })

  describe("#calculateOutputDensity", () => {
    describe("#given valid inputs", () => {
      describe("#when tokens exist", () => {
        test("#then calculates output density ratio", () => {
          expect(calculateOutputDensity(500, 1000)).toBe(0.5)
          expect(calculateOutputDensity(0, 1000)).toBe(0)
          expect(calculateOutputDensity(1000, 1000)).toBe(1)
          expect(calculateOutputDensity(250, 1000)).toBe(0.25)
        })
      })

      describe("#when no tokens", () => {
        test("#then returns null", () => {
          expect(calculateOutputDensity(0, 0)).toBe(null)
          expect(calculateOutputDensity(100, 0)).toBe(null)
        })
      })
    })
  })

  describe("#calculateSessionProductivity", () => {
    describe("#given valid inputs", () => {
      describe("#when duration and tokens exist", () => {
        test("#then calculates productivity score", () => {
          const score = calculateSessionProductivity(5, 200, 60, 10000)
          expect(score).toBeCloseTo(1.167, 2)
        })

        test("#then handles zero commits", () => {
          const score = calculateSessionProductivity(0, 200, 60, 10000)
          expect(score).toBeCloseTo(0.333, 2)
        })

        test("#then handles zero LOC", () => {
          const score = calculateSessionProductivity(5, 0, 60, 10000)
          expect(score).toBeCloseTo(0.833, 2)
        })
      })

      describe("#when duration is zero", () => {
        test("#then returns null", () => {
          expect(calculateSessionProductivity(5, 200, 0, 10000)).toBe(null)
        })
      })

      describe("#when tokens are zero", () => {
        test("#then returns null", () => {
          expect(calculateSessionProductivity(5, 200, 60, 0)).toBe(null)
        })
      })

      describe("#when both are zero", () => {
        test("#then returns null", () => {
          expect(calculateSessionProductivity(5, 200, 0, 0)).toBe(null)
        })
      })
    })
  })

  describe("#calculateAllMetrics", () => {
    describe("#given valid inputs", () => {
      describe("#when all data available", () => {
        test("#then calculates all metrics", () => {
          const metrics = calculateAllMetrics({
            totalCost: 100,
            totalTokens: 10000,
            outputTokens: 5000,
            commitCount: 5,
            linesOfCode: 200,
            durationMinutes: 60,
          })

          expect(metrics.costPerCommit).toBe(20)
          expect(metrics.tokensPerLoc).toBe(50)
          expect(metrics.outputDensity).toBe(0.5)
          expect(metrics.sessionProductivity).toBeCloseTo(1.167, 2)
        })
      })

      describe("#when some data missing", () => {
        test("#then returns null for affected metrics", () => {
          const metrics = calculateAllMetrics({
            totalCost: 100,
            totalTokens: 10000,
            outputTokens: 5000,
            commitCount: 0,
            linesOfCode: 0,
            durationMinutes: 60,
          })

          expect(metrics.costPerCommit).toBe(null)
          expect(metrics.tokensPerLoc).toBe(null)
          expect(metrics.outputDensity).toBe(0.5)
          expect(metrics.sessionProductivity).toBe(0)
        })
      })

      describe("#when no tokens", () => {
        test("#then returns null for token-dependent metrics", () => {
          const metrics = calculateAllMetrics({
            totalCost: 100,
            totalTokens: 0,
            outputTokens: 0,
            commitCount: 5,
            linesOfCode: 200,
            durationMinutes: 60,
          })

          expect(metrics.costPerCommit).toBe(20)
          expect(metrics.tokensPerLoc).toBe(0)
          expect(metrics.outputDensity).toBe(null)
          expect(metrics.sessionProductivity).toBe(null)
        })
      })
    })
  })
})
