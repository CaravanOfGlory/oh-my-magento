import { PLUGIN_NAME as PACKAGE_NAME } from "./version"

export const PLUGIN_NAME = PACKAGE_NAME
export const LEGACY_PLUGIN_NAME = "oh-my-openagent"
export const OPENCODE_PLUGIN_NAME = PLUGIN_NAME
export const OPENCODE_LEGACY_PLUGIN_NAME = LEGACY_PLUGIN_NAME
export const PUBLISHED_PACKAGE_NAME = PLUGIN_NAME
export const ACCEPTED_PACKAGE_NAMES = ["oh-my-opencode", OPENCODE_PLUGIN_NAME, PLUGIN_NAME] as const
export const CONFIG_BASENAME = "oh-my-magento"
export const FORMER_CONFIG_BASENAME = "oh-my-openagent"
export const LEGACY_CONFIG_BASENAME = "oh-my-opencode"
export const LOG_FILENAME = "oh-my-magento.log"
export const CACHE_DIR_NAME = "oh-my-magento"
