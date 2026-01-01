import { createApp } from 'vue'
import PopupApp from './PopupApp.vue'
import '../styles/main.css'
import '../utils/fontawesome'

// 创建Vue应用
const app = createApp(PopupApp)

// 挂载应用
app.mount('#app')

// 处理快捷键
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }

  if (event.key === 'Escape') {
    window.close()
  }
})