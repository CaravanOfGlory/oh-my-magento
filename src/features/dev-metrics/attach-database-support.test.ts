import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { Database } from "bun:sqlite"
import { mkdtempSync, rmSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

describe("bun:sqlite ATTACH DATABASE support", () => {
  let tempDir: string
  let primaryDbPath: string
  let secondaryDbPath: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "sqlite-attach-test-"))
    primaryDbPath = join(tempDir, "primary.db")
    secondaryDbPath = join(tempDir, "secondary.db")
  })

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true })
  })

  test("ATTACH DATABASE enables cross-database JOINs", () => {
    const primaryDb = new Database(primaryDbPath)
    primaryDb.exec(`
      CREATE TABLE tokens (
        session_id TEXT PRIMARY KEY,
        amount INT
      )
    `)
    primaryDb.prepare("INSERT INTO tokens (session_id, amount) VALUES (?, ?)").run(
      "session_1",
      100,
    )
    primaryDb.prepare("INSERT INTO tokens (session_id, amount) VALUES (?, ?)").run(
      "session_2",
      200,
    )

    const secondaryDb = new Database(secondaryDbPath)
    secondaryDb.exec(`
      CREATE TABLE context (
        session_id TEXT PRIMARY KEY,
        project TEXT
      )
    `)
    secondaryDb.prepare("INSERT INTO context (session_id, project) VALUES (?, ?)").run(
      "session_1",
      "project_alpha",
    )
    secondaryDb.prepare("INSERT INTO context (session_id, project) VALUES (?, ?)").run(
      "session_2",
      "project_beta",
    )
    secondaryDb.close()

    primaryDb.exec(`ATTACH DATABASE '${secondaryDbPath}' AS db_secondary`)

    const results = primaryDb
      .prepare(
        `
      SELECT a.amount, b.project
      FROM tokens a
      JOIN db_secondary.context b ON a.session_id = b.session_id
      ORDER BY a.session_id
    `,
      )
      .all() as Array<{
      amount: number
      project: string
    }>

    primaryDb.close()

    expect(results).toHaveLength(2)
    expect(results[0]).toEqual({ amount: 100, project: "project_alpha" })
    expect(results[1]).toEqual({ amount: 200, project: "project_beta" })
  })

  test("ATTACH DATABASE with :memory: databases", () => {
    const primary = new Database(":memory:")
    const secondary = new Database(":memory:")

    primary.exec(`
      CREATE TABLE tokens (
        session_id TEXT PRIMARY KEY,
        amount INT
      )
    `)
    primary.prepare("INSERT INTO tokens (session_id, amount) VALUES (?, ?)").run("s1", 50)

    secondary.exec(`
      CREATE TABLE context (
        session_id TEXT PRIMARY KEY,
        data TEXT
      )
    `)
    secondary.prepare("INSERT INTO context (session_id, data) VALUES (?, ?)").run(
      "s1",
      "metadata",
    )
    secondary.close()

    const fileBacked = new Database(primaryDbPath)
    fileBacked.exec(`
      CREATE TABLE tokens (
        session_id TEXT PRIMARY KEY,
        amount INT
      )
    `)
    fileBacked.prepare("INSERT INTO tokens (session_id, amount) VALUES (?, ?)").run("s1", 75)

    fileBacked.exec(`ATTACH DATABASE '${secondaryDbPath}' AS secondary_db`)

    const secondaryFile = new Database(secondaryDbPath)
    secondaryFile.exec(`
      CREATE TABLE context (
        session_id TEXT PRIMARY KEY,
        data TEXT
      )
    `)
    secondaryFile.prepare("INSERT INTO context (session_id, data) VALUES (?, ?)").run("s1", "test")
    secondaryFile.close()

    fileBacked.exec(`DETACH DATABASE secondary_db`)
    fileBacked.exec(`ATTACH DATABASE '${secondaryDbPath}' AS secondary_db`)

    const results = fileBacked
      .prepare(
        `
      SELECT a.amount, b.data
      FROM tokens a
      JOIN secondary_db.context b ON a.session_id = b.session_id
    `,
      )
      .all() as Array<{ amount: number; data: string }>

    fileBacked.close()
    primary.close()

    expect(results).toHaveLength(1)
    expect(results[0].amount).toBe(75)
    expect(results[0].data).toBe("test")
  })
})
