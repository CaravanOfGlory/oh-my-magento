import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { checkForLegacyPluginEntry } from "./legacy-plugin-warning"

describe("checkForLegacyPluginEntry", () => {
  let testConfigDir = ""

  beforeEach(() => {
    testConfigDir = join(tmpdir(), `omo-legacy-check-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(testConfigDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testConfigDir, { recursive: true, force: true })
  })

  it("detects a bare legacy plugin entry", () => {
    // given
    writeFileSync(join(testConfigDir, "opencode.json"), JSON.stringify({ plugin: ["oh-my-openagent"] }, null, 2))

    // when
    const result = checkForLegacyPluginEntry(testConfigDir)

    // then
    expect(result.hasLegacyEntry).toBe(true)
    expect(result.hasCanonicalEntry).toBe(false)
    expect(result.legacyEntries).toEqual(["oh-my-openagent"])
    expect(result.configPath).toBe(join(testConfigDir, "opencode.json"))
  })

  it("detects a version-pinned legacy plugin entry", () => {
    // given
    writeFileSync(join(testConfigDir, "opencode.json"), JSON.stringify({ plugin: ["oh-my-openagent@3.10.0"] }, null, 2))

    // when
    const result = checkForLegacyPluginEntry(testConfigDir)

    // then
    expect(result.hasLegacyEntry).toBe(true)
    expect(result.hasCanonicalEntry).toBe(false)
    expect(result.legacyEntries).toEqual(["oh-my-openagent@3.10.0"])
  })

  it("does not flag a canonical plugin entry", () => {
    // given
    writeFileSync(join(testConfigDir, "opencode.json"), JSON.stringify({ plugin: ["oh-my-magento"] }, null, 2))

    // when
    const result = checkForLegacyPluginEntry(testConfigDir)

    // then
    expect(result.hasLegacyEntry).toBe(false)
    expect(result.hasCanonicalEntry).toBe(true)
    expect(result.legacyEntries).toEqual([])
  })

  it("detects legacy entries in quoted jsonc config", () => {
    // given
    writeFileSync(join(testConfigDir, "opencode.jsonc"), '{\n  "plugin": ["oh-my-openagent"]\n}\n')

    // when
    const result = checkForLegacyPluginEntry(testConfigDir)

    // then
    expect(result.hasLegacyEntry).toBe(true)
    expect(result.legacyEntries).toEqual(["oh-my-openagent"])
  })

  it("returns no warning data when config is missing", () => {
    // given — empty dir, no config files

    // when
    const result = checkForLegacyPluginEntry(testConfigDir)

    // then
    expect(result.hasLegacyEntry).toBe(false)
    expect(result.hasCanonicalEntry).toBe(false)
    expect(result.legacyEntries).toEqual([])
    expect(result.configPath).toBeNull()
  })
})
