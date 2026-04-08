import { describe, it, expect } from "bun:test"
import {
  PLUGIN_NAME,
  LEGACY_PLUGIN_NAME,
  OPENCODE_PLUGIN_NAME,
  OPENCODE_LEGACY_PLUGIN_NAME,
  CONFIG_BASENAME,
  FORMER_CONFIG_BASENAME,
  LEGACY_CONFIG_BASENAME,
  LOG_FILENAME,
  CACHE_DIR_NAME,
} from "./plugin-identity"

describe("plugin-identity constants", () => {
  describe("PLUGIN_NAME", () => {
    it("equals oh-my-magento (from package.json)", () => {
      expect(PLUGIN_NAME).toBe("oh-my-magento")
    })
  })

  describe("LEGACY_PLUGIN_NAME", () => {
    it("equals oh-my-openagent", () => {
      expect(LEGACY_PLUGIN_NAME).toBe("oh-my-openagent")
    })
  })

  describe("OPENCODE_PLUGIN_NAME", () => {
    it("equals oh-my-openagent (canonical opencode.json entry)", () => {
      expect(OPENCODE_PLUGIN_NAME).toBe("oh-my-openagent")
    })
  })

  describe("OPENCODE_LEGACY_PLUGIN_NAME", () => {
    it("equals oh-my-magento (legacy opencode.json entry)", () => {
      expect(OPENCODE_LEGACY_PLUGIN_NAME).toBe("oh-my-magento")
    })
  })

  describe("CONFIG_BASENAME", () => {
    it("equals oh-my-magento", () => {
      expect(CONFIG_BASENAME).toBe("oh-my-magento")
    })
  })

  describe("FORMER_CONFIG_BASENAME", () => {
    it("equals oh-my-magento", () => {
      expect(FORMER_CONFIG_BASENAME).toBe("oh-my-magento")
    })
  })

  describe("LEGACY_CONFIG_BASENAME", () => {
    it("equals oh-my-openagent", () => {
      expect(LEGACY_CONFIG_BASENAME).toBe("oh-my-openagent")
    })
  })

  describe("LOG_FILENAME", () => {
    it("equals oh-my-magento.log", () => {
      expect(LOG_FILENAME).toBe("oh-my-magento.log")
    })
  })

  describe("CACHE_DIR_NAME", () => {
    it("equals oh-my-magento", () => {
      expect(CACHE_DIR_NAME).toBe("oh-my-magento")
    })
  })
})
