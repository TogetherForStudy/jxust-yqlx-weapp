// 用户角色
export const USER_ROLES = {
  NORMAL: 1,      // 普通用户
  ADMIN: 2        // 管理员
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
    backgroundColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    name: 'blue'
  },
  {
    backgroundColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    name: 'purple'
  },
  {
    backgroundColor: 'bg-green-100',
    textColor: 'text-green-800',
    name: 'green'
  },
  {
    backgroundColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    name: 'yellow'
  },
  {
    backgroundColor: 'bg-red-100',
    textColor: 'text-red-800',
    name: 'red'
  },
  {
    backgroundColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    name: 'indigo'
  },
  {
    backgroundColor: 'bg-pink-100',
    textColor: 'text-pink-800',
    name: 'pink'
  },
  {
    backgroundColor: 'bg-teal-100',
    textColor: 'text-teal-800',
    name: 'teal'
  },
  {
    backgroundColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    name: 'orange'
  },
  {
    backgroundColor: 'bg-cyan-100',
    textColor: 'text-cyan-800',
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

// 学期配置
export const SEMESTER_CONFIG = {
  // 学期开始时间 (可根据实际情况调整)
  START_DATE: '2025-09-08',
  CURRENT: '2025-2026-1'
}
