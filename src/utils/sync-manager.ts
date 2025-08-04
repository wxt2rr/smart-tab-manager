import type { TabInfo, WindowInfo, Snapshot, Settings } from '@/types'
import { storage, settings } from './storage'
import { getTranslation } from './i18n'

/**
 * 同步管理器 - 处理标签页自动同步和恢复
 */
export class SyncManager {
  private static instance: SyncManager
  private syncTimer: NodeJS.Timeout | null = null
  private maxVersions = 20
  private isAutoSyncEnabled = true
  private syncInterval = 5 * 60 * 1000 // 5分钟
  private lastSyncTime = 0
  private isRestoring = false

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager()
    }
    return SyncManager.instance
  }

  constructor() {
    this.loadSettings()
    this.detectCrashAndRestore()
  }

  /**
   * 加载设置
   */
  private async loadSettings(): Promise<void> {
    const userSettings = await settings.getSettings()
    this.isAutoSyncEnabled = userSettings.autoSync.enabled
    this.syncInterval = userSettings.autoSync.interval
    
    if (this.isAutoSyncEnabled) {
      this.startAutoSync()
    }
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(() => {
      if (!this.isRestoring) {
        this.createSnapshot('auto')
      }
    }, this.syncInterval)

    console.log(`Auto sync started with interval: ${this.syncInterval}ms`)
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  /**
   * 创建快照
   */
  async createSnapshot(type: 'auto' | 'manual' = 'manual', name = ''): Promise<Snapshot | null> {
    try {
      const windows = await this.getAllWindows()
      const timestamp = Date.now()
      
      // 生成多语言的快照名称
      let snapshotName = name
      if (!name) {
        const prefix = type === 'auto' ? 
          getTranslation('popup.systemActions.snapshotNames.autoPrefix', '自动保存') : 
          getTranslation('popup.systemActions.snapshotNames.manualPrefix', '手动快照')
        snapshotName = `${prefix}_${new Date(timestamp).toLocaleString()}`
      }
      
      const snapshot: Snapshot = {
        id: `${type}_${timestamp}`,
        name: snapshotName,
        timestamp,
        type,
        windows,
        metadata: {
          totalTabs: windows.reduce((sum, win) => sum + win.tabs.length, 0),
          totalWindows: windows.length,
          userAgent: navigator.userAgent
        }
      }

      await this.saveSnapshot(snapshot)
      await this.cleanupOldSnapshots()
      
      this.lastSyncTime = timestamp
      console.log(`Snapshot created: ${snapshot.id}`)
      
      return snapshot
    } catch (error) {
      console.error('Error creating snapshot:', error)
      return null
    }
  }

  /**
   * 保存快照到存储
   */
  private async saveSnapshot(snapshot: Snapshot): Promise<boolean> {
    try {
      const snapshots = await this.getAllSnapshots()
      snapshots[snapshot.id] = snapshot
      return await storage.set('snapshots', snapshots)
    } catch (error) {
      console.error('Error saving snapshot:', error)
      return false
    }
  }

  /**
   * 获取所有快照
   */
  async getAllSnapshots(): Promise<Record<string, Snapshot>> {
    try {
      const snapshots = await storage.get<Record<string, Snapshot>>('snapshots')
      return snapshots || {}
    } catch (error) {
      console.error('Error getting snapshots:', error)
      return {}
    }
  }

  /**
   * 获取快照列表（按时间排序）
   */
  async getSnapshotList(): Promise<Snapshot[]> {
    const snapshots = await this.getAllSnapshots()
    return Object.values(snapshots).sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * 获取指定快照
   */
  async getSnapshot(snapshotId: string): Promise<Snapshot | null> {
    const snapshots = await this.getAllSnapshots()
    return snapshots[snapshotId] || null
  }

  /**
   * 删除快照
   */
  async deleteSnapshot(snapshotId: string): Promise<boolean> {
    try {
      const snapshots = await this.getAllSnapshots()
      delete snapshots[snapshotId]
      return await storage.set('snapshots', snapshots)
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      return false
    }
  }

  /**
   * 恢复快照
   */
  async restoreSnapshot(
    snapshotId: string, 
    options: {
      openInNewWindow?: boolean
      selectedTabs?: string[]
      selectedWindows?: number[]
      closeCurrentTabs?: boolean
    } = {}
  ): Promise<boolean> {
    try {
      this.isRestoring = true
      const snapshot = await this.getSnapshot(snapshotId)
      
      if (!snapshot) {
        throw new Error('快照不存在')
      }

      const { 
        openInNewWindow = false, 
        selectedTabs = null, 
        selectedWindows = null,
        closeCurrentTabs = false 
      } = options

      // 如果需要关闭当前标签页
      if (closeCurrentTabs) {
        await this.closeAllTabs()
      }

      // 恢复窗口和标签页
      for (const windowInfo of snapshot.windows) {
        // 如果指定了特定窗口，跳过其他窗口
        if (selectedWindows && !selectedWindows.includes(windowInfo.id)) {
          continue
        }

        const tabsToRestore = selectedTabs 
          ? windowInfo.tabs.filter(tab => selectedTabs.includes(tab.url))
          : windowInfo.tabs

        if (tabsToRestore.length === 0) continue

        if (openInNewWindow || snapshot.windows.indexOf(windowInfo) === 0) {
          await this.createNewWindowWithTabs(tabsToRestore, windowInfo)
        } else {
          await this.restoreTabsInCurrentWindow(tabsToRestore)
        }
      }

      console.log(`Snapshot restored: ${snapshotId}`)
      return true
    } catch (error) {
      console.error('Error restoring snapshot:', error)
      return false
    } finally {
      this.isRestoring = false
    }
  }

  /**
   * 在新窗口中创建标签页
   */
  private async createNewWindowWithTabs(tabs: TabInfo[], windowInfo: WindowInfo): Promise<void> {
    if (tabs.length === 0) return

    try {
      // 创建新窗口
      const newWindow = await chrome.windows.create({
        url: tabs[0].url,
        type: windowInfo.type,
        state: windowInfo.state === 'fullscreen' ? 'maximized' : windowInfo.state,
        focused: windowInfo.focused
      })

      // 添加其余标签页
      for (let i = 1; i < tabs.length; i++) {
        const tab = tabs[i]
        await chrome.tabs.create({
          windowId: newWindow.id,
          url: tab.url,
          index: tab.index,
          pinned: tab.pinned,
          active: false
        })
      }

      // 激活原本活跃的标签页
      const activeTab = tabs.find(tab => tab.active)
      if (activeTab && newWindow.tabs) {
        const restoredTab = newWindow.tabs.find(tab => tab.url === activeTab.url)
        if (restoredTab) {
          await chrome.tabs.update(restoredTab.id!, { active: true })
        }
      }
    } catch (error) {
      console.error('Error creating window with tabs:', error)
    }
  }

  /**
   * 在当前窗口中恢复标签页
   */
  private async restoreTabsInCurrentWindow(tabs: TabInfo[]): Promise<void> {
    try {
      const currentWindow = await chrome.windows.getCurrent()
      
      for (const tab of tabs) {
        await chrome.tabs.create({
          windowId: currentWindow.id,
          url: tab.url,
          index: tab.index,
          pinned: tab.pinned,
          active: tab.active
        })
      }
    } catch (error) {
      console.error('Error restoring tabs in current window:', error)
    }
  }

  /**
   * 关闭所有标签页
   */
  private async closeAllTabs(): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({})
      const tabIds = tabs
        .filter(tab => !tab.pinned) // 保留固定标签页
        .map(tab => tab.id!)
        .filter(id => id !== undefined)
        
      if (tabIds.length > 0) {
        await chrome.tabs.remove(tabIds)
      }
    } catch (error) {
      console.error('Error closing all tabs:', error)
    }
  }

  /**
   * 获取所有窗口信息
   */
  private async getAllWindows(): Promise<WindowInfo[]> {
    try {
      const windows = await chrome.windows.getAll({ populate: true })
      return windows.map(window => ({
        id: window.id!,
        focused: window.focused!,
        type: window.type!,
        state: window.state!,
        tabs: window.tabs?.map(tab => ({
          id: tab.id,
          url: tab.url || '',
          title: tab.title || '',
          favicon: tab.favIconUrl,
          windowId: tab.windowId,
          index: tab.index,
          active: tab.active,
          pinned: tab.pinned
        })) || []
      }))
    } catch (error) {
      console.error('Error getting all windows:', error)
      return []
    }
  }

  /**
   * 清理旧快照
   */
  private async cleanupOldSnapshots(): Promise<void> {
    try {
      const snapshots = await this.getAllSnapshots()
      const snapshotList = Object.values(snapshots)
        .filter(s => s.type === 'auto') // 只清理自动快照
        .sort((a, b) => b.timestamp - a.timestamp)

      if (snapshotList.length > this.maxVersions) {
        const toDelete = snapshotList.slice(this.maxVersions)
        for (const snapshot of toDelete) {
          delete snapshots[snapshot.id]
        }
        await storage.set('snapshots', snapshots)
        console.log(`Cleaned up ${toDelete.length} old snapshots`)
      }
    } catch (error) {
      console.error('Error cleaning up old snapshots:', error)
    }
  }

  /**
   * 检测崩溃并提供恢复选项
   */
  private async detectCrashAndRestore(): Promise<void> {
    try {
      const lastSession = await storage.get<{
        timestamp: number
        sessionId: string
        tabCount: number
      }>('lastSession')

      const currentTime = Date.now()
      const timeDiff = lastSession ? currentTime - lastSession.timestamp : 0
      
      // 如果超过10分钟没有正常关闭，视为异常
      if (lastSession && timeDiff > 10 * 60 * 1000) {
        console.log('Detected potential crash, recovery options available')
        
        // 触发恢复界面
        chrome.runtime.sendMessage({
          type: 'crash-detected',
          payload: {
            lastSession,
            timeDiff,
            hasRecoveryData: true
          }
        })
      }

      // 更新当前会话信息
      await this.updateCurrentSession()
    } catch (error) {
      console.error('Error detecting crash:', error)
    }
  }

  /**
   * 更新当前会话信息
   */
  private async updateCurrentSession(): Promise<void> {
    try {
      const currentTabs = await chrome.tabs.query({})
      const sessionData = {
        timestamp: Date.now(),
        sessionId: `session_${Date.now()}`,
        tabCount: currentTabs.length
      }
      
      await storage.set('lastSession', sessionData)
    } catch (error) {
      console.error('Error updating current session:', error)
    }
  }

  /**
   * 获取恢复建议
   */
  async getRecoveryRecommendations(): Promise<{
    recommended: Snapshot[]
    recent: Snapshot[]
    frequent: Snapshot[]
  }> {
    const snapshots = await this.getSnapshotList()
    const now = Date.now()
    
    // 推荐的快照（最近2小时内的）
    const recommended = snapshots
      .filter(s => now - s.timestamp < 2 * 60 * 60 * 1000)
      .slice(0, 3)

    // 最近的快照
    const recent = snapshots.slice(0, 5)

    // 频繁使用的快照（根据标签页数量和类型判断）
    const frequent = snapshots
      .filter(s => s.metadata && s.metadata.totalTabs > 5)
      .slice(0, 3)

    return { recommended, recent, frequent }
  }

  /**
   * 比较两个快照的差异
   */
  async compareSnapshots(snapshot1Id: string, snapshot2Id: string): Promise<{
    added: TabInfo[]
    removed: TabInfo[]
    common: TabInfo[]
  }> {
    const snapshot1 = await this.getSnapshot(snapshot1Id)
    const snapshot2 = await this.getSnapshot(snapshot2Id)

    if (!snapshot1 || !snapshot2) {
      return { added: [], removed: [], common: [] }
    }

    const tabs1 = snapshot1.windows.flatMap(w => w.tabs)
    const tabs2 = snapshot2.windows.flatMap(w => w.tabs)

    const urls1 = new Set(tabs1.map(t => t.url))
    const urls2 = new Set(tabs2.map(t => t.url))

    const added = tabs2.filter(t => !urls1.has(t.url))
    const removed = tabs1.filter(t => !urls2.has(t.url))
    const common = tabs1.filter(t => urls2.has(t.url))

    return { added, removed, common }
  }

  /**
   * 导出快照数据
   */
  async exportSnapshots(): Promise<string> {
    const snapshots = await this.getAllSnapshots()
    return JSON.stringify(snapshots, null, 2)
  }

  /**
   * 导入快照数据
   */
  async importSnapshots(data: string): Promise<boolean> {
    try {
      const importedSnapshots = JSON.parse(data)
      const currentSnapshots = await this.getAllSnapshots()
      
      // 合并快照数据
      const mergedSnapshots = { ...currentSnapshots, ...importedSnapshots }
      return await storage.set('snapshots', mergedSnapshots)
    } catch (error) {
      console.error('Error importing snapshots:', error)
      return false
    }
  }

  /**
   * 获取同步统计信息
   */
  async getSyncStats(): Promise<{
    totalSnapshots: number
    autoSnapshots: number
    manualSnapshots: number
    totalTabs: number
    lastSyncTime: number
    storageUsed: number
  }> {
    const snapshots = await this.getAllSnapshots()
    const snapshotList = Object.values(snapshots)
    
    const autoSnapshots = snapshotList.filter(s => s.type === 'auto').length
    const manualSnapshots = snapshotList.filter(s => s.type === 'manual').length
    const totalTabs = snapshotList.reduce((sum, s) => sum + (s.metadata?.totalTabs || 0), 0)
    
    const { used: storageUsed } = await storage.getStorageUsage()

    return {
      totalSnapshots: snapshotList.length,
      autoSnapshots,
      manualSnapshots,
      totalTabs,
      lastSyncTime: this.lastSyncTime,
      storageUsed
    }
  }
}

// 导出单例实例
export const syncManager = SyncManager.getInstance()