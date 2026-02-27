<div align="center">

[![Oh My Magento](./.github/assets/hero.jpg)](https://github.com/CaravanOfGlory/oh-my-magento#oh-my-magento)

</div>

<div align="center">

[![GitHub Release](https://img.shields.io/github/v/release/CaravanOfGlory/oh-my-magento?color=369eff&labelColor=black&logo=github&style=flat-square)](https://github.com/CaravanOfGlory/oh-my-magento/releases)
[![npm downloads](https://img.shields.io/npm/dt/oh-my-magento?color=ff6b35&labelColor=black&style=flat-square)](https://www.npmjs.com/package/oh-my-magento)
[![GitHub Stars](https://img.shields.io/github/stars/CaravanOfGlory/oh-my-magento?color=ffcb47&labelColor=black&style=flat-square)](https://github.com/CaravanOfGlory/oh-my-magento/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/CaravanOfGlory/oh-my-magento?color=ff80eb&labelColor=black&style=flat-square)](https://github.com/CaravanOfGlory/oh-my-magento/issues)
[![License](https://img.shields.io/badge/license-SUL--1.0-white?labelColor=black&style=flat-square)](https://github.com/CaravanOfGlory/oh-my-magento/blob/master/LICENSE.md)

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md) | [简体中文](README.zh-cn.md)

</div>

---

# Oh My Magento

Multi-agent AI orchestration for **Magento 2 + Hyvä** enterprise e-commerce. Built as a fork of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), extended with Magento-specific agents, skills, tools, hooks, and commands.

Not locked to Claude. Not locked to OpenAI. Claude for orchestration, GPT for reasoning, Gemini for frontend. Models get cheaper every month. We orchestrate them all.

## Installation

### For Humans

Copy and paste this prompt to your LLM agent (Claude Code, AmpCode, Cursor, etc.):

```
Install and configure oh-my-magento by following the instructions here:
https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

Or read the [Installation Guide](docs/guide/installation.md).

### For LLM Agents

Fetch the installation guide and follow it:

```bash
curl -s https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

---

## What Is This?

Oh My Magento is a plugin for [OpenCode](https://opencode.ai) that transforms a single AI agent into a coordinated Magento development team. It combines:

- **14 specialized agents** (11 core + 3 Magento-specific) working in parallel
- **9 Magento/Hyvä skills** covering module scaffolding, XML config, testing, upgrades, Hyvä themes, and more
- **4 Magento tools** for CLI execution, Composer management, config validation, and module scanning
- **5 Magento commands** (`/magento-upgrade`, `/magento-new-module`, `/magento-payment-setup`, `/hyva-new-theme`, `/hyva-compat-module`)
- **11 delegation categories** (8 general + 3 Magento: `magento-backend`, `magento-hyva`, `magento-integration`)
- **2 Magento hooks** for context injection and vendor directory protection

Install OmM. Type `ultrawork`. Done.

## Highlights

|       | Feature                                                  | What it does                                                                                                                     |
| :---: | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
|   🏪   | **Magento Agents**                                       | Magento Architect, Upgrader, and Payment specialists. Deep Magento 2 domain expertise built in.                                  |
|   🤖   | **Discipline Agents**                                    | Sisyphus orchestrates Hephaestus, Oracle, Librarian, Explore. A full AI dev team in parallel.                                    |
|   ⚡   | **`ultrawork` / `ulw`**                                  | One word. Every agent activates. Doesn't stop until done.                                                                        |
|   🔗   | **Hash-Anchored Edit Tool**                              | `LINE#ID` content hash validates every change. Zero stale-line errors. Inspired by [oh-my-pi](https://github.com/can1357/oh-my-pi). |
|   🛠️   | **LSP + AST-Grep**                                       | Workspace rename, pre-build diagnostics, AST-aware rewrites. IDE precision for agents.                                           |
|   🧠   | **Background Agents**                                    | Fire 5+ specialists in parallel. Context stays lean. Results when ready.                                                         |
|   📚   | **Built-in MCPs**                                        | Exa (web search), Context7 (official docs), Grep.app (GitHub search). Always on.                                                 |
|   🔁   | **Ralph Loop / `/ulw-loop`**                             | Self-referential loop. Doesn't stop until 100% done.                                                                             |
|   🔌   | **Claude Code Compatible**                               | Your hooks, commands, skills, MCPs, and plugins? All work here.                                                                  |
|   🎯   | **Skill-Embedded MCPs**                                  | Skills carry their own MCP servers. No context bloat.                                                                            |
|   📋   | **Prometheus Planner**                                   | Interview-mode strategic planning before any execution.                                                                          |
|   🔍   | **`/init-deep`**                                         | Auto-generates hierarchical `AGENTS.md` files throughout your project.                                                           |

---

## Magento-Specific Features

### Magento Agents

Three domain-specific agents extend the core agent roster:

| Agent | Purpose |
|-------|---------|
| **Magento Architect** | Module structure, DI config, service contracts, declarative schema, plugin/observer architecture. The Magento 2 architecture expert. |
| **Magento Upgrader** | Version migration analysis, deprecated API detection, schema migration, compatibility matrix. Human-in-the-loop confirmation for destructive operations. |
| **Magento Payment** | Payment gateway integration, PCI-DSS compliance, CSP configuration, vault integration, multi-currency/tax. Human-in-the-loop for all payment flows. |

### Magento Skills (9 built-in)

| Skill | Domain |
|-------|--------|
| `magento-module-scaffold` | Module boilerplate: registration.php, module.xml, composer.json, DI config |
| `magento-xml-config` | di.xml, system.xml, routes.xml, webapi.xml, db_schema.xml with XSD validation |
| `magento-testing` | MFTF, Integration, Unit test patterns for Magento 2 |
| `magento-performance` | Indexer tuning, cache strategies, query optimization, Varnish/FPC |
| `magento-upgrade-analysis` | Version migration with deprecated-patterns detection |
| `magento-debugging` | Xdebug, logging, DI compilation, plugin conflicts, deploy diagnostics |
| `hyva-theme` | Hyvä theme development: Alpine.js, Tailwind, view models, no RequireJS |
| `hyva-checkout` | Hyvä Checkout: Magewire components, checkout steps, payment/shipping |
| `hyva-compat-module` | Hyvä compatibility layer for third-party Magento modules |

### Magento Tools

| Tool | What it does |
|------|--------------|
| `magento-cli` | Safe execution of `bin/magento` commands with dry-run support |
| `magento-composer` | Composer operations with Magento repository authentication |
| `magento-config-validator` | XML configuration validation against Magento XSD schemas |
| `magento-module-scanner` | Scan and analyze Magento module structure, dependencies, and overrides |

### Magento Commands

| Command | What it does |
|---------|--------------|
| `/magento-upgrade` | Guided version upgrade workflow with deprecated API analysis |
| `/magento-new-module` | Interactive module scaffolding with best-practice structure |
| `/magento-payment-setup` | Payment gateway integration with PCI-DSS guardrails |
| `/hyva-new-theme` | Hyvä theme creation with Alpine.js + Tailwind setup |
| `/hyva-compat-module` | Hyvä compatibility module for third-party extensions |

### Magento Categories

Three delegation categories route Magento tasks to appropriately configured agents:

| Category | Use Cases |
|----------|-----------|
| `magento-backend` | DI, plugins, observers, service contracts, declarative schema, API |
| `magento-hyva` | Hyvä themes, Alpine.js components, Tailwind, Magewire, checkout |
| `magento-integration` | Payment gateways, ERP/PIM sync, shipping providers, multi-store |

### Magento Hooks

| Hook | What it does |
|------|--------------|
| `magento-context-injector` | Injects Magento project context (version, modules, theme) into agent prompts |
| `magento-vendor-guard` | Warns when agents attempt to modify `vendor/` directory files |

---

## Core Agents

### Discipline Agents

<table><tr>
<td align="center"><img src=".github/assets/sisyphus.png" height="300" /></td>
<td align="center"><img src=".github/assets/hephaestus.png" height="300" /></td>
</tr></table>

**Sisyphus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`** ) is your main orchestrator. He plans, delegates to specialists, and drives tasks to completion with aggressive parallel execution. He does not stop halfway.

**Hephaestus** (`gpt-5.3-codex`) is your autonomous deep worker. Give him a goal, not a recipe. He explores the codebase, researches patterns, and executes end-to-end without hand-holding. *The Legitimate Craftsman.*

**Prometheus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`** ) is your strategic planner. Interview mode: it questions, identifies scope, and builds a detailed plan before a single line of code is touched.

Every agent is tuned to its model's specific strengths. No manual model-juggling. [Learn more](docs/guide/overview.md)

### Agent Orchestration

When Sisyphus delegates to a subagent, it doesn't pick a model. It picks a **category**. The category maps automatically to the right model:

| Category             | What it's for                         |
| :------------------- | :------------------------------------ |
| `visual-engineering` | Frontend, UI/UX, design               |
| `deep`               | Autonomous research + execution       |
| `quick`              | Single-file changes, typos            |
| `ultrabrain`         | Hard logic, architecture decisions    |
| `magento-backend`    | Magento 2 backend development         |
| `magento-hyva`       | Hyvä frontend development             |
| `magento-integration`| Payment, ERP, multi-store integration |

Agent says what kind of work. Harness picks the right model. You touch nothing.

### World-Class Tools for Your Agents

LSP, AST-Grep, Tmux, MCP actually integrated, not duct-taped together.

- **LSP**: `lsp_rename`, `lsp_goto_definition`, `lsp_find_references`, `lsp_diagnostics`. IDE precision for every agent
- **AST-Grep**: Pattern-aware code search and rewriting across 25 languages
- **Tmux**: Full interactive terminal. REPLs, debuggers, TUI apps. Your agent stays in session
- **MCP**: Web search, official docs, GitHub code search. All baked in

### Hash-Anchored Edits

Every line the agent reads comes back tagged with a content hash:

```
11#VK| function hello() {
22#XJ|   return "world";
33#MB| }
```

The agent edits by referencing those tags. If the file changed since the last read, the hash won't match and the edit is rejected before corruption. No whitespace reproduction. No stale-line errors.

### Deep Initialization. `/init-deep`

Run `/init-deep`. It generates hierarchical `AGENTS.md` files:

```
project/
├── AGENTS.md              <- project-wide context
├── src/
│   ├── AGENTS.md          <- src-specific context
│   └── components/
│       └── AGENTS.md      <- component-specific context
```

Agents auto-read relevant context. Zero manual management.

---

## Claude Code Compatibility

Your hooks, commands, skills, MCPs, and plugins work here unchanged. Full compatibility, including plugins.

## Configuration

Opinionated defaults, adjustable if you insist.

See [Configuration Documentation](docs/reference/configuration.md).

**Quick Overview:**
- **Config Locations**: `.opencode/oh-my-magento.jsonc` or `.opencode/oh-my-magento.json` (project), `~/.config/opencode/oh-my-magento.jsonc` or `~/.config/opencode/oh-my-magento.json` (user)
- **JSONC Support**: Comments and trailing commas supported
- **Agents**: Override models, temperatures, prompts, and permissions for any agent
- **Magento Skills**: 9 built-in Magento/Hyvä skills + `playwright`, `git-master`, `frontend-ui-ux`
- **Categories**: 11 built-in (8 general + 3 Magento) + custom
- **Hooks**: 48 built-in hooks, all configurable via `disabled_hooks`
- **MCPs**: Built-in websearch (Exa), context7 (docs), grep_app (GitHub search)

## Uninstallation

To remove oh-my-magento:

1. **Remove the plugin from your OpenCode config**

   Edit `~/.config/opencode/opencode.json` (or `opencode.jsonc`) and remove `"oh-my-magento"` from the `plugin` array:

   ```bash
   # Using jq
   jq '.plugin = [.plugin[] | select(. != "oh-my-magento")]' \
       ~/.config/opencode/opencode.json > /tmp/oc.json && \
       mv /tmp/oc.json ~/.config/opencode/opencode.json
   ```

2. **Remove configuration files (optional)**

   ```bash
   # Remove user config
   rm -f ~/.config/opencode/oh-my-magento.json ~/.config/opencode/oh-my-magento.jsonc

   # Remove project config (if exists)
   rm -f .opencode/oh-my-magento.json .opencode/oh-my-magento.jsonc
   ```

3. **Verify removal**

   ```bash
   opencode --version
   # Plugin should no longer be loaded
   ```

## Features

See full [Features Documentation](docs/reference/features.md).

**Quick Overview:**
- **Agents**: Sisyphus, Prometheus, Oracle, Librarian, Explore, Hephaestus, Multimodal Looker, Magento Architect, Magento Upgrader, Magento Payment
- **Background Agents**: Run multiple agents in parallel like a real dev team
- **LSP & AST Tools**: Refactoring, rename, diagnostics, AST-aware code search
- **Hash-anchored Edit Tool**: `LINE#ID` references validate content before applying every change
- **Context Injection**: Auto-inject AGENTS.md, README.md, conditional rules
- **Claude Code Compatibility**: Full hook system, commands, skills, agents, MCPs
- **Built-in MCPs**: websearch (Exa), context7 (docs), grep_app (GitHub search)
- **Magento Tools**: magento-cli, magento-composer, magento-config-validator, magento-module-scanner
- **Magento Commands**: /magento-upgrade, /magento-new-module, /magento-payment-setup, /hyva-new-theme, /hyva-compat-module
- **Productivity Features**: Ralph Loop, Todo Enforcer, Comment Checker, Think Mode, and more

---

> **New to Oh My Magento?** Read the **[Overview](docs/guide/overview.md)** to understand what you have, or check the **[Orchestration Guide](docs/guide/orchestration.md)** for how agents collaborate.

## Credits

Oh My Magento is a fork of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by [@code-yeongyu](https://github.com/code-yeongyu). The core agent orchestration system, hash-anchored edit tool, and multi-model architecture are their work. We extended it with Magento 2 and Hyvä domain expertise.
