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
    return get('/api/v0/coursetable/', params)
  },

  // 搜索班级
  searchClass(params) {
    return get('/api/v0/coursetable/search', params)
  },

  // 更新用户班级
  updateClass(data) {
    return put('/api/v0/coursetable/class', data)
  }
}

// 系统相关API
export const systemAPI = {
  // 健康检查
  healthCheck() {
    return get('/health')
  }
}
