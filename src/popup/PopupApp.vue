<template>
  <div class="popup-container" :class="{ 'dark': isDarkMode }">
    <!-- 标题栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">Smart Tab</span>
        </div>
      </div>
      <div class="header-right">
        <button @click="openSettings" class="icon-button settings-btn" :title="t('popup.settings.title')">
          <FontAwesomeIcon icon="cog" class="w-5 h-5" />
        </button>
        <button @click="handleLanguageToggle" class="icon-button language-btn" :title="t('popup.language.switch')">
          <FontAwesomeIcon icon="globe" class="w-5 h-5" />
          <span class="language-text">{{ currentLanguage === 'zh-CN' ? 'EN' : '中' }}</span>
        </button>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-container" @click="openCommandPalette">
        <FontAwesomeIcon icon="search" class="search-icon w-4 h-4" />
        <input 
          type="text" 
          :placeholder="t('popup.search.placeholder')"
          class="search-input"
          readonly
        />
        <kbd class="search-shortcut">{{ t('popup.search.shortcut') }}</kbd>
      </div>
    </div>

    <!-- 概览卡片 -->
    <div class="overview-section">
      <div class="section-title">
        <FontAwesomeIcon icon="chart-bar" class="w-4 h-4" />
        <span>{{ t('popup.overview.title') }}</span>
      </div>
      <div class="overview-card">
        <div class="stat-item">
          <span class="stat-value">{{ stats.totalTabs }}</span>
          <span class="stat-label">{{ t('popup.overview.totalTabs') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value duplicate">{{ stats.duplicateTabs }}</span>
          <span class="stat-label">{{ t('popup.overview.duplicates') }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">⚡</span>
          <span class="stat-label">{{ formatTime(stats.lastSyncTime) }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页管理 -->
    <div class="tabs-section">
      <div class="section-title">
        <FontAwesomeIcon icon="copy" class="w-4 h-4" />
        <span>{{ t('popup.tabs.title') }}</span>
        <span class="section-count">{{ currentTabs.length }}</span>
        <button 
          class="tab-sort-btn"
          @click="toggleTabSort"
          :title="getSortButtonTitle()"
        >
          <span class="sort-icon">{{ tabSortMode === 'time' ? '🕐' : (tabSortMode === 'domain' ? '🌐' : '📂') }}</span>
        </button>
      </div>
      
      <!-- 标签页过滤器 -->
      <div class="tab-filters" v-if="currentTabs.length > 10">
        <button 
          v-for="filter in tabFilters" 
          :key="filter.key"
          class="filter-btn"
          :class="{ 'active': activeTabFilter === filter.key }"
          @click="setTabFilter(filter.key)"
        >
          <span class="filter-icon">{{ filter.icon }}</span>
          <span class="filter-label">{{ filter.label }}</span>
          <span class="filter-count">{{ getFilteredTabsCount(filter.key) }}</span>
        </button>
      </div>
      
      <div class="tabs-list-container">
        <div class="tabs-list">
          <!-- 按分组显示标签页 -->
          <template v-if="tabSortMode === 'group'">
            <div v-for="group in groupedTabs" :key="group.name" class="tab-group">
              <div class="tab-group-header">
                <span class="group-name">{{ group.name }}</span>
                <span class="group-count">{{ group.tabs.length }}</span>
              </div>
              <div class="tab-group-items">
                <div 
                  v-for="tab in group.tabs" 
                  :key="`tab-${tab.id}-${tab.url}`"
                  class="tab-item"
                  :class="{
                    'active': tab.active,
                    'duplicate': isDuplicate(tab),
                    'pinned': tab.pinned
                  }"
                  @click="switchToTab(tab)"
                >
                  <img 
                    :src="getFaviconUrl(tab.favicon)" 
                    :alt="tab.title"
                    class="tab-favicon"
                    @error="handleFaviconError"
                  />
                  <div class="tab-info">
                    <span class="tab-title">{{ truncateText(tab.title, 25) }}</span>
                    <span class="tab-url">{{ getDomain(tab.url) }}</span>
                  </div>
                  <div class="tab-indicators">
                    <span v-if="tab.pinned" class="tab-indicator pinned" title="已固定">📌</span>
                    <span v-if="tab.active" class="tab-indicator active" title="当前活跃">●</span>
                    <span v-if="isDuplicate(tab)" class="tab-indicator duplicate" title="重复页面">⚠️</span>
                  </div>
                  <div class="tab-actions">
                    <button 
                      v-if="isDuplicate(tab)" 
                      class="tab-action duplicate"
                      @click.stop="handleDuplicate(tab)"
                      title="处理重复页面"
                    >
                      <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3" />
                    </button>
                    <button 
                      class="tab-action workspace"
                      @click.stop="addToWorkspace(tab)"
                      title="添加到分组"
                    >
                      <FontAwesomeIcon icon="plus" class="w-3 h-3" />
                    </button>
                    <button 
                      class="tab-action close"
                      @click.stop="closeTab(tab)"
                      :title="t('popup.tabs.closeTab')"
                    >
                      <span class="close-icon">×</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <!-- 常规列表显示 -->
          <template v-else>
            <div 
              v-for="tab in sortedAndFilteredTabs" 
              :key="`tab-${tab.id}-${tab.url}`"
              class="tab-item"
              :class="{
                'active': tab.active,
                'duplicate': isDuplicate(tab),
                'pinned': tab.pinned
              }"
              @click="switchToTab(tab)"
            >
              <img 
                :src="getFaviconUrl(tab.favicon)" 
                :alt="tab.title"
                class="tab-favicon"
                @error="handleFaviconError"
                @load="handleFaviconLoad"
              />
              <div class="tab-info">
                <span class="tab-title">{{ truncateText(tab.title, 25) }}</span>
                <span class="tab-url">{{ getDomain(tab.url) }}</span>
              </div>
              <div class="tab-indicators">
                <span v-if="tab.pinned" class="tab-indicator pinned" title="已固定">📌</span>
                <span v-if="tab.active" class="tab-indicator active" title="当前活跃">●</span>
                <span v-if="isDuplicate(tab)" class="tab-indicator duplicate" title="重复页面">⚠️</span>
              </div>
              <div class="tab-actions">
                <button 
                  v-if="isDuplicate(tab)" 
                  class="tab-action duplicate"
                  @click.stop="handleDuplicate(tab)"
                  title="处理重复页面"
                >
                  <FontAwesomeIcon icon="exclamation-triangle" class="w-3 h-3" />
                </button>
                <button 
                  class="tab-action workspace"
                  @click.stop="addToWorkspace(tab)"
                  title="添加到分组"
                >
                  <FontAwesomeIcon icon="plus" class="w-3 h-3" />
                </button>
                <button 
                  class="tab-action close"
                  @click.stop="closeTab(tab)"
                  :title="t('popup.tabs.closeTab')"
                >
                  <span class="close-icon">×</span>
                </button>
              </div>
            </div>
          </template>
        </div>
        
        <div v-if="sortedAndFilteredTabs.length === 0 && currentTabs.length > 0" class="empty-state">
          <FontAwesomeIcon icon="copy" class="w-8 h-8 opacity-50" />
          <span>没有符合条件的标签页</span>
        </div>
        
        <div v-if="currentTabs.length === 0" class="empty-state">
          <FontAwesomeIcon icon="copy" class="w-8 h-8 opacity-50" />
          <span>暂无标签页</span>
        </div>
      </div>
    </div>

    <!-- 分组 -->
    <div class="workspaces-section">
      <div class="section-title">
        <FontAwesomeIcon icon="folder" class="w-4 h-4" />
        <span>{{ t('popup.workspaces.title') }}</span>
      </div>
      <div class="workspaces-list">
        <div 
          v-for="workspace in workspaces.slice(0, 4)" 
          :key="workspace.id"
          class="workspace-item"
          :class="{ 'active': workspace.id === activeWorkspaceId }"
          @click="showWorkspaceTabsDialog(workspace)"
        >
          <div class="workspace-icon" :style="{ backgroundColor: workspace.color }">
            {{ workspace.icon }}
          </div>
          <div class="workspace-info">
            <span class="workspace-name">{{ workspace.name }}</span>
            <span class="workspace-count">({{ workspace.tabs.length }})</span>
          </div>
          <div class="workspace-activity">
            <div class="activity-bar">
              <div 
                class="activity-progress" 
                :style="{ width: `${getWorkspaceActivity(workspace)}%` }"
              ></div>
            </div>
          </div>
          <div class="workspace-actions">
            <button 
              class="workspace-action"
              @click.stop="openWorkspace(workspace)"
              :title="isI18nReady ? t('popup.workspaces.open') : '打开分组'"
            >
              <FontAwesomeIcon icon="play" class="w-3 h-3" />
            </button>
            <button 
              class="workspace-action"
              @click.stop="editWorkspace(workspace)"
              :title="isI18nReady ? t('popup.workspaces.edit') : '编辑分组'"
            >
              <FontAwesomeIcon icon="edit" class="w-3 h-3" />
            </button>
            <button 
              class="workspace-action delete"
              @click.stop="deleteWorkspace(workspace)"
              :title="isI18nReady ? t('popup.workspaces.delete') : '删除分组'"
            >
              <FontAwesomeIcon icon="trash" class="w-3 h-3" />
            </button>
          </div>
        </div>
        <button class="add-workspace-btn" @click="createWorkspace">
          <FontAwesomeIcon icon="plus" class="w-4 h-4" />
          <span>{{ t('popup.workspaces.newWorkspace') }}</span>
        </button>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="tabs-actions-section">
      <div class="section-title">
        <FontAwesomeIcon icon="plus" class="w-4 h-4" />
        <span>{{ t('popup.tabActions.title') }}</span>
      </div>
      <div class="tab-actions-grid">
        <button class="tab-action-btn" @click="createNewTab">
          <FontAwesomeIcon icon="plus" class="w-4 h-4" />
          <span>{{ t('popup.tabActions.newTab') }}</span>
        </button>
        <button class="tab-action-btn" @click="duplicateCurrentTab">
          <FontAwesomeIcon icon="copy" class="w-4 h-4" />
          <span>{{ t('popup.tabActions.duplicateTab') }}</span>
        </button>
      </div>
    </div>

    <!-- 系统操作 -->
    <div class="actions-section">
      <div class="section-title">
        <FontAwesomeIcon icon="bolt" class="w-4 h-4" />
        <span>{{ t('popup.systemActions.title') }}</span>
      </div>
      <div class="actions-grid">
        <button class="action-btn" @click="syncNow">
          <FontAwesomeIcon icon="cloud-upload-alt" class="w-4 h-4" />
          <span>{{ t('popup.systemActions.sync') }}</span>
        </button>
        <button class="action-btn" @click="createSnapshot">
          <FontAwesomeIcon icon="camera" class="w-4 h-4" />
          <span>{{ t('popup.systemActions.snapshot') }}</span>
        </button>
        <button class="action-btn" @click="restoreSession">
          <FontAwesomeIcon icon="sync" class="w-4 h-4" />
          <span>{{ t('popup.systemActions.restore') }}</span>
        </button>
        <button class="action-btn" @click="cleanDuplicates">
          <FontAwesomeIcon icon="trash" class="w-4 h-4" />
          <span>{{ t('popup.systemActions.cleanup') }}</span>
        </button>
      </div>
    </div>

    <!-- 命令面板 -->
    <CommandPalette 
      v-if="showCommandPalette" 
      @close="showCommandPalette = false"
      @execute="executeCommand"
    />

    <!-- 分组选择对话框 -->
    <div v-if="showWorkspaceSelectorDialog" class="workspace-selector-overlay" @click="showWorkspaceSelectorDialog = false">
      <div class="workspace-selector-dialog" @click.stop>
        <h3>{{ t('popup.workspaces.selector.title') }}</h3>
        <p class="dialog-desc">{{ t('popup.workspaces.selector.description').replace('{title}', selectedTabForWorkspace?.title || '') }}</p>
        <div class="workspace-list">
          <div 
            v-for="workspace in workspaces" 
            :key="workspace.id"
            class="workspace-option"
            @click="selectWorkspaceForTab(workspace)"
          >
            <div class="workspace-icon" :style="{ backgroundColor: workspace.color }">
              {{ workspace.icon }}
            </div>
            <div class="workspace-info">
              <span class="workspace-name">{{ workspace.name }}</span>
              <span class="workspace-count">{{ workspace.tabs.length }} {{ t('popup.workspaces.selector.tabsCount') }}</span>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="btn-cancel" @click="showWorkspaceSelectorDialog = false">{{ t('popup.workspaces.selector.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- 重复页面清理对话框 -->
    <div v-if="showCleanupDialog" class="workspace-selector-overlay" @click="showCleanupDialog = false">
      <div class="workspace-selector-dialog cleanup-dialog" @click.stop>
        <h3>{{ t('popup.cleanup.dialog.title') }}</h3>
        <p class="dialog-desc">{{ t('popup.cleanup.dialog.description').replace('{count}', duplicateGroups.length.toString()) }}</p>
        
        <div class="duplicate-preview">
          <div v-for="(group, index) in duplicateGroups.slice(0, 3)" :key="index" class="duplicate-group">
            <div class="group-title">
              <span class="group-icon">🔗</span>
              <span>{{ truncateText(group.tabs[0]?.title || '未知页面', 25) }}</span>
              <span class="duplicate-count">({{ group.tabs.length }}{{ t('popup.cleanup.dialog.groupCount') }})</span>
            </div>
            <div class="tabs-preview">
              <div v-for="(tab, tabIndex) in group.tabs.slice(0, 2)" :key="tab.id" class="tab-preview">
                <span class="tab-status" :class="{ 'keep': tabIndex === 0, 'close': tabIndex > 0 }">
                  {{ tabIndex === 0 ? t('popup.cleanup.dialog.keep') : t('popup.cleanup.dialog.close') }}
                </span>
                <span class="tab-domain">{{ getDomain(tab.url) }}</span>
              </div>
              <div v-if="group.tabs.length > 2" class="more-tabs">
                {{ t('popup.cleanup.dialog.moreTabs').replace('{count}', (group.tabs.length - 2).toString()) }}
              </div>
            </div>
          </div>
          <div v-if="duplicateGroups.length > 3" class="more-groups">
            {{ t('popup.cleanup.dialog.moreGroups').replace('{count}', (duplicateGroups.length - 3).toString()) }}
          </div>
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel" @click="showCleanupDialog = false">{{ t('popup.cleanup.dialog.cancel') }}</button>
          <button class="btn-danger" @click="confirmCleanDuplicates">{{ t('popup.cleanup.dialog.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 会话恢复对话框 -->
    <div v-if="showRestoreDialog" class="workspace-selector-overlay" @click="showRestoreDialog = false">
      <div class="workspace-selector-dialog workspace-tabs-dialog" @click.stop>
        <h3>{{ isI18nReady ? t('popup.systemActions.restoreDialog.title') : '恢复会话' }}</h3>
        <p class="dialog-desc">{{ isI18nReady ? t('popup.systemActions.restoreDialog.description') : '选择要恢复的会话快照' }}</p>
        
        <div class="workspace-tabs-list">
          <div v-if="availableSnapshots.length === 0" class="no-tabs">
            <FontAwesomeIcon icon="folder-open" class="w-8 h-8 opacity-50" />
            <span>{{ isI18nReady ? t('popup.systemActions.restoreDialog.noSnapshots') : '暂无可用快照' }}</span>
          </div>
          <div 
            v-for="snapshot in availableSnapshots" 
            :key="snapshot.id"
            class="workspace-tab-item"
          >
            <div class="tab-icon">
              <FontAwesomeIcon icon="camera" class="w-4 h-4" />
            </div>
            <div class="tab-info">
              <span class="tab-title">{{ snapshot.name }}</span>
              <span class="tab-url">{{ formatSnapshotTime(snapshot.timestamp) }}</span>
              <span class="tab-url" v-if="snapshot.metadata?.totalTabs">
                {{ snapshot.metadata.totalTabs }} {{ isI18nReady ? t('popup.systemActions.restoreDialog.tabsCount') : '个标签页' }}
              </span>
            </div>
            <div class="tab-actions">
              <button 
                class="tab-action-btn open"
                @click="restoreFromSnapshot(snapshot)"
                :title="isI18nReady ? t('popup.systemActions.restoreDialog.restoreButton') : '恢复快照'"
              >
                <FontAwesomeIcon icon="sync" class="w-3 h-3" />
              </button>
              <button 
                class="tab-action-btn remove"
                @click="deleteSnapshot(snapshot)"
                :title="isI18nReady ? t('popup.systemActions.restoreDialog.deleteButton') : '删除快照'"
              >
                <FontAwesomeIcon icon="trash" class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel" @click="showRestoreDialog = false">
            {{ isI18nReady ? t('popup.systemActions.restoreDialog.cancel') : '取消' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分组标签列表对话框 -->
    <div v-if="showWorkspaceTabsDialogVisible" class="workspace-selector-overlay" @click="showWorkspaceTabsDialogVisible = false">
      <div class="workspace-selector-dialog workspace-tabs-dialog" @click.stop>
        <h3>{{ isI18nReady ? t('popup.workspaces.tabsDialog.title') : '分组标签列表' }}</h3>
        <p class="dialog-desc">{{ getWorkspaceDialogDescription() }}</p>
        
        <div class="workspace-tabs-list">
          <div v-if="!selectedWorkspaceForTabs?.tabs.length" class="no-tabs">
            <FontAwesomeIcon icon="folder-open" class="w-8 h-8 opacity-50" />
            <span>{{ isI18nReady ? t('popup.workspaces.tabsDialog.emptyTabs') : '暂无标签页' }}</span>
          </div>
          <div 
            v-for="tab in selectedWorkspaceForTabs?.tabs" 
            :key="tab.url"
            class="workspace-tab-item"
          >
            <div class="tab-icon">
              <img v-if="tab.favicon" :src="tab.favicon" class="w-4 h-4" />
              <FontAwesomeIcon v-else icon="globe" class="w-4 h-4 opacity-50" />
            </div>
            <div class="tab-info">
              <span class="tab-title">{{ tab.title }}</span>
              <span class="tab-url">{{ tab.url }}</span>
            </div>
            <div class="tab-actions">
              <button 
                class="tab-action-btn open"
                @click="openTabFromWorkspace(tab)"
                :title="isI18nReady ? t('popup.workspaces.tabsDialog.openTab') : '打开标签'"
              >
                <FontAwesomeIcon icon="external-link-alt" class="w-3 h-3" />
              </button>
              <button 
                class="tab-action-btn remove"
                @click="removeTabFromWorkspace(selectedWorkspaceForTabs!, tab)"
                :title="isI18nReady ? t('popup.workspaces.tabsDialog.removeTab') : '移除标签'"
              >
                <FontAwesomeIcon icon="trash" class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button class="btn-primary" @click="openWorkspace(selectedWorkspaceForTabs!)">
            {{ isI18nReady ? t('popup.workspaces.open') : '打开分组' }}
          </button>
          <button class="btn-cancel" @click="showWorkspaceTabsDialogVisible = false">
            {{ isI18nReady ? t('popup.workspaces.tabsDialog.close') : '关闭' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 通知 -->
    <Notification 
      v-if="notification"
      :notification="notification"
      @close="notification = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { FontAwesomeIcon } from '@/utils/fontawesome'

import CommandPalette from '@/components/CommandPalette.vue'
import Notification from '@/components/Notification.vue'

import type { TabInfo, Workspace, Stats, Notification as NotificationType } from '@/types'
import { workspaceManager } from '@/utils/workspace-manager'
import { syncManager } from '@/utils/sync-manager'
import { duplicateDetector } from '@/utils/duplicate-detector'
import { useI18n } from '@/utils/i18n'

// 多语言支持
const { t, currentLanguage, toggleLanguage, initLanguage } = useI18n()

// 多语言初始化状态
const isI18nReady = ref(false)

// 响应式数据
const isDarkMode = ref(false)
const showCommandPalette = ref(false)
const notification = ref<NotificationType | null>(null)
const activeWorkspaceId = ref<string | null>(null)

const stats = reactive({
  totalTabs: 0,
  duplicateTabs: 0,
  totalWorkspaces: 0,
  lastSyncTime: 0 // 初始化为0，表示未同步
})

const currentTabs = ref<TabInfo[]>([])
const workspaces = ref<Workspace[]>([])
const duplicateTabs = ref<Set<string>>(new Set())

// 标签页排序和过滤
const tabSortMode = ref<'time' | 'domain' | 'group'>('time')
const activeTabFilter = ref<'all' | 'active' | 'pinned' | 'duplicate'>('all')

const tabSortLabels = computed(() => {
  if (!isI18nReady.value) {
    return {
      time: '时间排序',
      domain: '域名排序', 
      group: '分组显示'
    }
  }
  
  try {
    return {
      time: t('popup.tabs.sortTime') || '时间排序',
      domain: t('popup.tabs.sortDomain') || '域名排序', 
      group: t('popup.tabs.sortGroup') || '分组显示'
    }
  } catch (error) {
    return {
      time: '时间排序',
      domain: '域名排序', 
      group: '分组显示'
    }
  }
})

const tabFilters = computed(() => {
  if (!isI18nReady.value) {
    return [
      { key: 'all', label: '全部', icon: '📄' },
      { key: 'active', label: '活跃', icon: '●' },
      { key: 'pinned', label: '固定', icon: '📌' },
      { key: 'duplicate', label: '重复', icon: '⚠️' }
    ]
  }
  
  try {
    return [
      { key: 'all', label: t('popup.tabs.filterAll') || '全部', icon: '📄' },
      { key: 'active', label: t('popup.tabs.filterActive') || '活跃', icon: '●' },
      { key: 'pinned', label: t('popup.tabs.filterPinned') || '固定', icon: '📌' },
      { key: 'duplicate', label: t('popup.tabs.filterDuplicate') || '重复', icon: '⚠️' }
    ]
  } catch (error) {
    return [
      { key: 'all', label: '全部', icon: '📄' },
      { key: 'active', label: '活跃', icon: '●' },
      { key: 'pinned', label: '固定', icon: '📌' },
      { key: 'duplicate', label: '重复', icon: '⚠️' }
    ]
  }
})

// 计算属性  
const formatTime = computed(() => (timestamp: number) => {
  if (!isI18nReady.value) {
    if (!timestamp || timestamp === 0) return '未同步'
    
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 0) return '刚刚同步'
    if (diff < 60000) return '刚刚同步'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return `${Math.floor(diff / 86400000)} 天前`
  }
  
  try {
    if (!timestamp || timestamp === 0) return t('popup.overview.notSynced') || '未同步'
    
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 0) return t('popup.overview.lastSync') || '刚刚同步' // 防止未来时间
    if (diff < 60000) return t('popup.overview.lastSync') || '刚刚同步'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t('popup.overview.minutesAgo') || '分钟前'}`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t('popup.overview.hoursAgo') || '小时前'}`
    return `${Math.floor(diff / 86400000)} ${t('popup.overview.daysAgo') || '天前'}`
  } catch (error) {
    return '未知时间'
  }
})

const formatSnapshotTime = computed(() => (timestamp: number) => {
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
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
})

// 标签页排序和过滤的计算属性
const sortedAndFilteredTabs = computed(() => {
  let tabs = [...currentTabs.value]
  
  // 先过滤
  if (activeTabFilter.value !== 'all') {
    switch (activeTabFilter.value) {
      case 'active':
        tabs = tabs.filter(tab => tab.active)
        break
      case 'pinned':
        tabs = tabs.filter(tab => tab.pinned)
        break
      case 'duplicate':
        tabs = tabs.filter(tab => isDuplicate(tab))
        break
    }
  }
  
  // 再排序
  switch (tabSortMode.value) {
    case 'domain':
      tabs.sort((a, b) => {
        const domainA = getDomain(a.url)
        const domainB = getDomain(b.url)
        return domainA.localeCompare(domainB)
      })
      break
    case 'time':
      // 按索引排序（Chrome标签页索引反映了创建时间顺序）
      tabs.sort((a, b) => (a.index || 0) - (b.index || 0))
      break
    case 'group':
      // 分组模式下不需要额外排序，因为会用groupedTabs
      break
  }
  
  // 确保固定和活跃标签页优先显示
  tabs.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    if (a.active && !b.active) return -1
    if (!a.active && b.active) return 1
    return 0
  })
  
  return tabs
})

const groupedTabs = computed(() => {
  const groups: { [key: string]: TabInfo[] } = {}
  
  currentTabs.value.forEach(tab => {
    const domain = getDomain(tab.url)
    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(tab)
  })
  
  return Object.entries(groups)
    .map(([domain, tabs]) => ({
      name: domain,
      tabs: tabs.sort((a, b) => {
        // 在组内按固定、活跃、索引排序
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        if (a.active && !b.active) return -1
        if (!a.active && b.active) return 1
        return (a.index || 0) - (b.index || 0)
      })
    }))
    .sort((a, b) => {
      // 按组内标签页数量排序
      return b.tabs.length - a.tabs.length
    })
})

// 存储监听器引用以便清理
let tabListeners: Array<() => void> = []

// 组件挂载时初始化
onMounted(async () => {
  console.log('🚀 Popup mounting...')
  
  // 初始化多语言
  await initLanguage()
  isI18nReady.value = true
  
  // 首先设置事件监听器
  setupEventListeners()
  
  // 监听语言变化消息
  setupLanguageListener()
  
  // 然后加载数据
  await loadData()
  
  // 检测主题
  detectTheme()
  
  // 测试与background的连接
  testBackgroundConnection()
  
  console.log('✅ Popup mounted successfully')
})

// 测试与background script的连接
function testBackgroundConnection() {
  try {
    console.log('🔗 Testing connection to background script...')
    chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Background connection failed:', chrome.runtime.lastError)
      } else {
        console.log('✅ Background connection successful:', response)
      }
    })
  } catch (error) {
    console.error('❌ Failed to test background connection:', error)
  }
}

// 组件卸载时清理监听器
onUnmounted(() => {
  tabListeners.forEach(cleanup => cleanup())
  tabListeners = []
})

// 加载数据
async function loadData() {
  try {
    console.log('🔄 Loading popup data...')
    
    // 加载标签页
    const tabs = await chrome.tabs.query({})
    console.log('📋 Loaded', tabs.length, 'tabs')
    
    // 强制触发Vue响应性更新
    const newTabsData = tabs.map(tab => ({
      id: tab.id,
      url: tab.url || '',
      title: tab.title || '',
      favicon: tab.favIconUrl,
      windowId: tab.windowId,
      index: tab.index,
      active: tab.active,
      pinned: tab.pinned
    }))
    
    // 完全替换数组以确保Vue响应性
    currentTabs.value.splice(0, currentTabs.value.length, ...newTabsData)
    console.log('📝 Updated currentTabs, new length:', currentTabs.value.length)

    // 加载工作空间
    const newWorkspaces = workspaceManager.getAllWorkspaces()
    workspaces.value.splice(0, workspaces.value.length, ...newWorkspaces)
    activeWorkspaceId.value = workspaceManager.getActiveWorkspace()?.id || null
    console.log('🏢 Updated workspaces, count:', workspaces.value.length)

    // 加载重复检测
    const duplicates = await duplicateDetector.detectAllDuplicates()
    const newDuplicateUrls = new Set(
      duplicates.flatMap(group => group.tabs.map(tab => tab.url))
    )
    duplicateTabs.value.clear()
    newDuplicateUrls.forEach(url => duplicateTabs.value.add(url))
    console.log('🔍 Updated duplicates, count:', duplicateTabs.value.size)

    // 更新统计 - 分别更新每个属性以确保响应性
    const workspaceStats = workspaceManager.getWorkspaceStats()
    
    const oldStats = { ...stats }
    
    // 逐个更新stats属性以触发Vue响应性
    const newTotalTabs = currentTabs.value.length
    const newDuplicateTabs = duplicateTabs.value.size
    const newTotalWorkspaces = workspaceStats.totalWorkspaces
    
    if (stats.totalTabs !== newTotalTabs) {
      stats.totalTabs = newTotalTabs
      console.log('📊 Updated totalTabs:', oldStats.totalTabs, '->', stats.totalTabs)
    }
    
    if (stats.duplicateTabs !== newDuplicateTabs) {
      stats.duplicateTabs = newDuplicateTabs
      console.log('📊 Updated duplicateTabs:', oldStats.duplicateTabs, '->', stats.duplicateTabs)
    }
    
    if (stats.totalWorkspaces !== newTotalWorkspaces) {
      stats.totalWorkspaces = newTotalWorkspaces
      console.log('📊 Updated totalWorkspaces:', oldStats.totalWorkspaces, '->', stats.totalWorkspaces)
    }
    
    console.log('📊 Final stats:', {
      totalTabs: stats.totalTabs,
      duplicateTabs: stats.duplicateTabs,
      totalWorkspaces: stats.totalWorkspaces
    })
    
    // 获取同步时间，如果没有则保持为0
    try {
      const syncStats = await syncManager.getSyncStats()
      // 优先使用 sync stats 中的时间，如果为 0 则获取最新快照的时间
      if (syncStats.lastSyncTime && syncStats.lastSyncTime > 0) {
        if (stats.lastSyncTime !== syncStats.lastSyncTime) {
          stats.lastSyncTime = syncStats.lastSyncTime
          console.log('🕒 Updated lastSyncTime from syncStats:', stats.lastSyncTime)
        }
      } else {
        // 尝试从最新快照获取同步时间
        const snapshots = await syncManager.getSnapshotList()
        if (snapshots.length > 0) {
          const snapshotTime = snapshots[0].timestamp
          if (stats.lastSyncTime !== snapshotTime) {
            stats.lastSyncTime = snapshotTime
            console.log('🕒 Updated lastSyncTime from snapshot:', stats.lastSyncTime)
          }
        } else {
          if (stats.lastSyncTime !== 0) {
            stats.lastSyncTime = 0
            console.log('🕒 Reset lastSyncTime to 0')
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get sync stats:', error)
      if (stats.lastSyncTime !== 0) {
        stats.lastSyncTime = 0
      }
    }
    
    console.log('✅ Popup data loaded and UI updated successfully')
    
    // 强制Vue重新渲染（作为最后的保障）
    await nextTick()
    console.log('🔄 Forced Vue to re-render')
    
  } catch (error) {
    console.error('❌ Error loading data:', error)
    showNotification('error', '数据加载失败', '请刷新后重试')
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 监听命令面板快捷键
  const handleCommandPalette = () => {
    showCommandPalette.value = true
  }
  window.addEventListener('open-command-palette', handleCommandPalette)
  tabListeners.push(() => window.removeEventListener('open-command-palette', handleCommandPalette))

  // 监听Chrome扩展消息
  const handleMessage = (message: any, sender: any, sendResponse: any) => {
    console.log('Popup received message:', message.type, message)
    
    switch (message.type) {
      case 'tab-created':
      case 'tab-updated':
      case 'tab-removed':
      case 'tab-activated':
      case 'window-created':
      case 'window-removed':
        console.log('🔄 Refreshing popup data due to:', message.type)
        loadData()
        break
      case 'open-command-palette':
        showCommandPalette.value = true
        break
      case 'heartbeat':
        console.log('💓 Heartbeat received from background:', message.payload.timestamp)
        break
      case 'duplicate-notification-fallback':
        console.log('🔔 Received duplicate notification fallback:', message.payload)
        showDuplicateNotificationInPopup(message.payload)
        break
      default:
        console.log('❓ Unhandled message type:', message.type)
    }
  }
  chrome.runtime.onMessage.addListener(handleMessage)
  tabListeners.push(() => chrome.runtime.onMessage.removeListener(handleMessage))

  // 监听焦点变化以实时更新数据
  const handleWindowFocus = () => {
    console.log('Window focus changed, refreshing data')
    loadData()
  }
  window.addEventListener('focus', handleWindowFocus)
  tabListeners.push(() => window.removeEventListener('focus', handleWindowFocus))

  // 监听页面可见性变化
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      console.log('Page became visible, refreshing data')
      loadData()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  tabListeners.push(() => document.removeEventListener('visibilitychange', handleVisibilityChange))
}

// 检测主题
async function detectTheme() {
  try {
    // 获取用户设置的主题
    const userSettings = await chrome.storage.sync.get(['settings'])
    const themeSettings = userSettings.settings?.ui?.theme || 'auto'
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    function updateTheme() {
      switch (themeSettings) {
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
    
    // 监听系统主题变化
    mediaQuery.addEventListener('change', updateTheme)
  } catch (error) {
    // 如果获取设置失败，使用系统主题
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mediaQuery.matches
    
    mediaQuery.addEventListener('change', (e) => {
      isDarkMode.value = e.matches
    })
  }
}

// 工具函数
function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function getFaviconUrl(favicon: string | undefined): string {
  // 如果没有favicon或者favicon为空，使用默认图标
  if (!favicon || favicon.trim() === '') {
    return chrome.runtime.getURL('icons/default-favicon.png')
  }
  
  // 检查缓存中是否有这个favicon的成功替代品
  if (faviconCache.has(favicon)) {
    return faviconCache.get(favicon)!
  }
  
  // 如果这个favicon之前失败过，直接使用默认图标
  if (faviconErrors.has(favicon)) {
    const defaultUrl = chrome.runtime.getURL('icons/default-favicon.png')
    faviconCache.set(favicon, defaultUrl)
    return defaultUrl
  }
  
  // 如果favicon是data URL或者有效的http(s) URL，直接使用
  if (favicon.startsWith('data:') || favicon.startsWith('http://') || favicon.startsWith('https://')) {
    return favicon
  }
  
  // 如果favicon是相对路径，也尝试使用（某些网站可能有特殊favicon）
  return favicon
}

function isDuplicate(tab: TabInfo): boolean {
  return duplicateTabs.value.has(tab.url)
}

function getWorkspaceActivity(workspace: Workspace): number {
  // 基于标签页数量和最近更新时间计算活跃度
  const tabCount = workspace.tabs.length
  const timeSinceUpdate = Date.now() - workspace.updatedAt
  const hoursSinceUpdate = timeSinceUpdate / (1000 * 60 * 60)
  
  let activity = Math.min(tabCount * 10, 100)
  if (hoursSinceUpdate > 24) activity *= 0.5
  if (hoursSinceUpdate > 168) activity *= 0.3 // 一周
  
  return Math.max(0, Math.min(100, activity))
}

// 用于跟踪已经失败的favicon
const faviconErrors = new Set<string>()
// 用于缓存成功的favicon
const faviconCache = new Map<string, string>()

function handleFaviconError(event: Event) {
  const img = event.target as HTMLImageElement
  const originalSrc = img.src
  
  // 如果这个图片已经尝试过默认favicon了，就不要再尝试了
  if (faviconErrors.has(originalSrc) || img.src.includes('default-favicon.png')) {
    console.log('🚫 Favicon loading failed, using fallback text icon')
    // 使用文本图标代替
    img.style.display = 'none'
    
    // 创建一个文本图标替代
    const textIcon = document.createElement('div')
    textIcon.style.cssText = `
      width: 16px;
      height: 16px;
      background: #007AFF;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      color: white;
      flex-shrink: 0;
    `
    textIcon.textContent = '🌐'
    
    // 替换原始图片
    if (img.parentNode) {
      img.parentNode.insertBefore(textIcon, img)
      img.remove()
    }
    return
  }
  
  // 记录这个URL已经失败了
  faviconErrors.add(originalSrc)
  
  // 尝试使用默认favicon
  try {
    img.src = chrome.runtime.getURL('icons/default-favicon.png')
    console.log('🔄 Trying default favicon for failed URL:', originalSrc)
  } catch (error) {
    console.error('❌ Failed to load default favicon:', error)
    // 最终降级：隐藏图片
    img.style.display = 'none'
  }
}

// 标签页排序和过滤操作
function toggleTabSort() {
  const modes: ('time' | 'domain' | 'group')[] = ['time', 'domain', 'group']
  const currentIndex = modes.indexOf(tabSortMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  tabSortMode.value = modes[nextIndex]
  console.log('🔄 Tab sort mode changed to:', tabSortMode.value)
}

function setTabFilter(filterKey: 'all' | 'active' | 'pinned' | 'duplicate') {
  activeTabFilter.value = filterKey
  console.log('🔍 Tab filter changed to:', filterKey)
}

function getFilteredTabsCount(filterKey: 'all' | 'active' | 'pinned' | 'duplicate'): number {
  switch (filterKey) {
    case 'all':
      return currentTabs.value.length
    case 'active':
      return currentTabs.value.filter(tab => tab.active).length
    case 'pinned':
      return currentTabs.value.filter(tab => tab.pinned).length
    case 'duplicate':
      return currentTabs.value.filter(tab => isDuplicate(tab)).length
    default:
      return 0
  }
}

// 操作函数
async function switchToTab(tab: TabInfo) {
  if (tab.id) {
    await chrome.tabs.update(tab.id, { active: true })
    window.close()
  }
}

async function openCommandPalette() {
  showCommandPalette.value = true
}

async function openSettings() {
  await chrome.runtime.openOptionsPage()
}

async function handleDuplicate(tab: TabInfo) {
  try {
    const duplicates = await duplicateDetector.detectNewTabDuplicates(tab)
    if (duplicates.length > 0) {
      // 显示重复处理界面
      showNotification('info', t('notifications.duplicateFound'), t('notifications.duplicateFoundMessage').replace('{count}', duplicates.length.toString()))
    }
  } catch (error) {
    showNotification('error', t('notifications.detectionFailed'), t('notifications.detectionFailedMessage'))
  }
}

async function addToWorkspace(tab: TabInfo) {
  try {
    if (workspaces.value.length === 0) {
      showNotification('info', t('notifications.noWorkspace'), t('notifications.noWorkspaceMessage'))
      return
    }

    // 如果只有一个分组，直接添加到该分组
    if (workspaces.value.length === 1) {
      await addTabToSpecificWorkspace(tab, workspaces.value[0])
      return
    }

    // 多个分组时，显示选择对话框
    showWorkspaceSelector(tab)
  } catch (error) {
    console.error('Error adding tab to workspace:', error)
    showNotification('error', t('notifications.addFailed'), t('notifications.addFailedMessage'))
  }
}

// 添加状态管理
const showWorkspaceSelectorDialog = ref(false)
const selectedTabForWorkspace = ref<TabInfo | null>(null)

function showWorkspaceSelector(tab: TabInfo) {
  selectedTabForWorkspace.value = tab
  showWorkspaceSelectorDialog.value = true
}

async function addTabToSpecificWorkspace(tab: TabInfo, workspace: Workspace) {
  const tabToAdd = {
    id: tab.id,
    url: tab.url,
    title: tab.title,
    favicon: tab.favicon,
    addedAt: Date.now()
  }

  const success = await workspaceManager.addTabToWorkspace(workspace.id, tabToAdd)
  
  if (success) {
    // 重新加载工作空间数据而不是手动修改，避免重复
    const newWorkspaces = workspaceManager.getAllWorkspaces()
    workspaces.value.splice(0, workspaces.value.length, ...newWorkspaces)
    
    const successMessage = isI18nReady.value ? 
      t('popup.workspaces.notifications.addSuccessMessage').replace('{name}', workspace.name) : 
      `已添加到 "${workspace.name}"`
    showNotification('success', 
      isI18nReady.value ? t('popup.workspaces.notifications.addSuccess') : '添加成功', 
      successMessage)
  } else {
    // 标签已存在或添加失败
    const message = isI18nReady.value ? 
      t('popup.workspaces.notifications.tabExistsMessage').replace('{title}', tab.title) : 
      `"${tab.title}" 已在分组中`
    showNotification('info', 
      isI18nReady.value ? t('popup.workspaces.notifications.tabExists') : '标签页已存在', 
      message)
  }
}

async function selectWorkspaceForTab(workspace: Workspace) {
  if (selectedTabForWorkspace.value) {
    await addTabToSpecificWorkspace(selectedTabForWorkspace.value, workspace)
    showWorkspaceSelectorDialog.value = false
    selectedTabForWorkspace.value = null
  }
}

async function openWorkspace(workspace: Workspace) {
  try {
    await workspaceManager.openWorkspace(workspace.id)
    const successMessage = isI18nReady.value ? 
      t('popup.workspaces.notifications.workspaceOpenedMessage').replace('{count}', workspace.tabs.length.toString()) : 
      `打开了 ${workspace.tabs.length} 个标签页`
    showNotification('success', 
      isI18nReady.value ? t('popup.workspaces.notifications.workspaceOpened') : '工作空间已打开', 
      successMessage)
    window.close()
  } catch (error) {
    showNotification('error', 
      isI18nReady.value ? t('popup.workspaces.notifications.openFailed') : '打开失败', 
      isI18nReady.value ? t('popup.workspaces.notifications.openFailedMessage') : '无法打开工作空间')
  }
}

async function editWorkspace(workspace: Workspace) {
  try {
    const promptText = isI18nReady.value ? 
      t('popup.workspaces.prompts.editName') : 
      '请输入新的分组名称：'
    const newName = prompt(promptText, workspace.name)
    if (!newName || newName.trim() === '') return // 用户取消或输入为空
    
    const trimmedName = newName.trim()
    if (trimmedName === workspace.name) return // 名称没有改变
    
    // 更新工作空间名称
    await workspaceManager.updateWorkspace(workspace.id, { name: trimmedName })
    
    // 更新本地数据
    workspace.name = trimmedName
    workspace.updatedAt = Date.now()
    
    const successMessage = isI18nReady.value ? 
      t('popup.workspaces.notifications.updateSuccessMessage').replace('{name}', trimmedName) : 
      `分组名称已更改为 "${trimmedName}"`
    showNotification('success', 
      isI18nReady.value ? t('popup.workspaces.notifications.updateSuccess') : '分组已更新', 
      successMessage)
  } catch (error) {
    console.error('Error editing workspace:', error)
    showNotification('error', 
      isI18nReady.value ? t('popup.workspaces.notifications.updateFailed') : '更新失败', 
      isI18nReady.value ? t('popup.workspaces.notifications.updateFailedMessage') : '无法更新分组名称')
  }
}

async function createWorkspace() {
  try {
    const promptText = isI18nReady.value ? 
      t('popup.workspaces.prompts.createName') : 
      '请输入分组名称：'
    const defaultName = isI18nReady.value ? 
      t('popup.workspaces.prompts.defaultName').replace('{number}', (workspaces.value.length + 1).toString()) : 
      `分组 ${workspaces.value.length + 1}`
    const name = prompt(promptText, defaultName)
    if (!name || name.trim() === '') return // 用户取消或输入为空
    
    const workspace = await workspaceManager.createWorkspace({
      name: name.trim(),
      icon: '📁',
      color: '#007AFF',
      tabs: []
    })
    
    // 重新加载工作空间数据而不是手动推入，避免重复
    const newWorkspaces = workspaceManager.getAllWorkspaces()
    workspaces.value.splice(0, workspaces.value.length, ...newWorkspaces)
    
    showNotification('success', 
      isI18nReady.value ? t('popup.workspaces.notifications.createSuccess') : '分组已创建', 
      workspace.name)
  } catch (error) {
    showNotification('error', 
      isI18nReady.value ? t('popup.workspaces.notifications.createFailed') : '创建失败', 
      isI18nReady.value ? t('popup.workspaces.notifications.createFailedMessage') : '无法创建分组')
  }
}

async function syncNow() {
  try {
    const snapshot = await syncManager.createSnapshot('manual')
    if (snapshot) {
      stats.lastSyncTime = snapshot.timestamp
      showNotification('success', 
        isI18nReady.value ? t('popup.systemActions.notifications.syncCompleted') : '同步完成', 
        isI18nReady.value ? t('popup.systemActions.notifications.syncCompletedMessage') : '会话已保存')
    } else {
      showNotification('error', 
        isI18nReady.value ? t('popup.systemActions.notifications.syncFailed') : '同步失败', 
        isI18nReady.value ? t('popup.systemActions.notifications.syncFailedMessage') : '请稍后重试')
    }
  } catch (error) {
    showNotification('error', 
      isI18nReady.value ? t('popup.systemActions.notifications.syncFailed') : '同步失败', 
      isI18nReady.value ? t('popup.systemActions.notifications.syncFailedMessage') : '请稍后重试')
  }
}

async function createSnapshot() {
  try {
    const snapshotPrefix = isI18nReady.value ? 
      t('popup.systemActions.snapshotNames.manualPrefix') : 
      '手动快照'
    const snapshotName = `${snapshotPrefix}_${new Date().toLocaleString()}`
    const snapshot = await syncManager.createSnapshot('manual', snapshotName)
    if (snapshot) {
      showNotification('success', 
        isI18nReady.value ? t('popup.systemActions.notifications.snapshotCreated') : '快照已创建', 
        snapshot.name)
    }
  } catch (error) {
    showNotification('error', 
      isI18nReady.value ? t('popup.systemActions.notifications.snapshotCreateFailed') : '创建失败', 
      isI18nReady.value ? t('popup.systemActions.notifications.snapshotCreateFailedMessage') : '无法创建快照')
  }
}

async function restoreSession() {
  try {
    const snapshots = await syncManager.getSnapshotList()
    if (snapshots.length === 0) {
      showNotification('info', 
        isI18nReady.value ? t('popup.systemActions.notifications.noSnapshots') : '没有快照', 
        isI18nReady.value ? t('popup.systemActions.notifications.noSnapshotsMessage') : '没有可恢复的会话快照')
      return
    }
    
    showSessionRestoreDialog(snapshots)
  } catch (error) {
    console.error('Error getting snapshots:', error)
    showNotification('error', 
      isI18nReady.value ? t('popup.systemActions.notifications.getSnapshotsFailed') : '获取失败', 
      isI18nReady.value ? t('popup.systemActions.notifications.getSnapshotsFailedMessage') : '无法获取会话快照')
  }
}

// 会话恢复对话框状态
const showRestoreDialog = ref(false)
const availableSnapshots = ref<any[]>([])

function showSessionRestoreDialog(snapshots: any[]) {
  availableSnapshots.value = snapshots.slice(0, 10) // 限制显示最新10个
  showRestoreDialog.value = true
}

async function restoreFromSnapshot(snapshot: any) {
  try {
    await syncManager.restoreSnapshot(snapshot.id)
    showRestoreDialog.value = false
    const successMessage = isI18nReady.value ?
      t('popup.systemActions.notifications.restoreSuccessMessage').replace('{name}', snapshot.name) :
      `已恢复 "${snapshot.name}" 快照`
    showNotification('success', 
      isI18nReady.value ? t('popup.systemActions.notifications.restoreSuccess') : '恢复成功', 
      successMessage)
    window.close()
  } catch (error) {
    console.error('Error restoring snapshot:', error)
    showNotification('error', 
      isI18nReady.value ? t('notifications.restoreFailed') : '恢复失败', 
      isI18nReady.value ? t('notifications.restoreFailedMessage') : '无法恢复会话快照')
  }
}

async function cleanDuplicates() {
  try {
    const duplicates = await duplicateDetector.detectAllDuplicates()
    if (duplicates.length === 0) {
      showNotification('info', t('notifications.noCleanupNeeded'), t('notifications.noCleanupNeededMessage'))
      return
    }
    
    // 显示清理确认对话框
    showDuplicateCleanupDialog(duplicates)
  } catch (error) {
    showNotification('error', t('notifications.detectionFailed'), t('notifications.detectionFailedMessage'))
  }
}

// 添加重复清理对话框状态
const showCleanupDialog = ref(false)
const duplicateGroups = ref<any[]>([])

function showDuplicateCleanupDialog(duplicates: any[]) {
  duplicateGroups.value = duplicates
  showCleanupDialog.value = true
}

async function confirmCleanDuplicates() {
  try {
    let closedCount = 0
    
    for (const group of duplicateGroups.value) {
      // 保留第一个标签页，关闭其余的
      const tabsToClose = group.tabs.slice(1)
      
      for (const tab of tabsToClose) {
        try {
          await chrome.tabs.remove(tab.id)
          closedCount++
        } catch (error) {
          console.warn(`Failed to close tab ${tab.id}:`, error)
        }
      }
    }
    
    showCleanupDialog.value = false
    duplicateGroups.value = []
    
    if (closedCount > 0) {
      const successMessage = isI18nReady.value ?
        t('popup.cleanup.notifications.completedMessage').replace('{count}', closedCount.toString()) :
        `已关闭 ${closedCount} 个重复标签页`
      showNotification('success', 
        isI18nReady.value ? t('popup.cleanup.notifications.completed') : '清理完成', 
        successMessage)
      // 重新加载数据
      await loadData()
    } else {
      showNotification('info', 
        isI18nReady.value ? t('popup.cleanup.notifications.nothingClosed') : '无法清理', 
        isI18nReady.value ? t('popup.cleanup.notifications.nothingClosedMessage') : '没有成功关闭任何标签页')
    }
  } catch (error) {
    showNotification('error', 
      isI18nReady.value ? t('popup.cleanup.notifications.failed') : '清理失败', 
      isI18nReady.value ? t('popup.cleanup.notifications.failedMessage') : '清理过程中出现错误')
  }
}

function executeCommand(command: any) {
  // 执行命令
  showCommandPalette.value = false
  showNotification('info', '执行命令', command.title)
}

// 新标签页相关功能
async function createNewTab() {
  try {
    console.log('🚀 Starting createNewTab function')
    
    // 提示用户输入URL
    const promptText = isI18nReady.value ? 
      t('popup.tabActions.newTabPrompt') : 
      '请输入要打开的网址：'
    const defaultUrl = isI18nReady.value ? 
      t('popup.tabActions.newTabDefault') : 
      'https://'
    const url = prompt(promptText, defaultUrl)
    if (!url) {
      console.log('❌ User cancelled URL input')
      return // 用户取消
    }
    
    // 检查URL格式
    let finalUrl = url
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('chrome://')) {
      finalUrl = 'https://' + url
    }
    
    console.log('🔗 Creating new tab with URL:', finalUrl)
    
    // 创建临时标签页对象用于重复检测
    const tempTab: TabInfo = {
      id: undefined,
      url: finalUrl,
      title: finalUrl,
      favicon: undefined,
      windowId: undefined,
      index: 0,
      active: false,
      pinned: false
    }
    
    console.log('🔍 Starting duplicate detection for:', tempTab)
    console.log('📋 Current tabs before detection:', currentTabs.value.length)
    
    // 使用重复检测器检查是否存在重复页面
    const duplicates = await duplicateDetector.detectNewTabDuplicates(tempTab)
    
    console.log('🎯 Duplicate detection completed. Found:', duplicates.length, 'duplicates')
    console.log('📝 Duplicate details:', duplicates)
    
    if (duplicates.length > 0) {
      console.log('⚠️ Duplicates found! Showing confirmation dialog...')
      
      // 构建重复页面信息
      const duplicateInfo = duplicates.map(tab => `"${tab.title || tab.url}"`).join('、')
      const message = isI18nReady.value ? 
        t('notifications.duplicateDialog').replace('{info}', duplicateInfo) :
        `⚠️ 发现重复页面！\n\n重复页面：${duplicateInfo}\n\n❓ 您希望如何处理？\n\n✅ 点击"确定"：仍然打开新标签页\n❌ 点击"取消"：切换到现有页面`
      
      console.log('📢 Showing confirmation dialog:', message)
      const shouldCreateNew = confirm(message)
      console.log('👤 User choice - Create new tab:', shouldCreateNew)
      
      if (!shouldCreateNew) {
        // 切换到第一个重复页面
        const firstDuplicate = duplicates[0]
        if (firstDuplicate.id) {
          console.log('🔀 Switching to existing tab:', firstDuplicate.id)
          await chrome.tabs.update(firstDuplicate.id, { active: true })
          showNotification('info', 
            isI18nReady.value ? t('notifications.switchedToExisting') : '已切换到现有页面', 
            isI18nReady.value ? t('notifications.switchedToExistingMessage').replace('{title}', firstDuplicate.title || firstDuplicate.url) : `已切换到现有的标签页：${firstDuplicate.title || firstDuplicate.url}`)
          window.close()
          return
        }
      }
    } else {
      console.log('✅ No duplicates found, proceeding to create new tab')
    }
    
    // 创建新标签页
    console.log('📄 Creating new tab...')
    const newTab = await chrome.tabs.create({ url: finalUrl })
    console.log('✅ New tab created successfully:', newTab)
    
    if (duplicates.length > 0) {
      const warningMessage = isI18nReady.value ? 
        t('popup.tabActions.notifications.duplicateTabWarningMessage').replace('{count}', duplicates.length.toString()) :
        `⚠️ 已打开新标签页，但检测到 ${duplicates.length} 个重复页面`
      showNotification('warning', 
        isI18nReady.value ? t('popup.tabActions.notifications.duplicateTabWarning') : '已创建重复标签页', 
        warningMessage)
    } else {
      showNotification('success', 
        isI18nReady.value ? t('popup.tabActions.notifications.newTabCreated') : '新标签页已创建', 
        isI18nReady.value ? t('popup.tabActions.notifications.newTabCreatedMessage') : '✅ 已成功打开新的标签页')
    }
    
    window.close()
  } catch (error) {
    console.error('❌ Error in createNewTab:', error)
    showNotification('error', 
      isI18nReady.value ? t('popup.tabActions.notifications.createFailed') : '创建失败', 
      isI18nReady.value ? t('popup.tabActions.notifications.createFailedMessage') : '❌ 无法创建新标签页，请重试')
  }
}

async function duplicateCurrentTab() {
  try {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (currentTab && currentTab.url) {
      console.log('Duplicating current tab:', currentTab)
      
      // 创建临时标签页对象用于重复检测
      const tempTab: TabInfo = {
        id: undefined,
        url: currentTab.url,
        title: currentTab.title || currentTab.url,
        favicon: currentTab.favIconUrl,
        windowId: undefined,
        index: 0,
        active: false,
        pinned: false
      }
      
      // 检查是否存在重复页面
      const duplicates = await duplicateDetector.detectNewTabDuplicates(tempTab)
      console.log('Duplicate detection result for current tab:', duplicates)
      
      if (duplicates.length > 0) { // 包含当前标签页本身
        const duplicateInfo = duplicates.map(tab => `"${tab.title || tab.url}"`).join('、')
        const message = isI18nReady.value ?
          t('popup.tabActions.duplicateDialog.message').replace('{info}', duplicateInfo) :
          `⚠️ 检测到重复页面！\n\n当前页面与以下页面重复：\n${duplicateInfo}\n\n❓ 是否仍要复制当前标签页？\n\n✅ 点击"确定"：复制标签页\n❌ 点击"取消"：不复制`
        
        const shouldDuplicate = confirm(message)
        
        if (!shouldDuplicate) {
          showNotification('info', 
            isI18nReady.value ? t('popup.tabActions.notifications.operationCancelled') : '操作已取消', 
            isI18nReady.value ? t('popup.tabActions.notifications.operationCancelledMessage') : '已取消复制重复标签页')
          return
        }
      }
      
      // 创建重复标签页
      const newTab = await chrome.tabs.create({ url: currentTab.url })
      console.log('Tab duplicated:', newTab)
      
      if (duplicates.length > 0) {
        const warningMessage = isI18nReady.value ?
          t('popup.tabActions.notifications.duplicateTabCreatedMessage').replace('{count}', (duplicates.length + 1).toString()) :
          `⚠️ 已复制标签页，现在共有 ${duplicates.length + 1} 个相同页面`
        showNotification('warning', 
          isI18nReady.value ? t('popup.tabActions.notifications.duplicateTabCreated') : '已创建重复标签页', 
          warningMessage)
      } else {
        showNotification('success', 
          isI18nReady.value ? t('popup.tabActions.notifications.tabDuplicated') : '标签页已复制', 
          isI18nReady.value ? t('popup.tabActions.notifications.tabDuplicatedMessage') : '✅ 已成功复制当前标签页')
      }
      
      window.close()
    } else {
      showNotification('error', 
        isI18nReady.value ? t('popup.tabActions.notifications.duplicateFailed') : '复制失败', 
        isI18nReady.value ? t('popup.tabActions.notifications.duplicateFailedNoTab') : '❌ 无法获取当前标签页信息')
    }
  } catch (error) {
    console.error('Error duplicating tab:', error)
    showNotification('error', 
      isI18nReady.value ? t('popup.tabActions.notifications.duplicateFailed') : '复制失败', 
      isI18nReady.value ? t('popup.tabActions.notifications.duplicateFailedMessage') : '❌ 无法复制当前标签页，请重试')
  }
}

async function closeTab(tab: TabInfo) {
  try {
    if (tab.id) {
      console.log('🗑️ Closing tab:', tab.title)
      await chrome.tabs.remove(tab.id)
      const successMessage = isI18nReady.value ?
        t('popup.tabActions.notifications.tabClosedMessage').replace('{title}', truncateText(tab.title, 20)) :
        `已关闭 "${truncateText(tab.title, 20)}"`
      showNotification('success', 
        isI18nReady.value ? t('popup.tabActions.notifications.tabClosed') : '标签页已关闭', 
        successMessage)
      
      // 手动从本地列表中移除以立即更新UI
      const index = currentTabs.value.findIndex(t => t.id === tab.id)
      if (index > -1) {
        currentTabs.value.splice(index, 1)
        console.log('📝 Removed tab from local list, remaining:', currentTabs.value.length)
        
        // 更新统计
        stats.totalTabs = currentTabs.value.length
      }
    }
  } catch (error) {
    console.error('❌ Error closing tab:', error)
    showNotification('error', 
      isI18nReady.value ? t('popup.tabActions.notifications.closeFailed') : '关闭失败', 
      isI18nReady.value ? t('popup.tabActions.notifications.closeFailedMessage') : '无法关闭标签页')
  }
}

function showDuplicateNotificationInPopup(payload: any) {
  try {
    const { tab, duplicates, message } = payload
    console.log('🔔 Showing duplicate notification in popup:', payload)
    
    // 显示一个特殊的重复页面通知
    showNotification('warning', '检测到重复页面', message)
    
    // 同时在控制台提供详细信息
    console.log('⚠️ 重复页面详情:')
    console.log('当前页面:', tab)
    console.log('重复页面:', duplicates)
    
    // 可以考虑在这里添加更多的UI反馈，比如高亮显示重复的标签页
    
  } catch (error) {
    console.error('❌ Error showing duplicate notification in popup:', error)
  }
}

function showNotification(type: NotificationType['type'], title: string, message?: string) {
  notification.value = {
    id: Date.now().toString(),
    type,
    title,
    message,
    duration: type === 'warning' ? 5000 : 3000 // 警告通知显示更长时间
  }
  
  const duration = notification.value.duration
  setTimeout(() => {
    notification.value = null
  }, duration)
}

// 语言切换处理
async function handleLanguageToggle() {
  try {
    await toggleLanguage()
    showNotification('success', t('notifications.languageChanged'))
  } catch (error) {
    console.error('Error toggling language:', error)
    showNotification('error', 'Failed to switch language')
  }
}

// 设置语言变化监听器
function setupLanguageListener() {
  try {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'LANGUAGE_CHANGED') {
        console.log('Received language change message:', message.language)
        // 更新当前语言状态（不需要保存，因为设置页面已经保存了）
        currentLanguage.value = message.language
        // 重新初始化语言
        initLanguage()
      }
    })
  } catch (error) {
    console.log('Chrome runtime not available for language listener')
  }
}

function getSortButtonTitle() {
  try {
    // 确保tabSortMode有值
    const sortMode = tabSortMode.value || 'time'
    
    // 确保tabSortLabels和相应的属性存在
    const sortLabels = tabSortLabels.value
    if (!sortLabels || typeof sortLabels !== 'object') {
      return '当前排序: 排序'
    }
    
    const currentSortText = isI18nReady.value ? (t('popup.tabs.currentSort') || '当前排序') : '当前排序'
    const sortLabel = sortLabels[sortMode] || '排序'
    return `${currentSortText}: ${sortLabel}`
  } catch (error) {
    console.error('Error in getSortButtonTitle:', error)
    return '当前排序: 排序' // 默认标题
  }
}

// 新增：显示工作空间标签页对话框
const showWorkspaceTabsDialogVisible = ref(false)
const selectedWorkspaceForTabs = ref<Workspace | null>(null)

function showWorkspaceTabsDialog(workspace: Workspace) {
  selectedWorkspaceForTabs.value = workspace
  showWorkspaceTabsDialogVisible.value = true
}

async function removeTabFromWorkspace(workspace: Workspace, tab: TabInfo) {
  const confirmText = isI18nReady.value ?
    t('popup.workspaces.tabsDialog.removeConfirm').replace('{title}', tab.title) :
    `确定要从分组中移除 "${tab.title}" 吗？`
  
  if (confirm(confirmText)) {
    const success = await workspaceManager.removeTabFromWorkspace(workspace.id, tab.url)
    if (success) {
      // 重新加载工作空间数据
      const newWorkspaces = workspaceManager.getAllWorkspaces()
      workspaces.value.splice(0, workspaces.value.length, ...newWorkspaces)
      
      // 更新对话框中显示的工作空间数据
      const updatedWorkspace = newWorkspaces.find(w => w.id === workspace.id)
      if (updatedWorkspace) {
        selectedWorkspaceForTabs.value = updatedWorkspace
      }
      
      const successMessage = isI18nReady.value ? 
        t('popup.workspaces.notifications.removeTabSuccessMessage').replace('{title}', tab.title) : 
        `已从分组中移除 "${tab.title}"`
      showNotification('success', 
        isI18nReady.value ? t('popup.workspaces.notifications.removeTabSuccess') : '移除成功', 
        successMessage)
    } else {
      showNotification('error', 
        isI18nReady.value ? t('popup.workspaces.notifications.removeTabFailed') : '移除失败', 
        isI18nReady.value ? t('popup.workspaces.notifications.removeTabFailedMessage') : '无法从分组中移除标签')
    }
  }
}

async function openTabFromWorkspace(tab: TabInfo) {
  try {
    // 尝试找到现有的标签页
    const tabs = await chrome.tabs.query({ url: tab.url })
    if (tabs.length > 0) {
      // 如果标签页已存在，激活它
      await chrome.tabs.update(tabs[0].id!, { active: true })
    } else {
      // 如果不存在，创建新标签页
      await chrome.tabs.create({ url: tab.url, active: true })
    }
    window.close()
  } catch (error) {
    showNotification('error', 
      isI18nReady.value ? t('popup.workspaces.notifications.openTabFailed') : '打开失败', 
      isI18nReady.value ? t('popup.workspaces.notifications.openTabFailedMessage') : '无法打开标签页')
  }
}

function getWorkspaceDialogDescription() {
  if (!selectedWorkspaceForTabs.value) {
    return isI18nReady.value ? 
      (t('popup.workspaces.tabsDialog.description') || '分组标签页') : 
      '分组标签页'
  }
  
  const name = selectedWorkspaceForTabs.value.name
  if (isI18nReady.value) {
    try {
      const template = t('popup.workspaces.tabsDialog.description') || '分组 "{name}" 中的标签页'
      return template.replace('{name}', name)
    } catch (error) {
      return `分组 "${name}" 中的标签页`
    }
  } else {
    return `分组 "${name}" 中的标签页`
  }
}

async function deleteWorkspace(workspace: Workspace) {
  const confirmTitle = isI18nReady.value ?
    t('popup.workspaces.notifications.deleteConfirm').replace('{name}', workspace.name) :
    `确定要删除分组 "${workspace.name}" 吗？`
  
  const confirmMessage = isI18nReady.value ?
    t('popup.workspaces.notifications.deleteConfirmMessage') :
    '删除后分组内的所有标签页记录将丢失，此操作无法撤销。'
  
  const fullConfirmText = `${confirmTitle}\n\n${confirmMessage}`
  
  if (confirm(fullConfirmText)) {
    try {
      const success = await workspaceManager.deleteWorkspace(workspace.id)
      if (success) {
        // 重新加载工作空间数据
        const newWorkspaces = workspaceManager.getAllWorkspaces()
        workspaces.value.splice(0, workspaces.value.length, ...newWorkspaces)
        
        const successMessage = isI18nReady.value ? 
          t('popup.workspaces.notifications.deleteSuccessMessage').replace('{name}', workspace.name) : 
          `分组 "${workspace.name}" 已删除`
        showNotification('success', 
          isI18nReady.value ? t('popup.workspaces.notifications.deleteSuccess') : '删除成功', 
          successMessage)
      } else {
        showNotification('error', 
          isI18nReady.value ? t('popup.workspaces.notifications.deleteFailed') : '删除失败', 
          isI18nReady.value ? t('popup.workspaces.notifications.deleteFailedMessage') : '无法删除分组')
      }
    } catch (error) {
      console.error('Error deleting workspace:', error)
      showNotification('error', 
        isI18nReady.value ? t('popup.workspaces.notifications.deleteFailed') : '删除失败', 
        isI18nReady.value ? t('popup.workspaces.notifications.deleteFailedMessage') : '无法删除分组')
    }
  }
}

async function deleteSnapshot(snapshot: any) {
  const confirmTitle = isI18nReady.value ?
    t('popup.systemActions.notifications.deleteSnapshotConfirm').replace('{name}', snapshot.name) :
    `确定要删除快照 "${snapshot.name}" 吗？`
  
  const confirmMessage = isI18nReady.value ?
    t('popup.systemActions.notifications.deleteSnapshotConfirmMessage') :
    '删除后快照将无法恢复，此操作无法撤销。'
  
  const fullConfirmText = `${confirmTitle}\n\n${confirmMessage}`
  
  if (confirm(fullConfirmText)) {
    try {
      const success = await syncManager.deleteSnapshot(snapshot.id)
      if (success) {
        // 重新加载快照列表
        const newSnapshots = await syncManager.getSnapshotList()
        availableSnapshots.value = newSnapshots.slice(0, 10) // 限制显示最新10个
        
        const successMessage = isI18nReady.value ? 
          `快照 "${snapshot.name}" 已删除` : 
          `快照 "${snapshot.name}" 已删除`
        showNotification('success', 
          isI18nReady.value ? t('popup.systemActions.notifications.snapshotDeleted') : '快照已删除', 
          successMessage)
      } else {
        showNotification('error', 
          isI18nReady.value ? t('popup.systemActions.notifications.deleteSnapshotFailed') : '删除失败', 
          isI18nReady.value ? t('popup.systemActions.notifications.deleteSnapshotFailedMessage') : '无法删除快照')
      }
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      showNotification('error', 
        isI18nReady.value ? t('popup.systemActions.notifications.deleteSnapshotFailed') : '删除失败', 
        isI18nReady.value ? t('popup.systemActions.notifications.deleteSnapshotFailedMessage') : '无法删除快照')
    }
  }
}
</script>

