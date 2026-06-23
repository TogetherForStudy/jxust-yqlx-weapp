import { get, post } from '../utils/request'

export const pomodoroAPI = {
  increment() {
    return post('/api/v0/pomodoro/increment', {})
  },

  getCount() {
    return get('/api/v0/pomodoro/count')
  },

  getRanking() {
    return get('/api/v0/pomodoro/ranking')
  }
}
