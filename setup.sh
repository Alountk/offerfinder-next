#!/usr/bin/env bash
#
# Verifies that the machine has everything needed to run this repo and, for each
# missing dependency, asks for permission before installing it.
#
# Usage:
#   ./setup.sh          interactive: asks before every installation
#   ./setup.sh --yes    accept every installation without asking (CI / unattended)
#   ./setup.sh --help
#
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR" || exit 1

REQUIRED_NODE_MAJOR=22
PNPM_VERSION="$(sed -n 's/.*"packageManager": *"pnpm@\([^"]*\)".*/\1/p' package.json)"
PNPM_VERSION="${PNPM_VERSION:-11.9.0}"

ASSUME_YES=false
case "${1:-}" in
  -y | --yes) ASSUME_YES=true ;;
  -h | --help)
    sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  "") ;;
  *)
    echo "Unknown option: $1 (use --help)" >&2
    exit 1
    ;;
esac

if [ -t 1 ]; then
  GREEN=$'\033[32m'; RED=$'\033[31m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  GREEN=""; RED=""; YELLOW=""; BOLD=""; RESET=""
fi

ok() { echo "${GREEN}✔${RESET} $1"; }
warn() { echo "${YELLOW}!${RESET} $1"; }
fail() { echo "${RED}✘${RESET} $1"; }

OS="$(uname -s)"
PENDING=()

has() { command -v "$1" >/dev/null 2>&1; }

# ask "<question>" -> 0 if the user accepts
ask() {
  if $ASSUME_YES; then
    return 0
  fi
  if [ ! -t 0 ]; then
    warn "Non-interactive shell: skipping (run ./setup.sh in a terminal or use --yes)"
    return 1
  fi
  local answer
  read -r -p "  $1 [y/N] " answer
  case "$answer" in
    y | Y | yes | YES | s | S | si | SI | sí) return 0 ;;
    *) return 1 ;;
  esac
}

# Runs a command echoing it first; returns its status
run() {
  echo "  \$ $*"
  "$@"
}

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if ! has nvm && [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$NVM_DIR/nvm.sh" >/dev/null 2>&1
  fi
  type nvm >/dev/null 2>&1
}

node_major() {
  has node || { echo 0; return; }
  node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0
}

# Installs a package with the system package manager (brew / apt-get)
system_install() {
  local brew_pkg="$1" apt_pkg="$2"
  if has brew; then
    run brew install "$brew_pkg"
  elif has apt-get; then
    run sudo apt-get install -y "$apt_pkg"
  else
    fail "No supported package manager found (brew / apt-get). Install '$apt_pkg' manually."
    return 1
  fi
}

echo "${BOLD}Checking requirements for live-coding-fe${RESET}"
echo

# --- git ---------------------------------------------------------------------
if has git; then
  ok "git $(git --version | awk '{print $3}')"
else
  fail "git is not installed"
  if ask "Install git?"; then
    system_install git git || PENDING+=("git")
  else
    PENDING+=("git")
  fi
fi

# --- Node.js -----------------------------------------------------------------
# If an acceptable Node is already installed through nvm, just activate it (no installation needed)
if [ "$(node_major)" -lt "$REQUIRED_NODE_MAJOR" ] && load_nvm &&
  nvm use "$REQUIRED_NODE_MAJOR" --silent >/dev/null 2>&1; then
  NODE_FROM_NVM=true
else
  NODE_FROM_NVM=false
fi

if [ "$(node_major)" -ge "$REQUIRED_NODE_MAJOR" ]; then
  ok "node $(node -v)"
  if $NODE_FROM_NVM; then
    warn "Node $REQUIRED_NODE_MAJOR was activated with nvm for this script only; run 'nvm use $REQUIRED_NODE_MAJOR' in your shell (the repo has a .nvmrc)"
  fi
