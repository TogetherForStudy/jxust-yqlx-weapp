import { get, post, put, del } from '../utils/request'

// 认证相关API
export const authAPI = {
  // 微信登录
  wechatLogin(code) {
    return post('/api/v0/auth/wechat-login', { code })
  }
}

// 用户相关API
export const userAPI = {
  // 获取用户资料
  getProfile() {
    return get('/api/v0/user/profile')
  },

  // 更新用户资料
  updateProfile(data) {
    return put('/api/v0/user/profile', data)
  }
}

// 评价相关API
export const reviewAPI = {
  // 获取指定教师的评价
  getTeacherReviews(params) {
    return get('/api/v0/reviews/teacher', params)
  },

  // 创建教师评价
  createReview(data) {
    return post('/api/v0/reviews/', data)
  },

  // 获取用户的评价记录
  getUserReviews(params) {
    return get('/api/v0/reviews/user', params)
  },

  // 获取所有评价列表 (管理员)
  getAllReviews(params) {
    return get('/api/v0/reviews/', params)
  },

  // 审核通过评价 (管理员)
  approveReview(id, data) {
    return post(`/api/v0/reviews/${id}/approve`, data)
  },

  // 审核拒绝评价 (管理员)
  rejectReview(id, data) {
    return post(`/api/v0/reviews/${id}/reject`, data)
  },

  // 删除评价 (管理员)
  deleteReview(id) {
    return del(`/api/v0/reviews/${id}`)
  }
}

// 课表相关API
export const courseTableAPI = {
  // 获取用户课程表
  getCourseTable(params) {
    return get('/api/v0/coursetable', params)
  },

  // 搜索班级
  searchClass(params) {
    return get('/api/v0/coursetable/search', params)
  },

  // 更新用户班级
  updateClass(data) {
    return put('/api/v0/coursetable/class', data)
  },

  // 编辑个人课表单个格子
  editCourseCell(data) {
    return put('/api/v0/coursetable', data)
  },

  // 重置用户绑定
  resetBindCount(userId) {
    return post(`/api/v0/coursetable/reset/${userId}`)
  }
}

// 挂科率相关API
export const failRateAPI = {
  // 搜索挂科率数据
  search(params) {
    return get('/api/v0/failrate/search', params)
  },

  // 随机获取10条挂科率数据
  getRandom() {
    return get('/api/v0/failrate/rand')
  }
}

// 英雄榜相关API
export const heroAPI = {
  // 获取英雄榜名单
  getHeroes() {
    return get('/api/v0/heroes/')
  },

  // 搜索英雄（管理员）
  searchHeroes(params) {
    return get('/api/v0/heroes/search', params)
  },

  // 创建英雄（管理员）
  createHero(data) {
    return post('/api/v0/heroes/', data)
  },

  // 更新英雄（管理员）
  updateHero(id, data) {
    return put(`/api/v0/heroes/${id}`, data)
  },

  // 删除英雄（管理员）
  deleteHero(id) {
    return del(`/api/v0/heroes/${id}`)
  }
}

// 系统配置相关API
export const configAPI = {
  // 公开读取配置
  getConfig(key) {
    return get(`/api/v0/config/${key}`)
  },

  // 搜索配置（管理员）
  searchConfig(params) {
    return get('/api/v0/config/search', params)
  },

  // 创建配置（管理员）
  createConfig(data) {
    return post('/api/v0/config/', data)
  },

  // 更新配置（管理员）
  updateConfig(key, data) {
    return put(`/api/v0/config/${key}`, data)
  },

  // 删除配置（管理员）
  deleteConfig(key) {
    return del(`/api/v0/config/${key}`)
  }
}

// OSS相关API
export const ossAPI = {
  // 获取又拍云访问token
  getToken(uri, expireSeconds = 600) {
    return post('/api/v0/oss/token', {
      uri,
      expire_seconds: expireSeconds
    })
  }
}

// 通知相关API
export const notificationAPI = {
  // 获取通知列表（公开）
  getNotifications(params) {
    return get('/api/v0/notifications', params)
  },

  // 获取通知详情（公开）
  getNotificationDetail(id) {
    return get(`/api/v0/notifications/${id}`)
  },

  // 创建通知（运营专用）
  createNotification(data) {
    return post('/api/v0/admin/notifications', data)
  },

  // 更新通知（运营专用）
  updateNotification(id, data) {
    return put(`/api/v0/admin/notifications/${id}`, data)
  },

  // 发布通知（运营专用）
  publishNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/publish`)
  },

  // 管理员直通发布通知（管理员专用）
  publishAdminNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/publish-admin`)
  },

  // 删除通知（运营专用）
  deleteNotification(id) {
    return del(`/api/v0/admin/notifications/${id}`)
  },

  // 审核通知（管理员专用）
  approveNotification(id, data) {
    return post(`/api/v0/admin/notifications/${id}/approve`, data)
  },

  // 获取管理员通知列表（管理员专用）
  getAdminNotifications(params) {
    return get('/api/v0/admin/notifications', params)
  },

  // 获取管理员通知详情（管理员专用）
  getAdminNotificationDetail(id) {
    return get(`/api/v0/admin/notifications/${id}`)
  },

  // 获取通知分类列表（公开）
  getCategories() {
    return get('/api/v0/categories')
  },

  // 创建通知分类（管理员专用）
  createCategory(data) {
    return post('/api/v0/admin/categories', data)
  },

  // 更新通知分类（管理员专用）
  updateCategory(id, data) {
    return put(`/api/v0/admin/categories/${id}`, data)
  },

  // 转换通知为日程（需认证）
  convertToSchedule(id, data) {
    return post(`/api/v0/admin/notifications/${id}/schedule`, data)
  },

  // 获取通知统计信息（管理员专用）
  getNotificationStats() {
    return get('/api/v0/admin/notifications/stats')
  },

  // 置顶通知（管理员专用）
  pinNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/pin`)
  },

  // 取消置顶通知（管理员专用）
  unpinNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/unpin`)
  }
}

// 用户投稿相关API
export const contributionAPI = {
  // 创建投稿（需认证）
  createContribution(data) {
    return post('/api/v0/contributions', data)
  },

  // 获取投稿列表（需认证）
  getContributions(params) {
    return get('/api/v0/contributions', params)
  },

  // 获取投稿详情（需认证）
  getContributionDetail(id) {
    return get(`/api/v0/contributions/${id}`)
  },

  // 审核投稿（运营/管理员专用）
  reviewContribution(id, data) {
    return post(`/api/v0/contributions/${id}/review`, data)
  },

  // 获取用户投稿统计（需认证）
  getContributionStats() {
    return get('/api/v0/contributions/stats')
  },

  // 获取管理员投稿统计（管理员专用）
  getContributionStatsAdmin() {
    return get('/api/v0/contributions/stats-admin')
  }
}

// 系统相关API
export const systemAPI = {
  // 健康检查
  healthCheck() {
    return get('/health')
  }
}
