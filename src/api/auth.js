import { get, post, put } from '../utils/request'

export const authAPI = {
  wechatLogin(code) {
    return post('/api/v0/auth/wechat-login', { code })
  }
}

export const userAPI = {
  getProfile() {
    return get('/api/v0/user/profile')
  },

  updateProfile(data) {
    return put('/api/v0/user/profile', data)
  }
}
