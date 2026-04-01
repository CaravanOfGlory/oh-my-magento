import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

async function importFreshMigrationModule(): Promise<typeof import("./migrate-legacy-plugin-entry")> {
  return import(`./migrate-legacy-plugin-entry?test=${Date.now()}-${Math.random()}`)
}

describe("migrateLegacyPluginEntry", () => {
  let testDir = ""

  beforeEach(() => {
    testDir = join(tmpdir(), `omo-migrate-entry-${Date.now()}-${Math.random().toString(36).slice(2)}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe("#given opencode.json contains legacy plugin entry", () => {
    describe("#when migrating the config", () => {
      it("#then replaces legacy name with canonical name", async () => {
        const configPath = join(testDir, "opencode.json")
        writeFileSync(configPath, JSON.stringify({ plugin: ["oh-my-openagent@latest"] }, null, 2))
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(true)
        const content = readFileSync(configPath, "utf-8")
        expect(content).toContain("oh-my-magento@latest")
        expect(content).not.toContain("oh-my-openagent")
      })
    })
  })

  describe("#given opencode.json contains bare legacy entry", () => {
    describe("#when migrating the config", () => {
      it("#then replaces with canonical name", async () => {
        const configPath = join(testDir, "opencode.json")
        writeFileSync(configPath, JSON.stringify({ plugin: ["oh-my-openagent"] }, null, 2))
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(true)
        const content = readFileSync(configPath, "utf-8")
        expect(content).toContain('"oh-my-magento"')
        expect(content).not.toContain("oh-my-openagent")
      })
    })
  })

  describe("#given opencode.json contains pinned legacy version", () => {
    describe("#when migrating the config", () => {
      it("#then preserves the version pin", async () => {
        const configPath = join(testDir, "opencode.json")
        writeFileSync(configPath, JSON.stringify({ plugin: ["oh-my-openagent@3.11.0"] }, null, 2))
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(true)
        const content = readFileSync(configPath, "utf-8")
        expect(content).toContain("oh-my-magento@3.11.0")
      })
    })
  })

  describe("#given opencode.json already uses canonical name", () => {
    describe("#when checking for migration", () => {
      it("#then returns false and does not modify the file", async () => {
        const configPath = join(testDir, "opencode.json")
        const original = JSON.stringify({ plugin: ["oh-my-magento@latest"] }, null, 2)
        writeFileSync(configPath, original)
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(false)
        expect(readFileSync(configPath, "utf-8")).toBe(original)
      })
    })
  })

  describe("#given plugin entries contain both canonical and legacy values", () => {
    describe("#when migrating the config", () => {
      it("#then removes the legacy entry instead of duplicating the canonical one", async () => {
        const configPath = join(testDir, "opencode.json")
        writeFileSync(configPath, JSON.stringify({ plugin: ["oh-my-magento", "oh-my-openagent"] }, null, 2))
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(true)
        const saved = JSON.parse(readFileSync(configPath, "utf-8")) as { plugin: string[] }
        expect(saved.plugin).toEqual(["oh-my-magento"])
      })
    })
  })

  describe("#given unrelated strings contain the legacy package name", () => {
    describe("#when migrating the config", () => {
      it("#then rewrites only plugin entries and preserves unrelated fields", async () => {
        const configPath = join(testDir, "opencode.json")
        writeFileSync(
          configPath,
          JSON.stringify(
            {
              plugin: ["oh-my-openagent"],
              notes: "keep oh-my-openagent in this text field",
              paths: ["/tmp/oh-my-openagent/cache"],
            },
            null,
            2,
          ),
        )
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(true)
        const saved = JSON.parse(readFileSync(configPath, "utf-8")) as {
          plugin: string[]
          notes: string
          paths: string[]
        }
        expect(saved.plugin).toEqual(["oh-my-magento"])
        expect(saved.notes).toBe("keep oh-my-openagent in this text field")
        expect(saved.paths).toEqual(["/tmp/oh-my-openagent/cache"])
      })
    })
  })

  describe("#given opencode.jsonc contains a nested plugin key before the top-level plugin array", () => {
    describe("#when migrating the config", () => {
      it("#then rewrites only the top-level plugin array", async () => {
        const configPath = join(testDir, "opencode.jsonc")
        writeFileSync(
          configPath,
          `{
  "nested": {
    "plugin": ["oh-my-openagent"]
  },
  "plugin": ["oh-my-openagent@latest"]
}
`,
        )
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()

        const result = migrateLegacyPluginEntry(configPath)

        expect(result).toBe(true)
        const content = readFileSync(configPath, "utf-8")
        expect(content).toContain(`"nested": {
    "plugin": ["oh-my-openagent"]
  }`)
        expect(content).toContain(`"plugin": [
    "oh-my-magento@latest"
  ]`)
      })
    })
  })

  describe("#given config file does not exist", () => {
    describe("#when attempting migration", () => {
      it("#then returns false", async () => {
        const { migrateLegacyPluginEntry } = await importFreshMigrationModule()
        const result = migrateLegacyPluginEntry(join(testDir, "nonexistent.json"))

        expect(result).toBe(false)
      })
    })
  })
})
