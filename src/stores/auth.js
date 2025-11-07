import { defineStore } from 'pinia'
import Taro from '@tarojs/taro'
import { authAPI, userAPI } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    userInfo: null,
    isLoggedIn: false
  }),

  getters: {
    isAdmin: (state) => {
      return state.userInfo?.role === 2
    },

    isOperator: (state) => {
      return state.userInfo?.role === 3
    },

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
        const token = Taro.getStorageSync('token')
        const userInfo = Taro.getStorageSync('userInfo')

        if (token && userInfo) {
          this.token = token
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
        if (result.token && result.user_info) {
          // 保存认证信息
          this.setAuth(result.token, result.user_info)
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
    setAuth(token, userInfo) {
      try {
        this.token = token
        this.userInfo = userInfo
        this.isLoggedIn = true

        // 持久化存储
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('userInfo', userInfo)
      } catch (error) {
        console.error('保存认证信息失败:', error)
      }
    },

    // 退出登录
    logout() {
      try {
        this.token = null
        this.userInfo = null
        this.isLoggedIn = false

        // 清除本地存储
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('userInfo')

        Taro.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },

    expireToken() {
      this.token = null
      this.userInfo = null
      this.isLoggedIn = false
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      Taro.showToast({
        title: '请重新登录',
        icon: 'error'
      })
      Taro.navigateTo({ url: '/pages/login/index' })
    },

    // 更新用户信息
    async updateUserInfo(data) {
      try {
        await userAPI.updateProfile(data)

        // 更新本地用户信息
        const updatedUserInfo = { ...this.userInfo, ...data }
        this.userInfo = updatedUserInfo
        Taro.setStorageSync('userInfo', updatedUserInfo)

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
        Taro.setStorageSync('userInfo', userInfo)
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
