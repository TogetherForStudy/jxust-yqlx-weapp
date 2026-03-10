import { defineStore } from 'pinia'
import { notificationAPI } from '../api'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    // 通知相关状态
    notifications: [],
    notificationDetail: null,
    categories: [],
    isLoading: false,
    loadingCount: 0,

    // 通知分页状态
    notificationCurrentPage: 1,
    notificationTotalPages: 1,
    notificationTotalCount: 0,
  }),

  getters: {
    // 检查通知是否有更多数据
    hasMore: (state) => {
      return state.notificationCurrentPage < state.notificationTotalPages
    }
  },

  actions: {
    beginLoading() {
      this.loadingCount += 1
      this.isLoading = true
    },

    endLoading() {
      this.loadingCount = Math.max(0, this.loadingCount - 1)
      this.isLoading = this.loadingCount > 0
    },

    // 获取通知列表
    async fetchNotifications(params = {}) {
      this.beginLoading()
      try {
        const defaultParams = {
          page: this.notificationCurrentPage,
          size: 10,
          status: 3, // 只获取已发布的通知
          ...params
        }

        const result = await notificationAPI.getNotifications(defaultParams)

        if (params.page === 1 || !params.page) {
          this.notifications = result.data || []
        } else {
          this.notifications.push(...(result.data || []))
        }

        this.notificationTotalCount = result.total || 0
        this.notificationTotalPages = Math.ceil(this.notificationTotalCount / (params.size || 10))
        this.notificationCurrentPage = params.page || 1
        return result
      } catch (error) {
        console.error('获取信息列表失败:', error)
        throw error
      } finally {
        this.endLoading()
      }
    },

    // 获取通知详情
    async fetchNotificationDetail(id) {
      this.beginLoading()
      try {
        const result = await notificationAPI.getNotificationDetail(id)
        this.notificationDetail = result
        return result
      } catch (error) {
        console.error('获取信息详情失败:', error)
        throw error
      } finally {
        this.endLoading()
      }
    },

    // 获取通知分类
    async fetchCategories() {
      try {
        const result = await notificationAPI.getCategories()
        this.categories = result || []
        return result
      } catch (error) {
        console.error('获取信息分类失败:', error)
        throw error
      }
    },

    // 重置状态
    resetState() {
      this.notifications = []
      this.notificationDetail = null
      this.categories = []

      // 重置通知分页状态
      this.notificationCurrentPage = 1
      this.notificationTotalPages = 1
      this.notificationTotalCount = 0

      this.isLoading = false
      this.loadingCount = 0
    }
  }
})
