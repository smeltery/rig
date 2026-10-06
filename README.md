<!-- markdownlint-disable-next-line MD033 -->
# <img src="website/assets/mark.svg" width="32" height="32" alt=""> rig

[![Rig — keep your tools close, your work in view](website/assets/og.png)](docs/README.md)

[![CI](https://github.com/smeltery/rig/actions/workflows/ci.yml/badge.svg)](https://github.com/smeltery/rig/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/smeltery/rig)](https://github.com/smeltery/rig/releases)
[![Go](https://img.shields.io/badge/Go-1.25%2B-00ADD8?logo=go&logoColor=white)](go.mod)
[![Bun](https://img.shields.io/badge/tooling-Bun-14151a?logo=bun)](package.json)
[![Flox](https://img.shields.io/badge/environment-Flox-6d5bd0)](.flox/env/manifest.toml)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-fab040?logo=precommit&logoColor=black)](.pre-commit-config.yaml)
[![License](https://img.shields.io/badge/license-PolyForm_Shield_1.0.0-blue)](LICENSE)

A small Go coding agent for your terminal. Rig works in your repository, follows
`AGENTS.md` and reusable skills, and keeps the plan, tool activity, and delegated
work visible while you build.

- **Your provider:** Anthropic, OpenAI, Google Gemini, or OpenRouter.
- **Your workflow:** interactive chat, headless runs, saved sessions, and
  `/design`, `/plan`, `/build`, `/review` prompts.
- **Your environment:** one native binary; run it inside your chosen VM or
  sandbox to control filesystem, process, network, and credential access.

## Start

```sh
curl -fsSL https://raw.githubusercontent.com/smeltery/rig/main/install.sh | bash
export ANTHROPIC_API_KEY="your-key"
cd your-project
rig
```

See [installation](docs/install.md) for checksums and pinned versions, or the
[quick start](docs/quick-start.md) for other providers and subscription login.

## Explore

[Documentation](docs/README.md) · [Workflows](docs/guides/workflows.md) ·
[Configuration](docs/reference/config.md) · [Troubleshooting](docs/guides/troubleshooting.md)

## Develop

```sh
flox activate
just setup
just check
```

[Development guide](docs/development.md) · [Architecture](docs/reference/architecture.md) ·
[Website and Vercel](docs/operations/website.md)

[PolyForm Shield License 1.0.0](LICENSE) · Made by [Smeltery](https://github.com/smeltery).
