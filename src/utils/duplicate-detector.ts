import type { TabInfo, DuplicateGroup, Settings } from '@/types'
import { settings } from './storage'

/**
 * 重复页面检测器
 */
export class DuplicateDetector {
  private static instance: DuplicateDetector
  private detectionRules = new Map<string, (tab1: TabInfo, tab2: TabInfo) => boolean>()
  private whitelist = new Set<string>()
  private duplicateCache = new Map<string, DuplicateGroup[]>()
  private settings: Settings['duplicateDetection'] = {
    enabled: true,
    rules: {
      exactMatch: true,
      domainMatch: true,
      titleMatch: true,
      smartMatch: true
    },
    threshold: 0.8,
    whitelist: []
  }

  public static getInstance(): DuplicateDetector {
    if (!DuplicateDetector.instance) {
      DuplicateDetector.instance = new DuplicateDetector()
    }
    return DuplicateDetector.instance
  }

  constructor() {
    this.initializeDetectionRules()
    this.loadSettings()
    
    // 监听设置更新消息
    chrome.runtime.onMessage.addListener(async (message) => {
      if (message.type === 'settings:updated') {
        console.log('Settings updated, reloading duplicate detector settings')
        // 重新加载完整的设置
        await this.loadSettings()
        console.log('Duplicate detector settings reloaded:', {
          enabled: this.settings.enabled,
          smartMatch: this.settings.smartMatch,
          threshold: this.settings.threshold,
          whitelist: Array.from(this.whitelist)
        })
      }
    })
  }

  /**
   * 初始化检测规则
   */
  private initializeDetectionRules(): void {
    // 完全匹配规则
    this.detectionRules.set('exact', (tab1: TabInfo, tab2: TabInfo) => {
      return tab1.url === tab2.url
    })

    // 域名匹配规则
    this.detectionRules.set('domain', (tab1: TabInfo, tab2: TabInfo) => {
      try {
        const url1 = new URL(tab1.url)
        const url2 = new URL(tab2.url)
        return url1.hostname === url2.hostname && url1.pathname === url2.pathname
      } catch {
        return false
      }
    })

    // 标题相似度规则
    this.detectionRules.set('title', (tab1: TabInfo, tab2: TabInfo) => {
      const similarity = this.calculateSimilarity(tab1.title, tab2.title)
      return similarity > (this.settings?.threshold || 0.8)
    })

    // 智能匹配规则
    this.detectionRules.set('smart', (tab1: TabInfo, tab2: TabInfo) => {
      return this.intelligentMatch(tab1, tab2)
    })
  }

  /**
   * 加载设置
   */
  private async loadSettings(): Promise<void> {
    try {
      // 直接从 Chrome 存储读取以进行调试
      const rawSettings = await chrome.storage.local.get(['settings'])
      console.log('Raw settings from Chrome storage:', rawSettings)
      
      const userSettings = await settings.getSettings()
      console.log('Merged user settings:', userSettings)
      console.log('duplicateDetection from merged settings:', userSettings.duplicateDetection)
      
      this.settings = userSettings.duplicateDetection
      this.whitelist = new Set(this.settings.whitelist)
      console.log('Duplicate detector settings loaded:', {
        enabled: this.settings.enabled,
        smartMatch: this.settings.smartMatch,
        threshold: this.settings.threshold,
        whitelist: Array.from(this.whitelist)
      })
    } catch (error) {
      console.error('Error loading settings:', error)
      // 使用默认设置
      this.settings = {
        enabled: true,
        smartMatch: true,
        threshold: 0.8,
        whitelist: []
      }
      this.whitelist = new Set()
    }
  }

  /**
   * 检测所有重复页面（用于定时任务和徽章更新）
   */
  async detectAllDuplicates(): Promise<DuplicateGroup[]> {
    // 确保使用最新设置
    await this.loadSettings()

    // 定时检测总是运行，不管设置如何
    const tabs = await this.getAllTabs()
    return this.findDuplicateGroups(tabs)
  }

  /**
   * 检测新标签页是否重复
   */
  async detectNewTabDuplicates(newTab: TabInfo): Promise<TabInfo[]> {
    // 重新加载设置以确保使用最新的设置
    await this.loadSettings()
    
    console.log('Duplicate detection settings:', {
      enabled: this.settings?.enabled,
      smartMatch: this.settings?.smartMatch,
      threshold: this.settings?.threshold,
      whitelist: Array.from(this.whitelist)
    })
    
    if (!this.settings?.enabled) {
      console.log('Duplicate detection is disabled, skipping check')
      return []
    }

    if (this.isWhitelisted(newTab.url)) {
      console.log('URL is whitelisted:', newTab.url)
      return []
    }

    const existingTabs = await this.getAllTabs()
    console.log('Existing tabs count:', existingTabs.length)
    
    const duplicates: TabInfo[] = []

    for (const tab of existingTabs) {
      if (tab.id !== newTab.id && this.isDuplicate(newTab, tab)) {
        console.log('Found duplicate:', tab)
        duplicates.push(tab)
      }
    }

    console.log('Total duplicates found:', duplicates.length)
    return duplicates
  }

