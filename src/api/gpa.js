import { get, post, del } from '../utils/request'

export const gpaAPI = {
  getBackupList() {
    return get('/api/v0/gpa/backup')
  },

  getBackupDetail(id) {
    return get(`/api/v0/gpa/backup/${id}`)
  },

  createBackup(data) {
    return post('/api/v0/gpa/backup', data)
  },

  deleteBackup(id) {
    return del(`/api/v0/gpa/backup/${id}`)
  }
}
