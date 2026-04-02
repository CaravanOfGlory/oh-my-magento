// postinstall.mjs
// Runs after npm install to verify platform binary is available

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getPlatformPackageCandidates, getBinaryPath } from "./bin/platform.js";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Detect libc family on Linux
 */
function getLibcFamily() {
  if (process.platform !== "linux") {
    return undefined;
  }
  
  try {
    const detectLibc = require("detect-libc");
    return detectLibc.familySync();
  } catch {
    return null;
  }
}

function getPackageBaseName() {
  try {
    const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
    return packageJson.name || "oh-my-opencode";
  } catch {
    return "oh-my-opencode";
  }
}

function main() {
  const { platform, arch } = process;
  const libcFamily = getLibcFamily();
  const packageBaseName = getPackageBaseName();
  
  try {
    const packageCandidates = getPlatformPackageCandidates({
      platform,
      arch,
      libcFamily,
      packageBaseName,
    });

    const resolvedPackage = packageCandidates.find((pkg) => {
      try {
        // Try to resolve the package first
        const packagePath = require.resolve(`${pkg}/package.json`);
        const packageDir = dirname(packagePath);
        const binaryPath = getBinaryPath(pkg, platform).replace(`${pkg}/`, '');
        const fullBinaryPath = join(packageDir, binaryPath);
        return existsSync(fullBinaryPath);
      } catch {
        return false;
      }
    });

    if (!resolvedPackage) {
      throw new Error(
        `No platform binary package installed. Tried: ${packageCandidates.join(", ")}`
      );
    }

    console.log(`✓ oh-my-magento binary installed for ${platform}-${arch} (${resolvedPackage})`);
  } catch (error) {
    console.warn(`⚠ oh-my-magento: ${error.message}`);
    console.warn(`  The CLI may not work on this platform.`);
    // Don't fail installation - let user try anyway
  }
}

main();
