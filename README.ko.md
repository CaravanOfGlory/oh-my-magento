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

**Magento 2 + Hyvä** 엔터프라이즈 전자상거래를 위한 멀티 에이전트 AI 오케스트레이션 시스템. [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 포크로, Magento 전용 에이전트, 스킬, 툴, 훅, 커맨드를 추가했습니다.

OmM 설치하고. `ultrawork` 치세요. 끝.

## 설치

### 사람용

다음 프롬프트를 복사해서 여러분의 LLM 에이전트(Claude Code, AmpCode, Cursor 등)에 붙여넣으세요:

```
Install and configure oh-my-magento by following the instructions here:
https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

**대안 (추천하지 않음, 직접 실행)**:

인터랙티브 인스톨러를 실행하세요:

```bash
bunx oh-my-magento install  # 추천
npx oh-my-magento install   # 대안
```

> **참고**: CLI는 모든 주요 플랫폼용 독립 실행 파일을 포함합니다. 설치 후 CLI 실행에 런타임(Bun/Node.js)이 필요하지 않습니다.
>
> **지원 플랫폼**: macOS (ARM64, x64), Linux (x64, ARM64, Alpine/musl), Windows (x64)

### LLM 에이전트용

설치 가이드를 가져와서 따라 하세요:

```bash
curl -s https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

### 소스에서 설치 (개발용)

플러그인을 개발할 때만 필요:

```bash
# 리포지토리 클론
git clone https://github.com/CaravanOfGlory/oh-my-magento.git ~/.oh-my-magento
cd ~/.oh-my-magento

# 의존성 설치 및 빌드
bun install
bun run build

# 개발용 링크
bun link

# 인스톨러 실행
oh-my-magento install
```

자세한 내용은 [설치 가이드](docs/guide/installation.md)를 참고하세요.

---

## 이 README 건너뛰기

문서 읽는 시대는 지났습니다. 그냥 이 텍스트를 에이전트한테 붙여넣으세요:

```
Read this and tell me why it's not just another boilerplate: https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/dev/README.md
```

## 핵심 기능

### 🪄 `ultrawork`

진짜 이걸 다 읽고 계시나요? 대단하네요.

설치하세요. `ultrawork` (또는 `ulw`) 치세요. 끝.

아래 내용들, 모든 기능, 모든 최적화, 전혀 알 필요 없습니다. 그냥 알아서 다 됩니다.

다음 구독만 있어도 ultrawork는 충분히 잘 돌아갑니다 (본 프로젝트와 무관하며, 개인적인 추천일 뿐입니다):
- [ChatGPT 구독 ($20)](https://chatgpt.com/)
- [Kimi Code 구독 ($0.99) (*이번 달 한정)](https://www.kimi.com/membership/pricing?track_id=5cdeca93-66f0-4d35-aabb-b6df8fcea328)
- [GLM Coding 요금제 ($10)](https://z.ai/subscribe)
- 종량제(pay-per-token) 대상자라면 kimi와 gemini 모델을 써도 비용이 별로 안 나옵니다.

|       | 기능                      | 역할                                                                                                                        |
| :---: | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|   🤖   | **기강 잡힌 에이전트 (Discipline Agents)** | Sisyphus가 Hephaestus, Oracle, Librarian, Explore를 오케스트레이션합니다. 완전한 AI 개발팀이 병렬로 돌아갑니다. |
|   ⚡   | **`ultrawork` / `ulw`**      | 단어 하나면 됩니다. 모든 에이전트가 활성화되고 다 끝날 때까지 멈추지 않습니다. |
|   🚪   | **[IntentGate](https://factory.ai/news/terminal-bench)**                 | 사용자의 진짜 의도를 분석한 뒤 분류하거나 행동합니다. 더 이상 문자 그대로 오해해서 헛짓거리하는 일이 없습니다. |
|   🔗   | **해시 기반 편집 툴**  | `LINE#ID` 콘텐츠 해시로 모든 변경 사항을 검증합니다. stale-line 에러 0%. [oh-my-pi](https://github.com/can1357/oh-my-pi)에서 영감을 받았습니다. [하니스 프로블러 →](https://blog.can.ac/2026/02/12/the-harness-problem/) |
|   🛠️   | **LSP + AST-Grep**           | 워크스페이스 단위 이름 변경, 빌드 전 진단, AST 기반 재작성. 에이전트에게 IDE급 정밀도를 제공합니다. |
|   🧠   | **백그라운드 에이전트**        | 5명 이상의 전문가를 병렬로 투입합니다. 컨텍스트는 가볍게 유지하고 결과는 준비될 때 받습니다. |
|   📚   | **기본 내장 MCP**            | Exa(웹 검색), Context7(공식 문서), Grep.app(GitHub 검색). 항상 켜져 있습니다. |
|   🔁   | **Ralph Loop / `/ulw-loop`** | 자기 참조 루프. 100% 완료될 때까지 절대 멈추지 않습니다. |
|   ✅   | **Todo 강제 집행**            | 에이전트가 딴짓한다고요? 시스템이 멱살 잡고 끌고 옵니다. 당신의 작업은 무조건 끝납니다. |
|   💬   | **주석 검사기**          | 주석에 AI 냄새나는 헛소리를 빼버립니다. 시니어 개발자가 짠 것 같은 코드가 됩니다. |
|   🖥️   | **Tmux 연동**         | 완전한 인터랙티브 터미널. REPL, 디버거, TUI 앱들 모두 실시간으로 돌아갑니다. |
|   🔌   | **Claude Code 호환성**   | 기존 훅, 명령어, 스킬, MCP, 플러그인? 전부 여기서 그대로 돌아갑니다. |
|   🎯   | **스킬 내장 MCP**      | 스킬이 자기만의 MCP 서버를 들고 다닙니다. 컨텍스트가 부풀어 오르지 않습니다. |
|   📋   | **Prometheus 플래너**       | 인터뷰 모드로 코드 한 줄 만지기 전에 전략적인 계획부터 세웁니다. |
|   🔍   | **`/init-deep`**             | 프로젝트 전체에 걸쳐 계층적인 `AGENTS.md` 파일을 자동 생성합니다. 토큰 효율과 에이전트 성능 둘 다 잡습니다. |

### 기강 잡힌 에이전트 (Discipline Agents)

<table><tr>
<td align="center"><img src=".github/assets/sisyphus.png" height="300" /></td>
<td align="center"><img src=".github/assets/hephaestus.png" height="300" /></td>
</tr></table>

**Sisyphus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`**)는 당신의 메인 오케스트레이터입니다. 공격적인 병렬 실행으로 계획을 세우고, 전문가들에게 위임하며, 완료될 때까지 밀어붙입니다. 중간에 포기하는 법이 없습니다.

**Hephaestus** (`gpt-5.3-codex`)는 당신의 자율 딥 워커입니다. 레시피가 아니라 목표를 주세요. 베이비시터 없이 알아서 코드베이스를 탐색하고, 패턴을 연구하며, 끝에서 끝까지 전부 해냅니다. *진정한 장인(The Legitimate Craftsman).*

**Prometheus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`**)는 당신의 전략 플래너입니다. 인터뷰 모드로 작동합니다. 코드 한 줄 만지기 전에 질문을 던져 스코프를 파악하고 상세한 계획부터 세웁니다.

모든 에이전트는 해당 모델의 특장점에 맞춰 튜닝되어 있습니다. 수동으로 모델 바꿔가며 뻘짓하지 마세요. [더 알아보기 →](docs/guide/overview.md)

> Anthropic이 [우리 때문에 OpenCode를 막아버렸습니다.](https://x.com/thdxr/status/2010149530486911014) 그래서 Hephaestus의 별명이 "진정한 장인(The Legitimate Craftsman)"인 겁니다. (어디서 많이 들어본 이름이죠?) 아이러니를 노렸습니다.
>
> Opus에서 제일 잘 돌아가긴 하지만, Kimi K2.5 + GPT-5.3 Codex 조합만으로도 바닐라 Claude Code는 가볍게 바릅니다. 설정도 필요 없습니다.

### 에이전트 오케스트레이션

Sisyphus가 하위 에이전트에게 일을 맡길 때, 모델을 직접 고르지 않습니다. **카테고리**를 고릅니다. 카테고리는 자동으로 올바른 모델에 매핑됩니다:

| 카테고리             | 용도                      |
| :------------------- | :--------------------------------- |
| `visual-engineering` | 프론트엔드, UI/UX, 디자인            |
| `deep`               | 자율 리서치 및 실행    |
| `quick`              | 단일 파일 변경, 오타 수정         |
| `ultrabrain`         | 하드 로직, 아키텍처 결정 |

에이전트가 어떤 작업인지 말하면, 하네스가 알아서 적합한 모델을 꺼내옵니다. 당신은 손댈 게 없습니다.

### Claude Code 호환성

Claude Code 열심히 세팅해두셨죠? 잘하셨습니다.

모든 훅, 커맨드, 스킬, MCP, 플러그인이 여기서 그대로 돌아갑니다. 플러그인까지 완벽 호환됩니다.

### 에이전트를 위한 월드클래스 툴

LSP, AST-Grep, Tmux, MCP가 대충 테이프로 붙여놓은 게 아니라 진짜로 "통합"되어 있습니다.

- **LSP**: `lsp_rename`, `lsp_goto_definition`, `lsp_find_references`, `lsp_diagnostics`. 에이전트에게 IDE급 정밀도를 쥐어줍니다.
- **AST-Grep**: 25개 언어를 지원하는 패턴 기반 코드 검색 및 재작성.
- **Tmux**: 완전한 인터랙티브 터미널. REPL, 디버거, TUI 앱. 에이전트가 세션 안에서 움직입니다.
- **MCP**: 웹 검색, 공식 문서, GitHub 코드 검색이 전부 내장되어 있습니다.

### 스킬 내장 MCP

MCP 서버들이 당신의 컨텍스트 예산을 다 잡아먹죠. 우리가 고쳤습니다.

스킬들이 자기만의 MCP 서버를 들고 다닙니다. 필요할 때만 켜서 쓰고 다 쓰면 사라집니다. 컨텍스트 창이 깔끔하게 유지됩니다.

### 해시 기반 편집 (Codes Better. Hash-Anchored Edits)

하네스 문제는 진짜 심각합니다. 에이전트가 실패하는 이유의 대부분은 모델 탓이 아니라 편집 툴 탓입니다.

> *"어떤 툴도 모델에게 수정하려는 줄에 대한 안정적이고 검증 가능한 식별자를 제공하지 않습니다... 전부 모델이 이미 본 내용을 똑같이 재현해내길 기대하죠. 그게 안 될 때—그리고 보통 안 되는데—사용자들은 모델을 욕합니다."*
>
> <br/>- [Can Bölük, 하네스 문제(The Harness Problem)](https://blog.can.ac/2026/02/12/the-harness-problem/)

[oh-my-pi](https://github.com/can1357/oh-my-pi)에서 영감을 받아, **Hashline**을 구현했습니다. 에이전트가 읽는 모든 줄에는 콘텐츠 해시 태그가 붙어 나옵니다:

```
11#VK| function hello() {
22#XJ|   return "world";
33#MB| }
```

에이전트는 이 태그를 참조해서 편집합니다. 마지막으로 읽은 후 파일이 변경되었다면 해시가 일치하지 않아 코드가 망가지기 전에 편집이 거부됩니다. 공백을 똑같이 재현할 필요도 없고, 엉뚱한 줄을 수정하는 에러(stale-line)도 없습니다.

Grok Code Fast 1 기준으로 성공률이 **6.7% → 68.3%** 로 올랐습니다. 오직 편집 툴 하나 바꿨을 뿐인데 말이죠.

### 깊은 초기화. `/init-deep`

`/init-deep`을 실행하세요. 계층적인 `AGENTS.md` 파일을 알아서 만들어줍니다:

```
project/
├── AGENTS.md              ← 프로젝트 전체 컨텍스트
├── src/
│   ├── AGENTS.md          ← src 전용 컨텍스트
│   └── components/
│       └── AGENTS.md      ← 컴포넌트 전용 컨텍스트
```

에이전트가 알아서 관련된 컨텍스트만 쏙쏙 읽어갑니다. 수동으로 관리할 필요가 없습니다.

### 플래닝. Prometheus

복잡한 작업인가요? 대충 프롬프트 던지고 기도하지 마세요.

`/start-work`를 치면 Prometheus가 호출됩니다. **진짜 엔지니어처럼 당신을 인터뷰하고**, 스코프와 모호한 점을 식별한 뒤, 코드 한 줄 만지기 전에 검증된 계획부터 세웁니다. 에이전트는 시작하기도 전에 자기가 뭘 만들어야 하는지 정확히 알게 됩니다.

### 스킬 (Skills)

스킬은 단순한 프롬프트 쪼가리가 아닙니다. 각각 다음을 포함합니다:

- 도메인에 특화된 시스템 인스트럭션
- 필요할 때만 켜지는 내장 MCP 서버
- 스코프가 제한된 권한 (에이전트가 선을 넘지 않도록)

기본 내장 스킬: `playwright` (브라우저 자동화), `git-master` (원자적 커밋, 리베이스 수술), `frontend-ui-ux` (디자인 중심 UI).

직접 추가하려면: `.opencode/skills/*/SKILL.md` 또는 `~/.config/opencode/skills/*/SKILL.md`.

**전체 기능이 궁금하신가요?** 에이전트, 훅, 툴, MCP 등 모든 디테일은 **[기능 문서 (Features)](docs/reference/features.md)** 를 확인하세요.

---

> **비하인드 스토리가 궁금하신가요?** 왜 Sisyphus가 돌을 굴리는지, 왜 Hephaestus가 "진정한 장인"인지, 그리고 [오케스트레이션 가이드](docs/guide/orchestration.md)를 읽어보세요.
>
> oh-my-magento가 처음이신가요? 어떤 모델을 써야 할지 **[설치 가이드](docs/guide/installation.md#step-5-understand-your-model-setup)** 에서 추천 조합을 확인하세요.

## 제거 (Uninstallation)

oh-my-magento를 지우려면:

1. **OpenCode 설정에서 플러그인 제거**

   `~/.config/opencode/opencode.json` (또는 `opencode.jsonc`)를 열고 `plugin` 배열에서 `"oh-my-magento"`를 지우세요.

   ```bash
   # jq 사용 시
   jq '.plugin = [.plugin[] | select(. != "oh-my-magento")]' \
       ~/.config/opencode/opencode.json > /tmp/oc.json && \
       mv /tmp/oc.json ~/.config/opencode/opencode.json
   ```

2. **설정 파일 제거 (선택 사항)**

   ```bash
   # 사용자 설정 제거
   rm -f ~/.config/opencode/oh-my-magento.json ~/.config/opencode/oh-my-magento.jsonc

   # 프로젝트 설정 제거 (있는 경우)
   rm -f .opencode/oh-my-magento.json .opencode/oh-my-magento.jsonc
   ```

3. **제거 확인**

   ```bash
   opencode --version
   # 이제 플러그인이 로드되지 않아야 합니다
   ```

## 크레딧

Oh My Magento는 [@code-yeongyu](https://github.com/code-yeongyu)의 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) 포크입니다. 핵심 에이전트 오케스트레이션 시스템, 해시 기반 편집 툴, 멀티 모델 아키텍처는 원작자의 작업입니다. 우리는 Magento 2와 Hyvä 도메인 전문성을 추가했습니다.
