import { get, post, del } from '../utils/request'

export const reviewAPI = {
  getTeacherReviews(params) {
    return get('/api/v0/reviews/teacher', params)
  },

  createReview(data) {
    return post('/api/v0/reviews/', data)
  },

  getUserReviews(params) {
    return get('/api/v0/reviews/user', params)
  },

  getAllReviews(params) {
    return get('/api/v0/reviews/', params)
  },

  approveReview(id, data) {
    return post(`/api/v0/reviews/${id}/approve`, data)
  },

  rejectReview(id, data) {
    return post(`/api/v0/reviews/${id}/reject`, data)
  },

  deleteReview(id) {
    return del(`/api/v0/reviews/${id}`)
  }
}
