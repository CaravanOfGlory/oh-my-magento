import { generateModelConfig } from "./src/cli/model-fallback"

const config = {
  hasClaude: false,
  hasOpenAI: false,
  hasGemini: false,
  hasCopilot: true,
  hasOpencodeZen: false,
  hasZaiCodingPlan: false,
  hasKimiForCoding: true,
  isMax20: false,
}

const result = generateModelConfig(config)
console.log("Hephaestus:", JSON.stringify(result.agents.hephaestus, null, 2))
console.log("Deep:", JSON.stringify(result.categories.deep, null, 2))
