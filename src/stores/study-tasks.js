import { defineStore } from 'pinia'
import {
  getStudyTasks,
  getStudyTaskDetail,
  createStudyTask as apiCreateStudyTask,
  updateStudyTask as apiUpdateStudyTask,
  deleteStudyTask as apiDeleteStudyTask,
  getStudyTaskStats
} from '../utils/request'

export const useStudyTaskStore = defineStore('studyTask', {
  state: () => ({
    // 学习任务列表
    studyTasks: [],
    isFetchData: false,
    // 统计数据
    stats: {
      total_count: 0,
      pending_count: 0,
      completed_count: 0
    },
    // 加载状态
    isLoading: false,
    // 错误信息
    error: null
  }),

  getters: {
    // 待完成的任务（按优先级和截止日期排序）
    pendingTasks: (state) => {
      return state.studyTasks
        .filter(task => task.status === 1) // 1=待完成
        .sort((a, b) => {
          // 首先按优先级排序（1=高，2=中，3=低）
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          // 然后按截止日期排序
          const dateA = new Date(a.due_date)
          const dateB = new Date(b.due_date)
          return dateA - dateB
        })
    },

    // 已完成的任务
    completedTasks: (state) => {
      return state.studyTasks
        .filter(task => task.status === 2) // 2=已完成
        .sort((a, b) => {
          // 按完成时间倒序排序
          const dateA = new Date(a.completed_at || a.updated_at)
          const dateB = new Date(b.completed_at || b.updated_at)
          return dateB - dateA
        })
    },

    // 紧急任务（3天内到期且未完成）
    urgentTasks: (state) => {
      const now = new Date()
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

      return state.studyTasks.filter(task => {
        if (task.status !== 1) return false // 只包含待完成的任务

        const dueDate = new Date(task.due_date)
        return dueDate <= threeDaysLater && dueDate >= now
      })
    },

    // 过期任务（已过截止日期但未完成）
    overdueTasks: (state) => {
      const now = new Date()
      now.setHours(0, 0, 0, 0)

      return state.studyTasks.filter(task => {
        if (task.status !== 1) return false // 只包含待完成的任务

        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < now
      })
    }
  },

  actions: {
    // 获取学习任务列表
    async fetchStudyTasks(params = {}) {
      // 如果不是追加模式，才设置loading状态，避免加载更多时闪烁
      if (!params.append) {
        this.isLoading = true
      }
      this.error = null

      try {
        const data = await getStudyTasks(params)

        // 如果是追加模式，将新数据添加到现有数据后面
        if (params.append && data?.data) {
          this.studyTasks = [...this.studyTasks, ...data.data]
        } else {
          this.studyTasks = data?.data || []
        }
        this.isFetchData = true
        return data
      } catch (error) {
        this.error = error.message || '获取学习任务列表失败'
        console.error('获取学习任务列表失败:', error)
        throw error
      } finally {
        // 如果不是追加模式，才重置loading状态
        if (!params.append) {
          this.isLoading = false
        }
      }
    },

    // 获取学习任务详情
    async fetchStudyTaskDetail(id) {
      try {
        const data = await getStudyTaskDetail(id)

        // 更新本地列表中的对应项
        const index = this.studyTasks.findIndex(item => item.id === id)
        if (index !== -1) {
          this.studyTasks[index] = data
        }

        return data
      } catch (error) {
        console.error('获取学习任务详情失败:', error)
        throw error
      }
    },

    // 创建学习任务
    async createStudyTask(taskData) {
      try {
        const data = await apiCreateStudyTask(taskData)

        // 将新创建的任务添加到列表中
        if (data) {
          this.studyTasks.push(data)
          this.stats.total_count++
          if (data.status === 1) {
            this.stats.pending_count++
          } else if (data.status === 2) {
            this.stats.completed_count++
          }
        }

        return data
      } catch (error) {
        console.error('创建学习任务失败:', error)
        throw error
      }
    },

    // 更新学习任务
    async updateStudyTask(id, taskData) {
      try {
        const data = await apiUpdateStudyTask(id, taskData)

        // 更新本地列表中的对应项
        const index = this.studyTasks.findIndex(item => item.id === id)
        if (index !== -1) {
          const oldTask = this.studyTasks[index]
          const newTask = data || { ...oldTask, ...taskData }

          // 如果状态发生变化，更新统计数据
          if (oldTask.status !== newTask.status) {
            if (oldTask.status === 1 && newTask.status === 2) {
              this.stats.pending_count--
              this.stats.completed_count++
            } else if (oldTask.status === 2 && newTask.status === 1) {
              this.stats.completed_count--
              this.stats.pending_count++
            }
          }

          this.studyTasks[index] = newTask
        }

        return data
      } catch (error) {
        console.error('更新学习任务失败:', error)
        throw error
      }
    },

    // 删除学习任务
    async deleteStudyTask(id) {
      try {
        await apiDeleteStudyTask(id)

        // 从本地列表中移除
        const index = this.studyTasks.findIndex(item => item.id === id)
        if (index !== -1) {
          const task = this.studyTasks[index]
          this.studyTasks.splice(index, 1)

          // 更新统计数据
          this.stats.total_count--
          if (task.status === 1) {
            this.stats.pending_count--
          } else if (task.status === 2) {
            this.stats.completed_count--
          }
        }

        return true
      } catch (error) {
        console.error('删除学习任务失败:', error)
        throw error
      }
    },

    // 获取学习任务统计
    async fetchStudyTaskStats() {
      try {
        const data = await getStudyTaskStats()
        this.stats = data || {
          total_count: 0,
          pending_count: 0,
          completed_count: 0
        }
        return data
      } catch (error) {
        console.error('获取学习任务统计失败:', error)
        throw error
      }
    },


    // 清空学习任务列表
    clearStudyTasks() {
      this.studyTasks = []
      this.stats = {
        total_count: 0,
        pending_count: 0,
        completed_count: 0
      }
    },

    // 计算剩余天数
    calculateDaysLeft(dueDate) {
      // 如果没有目标日期，返回0
      if (!dueDate) return 0

      // 处理后端返回的ISO格式：2025-09-28T00:00:00+08:00
      const target = new Date(dueDate)
      if (isNaN(target.getTime())) return 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      target.setHours(0, 0, 0, 0)

      const diffTime = target - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return diffDays
    },

    // 获取任务优先级文本
    getPriorityText(priority) {
      const priorityMap = {
        1: '高优先级',
        2: '中优先级',
        3: '低优先级'
      }
      return priorityMap[priority] || '未知优先级'
    },

    // 获取任务状态文本
    getStatusText(status) {
      const statusMap = {
        1: '待完成',
        2: '已完成'
      }
      return statusMap[status] || '未知状态'
    },

    // 获取任务紧急程度
    getTaskUrgency(dueDate, status) {
      if (status === 2) return 'completed' // 已完成

      const daysLeft = this.calculateDaysLeft(dueDate)

      if (daysLeft < 0) return 'overdue' // 已过期
      if (daysLeft === 0) return 'today' // 今天到期
      if (daysLeft <= 3) return 'urgent' // 紧急
      if (daysLeft <= 7) return 'soon' // 即将到期
      return 'normal' // 正常
    }
  }
})
