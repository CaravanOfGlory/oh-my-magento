import { describe, expect, test } from "bun:test"
import { Command } from "commander"
import { registerForkCommands, FORK_COMMAND_NAMES } from "./fork-commands"

describe("fork-commands", () => {
  describe("#given a fresh Command program", () => {
    describe("#when registerForkCommands is called", () => {
      const program = new Command()
      registerForkCommands(program)
      const registered = program.commands.map((c) => c.name())

      test.each([...FORK_COMMAND_NAMES])("#then '%s' command is registered", (name) => {
        expect(registered).toContain(name)
      })
    })
  })
})
