import { get, post, put, del } from '../utils/request'

export const materialAPI = {
  getMaterials(params) {
    return get('/api/v0/materials', params)
  },

  getTopMaterials(params) {
    return get('/api/v0/materials/top', params)
  },

  getHotWords(params) {
    return get('/api/v0/materials/hot-words', params)
  },

  searchMaterials(params) {
    return get('/api/v0/materials/search', params)
  },

  getMaterialDetail(md5) {
    return get(`/api/v0/materials/${md5}`)
  },

  rateMaterial(md5, data) {
    return post(`/api/v0/materials/${md5}/rating`, data)
  },

  downloadMaterial(md5) {
    return post(`/api/v0/materials/${md5}/download`)
  },

  getCategories(params) {
    return get('/api/v0/material-categories', params)
  }
}
