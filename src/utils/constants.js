// 用户角色
export const USER_ROLES = {
  NORMAL: 1,      // 普通用户
  ADMIN: 2,       // 管理员
  OPERATOR: 3     // 运营者
}

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

// 课程颜色配置 - 预设10套颜色组合
export const COURSE_COLORS = [
  {
    backgroundColor: 'bg-blue-100 dark:bg-blue-900/40',
    textColor: 'text-blue-700 dark:text-blue-200',
    name: 'blue'
  },
  {
    backgroundColor: 'bg-purple-100 dark:bg-purple-900/40',
    textColor: 'text-purple-700 dark:text-purple-200',
    name: 'purple'
  },
  {
    backgroundColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    textColor: 'text-emerald-700 dark:text-emerald-200',
    name: 'green'
  },
  {
    backgroundColor: 'bg-amber-100 dark:bg-amber-900/40',
    textColor: 'text-amber-700 dark:text-amber-200',
    name: 'yellow'
  },
  {
    backgroundColor: 'bg-rose-100 dark:bg-rose-900/40',
    textColor: 'text-rose-700 dark:text-rose-200',
    name: 'red'
  },
  {
    backgroundColor: 'bg-indigo-100 dark:bg-indigo-900/40',
    textColor: 'text-indigo-700 dark:text-indigo-200',
    name: 'indigo'
  },
  {
    backgroundColor: 'bg-pink-100 dark:bg-pink-900/40',
    textColor: 'text-pink-700 dark:text-pink-200',
    name: 'pink'
  },
  {
    backgroundColor: 'bg-teal-100 dark:bg-teal-900/40',
    textColor: 'text-teal-700 dark:text-teal-200',
    name: 'teal'
  },
  {
    backgroundColor: 'bg-orange-100 dark:bg-orange-900/40',
    textColor: 'text-orange-700 dark:text-orange-200',
    name: 'orange'
  },
  {
    backgroundColor: 'bg-cyan-100 dark:bg-cyan-900/40',
    textColor: 'text-cyan-700 dark:text-cyan-200',
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
