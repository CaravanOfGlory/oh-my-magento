import type { PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { readFile } from "fs/promises"
import { resolve, basename } from "path"
import type { ValidationResult, ValidationError } from "./types"

function validateXmlWellFormedness(content: string, filePath: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!content.trim()) {
    errors.push({ message: "File is empty", severity: "error" })
    return { file: filePath, valid: false, errors }
  }

  const xmlDeclMatch = content.match(/^<\?xml\s+version=/)
  if (!xmlDeclMatch && !content.trim().startsWith("<")) {
    errors.push({ message: "File does not start with XML declaration or root element", severity: "error" })
  }

  let depth = 0
  const tagPattern = /<\/?([a-zA-Z_][\w.-]*)[^>]*\/?>/g
  let match: RegExpExecArray | null
  while ((match = tagPattern.exec(content)) !== null) {
    const tag = match[0]
    if (tag.endsWith("/>")) continue
    if (tag.startsWith("</")) {
      depth--
    } else if (!tag.startsWith("<?") && !tag.startsWith("<!")) {
      depth++
    }
  }

  if (depth !== 0) {
    errors.push({ message: `Unbalanced XML tags (depth: ${depth})`, severity: "error" })
  }

  const fileName = basename(filePath)

  if (fileName === "di.xml") {
    validateDiXml(content, errors)
  } else if (fileName === "module.xml") {
    validateModuleXml(content, errors)
  } else if (fileName === "db_schema.xml") {
    validateDbSchemaXml(content, errors)
  }

  return { file: filePath, valid: errors.filter((e) => e.severity === "error").length === 0, errors }
}

function validateDiXml(content: string, errors: ValidationError[]): void {
  if (!content.includes("urn:magento:framework:ObjectManager")) {
    errors.push({
      message: "di.xml missing xsi:noNamespaceSchemaLocation with ObjectManager URN",
      severity: "warning",
    })
  }

  const preferencePattern = /<preference\s+for="([^"]*)"[^>]*type="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = preferencePattern.exec(content)) !== null) {
    if (!match[1].includes("\\")) {
      errors.push({
        message: `<preference> 'for' attribute may have incorrect namespace separator: "${match[1]}"`,
        severity: "warning",
      })
    }
  }
}

function validateModuleXml(content: string, errors: ValidationError[]): void {
  if (!content.includes("urn:magento:framework:Module/etc/module.xsd")) {
    errors.push({
      message: "module.xml missing correct XSD reference",
      severity: "warning",
    })
  }
  if (!/<module\s+name="[A-Z][a-zA-Z0-9]*_[A-Z][a-zA-Z0-9]*"/.test(content)) {
    errors.push({
      message: "module.xml: module name should follow Vendor_Module pattern",
      severity: "warning",
    })
  }
}

function validateDbSchemaXml(content: string, errors: ValidationError[]): void {
  if (!content.includes("urn:magento:framework:Setup/Declaration/Schema/etc/schema.xsd")) {
    errors.push({
      message: "db_schema.xml missing correct XSD reference",
      severity: "warning",
    })
  }

  const tablePattern = /<table\s+name="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = tablePattern.exec(content)) !== null) {
    if (match[1].length > 64) {
      errors.push({
        message: `Table name "${match[1]}" exceeds MySQL 64-character limit`,
        severity: "error",
      })
    }
  }
}

function formatResults(results: ValidationResult[]): string {
  const lines: string[] = []
  let totalErrors = 0
  let totalWarnings = 0

  for (const result of results) {
    const errCount = result.errors.filter((e) => e.severity === "error").length
    const warnCount = result.errors.filter((e) => e.severity === "warning").length
    totalErrors += errCount
    totalWarnings += warnCount

    const status = result.valid ? "PASS" : "FAIL"
    lines.push(`[${status}] ${result.file}`)

    for (const error of result.errors) {
      const prefix = error.severity === "error" ? "ERROR" : "WARN"
      const lineInfo = error.line ? `:${error.line}` : ""
      lines.push(`  ${prefix}${lineInfo}: ${error.message}`)
    }
  }

  lines.push(`\nSummary: ${results.length} files, ${totalErrors} errors, ${totalWarnings} warnings`)
  return lines.join("\n")
}

export function createMagentoConfigValidator(ctx: PluginInput): Record<string, ToolDefinition> {
  const configValidator: ToolDefinition = tool({
    description:
      "Validate Magento 2 XML configuration files (di.xml, module.xml, db_schema.xml, etc.). " +
      "Checks well-formedness, XSD references, naming conventions, and common mistakes.",
    args: {
      files: tool.schema
        .array(tool.schema.string())
        .describe("Paths to XML files to validate (relative to project root or absolute)"),
      project_root: tool.schema
        .string()
        .optional()
        .describe("Magento project root directory. Defaults to current working directory."),
    },
    execute: async (params) => {
      const projectRoot = params.project_root ?? ctx.directory
      const results: ValidationResult[] = []

      for (const file of params.files) {
        const fullPath = resolve(projectRoot, file)
        try {
          const content = await readFile(fullPath, "utf-8")
          results.push(validateXmlWellFormedness(content, file))
        } catch (err) {
          results.push({
            file,
            valid: false,
            errors: [{ message: `Cannot read file: ${err instanceof Error ? err.message : String(err)}`, severity: "error" }],
          })
        }
      }

      return formatResults(results)
    },
  })

  return { magento_config_validator: configValidator }
}
