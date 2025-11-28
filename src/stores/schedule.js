import { defineStore } from 'pinia'
import { courseTableAPI } from '../api'
import { COURSE_COLORS, SEMESTER_CONFIG } from '../utils/constants'
import { courseTableCache } from '../utils/courseTableCache'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    courseData: {},
    currentWeek: 1,
    semester: '2025-2026-1',
    isLoading: false,
    // 学期开始时间 (写死)
    semesterStartDate: new Date(SEMESTER_CONFIG.START_DATE),
    // 课程颜色映射
    courseColors: new Map()
  }),

  getters: {
    // 获取当前周的课程
    currentWeekCourses: (state) => {
      return state.courseData
    },

    // 获取今天是第几周
    currentWeekNumber: (state) => {
      const now = new Date()
      const diffTime = now.getTime() - state.semesterStartDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const weekNumber = Math.floor(diffDays / 7) + 1
      return Math.max(1, weekNumber)
    },

    // 生成课程表网格数据
    scheduleGrid: (state) => {
      const grid = []
      const timeSlots = [
        { period: 1, time: '08:30-10:05' },
        { period: 2, time: '10:25-12:00' },
        { period: 3, time: '14:00-15:35' },
        { period: 4, time: '15:55-17:30' },
        { period: 5, time: '19:00-20:35' }
      ]

      for (let period = 1; period <= 5; period++) {
        const row = {
          period,
          time: timeSlots[period - 1].time,
          courses: []
        }

        for (let day = 0; day < 7; day++) {
          const courseIndex = day * 5 + period
          const course = state.courseData[courseIndex.toString()]

          if (course) {
            // 为课程分配颜色索引
            const colorKey = `${course.course}-${course.teacher}`
            if (!state.courseColors.has(colorKey)) {
              const colorIndex = Math.abs(state.hashCode(colorKey)) % COURSE_COLORS.length
              state.courseColors.set(colorKey, colorIndex)
            }

            row.courses.push({
              ...course,
              day,
              period,
              colorIndex: state.courseColors.get(colorKey),
              isInCurrentWeek: state.isCourseInCurrentWeek(course.week)
            })
          } else {
            row.courses.push(null)
          }
        }

        grid.push(row)
      }

      return grid
    },

    // 周数列表
    weekOptions: (state) => {
      return Array.from({ length: 20 }, (_, i) => {
        const weekNum = i + 1
        const isCurrentWeek = weekNum === state.currentWeekNumber
        return {
          value: weekNum,
          label: `第${weekNum}周`,
          isCurrentWeek
        }
      })
    }
  },

  actions: {
    // 生成hash码
    hashCode(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff
      }
      return hash
    },

    // 生成课程颜色索引
    generateCourseColorIndex(key) {
      // 根据课程名称生成固定的颜色索引
      return Math.abs(this.hashCode(key)) % COURSE_COLORS.length
    },

    // 检查课程是否在当前周
    isCourseInCurrentWeek(weekStr) {
      if (!weekStr) return false

      const currentWeek = this.currentWeek

      // 解析周数字符串，例如 "1-4,6-17周", "10-17周", "1-4,6-17单周"
      const weekRanges = weekStr.split(',')

      for (const range of weekRanges) {
        if (this.isWeekInRange(currentWeek, range.trim())) {
          return true
        }
      }

      return false
    },

    // 检查课程是否在今天周
    isCourseInTodayWeek(weekStr) {
      if (!weekStr) return false

      const todayWeek = this.currentWeekNumber

      // 解析周数字符串，例如 "1-4,6-17周", "10-17周", "1-4,6-17单周"
      const weekRanges = weekStr.split(',')

      for (const range of weekRanges) {
        if (this.isWeekInRange(todayWeek, range.trim())) {
          return true
        }
      }

      return false
    },

    // 检查周数是否在范围内
    isWeekInRange(week, rangeStr) {
      // 移除"周"字符
      rangeStr = rangeStr.replace(/[周]/g, '')

      // 处理单双周
      const isOddWeek = rangeStr.includes('单')
      const isEvenWeek = rangeStr.includes('双')
      rangeStr = rangeStr.replace(/[单双]/g, '')

      if (isOddWeek && week % 2 === 0) return false
      if (isEvenWeek && week % 2 === 1) return false

      // 解析范围
      if (rangeStr.includes('-')) {
        const [start, end] = rangeStr.split('-').map(Number)
        return week >= start && week <= end
      } else {
        return week === Number(rangeStr)
      }
    },

    /**
     * 获取课程表（支持版本检测和缓存）
     * @param {string} semester - 学期标识
     * @param {boolean} forceRefresh - 是否强制刷新，忽略缓存
     * @returns {Promise} 返回课表数据
     */
    async fetchCourseTable(semester = this.semester, forceRefresh = false) {
      try {
        this.isLoading = true

        // 获取当前用户的班级ID（用于验证缓存有效性）
        const authStore = await import('./auth').then(m => m.useAuthStore())
        const currentClassId = authStore.userClass

        let lastModified = null

        // 非强制刷新时，尝试使用缓存的时间戳
        if (!forceRefresh && currentClassId) {
          // 检查缓存是否有效（班级ID是否匹配）
          if (courseTableCache.isCacheValid(semester, currentClassId)) {
            lastModified = courseTableCache.getCachedTimestamp(semester)
          } else {
            // 缓存无效（可能是切换了班级），清除旧缓存
            courseTableCache.clearCache(semester)
          }
        } else if (forceRefresh) {
          courseTableCache.clearCache(semester)
        }

        // 请求服务器
        const result = await courseTableAPI.getCourseTable({
          semester,
          last_modified: lastModified
        })

        if (result.has_changes) {
          // 服务器返回了新数据
          this.courseData = result.course_data || {}
          this.semester = result.semester || semester || SEMESTER_CONFIG.CURRENT

          // 保存到缓存
          courseTableCache.saveCourseTable(
            result.semester || semester,
            result.course_data,
            result.last_modified,
            result.class_id
          )
        } else {
          // 数据无变化，使用本地缓存
          const cachedData = courseTableCache.getCachedData(semester)

          if (cachedData) {
            this.courseData = cachedData
            this.semester = result.semester || semester || SEMESTER_CONFIG.CURRENT
          } else {
            // 缓存丢失，强制重新获取
            return this.fetchCourseTable(semester, true)
          }
        }

        return result
      } catch (error) {
        console.error('获取课程表失败:', error)

        // 网络错误时，尝试使用缓存数据
        const cachedData = courseTableCache.getCachedData(semester)
        if (cachedData) {
          this.courseData = cachedData
          this.semester = semester || SEMESTER_CONFIG.CURRENT
          // 不抛出错误，使用缓存数据
          return {
            course_data: cachedData,
            semester: semester,
            from_cache: true
          }
        }

        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 搜索班级
    async searchClass(keyword, page = 1, size = 10) {
      try {
        const response = await courseTableAPI.searchClass({ keyword, page, size })
          return {
            classes: response.list || [],
            total: response.total || 0,
            page: response.page || page,
            size: response.size || size
          }
      } catch (error) {
        console.error('搜索班级失败:', error)
        throw error
      }
    },

    /**
     * 更新班级
     * @param {string} classId - 班级ID
     */
    async updateClass(classId) {
      try {
        await courseTableAPI.updateClass({ class_id: classId })

        // 切换班级后，清除所有缓存（因为班级变了）
        courseTableCache.clearAllCache()

        // 强制重新获取课程表
        await this.fetchCourseTable(this.semester, true)
      } catch (error) {
        console.error('更新班级失败:', error)
        throw error
      }
    },

    // 设置当前周
    setCurrentWeek(week) {
      this.currentWeek = week
    },

    // 获取课程详情
    getCourseDetail(day, period) {
      const courseIndex = day * 5 + period
      return this.courseData[courseIndex.toString()] || null
    },

    /**
     * 编辑课程格子（添加、编辑、删除）
     * @param {string} semester - 学期标识
     * @param {number} index - 课程格子索引
     * @param {object} courseData - 课程数据
     * @param {string} operationType - 操作类型：add/edit/delete
     * @param {object} originalCourse - 原始课程数据（编辑和删除时需要）
     */
    async editCourseCell(semester, index, courseData, operationType = 'add', originalCourse = null) {
      try {
        // 获取当前格子的所有课程数据
        const currentCourses = this.courseData[index.toString()] || []
        const coursesArray = Array.isArray(currentCourses) ? [...currentCourses] : []

        let updatedCourses = []

        if (operationType === 'add') {
          // 添加课程：保留所有现有课程，添加新课程
          updatedCourses = [...coursesArray, courseData]
        } else if (operationType === 'edit') {
          // 编辑课程：替换特定课程，保留其他课程
          updatedCourses = coursesArray.map(course => {
            if (this.isSameCourse(course, originalCourse)) {
              return courseData
            }
            return course
          })
        } else if (operationType === 'delete') {
          // 删除课程：移除特定课程，保留其他课程
          updatedCourses = coursesArray.filter(course =>
            !this.isSameCourse(course, originalCourse)
          )
        }

        await courseTableAPI.editCourseCell({
          semester: semester || this.semester,
          index: index.toString(),
          value: updatedCourses
        })

        // 编辑后清除缓存，确保下次获取最新数据
        courseTableCache.clearCache(semester || this.semester)

        // 强制刷新课程表数据
        await this.fetchCourseTable(semester, true)
      } catch (error) {
        console.error('编辑课程格子失败:', error)
        throw error
      }
    },

    // 判断是否是同一个课程（用于编辑和删除时定位课程）
    isSameCourse(course1, course2) {
      if (!course1 || !course2) return false
      return course1.course === course2.course &&
             course1.teacher === course2.teacher &&
             course1.week === course2.week &&
             course1.classroom === course2.classroom
    },

    // 计算课程格子索引（从1开始）
    calculateCourseIndex(dayIndex, period) {
      return dayIndex * 5 + period
    }
  }
})
