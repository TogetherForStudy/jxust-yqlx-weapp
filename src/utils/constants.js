// 用户状态
export const USER_STATUS = {
  NORMAL: 1,      // 正常
  DISABLED: 2     // 禁用
}

// 评价态度
export const REVIEW_ATTITUDES = {
  RECOMMEND: 1,   // 推荐
  AVOID: 2,       // 避雷
  NEUTRAL: 3      // 中立
}

// 评价状态
export const REVIEW_STATUS = {
  PENDING: 1,     // 待审核
  APPROVED: 2,    // 已通过
  REJECTED: 3     // 已拒绝
}

// 课程时间段
export const TIME_SLOTS = {
  1: '08:30-10:05',
  2: '10:25-12:00',
  3: '14:00-15:35',
  4: '15:55-17:30',
  5: '19:00-20:35'
}

// 周名称
export const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 课程颜色配置 - 预设10套颜色组合（浅色淡彩 / 深色彩色玻璃质感）
export const COURSE_COLORS = [
  {
    backgroundColor: 'bg-blue-200 dark:bg-blue-400/25',
    textColor: 'text-blue-800 dark:text-blue-200',
    name: 'blue'
  },
  {
    backgroundColor: 'bg-purple-200 dark:bg-purple-400/25',
    textColor: 'text-purple-800 dark:text-purple-200',
    name: 'purple'
  },
  {
    backgroundColor: 'bg-emerald-200 dark:bg-emerald-400/25',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    name: 'green'
  },
  {
    backgroundColor: 'bg-amber-200 dark:bg-amber-400/25',
    textColor: 'text-amber-800 dark:text-amber-200',
    name: 'yellow'
  },
  {
    backgroundColor: 'bg-rose-200 dark:bg-rose-400/25',
    textColor: 'text-rose-800 dark:text-rose-200',
    name: 'red'
  },
  {
    backgroundColor: 'bg-indigo-200 dark:bg-indigo-400/25',
    textColor: 'text-indigo-800 dark:text-indigo-200',
    name: 'indigo'
  },
  {
    backgroundColor: 'bg-pink-200 dark:bg-pink-400/25',
    textColor: 'text-pink-800 dark:text-pink-200',
    name: 'pink'
  },
  {
    backgroundColor: 'bg-teal-200 dark:bg-teal-400/25',
    textColor: 'text-teal-800 dark:text-teal-200',
    name: 'teal'
  },
  {
    backgroundColor: 'bg-orange-200 dark:bg-orange-400/25',
    textColor: 'text-orange-800 dark:text-orange-200',
    name: 'orange'
  },
  {
    backgroundColor: 'bg-cyan-200 dark:bg-cyan-400/25',
    textColor: 'text-cyan-800 dark:text-cyan-200',
    name: 'cyan'
  }
]

// 响应状态码
export const STATUS_CODES = {
  SUCCESS: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
}

// 分页默认配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  MAX_SIZE: 100
}
