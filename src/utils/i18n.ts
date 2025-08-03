import { ref, reactive } from 'vue'
import { settings } from './storage'

// 多语言文本定义
export const messages = {
  'zh-CN': {
    // 通用
    common: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      close: '关闭',
      refresh: '刷新',
      loading: '加载中...',
      success: '成功',
      error: '错误',
      warning: '警告',
      info: '信息'
    },
    
    // 主界面
    popup: {
      title: 'Smart Tab Manager',
      search: {
        placeholder: '搜索或输入命令...',
        shortcut: '⌘K'
      },
      overview: {
        title: '概览',
        totalTabs: '个标签页',
        duplicates: '重复',
        lastSync: '刚刚同步',
        minutesAgo: '分钟前',
        hoursAgo: '小时前',
        daysAgo: '天前',
        notSynced: '未同步'
      },
      tabs: {
        title: '标签页',
        sortTime: '时间排序',
        sortDomain: '域名排序',
        sortGroup: '分组显示',
        filterAll: '全部',
        filterActive: '活跃',
        filterPinned: '固定',
        filterDuplicate: '重复',
        noTabs: '暂无标签页',
        noMatchingTabs: '没有符合条件的标签页'
      },
      workspaces: {
        title: '分组',
        newWorkspace: '新建分组',
        open: '打开分组',
        edit: '编辑分组'
      },
      tabActions: {
        title: '标签页操作',
        newTab: '新标签页',
        duplicateTab: '复制标签页'
      },
      systemActions: {
        title: '系统操作',
        sync: '同步',
        snapshot: '快照',
        restore: '恢复',
        cleanup: '清理'
      },
      language: {
        switch: '切换语言',
        chinese: '中文',
        english: 'English'
      },
      settings: {
        title: '设置'
      }
    },
    
    // 设置页面
    options: {
      title: 'Smart Tab Manager',
      description: '现代化的浏览器标签页管理工具',
      nav: {
        settings: '设置',
        general: '常规设置',
        sync: '同步设置',
        duplicates: '重复检测',
        shortcuts: '快捷键',
        data: '数据',
        snapshots: '快照记录',
        backup: '备份还原',
        about: '关于',
        aboutPlugin: '关于插件'
      },
      general: {
        appearance: '外观',
        theme: '主题',
        themeDesc: '选择界面主题',
        themeAuto: '跟随系统',
        themeLight: '浅色模式',
        themeDark: '深色模式',
        language: '语言',
        languageDesc: '界面显示语言',
        compactMode: '紧凑模式',
        compactModeDesc: '使用更紧凑的界面布局'
      },
      sync: {
        title: '同步设置',
        autoSync: '自动同步',
        autoSyncDesc: '定期自动保存浏览器状态',
        interval: '同步间隔',
        intervalDesc: '自动同步的时间间隔',
        interval1min: '1分钟',
        interval5min: '5分钟',
        interval10min: '10分钟',
        interval30min: '30分钟'
      },
      duplicates: {
        title: '重复检测',
        enable: '启用重复检测',
        enableDesc: '自动检测并提醒重复的标签页',
        whitelist: '白名单',
        whitelistDesc: '添加不需要检测重复的网站',
        whitelistPlaceholder: '输入域名，例如：example.com'
      },
      shortcuts: {
        title: '快捷键',
        description: '自定义快捷键组合',
        commandPalette: '打开命令面板',
        commandPaletteDesc: '快速访问所有功能',
        detectDuplicates: '检测重复页面',
        detectDuplicatesDesc: '扫描当前所有标签页',
        createSnapshot: '创建快照',
        createSnapshotDesc: '保存当前浏览器状态',
        restoreSession: '恢复会话',
        restoreSessionDesc: '从历史快照恢复'
      },
      snapshots: {
        title: '快照记录',
        description: '查看和管理所有保存的会话快照',
        count: '个快照',
        create: '创建快照',
        restore: '恢复',
        delete: '删除',
        export: '导出',
        time: '时间',
        tabs: '标签页',
        windows: '窗口'
      },
      backup: {
        title: '备份还原',
        export: {
          title: '导出数据',
          description: '导出所有设置和数据到文件',
          button: '导出设置'
        },
        import: {
          title: '导入数据',
          description: '从文件导入设置和数据',
          button: '选择文件'
        },
        reset: {
          title: '重置设置',
          description: '将所有设置恢复为默认值',
          button: '重置设置',
          warning: '此操作将清除所有自定义设置，是否继续？'
        }
      },
      about: {
        title: '关于插件',
        version: '版本',
        description: '现代化的浏览器标签页管理工具',
        developer: '开发者',
        license: 'MIT 许可证',
        support: '技术支持',
        github: 'GitHub 仓库'
      }
    },
    
    // 通知消息
    notifications: {
      duplicateDetected: '检测到重复页面',
      duplicateChoice: '发现重复页面！',
      tabClosed: '标签页已关闭',
      workspaceOpened: '工作空间已打开',
      snapshotCreated: '快照已创建',
      settingsSaved: '设置已保存',
      languageChanged: '语言已切换'
    },
    
    // 重复检测对话框
    duplicateDialog: {
      title: '检测到重复页面！',
      message: '当前页面与以下页面重复：',
      question: '您希望如何处理？',
      keepTab: '保留此页面',
      closeTab: '关闭并切换',
      background: '点击背景或按ESC键取消'
    }
  },
  
  'en-US': {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      close: 'Close',
      refresh: 'Refresh',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    },
    
    // Popup
    popup: {
      title: 'Smart Tab Manager',
      search: {
        placeholder: 'Search or enter command...',
        shortcut: '⌘K'
      },
      overview: {
        title: 'Overview',
        totalTabs: 'tabs',
        duplicates: 'duplicates',
        lastSync: 'just synced',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',
        notSynced: 'not synced'
      },
      tabs: {
        title: 'Tabs',
        sortTime: 'Sort by time',
        sortDomain: 'Sort by domain',
        sortGroup: 'Group display',
        filterAll: 'All',
        filterActive: 'Active',
        filterPinned: 'Pinned',
        filterDuplicate: 'Duplicates',
        noTabs: 'No tabs',
        noMatchingTabs: 'No matching tabs'
      },
      workspaces: {
        title: 'Workspaces',
        newWorkspace: 'New Workspace',
        open: 'Open Workspace',
        edit: 'Edit Workspace'
      },
      tabActions: {
        title: 'Tab Actions',
        newTab: 'New Tab',
        duplicateTab: 'Duplicate Tab'
      },
      systemActions: {
        title: 'System Actions',
        sync: 'Sync',
        snapshot: 'Snapshot',
        restore: 'Restore',
        cleanup: 'Cleanup'
      },
      language: {
        switch: 'Switch Language',
        chinese: '中文',
        english: 'English'
      },
      settings: {
        title: 'Settings'
      }
    },
    
    // Options
    options: {
      title: 'Smart Tab Manager',
      description: 'Modern browser tab management tool',
      nav: {
        settings: 'Settings',
        general: 'General',
        sync: 'Sync',
        duplicates: 'Duplicates',
        shortcuts: 'Shortcuts',
        data: 'Data',
        snapshots: 'Snapshots',
        backup: 'Backup',
        about: 'About',
        aboutPlugin: 'About Plugin'
      },
      general: {
        appearance: 'Appearance',
        theme: 'Theme',
        themeDesc: 'Choose interface theme',
        themeAuto: 'Follow System',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode',
        language: 'Language',
        languageDesc: 'Interface display language',
        compactMode: 'Compact Mode',
        compactModeDesc: 'Use more compact interface layout'
      },
      sync: {
        title: 'Sync Settings',
        autoSync: 'Auto Sync',
        autoSyncDesc: 'Automatically save browser state periodically',
        interval: 'Sync Interval',
        intervalDesc: 'Time interval for automatic sync',
        interval1min: '1 minute',
        interval5min: '5 minutes',
        interval10min: '10 minutes',
        interval30min: '30 minutes'
      },
      duplicates: {
        title: 'Duplicate Detection',
        enable: 'Enable duplicate detection',
        enableDesc: 'Automatically detect and remind duplicate tabs',
        whitelist: 'Whitelist',
        whitelistDesc: 'Add websites that do not need duplicate detection',
        whitelistPlaceholder: 'Enter domain, e.g.: example.com'
      },
      shortcuts: {
        title: 'Shortcuts',
        description: 'Customize keyboard shortcuts',
        commandPalette: 'Open Command Palette',
        commandPaletteDesc: 'Quick access to all features',
        detectDuplicates: 'Detect Duplicates',
        detectDuplicatesDesc: 'Scan all current tabs',
        createSnapshot: 'Create Snapshot',
        createSnapshotDesc: 'Save current browser state',
        restoreSession: 'Restore Session',
        restoreSessionDesc: 'Restore from history snapshots'
      },
      snapshots: {
        title: 'Snapshots',
        description: 'View and manage all saved session snapshots',
        count: 'snapshots',
        create: 'Create Snapshot',
        restore: 'Restore',
        delete: 'Delete',
        export: 'Export',
        time: 'Time',
        tabs: 'Tabs',
        windows: 'Windows'
      },
      backup: {
        title: 'Backup & Restore',
        export: {
          title: 'Export Data',
          description: 'Export all settings and data to file',
          button: 'Export Settings'
        },
        import: {
          title: 'Import Data',
          description: 'Import settings and data from file',
          button: 'Choose File'
        },
        reset: {
          title: 'Reset Settings',
          description: 'Restore all settings to default values',
          button: 'Reset Settings',
          warning: 'This will clear all custom settings. Continue?'
        }
      },
      about: {
        title: 'About Plugin',
        version: 'Version',
        description: 'Modern browser tab management tool',
        developer: 'Developer',
        license: 'MIT License',
        support: 'Support',
        github: 'GitHub Repository'
      }
    },
    
    // Notifications
    notifications: {
      duplicateDetected: 'Duplicate page detected',
      duplicateChoice: 'Found duplicate pages!',
      tabClosed: 'Tab closed',
      workspaceOpened: 'Workspace opened',
      snapshotCreated: 'Snapshot created',
      settingsSaved: 'Settings saved',
      languageChanged: 'Language switched'
    },
    
    // Duplicate Dialog
    duplicateDialog: {
      title: 'Duplicate page detected!',
      message: 'Current page duplicates with following pages:',
      question: 'How would you like to handle this?',
      keepTab: 'Keep this page',
      closeTab: 'Close and switch',
      background: 'Click background or press ESC to cancel'
    }
  }
}

