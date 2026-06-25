import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'

import './app.css'

const pinia = createPinia()

const App = createApp({
  onLaunch() {
    const themeStore = useThemeStore()
    const authStore = useAuthStore()

    // 主题跟随系统：系统深浅色切换会触发小程序重载，重新走 onLaunch，
    // 因此只需在启动时初始化一次即可，无需监听 onThemeChange / onShow。
    themeStore.initTheme()

    authStore.initAuth()
  },
})

App.use(pinia)

export default App
