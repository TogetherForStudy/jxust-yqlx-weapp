import { get, post, put, del } from '../utils/request'

export const notificationAPI = {
  getNotifications(params) {
    return get('/api/v0/notifications', params)
  },

  getNotificationDetail(id) {
    return get(`/api/v0/notifications/${id}`)
  },

  createNotification(data) {
    return post('/api/v0/admin/notifications', data)
  },

  updateNotification(id, data) {
    return put(`/api/v0/admin/notifications/${id}`, data)
  },

  publishNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/publish`)
  },

  publishAdminNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/publish-admin`)
  },

  deleteNotification(id) {
    return del(`/api/v0/admin/notifications/${id}`)
  },

  approveNotification(id, data) {
    return post(`/api/v0/admin/notifications/${id}/approve`, data)
  },

  getAdminNotifications(params) {
    return get('/api/v0/admin/notifications', params)
  },

  getAdminNotificationDetail(id) {
    return get(`/api/v0/admin/notifications/${id}`)
  },

  getCategories() {
    return get('/api/v0/categories')
  },

  createCategory(data) {
    return post('/api/v0/admin/categories', data)
  },

  updateCategory(id, data) {
    return put(`/api/v0/admin/categories/${id}`, data)
  },

  convertToSchedule(id, data) {
    return post(`/api/v0/admin/notifications/${id}/schedule`, data)
  },

  getNotificationStats() {
    return get('/api/v0/admin/notifications/stats')
  },

  pinNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/pin`)
  },

  unpinNotification(id) {
    return post(`/api/v0/admin/notifications/${id}/unpin`)
  }
}
