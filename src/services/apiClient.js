import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// ── Axios instance ──
// Centralized config so every request shares baseURL, timeout, and headers.
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor ──
// Good place for: auth tokens, request logging, request timestamps.
apiClient.interceptors.request.use(
  (config) => {
    // Tandai waktu mulai request, dipakai untuk logging durasi di response interceptor
    config.metadata = { startTime: Date.now() }

    if (import.meta.env.DEV) {
      console.log(`→ [API] ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──
// Good place for: unwrapping data, global error handling, retry logic, logging.
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      const duration = Date.now() - (response.config.metadata?.startTime ?? Date.now())
      console.log(`← [API] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status}) — ${duration}ms`)
    }
    return response
  },
  (error) => {
    // Normalize error shape so callers always get { message, status, data }
    const normalized = {
      message: error.response?.data?.message || error.message || 'Unknown error',
      status:  error.response?.status ?? null,
      data:    error.response?.data ?? null,
      isNetworkError: !error.response, // true kalau request gagal sebelum sampai server
    }

    if (import.meta.env.DEV) {
      console.error(`✗ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} →`, normalized.message)
    }

    return Promise.reject(normalized)
  }
)

export default apiClient
