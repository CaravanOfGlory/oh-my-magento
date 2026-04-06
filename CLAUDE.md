# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

oh-my-magento is an OpenCode plugin that extends Claude Code with multi-agent orchestration (Sisyphus, Hephaestus, Prometheus, etc.), 46 lifecycle hooks, 26 tools, a skill/command/MCP system, and Claude Code compatibility. Built with Bun + TypeScript (Zod v4 validation, ESM output).

## Package & Plugin Naming

This project uses three distinct names that are easy to confuse:

| Name | What it refers to | Examples |
|------|-------------------|----------|
| `oh-my-magento` | **Our npm package + CLI binary** (package.json `name`) | `bunx oh-my-magento install`, `~/.config/opencode/oh-my-opencode.jsonc`, plugin in `opencode.json` |
| `oh-my-magento` | **Upstream npm package** (the original project we forked from) | npm badge URLs, upstream references, `optionalDependencies` |
| `oh-my-openagent` | **Upstream GitHub repo** (`caravanglory/oh-my-openagent`) | Cross-links in README as "this is a fork of..." |

> **Critical rule**: Never conflate `oh-my-magento` (upstream) with our `oh-my-magento`. Every mention of `oh-my-magento` in our docs either refers to upstream or is an alias pointing to our binary.

The CLI binary has both names as aliases (`bin` in package.json: both `oh-my-magento` and `oh-my-magento` → same file), but our canonical name is `oh-my-magento`.

## Commands

```bash
bun run build          # Full build: ESM + TypeScript declarations + JSON schema
bun run build:schema   # Regenerate schema after config changes
bun run typecheck      # tsc --noEmit
bun test               # Bun test suite (co-located *.test.ts, given/when/then style)
bun test path/to/file  # Run single test file
bun run clean          # Remove dist/

# CLI (our npm package: oh-my-magento)
bunx oh-my-magento install  # Interactive setup
bunx oh-my-magento doctor   # Health diagnostics
bunx oh-my-magento run      # Non-interactive session
```

## Architecture

```
src/
├── index.ts              # Plugin entry: loadConfig → createManagers → createTools → createHooks → createPluginInterface
├── plugin-config.ts      # JSONC multi-level config (Zod v4): project → user → defaults
├── agents/               # 11 core agents + 3 Magento-specific
├── hooks/                # 46 lifecycle hooks (Core, Continuation, Skill tiers)
├── tools/                # 26 tools (delegate-task, tmux, lsp, etc.)
├── features/             # 19 feature modules (background-agent, skill-loader, tmux, MCP-OAuth, etc.)
├── config/               # Zod v4 schema system
├── shared/               # Cross-cutting utilities (13 categories, 100+ files)
├── cli/                  # Commander.js CLI: install, run, doctor, mcp-oauth
├── mcp/                  # 3 built-in remote MCPs (websearch, context7, grep_app)
├── plugin/               # 8 OpenCode hook handlers + hook composition
├── plugin-handlers/      # 6-phase config loading pipeline
└── plugin-interface.ts   # Plugin interface types
```

**Initialization flow**: `OhMyMagentoPlugin(ctx)` → loadPluginConfig() → createManagers() → createTools() → createHooks() → createPluginInterface()
(Note: the source class is named `OhMyMagentoPlugin` — the class name has not been renamed, but all user-facing references use `oh-my-magento`)

## Key Patterns

- **Factory pattern**: All tools/hooks/agents use `createXXX()` functions
- **Hook tiers**: Session (23) → Tool-Guard (10) → Transform (4) → Continuation (7) → Skill (2)
- **Agent modes**: `primary` (respects UI model) vs `subagent` (own fallback chain)
- **Model resolution**: override → category-default → provider-fallback → system-default
- **Config**: JSONC (comments allowed), snake_case keys, Zod v4 validation
- **File naming**: kebab-case exclusively; barrel exports via `index.ts`
- **Tests**: Bun test with `#given`/`#when`/`#then` describe blocks (no Arrange-Act-Assert comments)

## Where to Add Things

| Add | Location | Also |
|-----|----------|------|
| New agent | `src/agents/` + `src/agents/builtin-agents/` | Register in `builtinAgents` in `src/agents/index.ts` |
| New hook | `src/hooks/{name}/` | Wire in `src/plugin/hooks/create-*-hooks.ts` |
| New tool | `src/tools/{name}/` | Register in `src/plugin/tool-registry.ts` |
| New feature module | `src/features/{name}/` | Wire in `src/plugin/` |
| New MCP | `src/mcp/` | Register in `createBuiltinMcps()` |
| New skill | `src/features/builtin-skills/skills/` | Implement `BuiltinSkill` interface |
| New CLI command | `src/cli/cli-program.ts` | Add Commander.js subcommand |
| New doctor check | `src/cli/doctor/checks/` | Register in `checks/index.ts` |
| Config schema change | `src/config/schema/` | Run `bun run build:schema` after |

## Conventions

- **Bun only**: never use npm/yarn/pnpm — `bun run`, `bun build`, `bunx`
- **Types**: use `bun-types`, not `@types/node`
- **File operations in code**: use dedicated tools (Read/Edit/Write), never bash commands (mkdir/touch/rm)
- **Suppressed types**: never use `as any`, `@ts-ignore`, `@ts-expect-error`
- **Error handling**: never use empty catch blocks `catch(e) {}`
- **Comments**: avoid generic AI-generated comment patterns (enforced by comment-checker hook)
- **Emojis**: never add to code/comments unless user explicitly asks
- **Version changes**: never modify `package.json` version locally — publishing is handled by GitHub Actions only

## CI/CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR | Tests (split: mock-heavy isolated + batch), typecheck, build, schema auto-commit |
| `publish.yml` | manual | Version bump, npm publish, platform binaries, GitHub release |
| `sisyphus-agent.yml` | @mention | AI agent handles issues/PRs |

Publish via `gh workflow run publish -f bump=patch` — never run `bun publish` directly.

## Debugging

- Logger writes to `/tmp/oh-my-magento.log`
- See `AGENTS.md` for detailed architecture documentation

### Local Plugin Testing

`opencode.json` 中的插件默认指向 npm 包版本。要测试本地修改：

```jsonc
{
  "plugin": [
    // 生产：使用 npm 版本
    // "oh-my-magento@latest"

    // 本地开发：指向 dist/index.js
    "file:///absolute/path/to/oh-my-magento/dist/index.js"
  ]
}
```

每次修改后重新构建：`bun run build`，然后重启 OpenCode。
