import { get, post, put, del } from '../utils/request'

export const studyTaskAPI = {
  getList(params) {
    return get('/api/v0/study-tasks', params)
  },

  getDetail(id) {
    return get(`/api/v0/study-tasks/${id}`)
  },

  create(data) {
    return post('/api/v0/study-tasks', data)
  },

  update(id, data) {
    return put(`/api/v0/study-tasks/${id}`, data)
  },

  delete(id) {
    return del(`/api/v0/study-tasks/${id}`)
  },

  getStats() {
    return get('/api/v0/study-tasks/stats')
  }
}
