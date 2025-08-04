<template>
  <div class="options-container" :class="{ 'dark': isDarkMode, 'compact': settings.ui.compactMode }">
    <div class="options-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <h1 class="logo-text">{{ t('options.title') }}</h1>
          <span class="version">v1.0.0</span>
        </div>
        <p class="description">{{ t('options.description') }}</p>
      </div>
    </div>

    <div class="options-content">
      <nav class="sidebar">
        <div class="nav-section">
          <h3>{{ t('options.nav.settings') }}</h3>
          <ul class="nav-list">
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'general' }]"
                @click="activeTab = 'general'"
              >
                <FontAwesomeIcon icon="cog" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.general') }}</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'sync' }]"
                @click="activeTab = 'sync'"
              >
                <FontAwesomeIcon icon="cloud-upload-alt" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.sync') }}</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'duplicates' }]"
                @click="activeTab = 'duplicates'"
              >
                <FontAwesomeIcon icon="copy" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.duplicates') }}</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'shortcuts' }]"
                @click="activeTab = 'shortcuts'"
              >
                <FontAwesomeIcon icon="terminal" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.shortcuts') }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h3>{{ t('options.nav.data') }}</h3>
          <ul class="nav-list">
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'snapshots' }]"
                @click="activeTab = 'snapshots'"
              >
                <FontAwesomeIcon icon="camera" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.snapshots') }}</span>
              </button>
            </li>
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'backup' }]"
                @click="activeTab = 'backup'"
              >
                <FontAwesomeIcon icon="archive" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.backup') }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <h3>{{ t('options.nav.about') }}</h3>
          <ul class="nav-list">
            <li>
              <button 
                :class="['nav-item', { active: activeTab === 'about' }]"
                @click="activeTab = 'about'"
              >
                <FontAwesomeIcon icon="info-circle" class="nav-icon w-4 h-4" />
                <span>{{ t('options.nav.aboutPlugin') }}</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main class="main-content">
        <!-- 常规设置 -->
        <div v-if="activeTab === 'general'" class="settings-panel">
          <h2>{{ t('options.nav.general') }}</h2>
          
          <div class="setting-group">
            <h3>{{ t('options.general.appearance') }}</h3>
            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.general.theme') }}</span>
                <span class="setting-description">{{ t('options.general.themeDesc') }}</span>
              </label>
              <select v-model="settings.ui.theme" class="setting-select">
                <option value="auto">{{ t('options.general.themeAuto') }}</option>
                <option value="light">{{ t('options.general.themeLight') }}</option>
                <option value="dark">{{ t('options.general.themeDark') }}</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.general.language') }}</span>
                <span class="setting-description">{{ t('options.general.languageDesc') }}</span>
              </label>
              <select v-model="settings.ui.language" class="setting-select">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.general.compactMode') }}</span>
                <span class="setting-description">{{ t('options.general.compactModeDesc') }}</span>
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
          <h2>{{ t('options.sync.title') }}</h2>
          
          <div class="setting-group">
            <h3>{{ t('options.sync.autoSync') }}</h3>
            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.sync.autoSync') }}</span>
                <span class="setting-description">{{ t('options.sync.autoSyncDesc') }}</span>
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
                <span>{{ t('options.sync.interval') }}</span>
                <span class="setting-description">{{ t('options.sync.intervalDesc') }}</span>
              </label>
              <select v-model="settings.autoSync.interval" class="setting-select">
                <option :value="60000">{{ t('options.sync.interval1min') }}</option>
                <option :value="300000">{{ t('options.sync.interval5min') }}</option>
                <option :value="600000">{{ t('options.sync.interval10min') }}</option>
                <option :value="1800000">{{ t('options.sync.interval30min') }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 重复检测设置 -->
        <div v-if="activeTab === 'duplicates'" class="settings-panel">
          <h2>{{ t('options.duplicates.title') }}</h2>
          
          <div class="setting-group">
            <h3>{{ t('options.duplicates.enable') }}</h3>
            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.duplicates.enable') }}</span>
                <span class="setting-description">{{ t('options.duplicates.enableDesc') }}</span>
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

          <!-- 检测规则设置 -->
          <div class="setting-group" v-if="settings.duplicateDetection.enabled">
            <h3>{{ t('options.duplicates.rules.title') }}</h3>
            <p class="setting-description">{{ t('options.duplicates.rules.description') }}</p>
            
            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.duplicates.rules.exactMatch') }}</span>
                <span class="setting-description">{{ t('options.duplicates.rules.exactMatchDesc') }}</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.duplicateDetection.rules.exactMatch"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.duplicates.rules.domainMatch') }}</span>
                <span class="setting-description">{{ t('options.duplicates.rules.domainMatchDesc') }}</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.duplicateDetection.rules.domainMatch"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.duplicates.rules.titleMatch') }}</span>
                <span class="setting-description">{{ t('options.duplicates.rules.titleMatchDesc') }}</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.duplicateDetection.rules.titleMatch"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-item">
              <label class="setting-label">
                <span>{{ t('options.duplicates.rules.smartMatch') }}</span>
                <span class="setting-description">{{ t('options.duplicates.rules.smartMatchDesc') }}</span>
              </label>
              <label class="toggle">
                <input 
                  type="checkbox" 
                  v-model="settings.duplicateDetection.rules.smartMatch"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <!-- 相似度阈值设置 -->
            <div class="setting-item" v-if="settings.duplicateDetection.rules.titleMatch || settings.duplicateDetection.rules.smartMatch">
              <label class="setting-label">
                <span>{{ t('options.duplicates.threshold.title') }}</span>
                <span class="setting-description">{{ t('options.duplicates.threshold.description') }}</span>
              </label>
              <div class="threshold-control">
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1" 
                  v-model.number="settings.duplicateDetection.threshold"
                  class="threshold-slider"
                />
                <span class="threshold-value">{{ settings.duplicateDetection.threshold }}</span>
              </div>
            </div>
          </div>

          <div class="setting-group">
            <h3>{{ t('options.duplicates.whitelist') }}</h3>
            <p class="setting-description">{{ t('options.duplicates.whitelistDesc') }}</p>
            <div class="whitelist-container">
              <div class="whitelist-input">
                <input 
                  type="text" 
                  v-model="newWhitelistDomain"
                  :placeholder="t('options.duplicates.whitelistPlaceholder')"
                  class="setting-input"
                  @keydown.enter="addToWhitelist"
                />
                <button @click="addToWhitelist" class="btn-primary">{{ t('common.add') }}</button>
              </div>
              <div class="whitelist-list">
                <div 
                  v-for="domain in settings.duplicateDetection.whitelist" 
                  :key="domain"
                  class="whitelist-item"
                >
                  <span>{{ domain }}</span>
                  <button @click="removeFromWhitelist(domain)" class="btn-remove">
                    <FontAwesomeIcon icon="times" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 快捷键设置 -->
        <div v-if="activeTab === 'shortcuts'" class="settings-panel">
          <h2>{{ t('options.shortcuts.title') }}</h2>
          <p class="panel-description">{{ t('options.shortcuts.description') }}</p>
          
          <div class="shortcuts-list">
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">{{ t('options.shortcuts.commandPalette') }}</span>
                <span class="shortcut-description">{{ t('options.shortcuts.commandPaletteDesc') }}</span>
              </div>
              <kbd class="shortcut-key">⌘K</kbd>
            </div>
            
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">{{ t('options.shortcuts.detectDuplicates') }}</span>
                <span class="shortcut-description">{{ t('options.shortcuts.detectDuplicatesDesc') }}</span>
              </div>
              <kbd class="shortcut-key">⌘D</kbd>
            </div>
            
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">{{ t('options.shortcuts.createSnapshot') }}</span>
                <span class="shortcut-description">{{ t('options.shortcuts.createSnapshotDesc') }}</span>
              </div>
              <kbd class="shortcut-key">⌘S</kbd>
            </div>
            
            <div class="shortcut-item">
              <div class="shortcut-info">
                <span class="shortcut-name">{{ t('options.shortcuts.restoreSession') }}</span>
                <span class="shortcut-description">{{ t('options.shortcuts.restoreSessionDesc') }}</span>
              </div>
              <kbd class="shortcut-key">⌘R</kbd>
            </div>
          </div>
        </div>

        <!-- 快照记录 -->
        <div v-if="activeTab === 'snapshots'" class="settings-panel">
          <h2>{{ t('options.snapshots.title') }}</h2>
          <p class="panel-description">{{ t('options.snapshots.description') }}</p>
          
          <div class="snapshots-container">
            <div class="snapshots-header">
              <div class="snapshots-stats">
                <span class="stat-item">
                  <strong>{{ snapshots.length }}</strong> {{ t('options.snapshots.count') }}
                </span>
                <span class="stat-item" v-if="snapshots.length > 0">
                  {{ t('options.snapshots.latest') }}：{{ formatSnapshotDate(snapshots[0]?.timestamp) }}
                </span>
              </div>
              <button @click="loadSnapshots" class="btn-secondary">
                <FontAwesomeIcon icon="sync" class="w-4 h-4" />
                {{ t('options.snapshots.refresh') }}
              </button>
            </div>

            <div v-if="snapshotsLoading" class="snapshots-loading">
              <span>{{ t('options.snapshots.loading') }}</span>
            </div>

            <div v-else-if="snapshots.length === 0" class="no-snapshots">
              <FontAwesomeIcon icon="camera" class="w-12 h-12 text-gray-300" />
              <h3>{{ t('options.snapshots.noSnapshots.title') }}</h3>
              <p>{{ t('options.snapshots.noSnapshots.description') }}</p>
              <button @click="createSnapshot" class="btn-primary">
                <FontAwesomeIcon icon="camera" class="w-4 h-4" />
                {{ t('options.snapshots.create') }}
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
                    <FontAwesomeIcon icon="camera" class="w-5 h-5" />
                  </div>
                  <div class="snapshot-title">
                    <h4>{{ snapshot.name }}</h4>
                    <span class="snapshot-date">{{ formatSnapshotDate(snapshot.timestamp) }}</span>
                  </div>
                  <div class="snapshot-actions">
                    <button @click="restoreSnapshot(snapshot)" class="btn-restore" :title="t('options.snapshots.tooltips.restore')">
                      <FontAwesomeIcon icon="sync" class="w-4 h-4" />
                    </button>
                    <button @click="deleteSnapshot(snapshot)" class="btn-delete" :title="t('options.snapshots.tooltips.delete')">
                      <FontAwesomeIcon icon="trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div class="snapshot-details">
                  <div class="detail-item">
                    <span class="detail-label">{{ t('options.snapshots.details.tabsCount') }}：</span>
                    <span class="detail-value">{{ snapshot.metadata?.totalTabs || 0 }} {{ t('options.snapshots.tabs') }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t('options.snapshots.details.windowsCount') }}：</span>
                    <span class="detail-value">{{ snapshot.metadata?.totalWindows || 0 }} {{ t('options.snapshots.windows') }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t('options.snapshots.details.type') }}：</span>
                    <span class="detail-value snapshot-type" :class="snapshot.type">
                      {{ snapshot.type === 'manual' ? t('options.snapshots.details.manual') : t('options.snapshots.details.auto') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 备份还原 -->
        <div v-if="activeTab === 'backup'" class="settings-panel">
          <h2>{{ t('options.backup.title') }}</h2>
          
          <div class="backup-section">
            <h3>{{ t('options.backup.export.title') }}</h3>
            <p class="setting-description">{{ t('options.backup.export.description') }}</p>
            <button @click="exportData" class="btn-primary">
              <FontAwesomeIcon icon="download" class="w-4 h-4" />
              {{ t('options.backup.export.button') }}
            </button>
          </div>

          <div class="backup-section">
            <h3>{{ t('options.backup.import.title') }}</h3>
            <p class="setting-description">{{ t('options.backup.import.description') }}</p>
            <input 
              type="file" 
              ref="importInput"
              accept=".json"
              @change="importData"
              style="display: none"
            />
            <button @click="$refs.importInput?.click()" class="btn-secondary">
              <FontAwesomeIcon icon="upload" class="w-4 h-4" />
              {{ t('options.backup.import.button') }}
            </button>
          </div>

          <div class="backup-section danger-zone">
            <h3>{{ t('options.backup.reset.title') }}</h3>
            <p class="setting-description">{{ t('options.backup.reset.description') }}</p>
            <button @click="resetAllData" class="btn-danger">
              <FontAwesomeIcon icon="trash" class="w-4 h-4" />
              {{ t('options.backup.reset.button') }}
            </button>
          </div>
        </div>

        <!-- 关于插件 -->
        <div v-if="activeTab === 'about'" class="settings-panel">
          <h2>{{ t('options.about.pageTitle') }}</h2>
          
          <div class="about-info">
            <div class="about-section">
              <h3>{{ t('options.about.version.title') }}</h3>
              <p><strong>{{ t('options.about.version.version') }}:</strong> {{ t('options.about.values.versionNumber') }}</p>
              <p><strong>{{ t('options.about.version.buildDate') }}:</strong> {{ t('options.about.values.buildDateValue') }}</p>
              <p><strong>{{ t('options.about.version.team') }}:</strong> {{ t('options.about.values.teamName') }}</p>
            </div>

            <div class="about-section">
              <h3>{{ t('options.about.license.title') }}</h3>
              <p>{{ t('options.about.license.description') }}</p>
              <a href="https://github.com/smart-tab-manager/smart-tab-manager" target="_blank" class="external-link">
                {{ t('options.about.license.viewSource') }}
              </a>
            </div>

            <div class="about-section">
              <h3>{{ t('options.about.support.title') }}</h3>
              <p>{{ t('options.about.support.description') }}</p>
              <a href="https://github.com/smart-tab-manager/smart-tab-manager/issues" target="_blank" class="external-link">
                {{ t('options.about.support.reportIssue') }}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 保存提示 -->
    <div v-if="showSaveNotification" class="save-notification">
      <FontAwesomeIcon icon="check-circle" class="w-5 h-5" />
      <span>{{ t('notifications.settingsSaved') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { FontAwesomeIcon } from '@/utils/fontawesome'

import type { Settings } from '@/types'
import { settings as settingsManager } from '@/utils/storage'
import { syncManager } from '@/utils/sync-manager'
import { useI18n } from '@/utils/i18n'

// 多语言支持
const { t, initLanguage } = useI18n()

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
    whitelist: [],
    rules: {
      exactMatch: true,
      domainMatch: true,
      titleMatch: true,
      smartMatch: true
    },
    threshold: 0.8
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
  // 初始化多语言
  await initLanguage()
  
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
watch(settings, async (newSettings, oldSettings) => {
  // 检查重复检测设置是否发生变化
  if (oldSettings && newSettings.duplicateDetection.enabled !== oldSettings.duplicateDetection.enabled) {
    console.log('Duplicate detection enabled changed:', newSettings.duplicateDetection.enabled)
  }
  
  await saveSettings()
  // 实时应用主题变化
  if (newSettings.ui.theme) {
    detectTheme()
  }
  // 实时应用语言变化
  if (newSettings.ui.language !== oldSettings?.ui.language) {
    await initLanguage()
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
    console.log('Saving settings:', {
      duplicateDetection: settings.duplicateDetection
    })
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
    alert(t('options.backup.import.error'))
  }
}

async function resetAllData() {
  if (confirm(t('options.backup.reset.confirm'))) {
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
    alert(t('options.snapshots.messages.createFailed'))
  }
}

async function restoreSnapshot(snapshot: any) {
  if (confirm(t('options.snapshots.messages.restoreConfirm').replace('{name}', snapshot.name))) {
    try {
      await syncManager.restoreSnapshot(snapshot.id)
      alert(t('options.snapshots.messages.restoreSuccess'))
    } catch (error) {
      console.error('Error restoring snapshot:', error)
      alert(t('options.snapshots.messages.restoreFailed'))
    }
  }
}

async function deleteSnapshot(snapshot: any) {
  if (confirm(t('options.snapshots.messages.deleteConfirm').replace('{name}', snapshot.name))) {
    try {
      await syncManager.deleteSnapshot(snapshot.id)
      await loadSnapshots() // 刷新列表
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      alert(t('options.snapshots.messages.deleteFailed'))
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