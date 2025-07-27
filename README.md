# ⚡ Smart Tab Manager

> 一个浏览器标签页管理插件，解决您不断打开重复Tab的习惯！

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/smart-tab-manager/smart-tab-manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/vue.js-3.4.0-4FC08D.svg)](https://vuejs.org/)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-brightgreen.svg)](https://developer.chrome.com/docs/extensions/)

[功能特性](#功能特性) • [安装使用](#安装使用) • [开发指南](#开发指南) • [贡献代码](#贡献代码) • [许可证](#许可证)

</div>

---

## 🌟 功能特性

### 🔍 智能重复检测

- **实时监控**：新标签页打开时即时检测重复
- **自定义规则**：支持用户自定义重复判断标准
- **一键清理**：批量关闭重复页面，释放系统资源

### 💾 自动同步恢复

- **多层同步策略**：定时同步 + 实时同步 + 关闭前同步
- **版本化存储**：保留20个历史版本，支持时间点恢复
- **智能恢复**：浏览器崩溃后自动检测并提供恢复选项
- **手动快照**：创建命名快照，永久保存重要状态

### 🗂️ 工作空间管理

- **场景化分组**：为不同工作场景创建专属工作空间
- **一键切换**：快速在不同工作模式间切换
- **智能去重**：打开工作空间时自动处理重复页面
- **拖拽操作**：直观的拖拽添加和排序功能

### ⚡ 极客友好

- **命令面板**：Spotlight风格的快速操作面板 (⌘K)
- **全键盘操作**：支持完整的键盘快捷键操作
- **手势支持**：丰富的鼠标手势和触控操作
- **高度可定制**：详细的个性化设置选项

---

## 📸 界面预览

<div align="center">


### 主界面

![主界面](/Users/wangxt/myspace/smart-tab-manager/doc-images/home.png)

![命令面板](/Users/wangxt/myspace/smart-tab-manager/doc-images/home-2.png)

### 配置页面

![工作空间](/Users/wangxt/myspace/smart-tab-manager/doc-images/config-custom.png)

![恢复界面](/Users/wangxt/myspace/smart-tab-manager/doc-images/config-sync.png)

![恢复界面](/Users/wangxt/myspace/smart-tab-manager/doc-images/config-snapshot.png))

</div>

---

## 🚀 安装使用

### 开发版本安装

1. **下载源码**

```bash
git clone https://github.com/smart-tab-manager/smart-tab-manager.git
cd smart-tab-manager
```

2. **安装依赖&构建**

```bash
npm install
npm run build
```

3. **加载到Chrome**

- 打开Chrome，访问 `chrome://extensions/`
- 开启"开发者模式"
- 点击"加载已解压的扩展程序"
- 选择项目的 `dist` 文件夹

---

## 📖 使用指南

### 快速开始

1. **首次使用**：安装后点击工具栏图标打开主界面
2. **检测重复**：插件会自动检测重复页面并在图标上显示数量
3. **创建工作空间**：点击"新建工作空间"开始组织你的标签页
4. **命令面板**：按下 `⌘K` (Mac) 或 `Ctrl+K` (Windows) 打开快速操作面板

### 核心操作

#### 🔍 重复页面管理

- **自动检测**：新标签页会自动检测是否重复
- **批量清理**：点击主界面的"清理"按钮或使用 `⌘D` 快捷键
- **白名单设置**：在设置中添加不需要检测的网站

#### 🗂️ 分组操作

```
创建分组：点击"+ 新建分组"
添加标签页：右键标签页 → "添加到分组"
打开分组：点击分组卡片的播放按钮
快速切换：使用 ⌘1-9 快捷键
```

#### 💾 会话管理

```
创建快照：⌘S 或点击"快照"按钮
恢复会话：⌘R 或在启动时选择恢复选项
查看历史：点击"恢复"按钮查看所有快照
```

### 快捷键列表

| 快捷键              | 功能         |
| ------------------- | ------------ |
| `⌘K` / `Ctrl+K`     | 打开命令面板 |
| `⌘D` / `Ctrl+D`     | 检测重复页面 |
| `⌘S` / `Ctrl+S`     | 创建快照     |
| `⌘R` / `Ctrl+R`     | 恢复会话     |
| `⌘1-9` / `Ctrl+1-9` | 切换工作空间 |
| `Space`             | 预览模式     |
| `Enter`             | 执行操作     |
| `Esc`               | 取消/关闭    |

---

## 🛠️ 开发指南

### 技术栈

- **前端框架**：Vue.js 3.4 + Composition API
- **构建工具**：Vite + TypeScript
- **UI组件**：Headless UI + Tailwind CSS
- **动画库**：Motion One (苹果式动效)
- **开发工具**：ESLint + Prettier + Vitest

### 项目结构

```
smart-tab-manager/
├── src/
│   ├── background/          # 后台脚本
│   ├── content/            # 内容脚本
│   ├── popup/              # 弹窗界面
│   ├── options/            # 设置页面
│   ├── components/         # Vue组件
│   ├── utils/              # 工具函数
│   ├── types/              # TypeScript类型
│   └── styles/             # 样式文件
├── public/                 # 静态资源
├── docs/                   # 文档
└── tests/                  # 测试文件
```

### 开发环境搭建

1. **克隆仓库**

```bash
git clone https://github.com/smart-tab-manager/smart-tab-manager.git
cd smart-tab-manager
```

2. **安装依赖**

```bash
npm install
npm run build
```

---

## 🤝 贡献代码

我们欢迎所有形式的贡献！无论是bug报告、功能建议还是代码贡献。

### 贡献流程

1. **Fork 项目**到你的GitHub账户
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建Pull Request**

### 开发规范

- **代码风格**：使用ESLint + Prettier保持代码一致性
- **提交信息**：遵循 [Conventional Commits](https://conventionalcommits.org/) 规范
- **测试覆盖**：新功能需要包含相应的测试
- **文档更新**：重要功能需要更新README和API文档

### 提交信息规范

```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建工具或辅助工具的变动
```

---

## 🐞 问题反馈

### 报告Bug

如果你发现了bug，请创建一个[Issue](https://github.com/smart-tab-manager/smart-tab-manager/issues)并包含：

- **问题描述**：清晰描述遇到的问题
- **重现步骤**：详细的重现步骤
- **预期结果**：你期望的正确行为
- **实际结果**：实际发生的情况
- **环境信息**：浏览器版本、操作系统等
- **截图/日志**：如果可能，提供相关截图或错误日志

### 功能建议

我们也欢迎功能建议！请创建一个[Feature Request](https://github.com/smart-tab-manager/smart-tab-manager/issues/new?template=feature_request.md)并描述：

- **功能描述**：详细描述建议的功能
- **使用场景**：什么情况下会用到这个功能
- **期望行为**：功能应该如何工作
- **替代方案**：是否考虑过其他解决方案

---

## 📚 相关资源

### 社区

- [GitHub Discussions](https://github.com/smart-tab-manager/smart-tab-manager/discussions) - 讨论和问答
- [Issues](https://github.com/smart-tab-manager/smart-tab-manager/issues) - Bug报告和功能建议

### 相关项目

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Vue.js 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

## 📝 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新历史。

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

---

## 🌟 致谢

感谢所有为这个项目做出贡献的开发者和用户！

特别感谢：

- [Vue.js](https://vuejs.org/) 团队提供的优秀框架
- [Tailwind CSS](https://tailwindcss.com/) 提供的原子化CSS解决方案
- [Heroicons](https://heroicons.com/) 提供的精美图标
- 所有测试用户提供的宝贵反馈

---

<div align="center">

**如果这个项目对你有帮助，请给我一个⭐Star！**

[回到顶部](#-smart-tab-manager)

</div>
