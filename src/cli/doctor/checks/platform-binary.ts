import { createRequire } from "node:module"
import { existsSync } from "node:fs"

import { CHECK_IDS, CHECK_NAMES } from "../constants"
import type { CheckResult, DoctorIssue } from "../types"
import { getPlatformPackageCandidates, getBinaryPath } from "../../../../bin/platform.js"

const require = createRequire(import.meta.url)

interface PlatformBinaryInfo {
  platform: string
  arch: string
  libcFamily?: string | null
  packageCandidates: string[]
  resolvedPackage: string | null
  binaryPath: string | null
  binaryExists: boolean
}

function getLibcFamily(): string | null | undefined {
  if (process.platform !== "linux") {
    return undefined
  }

  try {
    const detectLibc = require("detect-libc")
    return detectLibc.familySync()
  } catch {
    return null
  }
}

function gatherPlatformBinaryInfo(): PlatformBinaryInfo {
  const { platform, arch } = process
  const libcFamily = getLibcFamily()

  const packageCandidates = getPlatformPackageCandidates({
    platform,
    arch,
    libcFamily,
  })

  const resolvedPackage = packageCandidates.find((pkg) => {
    try {
      require.resolve(getBinaryPath(pkg, platform))
      return true
    } catch {
      return false
    }
  })

  let binaryPath: string | null = null
  let binaryExists = false

  if (resolvedPackage) {
    try {
      binaryPath = require.resolve(getBinaryPath(resolvedPackage, platform))
      binaryExists = existsSync(binaryPath)
    } catch {
      binaryExists = false
    }
  }

  return {
    platform,
    arch,
    libcFamily,
    packageCandidates,
    resolvedPackage: resolvedPackage ?? null,
    binaryPath,
    binaryExists,
  }
}

export async function checkPlatformBinary(): Promise<CheckResult> {
  const info = gatherPlatformBinaryInfo()
  const issues: DoctorIssue[] = []

  const platformString = `${info.platform}-${info.arch}${info.libcFamily === "musl" ? "-musl" : ""}`

  if (!info.resolvedPackage) {
    issues.push({
      title: "Platform binary not installed",
      description: `No platform binary package found for ${platformString}. Tried: ${info.packageCandidates.join(", ")}`,
      fix: info.packageCandidates.length > 0 
        ? `Run: bun run build:binaries && cd packages/${info.platform}-${info.arch} && bun link && cd ../.. && bun link ${info.packageCandidates[0]}`
        : "Platform not supported",
      severity: "error",
      affects: ["CLI commands"],
    })
  } else if (!info.binaryExists) {
    issues.push({
      title: "Platform binary path invalid",
      description: `Package ${info.resolvedPackage} is linked but binary file not found at expected path`,
      fix: `Run: bun run build:binaries && cd packages/${info.platform}-${info.arch} && bun link`,
      severity: "error",
      affects: ["CLI commands"],
    })
  }

  const status = issues.length > 0 ? "fail" : "pass"
  const message = status === "pass" 
    ? `Platform binary installed for ${platformString}` 
    : `Platform binary not available for ${platformString}`

  return {
    name: CHECK_NAMES[CHECK_IDS.PLATFORM_BINARY],
    status,
    message,
    details: info.resolvedPackage
      ? [
          `Platform: ${platformString}`,
          `Package: ${info.resolvedPackage}`,
          `Binary: ${info.binaryPath ?? "not resolved"}`,
        ]
      : [
          `Platform: ${platformString}`,
          `Expected: ${info.packageCandidates.join(" or ")}`,
        ],
    issues,
  }
}
