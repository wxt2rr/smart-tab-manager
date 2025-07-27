import { createApp } from 'vue'
import PopupApp from './PopupApp.vue'
import '../styles/main.css'

// 创建Vue应用
const app = createApp(PopupApp)

// 挂载应用
app.mount('#app')

// 处理快捷键
document.addEventListener('keydown', (event) => {
  // ⌘K / Ctrl+K 打开命令面板
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    // 触发命令面板事件
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }
  
  // ESC 关闭弹窗
  if (event.key === 'Escape') {
    window.close()
  }
})