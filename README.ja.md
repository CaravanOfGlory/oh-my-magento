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

**Magento 2 + Hyvä** エンタープライズeコマース向けのマルチエージェントAIオーケストレーション。 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) のフォークとして、Magento向けエージェント、スキル、ツール、フック、コマンドを追加しました。

OmMをインストールして、`ultrawork` とタイプしてください。完了です。

## インストール

### 人間向け

以下のプロンプトをコピーして、あなたのLLMエージェント（Claude Code、AmpCode、Cursorなど）に貼り付けてください：

```
Install and configure oh-my-magento by following the instructions here:
https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

またはソースから直接インストールしてください（[Bun](https://bun.sh) が必要です）：

```bash
git clone https://github.com/CaravanOfGlory/oh-my-magento.git ~/.oh-my-magento
cd ~/.oh-my-magento && bun install && bun run build && bun link
oh-my-magento install
```

詳細は[インストールガイド](docs/guide/installation.md)を参照してください。

### LLMエージェント向け

インストールガイドを取得して、それに従ってください：

```bash
curl -s https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/master/docs/guide/installation.md
```

---

## このREADMEをスキップする

ドキュメントを読む時代は終わりました。このテキストをエージェントに貼り付けるだけです：

```
Read this and tell me why it's not just another boilerplate: https://raw.githubusercontent.com/CaravanOfGlory/oh-my-magento/refs/heads/dev/README.md
```

## ハイライト

### 🪄 `ultrawork`

本当にこれを全部読んでるんですか？信じられない。

インストールして、`ultrawork`（または `ulw`）とタイプする。完了です。

以下の内容、すべての機能、すべての最適化、何も知る必要はありません。ただ勝手に動きます。

以下のサブスクリプションだけでも、ultraworkは十分に機能します（このプロジェクトとは無関係であり、個人的な推奨にすぎません）：
- [ChatGPT サブスクリプション ($20)](https://chatgpt.com/)
- [Kimi Code サブスクリプション ($0.99) (*今月限定)](https://www.kimi.com/membership/pricing?track_id=5cdeca93-66f0-4d35-aabb-b6df8fcea328)
- [GLM Coding プラン ($10)](https://z.ai/subscribe)
- 従量課金（pay-per-token）の対象であれば、kimiやgeminiモデルを使っても費用はほとんどかかりません。

|       | 機能                      | 何をするのか                                                                                                                        |
| :---: | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
|   🤖   | **規律あるエージェント (Discipline Agents)** | Sisyphusが Hephaestus、Oracle、Librarian、Exploreをオーケストレーションします。完全なAI開発チームが並列で動きます。 |
|   ⚡   | **`ultrawork` / `ulw`**      | 一言でOK。すべてのエージェントがアクティブになり、終わるまで止まりません。 |
|   🚪   | **[IntentGate](https://factory.ai/news/terminal-bench)**                 | ユーザーの真の意図を分析してから分類・行動します。もう文字通りに誤解して的外れなことをすることはありません。 |
|   🔗   | **ハッシュベースの編集ツール**  | `LINE#ID` のコンテンツハッシュですべての変更を検証します。stale-lineエラー0%。[oh-my-pi](https://github.com/can1357/oh-my-pi)にインスパイアされています。[ハーネス問題 →](https://blog.can.ac/2026/02/12/the-harness-problem/) |
|   🛠️   | **LSP + AST-Grep**           | ワークスペース単位のリネーム、ビルド前の診断、ASTを考慮した書き換え。エージェントにIDEレベルの精度を提供します。 |
|   🧠   | **バックグラウンドエージェント**        | 5人以上の専門家を並列で投入します。コンテキストは軽く保ち、結果は準備ができ次第受け取ります。 |
|   📚   | **組み込みMCP**            | Exa（Web検索）、Context7（公式ドキュメント）、Grep.app（GitHub検索）。常にオンです。 |
|   🔁   | **Ralph Loop / `/ulw-loop`** | 自己参照ループ。100%完了するまで絶対に止まりません。 |
|   ✅   | **Todoの強制執行**            | エージェントがサボる？システムが首根っこを掴んで戻します。あなたのタスクは必ず終わります。 |
|   💬   | **コメントチェッカー**          | コメントからAI臭い無駄話を排除します。シニアエンジニアが書いたようなコードになります。 |
|   🖥️   | **Tmux統合**         | 完全なインタラクティブターミナル。REPL、デバッガー、TUIアプリがすべてリアルタイムで動きます。 |
|   🔌   | **Claude Code互換性**   | 既存のフック、コマンド、スキル、MCP、プラグイン？すべてここでそのまま動きます。 |
|   🎯   | **スキル内蔵MCP**      | スキルが独自のMCPサーバーを持ち歩きます。コンテキストが肥大化しません。 |
|   📋   | **Prometheusプランナー**       | インタビューモードで、コードを1行触る前に戦略的な計画から立てます。 |
|   🔍   | **`/init-deep`**             | プロジェクト全体にわたって階層的な `AGENTS.md` ファイルを自動生成します。トークン効率とエージェントのパフォーマンスの両方を向上させます。 |

