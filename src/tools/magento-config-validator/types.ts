export interface ValidationResult {
  file: string
  valid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  line?: number
  message: string
  severity: "error" | "warning"
}

export const SUPPORTED_XML_TYPES = [
  "di.xml",
  "module.xml",
  "routes.xml",
  "events.xml",
  "system.xml",
  "config.xml",
  "db_schema.xml",
  "crontab.xml",
  "webapi.xml",
  "acl.xml",
  "menu.xml",
] as const
