#!/bin/bash

set -e

# Customize this for your binary
BINARY_NAME="gitely"
VERSION="v0.1.0-alpha"
REPO="plesioo/gitely"
INSTALL_DIR="/usr/local/bin"

# Detect OS + ARCH
OS=$(uname | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
  linux)
    case "$ARCH" in
      x86_64)   FILE="$BINARY_NAME-linux-x64" ;;
      aarch64)  FILE="$BINARY_NAME-linux-arm64" ;;
      *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  darwin)
    case "$ARCH" in
      x86_64)   FILE="$BINARY_NAME-macos-x64" ;;
      arm64)    FILE="$BINARY_NAME-macos-arm64" ;;
      *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  mingw*|cygwin*|msys*)
    FILE="$BINARY_NAME-windows-x64.exe"
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

echo "Downloading $FILE..."
curl -L "https://github.com/$REPO/releases/download/$VERSION/$FILE" -o "$BINARY_NAME"
chmod +x "$BINARY_NAME"
sudo mv "$BINARY_NAME" "$INSTALL_DIR/"

echo "$BINARY_NAME installed to $INSTALL_DIR"
