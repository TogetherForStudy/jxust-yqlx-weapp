import { REVIEW_ATTITUDES, REVIEW_STATUS, USER_ROLES } from './constants'
import { formatDateTime } from './time'

// 导出图片相关工具方法
export {
  getSignedImageUrl,
  getBatchSignedImageUrls,
  clearImageCache,
  isImageExpiring,
  preloadImageUrls,
  getLocalCacheStats,
  cleanExpiredLocalCache
} from './image'

/**
 * 格式化日期
 * @param {string|Date} dateString
 * @param {string} format
 * @returns {string}
 */
export const formatDate = (dateString, format = 'relative') => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()

  if (format === 'relative') {
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) {
      return '刚刚'
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return formatDateTime(date, 'yyyy-MM-dd HH:mm')
    }
  }

  return formatDateTime(date, 'yyyy-MM-dd HH:mm')
}

/**
 * 格式化手机号（中间四位用*替换）
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3')
}

/**
 * 获取评价态度文本
 * @param {number} attitude
 * @returns {string}
 */
export const getAttitudeText = (attitude) => {
  switch (attitude) {
    case REVIEW_ATTITUDES.RECOMMEND:
      return '推荐'
    case REVIEW_ATTITUDES.AVOID:
      return '避雷'
    case REVIEW_ATTITUDES.NEUTRAL:
      return '中立'
    default:
      return '未知'
  }
}

/**
 * 获取评价态度颜色类名
 * @param {number} attitude
 * @returns {string}
 */
export const getAttitudeColor = (attitude) => {
  switch (attitude) {
    case REVIEW_ATTITUDES.RECOMMEND:
      return 'bg-green-500'
    case REVIEW_ATTITUDES.AVOID:
      return 'bg-red-500'
    case REVIEW_ATTITUDES.NEUTRAL:
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

/**
 * 获取评价态度徽章类名
 * @param {number} attitude
 * @returns {string}
 */
export const getAttitudeBadgeClass = (attitude) => {
  switch (attitude) {
    case REVIEW_ATTITUDES.RECOMMEND:
      return 'bg-green-100 text-green-700'
    case REVIEW_ATTITUDES.AVOID:
      return 'bg-red-100 text-red-700'
    case REVIEW_ATTITUDES.NEUTRAL:
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * 获取评价状态文本
 * @param {number} status
 * @returns {string}
 */
export const getReviewStatusText = (status) => {
  switch (status) {
    case REVIEW_STATUS.PENDING:
      return '待审核'
    case REVIEW_STATUS.APPROVED:
      return '已通过'
    case REVIEW_STATUS.REJECTED:
      return '已拒绝'
    default:
      return '未知'
  }
}

/**
 * 获取评价状态颜色类名
 * @param {number} status
 * @returns {string}
 */
export const getReviewStatusColor = (status) => {
  switch (status) {
    case REVIEW_STATUS.PENDING:
      return 'bg-yellow-100 text-yellow-700'
    case REVIEW_STATUS.APPROVED:
      return 'bg-green-100 text-green-700'
    case REVIEW_STATUS.REJECTED:
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * 获取用户角色文本
 * @param {number} role
 * @returns {string}
 */
export const getUserRoleText = (role) => {
  switch (role) {
    case USER_ROLES.NORMAL:
      return '普通用户'
    case USER_ROLES.ADMIN:
      return '管理员'
    default:
      return '未知'
  }
}

/**
 * 截断文本
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 验证学号格式
 * @param {string} studentId
 * @returns {boolean}
 */
export const validateStudentId = (studentId) => {
  if (!studentId) return false
  // 基本格式验证：4-12位数字和字母
  return /^[a-zA-Z0-9]{4,12}$/.test(studentId)
}

/**
 * 验证手机号格式
 * @param {string} phone
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false
  // 中国大陆手机号格式
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 防抖函数
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

/**
 * 节流函数
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export const throttle = (func, delay = 300) => {
  let lastCall = 0
  return function (...args) {
    const now = new Date().getTime()
    if (now - lastCall < delay) return
    lastCall = now
    return func.apply(this, args)
  }
}

/**
 * 深拷贝对象
 * @param {*} obj
 * @returns {*}
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 解析URL参数
 * @param {string} url
 * @returns {Object}
 */
export const parseUrlParams = (url) => {
  const params = {}
  const queryString = url.split('?')[1]
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=')
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    })
  }
  return params
}
