export interface ComposerResult {
  command: string
  stdout: string
  stderr: string
  exitCode: number
  duration: number
}

export const ALLOWED_COMPOSER_COMMANDS = [
  "show",
  "info",
  "outdated",
  "depends",
  "prohibits",
  "validate",
  "diagnose",
  "check-platform-reqs",
  "licenses",
  "why",
  "why-not",
  "audit",
] as const
