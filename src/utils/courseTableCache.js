import Taro from '@tarojs/taro'

/**
 * 课表缓存管理类
 * 用于管理课表数据的本地缓存和版本控制
 */
class CourseTableCache {
  constructor() {
    this.storagePrefix = 'courseTable_'
    this.timestampSuffix = '_timestamp'
    this.classIdSuffix = '_classId'
  }

  /**
   * 获取缓存的课表数据
   * @param {string} semester - 学期标识
   * @returns {object|null} 课表数据或null
   */
  getCachedData(semester) {
    try {
      const key = `${this.storagePrefix}${semester}`
      const data = Taro.getStorageSync(key)
      return data || null
    } catch (error) {
      console.error('获取缓存数据失败:', error)
      return null
    }
  }

  /**
   * 获取缓存的时间戳
   * @param {string} semester - 学期标识
   * @returns {number|null} 时间戳或null
   */
  getCachedTimestamp(semester) {
    try {
      const key = `${this.storagePrefix}${semester}${this.timestampSuffix}`
      const timestamp = Taro.getStorageSync(key)
      return timestamp ? parseInt(timestamp, 10) : null
    } catch (error) {
      console.error('获取缓存时间戳失败:', error)
      return null
    }
  }

  /**
   * 获取缓存的班级ID
   * @param {string} semester - 学期标识
   * @returns {string|null} 班级ID或null
   */
  getCachedClassId(semester) {
    try {
      const key = `${this.storagePrefix}${semester}${this.classIdSuffix}`
      const classId = Taro.getStorageSync(key)
      return classId || null
    } catch (error) {
      console.error('获取缓存班级ID失败:', error)
      return null
    }
  }

  /**
   * 保存课表数据和时间戳
   * @param {string} semester - 学期标识
   * @param {object} courseData - 课表数据
   * @param {number} timestamp - 时间戳
   * @param {string} classId - 班级ID
   */
  saveCourseTable(semester, courseData, timestamp, classId) {
    try {
      const dataKey = `${this.storagePrefix}${semester}`
      const timestampKey = `${this.storagePrefix}${semester}${this.timestampSuffix}`
      const classIdKey = `${this.storagePrefix}${semester}${this.classIdSuffix}`

      Taro.setStorageSync(dataKey, courseData)
      Taro.setStorageSync(timestampKey, timestamp.toString())
      if (classId) {
        Taro.setStorageSync(classIdKey, classId)
      }

    } catch (error) {
      console.error('保存课表缓存失败:', error)
    }
  }

  /**
   * 清除指定学期的缓存
   * @param {string} semester - 学期标识
   */
  clearCache(semester) {
    try {
      const dataKey = `${this.storagePrefix}${semester}`
      const timestampKey = `${this.storagePrefix}${semester}${this.timestampSuffix}`
      const classIdKey = `${this.storagePrefix}${semester}${this.classIdSuffix}`

      Taro.removeStorageSync(dataKey)
      Taro.removeStorageSync(timestampKey)
      Taro.removeStorageSync(classIdKey)

    } catch (error) {
      console.error('清除课表缓存失败:', error)
    }
  }

  /**
   * 清除所有课表缓存
   */
  clearAllCache() {
    try {
      const info = Taro.getStorageInfoSync()
      const keys = info.keys.filter(key => key.startsWith(this.storagePrefix))
      keys.forEach(key => {
        Taro.removeStorageSync(key)
      })
    } catch (error) {
      console.error('清除所有课表缓存失败:', error)
    }
  }

  /**
   * 检查缓存是否有效（时间戳和班级ID都存在且匹配）
   * @param {string} semester - 学期标识
   * @param {string} currentClassId - 当前用户的班级ID
   * @returns {boolean} 缓存是否有效
   */
  isCacheValid(semester, currentClassId) {
    const cachedTimestamp = this.getCachedTimestamp(semester)
    const cachedClassId = this.getCachedClassId(semester)
    const cachedData = this.getCachedData(semester)

    // 缓存有效条件：有数据、有时间戳、班级ID匹配
    return !!(
      cachedData &&
      cachedTimestamp &&
      cachedClassId &&
      cachedClassId === currentClassId
    )
  }
}

// 导出单例
export const courseTableCache = new CourseTableCache()

