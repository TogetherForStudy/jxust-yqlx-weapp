import { get, post } from '../utils/request'

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
}
