import { describe, it, expect } from "bun:test"
import { PLUGIN_NAME, CONFIG_BASENAME, LOG_FILENAME, CACHE_DIR_NAME } from "./plugin-identity"

describe("plugin-identity constants", () => {
  describe("PLUGIN_NAME", () => {
    it("equals oh-my-magento", () => {
      // given

      // when

      // then
      expect(PLUGIN_NAME).toBe("oh-my-magento")
    })
  })

  describe("CONFIG_BASENAME", () => {
    it("equals oh-my-magento", () => {
      // given

      // when

      // then
      expect(CONFIG_BASENAME).toBe("oh-my-magento")
    })
  })

  describe("LOG_FILENAME", () => {
    it("equals oh-my-magento.log", () => {
      // given

      // when

      // then
      expect(LOG_FILENAME).toBe("oh-my-magento.log")
    })
  })

  describe("CACHE_DIR_NAME", () => {
    it("equals oh-my-magento", () => {
      // given

      // when

      // then
      expect(CACHE_DIR_NAME).toBe("oh-my-magento")
    })
  })
})
