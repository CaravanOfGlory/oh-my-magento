import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { migrateLegacyConfigFile } from "./migrate-legacy-config-file"
import { CONFIG_BASENAME, FORMER_CONFIG_BASENAME, LEGACY_CONFIG_BASENAME } from "./plugin-identity"

describe("migrateLegacyConfigFile", () => {
  let testDir = ""

  beforeEach(() => {
    testDir = join(tmpdir(), `omo-migrate-config-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe("#given legacy config file exists but canonical does not", () => {
    describe("#when migrating the config file", () => {
      it("#then migrates to canonical and archives the legacy file (when basenames differ)", () => {
        // When LEGACY_CONFIG_BASENAME === CONFIG_BASENAME, the legacy file IS canonical,
        // so migration returns false. Only exercise migration when they differ.
        if (LEGACY_CONFIG_BASENAME === CONFIG_BASENAME) {
          const legacyPath = join(testDir, `${LEGACY_CONFIG_BASENAME}.jsonc`)
          writeFileSync(legacyPath, '{ "agents": {} }')
          const result = migrateLegacyConfigFile(legacyPath)
          expect(result).toBe(false)
          return
        }

        const legacyPath = join(testDir, `${LEGACY_CONFIG_BASENAME}.jsonc`)
        const backupPath = join(testDir, `${LEGACY_CONFIG_BASENAME}.jsonc.bak`)
        writeFileSync(legacyPath, '{ "agents": {} }')

        const result = migrateLegacyConfigFile(legacyPath)

        expect(result).toBe(true)
        expect(existsSync(join(testDir, `${CONFIG_BASENAME}.jsonc`))).toBe(true)
        expect(existsSync(legacyPath)).toBe(false)
        expect(existsSync(backupPath)).toBe(true)
        expect(readFileSync(join(testDir, `${CONFIG_BASENAME}.jsonc`), "utf-8")).toBe('{ "agents": {} }')
      })
    })
  })

  describe("#given former config file exists but canonical does not", () => {
    describe("#when migrating the config file", () => {
      it("#then migrates to canonical and archives the former file (when basenames differ)", () => {
        if (FORMER_CONFIG_BASENAME === CONFIG_BASENAME) {
          const formerPath = join(testDir, `${FORMER_CONFIG_BASENAME}.jsonc`)
          writeFileSync(formerPath, '{ "agents": {} }')
          const result = migrateLegacyConfigFile(formerPath)
          expect(result).toBe(false)
          return
        }

        const formerPath = join(testDir, `${FORMER_CONFIG_BASENAME}.jsonc`)
        const backupPath = join(testDir, `${FORMER_CONFIG_BASENAME}.jsonc.bak`)
        writeFileSync(formerPath, '{ "agents": {} }')

        const result = migrateLegacyConfigFile(formerPath)

        expect(result).toBe(true)
        expect(existsSync(join(testDir, `${CONFIG_BASENAME}.jsonc`))).toBe(true)
        expect(existsSync(formerPath)).toBe(false)
        expect(existsSync(backupPath)).toBe(true)
        expect(readFileSync(join(testDir, `${CONFIG_BASENAME}.jsonc`), "utf-8")).toBe('{ "agents": {} }')
      })
    })
  })

  describe("#given canonical config file already exists", () => {
    describe("#when attempting migration from former file", () => {
      it("#then returns false and does not overwrite", () => {
        const formerPath = join(testDir, `${FORMER_CONFIG_BASENAME}.jsonc`)
        const canonicalPath = join(testDir, `${CONFIG_BASENAME}.jsonc`)
        writeFileSync(formerPath, '{ "old": true }')
        writeFileSync(canonicalPath, '{ "new": true }')

        const result = migrateLegacyConfigFile(formerPath)

        expect(result).toBe(false)
        expect(readFileSync(canonicalPath, "utf-8")).toBe('{ "new": true }')
      })
    })
  })

  describe("#given the file does not exist", () => {
    describe("#when attempting migration", () => {
      it("#then returns false", () => {
        const result = migrateLegacyConfigFile(join(testDir, `${FORMER_CONFIG_BASENAME}.jsonc`))

        expect(result).toBe(false)
      })
    })
  })

  describe("#given the file is not a recognized config file", () => {
    describe("#when attempting migration", () => {
      it("#then returns false", () => {
        const nonLegacyPath = join(testDir, "something-else.jsonc")
        writeFileSync(nonLegacyPath, "{}")

        const result = migrateLegacyConfigFile(nonLegacyPath)

        expect(result).toBe(false)
      })
    })
  })
})
