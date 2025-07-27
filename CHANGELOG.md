# 更新日志

所有重要更改都将记录在此文件中。

本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划功能
- [ ] 多浏览器支持 (Firefox, Edge)
- [ ] 云端同步支持
- [ ] 团队协作功能
- [ ] 更多主题选项

## [1.0.0]

### 🎉 首次发布

#### ✨ 新增功能
- **重复检测系统**
  - 实时检测重复页面
  - 实时监控新标签页
  - 自定义检测规则
  - 白名单管理
- **自动同步恢复功能**
  - 定时自动同步 (可配置间隔)
  - 实时同步重要变更
  - 浏览器关闭前保存
  - 版本化快照存储 (保留20个版本)
  - 智能崩溃检测和恢复
  - 命名快照支持
- **工作空间管理系统**
  - 创建无限数量的工作空间
  - 自定义图标、颜色、名称
  - 一键打开工作空间
  - 智能去重开启
  - 拖拽添加标签页
  - 工作空间活跃度显示
- **极客友好体验**
  - Spotlight风格命令面板 (⌘K)
  - 全键盘快捷键支持
  - 鼠标手势操作
  - 高度可定制设置

#### ⚡ 性能优化
- 内存缓存机制 (5分钟TTL)
- 异步操作处理
- 大批量操作分片处理
- WebWorker复杂计算
- 数据压缩存储

#### 🔧 开发者功能
- 完整TypeScript支持
- Vue 3 Composition API
- Vite热更新开发
- ESLint + Prettier规范
- 单元测试覆盖

### 🛠️ 技术栈
- **前端**: Vue.js 3.4, TypeScript 5.3, Tailwind CSS
- **构建**: Vite, Chrome Extension APIs
- **UI**: Headless UI, Heroicons, Motion One
- **测试**: Vitest, Playwright
- **工具**: ESLint, Prettier, Husky

### 📦 Chrome Extension
- **权限**: tabs, storage, activeTab, contextMenus, background
- **清单**: Manifest V3
- **兼容**: Chrome 88+

### 🌟 初始统计
- **代码行数**: ~3,000 行 TypeScript/Vue
- **组件数量**: 15+ Vue组件
- **工具模块**: 8个核心模块
- **测试覆盖**: 80%+

---

## 版本命名规范

- **主版本号**: 不兼容的API修改
- **次版本号**: 向后兼容的功能新增
- **修订号**: 向后兼容的问题修正

## 贡献指南

查看 [贡献指南](CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

本项目基于 [MIT](LICENSE) 许可证开源。