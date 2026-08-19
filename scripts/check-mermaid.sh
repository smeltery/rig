#!/usr/bin/env bash
# Extracts every ```mermaid fenced block from tracked markdown files and
# renders it with the Mermaid CLI, so a broken diagram fails CI instead of
# silently rendering wrong on GitHub.
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

puppeteer_config="$work_dir/puppeteer.json"
echo '{"args":["--no-sandbox"]}' >"$puppeteer_config"

block_count=0
failures=0

while IFS= read -r -d '' file; do
  in_block=0
  block_file=""
  block_start_line=0
  line_no=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    line_no=$((line_no + 1))
    if [[ "$in_block" -eq 0 && "$line" =~ ^\`\`\`mermaid[[:space:]]*$ ]]; then
      in_block=1
      block_count=$((block_count + 1))
      block_start_line=$line_no
      block_file="$work_dir/block-${block_count}.mmd"
      : >"$block_file"
      continue
    fi
    if [[ "$in_block" -eq 1 && "$line" =~ ^\`\`\`[[:space:]]*$ ]]; then
      in_block=0
      log_file="$work_dir/block-${block_count}.log"
      if ! npx --yes -p @mermaid-js/mermaid-cli mmdc \
        --puppeteerConfigFile "$puppeteer_config" \
        -i "$block_file" -o "$work_dir/block-${block_count}.svg" \
        >"$log_file" 2>&1; then
        echo "error: $file:${block_start_line} invalid mermaid diagram" >&2
        cat "$log_file" >&2
        failures=$((failures + 1))
      fi
      continue
    fi
    if [[ "$in_block" -eq 1 ]]; then
      echo "$line" >>"$block_file"
    fi
  done <"$file"
done < <(git ls-files -z -- '*.md')

if ((block_count == 0)); then
  echo "check-mermaid: no mermaid diagrams found"
  exit 0
fi

if ((failures > 0)); then
  echo "error: $failures of $block_count mermaid diagram(s) failed to render" >&2
  exit 1
fi

echo "check-mermaid: all $block_count mermaid diagram(s) rendered successfully"
