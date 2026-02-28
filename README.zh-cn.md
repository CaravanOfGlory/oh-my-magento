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

**Magento 2 + Hyvä** 企业级电商智能体编排系统。

安装 OmM，输入 `ultrawork`，搞定。

## 安装

### 快速开始（推荐）

直接从 npm 安装：

```bash
# 使用 npm
npm install -g oh-my-magento

# 使用 bun（更快）
bun install -g oh-my-magento

# 运行交互式安装器
oh-my-magento install
```

### 给 LLM Agent 看的

复制并粘贴以下提示词：

```
通过以下命令从 npm 安装 oh-my-magento：
npm install -g oh-my-magento && oh-my-magento install

按照交互式提示操作。详细配置说明见：
https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

### 从源码安装（开发用）

仅当你需要开发插件时才需要：

```bash
# 克隆仓库
git clone https://github.com/CaravanOfGlory/oh-my-magento.git ~/.oh-my-magento
cd ~/.oh-my-magento

# 安装依赖并构建
bun install
bun run build

# 开发模式链接
bun link

# 运行安装器
oh-my-magento install
```

详见 [安装指南](docs/guide/installation.md)。


---

## 跳过这个 README 吧

读文档的时代已经过去了。直接把下面这行发给你的 Agent：

```
Read this and tell me why it's not just another boilerplate: https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/dev/README.md
```

## 核心亮点

### 🪄 `ultrawork`

你竟然还在往下读？真有耐心。

安装。输入 `ultrawork` (或者 `ulw`)。搞定。

下面的内容，包括所有特性、所有优化，你全都不需要知道，它自己就能完美运行。

只需以下订阅之一，ultrawork 就能顺畅工作（本项目与它们没有任何关联，纯属个人推荐）：
- [ChatGPT 订阅 ($20)](https://chatgpt.com/)
- [Kimi Code 订阅 ($0.99) (*仅限本月*)](https://www.kimi.com/membership/pricing?track_id=5cdeca93-66f0-4d35-aabb-b6df8fcea328)
- [GLM Coding 套餐 ($10)](https://z.ai/subscribe)
- 如果你能使用按 token 计费的方式，用 kimi 和 gemini 模型花不了多少钱。

|       | 特性                      | 功能说明                                                                                                                        |
| :---: | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|   🤖   | **自律军团 (Discipline Agents)** | Sisyphus 负责调度 Hephaestus、Oracle、Librarian 和 Explore。一支完整的 AI 开发团队并行工作。                                       |
|   ⚡   | **`ultrawork` / `ulw`**      | 一键触发，所有智能体出动。任务完成前绝不罢休。                                                                           |
|   🚪   | **[IntentGate 意图门](https://factory.ai/news/terminal-bench)**                 | 真正行动前，先分析用户的真实意图。彻底告别被字面意思误导的 AI 废话。                                         |
|   🔗   | **基于哈希的编辑工具**  | 每次修改都通过 `LINE#ID` 内容哈希验证、0% 错误修改。灵感来自 [oh-my-pi](https://github.com/can1357/oh-my-pi)。[马具问题 →](https://blog.can.ac/2026/02/12/the-harness-problem/) |
|   🛠️   | **LSP + AST-Grep**           | 工作区级别的重命名、构建前诊断、基于 AST 的重写。为 Agent 提供 IDE 级别的精度。                                              |
|   🧠   | **后台智能体**        | 同时发射 5+ 个专家并行工作。保持上下文干净，随时获取成果。                                                            |
|   📚   | **内置 MCP**            | Exa (网络搜索)、Context7 (官方文档)、Grep.app (GitHub 源码搜索)。默认开启。                                                    |
|   🔁   | **Ralph Loop / `/ulw-loop`** | 自我引用闭环。达不到 100% 完成度绝不停止。                                                                                |
|   ✅   | **Todo 强制执行**            | Agent 想要摸鱼？系统直接揪着领子拽回来。你的任务，必须完成。                                                                 |
|   💬   | **注释审查员**          | 剔除带有浓烈 AI 味的冗余注释。写出的代码就像老练的高级工程师写的。                                                                          |
|   🖥️   | **Tmux 集成**         | 完整的交互式终端支持。跑 REPL、用调试器、用 TUI 工具，全都在实时会话中完成。                                                                        |
|   🔌   | **Claude Code 兼容**   | 你现有的 Hooks、命令、技能、MCP 和插件？全都能无缝迁移过来。                                                                     |
|   🎯   | **技能内嵌 MCP**      | 技能自带其所需的 MCP 服务器。按需开启，不会撑爆你的上下文窗口。                                                                               |
|   📋   | **Prometheus 规划师**       | 动手写代码前，先通过访谈模式做好战略规划。                                                                             |
|   🔍   | **`/init-deep`**             | 在整个项目目录层级中自动生成 `AGENTS.md`。不仅省 Token，还能大幅提升 Agent 理解力。 |

