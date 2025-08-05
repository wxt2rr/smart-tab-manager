<template>
  <div class="command-palette-overlay" @click="handleOverlayClick">
    <div class="command-palette" @click.stop>
      <div class="command-search">
        <MagnifyingGlassIcon class="search-icon w-5 h-5" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="isI18nReady ? t('commandPalette.placeholder') : '搜索或输入命令...'"
          class="search-input"
          @keydown="handleKeydown"
        />
      </div>

      <div class="command-sections" v-if="filteredSuggestions.length > 0">
        <div
          v-for="(section, sectionIndex) in groupedSuggestions"
          :key="section.category"
          class="command-section"
        >
          <div class="section-header">
            <FontAwesomeIcon :icon="section.icon" class="w-4 h-4" />
            <span>{{ section.title }}</span>
          </div>
          <div class="command-list">
            <div
              v-for="(suggestion, index) in section.items"
              :key="suggestion.id"
              :class="[
                'command-item',
                { 'active': isActive(sectionIndex, index) }
              ]"
              @click="executeSuggestion(suggestion)"
              @mouseenter="setActiveIndex(sectionIndex, index)"
            >
              <div class="command-content">
                <FontAwesomeIcon :icon="suggestion.icon" class="command-icon w-4 h-4" />
                <div class="command-info">
                  <span class="command-title">{{ suggestion.title }}</span>
                  <span v-if="suggestion.description" class="command-description">
                    {{ suggestion.description }}
                  </span>
                </div>
              </div>
              <kbd v-if="suggestion.shortcut" class="command-shortcut">
                {{ suggestion.shortcut }}
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="searchQuery && filteredSuggestions.length === 0" class="no-results">
        <FontAwesomeIcon icon="exclamation-circle" class="w-6 h-6 text-gray-400" />
        <p>{{ isI18nReady ? t('commandPalette.noResults') : '未找到匹配的命令' }}</p>
        <p class="text-sm text-gray-500">{{ isI18nReady ? t('commandPalette.noResultsHint') : '尝试使用不同的关键词' }}</p>
      </div>

      <div v-else class="command-help">
        <div class="help-section">
          <span class="help-category">{{ isI18nReady ? t('commandPalette.help.quickActions') : '快速操作' }}</span>
          <div class="help-items">
            <div class="help-item">
              <kbd>⌘</kbd><kbd>D</kbd>
              <span>{{ isI18nReady ? t('commandPalette.help.detectDuplicates') : '检测重复页面' }}</span>
            </div>
            <div class="help-item">
              <kbd>⌘</kbd><kbd>S</kbd>
              <span>{{ isI18nReady ? t('commandPalette.help.createSnapshot') : '创建快照' }}</span>
            </div>
            <div class="help-item">
              <kbd>⌘</kbd><kbd>R</kbd>
              <span>{{ isI18nReady ? t('commandPalette.help.restoreSession') : '恢复会话' }}</span>
            </div>
          </div>
        </div>
        <div class="help-section">
          <span class="help-category">{{ isI18nReady ? t('commandPalette.help.navigation') : '导航' }}</span>
          <div class="help-items">
            <div class="help-item">
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>{{ isI18nReady ? t('commandPalette.help.upDown') : '上下选择' }}</span>
            </div>
            <div class="help-item">
              <kbd>Enter</kbd>
              <span>{{ isI18nReady ? t('commandPalette.help.execute') : '执行命令' }}</span>
            </div>
            <div class="help-item">
              <kbd>Esc</kbd>
              <span>{{ isI18nReady ? t('commandPalette.help.close') : '关闭面板' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { FontAwesomeIcon } from '@/utils/fontawesome'
import { useI18n } from '@/utils/i18n'

import type { SearchSuggestion } from '@/types'
import { workspaceManager } from '@/utils/workspace-manager'
import { syncManager } from '@/utils/sync-manager'
import { duplicateDetector } from '@/utils/duplicate-detector'

// 多语言支持
const { t, initLanguage } = useI18n()
const isI18nReady = ref(false)

// Props & Emits
const emit = defineEmits<{
  close: []
  execute: [command: any]
}>()

// 响应式数据
const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const activeIndex = ref({ section: 0, item: 0 })

// 监听搜索查询变化，实时重新加载标签页建议
watch(searchQuery, async (newQuery, oldQuery) => {
  // 如果搜索查询长度大于等于2，重新加载动态建议以获取更多匹配的标签页
  if (newQuery.length >= 2 && newQuery !== oldQuery) {
    await loadDynamicSuggestions()
  }
}, { debounce: 300 }) // 防抖300ms避免过于频繁的更新

// 建议列表
const suggestions = computed(() => {
  if (!isI18nReady.value) return [] // 等待i18n初始化
  
  return [
    // 工作空间相关
    {
      id: 'create-workspace',
      type: 'command',
      title: t('commandPalette.commands.createWorkspace'),
      description: t('commandPalette.commands.createWorkspaceDesc'),
      icon: 'plus',
      category: 'workspace',
      action: async () => {
        const workspaceCount = workspaceManager.getAllWorkspaces().length + 1
        const workspace = await workspaceManager.createWorkspace({
          name: `${isI18nReady.value ? t('popup.workspaces.newWorkspace') : '工作空间'} ${workspaceCount}`,
          icon: '📁',
          color: '#007AFF',
          tabs: []
        })
        emit('execute', { type: 'workspace-created', data: workspace })
      }
    },
    {
      id: 'open-workspace',
      type: 'command',
      title: t('commandPalette.commands.openWorkspace'),
      description: t('commandPalette.commands.openWorkspaceDesc'),
      icon: 'folder',
      category: 'workspace',
      action: () => {
        // 显示工作空间选择器
        emit('execute', { type: 'show-workspace-selector' })
      }
    },
    
    // 标签页相关
    {
      id: 'search-tabs',
      type: 'command',
      title: t('commandPalette.commands.searchTabs'),
      description: t('commandPalette.commands.searchTabsDesc'),
      icon: 'search',
      category: 'tab',
      action: () => {
        // 清空搜索并聚焦，提示用户开始搜索标签页
        searchQuery.value = ''
        searchInput.value?.focus()
        emit('execute', { type: 'search-tabs-mode' })
      }
    },
    {
      id: 'detect-duplicates',
      type: 'command',
      title: t('commandPalette.commands.detectDuplicates'),
      description: t('commandPalette.commands.detectDuplicatesDesc'),
      icon: 'copy',
      category: 'tab',
      shortcut: '⌘D',
      action: async () => {
        const duplicates = await duplicateDetector.detectAllDuplicates()
        emit('execute', { type: 'duplicates-detected', data: duplicates })
      }
    },
    {
      id: 'clean-duplicates',
      type: 'command',
      title: t('commandPalette.commands.cleanDuplicates'),
      description: t('commandPalette.commands.cleanDuplicatesDesc'),
      icon: 'trash',
      category: 'tab',
      action: async () => {
        const duplicates = await duplicateDetector.detectAllDuplicates()
        emit('execute', { type: 'clean-duplicates', data: duplicates })
      }
    },
    
    // 会话相关
    {
      id: 'create-snapshot',
      type: 'command',
      title: t('commandPalette.commands.createSnapshot'),
      description: t('commandPalette.commands.createSnapshotDesc'),
      icon: 'camera',
      category: 'session',
      shortcut: '⌘S',
      action: async () => {
        const snapshot = await syncManager.createSnapshot('manual')
        emit('execute', { type: 'snapshot-created', data: snapshot })
      }
    },
    {
      id: 'restore-session',
      type: 'command',
      title: t('commandPalette.commands.restoreSession'),
      description: t('commandPalette.commands.restoreSessionDesc'),
      icon: 'sync',
      category: 'session',
      shortcut: '⌘R',
      action: () => {
        emit('execute', { type: 'show-restore-dialog' })
      }
    },
    {
      id: 'sync-now',
      type: 'command',
      title: t('commandPalette.commands.syncNow'),
      description: t('commandPalette.commands.syncNowDesc'),
      icon: 'cloud-upload-alt',
      category: 'session',
      action: async () => {
        const snapshot = await syncManager.createSnapshot('auto')
        emit('execute', { type: 'sync-completed', data: snapshot })
      }
    },
    
    // 设置相关
    {
      id: 'open-settings',
      type: 'command',
      title: t('commandPalette.commands.openSettings'),
      description: t('commandPalette.commands.openSettingsDesc'),
      icon: 'cog',
      category: 'settings',
      action: () => {
        chrome.runtime.openOptionsPage()
        emit('execute', { type: 'settings-opened' })
      }
    }
  ]
})

// 动态建议列表
const dynamicSuggestions = ref<SearchSuggestion[]>([])

// 计算属性
const allSuggestions = computed(() => {
  return [...suggestions.value, ...dynamicSuggestions.value]
})

const filteredSuggestions = computed(() => {
  if (!searchQuery.value) {
    return allSuggestions.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return allSuggestions.value.filter(suggestion => {
    // 基础匹配：标题和描述
    const titleMatch = suggestion.title.toLowerCase().includes(query)
    const descriptionMatch = suggestion.description?.toLowerCase().includes(query)
    
    // 增强匹配：搜索关键词（包含URL、域名等）
    const keywordsMatch = suggestion.searchKeywords?.toLowerCase().includes(query)
    
    // 模糊匹配：支持部分关键词匹配
    const fuzzyMatch = query.split(' ').some(word => 
      word.length > 2 && (
        suggestion.title.toLowerCase().includes(word) ||
        suggestion.description?.toLowerCase().includes(word) ||
        suggestion.searchKeywords?.toLowerCase().includes(word)
      )
    )
    
    return titleMatch || descriptionMatch || keywordsMatch || fuzzyMatch
  })
})

const groupedSuggestions = computed(() => {
  const groups = filteredSuggestions.value.reduce((acc, suggestion) => {
    const category = suggestion.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(suggestion)
    return acc
  }, {} as Record<string, SearchSuggestion[]>)

  const categoryInfo = {
    workspace: { 
      title: isI18nReady.value ? t('commandPalette.categories.workspace') : '工作空间', 
      icon: 'folder' 
    },
    tab: { 
      title: isI18nReady.value ? t('commandPalette.categories.tab') : '标签页', 
      icon: 'copy' 
    },
    session: { 
      title: isI18nReady.value ? t('commandPalette.categories.session') : '会话', 
      icon: 'camera' 
    },
    settings: { 
      title: isI18nReady.value ? t('commandPalette.categories.settings') : '设置', 
      icon: 'cog' 
    }
  }

  return Object.entries(groups).map(([category, items], sectionIndex) => ({
    category,
    title: categoryInfo[category as keyof typeof categoryInfo]?.title || category,
    icon: categoryInfo[category as keyof typeof categoryInfo]?.icon || 'bolt',
    items,
    sectionIndex
  }))
})

// 组件挂载
onMounted(async () => {
  // 初始化多语言
  await initLanguage()
  isI18nReady.value = true
  
  await nextTick()
  searchInput.value?.focus()
  
  // 动态加载更多建议
  await loadDynamicSuggestions()
})

// 加载动态建议
async function loadDynamicSuggestions() {
  if (!isI18nReady.value) return
  
  try {
    const newSuggestions: SearchSuggestion[] = []
    
    // 加载工作空间建议
    const workspaces = workspaceManager.getAllWorkspaces()
    workspaces.forEach(workspace => {
      newSuggestions.push({
        id: `open-workspace-${workspace.id}`,
        type: 'workspace',
        title: t('commandPalette.dynamic.openWorkspace').replace('{name}', workspace.name),
        description: t('commandPalette.dynamic.tabCount').replace('{count}', workspace.tabs.length.toString()),
        icon: 'folder',
        category: 'workspace',
        action: async () => {
          await workspaceManager.openWorkspace(workspace.id)
          emit('execute', { type: 'workspace-opened', data: workspace })
        }
      })
    })

    // 加载所有标签页建议（增强版）
    const tabs = await chrome.tabs.query({})
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTabId = currentTab[0]?.id
    
    // 按活跃度和相关性排序标签页
    const sortedTabs = tabs
      .filter(tab => tab.url && tab.title && tab.id !== currentTabId) // 排除当前标签页
      .sort((a, b) => {
        // 优先显示最近活跃的标签页
        if (a.active && !b.active) return -1
        if (!a.active && b.active) return 1
        // 然后按照固定状态排序
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        // 最后按照ID排序（近似按打开时间）
        return (b.id || 0) - (a.id || 0)
      })
    
    // 加载更多标签页建议（最多20个，或根据搜索查询动态调整）
    const maxTabs = searchQuery.value ? 50 : 15 // 搜索时显示更多结果
    sortedTabs.slice(0, maxTabs).forEach(tab => {
      if (tab.url && tab.title) {
        try {
          const url = new URL(tab.url)
          const domain = url.hostname
          
          // 增强的描述信息
          let description = domain
          if (tab.pinned) {
            description = `📌 ${description}`
          }
          if (tab.url.startsWith('https://')) {
            description = `🔒 ${description}`
          }
          
          newSuggestions.push({
            id: `switch-to-tab-${tab.id}`,
            type: 'tab',
            title: t('commandPalette.dynamic.switchToTab').replace('{title}', tab.title),
            description: description,
            icon: 'copy',
            category: 'tab',
            // 添加搜索关键词以提高搜索匹配度
            searchKeywords: [tab.title, domain, tab.url].join(' '),
            action: async () => {
              await chrome.tabs.update(tab.id!, { active: true })
              // 如果标签页在另一个窗口，也切换到该窗口
              if (tab.windowId) {
                await chrome.windows.update(tab.windowId, { focused: true })
              }
              emit('execute', { type: 'tab-switched', data: tab })
            }
          })
        } catch (error) {
          console.error('Error processing tab URL:', tab.url, error)
        }
      }
    })

    // 加载历史快照建议
    const snapshots = await syncManager.getSnapshotList()
    snapshots.slice(0, 3).forEach(snapshot => {
      newSuggestions.push({
        id: `restore-snapshot-${snapshot.id}`,
        type: 'history',
        title: t('commandPalette.dynamic.restoreSnapshot').replace('{name}', snapshot.name),
        description: t('commandPalette.dynamic.tabCount').replace('{count}', snapshot.metadata?.totalTabs?.toString() || '0'),
        icon: 'sync',
        category: 'session',
        action: async () => {
          await syncManager.restoreSnapshot(snapshot.id)
          emit('execute', { type: 'snapshot-restored', data: snapshot })
        }
      })
    })
    
    dynamicSuggestions.value = newSuggestions
  } catch (error) {
    console.error('Error loading dynamic suggestions:', error)
  }
}

// 事件处理
function handleOverlayClick() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
      emit('close')
      break
    case 'ArrowUp':
      event.preventDefault()
      navigateUp()
      break
    case 'ArrowDown':
      event.preventDefault()
      navigateDown()
      break
    case 'Enter':
      event.preventDefault()
      executeActive()
      break
  }
}

function navigateUp() {
  const sections = groupedSuggestions.value
  if (sections.length === 0) return

  if (activeIndex.value.item > 0) {
    activeIndex.value.item--
  } else if (activeIndex.value.section > 0) {
    activeIndex.value.section--
    activeIndex.value.item = sections[activeIndex.value.section].items.length - 1
  } else {
    // 回到最后一个
    activeIndex.value.section = sections.length - 1
    activeIndex.value.item = sections[activeIndex.value.section].items.length - 1
  }
}

function navigateDown() {
  const sections = groupedSuggestions.value
  if (sections.length === 0) return

  const currentSection = sections[activeIndex.value.section]
  if (activeIndex.value.item < currentSection.items.length - 1) {
    activeIndex.value.item++
  } else if (activeIndex.value.section < sections.length - 1) {
    activeIndex.value.section++
    activeIndex.value.item = 0
  } else {
    // 回到第一个
    activeIndex.value.section = 0
    activeIndex.value.item = 0
  }
}

function executeActive() {
  const sections = groupedSuggestions.value
  if (sections.length === 0) return

  const activeSection = sections[activeIndex.value.section]
  const activeSuggestion = activeSection?.items[activeIndex.value.item]
  
  if (activeSuggestion) {
    executeSuggestion(activeSuggestion)
  }
}

function executeSuggestion(suggestion: SearchSuggestion) {
  suggestion.action()
  emit('close')
}

function isActive(sectionIndex: number, itemIndex: number): boolean {
  return activeIndex.value.section === sectionIndex && activeIndex.value.item === itemIndex
}

function setActiveIndex(sectionIndex: number, itemIndex: number) {
  activeIndex.value.section = sectionIndex
  activeIndex.value.item = itemIndex
}
</script>

<style scoped>
.command-palette-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 20vh;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.command-palette {
  width: 520px;
  max-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.dark .command-palette {
  background: #1C1C1E;
}

.command-search {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #E5E7EB;
}

.dark .command-search {
  border-bottom-color: #374151;
}

.search-icon {
  color: #6B7280;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #111827;
}

.dark .search-input {
  color: #F9FAFB;
}

.search-input:focus {
  outline: none;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.command-sections {
  max-height: 320px;
  overflow-y: auto;
}

.command-section {
  padding: 8px 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.command-list {
  display: flex;
  flex-direction: column;
}

.command-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.command-item:hover,
.command-item.active {
  background: #F3F4F6;
}

.dark .command-item:hover,
.dark .command-item.active {
  background: #374151;
}

.command-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.command-icon {
  color: #6B7280;
  flex-shrink: 0;
}

.command-info {
  min-width: 0;
}

.command-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.dark .command-title {
  color: #F9FAFB;
}

.command-description {
  display: block;
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
}

.command-shortcut {
  padding: 4px 8px;
  background: #E5E7EB;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #6B7280;
}

.dark .command-shortcut {
  background: #48484A;
  color: #9CA3AF;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.no-results p {
  margin: 8px 0 4px;
  font-size: 14px;
  color: #6B7280;
}

.command-help {
  padding: 16px;
}

.help-section {
  margin-bottom: 16px;
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-category {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.help-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.dark .help-item {
  color: #D1D5DB;
}

.help-item kbd {
  padding: 2px 6px;
  background: #E5E7EB;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  color: #6B7280;
}

.dark .help-item kbd {
  background: #48484A;
  color: #9CA3AF;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>