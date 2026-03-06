import { get, put, post } from '../utils/request'

export const courseTableAPI = {
  getCourseTable(params) {
    return get('/api/v0/coursetable', params)
  },

  searchClass(params) {
    return get('/api/v0/coursetable/search', params)
  },

  updateClass(data) {
    return put('/api/v0/coursetable/class', data)
  },

  editCourseCell(data) {
    return put('/api/v0/coursetable', data)
  },

  resetBindCount(userId) {
    if (!userId) return Promise.reject(new Error('userId is required'))
    return post(`/api/v0/coursetable/reset/${userId}`)
  }
}