// 当前语言状态
export const currentLanguage = ref<string>('zh-CN')

// 响应式的翻译文本
export const t = reactive<any>({})

// 初始化翻译文本
function updateTranslations() {
  const lang = currentLanguage.value
  const translations = messages[lang as keyof typeof messages]
  
  // 清空并重新填充翻译对象
  Object.keys(t).forEach(key => delete t[key])
  Object.assign(t, translations)
}

// 翻译函数
export function useI18n() {
  // 获取翻译文本
  const getText = (key: string): string => {
    const keys = key.split('.')
    let result: any = t
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }
    
    return typeof result === 'string' ? result : key
  }
  
  // 设置语言
  const setLanguage = async (lang: string) => {
    if (lang in messages) {
      currentLanguage.value = lang
      updateTranslations()
      
      // 保存到设置中
      try {
        const currentSettings = await settings.getSettings()
        currentSettings.ui.language = lang
        await settings.updateSettings(currentSettings)
        console.log('Language changed to:', lang)
        
        // 通知其他页面语言变化
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
              type: 'LANGUAGE_CHANGED',
              language: lang
            }).catch(() => {
              // 忽略消息发送失败的错误
            })
          }
        } catch (err) {
          // 忽略错误，可能是在options页面或其他上下文中
        }
      } catch (error) {
        console.error('Failed to save language setting:', error)
      }
    }
  }
  
  // 切换语言
  const toggleLanguage = async () => {
    const newLang = currentLanguage.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    await setLanguage(newLang)
  }
  
  // 初始化语言
  const initLanguage = async () => {
    try {
      const userSettings = await settings.getSettings()
      const savedLanguage = userSettings.ui.language || 'zh-CN'
      currentLanguage.value = savedLanguage
      updateTranslations()
    } catch (error) {
      console.error('Failed to load language setting:', error)
      updateTranslations()
    }
  }
  
  return {
    t: getText,
    currentLanguage,
    setLanguage,
    toggleLanguage,
    initLanguage,
    availableLanguages: Object.keys(messages)
  }
}

// 初始化翻译
updateTranslations() 