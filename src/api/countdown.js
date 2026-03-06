import { get, post, put, del } from '../utils/request'

export const countdownAPI = {
  getList() {
    return get('/api/v0/countdowns')
  },

  getDetail(id) {
    return get(`/api/v0/countdowns/${id}`)
  },

  create(data) {
    return post('/api/v0/countdowns', data)
  },

  update(id, data) {
    return put(`/api/v0/countdowns/${id}`, data)
  },

  delete(id) {
    return del(`/api/v0/countdowns/${id}`)
  }
}
