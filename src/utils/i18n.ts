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
        currentSort: '当前排序',
        filterAll: '全部',
        filterActive: '活跃',
        filterPinned: '固定',
        filterDuplicate: '重复',
        noTabs: '暂无标签页',
        noMatchingTabs: '没有符合条件的标签页',
        closeTab: '关闭标签页'
      },
      workspaces: {
        title: '分组',
        newWorkspace: '新建分组',
        open: '打开分组',
        edit: '编辑分组',
        selector: {
          title: '选择分组',
          description: '将 "{title}" 添加到哪个分组？',
          tabsCount: '个标签页',
          cancel: '取消'
        },
        prompts: {
          createName: '请输入分组名称：',
          editName: '请输入新的分组名称：',
          defaultName: '分组 {number}'
        },
        notifications: {
          tabExists: '标签页已存在',
          tabExistsMessage: '"{title}" 已在分组中',
          addSuccess: '添加成功',
          addSuccessMessage: '已添加到 "{name}"',
          workspaceOpened: '工作空间已打开',
          workspaceOpenedMessage: '打开了 {count} 个标签页',
          openFailed: '打开失败',
          openFailedMessage: '无法打开工作空间',
          updateSuccess: '分组已更新',
          updateSuccessMessage: '分组名称已更改为 "{name}"',
          updateFailed: '更新失败',
          updateFailedMessage: '无法更新分组名称',
          createSuccess: '分组已创建',
          createFailed: '创建失败',
          createFailedMessage: '无法创建分组'
        }
      },
      tabActions: {
        title: '标签页操作',
        newTab: '新标签页',
        duplicateTab: '复制标签页',
        newTabPrompt: '请输入要打开的网址：',
        newTabDefault: 'https://',
        notifications: {
          newTabCreated: '新标签页已创建',
          newTabCreatedMessage: '✅ 已成功打开新的标签页',
          duplicateTabWarning: '已创建重复标签页',
          duplicateTabWarningMessage: '⚠️ 已打开新标签页，但检测到 {count} 个重复页面',
          createFailed: '创建失败',
          createFailedMessage: '❌ 无法创建新标签页，请重试',
          tabDuplicated: '标签页已复制',
          tabDuplicatedMessage: '✅ 已成功复制当前标签页',
          duplicateTabCreated: '已创建重复标签页',
          duplicateTabCreatedMessage: '⚠️ 已复制标签页，现在共有 {count} 个相同页面',
          operationCancelled: '操作已取消',
          operationCancelledMessage: '已取消复制重复标签页',
          duplicateFailed: '复制失败',
          duplicateFailedMessage: '❌ 无法复制当前标签页，请重试',
          duplicateFailedNoTab: '❌ 无法获取当前标签页信息',
          tabClosed: '标签页已关闭',
          tabClosedMessage: '已关闭 "{title}"',
          closeFailed: '关闭失败',
          closeFailedMessage: '无法关闭标签页'
        },
        duplicateDialog: {
          title: '⚠️ 检测到重复页面！',
          message: '当前页面与以下页面重复：\n{info}\n\n❓ 是否仍要复制当前标签页？\n\n✅ 点击"确定"：复制标签页\n❌ 点击"取消"：不复制'
        }
      },
      cleanup: {
        dialog: {
          title: '清理重复页面',
          description: '发现 {count} 组重复页面，将保留每组的第一个标签页',
          groupCount: '个',
          keep: '保留',
          close: '关闭',
          moreTabs: '还有 {count} 个标签页将被关闭',
          moreGroups: '还有 {count} 组重复页面...',
          cancel: '取消',
          confirm: '确认清理'
        },
        notifications: {
          completed: '清理完成',
          completedMessage: '已关闭 {count} 个重复标签页',
          nothingClosed: '无法清理',
          nothingClosedMessage: '没有成功关闭任何标签页',
          failed: '清理失败',
          failedMessage: '清理过程中出现错误'
        }
      },
      systemActions: {
        title: '系统操作',
        sync: '同步',
        snapshot: '快照',
        restore: '恢复',
        cleanup: '清理',
        notifications: {
          snapshotCreated: '快照已创建',
          snapshotCreateFailed: '创建失败',
          snapshotCreateFailedMessage: '无法创建快照',
          syncCompleted: '同步完成',
          syncCompletedMessage: '会话已保存',
          syncFailed: '同步失败',
          syncFailedMessage: '请稍后重试',
          noSnapshots: '没有快照',
          noSnapshotsMessage: '没有可恢复的会话快照',
          getSnapshotsFailed: '获取失败',
          getSnapshotsFailedMessage: '无法获取会话快照',
          restoreSuccess: '恢复成功',
          restoreSuccessMessage: '已恢复 "{name}" 快照'
        },
        snapshotNames: {
          manualPrefix: '手动快照',
          autoPrefix: '自动快照'
        },
        restoreDialog: {
          title: '恢复会话',
          description: '选择要恢复的会话快照',
          noSnapshots: '暂无可用快照',
          tabsCount: '个标签页',
          cancel: '取消'
        }
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
        rules: {
          title: '检测规则',
          description: '选择要启用的重复检测规则',
          exactMatch: '完全匹配',
          exactMatchDesc: 'URL 完全相同时判定为重复',
          domainMatch: '域名+路径匹配',
          domainMatchDesc: '域名和路径相同时判定为重复（忽略查询参数）',
          titleMatch: '标题相似度匹配',
          titleMatchDesc: '页面标题相似度超过阈值时判定为重复',
          smartMatch: '智能综合匹配',
          smartMatchDesc: '综合 URL 结构和标题相似度进行智能判断'
        },
        threshold: {
          title: '相似度阈值',
          description: '设置相似度判断的阈值 (0.1 - 1.0)'
        },
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
        latest: '最新',
        refresh: '刷新',
        loading: '加载中...',
        noSnapshots: {
          title: '暂无快照',
          description: '您还没有创建任何会话快照'
        },
        create: '创建快照',
        restore: '恢复',
        delete: '删除',
        export: '导出',
        time: '时间',
        tabs: '标签页',
        windows: '窗口',
        details: {
          tabsCount: '标签页数量',
          windowsCount: '窗口数量',
          type: '类型',
          manual: '手动创建',
          auto: '自动创建'
        },
        tooltips: {
          restore: '恢复快照',
          delete: '删除快照'
        },
        messages: {
          createSuccess: '快照创建成功',
          createFailed: '创建快照失败',
          restoreSuccess: '快照恢复成功',
          restoreFailed: '恢复快照失败',
          deleteFailed: '删除快照失败',
          restoreConfirm: '确定要恢复快照 "{name}" 吗？这将关闭当前所有标签页并打开快照中的标签页。',
          deleteConfirm: '确定要删除快照 "{name}" 吗？此操作不可撤销。'
        }
      },
      backup: {
        title: '备份还原',
        export: {
          title: '导出数据',
          description: '导出所有设置、工作空间和快照数据',
          button: '导出数据'
        },
        import: {
          title: '导入数据',
          description: '从备份文件恢复数据',
          button: '选择文件',
          error: '导入失败，请检查文件格式'
        },
        reset: {
          title: '重置数据',
          description: '清除所有数据并恢复默认设置',
          button: '重置所有数据',
          confirm: '确定要重置所有数据吗？此操作不可撤销。'
        }
      },
      about: {
        title: '关于插件',
        pageTitle: '关于 Smart Tab Manager',
        version: {
          title: '版本信息',
          version: '版本',
          buildDate: '构建日期',
          team: '开发团队'
        },
        license: {
          title: '开源协议',
          description: '本项目基于 MIT 协议开源',
          viewSource: '查看源码'
        },
        support: {
          title: '反馈与支持',
          description: '如果您遇到问题或有功能建议，请访问我们的 GitHub 项目页面',
          reportIssue: '报告问题'
        },
        values: {
          versionNumber: '1.0.0',
          buildDateValue: '2024年1月20日',
          teamName: 'Smart Tab Manager Team'
        }
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
      languageChanged: '语言已切换',
      // Popup相关通知
      duplicateFound: '发现重复页面',
      duplicateFoundMessage: '找到 {count} 个重复页面',
      detectionFailed: '检测失败',
      detectionFailedMessage: '无法检测重复页面',
      noWorkspace: '没有分组',
      noWorkspaceMessage: '请先创建一个分组',
      addFailed: '添加失败',
      addFailedMessage: '无法添加到分组',
      noCleanupNeeded: '无需清理',
      noCleanupNeededMessage: '没有发现重复页面',
      duplicateDialog: '⚠️ 发现重复页面！\n\n重复页面：{info}\n\n❓ 您希望如何处理？\n\n✅ 点击"确定"：仍然打开新标签页\n❌ 点击"取消"：切换到现有页面',
      switchedToExisting: '已切换到现有页面',
      switchedToExistingMessage: '已切换到现有的标签页：{title}',
      restoreFailed: '恢复失败',
      restoreFailedMessage: '无法恢复会话快照'
    },
    
    // 重复检测对话框
    duplicateDialog: {
      title: '检测到重复页面！',
      message: '当前页面与以下页面重复：',
      question: '您希望如何处理？',
      keepTab: '保留此页面',
      closeTab: '关闭并切换',
      background: '点击背景或按ESC键取消'
    },
    
    // 后台脚本
    background: {
      closeSnapshot: '浏览器关闭前保存'
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
        currentSort: 'Current sort',
        filterAll: 'All',
        filterActive: 'Active',
        filterPinned: 'Pinned',
        filterDuplicate: 'Duplicates',
        noTabs: 'No tabs',
        noMatchingTabs: 'No matching tabs',
        closeTab: 'Close Tab'
      },
      workspaces: {
        title: 'Workspaces',
        newWorkspace: 'New Workspace',
        open: 'Open Workspace',
        edit: 'Edit Workspace',
        selector: {
          title: 'Select Workspace',
          description: 'Add "{title}" to which workspace?',
          tabsCount: 'tabs',
          cancel: 'Cancel'
        },
        prompts: {
          createName: 'Please enter workspace name:',
          editName: 'Please enter new workspace name:',
          defaultName: 'Workspace {number}'
        },
        notifications: {
          tabExists: 'Tab already exists',
          tabExistsMessage: '"{title}" already in workspace',
          addSuccess: 'Added successfully',
          addSuccessMessage: 'Added to "{name}"',
          workspaceOpened: 'Workspace opened',
          workspaceOpenedMessage: 'Opened {count} tabs',
          openFailed: 'Failed to open workspace',
          openFailedMessage: 'Failed to open workspace',
          updateSuccess: 'Workspace updated',
          updateSuccessMessage: 'Workspace name changed to "{name}"',
          updateFailed: 'Update failed',
          updateFailedMessage: 'Failed to update workspace name',
          createSuccess: 'Workspace created',
          createFailed: 'Creation failed',
          createFailedMessage: 'Failed to create workspace'
        }
      },
      tabActions: {
        title: 'Tab Actions',
        newTab: 'New Tab',
        duplicateTab: 'Duplicate Tab',
        newTabPrompt: 'Please enter the URL to open:',
        newTabDefault: 'https://',
        notifications: {
          newTabCreated: 'New tab created',
          newTabCreatedMessage: '✅ New tab successfully opened',
          duplicateTabWarning: 'Duplicate tab created',
          duplicateTabWarningMessage: '⚠️ New tab opened, but {count} duplicate pages detected',
          createFailed: 'Creation failed',
          createFailedMessage: '❌ Failed to create new tab, please try again',
          tabDuplicated: 'Tab duplicated',
          tabDuplicatedMessage: '✅ Current tab successfully duplicated',
          duplicateTabCreated: 'Duplicate tab created',
          duplicateTabCreatedMessage: '⚠️ Current tab duplicated, now there are {count} identical pages',
          operationCancelled: 'Operation cancelled',
          operationCancelledMessage: 'Duplicate tab duplication cancelled',
          duplicateFailed: 'Duplication failed',
          duplicateFailedMessage: '❌ Failed to duplicate current tab, please try again',
          duplicateFailedNoTab: '❌ Failed to get current tab information',
          tabClosed: 'Tab closed',
          tabClosedMessage: 'Closed "{title}"',
          closeFailed: 'Failed to close tab',
          closeFailedMessage: 'Failed to close tab'
        },
        duplicateDialog: {
          title: '⚠️ Duplicate page detected!',
          message: 'Current page duplicates with following pages:\n{info}\n\n❓ Do you still want to duplicate the current tab?\n\n✅ Click "OK": Duplicate tab\n❌ Click "Cancel": Do not duplicate'
        }
      },
      cleanup: {
        dialog: {
          title: 'Clean up duplicate pages',
          description: 'Found {count} duplicate groups, the first tab of each group will be kept',
          groupCount: 'groups',
          keep: 'Keep',
          close: 'Close',
          moreTabs: 'There are {count} tabs to be closed',
          moreGroups: 'There are {count} duplicate groups...',
          cancel: 'Cancel',
          confirm: 'Confirm cleanup'
        },
        notifications: {
          completed: 'Cleanup completed',
          completedMessage: 'Closed {count} duplicate tabs',
          nothingClosed: 'Nothing to clean up',
          nothingClosedMessage: 'No tabs successfully closed',
          failed: 'Cleanup failed',
          failedMessage: 'An error occurred during cleanup'
        }
      },
      systemActions: {
        title: 'System Actions',
        sync: 'Sync',
        snapshot: 'Snapshot',
        restore: 'Restore',
        cleanup: 'Cleanup',
        notifications: {
          snapshotCreated: 'Snapshot created',
          snapshotCreateFailed: 'Creation failed',
          snapshotCreateFailedMessage: 'Failed to create snapshot',
          syncCompleted: 'Sync completed',
          syncCompletedMessage: 'Session saved',
          syncFailed: 'Sync failed',
          syncFailedMessage: 'Please try again later',
          noSnapshots: 'No snapshots',
          noSnapshotsMessage: 'No session snapshots available for restoration',
          getSnapshotsFailed: 'Failed to get',
          getSnapshotsFailedMessage: 'Failed to get session snapshots',
          restoreSuccess: 'Restored successfully',
          restoreSuccessMessage: 'Restored "{name}" snapshot'
        },
        snapshotNames: {
          manualPrefix: 'Manual Snapshot',
          autoPrefix: 'Auto Snapshot'
        },
        restoreDialog: {
          title: 'Restore Session',
          description: 'Select the session snapshot to restore',
          noSnapshots: 'No snapshots available',
          tabsCount: 'tabs',
          cancel: 'Cancel'
        }
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
        rules: {
          title: 'Detection Rules',
          description: 'Select which duplicate detection rules to enable',
          exactMatch: 'Exact Match',
          exactMatchDesc: 'Determine as duplicate when URL is exactly the same',
          domainMatch: 'Domain + Path Match',
          domainMatchDesc: 'Determine as duplicate when domain and path are the same (ignoring query parameters)',
          titleMatch: 'Title Similarity Match',
          titleMatchDesc: 'Determine as duplicate when page title similarity exceeds threshold',
          smartMatch: 'Smart Comprehensive Match',
          smartMatchDesc: 'Intelligently determine based on URL structure and title similarity'
        },
        threshold: {
          title: 'Similarity Threshold',
          description: 'Set the similarity threshold for judgment (0.1 - 1.0)'
        },
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
        latest: 'Latest',
        refresh: 'Refresh',
        loading: 'Loading...',
        noSnapshots: {
          title: 'No Snapshots',
          description: 'You have not created any session snapshots yet'
        },
        create: 'Create Snapshot',
        restore: 'Restore',
        delete: 'Delete',
        export: 'Export',
        time: 'Time',
        tabs: 'Tabs',
        windows: 'Windows',
        details: {
          tabsCount: 'Tabs Count',
          windowsCount: 'Windows Count',
          type: 'Type',
          manual: 'Manual',
          auto: 'Auto'
        },
        tooltips: {
          restore: 'Restore Snapshot',
          delete: 'Delete Snapshot'
        },
        messages: {
          createSuccess: 'Snapshot created successfully',
          createFailed: 'Failed to create snapshot',
          restoreSuccess: 'Snapshot restored successfully',
          restoreFailed: 'Failed to restore snapshot',
          deleteFailed: 'Failed to delete snapshot',
          restoreConfirm: 'Are you sure you want to restore snapshot "{name}"? This will close all current tabs and open tabs from the snapshot.',
          deleteConfirm: 'Are you sure you want to delete snapshot "{name}"? This action cannot be undone.'
        }
      },
      backup: {
        title: 'Backup & Restore',
        export: {
          title: 'Export Data',
          description: 'Export all settings, workspaces and snapshot data',
          button: 'Export Data'
        },
        import: {
          title: 'Import Data',
          description: 'Restore data from backup file',
          button: 'Choose File',
          error: 'Import failed, please check file format'
        },
        reset: {
          title: 'Reset Data',
          description: 'Clear all data and restore default settings',
          button: 'Reset All Data',
          confirm: 'Are you sure you want to reset all data? This action cannot be undone.'
        }
      },
      about: {
        title: 'About Plugin',
        pageTitle: 'About Smart Tab Manager',
        version: {
          title: 'Version Information',
          version: 'Version',
          buildDate: 'Build Date',
          team: 'Development Team'
        },
        license: {
          title: 'Open Source License',
          description: 'This project is open source under the MIT license',
          viewSource: 'View Source'
        },
        support: {
          title: 'Feedback & Support',
          description: 'If you encounter any issues or have feature suggestions, please visit our GitHub project page',
          reportIssue: 'Report an Issue'
        },
        values: {
          versionNumber: '1.0.0',
          buildDateValue: 'January 20, 2024',
          teamName: 'Smart Tab Manager Team'
        }
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
      languageChanged: 'Language switched',
      // Popup相关通知
      duplicateFound: 'Duplicate page detected',
      duplicateFoundMessage: 'Found {count} duplicate pages',
      detectionFailed: 'Detection failed',
      detectionFailedMessage: 'Failed to detect duplicate pages',
      noWorkspace: 'No workspace',
      noWorkspaceMessage: 'Please create a workspace first',
      addFailed: 'Add failed',
      addFailedMessage: 'Failed to add to workspace',
      noCleanupNeeded: 'No cleanup needed',
      noCleanupNeededMessage: 'No duplicate pages found',
      duplicateDialog: '⚠️ Duplicate page detected!\n\nDuplicate pages: {info}\n\n❓ How would you like to handle this?\n\n✅ Click "OK": Open new tab\n❌ Click "Cancel": Switch to existing page',
      switchedToExisting: 'Switched to existing page',
      switchedToExistingMessage: 'Switched to existing tab: {title}',
      restoreFailed: 'Restore failed',
      restoreFailedMessage: 'Failed to restore session snapshot'
    },
    
    // Duplicate Dialog
    duplicateDialog: {
      title: 'Duplicate page detected!',
      message: 'Current page duplicates with following pages:',
      question: 'How would you like to handle this?',
      keepTab: 'Keep this page',
      closeTab: 'Close and switch',
      background: 'Click background or press ESC to cancel'
    },
    
    // Background script
    background: {
      closeSnapshot: 'Saved before browser close'
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

// 独立的翻译函数，可以在工具类中使用
export function getTranslation(key: string, fallback?: string): string {
  try {
    const keys = key.split('.')
    let result: any = t
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        return fallback || key
      }
    }
    
    return typeof result === 'string' ? result : (fallback || key)
  } catch (error) {
    return fallback || key
  }
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