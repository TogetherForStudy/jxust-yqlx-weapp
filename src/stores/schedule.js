import { defineStore } from 'pinia'
import { courseTableAPI, configAPI } from '../api'
import { useAuthStore } from './auth'
import { COURSE_COLORS } from '../utils/constants'
import { courseTableCache } from '../utils/courseTableCache'
import { semesterCache } from '../utils/semesterCache'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    courseData: {},
    currentWeek: 1,
    semester: '',
    isLoading: false,
    // 学期开始时间（默认值，实际会从 API 获取）
    semesterStartDate: new Date(),
    // 课程颜色映射
    courseColors: new Map(),
    // 学期配置
    semesterConfig: null, // { semesters: [...], current: '2025-2026-1' }
    // 当前学期信息
    currentSemesterInfo: null, // { id, startDate, weeks }
    maxWeeks: 20,
    // 学期变更标志
    hasChanged: false,
    newSemester: ''
  }),

  getters: {
    // 获取当前周的课程
    currentWeekCourses: (state) => {
      return state.courseData
    },

    // 获取今天是第几周（使用普通函数以便通过 this 调用 actions）
    currentWeekNumber() {
      return this.calculateWeekNumber()
    },

    scheduleGrid() {
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
          const course = this.courseData[courseIndex.toString()]

          if (course) {
            const colorKey = `${course.course}-${course.teacher}`
            row.courses.push({
              ...course,
              day,
              period,
              colorIndex: this.courseColors.get(colorKey) ?? 0,
              isInCurrentWeek: this.isCourseInCurrentWeek(course.week)
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
    weekOptions() {
      const maxWeeks = this.maxWeeks
      return Array.from({ length: maxWeeks }, (_, i) => {
        const weekNum = i + 1
        const isCurrentWeek = weekNum === this.currentWeekNumber
        return {
          value: weekNum,
          label: `第${weekNum}周`,
          isCurrentWeek
        }
      })
    },

    // 判断当前选择的周是否在学期内
    isInSemester: (state) => {
      return state.currentWeek >= 1 && state.currentWeek <= state.maxWeeks
    },

    // 判断当前真实日期是否在学期周内（用于显示"假期中"提示）
    isInSemesterWeek() {
      const realWeek = this.calculateWeekNumber()
      return realWeek >= 1 && realWeek <= this.maxWeeks
    },

    // 获取所有学期列表
    semesterList: (state) => {
      return state.semesterConfig?.semesters || []
    },

    // 判断当前选择的学期是否与配置中的current学期一致
    isSemesterMismatch: (state) => {
      if (!state.semesterConfig || !state.semesterConfig.current) {
        return false
      }
      return state.semester !== state.semesterConfig.current
    }
  },

  actions: {
    /**
     * 初始化课表数据（统一加载入口）
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<void>}
     */
    async initialize(forceRefresh = false) {
      try {
        this.isLoading = true

        // 1. 获取学期配置
        await this.fetchSemesterConfig(forceRefresh)

        // 2. 检查学期是否变更
        if (!this.hasChanged) {
          this.hasChanged = this.checkSemesterChange()
        }

        // 3. 记录学期变更状态（不预写 storage，等用户确认后再持久化）
        if (this.hasChanged && this.semesterConfig?.current) {
          this.newSemester = this.semesterConfig.current
        } else {
          this.newSemester = ''
          // 无变更时，同步已确认的当前学期标记
          if (this.semesterConfig?.current) {
            semesterCache.saveLastKnownCurrent(this.semesterConfig.current)
          }
        }

        // 4. 如果已有学期信息，加载课表
        if (this.semester) {
          await this.fetchCourseTable(this.semester, forceRefresh)
        }

        return { newSemester: this.semesterConfig?.current }
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 计算指定日期是学期的第几周
     * @param {Date} date - 要计算的日期，默认为今天
     * @returns {number} 周数（可能为负数或超出学期范围）
     */
    calculateWeekNumber(date = new Date()) {
      // 标准化到当天的 00:00:00，消除时分秒和时区影响
      const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const startDate = new Date(
        this.semesterStartDate.getFullYear(),
        this.semesterStartDate.getMonth(),
        this.semesterStartDate.getDate()
      )
      const diffTime = targetDay.getTime() - startDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return Math.floor(diffDays / 7) + 1
    },

    /**
     * 获取学期配置信息（支持缓存，每天仅请求一次）
     * @param {boolean} forceRefresh - 是否强制刷新，忽略缓存
     * @returns {Promise<Object>} 返回 { config, hasChanged, newSemester }
     */
    async fetchSemesterConfig(forceRefresh = false) {
      try {
        // 在获取新配置前，先获取用户已确认的当前学期（用于检测变更）
        const lastKnownCurrent = semesterCache.getLastKnownCurrent()

        // 检查是否需要更新缓存
        if (!forceRefresh && !semesterCache.shouldUpdate()) {
          const cachedConfig = semesterCache.get()
          if (cachedConfig) {
            this.semesterConfig = cachedConfig
            // 首次加载时初始化学期信息
            if (!this.semester) {
              this.initializeSemester()
            }
            return { config: cachedConfig, hasChanged: false }
          }
        }

        // 从API获取学期配置
        const response = await configAPI.getConfig('semesters')

        // 验证响应数据结构
        if (response?.value) {
          // 尝试解析 value（可能是 JSON 字符串）
          let configData = response.value
          if (typeof configData === 'string') {
            try {
              configData = JSON.parse(configData)
            } catch (e) {
              console.error('学期配置 JSON 解析失败:', e.message)
            }
          }

          // 对比已确认学期与服务器最新学期，检测是否变更
          this.hasChanged = lastKnownCurrent && configData.current && configData.current !== lastKnownCurrent
          this.newSemester = configData.current

          // 保存到缓存
          semesterCache.save(configData)
          this.semesterConfig = configData

          // 首次加载时初始化学期信息
          if (!this.semester) {
            this.initializeSemester()
          }

          return { config: configData }
        } else {
          console.error('API 响应缺少 value 字段，响应键:', response ? Object.keys(response) : 'response 为空')
        }
      } catch (error) {
        console.error('获取学期配置失败:', error)

        // 失败时尝试使用缓存
        const cachedConfig = semesterCache.get()
        if (cachedConfig) {
          this.semesterConfig = cachedConfig
          // 首次加载时初始化学期信息
          if (!this.semester) {
            this.initializeSemester()
          }
          return { config: cachedConfig }
        }

        throw error
      }
    },

    /**
     * 初始化学期信息（首次加载时调用）
     */
    initializeSemester() {
      if (!this.semesterConfig) {
        console.warn('semesterConfig 未初始化')
        return
      }

      // 获取用户手动选择的学期，如果没有则使用配置中的 current
      const userSelected = semesterCache.getUserSelectedSemester()
      const targetSemesterId = userSelected || this.semesterConfig.current

      this.updateSemesterInfo(targetSemesterId, true)
    },

    /**
     * 更新学期信息
     * @param {string} semesterId - 学期ID
     * @param {boolean} updateCurrentWeek - 是否更新当前周数
     */
    updateSemesterInfo(semesterId, updateCurrentWeek = false) {
      if (!this.semesterConfig?.semesters) {
        console.error('semesterConfig.semesters 不可用')
        return
      }

      const targetSemester = this.semesterConfig.semesters.find(
        s => s.id === semesterId
      )

      if (!targetSemester) {
        console.warn(`未找到目标学期: ${semesterId}`)
        return
      }

      this.currentSemesterInfo = targetSemester
      this.semester = targetSemester.id
      this.maxWeeks = targetSemester.weeks
      this.semesterStartDate = new Date(targetSemester.startDate)

      // 仅在需要时更新当前周数
      if (updateCurrentWeek) {
        const realWeek = this.calculateWeekNumber()

        // 判断当前日期是否在学期范围内
        if (realWeek >= 1 && realWeek <= this.maxWeeks) {
          this.setCurrentWeek(realWeek)
        } else {
          // 假期中，默认显示第一周
          this.setCurrentWeek(1)
        }
      }
    },

    /**
     * 切换学期
     * @param {string} semesterId - 学期ID
     */
    async switchSemester(semesterId) {
      const semester = this.semesterConfig?.semesters.find(s => s.id === semesterId)
      if (!semester) {
        throw new Error('学期不存在')
      }

      // 保存旧状态，用于失败回滚
      const prevSemester = this.semester
      const prevSemesterInfo = this.currentSemesterInfo
      const prevMaxWeeks = this.maxWeeks
      const prevStartDate = this.semesterStartDate
      const prevCurrentWeek = this.currentWeek

      // 更新学期信息并计算当前周数
      this.updateSemesterInfo(semesterId, true)

      try {
        courseTableCache.clearCache(semesterId)
        await this.fetchCourseTable(semesterId, true)
        // 成功后才持久化用户选择，避免失败时 storage 残留错误学期
        semesterCache.saveUserSelectedSemester(semesterId)
      } catch (error) {
        // 请求失败，回滚 Pinia 状态
        this.semester = prevSemester
        this.currentSemesterInfo = prevSemesterInfo
        this.maxWeeks = prevMaxWeeks
        this.semesterStartDate = prevStartDate
        this.currentWeek = prevCurrentWeek
        throw error
      }
    },

    /**
     * 确认当前学期变更（用户点击确认后调用）
     * 持久化 lastKnownCurrent 和 userSelectedSemester，清除变更标志
     */
    acknowledgeCurrentSemester() {
      if (this.semesterConfig?.current) {
        semesterCache.saveLastKnownCurrent(this.semesterConfig.current)
        semesterCache.saveUserSelectedSemester(this.semesterConfig.current)
      }
      this.hasChanged = false
      this.newSemester = ''
    },

    /**
     * 检查学期是否发生变更
     * @returns {boolean} 如果学期发生变更返回true
     * 注意：此方法假设 semesterConfig 已经被加载（通过 fetchSemesterConfig 调用）
     */
    checkSemesterChange() {
      try {
        const lastKnownCurrent = semesterCache.getLastKnownCurrent()

        if (!this.semesterConfig) {
          console.warn('semesterConfig 未加载，无法检查学期变更')
          return false
        }

        // 对比用户已确认的学期与配置中的当前学期
        if (lastKnownCurrent && this.semesterConfig.current !== lastKnownCurrent) {
          return true
        }

        return false
      } catch (error) {
        console.error('检查学期变更失败:', error)
        return false
      }
    },

    /**
     * 扫描 courseData 并更新 courseColors 映射
     */
    assignCourseColors() {
      for (let day = 0; day < 7; day++) {
        for (let period = 1; period <= 5; period++) {
          const courseIndex = day * 5 + period
          const course = this.courseData[courseIndex.toString()]
          if (course) {
            const colorKey = `${course.course}-${course.teacher}`
            if (!this.courseColors.has(colorKey)) {
              const colorIndex = Math.abs(this.hashCode(colorKey)) % COURSE_COLORS.length
              this.courseColors.set(colorKey, colorIndex)
            }
          }
        }
      }
    },

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

    /**
     * 检查课程是否在指定周
     * @param {string} weekStr - 周数字符串，例如 "1-4,6-17周", "10-17周", "1-4,6-17单周"
     * @param {number|null} targetWeek - 目标周数，null表示使用用户当前选择的周
     * @returns {boolean}
     */
    isCourseInWeek(weekStr, targetWeek = null) {
      if (!weekStr) return false

      const week = targetWeek !== null ? targetWeek : this.currentWeek

      // 解析周数字符串
      const weekRanges = weekStr.split(',')

      for (const range of weekRanges) {
        if (this.isWeekInRange(week, range.trim())) {
          return true
        }
      }

      return false
    },

    // 检查课程是否在当前周（用户选择的周）
    isCourseInCurrentWeek(weekStr) {
      return this.isCourseInWeek(weekStr, this.currentWeek)
    },

    // 检查课程是否在今天所在的周
    isCourseInTodayWeek(weekStr) {
      return this.isCourseInWeek(weekStr, this.currentWeekNumber)
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

        const authStore = useAuthStore()
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
          this.courseData = result.course_data || {}
          this.semester = result.semester || semester || this.semester

          courseTableCache.saveCourseTable(
            result.semester || semester,
            result.course_data,
            result.last_modified,
            result.class_id
          )
        } else {
          const cachedData = courseTableCache.getCachedData(semester)

          if (cachedData) {
            this.courseData = cachedData
            this.semester = result.semester || semester || this.semester
          } else if (!forceRefresh) {
            return this.fetchCourseTable(semester, true)
          } else {
            console.warn('课表缓存丢失且服务器返回无变化，使用空数据')
            this.courseData = {}
            this.semester = result.semester || semester || this.semester
          }
        }

        this.assignCourseColors()
        return result
      } catch (error) {
        console.error('获取课程表失败:', error)

        const cachedData = courseTableCache.getCachedData(semester)
        if (cachedData) {
          this.courseData = cachedData
          this.semester = semester || this.semester
          this.assignCourseColors()
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
      // 调用后端 API 更新班级绑定
      await courseTableAPI.updateClass({ class_id: classId })

      // 切换班级后，清除所有缓存（因为班级变了）
      courseTableCache.clearAllCache()

      // 确保 semester 与配置中的当前学期保持一致
      if (!this.semester) {
        // 优先从已加载的 semesterConfig 中取
        if (this.semesterConfig?.current) {
          this.initializeSemester()
        } else {
          // 如果配置也没有，主动获取一次
          await this.fetchSemesterConfig(true)
        }
      }

      // 尝试刷新课程表，但不阻断绑定流程
      try {
        if (this.semester) {
          await this.fetchCourseTable(this.semester, true)
        }
      } catch (error) {
        console.warn('绑定班级成功，刷新课表失败', error)
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
