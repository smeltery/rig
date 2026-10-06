#!/usr/bin/env bash
# Keep the existing entry point; dependencies come from bun.lock.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
bun scripts/check-docs.ts
