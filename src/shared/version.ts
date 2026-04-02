import packageJson from "../../package.json" with { type: "json" }

/**
 * Plugin version from package.json.
 * Available at compile time in standalone binaries.
 */
export const PLUGIN_VERSION = packageJson.version

/**
 * Plugin name.
 */
export const PLUGIN_NAME = packageJson.name
