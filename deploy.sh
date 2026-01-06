#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="dist"
DEST_DIR="/var/www/html"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Local folder '$BUILD_DIR' not found"
  exit 1
fi

# 1) Clean remote directory
sudo rm -rf ${DEST_DIR:?}/*

# 2) Copy dist contents
cp -r ${BUILD_DIR}/* ${DEST_DIR}/
