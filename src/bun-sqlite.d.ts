declare module "bun:sqlite" {
  export class Database {
    constructor(path: string, options?: { readonly?: boolean })
    exec(sql: string): void
    prepare<T = unknown>(sql: string): {
      run(...args: Array<unknown>): { changes: number }
      get(...args: Array<unknown>): T | undefined
      all(...args: Array<unknown>): T[]
    }
    close(): void
  }
}
