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

const normalizeTheme = (theme) => theme === 'dark' ? 'dark' : 'light'

const getSystemTheme = () => {
  try {
    return normalizeTheme(Taro.getAppBaseInfo()?.theme)
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
        backgroundTextStyle: this.tokens.backgroundTextStyle
      }
    }
  },

  actions: {
    initTheme() {
      this.systemTheme = getSystemTheme()
    }
  }
})
