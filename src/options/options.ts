import { createApp } from 'vue'
import OptionsApp from './OptionsApp.vue'
import '../styles/main.css'

// 创建Vue应用
const app = createApp(OptionsApp)

// 挂载应用
app.mount('#app')