// 标签页相关类型
export interface TabInfo {
  id?: number
  url: string
  title: string
  favicon?: string
  windowId?: number
  index?: number
  active?: boolean
  pinned?: boolean
  addedAt?: number
}

// 窗口信息
export interface WindowInfo {
  id: number
  focused: boolean
  type: chrome.windows.WindowType
  state: chrome.windows.WindowState
  tabs: TabInfo[]
}

// 快照数据结构
export interface Snapshot {
  id: string
  name: string
  timestamp: number
  type: 'auto' | 'manual'
  windows: WindowInfo[]
  metadata?: {
    totalTabs: number
    totalWindows: number
    userAgent?: string
  }
}

// 工作空间/分组
export interface Workspace {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  tabs: TabInfo[]
  createdAt: number
  updatedAt: number
  isActive?: boolean
  order?: number
}

// 重复检测结果
export interface DuplicateGroup {
  urls: string[]
  tabs: TabInfo[]
  similarity: number
  reason: 'exact' | 'domain' | 'title' | 'smart'
}

// 设置配置
export interface Settings {
  autoSync: {
    enabled: boolean
    interval: number // 毫秒
  }
  duplicateDetection: {
    enabled: boolean
    rules: {
      exactMatch: boolean // 完全匹配
      domainMatch: boolean // 域名+路径匹配
      titleMatch: boolean // 标题相似度匹配
      smartMatch: boolean // 智能综合匹配
    }
    threshold: number
    whitelist: string[]
  }
  ui: {
    theme: 'light' | 'dark' | 'auto'
    language: string
    compactMode: boolean
  }
  workspaces: {
    showActivityIndicator: boolean
    autoSwitchOnTime: boolean
    maxRecentWorkspaces: number
  }
  shortcuts: {
    [key: string]: string
  }
}

// 消息类型
export interface Message {
  type: string
  payload?: any
  timestamp?: number
}

// 统计数据
export interface Stats {
  totalTabs: number
  duplicateTabs: number
  totalWorkspaces: number
  lastSyncTime: number
  sessionsCreated: number
  tabsSaved: number
}

// 搜索建议
export interface SearchSuggestion {
  id: string
  type: 'command' | 'tab' | 'workspace' | 'history'
  title: string
  description?: string
  icon?: string
  category: string
  action: () => void
  shortcut?: string
  searchKeywords?: string
}

// 活动记录
export interface Activity {
  id: string
  type: 'tab_opened' | 'tab_closed' | 'workspace_switched' | 'session_restored'
  timestamp: number
  data: any
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 事件类型
export type EventType = 
  | 'tab:created'
  | 'tab:removed' 
  | 'tab:updated'
  | 'tab:activated'
  | 'window:created'
  | 'window:removed'
  | 'duplicate:detected'
  | 'workspace:switched'
  | 'snapshot:created'
  | 'settings:updated'

// 存储键名
export enum StorageKeys {
  SETTINGS = 'settings',
  WORKSPACES = 'workspaces',
  SNAPSHOTS = 'snapshots',
  STATS = 'stats', 
  ACTIVITIES = 'activities',
  LAST_SESSION = 'lastSession',
  USER_PREFERENCES = 'userPreferences'
}

// 主题相关
export type Theme = 'light' | 'dark'

// 命令类型
export interface Command {
  id: string
  title: string
  description?: string
  icon?: string
  shortcut?: string
  category: 'workspace' | 'tab' | 'session' | 'settings'
  action: () => Promise<void> | void
}

// 拖拽相关
export interface DragData {
  type: 'tab' | 'workspace'
  data: TabInfo | Workspace
  sourceIndex: number
}

// 通知类型
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    handler: () => void
  }
}