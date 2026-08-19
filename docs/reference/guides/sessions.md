# Sessions

## The Simple Idea

A session is a saved conversation. It lets Rig stop and later continue with the same transcript.

In Codex terms, it is close to a thread.

## The Problem

Coding work often takes more than one terminal run. Without sessions, every restart loses the transcript, tool results, model choice, cwd, and title.

Rig needs a durable place to store that conversation.

## How Rig Solves It

Rig stores sessions under `~/.rig/sessions/`:

- `index.json`: metadata for listing.
- `<session-id>.json`: full transcript and metadata.

The TUI saves after each user turn. Resuming a session restores the old messages into the agent.
Session metadata stores stable configuration provider IDs. In particular, both
OpenAI API-key and subscription sessions persist `openai`; older
`openai-codex` metadata is normalized to `openai` during resume. The separate
`openai_auth` value prevents Rig from restoring a model through an incompatible
OpenAI adapter when configuration changes. Legacy `openai` sessions are treated
as API-key sessions, and legacy `openai-codex` sessions as subscription sessions.

## Ways To Resume

From the shell:

```bash
rig sessions
rig resume <session-id>
```

## Why CWD Matters

Tools are created for the workspace when the TUI starts. Resume sessions from
the shell with `rig resume <id>` so Rig can restore the saved cwd before
creating them.

## Where To Look

- `internal/session/session.go`: file-backed session store.
- `cmd/rig/main.go`: create, list, resume, and save wiring.
