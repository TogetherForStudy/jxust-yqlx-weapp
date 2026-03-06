import { get } from '../utils/request'

export const dictionaryAPI = {
  getRandomWord() {
    return get('/api/v0/dictionary/word')
  }
}
