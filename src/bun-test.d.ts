declare module "bun:test" {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function test(name: string, fn: () => void | Promise<void>): void
  export function beforeEach(fn: () => void | Promise<void>): void
  export function afterEach(fn: () => void | Promise<void>): void
  interface Matchers {
    toBe(expected: unknown): void
    toEqual(expected: unknown): void
    toContain(expected: unknown): void
    toMatch(expected: RegExp | string): void
    toHaveLength(expected: number): void
    toBeGreaterThan(expected: number): void
    toBeLessThan(expected: number): void
    toBeCloseTo(expected: number, precision?: number): void
    toThrow(expected?: RegExp | string): void
    toStartWith(expected: string): void
    not: Matchers
  }

  export function expect(value: unknown): Matchers
}
