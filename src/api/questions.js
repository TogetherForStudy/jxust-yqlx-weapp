import { get, post } from '../utils/request'

export const questionsAPI = {
  getProjects() {
    return get('/api/v0/questions/projects')
  },

  getQuestionIds(params) {
    return get('/api/v0/questions/list', params)
  },

  getQuestionDetail(id) {
    return get(`/api/v0/questions/${id}`)
  },

  recordStudy(data) {
    return post('/api/v0/questions/study', data)
  },

  recordPractice(data) {
    return post('/api/v0/questions/practice', data)
  }
}
