import Taro from '@tarojs/taro'
import { useThemeStore } from '../stores/theme'

export const useThemePage = () => {
  const themeStore = useThemeStore()

  themeStore.initTheme()

  Taro.useDidShow(() => {
    themeStore.syncSystemTheme()
    themeStore.applyNativeTheme()
  })

  return themeStore
}