  /**
   * 查找重复分组
   */
  private findDuplicateGroups(tabs: TabInfo[]): DuplicateGroup[] {
    const groups: DuplicateGroup[] = []
    const processed = new Set<number>()

    for (let i = 0; i < tabs.length; i++) {
      if (processed.has(i)) continue

      const currentTab = tabs[i]
      if (!currentTab || this.isWhitelisted(currentTab.url)) continue

      const duplicates: TabInfo[] = [currentTab]
      const urls: string[] = [currentTab.url]
      let reason: DuplicateGroup['reason'] = 'exact'
      let maxSimilarity = 0

      for (let j = i + 1; j < tabs.length; j++) {
        if (processed.has(j)) continue

        const compareTab = tabs[j]
        if (!compareTab) continue

        const matchResult = this.getMatchReason(currentTab, compareTab)

        if (matchResult.isDuplicate) {
          duplicates.push(compareTab)
          urls.push(compareTab.url)
          processed.add(j)
          
          if (matchResult.similarity > maxSimilarity) {
            maxSimilarity = matchResult.similarity
            reason = matchResult.reason
          }
        }
      }

      if (duplicates.length > 1) {
        groups.push({
          urls,
          tabs: duplicates,
          similarity: maxSimilarity,
          reason
        })
        processed.add(i)
      }
    }

    return groups
  }

  /**
   * 判断两个标签页是否重复
   */
  private isDuplicate(tab1: TabInfo, tab2: TabInfo): boolean {
    if (tab1.id === tab2.id) {
      console.log('Same tab ID, not duplicate:', tab1.id)
      return false
    }

    // 1. 完全匹配检查
    if (this.settings.rules?.exactMatch) {
      const exactMatch = this.detectionRules.get('exact')?.(tab1, tab2)
      if (exactMatch) {
        console.log('Exact match found:', tab1.url, '===', tab2.url)
        return true
      }
    }

    // 2. 域名+路径匹配检查
    if (this.settings.rules?.domainMatch) {
      const domainMatch = this.detectionRules.get('domain')?.(tab1, tab2)
      if (domainMatch) {
        console.log('Domain match found between:', tab1.url, 'and', tab2.url)
        return true
      }
    }

    // 3. 标题相似度匹配检查
    if (this.settings.rules?.titleMatch) {
      const titleMatch = this.detectionRules.get('title')?.(tab1, tab2)
      if (titleMatch) {
        console.log('Title match found between:', tab1.title, 'and', tab2.title)
        return true
      }
    }

    // 4. 智能综合匹配检查
    if (this.settings.rules?.smartMatch) {
      const smartMatch = this.detectionRules.get('smart')?.(tab1, tab2) || false
      if (smartMatch) {
        console.log('Smart match found between:', tab1.url, 'and', tab2.url)
        return true
      }
    }
    
    return false
  }

  /**
   * 获取匹配原因和相似度
   */
  private getMatchReason(tab1: TabInfo, tab2: TabInfo): {
    isDuplicate: boolean
    reason: DuplicateGroup['reason']
    similarity: number
  } {
    // 完全匹配
    if (this.settings.rules?.exactMatch && this.detectionRules.get('exact')?.(tab1, tab2)) {
      return { isDuplicate: true, reason: 'exact', similarity: 1.0 }
    }

    // 域名匹配
    if (this.settings.rules?.domainMatch && this.detectionRules.get('domain')?.(tab1, tab2)) {
      return { isDuplicate: true, reason: 'domain', similarity: 0.9 }
    }

    // 标题匹配
    if (this.settings.rules?.titleMatch) {
      const titleSimilarity = this.calculateSimilarity(tab1.title, tab2.title)
      if (titleSimilarity > (this.settings?.threshold || 0.8)) {
        return { isDuplicate: true, reason: 'title', similarity: titleSimilarity }
      }
    }

    // 智能匹配
    if (this.settings.rules?.smartMatch) {
      const smartSimilarity = this.getSmartSimilarity(tab1, tab2)
      if (smartSimilarity > (this.settings?.threshold || 0.8)) {
        return { isDuplicate: true, reason: 'smart', similarity: smartSimilarity }
      }
    }

    return { isDuplicate: false, reason: 'exact', similarity: 0 }
  }