### 自律军团 (Discipline Agents)

<table><tr>
<td align="center"><img src=".github/assets/sisyphus.png" height="300" /></td>
<td align="center"><img src=".github/assets/hephaestus.png" height="300" /></td>
</tr></table>

**Sisyphus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`**) 是你的主指挥官。他负责制定计划、分配任务给专家团队，并以极其激进的并行策略推动任务直至完成。他从不半途而废。

**Hephaestus** (`gpt-5.3-codex`) 是你的自主深度工作者。你只需要给他目标，不要给他具体做法。他会自动探索代码库模式，从头到尾独立执行任务，绝不会中途要你当保姆。*名副其实的正牌工匠。*

**Prometheus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`**) 是你的战略规划师。他通过访谈模式，在动一行代码之前，先通过提问确定范围并构建详尽的执行计划。

每一个 Agent 都针对其底层模型的特点进行了专门调优。你无需手动来回切换模型。[阅读背景设定了解更多 →](docs/guide/overview.md)

> Anthropic [因为我们屏蔽了 OpenCode](https://x.com/thdxr/status/2010149530486911014)。这就是为什么我们将 Hephaestus 命名为“正牌工匠 (The Legitimate Craftsman)”。这是一个故意的讽刺。
>
> 我们在 Opus 上运行得最好，但仅仅使用 Kimi K2.5 + GPT-5.3 Codex 就足以碾压原版的 Claude Code。完全不需要配置。

### 智能体调度机制

当 Sisyphus 把任务分配给子智能体时，他选择的不是具体的模型，而是 **类别 (Category)**。系统会自动将类别映射到最合适的模型：

| 类别             | 作用领域                      |
| :------------------- | :--------------------------------- |
| `visual-engineering` | 前端、UI/UX、设计            |
| `deep`               | 深度自主调研与执行    |
| `quick`              | 单文件修改、修错字         |
| `ultrabrain`         | 复杂硬核逻辑、架构决策 |

智能体只需要说明要做什么类型的工作，框架就会挑选出最合适的模型去干。你完全不需要操心。

### 完全兼容 Claude Code

你已经花了大力气调教好了 Claude Code 的配置？太好了。

这里完美兼容所有的 Hook、命令、技能、MCP 以及插件。所有配置直接生效，包括插件系统。

### 赋予 Agent 世界级的开发工具

LSP、AST-Grep、Tmux、MCP 并不是用胶水勉强糊在一起的，而是真正深度的集成。

- **LSP**: 支持 `lsp_rename`、`lsp_goto_definition`、`lsp_find_references` 和 `lsp_diagnostics`。给 Agent 提供 IDE 般的精准操作。
- **AST-Grep**: 支持 25 种编程语言，能够理解语法树的模式匹配和代码重写。
- **Tmux**: 真实的交互式终端环境，支持 REPL、调试器以及 TUI 工具。Agent 的进程持久运行。
- **MCP**: 内置 Web 搜索、官方文档直连以及 GitHub 级代码搜索。

### 技能专属的按需 MCP 服务器

一堆全局 MCP 服务器极其消耗 Context 额度，我们修好了这个问题。

现在每个技能 (Skill) 都带着自己的专属 MCP。只在执行该任务时启动，任务完成即刻销毁。Context 窗口始终清爽。

### 拒绝瞎改：基于内容哈希的编辑工具 (Hash-Anchored Edits)

Harness 问题是真的。绝大多数所谓的 Agent 故障，其实并不是大模型变笨了，而是他们用的文件编辑工具太烂了。

> *“目前所有工具都无法为模型提供一种稳定、可验证的行定位标识……它们全都依赖于模型去强行复写一遍自己刚才看到的原文。当模型一旦写错——而且这很常见——用户就会怪罪于大模型太蠢了。”*
>
> <br/>- [Can Bölük, The Harness Problem](https://blog.can.ac/2026/02/12/the-harness-problem/)

受 [oh-my-pi](https://github.com/can1357/oh-my-pi) 的启发，我们实现了 **Hashline** 技术。Agent 读到的每一行代码，末尾都会打上一个强绑定的内容哈希值：

```
11#VK| function hello() {
22#XJ|   return "world";
33#MB| }
```

Agent 发起修改时，必须通过这些标签引用目标行。如果在此期间文件发生过变化，哈希验证就会失败，从而在代码被污染前直接驳回。不再有缩进空格错乱，彻底告别改错行的惨剧。

在 Grok Code Fast 1 上，仅仅因为更换了这套编辑工具，修改成功率直接从 **6.7% 飙升至 68.3%**。

### 深度上下文初始化：`/init-deep`

执行一次 `/init-deep`。它会为你生成一个树状的 `AGENTS.md` 文件系统：

```
project/
├── AGENTS.md              ← 全局级架构与约定
├── src/
│   ├── AGENTS.md          ← src 级规范
│   └── components/
│       └── AGENTS.md      ← 组件级详细说明
```

Agent 会自动顺藤摸瓜加载对应的 Context，免去了你所有的手动喂喂喂的麻烦。

### 让 Agent 动手前先过脑子：Prometheus

碰到了硬骨头？千万不要扔个 Prompt 就双手合十祈祷。

输入 `/start-work`，召唤 Prometheus 出场。**他会像一个真实的主管那样去采访你**，主动深挖需求、指出模糊地带，并在改动哪怕一行代码之前产出经过严密论证的计划。你的 Agent 终于知道了自己在干嘛。

### 技能系统 (Skills)

这里的 Skills 绝不只是一段无脑的 Prompt 模板。它们包含了：

- 面向特定领域的极度调优系统指令
- 按需加载的独立 MCP 服务器
- 对 Agent 能力边界的强制约束

默认内置：`playwright`（极其稳健的浏览器自动化）、`git-master`（全自动的原子级提交及 rebase 手术）、`frontend-ui-ux`（设计感拉满的 UI 实现）。

想加你自己的？放进 `.opencode/skills/*/SKILL.md` 或者 `~/.config/opencode/skills/*/SKILL.md` 就行。

**想看所有的硬核功能说明吗？** 点击查看 **[详细特性文档 (Features)](docs/reference/features.md)** ，深入了解 Agent 架构、Hook 流水线、核心工具链和所有的内置 MCP 等等。

---

> **第一次用 oh-my-magento？** 阅读 **[概述](docs/guide/overview.md)** 了解你拥有哪些功能，或查看 **[编排指南](docs/guide/orchestration.md)** 了解 Agent 如何协作。

## 如何卸载 (Uninstallation)

要移除 oh-my-magento:

1. **从你的 OpenCode 配置文件中去掉插件**

   编辑 `~/.config/opencode/opencode.json` (或 `opencode.jsonc`) ，并把 `"oh-my-magento"` 从 `plugin` 数组中删掉：

   ```bash
   # 如果你有 jq 的话
   jq '.plugin = [.plugin[] | select(. != "oh-my-magento")]' \
       ~/.config/opencode/opencode.json > /tmp/oc.json && \
       mv /tmp/oc.json ~/.config/opencode/opencode.json
   ```

2. **清除配置文件 (可选)**

   ```bash
   # 移除全局用户配置
   rm -f ~/.config/opencode/oh-my-magento.json ~/.config/opencode/oh-my-magento.jsonc

   # 移除当前项目的配置
   rm -f .opencode/oh-my-magento.json .opencode/oh-my-magento.jsonc
   ```

3. **确认卸载成功**

   ```bash
   opencode --version
   # 这个时候就应该没有任何关于插件的输出信息了
   ```

## 致谢

Oh My Magento 基于 [@code-yeongyu](https://github.com/code-yeongyu) 的 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 进行开发。核心的多智能体编排系统、基于哈希锚点的编辑工具以及多模型架构均来自上游项目。我们在此基础上扩展了 Magento 2 和 Hyvä 领域的专业能力。
