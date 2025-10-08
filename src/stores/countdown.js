import { defineStore } from 'pinia'
import {
  getCountdowns,
  getCountdownDetail,
  createCountdown as apiCreateCountdown,
  updateCountdown as apiUpdateCountdown,
  deleteCountdown as apiDeleteCountdown
} from '../utils/request'

export const useCountdownStore = defineStore('countdown', {
  state: () => ({
    // 倒数日列表
    countdowns: [],
    isFetchData: false,
    // 加载状态
    isLoading: false,
    // 错误信息
    error: null
  }),

  getters: {
    // 按目标日期排序的倒数日列表
    sortedCountdowns: (state) => {
      return state.countdowns.sort((a, b) => {
        const dateA = new Date(a.target_date)
        const dateB = new Date(b.target_date)
        return dateA - dateB
      })
    },

    // 即将到来的倒数日（未过期的）
    upcomingCountdowns: (state) => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      return state.countdowns.filter(countdown => {
        const targetDate = new Date(countdown.target_date)
        targetDate.setHours(0, 0, 0, 0)
        return targetDate >= now
      }).sort((a, b) => {
        const dateA = new Date(a.target_date)
        const dateB = new Date(b.target_date)
        return dateA - dateB
      })
    },

    // 已过期的倒数日
    expiredCountdowns: (state) => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      return state.countdowns.filter(countdown => {
        const targetDate = new Date(countdown.target_date)
        targetDate.setHours(0, 0, 0, 0)
        return targetDate < now
      }).sort((a, b) => {
        const dateA = new Date(a.target_date)
        const dateB = new Date(b.target_date)
        return dateB - dateA // 倒序，最近过期的在前
      })
    }
  },

  actions: {
    // 获取倒数日列表
    async fetchCountdowns() {
      this.isLoading = true
      this.error = null

      try {
        const data = await getCountdowns()
        this.countdowns = data || []
        this.isFetchData = true
        return data
      } catch (error) {
        this.error = error.message || '获取倒数日列表失败'
        console.error('获取倒数日列表失败:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 获取倒数日详情
    async fetchCountdownDetail(id) {
      try {
        const data = await getCountdownDetail(id)

        // 更新本地列表中的对应项
        const index = this.countdowns.findIndex(item => item.id === id)
        if (index !== -1) {
          this.countdowns[index] = data
        }

        return data
      } catch (error) {
        console.error('获取倒数日详情失败:', error)
        throw error
      }
    },

    // 创建倒数日
    async createCountdown(countdownData) {
      try {
        const data = await apiCreateCountdown(countdownData)

        // 将新创建的倒数日添加到列表中
        if (data) {
          this.countdowns.push(data)
        }

        return data
      } catch (error) {
        console.error('创建倒数日失败:', error)
        throw error
      }
    },

    // 更新倒数日
    async updateCountdown(id, countdownData) {
      try {
        const data = await apiUpdateCountdown(id, countdownData)

        // 更新本地列表中的对应项
        const index = this.countdowns.findIndex(item => item.id === id)
        if (index !== -1) {
          this.countdowns[index] = data || {
            ...this.countdowns[index],
            ...countdownData
          }
        }

        return data
      } catch (error) {
        console.error('更新倒数日失败:', error)
        throw error
      }
    },

    // 删除倒数日
    async deleteCountdown(id) {
      try {
        await apiDeleteCountdown(id)

        // 从本地列表中移除
        const index = this.countdowns.findIndex(item => item.id === id)
        if (index !== -1) {
          this.countdowns.splice(index, 1)
        }

        return true
      } catch (error) {
        console.error('删除倒数日失败:', error)
        throw error
      }
    },

    // 清空倒数日列表
    clearCountdowns() {
      this.countdowns = []
    },

    // 计算剩余天数
    calculateDaysLeft(targetDate) {
      const target = new Date(targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      target.setHours(0, 0, 0, 0)

      const diffTime = target - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays
    },

    // 格式化日期显示
    formatDate(dateStr) {
      const date = new Date(dateStr)
      const now = new Date()
      const diffTime = date - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return '今天'
      if (diffDays === 1) return '明天'
      if (diffDays === -1) return '昨天'
      if (diffDays > 0) return `${diffDays}天后`
      return `${Math.abs(diffDays)}天前`
    },

    // 获取倒数日状态
    getCountdownStatus(targetDate) {
      const daysLeft = this.calculateDaysLeft(targetDate)

      if (daysLeft < 0) {
        return 'expired' // 已过期
      } else if (daysLeft === 0) {
        return 'today' // 今天
      } else if (daysLeft <= 3) {
        return 'urgent' // 紧急（3天内）
      } else if (daysLeft <= 7) {
        return 'soon' // 即将到来（一周内）
      } else {
        return 'normal' // 正常
      }
    }
  }
})
