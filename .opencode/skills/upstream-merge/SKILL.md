---
name: upstream-merge
description: "Merge upstream code-yeongyu/oh-my-opencode changes into our CaravanOfGlory/oh-my-magento fork. Handles conflict resolution with automatic rebrand (oh-my-opencode→oh-my-magento). Triggers: 'merge upstream', 'sync upstream', 'sync fork', 'upstream merge', '合并上游', '同步上游'."
---

# Upstream Merge — Fork Sync with Rebrand

Merge `code-yeongyu/oh-my-opencode:dev` into `CaravanOfGlory/oh-my-magento:dev` with automatic rebrand.

## Rebrand Rules

| From | To |
|------|----|
| `oh-my-opencode` | `oh-my-magento` |
| `OhMyOpenCode` | `OhMyMagento` |
| `code-yeongyu/oh-my-opencode` | `CaravanOfGlory/oh-my-magento` |
| `code-yeongyu` (non-npm) | `CaravanOfGlory` |

**Preserve:** `@code-yeongyu/comment-checker` (npm scope — never change)

## Procedure

### Phase 1: Setup & Fetch

```bash
# Ensure upstream remote exists
git remote get-url upstream 2>/dev/null || \
  git remote add upstream https://github.com/code-yeongyu/oh-my-opencode.git

git fetch upstream dev
```

Check divergence before proceeding:
```bash
git --no-pager log --oneline dev..upstream/dev | wc -l   # upstream ahead
git --no-pager log --oneline upstream/dev..dev            # our local-only commits
```

Report commit count to user. If 0 commits ahead, abort — already up to date.

### Phase 2: Merge

```bash
git merge upstream/dev --no-edit
```

If clean merge (exit 0): skip to Phase 4.
If conflicts (exit 1): proceed to Phase 3.

### Phase 3: Resolve Conflicts

List conflicted files:
```bash
git diff --name-only --diff-filter=U
```

Apply resolution strategy by file category:

**Category A — Platform packages (`packages/*/package.json`)**
Always keep ours. These have our package names and versions.
```bash
git checkout --ours packages/*/package.json
git add packages/*/package.json
```

**Category B — Root `package.json`**
Manual resolution:
1. Keep our `name`, `version`, `description`, `keywords`, `repository`, `bugs`, `homepage`, `bin`, `exports`
2. Accept upstream structural changes (new dependencies, scripts, etc.)
3. Keep our `optionalDependencies` block (oh-my-magento-*), remove upstream's (oh-my-opencode-*)
4. Remove duplicate conflict markers

**Category C — All other conflicted files** (src/, docs/, README*, assets/, script/)
Accept upstream version, then rebrand:
```bash
git checkout --theirs <file1> <file2> ...
```

### Phase 4: Rebrand

Run the bundled rebrand script on the entire project:
```bash
bash .opencode/skills/upstream-merge/scripts/rebrand.sh
```

This handles all files including auto-merged (non-conflicted) ones that may have introduced `oh-my-opencode` references.

If the script reports "WARNING: stale references found", manually fix the listed files.

### Phase 5: Stage & Verify

```bash
git add -A
bun run typecheck
```

If typecheck fails, fix errors (common: missing imports from upstream refactors). Re-run until clean.

### Phase 6: Commit

```bash
git commit --no-edit
```

Do NOT push unless user explicitly requests it.

## Troubleshooting

**Missing import after merge**: Upstream may have refactored imports. Use `grep` to find the function definition, then add the import.

**Schema JSON conflicts**: Accept theirs + rebrand. The schema is auto-generated and will be correct after rebrand.

**New files from upstream with old brand**: The rebrand script in Phase 4 catches these automatically — it scans the entire project, not just conflicted files.

**`@code-yeongyu/comment-checker` got rebranded by accident**: The rebrand script uses placeholder protection. If it still happens, restore with:
```bash
sed -i '' 's/@CaravanOfGlory\/comment-checker/@code-yeongyu\/comment-checker/g' package.json
```
