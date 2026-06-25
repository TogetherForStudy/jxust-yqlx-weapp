import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import themeTokens from '../theme.json'

const CSS_VAR_MAP = {
  themePage: '--theme-page',
  themeSurface: '--theme-surface',
  themeSurfaceMuted: '--theme-surface-muted',
  themeElevated: '--theme-elevated',
  themeFg: '--theme-fg',
  themeFgMuted: '--theme-fg-muted',
  themeFgSubtle: '--theme-fg-subtle',
  themeLine: '--theme-line',
  themeBrand: '--theme-brand',
  themeBrandSoft: '--theme-brand-soft',
  themeDanger: '--theme-danger',
  themeDangerSoft: '--theme-danger-soft',
  themeSuccess: '--theme-success',
  themeSuccessSoft: '--theme-success-soft',
  themeWarning: '--theme-warning',
  themeWarningSoft: '--theme-warning-soft',
  themeOverlay: '--theme-overlay',
  themeSkeletonFrom: '--theme-skeleton-from',
  themeSkeletonVia: '--theme-skeleton-via',
  themeSkeletonTo: '--theme-skeleton-to'
}

const TAB_ITEMS = [
  ['tabHomeIcon', 'tabHomeSelectedIcon'],
  ['tabScheduleIcon', 'tabScheduleSelectedIcon'],
  ['tabDiscoverIcon', 'tabDiscoverSelectedIcon'],
  ['tabProfileIcon', 'tabProfileSelectedIcon']
]

const normalizeTheme = (theme) => theme === 'dark' ? 'dark' : 'light'

const getSystemTheme = () => {
  try {
    return normalizeTheme(Taro.getSystemInfoSync()?.theme)
  } catch (error) {
    console.warn('获取系统主题失败:', error)
    return 'light'
  }
}

const getTokenStyle = (tokens) => {
  return Object.entries(CSS_VAR_MAP)
    .map(([tokenKey, cssVar]) => `${cssVar}: ${tokens[tokenKey]};`)
    .join(' ')
}

const getInitialThemeState = () => ({
  systemTheme: getSystemTheme()
})

export const useThemeStore = defineStore('theme', {
  state: () => getInitialThemeState(),

  getters: {
    // 主题始终跟随系统：原生窗口底色与内容层主题永远一致，从根本上避免
    // 切换页面时闪烁上一套主题色。
    effectiveTheme: (state) => state.systemTheme,

    isDark() {
      return this.effectiveTheme === 'dark'
    },

    tokens() {
      return themeTokens[this.effectiveTheme] || themeTokens.light
    },

    pageStyle() {
      // 显式写出背景色与前景色，确保 page-meta 在首帧即把 page 元素背景定为
      // 当前主题，而不是等待 app.css 的级联或 useDidShow 的原生纠正，避免闪烁。
      return `${getTokenStyle(this.tokens)} background-color: ${this.tokens.themePage}; color: ${this.tokens.themeFg};`
    },

    rootClass() {
      return this.isDark ? 'dark theme-dark' : 'theme-light'
    },

    nativeTheme() {
      return {
        pageBg: this.tokens.pageBgColor,
        pageBgTop: this.tokens.pageBgColorTop,
        pageBgBottom: this.tokens.pageBgColorBottom,
        navBg: this.tokens.navBgColor,
        navFrontColor: this.tokens.navTxtStyle === 'white' ? '#ffffff' : '#000000',
        backgroundTextStyle: this.tokens.backgroundTextStyle,
        tabColor: this.tokens.tabFontColor,
        tabSelectedColor: this.tokens.tabSelectedColor,
        tabBg: this.tokens.tabBgColor,
        tabBorderStyle: this.tokens.tabBorderStyle
      }
    }
  },

  actions: {
    initTheme() {
      this.systemTheme = getSystemTheme()
      this.applyNativeTheme()
    },

    applyNativeTheme() {
      const nativeTheme = this.nativeTheme

      try {
        Taro.setNavigationBarColor({
          frontColor: nativeTheme.navFrontColor,
          backgroundColor: nativeTheme.navBg
        })
      } catch (error) {
        console.warn('设置导航栏主题失败:', error)
      }

      try {
        Taro.setBackgroundColor({
          backgroundColor: nativeTheme.pageBg,
          backgroundColorTop: nativeTheme.pageBgTop,
          backgroundColorBottom: nativeTheme.pageBgBottom
        })
      } catch (error) {
        console.warn('设置页面背景主题失败:', error)
      }

      try {
        Taro.setBackgroundTextStyle({
          textStyle: nativeTheme.backgroundTextStyle
        })
      } catch (error) {
        console.warn('设置下拉背景文字主题失败:', error)
      }

      try {
        Taro.setTabBarStyle({
          color: nativeTheme.tabColor,
          selectedColor: nativeTheme.tabSelectedColor,
          backgroundColor: nativeTheme.tabBg,
          borderStyle: nativeTheme.tabBorderStyle
        })
      } catch (error) {
        console.warn('设置 tabBar 主题失败:', error)
      }

      TAB_ITEMS.forEach(([iconKey, selectedIconKey], index) => {
        try {
          Taro.setTabBarItem({
            index,
            iconPath: this.tokens[iconKey],
            selectedIconPath: this.tokens[selectedIconKey]
          })
        } catch (error) {
          console.warn(`设置 tabBar 第 ${index} 项图标失败:`, error)
        }
      })
    }
  }
})
