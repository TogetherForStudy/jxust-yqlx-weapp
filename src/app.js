import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

import './app.scss'

const App = createApp({
  onLaunch(options) {
    // 初始化认证状态
    const authStore = useAuthStore()
    authStore.initAuth()
  },
  onShow(options) {
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

const pinia = createPinia()
App.use(pinia)

export default App
