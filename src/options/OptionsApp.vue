<template>
  <div class="options-container" :class="{ 'dark': isDarkMode, 'compact': settings.ui.compactMode }">
    <div class="options-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <h1 class="logo-text">Smart Tab Manager</h1>
          <span class="version">v1.0.0</span>
        </div>
        <p class="description">现代化的浏览器标签页管理工具</p>
      </div>
    </div>

    <div class="options-content">
      <nav class="sidebar">
        <div class="nav-section">
          <h3>设置</h3>
          <ul class="nav-list">
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'general' }]"
                @click="activeTab = 'general'"
              >
                <CogIcon class="nav-icon w-4 h-4" />
                <span>常规设置</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'sync' }]"
                @click="activeTab = 'sync'"
              >
                <CloudArrowUpIcon class="nav-icon w-4 h-4" />
                <span>同步设置</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'duplicates' }]"
                @click="activeTab = 'duplicates'"
              >
                <DocumentDuplicateIcon class="nav-icon w-4 h-4" />
                <span>重复检测</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'shortcuts' }]"
                @click="activeTab = 'shortcuts'"
              >
                <CommandLineIcon class="nav-icon w-4 h-4" />
                <span>快捷键</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h3>数据</h3>
          <ul class="nav-list">
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'snapshots' }]"
                @click="activeTab = 'snapshots'"
              >
                <CameraIcon class="nav-icon w-4 h-4" />
                <span>快照记录</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'backup' }]"
                @click="activeTab = 'backup'"
              >
                <ArchiveBoxIcon class="nav-icon w-4 h-4" />
                <span>备份还原</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h3>关于</h3>
          <ul class="nav-list">
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'about' }]"
                @click="activeTab = 'about'"
              >
                <InformationCircleIcon class="nav-icon w-4 h-4" />
                <span>关于插件</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main class="main-content">
        <!-- 常规设置 -->
        <div v-if="activeTab === 'general'" class="settings-panel">
          <h2>常规设置</h2>
          
          <div class="setting-group">
            <h3>外观</h3>
            <div class="setting-item">
              <label class="setting-label">
                <span>主题</span>
                <span class="setting-description">选择界面主题</span>
              </label>
              <select v-model="settings.ui.theme" class="setting-select">
                <option value="auto">跟随系统</option>
                <option value="light">浅色模式</option>
                <option value="dark">深色模式</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <span>语言</span>
                <span class="setting-description">界面显示语言</span>
              </label>
              <select v-model="settings.ui.language" class="setting-select">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>紧凑模式</span>
                <span class="setting-description">使用更紧凑的界面布局</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.ui.compactMode"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 同步设置 -->
        <div v-if="activeTab === 'sync'" class="settings-panel">
          <h2>同步设置</h2>
          
          <div class="setting-group">
            <h3>自动同步</h3>
            <div class="setting-item">
              <label class="setting-label">
                <span>启用自动同步</span>
                <span class="setting-description">定期自动保存浏览器状态</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.autoSync.enabled"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item" v-if="settings.autoSync.enabled">
              <label class="setting-label">
                <span>同步间隔</span>
                <span class="setting-description">自动同步的时间间隔</span>
              </label>
              <select v-model="settings.autoSync.interval" class="setting-select">
                <option :value="60000">1分钟</option>
                <option :value="300000">5分钟</option>
                <option :value="600000">10分钟</option>
                <option :value="1800000">30分钟</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 重复检测设置 -->
        <div v-if="activeTab === 'duplicates'" class="settings-panel">
          <h2>重复检测</h2>
          
          <div class="setting-group">
            <h3>检测设置</h3>
            <div class="setting-item">
              <label class="setting-label">
                <span>启用重复检测</span>
                <span class="setting-description">自动检测并提醒重复的标签页</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.duplicateDetection.enabled"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

          </div>

          <div class="setting-group">
            <h3>白名单</h3>
            <p class="setting-description">添加不需要检测重复的网站</p>
            <div class="whitelist-container">
              <div class="whitelist-input">
                <input 
                  type="text" 
                  v-model="newWhitelistDomain"
                  placeholder="输入域名，例如：example.com"
                  class="setting-input"
                  @keydown.enter="addToWhitelist"
                />
                <button @click="addToWhitelist" class="btn-primary">添加</button>
              </div>
              <div class="whitelist-list">
                <div 
                  v-for="domain in settings.duplicateDetection.whitelist" 
                  :key="domain"
                  class="whitelist-item"
                >
                  <span>{{ domain }}</span>
                  <button @click="removeFromWhitelist(domain)" class="btn-remove">
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷键设置 -->
        <div v-if="activeTab === 'shortcuts'" class="settings-panel">
          <h2>快捷键</h2>
          <p class="panel-description">自定义快捷键组合</p>
          
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">打开命令面板</span>
                <span class="shortcut-description">快速访问所有功能</span>
              </div>
              <kbd class="shortcut-key">⌘K</kbd>
            </div>
            
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">检测重复页面</span>
                <span class="shortcut-description">扫描当前所有标签页</span>
              </div>
              <kbd class="shortcut-key">⌘D</kbd>
            </div>
            
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">创建快照</span>
                <span class="shortcut-description">保存当前浏览器状态</span>
              </div>
              <kbd class="shortcut-key">⌘S</kbd>
            </div>
            
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">恢复会话</span>
                <span class="shortcut-description">从历史快照恢复</span>
              </div>
              <kbd class="shortcut-key">⌘R</kbd>
            </div>
          </div>
        </div>

        <!-- 快照记录 -->
        <div v-if="activeTab === 'snapshots'" class="settings-panel">
          <h2>快照记录</h2>
          <p class="panel-description">查看和管理所有保存的会话快照</p>
          
          <div class="snapshots-container">
            <div class="snapshots-header">
              <div class="snapshots-stats">
                <span class="stat-item">
                  <strong>{{ snapshots.length }}</strong> 个快照
                </span>
                <span class="stat-item" v-if="snapshots.length > 0">
                  最新：{{ formatSnapshotDate(snapshots[0]?.timestamp) }}
                </span>
              </div>
              <button @click="loadSnapshots" class="btn-secondary">
                <ArrowPathIcon class="w-4 h-4" />
                刷新
              </button>
            </div>

            <div v-if="snapshotsLoading" class="snapshots-loading">
              <span>加载中...</span>
            </div>

            <div v-else-if="snapshots.length === 0" class="no-snapshots">
              <CameraIcon class="w-12 h-12 text-gray-300" />
              <h3>暂无快照</h3>
              <p>您还没有创建任何会话快照</p>
              <button @click="createSnapshot" class="btn-primary">
                <CameraIcon class="w-4 h-4" />
                创建快照
              </button>
            </div>

            <div v-else class="snapshots-list">
              <div 
                v-for="snapshot in snapshots" 
                :key="snapshot.id"
                class="snapshot-card"
              >
                <div class="snapshot-header">
                  <div class="snapshot-icon">
                    <CameraIcon class="w-5 h-5" />
                  </div>
                  <div class="snapshot-title">
                    <h4>{{ snapshot.name }}</h4>
                    <span class="snapshot-date">{{ formatSnapshotDate(snapshot.timestamp) }}</span>
                  </div>
                  <div class="snapshot-actions">
                    <button @click="restoreSnapshot(snapshot)" class="btn-restore" title="恢复快照">
                      <ArrowPathIcon class="w-4 h-4" />
                    </button>
                    <button @click="deleteSnapshot(snapshot)" class="btn-delete" title="删除快照">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div class="snapshot-details">
                  <div class="detail-item">
                    <span class="detail-label">标签页数量：</span>
                    <span class="detail-value">{{ snapshot.metadata?.totalTabs || 0 }} 个</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">窗口数量：</span>
                    <span class="detail-value">{{ snapshot.metadata?.totalWindows || 0 }} 个</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">类型：</span>
                    <span class="detail-value snapshot-type" :class="snapshot.type">
                      {{ snapshot.type === 'manual' ? '手动创建' : '自动创建' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 备份还原 -->
        <div v-if="activeTab === 'backup'" class="settings-panel">
          <h2>备份还原</h2>
          
          <div class="backup-section">
            <h3>导出数据</h3>
            <p class="setting-description">导出所有设置、工作空间和快照数据</p>
            <button @click="exportData" class="btn-primary">
              <ArrowDownTrayIcon class="w-4 h-4" />
              导出数据
            </button>
          </div>

          <div class="backup-section">
            <h3>导入数据</h3>
            <p class="setting-description">从备份文件恢复数据</p>
            <input 
              type="file" 
              ref="importInput"
              accept=".json"
              @change="importData"
              style="display: none"
            />
            <button @click="$refs.importInput?.click()" class="btn-secondary">
              <ArrowUpTrayIcon class="w-4 h-4" />
              选择文件
            </button>
          </div>

          <div class="backup-section danger-zone">
            <h3>重置数据</h3>
            <p class="setting-description">清除所有数据并恢复默认设置</p>
            <button @click="resetAllData" class="btn-danger">
              <TrashIcon class="w-4 h-4" />
              重置所有数据
            </button>
          </div>
        </div>

        <!-- 关于插件 -->
        <div v-if="activeTab === 'about'" class="settings-panel">
          <h2>关于 Smart Tab Manager</h2>
          
          <div class="about-info">
            <div class="about-section">
              <h3>版本信息</h3>
              <p><strong>版本:</strong> 1.0.0</p>
              <p><strong>构建日期:</strong> 2024年1月20日</p>
              <p><strong>开发团队:</strong> Smart Tab Manager Team</p>
            </div>

            <div class="about-section">
              <h3>开源协议</h3>
              <p>本项目基于 MIT 协议开源</p>
              <a href="https://github.com/smart-tab-manager/smart-tab-manager" target="_blank" class="external-link">
                查看源码
              </a>
            </div>

            <div class="about-section">
              <h3>反馈与支持</h3>
              <p>如果您遇到问题或有功能建议，请访问我们的 GitHub 项目页面</p>
              <a href="https://github.com/smart-tab-manager/smart-tab-manager/issues" target="_blank" class="external-link">
                报告问题
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 保存提示 -->
    <div v-if="showSaveNotification" class="save-notification">
      <CheckCircleIcon class="w-5 h-5" />
      <span>设置已保存</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import {
  CogIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  CommandLineIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  TrashIcon,
  CheckCircleIcon,
  CameraIcon
} from '@heroicons/vue/24/outline'

import type { Settings } from '@/types'
import { settings as settingsManager } from '@/utils/storage'
import { syncManager } from '@/utils/sync-manager'

// 响应式数据
const activeTab = ref('general')
const isDarkMode = ref(false)
const showSaveNotification = ref(false)
const newWhitelistDomain = ref('')

// 快照管理
const snapshots = ref<any[]>([])
const snapshotsLoading = ref(false)

const settings = reactive<Settings>({
  autoSync: {
    enabled: true,
    interval: 300000
  },
  duplicateDetection: {
    enabled: true,
    whitelist: []
  },
  ui: {
    theme: 'auto',
    language: 'zh-CN',
    compactMode: false
  },
  workspaces: {
    showActivityIndicator: true,
    autoSwitchOnTime: false,
    maxRecentWorkspaces: 5
  },
  shortcuts: {}
})

// 组件挂载
onMounted(async () => {
  await loadSettings()
  detectTheme()
  
  // 如果当前在快照页面，加载快照数据
  if (activeTab.value === 'snapshots') {
    await loadSnapshots()
  }
})

// 监听tab切换，加载快照数据
watch(activeTab, async (newTab) => {
  if (newTab === 'snapshots' && snapshots.value.length === 0) {
    await loadSnapshots()
  }
})

// 监听设置变化
watch(settings, async (newSettings) => {
  await saveSettings()
  // 实时应用主题变化
  if (newSettings.ui.theme) {
    detectTheme()
  }
}, { deep: true })

// 监听主题变化
watch(() => settings.ui.theme, (newTheme) => {
  detectTheme()
})

// 加载设置
async function loadSettings() {
  try {
    const userSettings = await settingsManager.getSettings()
    Object.assign(settings, userSettings)
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

// 保存设置
async function saveSettings() {
  try {
    await settingsManager.updateSettings(settings)
    showSaveNotification.value = true
    setTimeout(() => {
      showSaveNotification.value = false
    }, 2000)
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

// 检测主题
function detectTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  function updateTheme() {
    switch (settings.ui.theme) {
      case 'dark':
        isDarkMode.value = true
        break
      case 'light':
        isDarkMode.value = false
        break
      case 'auto':
      default:
        isDarkMode.value = mediaQuery.matches
        break
    }
    
    // 应用到文档根元素
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  // 立即应用
  updateTheme()
  
  // 监听系统主题变化（仅在auto模式下有效）
  mediaQuery.removeEventListener('change', updateTheme) // 防止重复监听
  mediaQuery.addEventListener('change', updateTheme)
}

// 白名单管理
function addToWhitelist() {
  const domain = newWhitelistDomain.value.trim()
  if (domain && !settings.duplicateDetection.whitelist.includes(domain)) {
    settings.duplicateDetection.whitelist.push(domain)
    newWhitelistDomain.value = ''
  }
}

function removeFromWhitelist(domain: string) {
  const index = settings.duplicateDetection.whitelist.indexOf(domain)
  if (index > -1) {
    settings.duplicateDetection.whitelist.splice(index, 1)
  }
}

// 数据导入导出
async function exportData() {
  try {
    // 这里应该收集所有需要导出的数据
    const exportData = {
      settings,
      timestamp: Date.now(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `smart-tab-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting data:', error)
  }
}

async function importData(event: Event) {
  try {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const text = await file.text()
    const importData = JSON.parse(text)
    
    if (importData.settings) {
      Object.assign(settings, importData.settings)
      await saveSettings()
    }
  } catch (error) {
    console.error('Error importing data:', error)
    alert('导入失败，请检查文件格式')
  }
}

async function resetAllData() {
  if (confirm('确定要重置所有数据吗？此操作不可撤销。')) {
    try {
      await settingsManager.resetSettings()
      await loadSettings()
    } catch (error) {
      console.error('Error resetting data:', error)
    }
  }
}

// 快照管理方法
async function loadSnapshots() {
  try {
    snapshotsLoading.value = true
    const snapshotList = await syncManager.getSnapshotList()
    snapshots.value = snapshotList
  } catch (error) {
    console.error('Error loading snapshots:', error)
    snapshots.value = []
  } finally {
    snapshotsLoading.value = false
  }
}

async function createSnapshot() {
  try {
    const snapshot = await syncManager.createSnapshot('manual', `手动快照_${new Date().toLocaleString()}`)
    if (snapshot) {
      await loadSnapshots() // 刷新列表
      showSaveNotification.value = true
      setTimeout(() => {
        showSaveNotification.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('Error creating snapshot:', error)
    alert('创建快照失败')
  }
}

async function restoreSnapshot(snapshot: any) {
  if (confirm(`确定要恢复快照 "${snapshot.name}" 吗？这将关闭当前所有标签页并打开快照中的标签页。`)) {
    try {
      await syncManager.restoreSnapshot(snapshot.id)
      alert('快照恢复成功')
    } catch (error) {
      console.error('Error restoring snapshot:', error)
      alert('恢复快照失败')
    }
  }
}

async function deleteSnapshot(snapshot: any) {
  if (confirm(`确定要删除快照 "${snapshot.name}" 吗？此操作不可撤销。`)) {
    try {
      await syncManager.deleteSnapshot(snapshot.id)
      await loadSnapshots() // 刷新列表
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      alert('删除快照失败')
    }
  }
}

function formatSnapshotDate(timestamp: number) {
  // 验证时间戳
  if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp) || timestamp <= 0) {
    return '未知时间'
  }
  
  const date = new Date(timestamp)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '无效日期'
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const snapshotDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (snapshotDate.getTime() === today.getTime()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else if (snapshotDate.getTime() === today.getTime() - 86400000) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
}
</script>

<style scoped>
.options-container {
  min-height: 100vh;
  background: #f9fafb;
  color: #111827;
}

.dark .options-container {
  background: #111827;
  color: #f9fafb;
}

.options-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 2rem 0;
}

.dark .options-header {
  background: #1f2937;
  border-bottom-color: #374151;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.version {
  padding: 2px 8px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.dark .version {
  background: #374151;
}

.description {
  color: #6b7280;
  margin: 0;
}

.options-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.sidebar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .sidebar {
  background: #1f2937;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section:last-child {
  margin-bottom: 0;
}

.nav-section h3 {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  color: #6b7280;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-item.active {
  background: #007aff;
  color: white;
}

.dark .nav-item:hover {
  background: #374151;
  color: #d1d5db;
}

.nav-icon {
  flex-shrink: 0;
}

.main-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark .main-content {
  background: #1f2937;
}

.settings-panel h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.panel-description {
  color: #6b7280;
  margin-bottom: 2rem;
}

.setting-group {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .setting-group {
  border-bottom-color: #374151;
}

.setting-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.setting-group h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.dark .setting-item {
  border-bottom-color: #374151;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label span:first-child {
  font-weight: 500;
}

.setting-description {
  font-size: 14px;
  color: #6b7280;
}

.setting-select,
.setting-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.dark .setting-select,
.dark .setting-input {
  background: #374151;
  border-color: #4b5563;
  color: white;
}

.setting-range {
  width: 200px;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #007aff;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* 白名单样式 */
.whitelist-container {
  margin-top: 1rem;
}

.whitelist-input {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.whitelist-input .setting-input {
  flex: 1;
  min-width: 0;
}

.whitelist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.whitelist-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.dark .whitelist-item {
  background: #374151;
}

/* 按钮样式 */
.btn-primary,
.btn-secondary,
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007aff;
  color: white;
}

.btn-primary:hover {
  background: #0056cc;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ff3b30;
  color: white;
}

.btn-danger:hover {
  background: #d70015;
}

.btn-remove {
  padding: 4px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
}

.btn-remove:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

/* 快捷键样式 */
.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.dark .shortcut-item {
  background: #374151;
}

.shortcut-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shortcut-name {
  font-weight: 500;
}

.shortcut-description {
  font-size: 14px;
  color: #6b7280;
}

.shortcut-key {
  padding: 4px 8px;
  background: #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.dark .shortcut-key {
  background: #4b5563;
}

/* 备份样式 */
.backup-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.dark .backup-section {
  background: #374151;
}

.backup-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.danger-zone {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.dark .danger-zone {
  background: #372322;
  border-color: #7f1d1d;
}

/* 关于样式 */
.about-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.about-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.about-section p {
  margin: 4px 0;
  color: #6b7280;
}

.external-link {
  color: #007aff;
  text-decoration: none;
}

.external-link:hover {
  text-decoration: underline;
}

/* 保存通知 */
.save-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 紧凑模式样式 */
.compact .options-header {
  padding: 1rem 0;
}

.compact .options-content {
  padding: 1rem;
  gap: 1rem;
}

.compact .sidebar {
  padding: 1rem;
}

.compact .main-content {
  padding: 1.5rem;
}

.compact .setting-item {
  padding: 0.75rem 0;
}

.compact .setting-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
}

.compact .backup-section {
  padding: 1rem;
  margin-bottom: 1.5rem;
}

/* 快照记录样式 */
.snapshots-container {
  margin-top: 1rem;
}

.snapshots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .snapshots-header {
  border-bottom-color: #374151;
}

.snapshots-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  font-size: 14px;
  color: #6b7280;
}

.stat-item strong {
  color: #111827;
  font-weight: 600;
}

.dark .stat-item strong {
  color: #f9fafb;
}

.snapshots-loading {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

.no-snapshots {
  text-align: center;
  padding: 3rem 0;
}

.no-snapshots .w-12 {
  margin: 0 auto 1rem;
}

.no-snapshots h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.dark .no-snapshots h3 {
  color: #f9fafb;
}

.no-snapshots p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.snapshots-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.snapshot-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.snapshot-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark .snapshot-card {
  background: #374151;
  border-color: #4b5563;
}

.dark .snapshot-card:hover {
  border-color: #6b7280;
}

.snapshot-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.snapshot-icon {
  width: 2rem;
  height: 2rem;
  background: #007aff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.snapshot-title {
  flex: 1;
  min-width: 0;
}

.snapshot-title h4 {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .snapshot-title h4 {
  color: #f9fafb;
}

.snapshot-date {
  font-size: 12px;
  color: #007aff;
  font-weight: 500;
}

.snapshot-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.btn-restore,
.btn-delete {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-restore {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.btn-restore:hover {
  background: rgba(52, 199, 89, 0.2);
}

.btn-delete {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.btn-delete:hover {
  background: rgba(255, 59, 48, 0.2);
}

.snapshot-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: #111827;
  font-weight: 500;
}

.dark .detail-value {
  color: #f9fafb;
}

.snapshot-type.manual {
  color: #007aff;
}

.snapshot-type.auto {
  color: #34c759;
}
</style>