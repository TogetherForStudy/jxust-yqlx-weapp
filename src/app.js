import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

import './app.css'

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
