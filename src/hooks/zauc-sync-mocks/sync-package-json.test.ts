import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { spawnSync } from "node:child_process"
import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import type { PluginEntryInfo } from "../auto-update-checker/checker/plugin-entry"

type SyncResult = {
  synced: boolean
  error: "parse_error" | "write_error" | null
  message?: string
}

type SyncExecution = {
  status: number | null
  stdout: string
  stderr: string
}

type FsFailureMode = "write" | "rename"

const PACKAGE_NAME = "oh-my-magento"

function runSyncCachePackageJsonToIntent(
  pluginInfo: PluginEntryInfo,
  envOverrides: Record<string, string | undefined> = {},
  fsFailureMode?: FsFailureMode,
): SyncExecution {
  const encodedPluginInfo = JSON.stringify(pluginInfo)
  const failureSetup = fsFailureMode
    ? [
        'import { mock } from "bun:test";',
        'import * as nodeFs from "node:fs";',
        fsFailureMode === "write"
          ? `mock.module("node:fs", () => ({
              ...nodeFs,
              writeFileSync: () => {
                throw new Error("EACCES: permission denied")
              },
            }))`
          : `mock.module("node:fs", () => ({
              ...nodeFs,
              renameSync: () => {
                throw new Error("EXDEV: cross-device link not permitted")
              },
            }))`,
      ].join("\n")
    : ""

  const command = [
    failureSetup,
    `import { syncCachePackageJsonToIntent } from ${JSON.stringify("./src/hooks/auto-update-checker/checker/sync-package-json")};`,
    `const result = syncCachePackageJsonToIntent(${encodedPluginInfo});`,
    "console.log(JSON.stringify(result));",
  ].join("\n")

  const execution = spawnSync("bun", ["-e", command], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...envOverrides,
    },
    encoding: "utf-8",
  })

  return {
    status: execution.status,
    stdout: execution.stdout,
    stderr: execution.stderr,
  }
}

function readSyncResult(execution: SyncExecution): SyncResult {
  expect(execution.status).toBe(0)
  return JSON.parse(execution.stdout.trim()) as SyncResult
}

