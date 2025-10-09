import { defineStore } from 'pinia'
import { notificationAPI, contributionAPI } from '../api'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    // 通知相关状态
    notifications: [],
    notificationDetail: null,
    categories: [],
    isLoading: false,

    // 通知分页状态
    notificationCurrentPage: 1,
    notificationTotalPages: 1,
    notificationTotalCount: 0,

    // 投稿相关状态
    contributions: [],
    contributionDetail: null,
    contributionStats: {
      total_count: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      total_points: 0
    },

    // 管理员投稿统计数据
    adminContributionStats: {
      total_count: 0,
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      total_points: 0
    },

    // 通知统计数据
    notificationStats: {
      total_count: 0,
      draft_count: 0,
      pending_count: 0,
      published_count: 0
    },

    // 投稿分页状态
    contributionCurrentPage: 1,
    contributionTotalPages: 1,
    contributionTotalCount: 0,

    // 管理员相关状态
    adminNotifications: [],
    adminNotificationDetail: null,

    // 管理员通知分页状态
    adminCurrentPage: 1,
    adminTotalPages: 1,
    adminTotalCount: 0,

    // 筛选和搜索条件
    filters: {
      categories: [],
      status: null,
      keyword: ''
    }
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

    // 获取待审核的投稿
    pendingContributions: (state) => {
      return state.contributions.filter(item => item.status === 1)
    },

    // 检查通知是否有更多数据
    hasMore: (state) => {
      return state.notificationCurrentPage < state.notificationTotalPages
    },

    // 检查投稿是否有更多数据
    contributionHasMore: (state) => {
      return state.contributionCurrentPage < state.contributionTotalPages
    },

    // 检查管理员通知是否有更多数据
    adminHasMore: (state) => {
      return state.adminCurrentPage < state.adminTotalPages
    }
  },

  actions: {
    // 获取通知列表
    async fetchNotifications(params = {}) {
      this.isLoading = true
      try {
        const defaultParams = {
          page: this.notificationCurrentPage,
          size: 10,
          status: 3, // 只获取已发布的通知
          ...params
        }

        // 处理筛选条件
        if (this.filters.keyword && this.filters.keyword.trim()) {
          defaultParams.keyword = this.filters.keyword.trim()
        }

        // 处理分类筛选：如果有选择分类则传递分类ID数组，否则不传递
        if (this.filters.categories && this.filters.categories.length > 0) {
          defaultParams.categories = this.filters.categories
        }

        // 如果params中有状态参数，使用params的，否则使用filters的
        if (this.filters.status !== null && !params.hasOwnProperty('status')) {
          defaultParams.status = this.filters.status
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
        this.isLoading = false
      }
    },

    // 获取通知详情
    async fetchNotificationDetail(id) {
      this.isLoading = true
      try {
        const result = await notificationAPI.getNotificationDetail(id)
        this.notificationDetail = result
        return result
      } catch (error) {
        console.error('获取信息详情失败:', error)
        throw error
      } finally {
        this.isLoading = false
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
      this.isLoading = true
      try {
        const defaultParams = {
          page: this.adminCurrentPage,
          size: 10,
          ...params
        }

        // 处理筛选条件
        if (this.filters.keyword && this.filters.keyword.trim()) {
          defaultParams.keyword = this.filters.keyword.trim()
        }

        // 处理分类筛选：如果有选择分类则传递分类ID数组，否则不传递
        if (this.filters.categories && this.filters.categories.length > 0) {
          defaultParams.categories = this.filters.categories
        }

        // 如果params中有状态参数，使用params的，否则使用filters的
        if (this.filters.status !== null && !params.hasOwnProperty('status')) {
          defaultParams.status = this.filters.status
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
        this.isLoading = false
      }
    },

    // 获取管理员通知详情（管理员专用）
    async fetchAdminNotificationDetail(id) {
      this.isLoading = true
      try {
        const result = await notificationAPI.getAdminNotificationDetail(id)
        this.adminNotificationDetail = result
        return result
      } catch (error) {
        console.error('获取管理员信息详情失败:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 创建投稿（需认证）
    async createContribution(data) {
      try {
        const result = await contributionAPI.createContribution(data)
        return result
      } catch (error) {
        console.error('创建投稿失败:', error)
        throw error
      }
    },

    // 获取投稿列表（需认证）
    async fetchContributions(params = {}) {
      this.isLoading = true
      try {
        const defaultParams = {
          page: this.contributionCurrentPage,
          size: 10,
          ...params
        }

        const result = await contributionAPI.getContributions(defaultParams)

        if (params.page === 1 || !params.page) {
          this.contributions = result.data || []
        } else {
          this.contributions.push(...(result.data || []))
        }

        this.contributionTotalCount = result.total || 0
        this.contributionTotalPages = Math.ceil(this.contributionTotalCount / (params.size || 10))
        this.contributionCurrentPage = params.page || 1

        return result
      } catch (error) {
        console.error('获取投稿列表失败:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取投稿详情（需认证）
    async fetchContributionDetail(id) {
      this.isLoading = true
      try {
        const result = await contributionAPI.getContributionDetail(id)
        this.contributionDetail = result
        return result
      } catch (error) {
        console.error('获取投稿详情失败:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 审核投稿（运营/管理员专用）
    async reviewContribution(id, data) {
      try {
        const result = await contributionAPI.reviewContribution(id, data)
        // 更新本地状态
        await this.fetchContributions({ page: 1 })
        return result
      } catch (error) {
        console.error('审核投稿失败:', error)
        throw error
      }
    },

    // 获取用户投稿统计（需认证）
    async fetchContributionStats() {
      try {
        const result = await contributionAPI.getContributionStats()
        this.contributionStats = result.data || result
        return result
      } catch (error) {
        console.error('获取投稿统计失败:', error)
        throw error
      }
    },

    // 获取管理员投稿统计（管理员专用）
    async fetchContributionStatsAdmin() {
      try {
        const result = await contributionAPI.getContributionStatsAdmin()
        this.adminContributionStats = result.data || result
        return result
      } catch (error) {
        console.error('获取管理员投稿统计失败:', error)
        throw error
      }
    },

    // 获取通知统计（管理员专用）
    async fetchNotificationStats() {
      try {
        const result = await notificationAPI.getNotificationStats()
        this.notificationStats = result.data || result
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

    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    // 重置筛选条件
    resetFilters() {
      this.filters = {
        categories: [],
        status: null,
        keyword: ''
      }
    },

    // 重置状态
    resetState() {
      this.notifications = []
      this.notificationDetail = null
      this.adminNotifications = []
      this.adminNotificationDetail = null
      this.contributions = []
      this.contributionDetail = null

      // 重置统计数据
      this.contributionStats = {
        total_count: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        total_points: 0
      }
      this.adminContributionStats = {
        total_count: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        total_points: 0
      }
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

      // 重置投稿分页状态
      this.contributionCurrentPage = 1
      this.contributionTotalPages = 1
      this.contributionTotalCount = 0

      // 重置管理员通知分页状态
      this.adminCurrentPage = 1
      this.adminTotalPages = 1
      this.adminTotalCount = 0

      this.isLoading = false
    }
  }
})
