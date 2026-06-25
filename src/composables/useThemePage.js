import Taro from '@tarojs/taro'
import { watch } from 'vue'
import { useThemeStore } from '../stores/theme'

export const useThemePage = () => {
  const themeStore = useThemeStore()

  // setup 阶段同步初始化并应用原生主题，让导航栏 / 背景 / TabBar 在页面
  // 显示前就被设为当前主题，缩短闪烁窗口。
  themeStore.initTheme()

  // 关键修复：tab 页常驻内存，模式变化时即使页面处于隐藏态，Vue 响应式仍会
  // 触发该 watch，立即把原生窗口背景 / 导航栏 / TabBar 同步成新主题，
  // 避免再次显示该页时先闪上一套颜色。flush: 'sync' 保证不被延后到下一帧。
  watch(
    () => themeStore.effectiveTheme,
    () => themeStore.applyNativeTheme(),
    { flush: 'sync' }
  )

  // useReady 是页面首次渲染完成的最早时机，再应用一次原生主题作为兜底。
  Taro.useReady(() => {
    themeStore.applyNativeTheme()
  })

  // 切换 tab 回到已存活的页面时，setup 不会重跑，useDidShow 是能拿到的
  // 最早时机，用来同步系统主题并纠正原生样式。
  Taro.useDidShow(() => {
    themeStore.syncSystemTheme()
    themeStore.applyNativeTheme()
  })

  return themeStore
}
