#!/usr/bin/env bash
# Fails if any tracked source file exceeds the line-count budget, unless it is
# explicitly listed as an accepted exception below. Keeps the codebase's flat,
# well-organized directory layout honest without hand-policing file size in
# every review.
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

budget_lines=1000

# Files that exceed the budget for a reason that outweighs splitting them.
# Format: "path:one-line reason".
exceptions=(
  "internal/agent/agent_test.go:table-driven test file; splitting scatters related cases without improving readability"
  "internal/tui/model.go:central TUI model; the Bubble Tea update/view pattern keeps state and rendering in one file by design"
)

is_exception() {
  local path="$1" entry
  for entry in "${exceptions[@]}"; do
    if [[ "${entry%%:*}" == "$path" ]]; then
      return 0
    fi
  done
  return 1
}

failures=0
web_lines=0
while IFS= read -r path; do
  [[ -f "$path" ]] || continue
  lines="$(wc -l < "$path" | tr -d '[:space:]')"
  file_budget=$budget_lines
  case "$path" in
    website/*|scripts/*.ts) file_budget=300; web_lines=$((web_lines + lines)) ;;
  esac
  if (( lines <= file_budget )); then
    continue
  fi
  if is_exception "$path"; then
    continue
  fi
  echo "error: $path has $lines lines (budget: $file_budget)" >&2
  failures=$((failures + 1))
done < <(git ls-files --cached --others --exclude-standard -- '*.go' '*.sh' '*.ts' '*.js' '*.css' '*.html')

if (( web_lines > 1800 )); then
  echo "error: website and TypeScript tooling total $web_lines lines (budget: 1800)" >&2
  failures=$((failures + 1))
fi

if (( failures > 0 )); then
  echo "error: $failures file(s) exceed the $budget_lines line budget" >&2
  echo "either split the file or add it to the exceptions list in $0 with a reason" >&2
  exit 1
fi

echo "loc-budget: Go/shell <= 1000; website/tooling <= 300 per file, $web_lines/1800 total (${#exceptions[@]} legacy exceptions)"
