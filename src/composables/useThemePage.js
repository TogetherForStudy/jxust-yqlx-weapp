import Taro from '@tarojs/taro'
import { useThemeStore } from '../stores/theme'

export const useThemePage = () => {
  const themeStore = useThemeStore()

  // setup 阶段同步初始化并应用原生主题，让导航栏 / 背景 / TabBar 在页面
  // 显示前就被设为当前主题，缩短闪烁窗口。
  themeStore.initTheme()

  // 切换 tab 回到已存活的页面时，setup 不会重跑，useDidShow 是能拿到的
  // 最早时机，用来同步系统主题并纠正原生样式。
  Taro.useDidShow(() => {
    themeStore.syncSystemTheme()
    themeStore.applyNativeTheme()
  })

  return themeStore
}
