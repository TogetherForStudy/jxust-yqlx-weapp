import { useThemeStore } from '../stores/theme'

export const useThemePage = () => {
  const themeStore = useThemeStore()

  // 主题跟随系统，系统切换会重载小程序，这里初始化一次即可。
  themeStore.initTheme()

  return themeStore
}
