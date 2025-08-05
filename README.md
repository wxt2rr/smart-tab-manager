# ⚡ Smart Tab Manager

<!-- Language Navigation -->
<div align="center">

**🌍 Language / 语言**

[English](./README.md) | [简体中文](./README_CN.md)

</div>

> A browser tab management extension that solves your habit of constantly opening duplicate tabs!

<div align="center">

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/wxt2rr/smart-tab-manager)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/vue.js-3.4.0-4FC08D.svg)](https://vuejs.org/)
[![Chrome Extension](https://img.shields.io/badge/chrome-extension-brightgreen.svg)](https://developer.chrome.com/docs/extensions/)

[Features](#features) • [Installation](#installation) • [Development](#development) • [Contributing](#contributing) • [License](#license)

</div>

---

## 🌟 Features

### 🔍 Smart Duplicate Detection

- **Real-time Monitoring**: Instantly detect duplicates when new tabs are opened
- **Custom Rules**: Support user-defined duplicate detection criteria
- **One-click Cleanup**: Batch close duplicate pages to free up system resources

### 💾 Auto Sync & Restore

- **Multi-layer Sync Strategy**: Scheduled sync + Real-time sync + Pre-close sync
- **Versioned Storage**: Keep 20 historical versions, support point-in-time recovery
- **Smart Recovery**: Auto-detect and provide recovery options after browser crashes
- **Manual Snapshots**: Create named snapshots to permanently save important states

### 🗂️ Workspace Management

- **Scenario-based Grouping**: Create dedicated workspaces for different work scenarios
- **One-click Switching**: Quickly switch between different work modes
- **Smart Deduplication**: Automatically handle duplicate pages when opening workspaces
- **Drag & Drop**: Intuitive drag-and-drop adding and sorting functionality

### ⚡ Developer Friendly

- **Command Palette**: Spotlight-style quick action panel (⌘K)
- **Full Keyboard Operation**: Support complete keyboard shortcut operations
- **Gesture Support**: Rich mouse gestures and touch operations
- **Highly Customizable**: Detailed personalization settings

---

## 📸 Screenshots

<div align="center">

### Main Interface

![Main Interface](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/home.png)

![Command Palette](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/home-2.png)

![Command Palette](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/restore.png)

### Settings Pages

![Workspace](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/config.png)

![Restore Interface](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/sync.png)

![Restore Interface](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/dup.png)

![Restore Interface](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/shot.png)

![Restore Interface](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/snap.png)

![Restore Interface](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/back.png)

### Duplicate Detection Alert

![Workspace](https://github.com/wxt2rr/smart-tab-manager/blob/main/doc-images/en/tonst.png)

</div>

---

## 🚀 Installation

### Development Version Installation

1. **Download Source Code**

```bash
git clone https://github.com/wxt2rr/smart-tab-manager.git
cd smart-tab-manager
```

2. **Install Dependencies & Build**

```bash
npm install
npm run build
```

3. **Load into Chrome**

- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked extension"
- Select the `dist` folder from the project

---

## 📖 User Guide

### Quick Start

1. **First Use**: After installation, click the toolbar icon to open the main interface
2. **Duplicate Detection**: The extension will automatically detect duplicate pages and show the count on the icon
3. **Create Workspace**: Click "New Workspace" to start organizing your tabs
4. **Command Palette**: Press `⌘K` (Mac) or `Ctrl+K` (Windows) to open the quick action panel

### Core Operations

#### 🔍 Duplicate Page Management

- **Auto Detection**: New tabs are automatically checked for duplicates
- **Batch Cleanup**: Click the "Cleanup" button in the main interface or use `⌘D` shortcut
- **Whitelist Settings**: Add websites that don't need detection in settings

#### 🗂️ Workspace Operations

```
Create Workspace: Click "+ New Workspace"
Add Tabs: Right-click tab → "Add to Workspace"
Open Workspace: Click the play button on workspace card
Quick Switch: Use ⌘1-9 shortcuts
```

#### 💾 Session Management

```
Create Snapshot: ⌘S or click "Snapshot" button
Restore Session: ⌘R or choose restore option at startup
View History: Click "Restore" button to view all snapshots
```

### Keyboard Shortcuts

| Shortcut            | Function           |
| ------------------- | ------------------ |
| `⌘K` / `Ctrl+K`     | Open Command Palette |
| `⌘D` / `Ctrl+D`     | Detect Duplicates    |
| `⌘S` / `Ctrl+S`     | Create Snapshot      |
| `⌘R` / `Ctrl+R`     | Restore Session      |
| `⌘1-9` / `Ctrl+1-9` | Switch Workspaces    |
| `Space`             | Preview Mode         |
| `Enter`             | Execute Action       |
| `Esc`               | Cancel/Close         |

---

## 🛠️ Development

### Tech Stack

- **Frontend Framework**: Vue.js 3.4 + Composition API
- **Build Tools**: Vite + TypeScript
- **UI Components**: Headless UI + Tailwind CSS
- **Animation Library**: Motion One (Apple-style animations)
- **Development Tools**: ESLint + Prettier + Vitest

### Project Structure

```
smart-tab-manager/
├── src/
│   ├── background/          # Background scripts
│   ├── content/            # Content scripts
│   ├── popup/              # Popup interface
│   ├── options/            # Settings page
│   ├── components/         # Vue components
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   └── styles/             # Style files
├── public/                 # Static assets
├── docs/                   # Documentation
└── tests/                  # Test files
```

### Development Environment Setup

1. **Clone Repository**

```bash
git clone https://github.com/wxt2rr/smart-tab-manager.git
cd smart-tab-manager
```

2. **Install Dependencies**

```bash
npm install
npm run build
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
npm run type-check   # TypeScript type checking
```

---

## 🤝 Contributing

We welcome all forms of contributions! Whether it's bug reports, feature suggestions, or code contributions.

### Contribution Process

1. **Fork the project** to your GitHub account
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Create a Pull Request**

### Development Standards

- **Code Style**: Use ESLint + Prettier to maintain code consistency
- **Commit Messages**: Follow [Conventional Commits](https://conventionalcommits.org/) specification
- **Test Coverage**: New features should include corresponding tests
- **Documentation Updates**: Important features need README and API documentation updates

### Commit Message Format

```
feat: add new feature
fix: bug fix
docs: documentation update
style: code formatting adjustment
refactor: code refactoring
test: add tests
chore: build tools or auxiliary tools changes
```

---

## 🐞 Issue Reporting

### Bug Reports

If you find a bug, please create an [Issue](https://github.com/wxt2rr/smart-tab-manager/issues) and include:

- **Problem Description**: Clear description of the issue encountered
- **Reproduction Steps**: Detailed steps to reproduce
- **Expected Result**: The correct behavior you expected
- **Actual Result**: What actually happened
- **Environment Info**: Browser version, operating system, etc.
- **Screenshots/Logs**: If possible, provide relevant screenshots or error logs

### Feature Requests

We also welcome feature suggestions! Please create a [Feature Request](https://github.com/wxt2rr/smart-tab-manager/issues/new?template=feature_request.md) and describe:

- **Feature Description**: Detailed description of the suggested feature
- **Use Case**: When would this feature be used
- **Expected Behavior**: How the feature should work
- **Alternative Solutions**: Have you considered other solutions

---

## 📚 Resources

### Community

- [GitHub Discussions](https://github.com/wxt2rr/smart-tab-manager/discussions) - Discussions and Q&A
- [Issues](https://github.com/wxt2rr/smart-tab-manager/issues) - Bug reports and feature requests

### Related Projects

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Vue.js 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version update history.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌟 Acknowledgments

Thanks to all developers and users who contributed to this project!

Special thanks to:

- [Vue.js](https://vuejs.org/) team for the excellent framework
- [Tailwind CSS](https://tailwindcss.com/) for the atomic CSS solution
- [FontAwesome](https://fontawesome.com/) for the beautiful icons
- All beta testers for their valuable feedback

---

<div align="center">

**If this project helps you, please give me a ⭐Star!**

[Back to Top](#-smart-tab-manager)

</div> 