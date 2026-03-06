import { get, post } from '../utils/request'

export const rbacAPI = {
  getRoles() {
    return get('/api/v0/admin/rbac/roles')
  },

  getPermissions() {
    return get('/api/v0/admin/rbac/permissions')
  },

  getRolesPermissions() {
    return get('/api/v0/admin/rbac/roles/permissions')
  },

  updateUserRoles(userId, data) {
    return post(`/api/v0/admin/rbac/users/${userId}/roles`, data)
  }
}
