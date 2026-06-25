import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import Taro from '@tarojs/taro'

import './app.css'

const pinia = createPinia()

const App = createApp({
  onLaunch() {
    const themeStore = useThemeStore()
    const authStore = useAuthStore()

    // 冷启动尽早应用原生主题，让首个页面在显示前原生背景 / 导航栏 / TabBar
    // 就是用户选择的主题，而不是跟随系统的静态占位值。
    themeStore.initTheme()
    themeStore.applyNativeTheme()

    Taro.onThemeChange(({ theme }) => {
      themeStore.handleSystemThemeChange(theme)
    })

    authStore.initAuth()
  },
  onShow() {
    const themeStore = useThemeStore()
    themeStore.syncSystemTheme()
    themeStore.applyNativeTheme()
  },
})

App.use(pinia)

export default App
