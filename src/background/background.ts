import { duplicateDetector } from '@/utils/duplicate-detector'
import { syncManager } from '@/utils/sync-manager'
import { workspaceManager } from '@/utils/workspace-manager'
import { migration } from '@/utils/storage'
import { useI18n } from '@/utils/i18n'
import type { TabInfo } from '@/types'

/**
 * 后台脚本主文件
 */
class BackgroundService {
  private duplicateNotificationIds = new Set<string>()
  private recentDuplicateChecks = new Map<number, number>() // tabId -> timestamp
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * 初始化服务
   */
  private async initialize(): Promise<void> {
    try {
      console.log('Smart Tab Manager background service starting...')

      // 运行数据迁移
      await migration.checkAndMigrate()

      // 设置事件监听器
      this.setupEventListeners()
      
      // 启动自动同步
      syncManager.startAutoSync()

      // 设置上下文菜单
      this.setupContextMenus()

      // 设置定时任务
      this.setupPeriodicTasks()

      this.isInitialized = true
      console.log('Smart Tab Manager background service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize background service:', error)
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 标签页事件
    chrome.tabs.onCreated.addListener(this.handleTabCreated.bind(this))
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved.bind(this))
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated.bind(this))
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this))

    // 窗口事件
    chrome.windows.onCreated.addListener(this.handleWindowCreated.bind(this))
    chrome.windows.onRemoved.addListener(this.handleWindowRemoved.bind(this))

    // 扩展启动事件
    chrome.runtime.onStartup.addListener(this.handleRuntimeStartup.bind(this))
    chrome.runtime.onInstalled.addListener(this.handleRuntimeInstalled.bind(this))

    // 命令快捷键
    chrome.commands.onCommand.addListener(this.handleCommand.bind(this))

    // 消息处理
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))

    // 浏览器关闭前保存状态
    chrome.runtime.onSuspend.addListener(this.handleSuspend.bind(this))
  }

  /**
   * 处理标签页创建
   */
  private async handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
    try {
      if (!tab.url || this.isSystemUrl(tab.url)) {
        console.log('⏭️ Skipping system URL:', tab.url)
        return
      }

      const tabInfo = {
        id: tab.id,
        url: tab.url,
        title: tab.title || '',
        favicon: tab.favIconUrl,
        windowId: tab.windowId,
        index: tab.index,
        active: tab.active,
        pinned: tab.pinned
      }

      console.log('🆕 New tab created:', {
        id: tabInfo.id,
        url: tabInfo.url,
        title: tabInfo.title,
        status: tab.status,
        active: tabInfo.active
      })

      // 对于新标签页，我们不在这里检测重复
      // 而是等待 handleTabUpdated 在页面完全加载后进行检测
      if (tab.status === 'loading' || tabInfo.url === 'chrome://newtab/') {
        console.log('⏳ New tab is still loading, will check duplicates on update...')
      }

      // 更新徽章
      try {
        await this.updateBadge()
        console.log('🏷️ Badge updated after tab creation')
      } catch (badgeError) {
        console.error('❌ Error updating badge:', badgeError)
      }

      // 通知前端更新
      this.broadcastMessage({
        type: 'tab-created',
        payload: { tab: tabInfo }
      })
      console.log('📢 Broadcasted tab-created message to popup')
      
    } catch (error) {
      console.error('❌ Error handling tab created:', error)
    }
  }

  /**
   * 处理标签页移除
   */
  private async handleTabRemoved(tabId: number): Promise<void> {
    try {
      // 清理重复通知
      this.duplicateNotificationIds.delete(`duplicate-${tabId}`)
      
      // 清理重复检测缓存
      this.recentDuplicateChecks.delete(tabId)

      // 更新徽章
      await this.updateBadge()

      // 通知前端更新
      this.broadcastMessage({
        type: 'tab-removed',
        payload: { tabId }
      })
    } catch (error) {
      console.error('Error handling tab removed:', error)
    }
  }

  /**
   * 处理标签页更新
   */
  private async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): Promise<void> {
    try {
      // 只处理URL或标题变化
      if (!changeInfo.url && !changeInfo.title && !changeInfo.status) {
        console.log('⏭️ Ignoring tab update - no relevant changes:', tabId)
        return
      }
      
      if (!tab.url || this.isSystemUrl(tab.url)) {
        console.log('⏭️ Ignoring tab update - system URL:', tab.url)
        return
      }

      const tabInfo = {
        id: tab.id!,
        url: tab.url,
        title: tab.title || '',
        favicon: tab.favIconUrl || '',
        windowId: tab.windowId,
        index: tab.index,
        active: tab.active,
        pinned: tab.pinned
      }

      console.log('📝 Tab updated:', {
        id: tabId,
        url: tabInfo.url,
        title: tabInfo.title,
        changeInfo: changeInfo
      })

      let duplicates: TabInfo[] = []

      // 只在以下情况检测重复：
      // 1. URL 发生变化
      // 2. 页面首次加载完成（status 变为 complete）且不是 newtab
      const shouldCheckDuplicates = 
        changeInfo.url || 
        (changeInfo.status === 'complete' && 
         tab.url !== 'chrome://newtab/' && 
         !tab.url.startsWith('chrome://'))
      
      if (shouldCheckDuplicates) {
        console.log('🔍 Checking duplicates for updated tab...')
        console.log('📋 Tab info for duplicate detection:', tabInfo)
        
        // 检查是否在最近5秒内已经检测过这个标签页
        const now = Date.now()
        const lastCheck = this.recentDuplicateChecks.get(tabId)
        const DUPLICATE_CHECK_COOLDOWN = 5000 // 5秒冷却时间
        
        if (lastCheck && (now - lastCheck) < DUPLICATE_CHECK_COOLDOWN) {
          console.log('⏭️ Skipping duplicate check - recently checked this tab:', tabId)
          return
        }
        
        // 记录本次检测时间
        this.recentDuplicateChecks.set(tabId, now)
        
        try {
          duplicates = await duplicateDetector.detectNewTabDuplicates(tabInfo)
          console.log('🎯 Duplicate detection completed. Found', duplicates.length, 'duplicates')
          
          if (duplicates.length > 0) {
            console.log('📝 Duplicate details:')
            duplicates.forEach((dup, index) => {
              console.log(`   ${index + 1}. ID: ${dup.id}, Title: "${dup.title}", URL: ${dup.url}`)
            })
            console.log('⚠️ Duplicates found! Showing choice dialog...')
            await this.showDuplicateChoiceDialog(tabInfo, duplicates)
          } else {
            console.log('✅ No duplicates found for updated tab')
          }
        } catch (duplicateError) {
          console.error('❌ Error during duplicate detection:', duplicateError)
        }
      }

      // 通知前端更新
      this.broadcastMessage({
        type: 'tab-updated',
        payload: { tab: tabInfo, changeInfo, duplicates }
      })
      console.log('📢 Broadcasted tab-updated message to popup')
      
    } catch (error) {
      console.error('❌ Error handling tab updated:', error)
    }
  }

  /**
   * 处理标签页激活
   */
  private async handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo): Promise<void> {
    try {
      // 通知前端更新
      this.broadcastMessage({
        type: 'tab-activated',
        payload: activeInfo
      })
    } catch (error) {
      console.error('Error handling tab activated:', error)
    }
  }

  /**
   * 处理窗口创建
   */
  private async handleWindowCreated(window: chrome.windows.Window): Promise<void> {
    try {
      // 通知前端更新
      this.broadcastMessage({
        type: 'window-created',
        payload: { window }
      })
    } catch (error) {
      console.error('Error handling window created:', error)
    }
  }

  /**
   * 处理窗口移除
   */
  private async handleWindowRemoved(windowId: number): Promise<void> {
    try {
      // 通知前端更新
      this.broadcastMessage({
        type: 'window-removed',
        payload: { windowId }
      })
    } catch (error) {
      console.error('Error handling window removed:', error)
    }
  }

  /**
   * 处理运行时启动
   */
  private async handleRuntimeStartup(): Promise<void> {
    try {
      console.log('Browser startup detected')
      
      // 检测是否需要恢复会话
      await syncManager.detectCrashAndRestore()
      
      // 更新徽章
      await this.updateBadge()
    } catch (error) {
      console.error('Error handling runtime startup:', error)
    }
  }

  /**
   * 处理扩展安装/更新
   */
  private async handleRuntimeInstalled(details: chrome.runtime.InstalledDetails): Promise<void> {
    try {
      if (details.reason === 'install') {
        console.log('Extension installed for the first time')
        
        // 显示欢迎页面
        await chrome.tabs.create({
          url: chrome.runtime.getURL('options.html?welcome=true')
        })
      } else if (details.reason === 'update') {
        console.log(`Extension updated from ${details.previousVersion}`)
        
        // 显示更新日志
        const currentVersion = chrome.runtime.getManifest().version
        if (this.shouldShowUpdateNotification(details.previousVersion, currentVersion)) {
          await this.showUpdateNotification(currentVersion)
        }
      }

      // 更新徽章
      await this.updateBadge()
    } catch (error) {
      console.error('Error handling runtime installed:', error)
    }
  }

  /**
   * 处理命令快捷键
   */
  private async handleCommand(command: string): Promise<void> {
    try {
      console.log(`Command executed: ${command}`)

      switch (command) {
        case 'open-command-palette':
          await this.openCommandPalette()
          break
        case 'duplicate-detection':
          await this.runDuplicateDetection()
          break
        case 'create-snapshot':
          await this.createSnapshot()
          break
        case 'restore-session':
          await this.showRestoreDialog()
          break
        case 'switch-workspace-1':
        case 'switch-workspace-2':
        case 'switch-workspace-3':
          const workspaceIndex = parseInt(command.split('-')[2]) - 1
          await this.switchWorkspace(workspaceIndex)
          break
        default:
          console.warn(`Unknown command: ${command}`)
      }
    } catch (error) {
      console.error(`Error handling command ${command}:`, error)
    }
  }

  /**
   * 处理消息
   */
  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    try {
      console.log('Message received:', message.type)

      switch (message.type) {
        case 'ping':
          console.log('📨 Received ping from popup')
          sendResponse({ success: true, message: 'pong', timestamp: Date.now() })
          break
          
        case 'get-stats':
          const stats = await this.getStats()
          sendResponse({ success: true, data: stats })
          break
        
        case 'update-badge':
          await this.updateBadge()
          sendResponse({ success: true })
          break

        case 'settings:updated':
          console.log('Settings updated:', message.payload)
          sendResponse({ success: true })
          break

        case 'open-workspace':
          await workspaceManager.openWorkspace(message.payload.workspaceId, message.payload.options)
          sendResponse({ success: true })
          break

        case 'create-snapshot':
          const snapshot = await syncManager.createSnapshot(message.payload.type, message.payload.name)
          sendResponse({ success: true, data: snapshot })
          break

        case 'restore-snapshot':
          const restored = await syncManager.restoreSnapshot(message.payload.snapshotId, message.payload.options)
          sendResponse({ success: true, data: restored })
          break

        case 'close-duplicate-tab':
          await this.handleCloseDuplicateTab(message.payload)
          sendResponse({ success: true })
          break

        default:
          console.log('Unknown message type:', message.type)
          sendResponse({ success: false, error: 'Unknown message type' })
      }
    } catch (error) {
      console.error('Error handling message:', error)
      sendResponse({ success: false, error: error.message })
    }
  }

  /**
   * 处理暂停（浏览器关闭前）
   */
  private async handleSuspend(): Promise<void> {
    try {
      console.log('Browser suspending, saving final snapshot...')
      
      // 创建最终快照
      await syncManager.createSnapshot('auto', '浏览器关闭前保存')
      
      console.log('Final snapshot saved')
    } catch (error) {
      console.error('Error handling suspend:', error)
    }
  }

  /**
   * 设置上下文菜单
   */
  private setupContextMenus(): void {
    try {
      // 清除现有菜单
      chrome.contextMenus.removeAll(() => {
        // 添加到工作空间菜单
        chrome.contextMenus.create({
          id: 'add-to-workspace',
          title: '添加到工作空间',
          contexts: ['page', 'tab']
        })

        // 检测重复页面菜单
        chrome.contextMenus.create({
          id: 'detect-duplicates',
          title: '检测重复页面',
          contexts: ['page', 'tab']
        })

        // 创建快照菜单
        chrome.contextMenus.create({
          id: 'create-snapshot',
          title: '创建会话快照',
          contexts: ['page', 'tab']
        })

        // 监听菜单点击
        chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this))
      })
    } catch (error) {
      console.error('Error setting up context menus:', error)
    }
  }

  /**
   * 处理上下文菜单点击
   */
  private async handleContextMenuClick(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab
  ): Promise<void> {
    try {
      if (!tab) return

      switch (info.menuItemId) {
        case 'add-to-workspace':
          await this.showWorkspaceSelector(tab)
          break
        case 'detect-duplicates':
          await this.runDuplicateDetection()
          break
        case 'create-snapshot':
          await this.createSnapshot()
          break
      }
    } catch (error) {
      console.error('Error handling context menu click:', error)
    }
  }

  /**
   * 设置定时任务
   */
  private setupPeriodicTasks(): void {
    // 每30秒检查一次重复页面
    setInterval(async () => {
      try {
        // 定时任务总是检测重复页面并更新徽章，不管设置如何
        const duplicates = await duplicateDetector.detectAllDuplicates()
        await this.updateBadge(duplicates.length)
      } catch (error) {
        console.error('Error in periodic duplicate check:', error)
      }
    }, 30000)

    // 每5分钟清理过期通知和缓存
    setInterval(() => {
      this.cleanupExpiredNotifications()
      this.cleanupExpiredDuplicateChecks()
    }, 5 * 60000)

    // 每30秒发送心跳信号，用于检测连接状态
    setInterval(() => {
      this.broadcastMessage({
        type: 'heartbeat',
        payload: { timestamp: Date.now() }
      })
    }, 30000)
  }

  /**
   * 显示重复页面选择对话框
   */
  private async showDuplicateChoiceDialog(tab: any, duplicates: any[]): Promise<void> {
    try {
      if (!tab.id) return
      
      console.log('📋 Preparing duplicate choice dialog for tab:', tab.id)
      
      // 构建重复页面信息
      const duplicateInfo = duplicates.map(dup => ({
        id: dup.id,
        title: dup.title || dup.url,
        url: dup.url
      }))
      
      console.log('🎯 Attempting multiple dialog methods...')
      
      // 方法1: 尝试使用 Chrome 内置的确认对话框
      try {
        const result = await this.showNativeConfirmDialog(tab, duplicates)
        if (result !== null) {
          console.log('✅ Native confirm dialog worked, result:', result)
          return
        }
      } catch (nativeError) {
        console.log('⚠️ Native confirm dialog failed:', nativeError)
      }
      
      // 方法2: 尝试脚本注入自定义对话框
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: this.showDuplicateDialog,
          args: [duplicateInfo, tab]
        })
        
        console.log('✅ Custom dialog injected successfully')
        
        // 等待一小段时间，然后检查对话框是否真的显示了
        setTimeout(async () => {
          try {
            const result = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                return document.getElementById('smart-tab-duplicate-dialog') !== null
              }
            })
            
            if (result && result[0] && result[0].result) {
              console.log('✅ Custom dialog is visible on page')
            } else {
              console.log('⚠️ Custom dialog not found on page, using fallback')
              this.showDuplicateNotification(tab, duplicates)
            }
          } catch (checkError) {
            console.log('⚠️ Could not verify dialog visibility:', checkError)
            this.showDuplicateNotification(tab, duplicates)
          }
        }, 1000)
        
        return
      } catch (scriptError) {
        console.log('⚠️ Script injection failed:', scriptError)
      }
      
      // 方法3: 降级到系统通知
      console.log('🔔 Using notification as final fallback')
      await this.showDuplicateNotification(tab, duplicates)
      
    } catch (error) {
      console.error('❌ All dialog methods failed:', error)
      // 最终降级方案
      await this.showDuplicateNotification(tab, duplicates)
    }
  }

  /**
   * 使用原生确认对话框
   */
  private async showNativeConfirmDialog(tab: any, duplicates: any[]): Promise<boolean | null> {
    try {
      const duplicateList = duplicates.map(dup => `• ${dup.title || dup.url}`).join('\n')
      const message = `⚠️ 检测到重复页面！\n\n当前页面与以下页面重复：\n${duplicateList}\n\n您希望如何处理？\n\n✅ 确定：保留此页面\n❌ 取消：关闭此页面并切换到现有页面`
      
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (msg) => {
          try {
            return confirm(msg)
          } catch (e) {
            console.error('Confirm dialog error:', e)
            return null
          }
        },
        args: [message]
      })
      
      if (result && result[0] && typeof result[0].result === 'boolean') {
        const userChoice = result[0].result
        console.log('👤 User choice from native dialog:', userChoice)
        
        if (!userChoice) {
          // 用户选择关闭当前页面
          await this.handleCloseDuplicateTab({
            tabToClose: tab.id,
            tabToActivate: duplicates[0].id
          })
        }
        
        return userChoice
      }
      
      return null
    } catch (error) {
      console.error('Native confirm dialog error:', error)
      return null
    }
  }

  /**
   * 在页面中显示重复对话框的函数
   */
  private showDuplicateDialog(duplicates: any[], currentTab: any) {
    console.log('🎯 showDuplicateDialog called with:', duplicates.length, 'duplicates')
    
    // 避免重复显示
    if (document.getElementById('smart-tab-duplicate-dialog')) {
      console.log('⚠️ Dialog already exists, skipping')
      return
    }

    try {
      // 强制确保DOM已完全加载
      if (document.readyState === 'loading') {
        console.log('⏳ DOM still loading, waiting...')
        document.addEventListener('DOMContentLoaded', () => {
          this.showDuplicateDialog(duplicates, currentTab)
        })
        return
      }

      console.log('📋 Creating enhanced custom dialog...')
      
      // 创建一个更显眼的模态对话框，使用更强的样式覆盖
      const dialog = document.createElement('div')
      dialog.id = 'smart-tab-duplicate-dialog'
      
      // 使用更强的CSS选择器和!important确保样式生效
      dialog.setAttribute('style', `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(0, 0, 0, 0.8) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        box-sizing: border-box !important;
        pointer-events: auto !important;
      `)

      const dialogBox = document.createElement('div')
      dialogBox.setAttribute('style', `
        background: white !important;
        border-radius: 12px !important;
        padding: 24px !important;
        max-width: 500px !important;
        min-width: 300px !important;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
        text-align: center !important;
        position: relative !important;
        border: 2px solid #ff3b30 !important;
        animation: slideIn 0.3s ease-out !important;
      `)

      const duplicateList = duplicates.map(dup => `• ${dup.title || dup.url}`).join('<br>')
      
      dialogBox.innerHTML = `
        <style>
          @keyframes slideIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .dialog-btn:hover {
            transform: scale(1.05) !important;
            transition: transform 0.2s ease !important;
          }
        </style>
        <div style="font-size: 48px; margin-bottom: 16px; animation: bounce 1s infinite;">⚠️</div>
        <h2 style="margin: 0 0 16px 0 !important; color: #ff3b30 !important; font-size: 20px !important; font-weight: bold !important;">检测到重复页面！</h2>
        <p style="margin: 0 0 16px 0 !important; color: #333 !important; line-height: 1.5 !important; font-size: 14px !important;">
          当前页面与以下页面重复：
        </p>
        <div style="background: #f5f5f5 !important; padding: 12px !important; border-radius: 8px !important; margin: 16px 0 !important; text-align: left !important; max-height: 120px !important; overflow-y: auto !important; border: 1px solid #ddd !important;">
          ${duplicateList}
        </div>
        <p style="margin: 16px 0 !important; color: #666 !important; font-size: 14px !important; font-weight: 500 !important;">您希望如何处理？</p>
        <div style="display: flex !important; gap: 12px !important; justify-content: center !important;">
          <button id="keep-tab-btn" class="dialog-btn" style="
            background: #007aff !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
          ">✅ 保留此页面</button>
          <button id="close-tab-btn" class="dialog-btn" style="
            background: #ff3b30 !important;
            color: white !important;
            border: none !important;
            padding: 12px 24px !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
          ">❌ 关闭并切换</button>
        </div>
        <p style="margin-top: 16px !important; font-size: 12px !important; color: #999 !important;">点击背景或按ESC键取消</p>
      `

      // 确保添加到最顶层
      const targetElement = document.body || document.documentElement
      dialog.appendChild(dialogBox)
      targetElement.appendChild(dialog)

      console.log('✅ Enhanced dialog created and added to DOM')

      // 添加按钮事件监听器
      const keepBtn = document.getElementById('keep-tab-btn')
      const closeBtn = document.getElementById('close-tab-btn')

      if (keepBtn) {
        keepBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log('👍 User chose to keep the tab')
          dialog.remove()
        })
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log('❌ User chose to close the tab')
          dialog.remove()
          chrome.runtime.sendMessage({
            type: 'close-duplicate-tab',
            payload: {
              tabToClose: currentTab.id,
              tabToActivate: duplicates[0].id
            }
          })
        })
      }

      // 点击背景关闭对话框
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          console.log('🔙 User clicked background, keeping tab')
          dialog.remove()
        }
      })

      // ESC键关闭
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          console.log('⌨️ User pressed ESC, keeping tab')
          dialog.remove()
          document.removeEventListener('keydown', escHandler)
        }
      }
      document.addEventListener('keydown', escHandler)

      // 自动聚焦第一个按钮
      setTimeout(() => {
        if (keepBtn) {
          keepBtn.focus()
        }
      }, 100)

      // 10秒后自动关闭（防止卡住）
      setTimeout(() => {
        if (document.getElementById('smart-tab-duplicate-dialog')) {
          console.log('⏰ Auto-closing dialog after 10 seconds')
          dialog.remove()
        }
      }, 10000)

      // 立即验证对话框是否真的被添加了
      setTimeout(() => {
        const verifyDialog = document.getElementById('smart-tab-duplicate-dialog')
        if (verifyDialog) {
          console.log('✅ Dialog verified in DOM')
        } else {
          console.log('❌ Dialog not found in DOM, something went wrong')
        }
      }, 100)

    } catch (error) {
      console.error('❌ Error creating custom dialog, falling back to confirm:', error)
      // 降级到简单的confirm对话框
      try {
        const duplicateList = duplicates.map(dup => `• ${dup.title || dup.url}`).join('\n')
        const message = `⚠️ 检测到重复页面！\n\n当前页面与以下页面重复：\n${duplicateList}\n\n您希望如何处理？`
        
        const userChoice = confirm(message + '\n\n✅ 点击"确定"：保留此页面\n❌ 点击"取消"：关闭此页面并切换到现有页面')
        console.log('👤 Fallback confirm result:', userChoice)
        
        if (!userChoice) {
          chrome.runtime.sendMessage({
            type: 'close-duplicate-tab',
            payload: {
              tabToClose: currentTab.id,
              tabToActivate: duplicates[0].id
            }
          })
        }
      } catch (confirmError) {
        console.error('❌ Even confirm dialog failed:', confirmError)
      }
    }
  }

  /**
   * 显示重复页面通知
   */
  private async showDuplicateNotification(
    tab: any,
    duplicates: any[]
  ): Promise<void> {
    try {
      const notificationId = `duplicate-${tab.id}-${Date.now()}`
      
      console.log('🔔 Creating notification for tab:', tab.id, 'with', duplicates.length, 'duplicates')

      // 检查notifications API是否可用
      if (chrome.notifications) {
        const notificationOptions = {
          type: 'basic' as const,
          title: '⚠️ Smart Tab Manager - 重复页面提醒',
          message: `检测到重复页面！\n页面："${tab.title || tab.url}"\n与 ${duplicates.length} 个已打开的页面重复\n\n点击此通知查看选项`,
          iconUrl: chrome.runtime.getURL('icons/icon-48.png'),
          buttons: [
            { title: '🔄 切换到现有页面' },
            { title: '✅ 保留当前页面' }
          ],
          requireInteraction: true // 需要用户交互才会消失
        }

        console.log('📢 Creating notification with options:', notificationOptions)

        await chrome.notifications.create(notificationId, notificationOptions)
        this.duplicateNotificationIds.add(notificationId)
        
        console.log('✅ Notification created successfully:', notificationId)

        // 监听通知按钮点击
        const buttonClickHandler = (notifId: string, buttonIndex: number) => {
          if (notifId === notificationId) {
            console.log('👤 User clicked notification button:', buttonIndex)
            
            if (buttonIndex === 0) {
              // 切换到现有页面并关闭当前页面
              console.log('🔄 User chose to switch to existing tab')
              this.handleCloseDuplicateTab({
                tabToClose: tab.id,
                tabToActivate: duplicates[0].id
              })
            } else {
              console.log('✅ User chose to keep current tab')
              // 用户选择保留当前页面，什么都不做
            }
            
            chrome.notifications.clear(notifId)
            this.duplicateNotificationIds.delete(notifId)
            chrome.notifications.onButtonClicked.removeListener(buttonClickHandler)
          }
        }

        chrome.notifications.onButtonClicked.addListener(buttonClickHandler)

        // 监听通知主体点击
        const clickHandler = (notifId: string) => {
          if (notifId === notificationId) {
            console.log('👤 User clicked notification body, opening popup')
            
            // 点击通知主体时，打开popup显示选项
            chrome.action.openPopup().catch(() => {
              console.log('Could not open popup, user needs to click extension icon')
            })
            
            chrome.notifications.clear(notifId)
            this.duplicateNotificationIds.delete(notifId)
            chrome.notifications.onClicked.removeListener(clickHandler)
          }
        }

        chrome.notifications.onClicked.addListener(clickHandler)

        // 5分钟后自动清理通知
        setTimeout(() => {
          if (this.duplicateNotificationIds.has(notificationId)) {
            console.log('⏰ Auto-clearing notification after 5 minutes:', notificationId)
            chrome.notifications.clear(notificationId)
            this.duplicateNotificationIds.delete(notificationId)
          }
        }, 5 * 60 * 1000)

      } else {
        console.warn('⚠️ Notifications API not available, trying alternative method')
        
        // 备用方案：使用Chrome action badge
        try {
          await chrome.action.setBadgeText({
            text: '⚠️',
            tabId: tab.id
          })
          
          await chrome.action.setBadgeBackgroundColor({
            color: '#FF3B30',
            tabId: tab.id
          })
          
          await chrome.action.setTitle({
            title: `检测到重复页面！与 ${duplicates.length} 个页面重复，点击查看选项`,
            tabId: tab.id
          })
          
          console.log('✅ Badge notification set successfully')
          
        } catch (badgeError) {
          console.error('❌ Badge notification also failed:', badgeError)
        }
      }
    } catch (error) {
      console.error('❌ Error showing duplicate notification:', error)
      
      // 最后的备用方案：广播消息到popup
      try {
        this.broadcastMessage({
          type: 'duplicate-notification-fallback',
          payload: {
            tab,
            duplicates,
            message: `检测到重复页面！"${tab.title || tab.url}" 与 ${duplicates.length} 个已打开的页面重复`
          }
        })
        console.log('📢 Fallback message broadcasted to popup')
      } catch (broadcastError) {
        console.error('❌ Even broadcast fallback failed:', broadcastError)
      }
    }
  }

  /**
   * 处理关闭重复标签页
   */
  private async handleCloseDuplicateTab(payload: any): Promise<void> {
    try {
      const { tabToClose, tabToActivate } = payload
      
      console.log('🔄 Closing duplicate tab:', tabToClose, 'and activating:', tabToActivate)
      
      // 先激活要切换到的标签页
      if (tabToActivate) {
        await chrome.tabs.update(tabToActivate, { active: true })
      }
      
      // 然后关闭重复的标签页
      if (tabToClose) {
        await chrome.tabs.remove(tabToClose)
      }
      
      console.log('✅ Successfully handled duplicate tab closure')
    } catch (error) {
      console.error('❌ Error handling duplicate tab closure:', error)
    }
  }

  /**
   * 关闭重复标签页
   */
  private async closeDuplicateTabs(duplicates: any[]): Promise<void> {
    try {
      const tabIds = duplicates
        .map(tab => tab.id)
        .filter(id => id !== undefined)

      if (tabIds.length > 0) {
        await chrome.tabs.remove(tabIds)
      }
    } catch (error) {
      console.error('Error closing duplicate tabs:', error)
    }
  }

  /**
   * 更新徽章
   */
  private async updateBadge(duplicateCount?: number): Promise<void> {
    try {
      let count = duplicateCount
      if (count === undefined) {
        const duplicates = await duplicateDetector.detectAllDuplicates()
        count = duplicates.length
      }

      await chrome.action.setBadgeText({
        text: count > 0 ? count.toString() : ''
      })

      await chrome.action.setBadgeBackgroundColor({
        color: count > 0 ? '#FF3B30' : '#007AFF'
      })
    } catch (error) {
      console.error('Error updating badge:', error)
    }
  }

  /**
   * 广播消息到所有页面
   */
  private broadcastMessage(message: any): void {
    try {
      console.log('Broadcasting message:', message.type, message)
      
      // 发送到运行时
      chrome.runtime.sendMessage(message).catch((error) => {
        console.log('No popup listening for message:', message.type)
      })
      
      // 也尝试发送到所有标签页的content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {
              // 忽略没有content script的标签页
            })
          }
        })
      })
    } catch (error) {
      console.error('Error broadcasting message:', error)
    }
  }

  /**
   * 工具方法
   */
  private isSystemUrl(url: string): boolean {
    return url.startsWith('chrome://') || 
           url.startsWith('chrome-extension://') ||
           url.startsWith('moz-extension://') ||
           url.startsWith('edge://') ||
           url.startsWith('about:')
  }

  private shouldShowUpdateNotification(prevVersion: string, currentVersion: string): boolean {
    // 简单版本比较，实际应用中可能需要更复杂的逻辑
    return prevVersion !== currentVersion
  }

  private async showUpdateNotification(version: string): Promise<void> {
    await chrome.notifications.create('update', {
      type: 'basic',
      iconUrl: '/icons/icon-48.png',
      title: 'Smart Tab Manager 已更新',
      message: `已更新到版本 ${version}，点击查看新功能`
    })
  }

  private cleanupExpiredNotifications(): void {
    // 清理过期的通知ID
    // 实际实现中可能需要更复杂的逻辑
  }

  private cleanupExpiredDuplicateChecks(): void {
    const now = Date.now()
    this.recentDuplicateChecks.forEach((timestamp, tabId) => {
      if (now - timestamp > 5000) { // 5秒冷却时间
        this.recentDuplicateChecks.delete(tabId)
        console.log(`Cleaned up duplicate check cache for tab: ${tabId}`)
      }
    })
  }

  // 命令处理方法
  private async openCommandPalette(): Promise<void> {
    // 实现打开命令面板的逻辑
    this.broadcastMessage({ type: 'open-command-palette' })
  }

  private async runDuplicateDetection(): Promise<void> {
    const duplicates = await duplicateDetector.detectAllDuplicates()
    this.broadcastMessage({ type: 'duplicates-detected', payload: duplicates })
  }

  private async createSnapshot(): Promise<void> {
    const snapshot = await syncManager.createSnapshot('manual')
    this.broadcastMessage({ type: 'snapshot-created', payload: snapshot })
  }

  private async showRestoreDialog(): Promise<void> {
    this.broadcastMessage({ type: 'show-restore-dialog' })
  }

  private async switchWorkspace(index: number): Promise<void> {
    const workspaces = workspaceManager.getAllWorkspaces()
    if (workspaces[index]) {
      await workspaceManager.openWorkspace(workspaces[index].id)
    }
  }

  private async showWorkspaceSelector(tab: chrome.tabs.Tab): Promise<void> {
    this.broadcastMessage({ 
      type: 'show-workspace-selector', 
      payload: { tab } 
    })
  }

  private async getStats(): Promise<any> {
    const tabs = await chrome.tabs.query({})
    const duplicates = await duplicateDetector.detectAllDuplicates()
    const workspaceStats = workspaceManager.getWorkspaceStats()
    const syncStats = await syncManager.getSyncStats()

    return {
      totalTabs: tabs.length,
      duplicateTabs: duplicates.reduce((sum, group) => sum + group.tabs.length, 0),
      totalWorkspaces: workspaceStats.totalWorkspaces,
      lastSyncTime: syncStats.lastSyncTime
    }
  }
}

// 创建后台服务实例
const backgroundService = new BackgroundService()

// 导出以供测试使用
export default backgroundService