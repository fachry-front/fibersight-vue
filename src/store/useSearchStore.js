import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useSearchStore = defineStore('search', () => {
  const query = ref('')
  const router = useRouter()

  function setQuery(q) {
    query.value = q
  }

  // Kalau user enter di search box, navigasi ke /devices dengan query tersebut
  function submitSearch() {
    if (query.value.trim()) {
      router.push({ path: '/devices', query: { q: query.value.trim() } })
    }
  }

  function clear() {
    query.value = ''
  }

  return { query, setQuery, submitSearch, clear }
})
