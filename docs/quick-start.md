# Quick start

Follow this once and you should reach your first chat.

## 1. Choose a backend

Rig defaults to Anthropic. Set `provider` when you want OpenAI, OpenRouter, or Google Gemini.

| Backend | What you need | Config | Extra step |
|------|------|------|------|
| Anthropic | `ANTHROPIC_API_KEY` | No config required | None |
| OpenAI API key | `OPENAI_API_KEY` | `provider: openai` | None |
| OpenAI subscription | ChatGPT/Codex subscription | `provider: openai` and `openai_auth: subscription` | Run `rig login` once |
| OpenRouter | `OPENROUTER_API_KEY` | `provider: openrouter` | None |
| Google Gemini | `GOOGLE_API_KEY` | `provider: google` | None |

If you are using OpenAI with an API key, you do not need `rig login`. `rig login` is only for the
device-code subscription flow.

## 2. Set credentials

Anthropic:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

OpenAI API key:

```bash
export OPENAI_API_KEY="sk-..."
```

OpenAI subscription:

```bash
rig login
```

`rig login` prints a device-code URL and one-time code, then stores the subscription credentials
in `~/.rig/auth.json`.

OpenRouter:

```bash
export OPENROUTER_API_KEY="sk-or-..."
```

Google Gemini:

```bash
export GOOGLE_API_KEY="..."
```

## 3. Create `rig.yaml` only if you need a non-default provider

Anthropic users can skip this step because `provider: anthropic` is the default.

```yaml
provider: openai
openai_auth: api_key
```

For an OpenAI subscription, use `openai_auth: subscription`. For OpenRouter or Gemini, set
`provider: openrouter` or `provider: google` respectively.

Rig reads the first config file it finds in this order:

1. `./rig.yaml`
2. `~/.rig/config.yaml`
3. Embedded defaults

See the [configuration reference](reference/config.md) for the full set of options.

## 4. Start your first chat

```bash
rig
```

`rig` and `rig chat` open the same interactive terminal UI. Once it starts, try a first prompt
like:

```text
Summarize this repository and suggest a good first change.
```

If you built Rig locally but did not install it onto your `PATH`, run `./rig` instead.

## Built-in phases

Rig includes four named prompts that appear as slash commands and as the active
label beside normal workflow progress:

| Phase | What it does |
|------|------|
| `/design <goal>` | Design a product change, feature, or bug fix without implementing it |
| `/plan <goal>` | Break accepted work into small tasks with checks |
| `/build <goal>` | Implement, test, self-review, and verify the change |
| `/review [scope]` | Review and improve code, PR feedback, or CI results |

Phases activate only through these slash commands. Ordinary prose containing a
phase name is sent unchanged and does not activate one.

Add or override named prompts with the `phases` map in `rig.yaml`. The
[configuration reference](reference/config.md) includes an example.

## Common commands

| Command | What it does |
|------|------|
| `rig` | Open interactive chat mode |
| `rig chat` | Open interactive chat mode explicitly |
| `rig sessions` | List saved chats |
| `rig doctor` | Check local config, credentials, sessions, git, and workspace |
| `rig sessions search <query>` | Search saved chat transcripts |
| `rig resume <id>` | Resume a saved chat |
| `rig login` / `rig logout` | Set up or remove OpenAI subscription auth |

See the full [CLI reference](reference/cli.md) for every command and flag.