  /**
   * 智能匹配算法
   */
  private intelligentMatch(tab1: TabInfo, tab2: TabInfo): boolean {
    try {
      const url1 = new URL(tab1.url)
      const url2 = new URL(tab2.url)

      // 相同域名 + 相似路径
      if (url1.hostname === url2.hostname) {
        const pathSimilarity = this.calculateSimilarity(url1.pathname, url2.pathname)
        if (pathSimilarity > 0.7) return true
      }

      // 标题相似度检测
      const titleSimilarity = this.calculateSimilarity(tab1.title, tab2.title)
      if (titleSimilarity > (this.settings?.threshold || 0.8)) return true

      // URL结构相似度
      const urlSimilarity = this.calculateUrlSimilarity(tab1.url, tab2.url)
      if (urlSimilarity > 0.8) return true

      return false
    } catch {
      return false
    }
  }

  /**
   * 计算字符串相似度 (使用Jaro-Winkler算法的简化版本)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0
    if (!str1 || !str2) return 0.0

    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * 计算编辑距离
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // 删除
          matrix[j - 1][i] + 1,     // 插入
          matrix[j - 1][i - 1] + indicator // 替换
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * 计算URL结构相似度
   */
  private calculateUrlSimilarity(url1: string, url2: string): number {
    try {
      const u1 = new URL(url1)
      const u2 = new URL(url2)

      let score = 0
      let maxScore = 0

      // 域名相似度 (权重: 0.4)
      maxScore += 0.4
      if (u1.hostname === u2.hostname) {
        score += 0.4
      } else {
        const domainSimilarity = this.calculateSimilarity(u1.hostname, u2.hostname)
        score += domainSimilarity * 0.4
      }

      // 路径相似度 (权重: 0.3)
      maxScore += 0.3
      const pathSimilarity = this.calculateSimilarity(u1.pathname, u2.pathname)
      score += pathSimilarity * 0.3

      // 协议相似度 (权重: 0.1)
      maxScore += 0.1
      if (u1.protocol === u2.protocol) {
        score += 0.1
      }

      // 查询参数相似度 (权重: 0.2)
      maxScore += 0.2
      const queryParams1 = Array.from(u1.searchParams.keys()).sort()
      const queryParams2 = Array.from(u2.searchParams.keys()).sort()
      const paramSimilarity = this.calculateSimilarity(
        queryParams1.join(','),
        queryParams2.join(',')
      )
      score += paramSimilarity * 0.2

      return score / maxScore
    } catch (error) {
      console.error('Error calculating URL similarity:', error)
      return 0
    }
  }

  /**
   * 获取智能相似度
   */
  private getSmartSimilarity(tab1: TabInfo, tab2: TabInfo): number {
    const urlSimilarity = this.calculateUrlSimilarity(tab1.url, tab2.url)
    const titleSimilarity = this.calculateSimilarity(tab1.title, tab2.title)
    
    // 加权平均
    return urlSimilarity * 0.6 + titleSimilarity * 0.4
  }

  /**
   * 检查URL是否在白名单中
   */
  private isWhitelisted(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return Array.from(this.whitelist).some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'))
          return regex.test(url) || regex.test(urlObj.hostname)
        }
        return url.includes(pattern) || urlObj.hostname.includes(pattern)
      })
    } catch {
      return false
    }
  }

  /**
   * 获取所有标签页
   */
  private async getAllTabs(): Promise<TabInfo[]> {
    try {
      const tabs = await chrome.tabs.query({})
      return tabs.map(tab => ({
        id: tab.id || 0, // 使用 0 作为默认值，因为 id 在 TabInfo 中是必需的
        url: tab.url || '',
        title: tab.title || '',
        favicon: tab.favIconUrl || '',
        windowId: tab.windowId,
        index: tab.index,
        active: tab.active,
        pinned: tab.pinned
      }))
    } catch (error) {
      console.error('Error getting all tabs:', error)
      return []
    }
  }

  /**
   * 添加到白名单
   */
  async addToWhitelist(url: string): Promise<void> {
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      
      this.whitelist.add(domain)
      
      const currentSettings = await settings.getSettings()
      currentSettings.duplicateDetection.whitelist.push(domain)
      await settings.updateSettings(currentSettings)
    } catch (error) {
      console.error('Error adding to whitelist:', error)
    }
  }

  /**
   * 从白名单移除
   */
  async removeFromWhitelist(domain: string): Promise<void> {
    this.whitelist.delete(domain)
    
    const currentSettings = await settings.getSettings()
    const index = currentSettings.duplicateDetection.whitelist.indexOf(domain)
    if (index > -1) {
      currentSettings.duplicateDetection.whitelist.splice(index, 1)
      await settings.updateSettings(currentSettings)
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.duplicateCache.clear()
  }
}

// 导出单例实例
export const duplicateDetector = DuplicateDetector.getInstance()