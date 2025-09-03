import { defineStore } from 'pinia'
import { reviewAPI } from '../api'
import { REVIEW_STATUS, REVIEW_ATTITUDES, PAGINATION } from '../utils/constants'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    // 教师评价列表
    teacherReviews: [],
    teacherReviewsTotal: 0,
    teacherReviewsLoading: false,

    // 用户评价记录
    userReviews: [],
    userReviewsTotal: 0,
    userReviewsLoading: false,

    // 管理员评价列表
    adminReviews: [],
    adminReviewsTotal: 0,
    adminReviewsLoading: false,

    // 当前查看的教师
    currentTeacher: null,

    // 搜索和筛选条件
    searchFilters: {
      teacherName: '',
      status: null,
      attitude: null
    },

    // 分页信息
    pagination: {
      page: PAGINATION.DEFAULT_PAGE,
      size: PAGINATION.DEFAULT_SIZE
    }
  }),

  getters: {
    // 获取评价状态文本
    getStatusText: () => (status) => {
      const statusMap = {
        [REVIEW_STATUS.PENDING]: '待审核',
        [REVIEW_STATUS.APPROVED]: '已通过',
        [REVIEW_STATUS.REJECTED]: '已拒绝'
      }
      return statusMap[status] || '未知状态'
    },

    // 获取评价态度文本
    getAttitudeText: () => (attitude) => {
      const attitudeMap = {
        [REVIEW_ATTITUDES.RECOMMEND]: '推荐',
        [REVIEW_ATTITUDES.AVOID]: '避雷',
        [REVIEW_ATTITUDES.NEUTRAL]: '中立'
      }
      return attitudeMap[attitude] || '未知'
    },

    // 获取评价态度样式类
    getAttitudeClass: () => (attitude) => {
      const classMap = {
        [REVIEW_ATTITUDES.RECOMMEND]: 'bg-green-100 text-green-800',
        [REVIEW_ATTITUDES.AVOID]: 'bg-red-100 text-red-800',
        [REVIEW_ATTITUDES.NEUTRAL]: 'bg-gray-100 text-gray-800'
      }
      return classMap[attitude] || 'bg-gray-100 text-gray-800'
    },

    // 获取状态样式类
    getStatusClass: () => (status) => {
      const classMap = {
        [REVIEW_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
        [REVIEW_STATUS.APPROVED]: 'bg-green-100 text-green-800',
        [REVIEW_STATUS.REJECTED]: 'bg-red-100 text-red-800'
      }
      return classMap[status] || 'bg-gray-100 text-gray-800'
    },

    // 获取已通过的评价
    approvedTeacherReviews: (state) => {
      return state.teacherReviews.filter(review => review.status === REVIEW_STATUS.APPROVED)
    },

    // 获取待审核的评价数量
    pendingReviewsCount: (state) => {
      return state.adminReviews.filter(review => review.status === REVIEW_STATUS.PENDING).length
    }
  },

  actions: {
    // 获取指定教师的评价
    async fetchTeacherReviews(teacherName, page = 1, size = 10) {
      this.teacherReviewsLoading = true
      try {
        const params = { teacher_name: teacherName, page, size }
        const result = await reviewAPI.getTeacherReviews(params)

        if (page === 1) {
          this.teacherReviews = result.data || []
        } else {
          // 分页加载，追加数据
          this.teacherReviews.push(...(result.data || []))
        }

        this.teacherReviewsTotal = result.total || 0
        this.currentTeacher = teacherName

        return result
      } catch (error) {
        console.error('获取教师评价失败:', error)
        throw error
      } finally {
        this.teacherReviewsLoading = false
      }
    },

    // 创建教师评价
    async createTeacherReview(reviewData) {
      try {
        const result = await reviewAPI.createReview(reviewData)

        return result
      } catch (error) {
        console.error('创建评价失败:', error)
        throw error
      }
    },

    // 获取所有评价列表 (管理员)
    async fetchAllReviews(filters = {}, page = 1, size = 10) {
      this.adminReviewsLoading = true
      try {
        const params = {
          ...filters,
          page,
          size
        }
        const result = await reviewAPI.getAllReviews(params)

        if (page === 1) {
          this.adminReviews = result.data || []
        } else {
          this.adminReviews.push(...(result.data || []))
        }

        this.adminReviewsTotal = result.total || 0

        return result
      } catch (error) {
        console.error('获取评价列表失败:', error)
        throw error
      } finally {
        this.adminReviewsLoading = false
      }
    },

    // 审核通过评价 (管理员)
    async approveReview(reviewId, adminNote = '') {
      try {
        const result = await reviewAPI.approveReview(reviewId, { admin_note: adminNote })

        // 更新本地状态
        const review = this.adminReviews.find(r => r.id === reviewId)
        if (review) {
          review.status = REVIEW_STATUS.APPROVED
          review.admin_note = adminNote
        }

        return result
      } catch (error) {
        console.error('审核通过失败:', error)
        throw error
      }
    },

    // 审核拒绝评价 (管理员)
    async rejectReview(reviewId, adminNote = '') {
      try {
        const result = await reviewAPI.rejectReview(reviewId, { admin_note: adminNote })

        // 更新本地状态
        const review = this.adminReviews.find(r => r.id === reviewId)
        if (review) {
          review.status = REVIEW_STATUS.REJECTED
          review.admin_note = adminNote
        }

        return result
      } catch (error) {
        console.error('审核拒绝失败:', error)
        throw error
      }
    },

    // 删除评价 (管理员)
    async deleteReview(reviewId) {
      try {
        const result = await reviewAPI.deleteReview(reviewId)

        // 从本地状态中移除
        const index = this.adminReviews.findIndex(r => r.id === reviewId)
        if (index !== -1) {
          this.adminReviews.splice(index, 1)
          this.adminReviewsTotal -= 1
        }

        return result
      } catch (error) {
        console.error('删除评价失败:', error)
        throw error
      }
    },

    // 搜索教师
    async searchTeachers(keyword) {
      try {
        // 这里可以调用教师搜索API，或者从现有评价中提取教师名单
        // 暂时返回空数组，后续可以根据需要实现
        return []
      } catch (error) {
        console.error('搜索教师失败:', error)
        throw error
      }
    },

    // 重置搜索条件
    resetFilters() {
      this.searchFilters = {
        teacherName: '',
        status: null,
        attitude: null
      }
    },

    // 清除教师评价数据
    clearTeacherReviews() {
      this.teacherReviews = []
      this.teacherReviewsTotal = 0
      this.currentTeacher = null
    },

    // 清除用户评价数据
    clearUserReviews() {
      this.userReviews = []
      this.userReviewsTotal = 0
    },

    // 清除管理员评价数据
    clearAdminReviews() {
      this.adminReviews = []
      this.adminReviewsTotal = 0
    }
  }
})
