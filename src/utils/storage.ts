import type { Settings, Workspace, Snapshot, Stats, StorageKeys } from '@/types'

/**
 * 存储管理器 - 统一管理Chrome Extension存储
 */
export class StorageManager {
  private static instance: StorageManager
  private cache = new Map<string, any>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  /**
   * 获取存储数据
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // 检查缓存
      const cached = this.cache.get(key)
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data
      }

      const result = await chrome.storage.local.get([key])
      const data = result[key] || null

      // 更新缓存
      if (data) {
        this.cache.set(key, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      console.error(`Error getting storage key ${key}:`, error)
      return null
    }
  }

  /**
   * 设置存储数据
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await chrome.storage.local.set({ [key]: value })
      
      // 更新缓存
      this.cache.set(key, {
        data: value,
        timestamp: Date.now()
      })

      return true
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error)
      return false
    }
  }

  /**
   * 删除存储数据
   */
  async remove(key: string): Promise<boolean> {
    try {
      await chrome.storage.local.remove(key)
      this.cache.delete(key)
      return true
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error)
      return false
    }
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 获取所有存储的键
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const result = await chrome.storage.local.get(null)
      return Object.keys(result)
    } catch (error) {
      console.error('Error getting all storage keys:', error)
      return []
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    try {
      const usage = await chrome.storage.local.getBytesInUse()
      const quota = chrome.storage.local.QUOTA_BYTES
      return { used: usage, quota }
    } catch (error) {
      console.error('Error getting storage usage:', error)
      return { used: 0, quota: 0 }
    }
  }
}

/**
 * 设置管理
 */
export class SettingsManager {
  private storage = StorageManager.getInstance()

  private defaultSettings: Settings = {
    autoSync: {
      enabled: true,
      interval: 5 * 60 * 1000 // 5分钟
    },
    duplicateDetection: {
      enabled: true,
      smartMatch: true,
      threshold: 0.8,
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
  }

  async getSettings(): Promise<Settings> {
    const settings = await this.storage.get<Settings>('settings')
    return settings ? { ...this.defaultSettings, ...settings } : this.defaultSettings
  }

  async updateSettings(updates: Partial<Settings>): Promise<boolean> {
    const currentSettings = await this.getSettings()
    const newSettings = this.deepMerge(currentSettings, updates)
    return await this.storage.set('settings', newSettings)
  }

  async resetSettings(): Promise<boolean> {
    return await this.storage.set('settings', this.defaultSettings)
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
    return result
  }
}

/**
 * 数据库版本管理
 */
export class MigrationManager {
  private storage = StorageManager.getInstance()
  private readonly CURRENT_VERSION = '1.0.0'

  async checkAndMigrate(): Promise<void> {
    const version = await this.storage.get<string>('version')
    
    if (!version) {
      // 首次安装
      await this.storage.set('version', this.CURRENT_VERSION)
      await this.initializeDefaultData()
    } else if (version !== this.CURRENT_VERSION) {
      // 需要迁移
      await this.migrate(version, this.CURRENT_VERSION)
      await this.storage.set('version', this.CURRENT_VERSION)
    }
  }

  private async initializeDefaultData(): Promise<void> {
    const settingsManager = new SettingsManager()
    await settingsManager.resetSettings()
    
    // 初始化统计数据
    const initialStats: Stats = {
      totalTabs: 0,
      duplicateTabs: 0,
      totalWorkspaces: 0,
      lastSyncTime: Date.now(),
      sessionsCreated: 0,
      tabsSaved: 0
    }
    await this.storage.set('stats', initialStats)
  }

  private async migrate(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`Migrating from ${fromVersion} to ${toVersion}`)
    // 根据版本号执行相应的迁移逻辑
  }
}

// 导出单例实例
export const storage = StorageManager.getInstance()
export const settings = new SettingsManager()
export const migration = new MigrationManager()