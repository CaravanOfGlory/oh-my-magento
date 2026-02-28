# oh-my-magento v0.1.1 发布指南

## ⏰ 时间安排

**可以开始发布的时间：** 2026-02-29 16:24 UTC（明天这个时候）

**原因：** npm 对删除的包名有 24 小时的重新发布限制

## 📦 发布清单

### ✅ 已完成
- [x] 清理所有平台包中的 oh-my-opencode 旧二进制文件
- [x] 更新所有包版本号为 0.1.1
- [x] 修复 npm 发布警告（bin 路径和 repository URL）
- [x] 更新主包 optionalDependencies 为 0.1.1
- [x] 提交并推送所有更改到 dev 分支

### ⏳ 等待 24 小时后执行

## 🚀 发布步骤（2026-02-29 16:24+ UTC）

### 1️⃣ 发布所有 11 个平台包

```bash
cd /Users/hu/Projects/oh-my-magento
./script/publish-platform-packages.sh
```

**预期结果：**
- 每个包约 25-26 MB（压缩后）
- 每个包约 73-74 MB（解压后）
- 只包含一个二进制文件：oh-my-magento

**需要发布的包：**
1. oh-my-magento-darwin-arm64@0.1.1
2. oh-my-magento-darwin-x64@0.1.1
3. oh-my-magento-darwin-x64-baseline@0.1.1
4. oh-my-magento-linux-arm64@0.1.1
5. oh-my-magento-linux-arm64-musl@0.1.1
6. oh-my-magento-linux-x64@0.1.1
7. oh-my-magento-linux-x64-baseline@0.1.1
8. oh-my-magento-linux-x64-musl@0.1.1
9. oh-my-magento-linux-x64-musl-baseline@0.1.1
10. oh-my-magento-windows-x64@0.1.1
11. oh-my-magento-windows-x64-baseline@0.1.1

### 2️⃣ 发布主包

```bash
cd /Users/hu/Projects/oh-my-magento
npm publish --access public
```

**验证发布：**
```bash
npm view oh-my-magento@0.1.1
```

### 3️⃣ 测试安装

```bash
# 测试 bunx（推荐方式）
bunx oh-my-magento@0.1.1 install --help

# 测试 npx
npx oh-my-magento@0.1.1 install --help
```

### 4️⃣ 合并到 master 并创建 release

```bash
cd /Users/hu/Projects/oh-my-magento
git checkout master
git merge dev --no-ff -m "Merge branch 'dev': Release v0.1.1

- Switch to bunx/npx installation (aligns with oh-my-opencode)
- 11 clean platform packages published to npm
- Installation: bunx oh-my-magento install
- Package size optimized (~74MB per platform, cleaned up legacy binaries)
- Fixed npm publish warnings (bin path and repository URL)

Co-Authored-By: Oz <oz-agent@warp.dev>"

git push origin master
```

### 5️⃣ 创建 Git 标签和 GitHub Release

```bash
git tag -a v0.1.1 -m "v0.1.1 - Clean Platform Binaries Release

- Switch to bunx/npx installation pattern (recommended)
- 11 platform packages published to npm (clean binaries only)
- Installation: bunx oh-my-magento install
- Package size optimized (~25MB compressed, ~74MB unpacked per platform)
- Removed legacy oh-my-opencode binaries
- Fixed npm publish warnings

Aligns with oh-my-opencode installation pattern.

Co-Authored-By: Oz <oz-agent@warp.dev>"

git push origin v0.1.1
```

### 6️⃣ 在 GitHub 创建 Release

访问：https://github.com/CaravanOfGlory/oh-my-magento/releases/new?tag=v0.1.1

**Release 标题：** v0.1.1 - Clean Platform Binaries Release

**Release 说明：**

```markdown
## 🎉 v0.1.1 - Clean Platform Binaries Release

### What's New

- **Switch to bunx/npx installation** (aligns with oh-my-opencode)
- **11 clean platform packages** published to npm
- **Package size optimized** - removed legacy binaries
- **Fixed npm publish warnings** - better package.json format

### Installation

**Recommended (bunx/npx):**
```bash
bunx oh-my-magento install
# or
npx oh-my-magento install
```

**From source (development):**
```bash
git clone https://github.com/CaravanOfGlory/oh-my-magento.git
cd oh-my-magento
bun install && bun run build && bun link
oh-my-magento install
```

### Package Info

- **Main Package**: oh-my-magento@0.1.1
- **Platform Packages**: 11 packages, ~25MB each (compressed)
- **Supported Platforms**: 
  - macOS (ARM64, x64, x64-baseline)
  - Linux (x64, ARM64, x64-musl, ARM64-musl, with baseline variants)
  - Windows (x64, x64-baseline)

### Breaking Changes

- Installation method changed from `npm install -g` to `bunx`/`npx`
- Platform packages now required for CLI execution

### Links

- 📦 [npm Package](https://www.npmjs.com/package/oh-my-magento)
- 📖 [Documentation](https://github.com/CaravanOfGlory/oh-my-magento#readme)
- 🐛 [Report Issues](https://github.com/CaravanOfGlory/oh-my-magento/issues)

**Full Changelog**: https://github.com/CaravanOfGlory/oh-my-magento/compare/v0.1.0...v0.1.1
```

## 📊 验证清单

- [ ] 所有 11 个平台包成功发布
- [ ] 主包 oh-my-magento@0.1.1 成功发布
- [ ] `bunx oh-my-magento install` 可以正常工作
- [ ] 下载的包只包含一个二进制文件（oh-my-magento）
- [ ] 包大小约 25MB（压缩）/ 74MB（解压）
- [ ] master 分支已更新
- [ ] v0.1.1 标签已创建
- [ ] GitHub Release 已发布

## 🔍 故障排查

### 问题：npm 速率限制（429 Too Many Requests）

**解决方案：** 等待 10-15 分钟后重试

### 问题：2FA 认证超时

**解决方案：** 
1. 使用浏览器完成认证
2. 快速在终端继续发布流程
3. 如果超时，重新运行发布命令

### 问题：包已存在错误

**解决方案：** 检查是否已经发布过该版本：
```bash
npm view oh-my-magento-PLATFORM@0.1.1
```

## 📝 笔记

- npm 删除包后 24 小时内不能重新发布相同的包名（任何版本）
- bunx/npx 会自动下载对应平台的 optionalDependencies
- 这是与 oh-my-opencode 一致的发布模式
