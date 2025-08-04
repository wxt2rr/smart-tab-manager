import type { Workspace, TabInfo, Settings } from '@/types'
import { storage, settings } from './storage'

/**
 * 工作空间管理器
 */
export class WorkspaceManager {
  private static instance: WorkspaceManager
  private workspaces = new Map<string, Workspace>()
  private activeWorkspaceId: string | null = null
  private recentWorkspaces: string[] = []
  private maxRecentWorkspaces = 5

  public static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager()
    }
    return WorkspaceManager.instance
  }

  constructor() {
    this.loadWorkspaces()
    this.loadSettings()
  }

  /**
   * 加载工作空间数据
   */
  private async loadWorkspaces(): Promise<void> {
    try {
      const workspacesData = await storage.get<Record<string, Workspace>>('workspaces')
      if (workspacesData) {
        this.workspaces.clear()
        Object.values(workspacesData).forEach(workspace => {
          this.workspaces.set(workspace.id, workspace)
        })
      }

      // 加载活跃工作空间
      const activeId = await storage.get<string>('activeWorkspaceId')
      this.activeWorkspaceId = activeId

      // 加载最近使用的工作空间
      const recent = await storage.get<string[]>('recentWorkspaces')
      this.recentWorkspaces = recent || []
    } catch (error) {
      console.error('Error loading workspaces:', error)
    }
  }

  /**
   * 加载设置
   */
  private async loadSettings(): Promise<void> {
    const userSettings = await settings.getSettings()
    this.maxRecentWorkspaces = userSettings.workspaces.maxRecentWorkspaces
  }

  /**
   * 保存工作空间到存储
   */
  private async saveWorkspaces(): Promise<boolean> {
    try {
      const workspacesObject: Record<string, Workspace> = {}
      this.workspaces.forEach((workspace, id) => {
        workspacesObject[id] = workspace
      })
      
      return await storage.set('workspaces', workspacesObject)
    } catch (error) {
      console.error('Error saving workspaces:', error)
      return false
    }
  }

  /**
   * 创建新工作空间
   */
  async createWorkspace(workspaceData: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
    const workspace: Workspace = {
      id: this.generateId(),
      name: workspaceData.name,
      description: workspaceData.description || '',
      icon: workspaceData.icon || '📁',
      color: workspaceData.color || '#007AFF',
      tabs: workspaceData.tabs || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: workspaceData.order || this.workspaces.size
    }

    this.workspaces.set(workspace.id, workspace)
    await this.saveWorkspaces()
    
    console.log(`Created workspace: ${workspace.name}`)
    return workspace
  }

  /**
   * 更新工作空间
   */
  async updateWorkspace(workspaceId: string, updates: Partial<Workspace>): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) {
      console.error(`Workspace not found: ${workspaceId}`)
      return false
    }

    const updatedWorkspace = {
      ...workspace,
      ...updates,
      updatedAt: Date.now()
    }

    this.workspaces.set(workspaceId, updatedWorkspace)
    await this.saveWorkspaces()
    
    console.log(`Updated workspace: ${workspaceId}`)
    return true
  }

  /**
   * 删除工作空间
   */
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    if (!this.workspaces.has(workspaceId)) {
      return false
    }

    this.workspaces.delete(workspaceId)
    
    // 如果删除的是活跃工作空间，清除活跃状态
    if (this.activeWorkspaceId === workspaceId) {
      this.activeWorkspaceId = null
      await storage.set('activeWorkspaceId', null)
    }

    // 从最近使用列表中移除
    this.recentWorkspaces = this.recentWorkspaces.filter(id => id !== workspaceId)
    await storage.set('recentWorkspaces', this.recentWorkspaces)

    await this.saveWorkspaces()
    console.log(`Deleted workspace: ${workspaceId}`)
    return true
  }

  /**
   * 获取所有工作空间
   */
  getAllWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values()).sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * 获取指定工作空间
   */
  getWorkspace(workspaceId: string): Workspace | null {
    return this.workspaces.get(workspaceId) || null
  }

  /**
   * 获取活跃工作空间
   */
  getActiveWorkspace(): Workspace | null {
    return this.activeWorkspaceId ? this.workspaces.get(this.activeWorkspaceId) || null : null
  }

  /**
   * 设置活跃工作空间
   */
  async setActiveWorkspace(workspaceId: string | null): Promise<boolean> {
    if (workspaceId && !this.workspaces.has(workspaceId)) {
      return false
    }

    this.activeWorkspaceId = workspaceId
    await storage.set('activeWorkspaceId', workspaceId)

    // 更新最近使用列表
    if (workspaceId) {
      await this.addToRecentWorkspaces(workspaceId)
    }

    return true
  }

  /**
   * 添加标签页到工作空间
   */
  async addTabToWorkspace(workspaceId: string, tabData: TabInfo): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) {
      return false
    }

    const tabInfo: TabInfo = {
      url: tabData.url,
      title: tabData.title,
      favicon: tabData.favicon,
      addedAt: Date.now()
    }

    // 检查是否已存在
    const exists = workspace.tabs.some(tab => tab.url === tabInfo.url)
    if (!exists) {
      workspace.tabs.push(tabInfo)
      workspace.updatedAt = Date.now()
      await this.saveWorkspaces()
      console.log(`Added tab to workspace ${workspaceId}: ${tabInfo.title}`)
      return true
    } else {
      console.log(`Tab already exists in workspace ${workspaceId}: ${tabInfo.title}`)
      return false
    }
  }

  /**
   * 从工作空间移除标签页
   */
  async removeTabFromWorkspace(workspaceId: string, tabUrl: string): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) {
      return false
    }

    const initialLength = workspace.tabs.length
    workspace.tabs = workspace.tabs.filter(tab => tab.url !== tabUrl)
    
    if (workspace.tabs.length < initialLength) {
      workspace.updatedAt = Date.now()
      await this.saveWorkspaces()
      console.log(`Removed tab from workspace ${workspaceId}: ${tabUrl}`)
      return true
    }

    return false
  }

  /**
   * 批量添加标签页到工作空间
   */
  async addTabsToWorkspace(workspaceId: string, tabs: TabInfo[]): Promise<number> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) {
      return 0
    }

    let addedCount = 0
    const existingUrls = new Set(workspace.tabs.map(tab => tab.url))

    for (const tab of tabs) {
      if (!existingUrls.has(tab.url)) {
        workspace.tabs.push({
          ...tab,
          addedAt: Date.now()
        })
        existingUrls.add(tab.url)
        addedCount++
      }
    }

    if (addedCount > 0) {
      workspace.updatedAt = Date.now()
      await this.saveWorkspaces()
      console.log(`Added ${addedCount} tabs to workspace ${workspaceId}`)
    }

    return addedCount
  }

  /**
   * 打开工作空间
   */
  async openWorkspace(
    workspaceId: string, 
    options: {
      openInNewWindow?: boolean
      deduplicateExisting?: boolean
      closeCurrentTabs?: boolean
    } = {}
  ): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace || workspace.tabs.length === 0) {
      return false
    }

    const { 
      openInNewWindow = false, 
      deduplicateExisting = true,
      closeCurrentTabs = false 
    } = options

    try {
      // 关闭当前标签页（如果需要）
      if (closeCurrentTabs) {
        const currentTabs = await chrome.tabs.query({ currentWindow: true })
        const tabIds = currentTabs
          .filter(tab => !tab.pinned)
          .map(tab => tab.id!)
          .filter(id => id !== undefined)
        
        if (tabIds.length > 0) {
          await chrome.tabs.remove(tabIds)
        }
      }

      let targetWindowId: number | undefined

      if (openInNewWindow) {
        const newWindow = await chrome.windows.create({
          url: workspace.tabs[0].url,
          focused: true
        })
        targetWindowId = newWindow.id
        
        // 创建其余标签页
        for (let i = 1; i < workspace.tabs.length; i++) {
          const tab = workspace.tabs[i]
          
          // 检查去重
          if (deduplicateExisting) {
            const existingTabs = await chrome.tabs.query({ url: tab.url })
            if (existingTabs.length > 0) {
              await chrome.tabs.update(existingTabs[0].id!, { active: true })
              continue
            }
          }

          await chrome.tabs.create({
            url: tab.url,
            windowId: targetWindowId,
            active: false
          })
        }
      } else {
        // 在当前窗口打开
        for (const tab of workspace.tabs) {
          // 检查去重
          if (deduplicateExisting) {
            const existingTabs = await chrome.tabs.query({ url: tab.url })
            if (existingTabs.length > 0) {
              await chrome.tabs.update(existingTabs[0].id!, { active: true })
              continue
            }
          }

          await chrome.tabs.create({
            url: tab.url,
            active: false
          })
        }
      }

      // 设置为活跃工作空间
      await this.setActiveWorkspace(workspaceId)
      
      console.log(`Opened workspace: ${workspace.name}`)
      return true
    } catch (error) {
      console.error('Error opening workspace:', error)
      return false
    }
  }

  /**
   * 从当前打开的标签页更新工作空间
   */
  async updateWorkspaceFromCurrentTabs(workspaceId: string): Promise<boolean> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) {
      return false
    }

    try {
      const currentTabs = await chrome.tabs.query({ currentWindow: true })
      const tabInfos: TabInfo[] = currentTabs.map(tab => ({
        url: tab.url || '',
        title: tab.title || '',
        favicon: tab.favIconUrl,
        addedAt: Date.now()
      }))

      workspace.tabs = tabInfos
      workspace.updatedAt = Date.now()
      await this.saveWorkspaces()

      console.log(`Updated workspace from current tabs: ${workspace.name}`)
      return true
    } catch (error) {
      console.error('Error updating workspace from current tabs:', error)
      return false
    }
  }

  /**
   * 复制工作空间
   */
  async duplicateWorkspace(workspaceId: string, newName?: string): Promise<Workspace | null> {
    const workspace = this.workspaces.get(workspaceId)
    if (!workspace) {
      return null
    }

    const duplicatedWorkspace = await this.createWorkspace({
      name: newName || `${workspace.name} (副本)`,
      description: workspace.description,
      icon: workspace.icon,
      color: workspace.color,
      tabs: [...workspace.tabs],
      order: this.workspaces.size
    })

    return duplicatedWorkspace
  }

  /**
   * 搜索工作空间
   */
  searchWorkspaces(query: string): Workspace[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllWorkspaces().filter(workspace => 
      workspace.name.toLowerCase().includes(lowerQuery) ||
      workspace.description?.toLowerCase().includes(lowerQuery) ||
      workspace.tabs.some(tab => 
        tab.title.toLowerCase().includes(lowerQuery) ||
        tab.url.toLowerCase().includes(lowerQuery)
      )
    )
  }

  /**
   * 获取最近使用的工作空间
   */
  getRecentWorkspaces(): Workspace[] {
    return this.recentWorkspaces
      .map(id => this.workspaces.get(id))
      .filter(workspace => workspace !== undefined) as Workspace[]
  }

  /**
   * 添加到最近使用列表
   */
  private async addToRecentWorkspaces(workspaceId: string): Promise<void> {
    // 移除已存在的
    this.recentWorkspaces = this.recentWorkspaces.filter(id => id !== workspaceId)
    
    // 添加到开头
    this.recentWorkspaces.unshift(workspaceId)
    
    // 限制数量
    if (this.recentWorkspaces.length > this.maxRecentWorkspaces) {
      this.recentWorkspaces = this.recentWorkspaces.slice(0, this.maxRecentWorkspaces)
    }

    await storage.set('recentWorkspaces', this.recentWorkspaces)
  }

  /**
   * 重新排序工作空间
   */
  async reorderWorkspaces(workspaceIds: string[]): Promise<boolean> {
    try {
      workspaceIds.forEach((id, index) => {
        const workspace = this.workspaces.get(id)
        if (workspace) {
          workspace.order = index
          workspace.updatedAt = Date.now()
        }
      })

      await this.saveWorkspaces()
      return true
    } catch (error) {
      console.error('Error reordering workspaces:', error)
      return false
    }
  }

  /**
   * 导出工作空间
   */
  async exportWorkspaces(): Promise<string> {
    const workspacesArray = this.getAllWorkspaces()
    return JSON.stringify(workspacesArray, null, 2)
  }

  /**
   * 导入工作空间
   */
  async importWorkspaces(data: string, mergeStrategy: 'replace' | 'merge' = 'merge'): Promise<boolean> {
    try {
      const importedWorkspaces: Workspace[] = JSON.parse(data)
      
      if (mergeStrategy === 'replace') {
        this.workspaces.clear()
      }

      for (const workspace of importedWorkspaces) {
        // 生成新ID避免冲突
        const newWorkspace = {
          ...workspace,
          id: this.generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        this.workspaces.set(newWorkspace.id, newWorkspace)
      }

      await this.saveWorkspaces()
      console.log(`Imported ${importedWorkspaces.length} workspaces`)
      return true
    } catch (error) {
      console.error('Error importing workspaces:', error)
      return false
    }
  }

  /**
   * 获取工作空间统计信息
   */
  getWorkspaceStats(): {
    totalWorkspaces: number
    totalTabs: number
    averageTabsPerWorkspace: number
    mostUsedWorkspace: Workspace | null
    largestWorkspace: Workspace | null
  } {
    const workspaces = this.getAllWorkspaces()
    const totalWorkspaces = workspaces.length
    const totalTabs = workspaces.reduce((sum, w) => sum + w.tabs.length, 0)
    const averageTabsPerWorkspace = totalWorkspaces > 0 ? totalTabs / totalWorkspaces : 0

    // 最常用的工作空间（根据最近使用频率）
    const mostUsedWorkspace = this.recentWorkspaces.length > 0 
      ? this.workspaces.get(this.recentWorkspaces[0]) || null
      : null

    // 最大的工作空间（标签页数量最多）
    const largestWorkspace = workspaces.reduce((largest, current) => 
      current.tabs.length > (largest?.tabs.length || 0) ? current : largest
    , null as Workspace | null)

    return {
      totalWorkspaces,
      totalTabs,
      averageTabsPerWorkspace,
      mostUsedWorkspace,
      largestWorkspace
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// 导出单例实例
export const workspaceManager = WorkspaceManager.getInstance()