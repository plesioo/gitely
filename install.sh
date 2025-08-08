#!/bin/bash

set -e

# Customize this for your binary
BINARY_NAME="gitely"
VERSION="v0.0.0-alpha"
REPO="plesioo/gitely"
INSTALL_DIR="/usr/local/bin"

# Detect OS + ARCH
OS=$(uname | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [[ "$ARCH" == "x86_64" ]]; then
  ARCH="x64"
fi

# Download binary
echo "Installing $BINARY_NAME..."
curl -L "https://github.com/$REPO/releases/download/$VERSION/$BINARY_NAME" -o "$BINARY_NAME"
chmod +x "$BINARY_NAME"
sudo mv "$BINARY_NAME" "$INSTALL_DIR/"

echo "$BINARY_NAME installed to $INSTALL_DIR"
