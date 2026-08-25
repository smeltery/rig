# Configuration

Rig loads the first available config:

1. `./rig.yaml`
2. `~/.rig/config.yaml`
3. Embedded defaults from `internal/config/defaults/rig.yaml`

First hit wins. Config files are not merged.

## Default Config

This is the complete configuration surface. Copy it to `~/.rig/config.yaml` or
`./rig.yaml` and change only the values you need.

```yaml
# LLM backend: anthropic, openai, openrouter, or google.
provider: anthropic

# OpenAI only: api_key uses OPENAI_API_KEY; subscription uses `rig login`.
# openai_auth: api_key

model: claude-opus-5

# Optional. When omitted, subagents follow the active provider and model.
# subagents:
#   provider: anthropic
#   model: <claude-model-id>

# Optional interactive confirmations. Empty by default.
# tool_approvals:
#   - git
#   - rm -rf
#   - write_file

# Transcripts compact at 70% of this estimate.
compaction:
  context_window_tokens: 200000

features:
  agents_file: true
  skills: true
  prompt_caching: true

output:
  verbose: false

# Optional named prompt additions or overrides.
# phases:
#   security:
#     description: Review authentication and trust boundaries
#     prompt: |
#       Inspect the requested security boundary and verify any fixes.
```

The compaction window applies consistently to the coordinator and child
agents. Children that follow the coordinator use the active model after a
`/model` switch while retaining this configured window. Omitting the setting
keeps the built-in 200,000-token estimate for both.

The embedded source, including annotated provider examples, is
[`internal/config/defaults/rig.yaml`](https://github.com/smeltery/rig/blob/main/internal/config/defaults/rig.yaml).

## Provider Selection

| Config | Auth source | Provider adapter |
| --- | --- | --- |
| `provider: anthropic` | `ANTHROPIC_API_KEY` | `internal/llm/anthropic` |
| `provider: openai` with `openai_auth: api_key` | `OPENAI_API_KEY` | `internal/llm/openai.Client` |
| `provider: openai` with `openai_auth: subscription` | ChatGPT/Codex device-code credentials from `~/.rig/auth.json` | `internal/llm/openai.CodexClient` |
| `provider: openrouter` | `OPENROUTER_API_KEY` | `internal/llm/openrouter` |
| `provider: google` | `GOOGLE_API_KEY` | `internal/llm/google` |

Subscription credentials are created with `rig login` and removed with `rig logout`. The docs describe only where credentials live and which flow uses them; token values are never generated into developer docs.

The top-level `provider` selects the backend for a session. In the TUI, `/model` lists models for that provider and switches the model and compactor for the current session without rewriting configuration. Start a new session with a different `provider` value to change backends.

## Feature Flags

Each feature flag is tri-state in Go: absent means use the built-in default, while explicit `false` disables that capability.

| Flag | Default | Effect |
| --- | --- | --- |
| `agents_file` | `true` | Load AGENTS.md into the chat system prompt. Project files are read through a rooted workspace boundary. Relative and absolute project symlinks load only when their resolved targets stay inside the workspace; escaping files are skipped with a warning. Safe project files and the explicit user-global `~/.rig/AGENTS.md` remain loaded. |
| `skills` | `true` | Discover skills and expand $name references or /name slash invocations. |
| `prompt_caching` | `true` | Mark the stable system prompt prefix as cacheable when the provider supports it. |

## Output

`output.verbose` is tri-state, same as feature flags: absent or `false` means concise mode (the default).

| Setting | Default | Effect |
| --- | --- | --- |
| `output.verbose: false` | (default) | Show live in-flight activity and concise completed receipts (e.g. a file read or command run). Errors, failures, and direct `!` command output always render in full. |
| `output.verbose: true` | | Restore full tool call/result cards, including complete file contents and command output. |

## Named Phases

Rig always provides `/design`, `/plan`, `/build`, and `/review`. The optional
`phases` map adds custom named prompts or overrides default fields by name.
Default phases that are not mentioned remain available even though Rig config
files otherwise use first-hit resolution rather than merging.

```yaml
phases:
  security:
    description: Review authentication and trust boundaries
    prompt: |
      Inspect the requested security boundary.
      Report and fix actionable findings, then rerun relevant checks.

  review:
    prompt: |
      Apply this project's review policy to the requested scope.
```

Names must use lowercase letters, numbers, hyphens, or underscores. `help`,
`clear`, and `model` are reserved for native commands. See
[Named phases](phases.md) for runtime behavior and boundaries.

## Tool Approvals

`tool_approvals` is an optional top-level list. It is empty by default and
applies only to interactive coordinator calls and direct `!` commands.

```yaml
tool_approvals:
  - git
  - rm -rf
  - write_file
```

Each entry matches both an exact tool name and the start of a Bash command.
Matching is literal and case-sensitive. The next command character must be
whitespace or the end, so `git` matches `git status` but not `github`.

Entries are trimmed when loaded. Empty entries are rejected and exact
duplicates keep their first position. Rig does not parse shell chains,
wrappers, aliases, variables, scripts, or substitutions.

This is optional user-interface friction, not a security boundary. It is not
passed to `rig run` or child agents. The VM or sandbox must control filesystem,
process, network, credentials, and external-service access.

The old `permissions:` section has been removed. Rig rejects it with migration
guidance instead of silently granting broader access.
