import { get, put, del } from '../utils/request'

export const courseTableAPI = {
  getCourseTable(params) {
    return get('/api/v0/coursetable', params)
  },

  getBindCount() {
    return get('/api/v0/coursetable/bind-count')
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

  deleteSchedule(semester) {
    if (!semester) return Promise.reject(new Error('semester is required'))
    return del(`/api/v0/coursetable/schedule?semester=${encodeURIComponent(semester)}`)
  }
}
