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

    themeStore.initTheme()
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
