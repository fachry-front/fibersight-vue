import apiClient from './apiClient'

/**
 * Simple in-memory cache untuk GET /api/devices.
 * Mengurangi request redundan ke backend saat user pindah halaman.
 * TTL 30 detik — cukup untuk navigasi antar halaman, tidak terlalu lama untuk data IoT.
 */
const CACHE_TTL = 30_000

let devicesCache = { data: null, timestamp: 0 }

function isCacheValid() {
  return devicesCache.data !== null && (Date.now() - devicesCache.timestamp) < CACHE_TTL
}

function invalidateCache() {
  devicesCache = { data: null, timestamp: 0 }
}

/**
 * Ambil daftar semua device.
 * Handle dua format response: array langsung ATAU paginated { data: [], total: n }.
 * @param {boolean} forceRefresh - skip cache kalau true
 */
async function getDevices(forceRefresh = false) {
  if (!forceRefresh && isCacheValid()) {
    return devicesCache.data
  }

  const response = await apiClient.get('/api/devices?limit=100')
  const raw = response.data
  // Handle both array and paginated response
  const devices = Array.isArray(raw) ? raw : (raw.data ?? raw.devices ?? [])
  devicesCache = { data: devices, timestamp: Date.now() }
  return devices
}

async function getDeviceHistory(deviceId) {
  const response = await apiClient.get(`/api/devices/${deviceId}/history`)
  return response.data
}

async function createDevice(deviceData) {
  try {
    const response = await apiClient.post('/api/devices', deviceData)
    invalidateCache()
    return response.data
  } catch (err) {
    if (err.status === 409) return null
    throw err
  }
}

async function deleteDevice(deviceId) {
  await apiClient.delete(`/api/devices/${deviceId}`)
  invalidateCache()
}

async function getAlarms() {
  const response = await apiClient.get('/api/alarms')
  const raw = response.data
  return Array.isArray(raw) ? raw : (raw.data ?? raw.alarms ?? [])
}

export default {
  getDevices,
  getDeviceHistory,
  createDevice,
  deleteDevice,
  getAlarms,
  invalidateCache,
}
