import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import deviceApi from '@/services/deviceApi'

/**
 * Ambang batas (threshold) untuk menentukan status device berdasarkan
 * Rx Power dan suhu. Dipakai oleh getStatus(), getRxClass(), dan komponen
 * lain yang menampilkan warna/badge status.
 *
 * @typedef {Object} ThresholdConfig
 * @property {number} NORMAL_MIN   - Rx Power minimum untuk status "Normal" (dBm)
 * @property {number} WARNING_MIN  - Rx Power minimum untuk status "Warning" (dBm)
 * @property {number} CRITICAL_MAX - Rx Power di bawah/sama ini = "Critical" (dBm)
 * @property {number} TEMP_WARN    - Suhu (°C) di atas/sama ini dianggap warning
 * @property {number} TEMP_CRIT    - Suhu (°C) di atas/sama ini dianggap critical
 * @property {number} HISTORY_LIMIT - Jumlah maksimum titik data riwayat (FIFO)
 */
export const THRESHOLD = {
  NORMAL_MIN:   -24,
  WARNING_MIN:  -27,
  CRITICAL_MAX: -28,
  TEMP_WARN:     55,
  TEMP_CRIT:     65,
  HISTORY_LIMIT: 30,
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000'

/**
 * Menentukan status alarm device berdasarkan nilai Rx Power.
 * @param {number} rxPower - Rx Power dalam dBm
 * @returns {'Normal'|'Warning'|'Critical'} status device
 */
export function getStatus(rxPower) {
  if (rxPower <= THRESHOLD.CRITICAL_MAX) return 'Critical'
  if (rxPower  < THRESHOLD.NORMAL_MIN)  return 'Warning'
  return 'Normal'
}

/**
 * Mengembalikan nama class CSS untuk styling sel Rx Power di tabel,
 * sesuai tingkat keparahan (td-ok / td-warn / td-crit).
 * @param {number} rxPower - Rx Power dalam dBm
 * @returns {'td-ok'|'td-warn'|'td-crit'}
 */
export function getRxClass(rxPower) {
  if (rxPower <= THRESHOLD.CRITICAL_MAX) return 'td-crit'
  if (rxPower  < THRESHOLD.NORMAL_MIN)  return 'td-warn'
  return 'td-ok'
}

/**
 * Mengembalikan nama class CSS untuk komponen BaseBadge berdasarkan status.
 * @param {'Normal'|'Warning'|'Critical'|string} status
 * @returns {'badge-normal'|'badge-warning'|'badge-critical'|'badge-offline'}
 */
export function getBadgeClass(status) {
  if (status === 'Critical') return 'badge-critical'
  if (status === 'Warning')  return 'badge-warning'
  if (status === 'Normal')   return 'badge-normal'
  return 'badge-offline'
}

export const useDeviceStore = defineStore('device', () => {
  // ── State ──
  const devices          = ref([])
  const rxHistories      = ref({})
  const selectedDeviceId = ref(null)
  const loading          = ref(false)
  const error            = ref(null)
  let   socket           = null

  // ── Computed ──
  const selectedDevice = computed(() =>
    devices.value.find(d => d.id === selectedDeviceId.value) ?? null
  )

  const analytics = computed(() => {
    const d        = devices.value
    const critical = d.filter(x => x.status === 'Critical').length
    const warning  = d.filter(x => x.status === 'Warning').length
    const normal   = d.filter(x => x.status === 'Normal').length
    const avgRx    = d.length ? d.reduce((s, x) => s + x.rxPower, 0) / d.length : 0
    const health   = Math.max(0, Math.round(100 - critical * 7 - warning * 2.5))
    return {
      critical, warning, normal,
      total:      d.length,
      avgRx:      parseFloat(avgRx.toFixed(2)),
      activeOlt:  d.filter(x => x.type === 'OLT').length,
      activeOdp:  d.filter(x => x.type === 'ODP').length,
      healthScore: health,
    }
  })

  const odps = computed(() => devices.value.filter(d => d.type === 'ODP'))
  const olts = computed(() => devices.value.filter(d => d.type === 'OLT'))

  // ── API Actions ──

  /**
   * Mengambil daftar semua device dari backend dan menginisialisasi
   * riwayat Rx Power untuk device yang belum punya histori.
   * Mengatur state `loading` dan `error` secara otomatis.
   *
   * @param {boolean} [forceRefresh=false] - true untuk skip cache di deviceApi
   * @returns {Promise<void>}
   */
  async function fetchDevices(forceRefresh = false) {
    loading.value = true
    error.value   = null
    try {
      const data = await deviceApi.getDevices(forceRefresh)
      devices.value = data

      // Init histories kalau belum ada
      data.forEach(d => {
        if (!rxHistories.value[d.id]) {
          rxHistories.value[d.id] = [{ time: d.lastSeen, value: d.rxPower }]
        }
      })
    } catch (err) {
      error.value = err.message
      console.error('fetchDevices error:', err.message)
    } finally {
      loading.value = false
    }
  }

  /**
   * Mengambil riwayat Rx Power untuk satu device (dipakai untuk grafik).
   * @param {string} deviceId - ID device, contoh: "ODP-01"
   * @returns {Promise<void>}
   */
  async function fetchHistory(deviceId) {
    try {
      const data = await deviceApi.getDeviceHistory(deviceId)
      rxHistories.value[deviceId] = data
    } catch (err) {
      console.error(`fetchHistory(${deviceId}) error:`, err.message)
    }
  }

  /**
   * Menambah device baru via backend.
   * @param {Object} deviceData - data device baru (id, type, location, area, rxPower, txPower, temperature)
   * @returns {Promise<boolean>} true kalau berhasil, false kalau ID sudah ada (409) atau gagal
   */
  async function addDevice(deviceData) {
    try {
      const newDev = await deviceApi.createDevice(deviceData)
      if (newDev === null) return false // ID sudah ada (409)
      devices.value.push(newDev)
      rxHistories.value[newDev.id] = [{ time: newDev.lastSeen, value: newDev.rxPower }]
      return true
    } catch (err) {
      console.error('addDevice error:', err.message)
      return false
    }
  }

  /**
   * Menghapus device berdasarkan ID dan membersihkan riwayatnya.
   * Jika device yang dihapus sedang dipilih, selectedDeviceId direset ke null.
   * @param {string} id - ID device yang akan dihapus
   * @returns {Promise<void>}
   */
  async function deleteDevice(id) {
    try {
      await deviceApi.deleteDevice(id)
      devices.value = devices.value.filter(d => d.id !== id)
      delete rxHistories.value[id]
      if (selectedDeviceId.value === id) selectedDeviceId.value = null
    } catch (err) {
      console.error('deleteDevice error:', err.message)
    }
  }

  function selectDevice(id) {
    selectedDeviceId.value = id === selectedDeviceId.value ? null : id
    // Fetch riwayat saat device dipilih (untuk grafik)
    if (selectedDeviceId.value) fetchHistory(selectedDeviceId.value)
  }

  function getDeviceHistory(id) {
    return rxHistories.value[id] ?? []
  }

  // ── WebSocket real-time ──
  function startLiveSimulation() {
    if (socket) return  // sudah konek

    socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] })

    socket.on('connect', () => {
      console.log('🔌 WebSocket terkoneksi ke backend')
    })

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnect')
    })

    // Terima update telemetri real-time dari backend
    socket.on('telemetryUpdate', (data) => {
      const idx = devices.value.findIndex(d => d.id === data.id)
      if (idx === -1) return

      // Update device
      devices.value[idx] = {
        ...devices.value[idx],
        rxPower:  data.rxPower,
        status:   data.status,
        lastSeen: data.lastSeen,
      }

      // FIFO push — max 30 titik (PDR §6)
      if (!rxHistories.value[data.id]) rxHistories.value[data.id] = []
      rxHistories.value[data.id].push({
        time:  data.lastSeen,
        value: data.rxPower,
      })
      if (rxHistories.value[data.id].length > THRESHOLD.HISTORY_LIMIT) {
        rxHistories.value[data.id].shift()
      }
    })

    socket.on('connect_error', (err) => {
      console.warn('⚠️ WebSocket error:', err.message)
    })
  }

  function stopLiveSimulation() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  return {
    devices, rxHistories, selectedDeviceId, selectedDevice,
    analytics, odps, olts, loading, error,
    fetchDevices, fetchHistory, addDevice, deleteDevice,
    selectDevice, getDeviceHistory,
    startLiveSimulation, stopLiveSimulation,
  }
})
