import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

import './app.scss'

const pinia = createPinia()

const App = createApp({
  onLaunch() {
    const authStore = useAuthStore()
    authStore.initAuth()
  },
  onShow() {
  },
})

App.use(pinia)

export default App