describe("syncCachePackageJsonToIntent", () => {
  let temporaryDirectory: string
  let cacheHomeDirectory: string
  let cachePackageJsonPath: string

  function resetTestCache(currentVersion = "3.10.0"): void {
    fs.rmSync(cacheHomeDirectory, { recursive: true, force: true })
    fs.mkdirSync(path.dirname(cachePackageJsonPath), { recursive: true })
    fs.writeFileSync(
      cachePackageJsonPath,
      JSON.stringify({ dependencies: { [PACKAGE_NAME]: currentVersion, other: "1.0.0" } }, null, 2),
    )
  }

  function cleanupTestCache(): void {
    fs.rmSync(cacheHomeDirectory, { recursive: true, force: true })
  }

  function readCachePackageJsonVersion(): string | undefined {
    const content = fs.readFileSync(cachePackageJsonPath, "utf-8")
    const pkg = JSON.parse(content) as { dependencies?: Record<string, string> }
    return pkg.dependencies?.[PACKAGE_NAME]
  }

  function readCachePackageJsonDependencies(): Record<string, string> | undefined {
    const content = fs.readFileSync(cachePackageJsonPath, "utf-8")
    const pkg = JSON.parse(content) as { dependencies?: Record<string, string> }
    return pkg.dependencies
  }

  beforeEach(() => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "omo-sync-package-json-test-"))
    cacheHomeDirectory = path.join(temporaryDirectory, "cache-home")
    cachePackageJsonPath = path.join(cacheHomeDirectory, "opencode", "packages", "package.json")
    resetTestCache()
  })

  afterEach(() => {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true })
  })

  describe("#given cache package.json with pinned semver version", () => {
    test("#when opencode.json intent is latest tag #then updates package.json to use latest", () => {
      const pluginInfo: PluginEntryInfo = {
        entry: `${PACKAGE_NAME}@latest`,
        isPinned: false,
        pinnedVersion: "latest",
        configPath: "/tmp/opencode.json",
      }

      const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
        XDG_CACHE_HOME: cacheHomeDirectory,
      })
      const result = readSyncResult(execution)

      expect(result.synced).toBe(true)
      expect(result.error).toBeNull()
      expect(readCachePackageJsonVersion()).toBe("latest")
    })

    test("#when opencode.json intent is next tag #then updates package.json to use next", () => {
      const pluginInfo: PluginEntryInfo = {
        entry: `${PACKAGE_NAME}@next`,
        isPinned: false,
        pinnedVersion: "next",
        configPath: "/tmp/opencode.json",
      }

      const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
        XDG_CACHE_HOME: cacheHomeDirectory,
      })
      const result = readSyncResult(execution)

      expect(result.synced).toBe(true)
      expect(result.error).toBeNull()
      expect(readCachePackageJsonVersion()).toBe("next")
    })

    test("#when opencode.json has no version (implies latest) #then updates package.json to use latest", () => {
      const pluginInfo: PluginEntryInfo = {
        entry: PACKAGE_NAME,
        isPinned: false,
        pinnedVersion: null,
        configPath: "/tmp/opencode.json",
      }

      const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
        XDG_CACHE_HOME: cacheHomeDirectory,
      })
      const result = readSyncResult(execution)

      expect(result.synced).toBe(true)
      expect(result.error).toBeNull()
      expect(readCachePackageJsonVersion()).toBe("latest")
    })
  })

  test("#given cache package.json already matches intent #then returns synced false with no error", () => {
    resetTestCache("latest")

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
      XDG_CACHE_HOME: cacheHomeDirectory,
    })
    const result = readSyncResult(execution)

    expect(result.synced).toBe(false)
    expect(result.error).toBeNull()
    expect(readCachePackageJsonVersion()).toBe("latest")
  })

  test("#given cache package.json does not exist #then creates cache package.json with the plugin dependency", () => {
    cleanupTestCache()

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
      XDG_CACHE_HOME: cacheHomeDirectory,
    })
    const result = readSyncResult(execution)

    expect(result.synced).toBe(true)
    expect(result.error).toBeNull()
    expect(readCachePackageJsonVersion()).toBe("latest")
  })

  test("#given plugin not in cache package.json dependencies #then adds the plugin dependency and preserves existing dependencies", () => {
    cleanupTestCache()
    fs.mkdirSync(path.dirname(cachePackageJsonPath), { recursive: true })
    fs.writeFileSync(cachePackageJsonPath, JSON.stringify({ dependencies: { other: "1.0.0" } }, null, 2))

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
      XDG_CACHE_HOME: cacheHomeDirectory,
    })
    const result = readSyncResult(execution)

    expect(result.synced).toBe(true)
    expect(result.error).toBeNull()
    expect(readCachePackageJsonDependencies()).toEqual({
      other: "1.0.0",
      [PACKAGE_NAME]: "latest",
    })
  })

  test("#given user explicitly changed from one semver to another #then updates package.json to new version", () => {
    resetTestCache("3.9.0")

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@3.10.0`,
      isPinned: true,
      pinnedVersion: "3.10.0",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
      XDG_CACHE_HOME: cacheHomeDirectory,
    })
    const result = readSyncResult(execution)

    expect(result.synced).toBe(true)
    expect(result.error).toBeNull()
    expect(readCachePackageJsonVersion()).toBe("3.10.0")
  })

  test("#given cache package.json with other dependencies #then other dependencies are preserved when updating plugin version", () => {
    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
      XDG_CACHE_HOME: cacheHomeDirectory,
    })
    const result = readSyncResult(execution)

    expect(result.synced).toBe(true)
    expect(result.error).toBeNull()
    expect(readCachePackageJsonDependencies()?.other).toBe("1.0.0")
  })

  test("#given malformed JSON in cache package.json #then returns parse_error", () => {
    cleanupTestCache()
    fs.mkdirSync(path.dirname(cachePackageJsonPath), { recursive: true })
    fs.writeFileSync(cachePackageJsonPath, "{ invalid json }")

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(pluginInfo, {
      XDG_CACHE_HOME: cacheHomeDirectory,
    })
    const result = readSyncResult(execution)

    expect(result.synced).toBe(false)
    expect(result.error).toBe("parse_error")
  })

  test("#given write permission denied #then returns write_error", () => {
    cleanupTestCache()
    fs.mkdirSync(path.dirname(cachePackageJsonPath), { recursive: true })
    fs.writeFileSync(cachePackageJsonPath, JSON.stringify({ dependencies: { [PACKAGE_NAME]: "3.10.0" } }, null, 2))

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(
      pluginInfo,
      { XDG_CACHE_HOME: cacheHomeDirectory },
      "write",
    )
    const result = readSyncResult(execution)

    expect(result.synced).toBe(false)
    expect(result.error).toBe("write_error")
  })

  test("#given rename fails after successful write #then returns write_error and cleans up temp file", () => {
    cleanupTestCache()
    fs.mkdirSync(path.dirname(cachePackageJsonPath), { recursive: true })
    fs.writeFileSync(cachePackageJsonPath, JSON.stringify({ dependencies: { [PACKAGE_NAME]: "3.10.0" } }, null, 2))

    const pluginInfo: PluginEntryInfo = {
      entry: `${PACKAGE_NAME}@latest`,
      isPinned: false,
      pinnedVersion: "latest",
      configPath: "/tmp/opencode.json",
    }

    const execution = runSyncCachePackageJsonToIntent(
      pluginInfo,
      { XDG_CACHE_HOME: cacheHomeDirectory },
      "rename",
    )
    const result = readSyncResult(execution)

    expect(result.synced).toBe(false)
    expect(result.error).toBe("write_error")

    const packageDirectoryEntries = fs.readdirSync(path.dirname(cachePackageJsonPath))
    expect(packageDirectoryEntries).toEqual(["package.json"])
  })
})
