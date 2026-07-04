import { REVIEW_ATTITUDES, REVIEW_STATUS } from './constants'
import { formatDateTime } from './time'
import Taro from '@tarojs/taro'

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
 * 安全返回：导航栈 > 1 时正常返回，否则跳转到 fallback 页面
 * @param {string} fallbackUrl - 无法返回时的跳转路径
 * @param {boolean} isTab - fallback 是否为 TabBar 页面
 */
export const safeNavigateBack = (fallbackUrl, isTab = false) => {
  const pages = Taro.getCurrentPages()
  if (pages.length > 1) {
    Taro.navigateBack()
  } else if (isTab) {
    Taro.switchTab({ url: fallbackUrl })
  } else {
    Taro.redirectTo({ url: fallbackUrl })
  }
}

/**
 * 格式化日期
 * @param {string|Date} dateString
 * @param {string} format
 * @returns {string}
 */
export const formatDate = (dateString, format = 'relative') => {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  const now = new Date()

  if (format === 'relative') {
    const diffMs = now - date

    // 未来日期不用相对时间
    if (diffMs < 0) {
      return formatDateTime(date, 'yyyy-MM-dd HH:mm')
    }

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





