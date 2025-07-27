<template>
  <div class="command-palette-overlay" @click="handleOverlayClick">
    <div class="command-palette" @click.stop>
      <div class="command-search">
        <MagnifyingGlassIcon class="search-icon w-5 h-5" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="搜索或输入命令..."
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
            <component :is="section.icon" class="w-4 h-4" />
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
                <component :is="suggestion.icon" class="command-icon w-4 h-4" />
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
        <ExclamationCircleIcon class="w-6 h-6 text-gray-400" />
        <p>未找到匹配的命令</p>
        <p class="text-sm text-gray-500">尝试使用不同的关键词</p>
      </div>

      <div v-else class="command-help">
        <div class="help-section">
          <span class="help-category">快速操作</span>
          <div class="help-items">
            <div class="help-item">
              <kbd>⌘</kbd><kbd>D</kbd>
              <span>检测重复页面</span>
            </div>
            <div class="help-item">
              <kbd>⌘</kbd><kbd>S</kbd>
              <span>创建快照</span>
            </div>
            <div class="help-item">
              <kbd>⌘</kbd><kbd>R</kbd>
              <span>恢复会话</span>
            </div>
          </div>
        </div>
        <div class="help-section">
          <span class="help-category">导航</span>
          <div class="help-items">
            <div class="help-item">
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>上下选择</span>
            </div>
            <div class="help-item">
              <kbd>Enter</kbd>
              <span>执行命令</span>
            </div>
            <div class="help-item">
              <kbd>Esc</kbd>
              <span>关闭面板</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
  CogIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  CameraIcon,
  ArrowPathIcon,
  TrashIcon,
  CloudArrowUpIcon,
  PlusIcon,
  BoltIcon
} from '@heroicons/vue/24/outline'

import type { SearchSuggestion } from '@/types'
import { workspaceManager } from '@/utils/workspace-manager'
import { syncManager } from '@/utils/sync-manager'
import { duplicateDetector } from '@/utils/duplicate-detector'

// Props & Emits
const emit = defineEmits<{
  close: []
  execute: [command: any]
}>()

// 响应式数据
const searchInput = ref<HTMLInputElement>()
const searchQuery = ref('')
const activeIndex = ref({ section: 0, item: 0 })

// 建议列表
const suggestions = ref<SearchSuggestion[]>([
  // 工作空间相关
  {
    id: 'create-workspace',
    type: 'command',
    title: '创建新工作空间',
    description: '创建一个新的工作空间来组织标签页',
    icon: PlusIcon,
    category: 'workspace',
    action: async () => {
      const workspace = await workspaceManager.createWorkspace({
        name: `工作空间 ${workspaceManager.getAllWorkspaces().length + 1}`,
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
    title: '打开工作空间',
    description: '选择并打开一个工作空间',
    icon: FolderIcon,
    category: 'workspace',
    action: () => {
      // 显示工作空间选择器
      emit('execute', { type: 'show-workspace-selector' })
    }
  },
  
  // 标签页相关
  {
    id: 'detect-duplicates',
    type: 'command',
    title: '检测重复页面',
    description: '扫描并找出重复的标签页',
    icon: DocumentDuplicateIcon,
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
    title: '清理重复页面',
    description: '自动关闭重复的标签页',
    icon: TrashIcon,
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
    title: '创建快照',
    description: '保存当前浏览器状态的快照',
    icon: CameraIcon,
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
    title: '恢复会话',
    description: '从之前的快照恢复浏览器状态',
    icon: ArrowPathIcon,
    category: 'session',
    shortcut: '⌘R',
    action: () => {
      emit('execute', { type: 'show-restore-dialog' })
    }
  },
  {
    id: 'sync-now',
    type: 'command',
    title: '立即同步',
    description: '立即创建自动同步快照',
    icon: CloudArrowUpIcon,
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
    title: '打开设置',
    description: '配置插件选项和偏好',
    icon: CogIcon,
    category: 'settings',
    action: () => {
      chrome.runtime.openOptionsPage()
      emit('execute', { type: 'settings-opened' })
    }
  }
])

// 计算属性
const filteredSuggestions = computed(() => {
  if (!searchQuery.value) {
    return suggestions.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return suggestions.value.filter(suggestion =>
    suggestion.title.toLowerCase().includes(query) ||
    suggestion.description?.toLowerCase().includes(query)
  )
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
    workspace: { title: '工作空间', icon: FolderIcon },
    tab: { title: '标签页', icon: DocumentDuplicateIcon },
    session: { title: '会话', icon: CameraIcon },
    settings: { title: '设置', icon: CogIcon }
  }

  return Object.entries(groups).map(([category, items], sectionIndex) => ({
    category,
    title: categoryInfo[category as keyof typeof categoryInfo]?.title || category,
    icon: categoryInfo[category as keyof typeof categoryInfo]?.icon || BoltIcon,
    items,
    sectionIndex
  }))
})

// 组件挂载
onMounted(async () => {
  await nextTick()
  searchInput.value?.focus()
  
  // 动态加载更多建议
  await loadDynamicSuggestions()
})

// 加载动态建议
async function loadDynamicSuggestions() {
  try {
    // 加载工作空间建议
    const workspaces = workspaceManager.getAllWorkspaces()
    workspaces.forEach(workspace => {
      suggestions.value.push({
        id: `open-workspace-${workspace.id}`,
        type: 'workspace',
        title: `打开 ${workspace.name}`,
        description: `${workspace.tabs.length} 个标签页`,
        icon: FolderIcon,
        category: 'workspace',
        action: async () => {
          await workspaceManager.openWorkspace(workspace.id)
          emit('execute', { type: 'workspace-opened', data: workspace })
        }
      })
    })

    // 加载最近标签页建议
    const tabs = await chrome.tabs.query({})
    tabs.slice(0, 5).forEach(tab => {
      if (tab.url && tab.title) {
        suggestions.value.push({
          id: `switch-to-tab-${tab.id}`,
          type: 'tab',
          title: `切换到 ${tab.title}`,
          description: new URL(tab.url).hostname,
          icon: DocumentDuplicateIcon,
          category: 'tab',
          action: async () => {
            await chrome.tabs.update(tab.id!, { active: true })
            emit('execute', { type: 'tab-switched', data: tab })
          }
        })
      }
    })

    // 加载历史快照建议
    const snapshots = await syncManager.getSnapshotList()
    snapshots.slice(0, 3).forEach(snapshot => {
      suggestions.value.push({
        id: `restore-snapshot-${snapshot.id}`,
        type: 'history',
        title: `恢复 ${snapshot.name}`,
        description: `${snapshot.metadata?.totalTabs} 个标签页`,
        icon: ArrowPathIcon,
        category: 'session',
        action: async () => {
          await syncManager.restoreSnapshot(snapshot.id)
          emit('execute', { type: 'snapshot-restored', data: snapshot })
        }
      })
    })
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