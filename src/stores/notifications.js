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

    // 通知统计数据
    notificationStats: {
      total_count: 0,
      draft_count: 0,
      pending_count: 0,
      published_count: 0
    },

    // 管理员相关状态
    adminNotifications: [],
    adminNotificationDetail: null,

    // 管理员通知分页状态
    adminCurrentPage: 1,
    adminTotalPages: 1,
    adminTotalCount: 0,

  }),

  getters: {
    // 获取已发布的通知
    publishedNotifications: (state) => {
      return state.notifications.filter(item => item.status === 3)
    },

    // 获取待审核的通知（管理员用）
    pendingNotifications: (state) => {
      return state.adminNotifications.filter(item => item.status === 2)
    },

    // 检查通知是否有更多数据
    hasMore: (state) => {
      return state.notificationCurrentPage < state.notificationTotalPages
    },

    // 检查管理员通知是否有更多数据
    adminHasMore: (state) => {
      return state.adminCurrentPage < state.adminTotalPages
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

    // 创建通知（运营专用）
    async createNotification(data) {
      try {
        const result = await notificationAPI.createNotification(data)
        return result
      } catch (error) {
        console.error('创建信息失败:', error)
        throw error
      }
    },

    // 更新通知（运营专用）
    async updateNotification(id, data) {
      try {
        const result = await notificationAPI.updateNotification(id, data)
        return result
      } catch (error) {
        console.error('更新信息失败:', error)
        throw error
      }
    },

    // 发布通知（运营专用）
    async publishNotification(id) {
      try {
        const result = await notificationAPI.publishNotification(id)
        // 更新本地状态
        await this.fetchNotifications({ page: 1 })
        return result
      } catch (error) {
        console.error('发布信息失败:', error)
        throw error
      }
    },

    // 管理员直通发布通知（管理员专用）
    async publishAdminNotification(id) {
      try {
        const result = await notificationAPI.publishAdminNotification(id)
        // 更新本地状态
        await this.fetchAdminNotifications({ page: 1 })
        return result
      } catch (error) {
        console.error('管理员直通发布信息失败:', error)
        throw error
      }
    },

    // 删除通知（运营专用）
    async deleteNotification(id) {
      try {
        const result = await notificationAPI.deleteNotification(id)
        // 更新本地状态
        this.notifications = this.notifications.filter(item => item.id !== id)
        return result
      } catch (error) {
        console.error('删除信息失败:', error)
        throw error
      }
    },

    // 审核通知（管理员专用）
    async approveNotification(id, data) {
      try {
        const result = await notificationAPI.approveNotification(id, data)
        // 更新本地状态
        await this.fetchAdminNotifications({ page: 1 })
        return result
      } catch (error) {
        console.error('审核信息失败:', error)
        throw error
      }
    },

    // 获取管理员通知列表（管理员专用）
    async fetchAdminNotifications(params = {}) {
      this.beginLoading()
      try {
        const defaultParams = {
          page: this.adminCurrentPage,
          size: 10,
          ...params
        }

        const result = await notificationAPI.getAdminNotifications(defaultParams)

        if (params.page === 1 || !params.page) {
          this.adminNotifications = result.data || []
        } else {
          this.adminNotifications.push(...(result.data || []))
        }

        this.adminTotalCount = result.total || 0
        this.adminTotalPages = Math.ceil(this.adminTotalCount / (params.size || 10))
        this.adminCurrentPage = params.page || 1

        return result
      } catch (error) {
        console.error('获取管理员信息列表失败:', error)
        throw error
      } finally {
        this.endLoading()
      }
    },

    // 获取管理员通知详情（管理员专用）
    async fetchAdminNotificationDetail(id) {
      this.beginLoading()
      try {
        const result = await notificationAPI.getAdminNotificationDetail(id)
        this.adminNotificationDetail = result
        return result
      } catch (error) {
        console.error('获取管理员信息详情失败:', error)
        throw error
      } finally {
        this.endLoading()
      }
    },

    // 获取通知统计（管理员专用）
    async fetchNotificationStats() {
      try {
        const result = await notificationAPI.getNotificationStats()
        this.notificationStats = result || this.notificationStats
        return result
      } catch (error) {
        console.error('获取通知统计失败:', error)
        throw error
      }
    },

    // 置顶通知（管理员专用）
    async pinNotification(id) {
      try {
        const result = await notificationAPI.pinNotification(id)
        // 更新本地状态
        await this.fetchAdminNotifications({ page: 1 })
        return result
      } catch (error) {
        console.error('置顶信息失败:', error)
        throw error
      }
    },

    // 取消置顶通知（管理员专用）
    async unpinNotification(id) {
      try {
        const result = await notificationAPI.unpinNotification(id)
        // 更新本地状态
        await this.fetchAdminNotifications({ page: 1 })
        return result
      } catch (error) {
        console.error('取消置顶信息失败:', error)
        throw error
      }
    },

    // 转换通知为日程（需认证）
    async convertToSchedule(id, data) {
      try {
        const result = await notificationAPI.convertToSchedule(id, data)
        return result
      } catch (error) {
        console.error('转换信息为日程失败:', error)
        throw error
      }
    },

    // 创建通知分类（管理员专用）
    async createCategory(data) {
      try {
        const result = await notificationAPI.createCategory(data)
        // 更新本地分类列表
        await this.fetchCategories()
        return result
      } catch (error) {
        console.error('创建分类失败:', error)
        throw error
      }
    },

    // 更新通知分类（管理员专用）
    async updateCategory(id, data) {
      try {
        const result = await notificationAPI.updateCategory(id, data)
        // 更新本地分类列表
        await this.fetchCategories()
        return result
      } catch (error) {
        console.error('更新分类失败:', error)
        throw error
      }
    },

    // 重置状态
    resetState() {
      this.notifications = []
      this.notificationDetail = null
      this.adminNotifications = []
      this.adminNotificationDetail = null

      // 重置统计数据
      this.notificationStats = {
        total_count: 0,
        draft_count: 0,
        pending_count: 0,
        published_count: 0
      }

      // 重置通知分页状态
      this.notificationCurrentPage = 1
      this.notificationTotalPages = 1
      this.notificationTotalCount = 0

      // 重置管理员通知分页状态
      this.adminCurrentPage = 1
      this.adminTotalPages = 1
      this.adminTotalCount = 0

      this.isLoading = false
      this.loadingCount = 0
    }
  }
})
