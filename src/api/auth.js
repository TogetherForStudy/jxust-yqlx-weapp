import { get, post, put, request } from '../utils/request'

export const authAPI = {
  wechatLogin(code, options = {}) {
    return post('/api/v0/auth/wechat-login', { code }, {
      skipAuthRefresh: true,
      retryOnAuthFailure: false,
      ...options
    })
  },

  refresh(refreshToken, options = {}) {
    return post('/api/v0/auth/refresh', {
      refresh_token: refreshToken
    }, {
      skipAuthRefresh: true,
      retryOnAuthFailure: false,
      ...options
    })
  },

  logout(options = {}) {
    return request({
      url: '/api/v0/auth/logout',
      method: 'POST',
      skipAuthRefresh: true,
      retryOnAuthFailure: false,
      handleAuthFailure: false,
      ...options
    })
  },

  logoutAll(options = {}) {
    return request({
      url: '/api/v0/auth/logout-all',
      method: 'POST',
      skipAuthRefresh: true,
      retryOnAuthFailure: false,
      handleAuthFailure: false,
      ...options
    })
  }
}

export const userAPI = {
  getProfile() {
    return get('/api/v0/user/profile')
  },

  updateProfile(data) {
    return put('/api/v0/user/profile', data)
  },

  getLoginDays() {
    return get('/api/v0/user/login-days')
  }
}
