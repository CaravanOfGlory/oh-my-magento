import { generateModelConfig } from "./src/cli/model-fallback"
import { argsToConfig } from "./src/cli/install-validators"

const args = {
  tui: false,
  claude: "no" as const,
  openai: "no" as const,
  gemini: "no" as const,
  copilot: "yes" as const,
  opencodeZen: "no" as const,
  zaiCodingPlan: undefined,
  kimiForCoding: "yes" as const,
  skipAuth: false,
}

const config = argsToConfig(args)
console.log("Generated config:", JSON.stringify(config, null, 2))

const result = generateModelConfig(config)
console.log("\nHephaestus agent:", JSON.stringify(result.agents.hephaestus, null, 2))
console.log("Deep category:", JSON.stringify(result.categories.deep, null, 2))
console.log("\nAll agents:", Object.keys(result.agents))
console.log("All categories:", Object.keys(result.categories))
