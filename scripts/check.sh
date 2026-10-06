#!/usr/bin/env bash
# Shared by CI and Git hooks. Flox provides every executable used here.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
case "${1:-all}" in
  quality)
    files="$(gofmt -l cmd internal)"
    if [[ -n "$files" ]]; then printf '%s\n' "$files"; exit 1; fi
    go vet ./...
    golangci-lint run
    shellcheck install.sh scripts/*.sh
    actionlint
    ./scripts/loc-budget.sh
    bun run --bun prettier --check "website/**/*.{html,css,js}" "scripts/*.ts"
    bun test scripts
    bun run docs
    bun run website
    git diff --check
    ;;
  test)
    go test -race ./...
    go build ./...
    ;;
  all)
    "$0" quality
    "$0" test
    ;;
  *) echo "usage: $0 [quality|test|all]" >&2; exit 2 ;;
esac
