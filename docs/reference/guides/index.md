# Guides

These guides explain Rig's core features in plain language. The reference docs say what exists; these guides explain why it exists, how it works, and how to change it safely.

| Guide | What it explains |
| --- | --- |
| [Agent loop](agent-loop.md) | How one user message becomes model calls, tool calls, and a final answer. |
| [System prompt](system-prompt.md) | What instructions Rig gives the model and how project context is added. |
| [Tools](tools.md) | How Rig lets the model read files, search, run commands, and edit. |
| [Sandbox and approvals](permissions.md) | Where Rig's security boundary lives and how optional confirmations work. |
| [Providers](providers.md) | How Anthropic, OpenAI, OpenRouter, and Google Gemini plug in. |
| [Sessions](sessions.md) | How Rig saves and resumes conversations. |
| [Compaction](compaction.md) | Why long chats need context management and what Rig has today. |

## How To Read These

Each guide uses the same shape:

1. The simple idea.
2. The problem it solves.
3. How Rig implements it today.
4. How to customize or extend it.
5. What to be careful about.
