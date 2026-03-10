import { get } from '../utils/request'

export const notificationAPI = {
  getNotifications(params) {
    return get('/api/v0/notifications', params)
  },

  getNotificationDetail(id) {
    return get(`/api/v0/notifications/${id}`)
  },

  getCategories() {
    return get('/api/v0/categories')
  },

}
