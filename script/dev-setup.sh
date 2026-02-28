#!/usr/bin/env bash
# script/dev-setup.sh
# One-command local development setup for oh-my-magento

set -euo pipefail

COLOR_RESET="\033[0m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_CYAN="\033[36m"
COLOR_RED="\033[31m"

log_info() {
  echo -e "${COLOR_CYAN}ℹ${COLOR_RESET} $1"
}

log_success() {
  echo -e "${COLOR_GREEN}✓${COLOR_RESET} $1"
}

log_warn() {
  echo -e "${COLOR_YELLOW}⚠${COLOR_RESET} $1"
}

log_error() {
  echo -e "${COLOR_RED}✗${COLOR_RESET} $1"
}

detect_platform() {
  local os=""
  local arch=""
  
  case "$OSTYPE" in
    darwin*)
      os="darwin"
      ;;
    linux*)
      os="linux"
      ;;
    msys*|win32*)
      os="windows"
      ;;
    *)
      log_error "Unsupported OS: $OSTYPE"
      exit 1
      ;;
  esac
  
  case "$(uname -m)" in
    arm64|aarch64)
      arch="arm64"
      ;;
    x86_64|amd64)
      arch="x64"
      ;;
    *)
      log_error "Unsupported architecture: $(uname -m)"
      exit 1
      ;;
  esac
  
  echo "${os}-${arch}"
}

main() {
  echo ""
  log_info "🔨 oh-my-magento Local Development Setup"
  echo ""
  
  # Check if we're in the project root
  if [[ ! -f "package.json" ]] || ! grep -q '"name": "oh-my-magento"' package.json 2>/dev/null; then
    log_error "Must be run from oh-my-magento project root"
    exit 1
  fi
  
  # Check Bun
  if ! command -v bun &> /dev/null; then
    log_error "Bun is not installed. Install from https://bun.sh"
    exit 1
  fi
  log_success "Bun $(bun --version) detected"
  
  # Detect platform
  PLATFORM=$(detect_platform)
  log_success "Platform detected: $PLATFORM"
  
  # Install dependencies
  log_info "Installing dependencies..."
  bun install
  log_success "Dependencies installed"
  
  # Build plugin
  log_info "Building plugin..."
  bun run build
  log_success "Plugin built"
  
  # Build platform binaries
  log_info "Building platform binaries (this may take a while)..."
  bun run build:binaries
  log_success "Platform binaries built"
  
  # Link platform package
  PLATFORM_PKG="oh-my-magento-${PLATFORM}"
  PLATFORM_DIR="packages/${PLATFORM}"
  
  if [[ ! -d "$PLATFORM_DIR" ]]; then
    log_error "Platform directory not found: $PLATFORM_DIR"
    log_error "Expected platform: $PLATFORM"
    exit 1
  fi
  
  log_info "Linking platform package: $PLATFORM_PKG"
  (cd "$PLATFORM_DIR" && bun link) > /dev/null 2>&1
  log_success "Platform package registered"
  
  log_info "Linking to project..."
  bun link "$PLATFORM_PKG" > /dev/null 2>&1
  log_success "Platform binary linked to project"
  
  # Link main package
  log_info "Linking main package globally..."
  bun link > /dev/null 2>&1
  log_success "oh-my-magento CLI available globally"
  
  # Verify installation
  log_info "Verifying installation..."
  if oh-my-magento --version > /dev/null 2>&1; then
    log_success "CLI is working correctly"
  else
    log_error "CLI verification failed"
    exit 1
  fi
  
  echo ""
  log_success "🎉 Development environment ready!"
  echo ""
  echo "Next steps:"
  echo "  1. Run: oh-my-magento install"
  echo "  2. Configure your providers (Claude, OpenAI, Gemini, etc.)"
  echo "  3. Start coding!"
  echo ""
}

main "$@"
