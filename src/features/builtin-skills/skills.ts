import type { BuiltinSkill } from "./types"
import type { BrowserAutomationProvider } from "../../config/schema"

import {
  playwrightSkill,
  agentBrowserSkill,
  playwrightCliSkill,
  frontendUiUxSkill,
  gitMasterSkill,
  devBrowserSkill,
  magentoModuleScaffoldSkill,
  magentoXmlConfigSkill,
  magentoTestingSkill,
  magentoPerformanceSkill,
  magentoUpgradeAnalysisSkill,
  magentoDebuggingSkill,
  hyvaThemeSkill,
  hyvaCheckoutSkill,
  hyvaCompatModuleSkill,
} from "./skills/index"

export interface CreateBuiltinSkillsOptions {
  browserProvider?: BrowserAutomationProvider
  disabledSkills?: Set<string>
}

export function createBuiltinSkills(options: CreateBuiltinSkillsOptions = {}): BuiltinSkill[] {
  const { browserProvider = "playwright", disabledSkills } = options

  let browserSkill: BuiltinSkill
  if (browserProvider === "agent-browser") {
    browserSkill = agentBrowserSkill
  } else if (browserProvider === "playwright-cli") {
    browserSkill = playwrightCliSkill
  } else {
    browserSkill = playwrightSkill
  }

  const skills = [
    browserSkill,
    frontendUiUxSkill,
    gitMasterSkill,
    devBrowserSkill,
    magentoModuleScaffoldSkill,
    magentoXmlConfigSkill,
    magentoTestingSkill,
    magentoPerformanceSkill,
    magentoUpgradeAnalysisSkill,
    magentoDebuggingSkill,
    hyvaThemeSkill,
    hyvaCheckoutSkill,
    hyvaCompatModuleSkill,
  ]

  if (!disabledSkills) {
    return skills
  }

  return skills.filter((skill) => !disabledSkills.has(skill.name))
}
