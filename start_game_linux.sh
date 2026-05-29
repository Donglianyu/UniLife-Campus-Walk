#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/backend"
export PORT=3002
npm install
npm start
