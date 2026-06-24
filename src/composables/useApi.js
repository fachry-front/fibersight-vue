import { ref } from 'vue'

/**
 * useApi — composable generik untuk membungkus async API call
 * dengan state loading, error, dan data secara otomatis.
 *
 * Contoh pakai:
 *   const { data, loading, error, execute } = useApi(deviceApi.getDevices)
 *   await execute()
 */
export function useApi(apiFunction) {
  const data    = ref(null)
  const loading = ref(false)
  const error   = ref(null)

  async function execute(...args) {
    loading.value = true
    error.value   = null
    try {
      const result = await apiFunction(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err.message || 'Terjadi kesalahan'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}
