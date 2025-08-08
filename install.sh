#!/usr/bin/env bash

set -euo pipefail

# Defaults (override via env or flags)
BINARY_NAME=${BINARY_NAME:-gitely}
REPO=${REPO:-plesioo/gitely}
INSTALL_DIR=${INSTALL_DIR:-/usr/local/bin}
VERSION=${VERSION:-}
INCLUDE_PRERELEASE=${INCLUDE_PRERELEASE:-false}

print_usage() {
  cat <<EOF
Usage: ./install.sh [options]

Options:
  -v, --version <tag>   Install a specific release tag (e.g. v0.1.0 or v0.1.0-alpha.1)
      --pre             Allow installing the latest pre-release (falls back to stable if jq is missing)
      --dir <path>      Install directory (default: $INSTALL_DIR)
      --repo <owner/repo>  GitHub repo (default: $REPO)
      --name <binary>   Expected binary name (default: $BINARY_NAME)
  -h, --help            Show this help

Environment variables:
  GITHUB_TOKEN          Optional, avoids GitHub API rate limits
  BINARY_NAME, REPO, INSTALL_DIR, VERSION, INCLUDE_PRERELEASE can override defaults
EOF
}

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    -v|--version)
      VERSION="$2"; shift 2;;
    --pre|--prerelease|--include-prerelease)
      INCLUDE_PRERELEASE=true; shift 1;;
    --dir|--install-dir)
      INSTALL_DIR="$2"; shift 2;;
    --repo)
      REPO="$2"; shift 2;;
    --name)
      BINARY_NAME="$2"; shift 2;;
    -h|--help)
      print_usage; exit 0;;
    *)
      echo "Unknown option: $1" >&2; print_usage; exit 1;;
  esac
done

echo "Installing $BINARY_NAME from $REPO ..."

# Detect OS/ARCH
UNAME_S=$(uname -s)
UNAME_M=$(uname -m)

case "$UNAME_S" in
  Darwin) OS=darwin; ;;
  Linux)  OS=linux;  ;;
  *) echo "Unsupported OS: $UNAME_S" >&2; exit 1;;
esac

case "$UNAME_M" in
  x86_64|amd64) ARCH=amd64; ;;
  arm64|aarch64) ARCH=arm64; ;;
  *) echo "Unsupported ARCH: $UNAME_M" >&2; exit 1;;
esac

# Build GitHub API URL
API_BASE="https://api.github.com/repos/$REPO/releases"
AUTH_HEADER=()
[[ -n "${GITHUB_TOKEN:-}" ]] && AUTH_HEADER=(-H "Authorization: Bearer $GITHUB_TOKEN")

fetch_json() {
  local url="$1"
  curl -fsSL "${AUTH_HEADER[@]}" "$url"
}

# Resolve release JSON
RELEASE_JSON=""
if [[ -n "$VERSION" ]]; then
  RELEASE_JSON=$(fetch_json "$API_BASE/tags/$VERSION") || { echo "Release tag not found: $VERSION" >&2; exit 1; }
else
  if [[ "$INCLUDE_PRERELEASE" == "true" ]]; then
    if command -v jq >/dev/null 2>&1; then
      # Latest release including pre-releases (non-draft)
      RELEASE_JSON=$(fetch_json "$API_BASE?per_page=20" | jq 'map(select(.draft==false)) | .[0]')
      if [[ -z "$RELEASE_JSON" || "$RELEASE_JSON" == "null" ]]; then
        echo "No releases found (including pre-releases)." >&2; exit 1;
      fi
    else
      echo "jq not found; falling back to latest stable release. Install jq to auto-pick latest pre-release." >&2
      RELEASE_JSON=$(fetch_json "$API_BASE/latest")
    fi
  else
    RELEASE_JSON=$(fetch_json "$API_BASE/latest")
  fi
fi

# Extract candidate asset URLs from JSON
# Prefer common naming patterns; fall back to plain binary name
extract_urls() {
  # shellcheck disable=SC2002
  echo "$RELEASE_JSON" | grep -oE '"browser_download_url"\s*:\s*"[^"]+"' | sed -E 's/.*"browser_download_url"\s*:\s*"(.*)"/\1/'
}

URLS=$(extract_urls)
if [[ -z "$URLS" ]]; then
  echo "No assets found in the selected release." >&2; exit 1;
fi

# Try patterns in order of specificity
declare -a OS_KEYS=("$OS")
[[ "$OS" == "darwin" ]] && OS_KEYS+=(macos osx)
declare -a ARCH_KEYS=("$ARCH")
[[ "$ARCH" == "amd64" ]] && ARCH_KEYS+=(x86_64 x64)
[[ "$ARCH" == "arm64" ]] && ARCH_KEYS+=(aarch64 arm64)

match_url=""
for ok in "${OS_KEYS[@]}"; do
  for ak in "${ARCH_KEYS[@]}"; do
    for pattern in \
      "/$BINARY_NAME[-_].*${ok}[-_]?${ak}(\\.tar\\.gz|\\.tgz|\\.zip|)$" \
      "/$BINARY_NAME[-_].*${ak}[-_]?${ok}(\\.tar\\.gz|\\.tgz|\\.zip|)$" \
      "/$BINARY_NAME[-_]?${ok}(\\.tar\\.gz|\\.tgz|\\.zip|)$" \
      "/$BINARY_NAME(\\.tar\\.gz|\\.tgz|\\.zip|)$" ; do
      candidate=$(echo "$URLS" | grep -E "$pattern" || true)
      if [[ -n "$candidate" ]]; then
        match_url=$(echo "$candidate" | head -n1)
        break 3
      fi
    done
  done
done

if [[ -z "$match_url" ]]; then
  # Fallback: first asset
  match_url=$(echo "$URLS" | head -n1)
  echo "Warning: could not find OS/ARCH-specific asset. Using: $match_url" >&2
fi

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

filename="$tmpdir/$(basename "$match_url")"
echo "Downloading: $match_url"
curl -fL "${AUTH_HEADER[@]}" -o "$filename" "$match_url"

# If archive, extract; otherwise assume it is the binary
case "$filename" in
  *.tar.gz|*.tgz)
    tar -xzf "$filename" -C "$tmpdir" ;;
  *.zip)
    if command -v unzip >/dev/null 2>&1; then unzip -q "$filename" -d "$tmpdir"; else echo "unzip not found" >&2; exit 1; fi ;;
esac

# Find the binary in the temp dir
BIN_PATH=""
if [[ -f "$tmpdir/$BINARY_NAME" ]]; then
  BIN_PATH="$tmpdir/$BINARY_NAME"
else
  # Try to locate executable named like the binary
  BIN_PATH=$(find "$tmpdir" -maxdepth 2 -type f -perm -001 -name "$BINARY_NAME" 2>/dev/null | head -n1 || true)
  if [[ -z "$BIN_PATH" ]]; then
    # Try any executable file if name did not match
    BIN_PATH=$(find "$tmpdir" -maxdepth 2 -type f -perm -001 2>/dev/null | head -n1 || true)
  fi
fi

if [[ -z "$BIN_PATH" || ! -f "$BIN_PATH" ]]; then
  echo "Failed to locate the $BINARY_NAME binary in release asset." >&2
  echo "Assets were:" >&2
  echo "$URLS" >&2
  exit 1
fi

chmod +x "$BIN_PATH"
echo "Installing to $INSTALL_DIR (sudo may be required)"
sudo mkdir -p "$INSTALL_DIR"
sudo mv "$BIN_PATH" "$INSTALL_DIR/$BINARY_NAME"

echo "$BINARY_NAME installed to $INSTALL_DIR"