### 規律あるエージェント (Discipline Agents)

<table><tr>
<td align="center"><img src=".github/assets/sisyphus.png" height="300" /></td>
<td align="center"><img src=".github/assets/hephaestus.png" height="300" /></td>
</tr></table>

**Sisyphus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`**) はあなたのメインのオーケストレーターです。計画を立て、専門家に委任し、攻撃的な並列実行でタスクを完了まで推進します。途中で投げ出すことはありません。

**Hephaestus** (`gpt-5.3-codex`) はあなたの自律的なディープワーカーです。レシピではなく、目標を与えてください。手取り足取り教えなくても、コードベースを探索し、パターンを研究し、端から端まで実行します。*正当なる職人 (The Legitimate Craftsman).*

**Prometheus** (`claude-opus-4-6` / **`kimi-k2.5`** / **`glm-5`**) はあなたの戦略プランナーです。インタビューモードで動作し、コードに触れる前に質問をしてスコープを特定し、詳細な計画を構築します。

すべてのエージェントは、それぞれのモデルの強みに合わせてチューニングされています。手動でモデルを切り替える必要はありません。[詳しくはこちら →](docs/guide/overview.md)

> Anthropicが[私たちのせいでOpenCodeをブロックしました。](https://x.com/thdxr/status/2010149530486911014) だからこそHephaestusは「正当なる職人 (The Legitimate Craftsman)」と呼ばれているのです。皮肉を込めています。
>
> Opusで最もよく動きますが、Kimi K2.5 + GPT-5.3 Codexの組み合わせだけでも、バニラのClaude Codeを軽く凌駕します。設定は一切不要です。

### エージェントの��ーケストレーション

Sisyphusがサブエージェントにタスクを委任する際、モデルを直接選ぶことはありません。**カテゴリー**を選びます。カテゴリーは自動的に適切なモデルにマッピングされます：

| カテゴリー             | 用途                      |
| :------------------- | :--------------------------------- |
| `visual-engineering` | フロントエンド、UI/UX、デザイン            |
| `deep`               | 自律的なリサーチと実行    |
| `quick`              | 単一ファイルの変更、タイポの修正         |
| `ultrabrain`         | ハードロジック、アーキテクチャの決定 |

エージェントがどのような種類の作業かを伝え、ハーネスが適切なモデルを選択します。あなたは何も触る必要はありません。

### Claude Code互換性

Claude Codeの設定を頑張りましたね。素晴らしい。

すべてのフック、コマンド、スキル、MCP、プラグインが、変更なしでここで動きます。プラグインも含めて完全互換です。

### エージェントのためのワールドクラスのツール

LSP、AST-Grep、Tmux、MCPが、ただテープで貼り付けただけでなく、本当に「統合」されています。

- **LSP**: `lsp_rename`、`lsp_goto_definition`、`lsp_find_references`、`lsp_diagnostics`。エージェントにIDEレベルの精度を提供。
- **AST-Grep**: 25言語に対応したパターン認識コード検索と書き換え。
- **Tmux**: 完全なインタラクティブターミナル。REPL、デバッガー、TUIアプリ。エージェントがセッション内で動きます。
- **MCP**: Web検索、公式ドキュメント、GitHubコード検索がすべて組み込まれています。

### スキル内蔵MCP

MCPサーバーがあなたのコンテキスト予算を食いつぶしています。私たちがそれを修正しました。

スキルが独自のMCPサーバーを持ち歩きます。必要なときだけ起動し、終われば消えます。コンテキストウィンドウがきれいに保たれます。

### ハッシュベースの編集 (Codes Better. Hash-Anchored Edits)

ハーネスの問題は深刻です。エージェントが失敗する原因の大半はモデルではなく、編集ツールにあります。

> *「どのツールも、モデルに変更したい行に対する安定して検証可能な識別子を提供していません... すべてのツールが、モデルがすでに見た内容を正確に再現することに依存しています。それができないとき——そして大抵はできないのですが——ユーザーはモデルのせいにします。」*
>
> <br/>- [Can Bölük, ハーネス問題 (The Harness Problem)](https://blog.can.ac/2026/02/12/the-harness-problem/)

[oh-my-pi](https://github.com/can1357/oh-my-pi) に触発され、**Hashline**を実装しました。エージェントが読むすべての行にコンテンツハッシュがタグ付けされて返されます：

```
11#VK| function hello() {
22#XJ|   return "world";
33#MB| }
```

エージェントはこのタグを参照して編集します。最後に読んだ後でファイルが変更されていた場合、ハッシュが一致せず、コードが壊れる前に編集が拒否されます。空白を正確に再現する必要もなく、間違った行を編集するエラー (stale-line) もありません。

Grok Code Fast 1 で、成功率が **6.7% → 68.3%** に上昇しました。編集ツールを1つ変えただけで、です。

### 深い初期化。`/init-deep`

`/init-deep` を実行してください。階層的な `AGENTS.md` ファイルを生成します：

```
project/
├── AGENTS.md              ← プロジェクト全体のコンテキスト
├── src/
│   ├── AGENTS.md          ← src 専用のコンテキスト
│   └── components/
│       └── AGENTS.md      ← コンポーネント専用のコンテキスト
```

エージェントが関連するコンテキストだけを自動で読み込みます。手動での管理はゼロです。

### プランニング。Prometheus

複雑なタスクですか？プロンプトを投げて祈るのはやめましょう。

`/start-work` で Prometheus が呼び出されます。**本物のエンジニアのようにあなたにインタビューし**、スコープと曖昧さを特定し、コードに触れる前に検証済みの計画を構築します。エージェントは作業を始める前に、自分が何を作るべきか正確に理解します。

### スキル (Skills)

スキルは単なるプロンプトではありません。それぞれ以下をもたらします：

- ドメインに最適化されたシステム命令
- 必要なときに起動する組み込みMCPサーバー
- スコープ制限された権限（エージェントが境界を越えないようにする）

組み込み：`playwright`（ブラウザ自動化）、`git-master`（アトミックなコミット、リベース手術）、`frontend-ui-ux`（デザイン重視のUI）。

独自に追加するには：`.opencode/skills/*/SKILL.md` または `~/.config/opencode/skills/*/SKILL.md`。

**全機能を知りたいですか？** エージェント、フック、ツール、MCPなどの詳細は **[機能ドキュメント (Features)](docs/reference/features.md)** をご覧ください。

---

> **背景のストーリーを知りたいですか？** なぜSisyphusは岩を転がすのか、なぜHephaestusは「正当なる職人」なのか、そして[オーケストレーションガイド](docs/guide/orchestration.md)をお読みください。
>
> oh-my-magentoは初めてですか？どのモデルを使うべきかについては、**[インストールガイド](docs/guide/installation.md#step-5-understand-your-model-setup)** で推奨モデルを確認してください。

## アンインストール (Uninstallation)

oh-my-magentoを削除するには：

1. **OpenCodeの設定からプラグインを削除する**

   `~/.config/opencode/opencode.json`（または `opencode.jsonc`）を編集し、`plugin` 配列から `"oh-my-magento"` を削除します：

   ```bash
   # jq を使用する場合
   jq '.plugin = [.plugin[] | select(. != "oh-my-magento")]' \
       ~/.config/opencode/opencode.json > /tmp/oc.json && \
       mv /tmp/oc.json ~/.config/opencode/opencode.json
   ```

2. **設定ファイルを削除する（オプション）**

   ```bash
   # ユーザー設定を削除
   rm -f ~/.config/opencode/oh-my-magento.json ~/.config/opencode/oh-my-magento.jsonc

   # プロジェクト設定を削除（存在する場合）
   rm -f .opencode/oh-my-magento.json .opencode/oh-my-magento.jsonc
   ```

3. **削除の確認**

   ```bash
   opencode --version
   # プラグインがロードされなくなっているはずです
   ```

## Credits

Oh My Magento is a fork of [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by [@code-yeongyu](https://github.com/code-yeongyu). The core agent orchestration system, hash-anchored edit tool, and multi-model architecture are their work. We extended it with Magento 2 and Hyvä domain expertise.
