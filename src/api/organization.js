import { get } from '../utils/request'

export const organizationAPI = {
  getOrganizations(params) {
    return get('/api/v0/organizations/', params)
  },

  getOrganizationDetail(id) {
    return get(`/api/v0/organizations/${id}`)
  },
}
