#!/usr/bin/env bash
set -euo pipefail

# ==== CONFIG (edit these) ====
REMOTE_USER="root"
REMOTE_HOST="45.12.109.7"
REMOTE_PORT="22"
# =============================

LOCAL_DIST="dist"
REMOTE_DIR="/var/www/html"
REMOTE="${REMOTE_USER}@${REMOTE_HOST}"

if [[ ! -d "$LOCAL_DIST" ]]; then
  echo "Local folder '$LOCAL_DIST' not found"
  exit 1
fi

# 1) Clean remote directory
ssh -p "$REMOTE_PORT" "$REMOTE" "sudo rm -rf ${REMOTE_DIR:?}/*"

# 2) Copy dist contents to remote directory (mirror)
rsync -e "ssh -p ${REMOTE_PORT}" -az --delete "${LOCAL_DIST}/" "${REMOTE}:${REMOTE_DIR}/"
