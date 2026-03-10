import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import { authAPI, userAPI } from '../api'

const STORAGE_KEYS = {
  token: 'token',
  refreshToken: 'refreshToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  userInfo: 'userInfo'
}

const normalizeTimestampToMs = (timestamp) => {
  if (timestamp === null || timestamp === undefined || timestamp === '') {
    return null
  }

  const numericTimestamp = Number(timestamp)
  if (Number.isNaN(numericTimestamp) || numericTimestamp <= 0) {
    return null
  }

  return numericTimestamp > 1e12 ? numericTimestamp : numericTimestamp * 1000
}

let ongoingRefreshPromise = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    userInfo: null,
    isLoggedIn: false
  }),

  getters: {
    userId: (state) => {
      return state.userInfo?.id
    },

    userClass: (state) => {
      return state.userInfo?.class_id
    }
  },

  actions: {
    // 初始化认证状态
    initAuth() {
      try {
        const token = Taro.getStorageSync(STORAGE_KEYS.token)
        const refreshToken = Taro.getStorageSync(STORAGE_KEYS.refreshToken)
        const accessTokenExpiresAt = Taro.getStorageSync(STORAGE_KEYS.accessTokenExpiresAt)
        const userInfo = Taro.getStorageSync(STORAGE_KEYS.userInfo)

        if (token && userInfo) {
          this.token = token
          this.refreshToken = refreshToken || null
          this.accessTokenExpiresAt = accessTokenExpiresAt || null
          this.userInfo = userInfo
          this.isLoggedIn = true
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error)
      }
    },

    // 微信登录
    async wechatLogin() {

      try {
        // 获取微信登录code
        const { code } = await Taro.login()
        if (!code) {
          throw new Error('获取微信登录code失败')
        }

        // 调用后端登录接口
        const result = await authAPI.wechatLogin(code)
        if (result.token && result.refresh_token && result.user_info) {
          // 保存认证信息
          this.setAuth({
            token: result.token,
            refreshToken: result.refresh_token,
            accessTokenExpiresAt: result.access_token_expires_at,
            userInfo: result.user_info
          })
          Taro.showToast({
            title: '登录成功',
            icon: 'success'
          })
          return result
        } else {
          throw new Error('登录响应数据异常')
        }
      } catch (error) {
        console.error('微信登录失败:', error)

        Taro.showToast({
          title: error.message || '登录失败',
          icon: 'error'
        })

        throw error
      }
    },

    // 设置认证信息
    setAuth(authData, userInfo) {
      try {
        const normalizedAuthData = typeof authData === 'object' && authData !== null
          ? authData
          : {
              token: authData,
              userInfo
            }

        const {
          token,
          refreshToken = null,
          accessTokenExpiresAt = null,
          userInfo: nextUserInfo = null
        } = normalizedAuthData

        this.token = token
        this.refreshToken = refreshToken
        this.accessTokenExpiresAt = accessTokenExpiresAt || null
        this.userInfo = nextUserInfo
        this.isLoggedIn = true

        // 持久化存储
        Taro.setStorageSync(STORAGE_KEYS.token, token)
        Taro.setStorageSync(STORAGE_KEYS.userInfo, nextUserInfo)

        if (refreshToken) {
          Taro.setStorageSync(STORAGE_KEYS.refreshToken, refreshToken)
        } else {
          Taro.removeStorageSync(STORAGE_KEYS.refreshToken)
        }

        if (accessTokenExpiresAt) {
          Taro.setStorageSync(STORAGE_KEYS.accessTokenExpiresAt, accessTokenExpiresAt)
        } else {
          Taro.removeStorageSync(STORAGE_KEYS.accessTokenExpiresAt)
        }
      } catch (error) {
        console.error('保存认证信息失败:', error)
      }
    },

    clearAuthState() {
      this.token = null
      this.refreshToken = null
      this.accessTokenExpiresAt = null
      this.userInfo = null
      this.isLoggedIn = false
    },

    clearAuthStorage() {
      Taro.removeStorageSync(STORAGE_KEYS.token)
      Taro.removeStorageSync(STORAGE_KEYS.refreshToken)
      Taro.removeStorageSync(STORAGE_KEYS.accessTokenExpiresAt)
      Taro.removeStorageSync(STORAGE_KEYS.userInfo)
    },

    isAccessTokenExpiringSoon(bufferMs = 60 * 1000) {
      const expiresAtMs = normalizeTimestampToMs(this.accessTokenExpiresAt)
      if (!this.token || !this.refreshToken || !expiresAtMs) {
        return false
      }

      return expiresAtMs - Date.now() <= bufferMs
    },

    async refreshAccessToken(options = {}) {
      const {
        silent = true,
        force = false
      } = options

      if (!this.refreshToken) {
        throw new Error('缺少刷新令牌，请重新登录')
      }

      if (!force && this.token && !this.isAccessTokenExpiringSoon()) {
        return this.token
      }

      if (ongoingRefreshPromise) {
        return ongoingRefreshPromise
      }

      const currentRefreshToken = this.refreshToken
      ongoingRefreshPromise = (async () => {
        const result = await authAPI.refresh(currentRefreshToken, { silent })
        if (!result?.token || !result?.refresh_token || !result?.user_info) {
          throw new Error('刷新登录态失败')
        }

        this.setAuth({
          token: result.token,
          refreshToken: result.refresh_token,
          accessTokenExpiresAt: result.access_token_expires_at,
          userInfo: result.user_info
        })

        return result.token
      })()

      try {
        return await ongoingRefreshPromise
      } catch (error) {
        console.error('刷新访问令牌失败:', error)
        throw error
      } finally {
        ongoingRefreshPromise = null
      }
    },

    async ensureValidAccessToken(bufferMs = 60 * 1000) {
      if (!this.token || !this.refreshToken) {
        return this.token
      }

      if (!this.isAccessTokenExpiringSoon(bufferMs)) {
        return this.token
      }

      return this.refreshAccessToken({ silent: true })
    },

    // 退出登录
    async logout(options = {}) {
      const {
        remote = true,
        showToast = true
      } = options

      const accessToken = this.token

      this.clearAuthState()
      this.clearAuthStorage()

      if (showToast) {
        Taro.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      }

      try {
        if (remote && accessToken) {
          authAPI.logout({
            authToken: accessToken,
            silent: true
          }).catch(error => {
            console.error('服务端退出登录失败:', error)
          })
        }
      } catch (error) {
        console.error('服务端退出登录失败:', error)
      }
    },

    expireToken(options = {}) {
      const normalizedOptions = typeof options === 'string'
        ? { title: options }
        : options

      const {
        title = '请重新登录',
        showToast = true,
        navigate = true
      } = normalizedOptions

      if (!this.isLoggedIn && !this.token && !this.refreshToken) {
        return
      }

      this.clearAuthState()

      try {
        this.clearAuthStorage()

        if (showToast) {
          Taro.showToast({
            title,
            icon: 'error'
          })
        }

        if (navigate) {
          Taro.navigateTo({ url: '/pages/login/index' })
        }
      } catch (error) {
        console.error('expireToken处理失败:', error)
      }
    },

    // 更新用户信息
    async updateUserInfo(data) {
      try {
        await userAPI.updateProfile(data)

        // 更新本地用户信息
        const updatedUserInfo = { ...this.userInfo, ...data }
        this.userInfo = updatedUserInfo
        Taro.setStorageSync(STORAGE_KEYS.userInfo, updatedUserInfo)

        Taro.showToast({
          title: '更新成功',
          icon: 'success'
        })

        return updatedUserInfo
      } catch (error) {
        console.error('更新用户信息失败:', error)
        throw error
      }
    },

    // 获取最新用户信息
    async fetchUserInfo() {
      try {
        const userInfo = await userAPI.getProfile()
        this.userInfo = userInfo
        Taro.setStorageSync(STORAGE_KEYS.userInfo, userInfo)
        return userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    // 检查是否需要登录
    requireAuth() {
      if (!this.isLoggedIn) {
        Taro.navigateTo({ url: '/pages/login/index' })
        return false
      }
      return true
    }
  }
})
