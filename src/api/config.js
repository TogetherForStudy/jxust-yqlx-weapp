import { get, post, put, del } from '../utils/request'

export const configAPI = {
  getConfig(key) {
    if (!key) return Promise.reject(new Error('Config key is required'))
    return get(`/api/v0/config/${key}`)
  },

  searchConfig(params) {
    return get('/api/v0/config/search', params)
  },

  createConfig(data) {
    return post('/api/v0/config/', data)
  },

  updateConfig(key, data) {
    return put(`/api/v0/config/${key}`, data)
  },

  deleteConfig(key) {
    return del(`/api/v0/config/${key}`)
  }
}
