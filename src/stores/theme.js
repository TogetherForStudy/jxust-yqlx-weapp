import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import themeTokens from '../theme.json'

const STORAGE_KEY = 'themeMode'
const THEME_MODES = ['system', 'light', 'dark']

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

const normalizeMode = (mode) => THEME_MODES.includes(mode) ? mode : 'system'

const getStoredMode = () => {
  try {
    return normalizeMode(Taro.getStorageSync(STORAGE_KEY))
  } catch (error) {
    console.warn('读取主题偏好失败:', error)
    return 'system'
  }
}

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
  mode: getStoredMode(),
  systemTheme: getSystemTheme()
})

export const useThemeStore = defineStore('theme', {
  state: () => getInitialThemeState(),

  getters: {
    effectiveTheme: (state) => {
      return state.mode === 'system' ? state.systemTheme : state.mode
    },

    isDark() {
      return this.effectiveTheme === 'dark'
    },

    tokens() {
      return themeTokens[this.effectiveTheme] || themeTokens.light
    },

    pageStyle() {
      return getTokenStyle(this.tokens)
    },

    rootClass() {
      return this.isDark ? 'dark theme-dark' : 'theme-light'
    },

    modeLabel: (state) => {
      const labels = {
        system: '跟随系统',
        light: '浅色',
        dark: '深色'
      }
      return labels[state.mode] || labels.system
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
      const initialThemeState = getInitialThemeState()
      this.mode = initialThemeState.mode
      this.systemTheme = initialThemeState.systemTheme
      this.applyNativeTheme()
    },

    syncSystemTheme() {
      this.systemTheme = getSystemTheme()
    },

    setMode(mode) {
      this.mode = normalizeMode(mode)
      Taro.setStorageSync(STORAGE_KEY, this.mode)
      this.syncSystemTheme()
      this.applyNativeTheme()
    },

    handleSystemThemeChange(theme) {
      this.systemTheme = normalizeTheme(theme)
      if (this.mode === 'system') {
        this.applyNativeTheme()
      }
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
