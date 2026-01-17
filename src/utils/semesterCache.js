import Taro from '@tarojs/taro'

const CACHE_KEY = 'semester_config'
const CACHE_TIME_KEY = 'semester_config_time'
const USER_SELECTED_SEMESTER_KEY = 'user_selected_semester'

/**
 * 学期配置缓存工具
 */
export const semesterCache = {
    /**
     * 保存学期配置到缓存
     * @param {Object} data - 学期配置数据
     */
    save(data) {
        try {
            const now = Date.now()
            Taro.setStorageSync(CACHE_KEY, data)
            Taro.setStorageSync(CACHE_TIME_KEY, now)
        } catch (error) {
            console.error('保存学期配置缓存失败:', error)
        }
    },

    /**
     * 获取缓存的学期配置
     * @returns {Object|null} 学期配置数据或null
     */
    get() {
        try {
            const data = Taro.getStorageSync(CACHE_KEY)
            return data || null
        } catch (error) {
            console.error('读取学期配置缓存失败:', error)
            return null
        }
    },

    /**
     * 检查缓存是否需要更新（是否过了一天）
     * @returns {boolean} true表示需要更新，false表示缓存仍然有效
     */
    shouldUpdate() {
        try {
            const cacheTime = Taro.getStorageSync(CACHE_TIME_KEY)
            if (!cacheTime) return true

            const now = Date.now()
            const oneDayInMs = 24 * 60 * 60 * 1000

            // 检查是否超过一天
            return now - cacheTime > oneDayInMs
        } catch (error) {
            console.error('检查学期配置缓存时间失败:', error)
            return true
        }
    },

    /**
     * 清除缓存
     */
    clear() {
        try {
            Taro.removeStorageSync(CACHE_KEY)
            Taro.removeStorageSync(CACHE_TIME_KEY)
        } catch (error) {
            console.error('清除学期配置缓存失败:', error)
        }
    },

    /**
     * 获取缓存的当前学期
     * @returns {string|null} 当前学期ID或null
     */
    getCurrentSemester() {
        const data = this.get()
        return data?.current || null
    },

    /**
     * 保存用户手动选择的学期
     * @param {string} semesterId - 用户选择的学期ID
     */
    saveUserSelectedSemester(semesterId) {
        try {
            Taro.setStorageSync(USER_SELECTED_SEMESTER_KEY, semesterId)
        } catch (error) {
            console.error('保存用户选择的学期失败:', error)
        }
    },

    /**
     * 获取用户手动选择的学期
     * @returns {string|null} 用户选择的学期ID或null
     */
    getUserSelectedSemester() {
        try {
            return Taro.getStorageSync(USER_SELECTED_SEMESTER_KEY) || null
        } catch (error) {
            console.error('读取用户选择的学期失败:', error)
            return null
        }
    },

    /**
     * 清除用户选择的学期（当用户想要回到系统默认学期时）
     */
    clearUserSelectedSemester() {
        try {
            Taro.removeStorageSync(USER_SELECTED_SEMESTER_KEY)
        } catch (error) {
            console.error('清除用户选择的学期失败:', error)
        }
    }
}
