/**
 * 内容脚本 - 在网页中运行的脚本
 */

class ContentScript {
  private isInitialized = false
  private pageStartTime = Date.now()

  constructor() {
    this.initialize()
  }

  /**
   * 初始化内容脚本
   */
  private initialize(): void {
    if (this.isInitialized) return

    try {
      console.log('Smart Tab Manager content script loading...')

      // 监听页面加载完成
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded.bind(this))
      } else {
        this.handleDOMContentLoaded()
      }

      // 监听页面可见性变化
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

      // 监听来自扩展的消息
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this))

      // 监听页面卸载
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))

      this.isInitialized = true
      console.log('Smart Tab Manager content script loaded')
    } catch (error) {
      console.error('Error initializing content script:', error)
    }
  }

  /**
   * 处理DOM内容加载完成
   */
  private handleDOMContentLoaded(): void {
    try {
      // 收集页面信息
      const pageInfo = this.collectPageInfo()
      
      // 发送页面信息到后台脚本
      chrome.runtime.sendMessage({
        type: 'page-loaded',
        payload: {
          ...pageInfo,
          loadTime: Date.now() - this.pageStartTime
        }
      }).catch(() => {
        // 忽略无监听器错误
      })

      // 注入页面样式（如果需要）
      this.injectPageStyles()

      // 设置键盘快捷键监听
      this.setupKeyboardShortcuts()
    } catch (error) {
      console.error('Error handling DOM content loaded:', error)
    }
  }

  /**
   * 收集页面信息
   */
  private collectPageInfo(): any {
    try {
      // 获取页面基本信息
      const pageInfo = {
        url: window.location.href,
        title: document.title,
        favicon: this.extractFavicon(),
        description: this.extractDescription(),
        keywords: this.extractKeywords(),
        language: document.documentElement.lang || navigator.language,
        hasImages: document.images.length > 0,
        hasVideos: document.querySelectorAll('video').length > 0,
        hasAudio: document.querySelectorAll('audio').length > 0,
        wordCount: this.estimateWordCount(),
        readingTime: this.estimateReadingTime(),
        socialMedia: this.detectSocialMedia(),
        contentType: this.detectContentType()
      }

      return pageInfo
    } catch (error) {
      console.error('Error collecting page info:', error)
      return {
        url: window.location.href,
        title: document.title,
        favicon: null
      }
    }
  }

  /**
   * 提取页面favicon
   */
  private extractFavicon(): string | null {
    try {
      // 查找各种类型的favicon
      const selectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]'
      ]

      for (const selector of selectors) {
        const link = document.querySelector(selector) as HTMLLinkElement
        if (link && link.href) {
          return link.href
        }
      }

      // 尝试默认favicon路径
      const defaultFavicon = `${window.location.origin}/favicon.ico`
      return defaultFavicon
    } catch (error) {
      return null
    }
  }

  /**
   * 提取页面描述
   */
  private extractDescription(): string | null {
    try {
      const metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (metaDescription) {
        return metaDescription.content
      }

      const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement
      if (ogDescription) {
        return ogDescription.content
      }

      // 尝试从第一段提取
      const firstParagraph = document.querySelector('p')
      if (firstParagraph && firstParagraph.textContent) {
        return firstParagraph.textContent.substring(0, 160) + '...'
      }

      return null
    } catch (error) {
      return null
    }
  }

  /**
   * 提取页面关键词
   */
  private extractKeywords(): string[] {
    try {
      const metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement
      if (metaKeywords && metaKeywords.content) {
        return metaKeywords.content.split(',').map(k => k.trim())
      }

      // 尝试从标题提取关键词
      const titleWords = document.title.toLowerCase()
        .split(/[\s\-_]+/)
        .filter(word => word.length > 2)
        .slice(0, 5)

      return titleWords
    } catch (error) {
      return []
    }
  }

  /**
   * 估算页面字数
   */
  private estimateWordCount(): number {
    try {
      const textContent = document.body.textContent || document.body.innerText || ''
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0)
      return words.length
    } catch (error) {
      return 0
    }
  }

  /**
   * 估算阅读时间（分钟）
   */
  private estimateReadingTime(): number {
    try {
      const wordCount = this.estimateWordCount()
      const wordsPerMinute = 200 // 平均阅读速度
      return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
    } catch (error) {
      return 1
    }
  }

  /**
   * 检测社交媒体平台
   */
  private detectSocialMedia(): string | null {
    try {
      const hostname = window.location.hostname.toLowerCase()
      
      const socialPlatforms = {
        'twitter.com': 'Twitter',
        'x.com': 'X',
        'facebook.com': 'Facebook',
        'instagram.com': 'Instagram',
        'linkedin.com': 'LinkedIn',
        'youtube.com': 'YouTube',
        'tiktok.com': 'TikTok',
        'weibo.com': '微博',
        'zhihu.com': '知乎',
        'bilibili.com': 'Bilibili'
      }

      for (const [domain, platform] of Object.entries(socialPlatforms)) {
        if (hostname.includes(domain)) {
          return platform
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  /**
   * 检测内容类型
   */
  private detectContentType(): string {
    try {
      const hostname = window.location.hostname.toLowerCase()
      const pathname = window.location.pathname.toLowerCase()

      // 检测常见网站类型
      if (hostname.includes('github.com')) return 'code'
      if (hostname.includes('stackoverflow.com')) return 'qa'
      if (hostname.includes('wikipedia.org')) return 'reference'
      if (hostname.includes('youtube.com') || hostname.includes('bilibili.com')) return 'video'
      if (hostname.includes('music.') || hostname.includes('spotify.com')) return 'music'
      if (hostname.includes('news.') || hostname.includes('cnn.com') || hostname.includes('bbc.com')) return 'news'
      if (hostname.includes('shop') || hostname.includes('amazon.com') || hostname.includes('taobao.com')) return 'shopping'
      
      // 通过URL路径检测
      if (pathname.includes('/docs') || pathname.includes('/documentation')) return 'documentation'
      if (pathname.includes('/blog') || pathname.includes('/article')) return 'blog'
      if (pathname.includes('/tutorial') || pathname.includes('/guide')) return 'tutorial'

      // 通过页面内容检测
      const hasCodeBlocks = document.querySelectorAll('pre, code').length > 5
      if (hasCodeBlocks) return 'code'

      const hasImages = document.images.length > 10
      if (hasImages) return 'gallery'

      return 'general'
    } catch (error) {
      return 'general'
    }
  }

  /**
   * 处理页面可见性变化
   */
  private handleVisibilityChange(): void {
    try {
      if (document.hidden) {
        // 页面被隐藏
        chrome.runtime.sendMessage({
          type: 'page-hidden',
          payload: {
            url: window.location.href,
            timestamp: Date.now()
          }
        }).catch(() => {})
      } else {
        // 页面变为可见
        chrome.runtime.sendMessage({
          type: 'page-visible',
          payload: {
            url: window.location.href,
            timestamp: Date.now()
          }
        }).catch(() => {})
      }
    } catch (error) {
      console.error('Error handling visibility change:', error)
    }
  }

  /**
   * 处理来自扩展的消息
   */
  private handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): void {
    try {
      switch (message.type) {
        case 'get-page-info':
          const pageInfo = this.collectPageInfo()
          sendResponse({ success: true, data: pageInfo })
          break

        case 'highlight-duplicate':
          this.highlightDuplicateContent()
          sendResponse({ success: true })
          break

        case 'remove-highlight':
          this.removeHighlights()
          sendResponse({ success: true })
          break

        case 'inject-notification':
          this.showInPageNotification(message.payload)
          sendResponse({ success: true })
          break

        default:
          sendResponse({ success: false, error: 'Unknown message type' })
      }
    } catch (error) {
      console.error('Error handling message:', error)
      sendResponse({ success: false, error: error.message })
    }
  }

  /**
   * 处理页面卸载
   */
  private handleBeforeUnload(): void {
    try {
      // 发送页面卸载信息
      chrome.runtime.sendMessage({
        type: 'page-unload',
        payload: {
          url: window.location.href,
          timeSpent: Date.now() - this.pageStartTime
        }
      }).catch(() => {})
    } catch (error) {
      console.error('Error handling before unload:', error)
    }
  }

  /**
   * 注入页面样式
   */
  private injectPageStyles(): void {
    try {
      const style = document.createElement('style')
      style.textContent = `
        .smart-tab-highlight {
          background-color: rgba(255, 59, 48, 0.1) !important;
          border: 2px solid rgba(255, 59, 48, 0.3) !important;
          border-radius: 4px !important;
        }
        
        .smart-tab-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          padding: 16px;
          max-width: 300px;
          z-index: 10000;
          animation: slideInRight 0.3s ease-out;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `
      document.head.appendChild(style)
    } catch (error) {
      console.error('Error injecting page styles:', error)
    }
  }

  /**
   * 设置键盘快捷键
   */
  private setupKeyboardShortcuts(): void {
    try {
      document.addEventListener('keydown', (event) => {
        // Alt + D: 检测重复页面
        if (event.altKey && event.key === 'd') {
          event.preventDefault()
          chrome.runtime.sendMessage({
            type: 'keyboard-shortcut',
            payload: { command: 'detect-duplicates' }
          }).catch(() => {})
        }

        // Alt + W: 添加到工作空间
        if (event.altKey && event.key === 'w') {
          event.preventDefault()
          chrome.runtime.sendMessage({
            type: 'keyboard-shortcut',
            payload: { command: 'add-to-workspace' }
          }).catch(() => {})
        }
      })
    } catch (error) {
      console.error('Error setting up keyboard shortcuts:', error)
    }
  }

  /**
   * 高亮重复内容
   */
  private highlightDuplicateContent(): void {
    try {
      // 简单示例：高亮整个页面
      document.body.classList.add('smart-tab-highlight')
      
      // 5秒后移除高亮
      setTimeout(() => {
        this.removeHighlights()
      }, 5000)
    } catch (error) {
      console.error('Error highlighting duplicate content:', error)
    }
  }

  /**
   * 移除高亮
   */
  private removeHighlights(): void {
    try {
      document.body.classList.remove('smart-tab-highlight')
      
      // 移除所有高亮元素
      const highlights = document.querySelectorAll('.smart-tab-highlight')
      highlights.forEach(el => el.classList.remove('smart-tab-highlight'))
    } catch (error) {
      console.error('Error removing highlights:', error)
    }
  }

  /**
   * 显示页面内通知
   */
  private showInPageNotification(payload: any): void {
    try {
      const notification = document.createElement('div')
      notification.className = 'smart-tab-notification'
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 4px; height: 20px; background: #007AFF; border-radius: 2px;"></div>
          <strong style="color: #111827;">${payload.title}</strong>
        </div>
        ${payload.message ? `<p style="margin: 0; color: #6B7280; font-size: 14px;">${payload.message}</p>` : ''}
      `

      document.body.appendChild(notification)

      // 3秒后自动移除
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 3000)
    } catch (error) {
      console.error('Error showing in-page notification:', error)
    }
  }
}

// 创建内容脚本实例
const contentScript = new ContentScript()

// 导出以供测试使用
export default contentScript