else
  if has node; then
    fail "node $(node -v) found, but >= $REQUIRED_NODE_MAJOR is required"
  else
    fail "node is not installed (>= $REQUIRED_NODE_MAJOR required)"
  fi

  if load_nvm; then
    if ask "Install Node $REQUIRED_NODE_MAJOR with nvm?"; then
      run nvm install "$REQUIRED_NODE_MAJOR" && run nvm use "$REQUIRED_NODE_MAJOR" >/dev/null
    fi
  elif has brew; then
    if ask "Install Node $REQUIRED_NODE_MAJOR with Homebrew (node@$REQUIRED_NODE_MAJOR)?"; then
      run brew install "node@$REQUIRED_NODE_MAJOR" &&
        run brew link --overwrite --force "node@$REQUIRED_NODE_MAJOR"
    fi
  elif has apt-get; then
    warn "On Debian/Ubuntu the distro Node is usually too old. Install it via nvm: https://github.com/nvm-sh/nvm"
  else
    warn "Install Node $REQUIRED_NODE_MAJOR manually: https://nodejs.org or https://github.com/nvm-sh/nvm"
  fi

  hash -r 2>/dev/null
  if [ "$(node_major)" -ge "$REQUIRED_NODE_MAJOR" ]; then
    ok "node $(node -v)"
  else
    PENDING+=("node >= $REQUIRED_NODE_MAJOR")
  fi
fi

# --- pnpm --------------------------------------------------------------------
pnpm_ok() {
  has pnpm && [ "$(pnpm --version 2>/dev/null | cut -d. -f1)" = "${PNPM_VERSION%%.*}" ]
}

if pnpm_ok; then
  ok "pnpm $(pnpm --version)"
elif ! has node || [ "$(node_major)" -lt "$REQUIRED_NODE_MAJOR" ]; then
  fail "pnpm $PNPM_VERSION cannot be installed until Node is available"
  PENDING+=("pnpm $PNPM_VERSION")
else
  if has pnpm; then
    fail "pnpm $(pnpm --version) found, but $PNPM_VERSION (major ${PNPM_VERSION%%.*}) is expected"
  else
    fail "pnpm is not installed"
  fi
  if ask "Install pnpm $PNPM_VERSION?"; then
    if has corepack; then
      run corepack enable && run corepack prepare "pnpm@$PNPM_VERSION" --activate
    fi
    hash -r 2>/dev/null
    if ! pnpm_ok; then
      warn "corepack did not work, falling back to npm"
      run npm install -g "pnpm@$PNPM_VERSION"
    fi
  fi
  hash -r 2>/dev/null
  if pnpm_ok; then
    ok "pnpm $(pnpm --version)"
  else
    PENDING+=("pnpm $PNPM_VERSION")
  fi
fi

# --- Project dependencies ----------------------------------------------------
if pnpm_ok; then
  if [ -d node_modules ] && [ -d apps/web/node_modules ] && [ -d apps/mocks/node_modules ]; then
    ok "project dependencies installed"
  else
    fail "project dependencies are not installed"
    if ask "Run 'pnpm install'?"; then
      run pnpm install || PENDING+=("pnpm install")
    else
      PENDING+=("pnpm install")
    fi
  fi

  # --- Playwright browser (only needed for `pnpm e2e`) -----------------------
  if [ -d node_modules ]; then
    case "$OS" in
      Darwin) PW_CACHE="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/Library/Caches/ms-playwright}" ;;
      *) PW_CACHE="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}" ;;
    esac
    if ls -d "$PW_CACHE"/chromium-* >/dev/null 2>&1; then
      ok "Playwright Chromium browser"
    else
      fail "Playwright Chromium browser is not installed (only needed for 'pnpm e2e')"
      if ask "Install Playwright Chromium?"; then
        run pnpm --filter @live-coding/qa-web exec playwright install chromium || PENDING+=("playwright chromium")
      else
        PENDING+=("playwright chromium (optional, only for e2e)")
      fi
    fi
  fi
fi

# --- Summary -----------------------------------------------------------------
echo
if [ "${#PENDING[@]}" -eq 0 ]; then
  echo "${GREEN}${BOLD}All set.${RESET} Start the project with: pnpm dev"
  exit 0
fi

echo "${YELLOW}${BOLD}Pending:${RESET}"
for item in "${PENDING[@]}"; do
  echo "  - $item"
done
echo "Run ./setup.sh again once you have installed them."
exit 1
