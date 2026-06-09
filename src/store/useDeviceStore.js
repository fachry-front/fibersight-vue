import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Threshold constants (PDR Section 4) ──
export const THRESHOLD = {
  NORMAL_MIN:   -24,   // >= -24 dBm  → Normal
  WARNING_MIN:  -27,   // -25 ~ -27   → Warning
  CRITICAL_MAX: -28,   // <= -28 dBm  → Critical
  TEMP_WARN:     55,
  TEMP_CRIT:     65,
  HISTORY_LIMIT: 30    // FIFO buffer max points (PDR Section 6)
}

export function getStatus(rxPower) {
  if (rxPower <= THRESHOLD.CRITICAL_MAX) return 'Critical'
  if (rxPower <  THRESHOLD.NORMAL_MIN)  return 'Warning'
  return 'Normal'
}

export function getRxClass(rxPower) {
  if (rxPower <= THRESHOLD.CRITICAL_MAX) return 'td-crit'
  if (rxPower <  THRESHOLD.NORMAL_MIN)  return 'td-warn'
  return 'td-ok'
}

export function getBadgeClass(status) {
  if (status === 'Critical') return 'badge-critical'
  if (status === 'Warning')  return 'badge-warning'
  if (status === 'Normal')   return 'badge-normal'
  return 'badge-offline'
}

export function getStatusDotClass(status) {
  if (status === 'Critical') return 'topo-dot critical'
  if (status === 'Warning')  return 'topo-dot warning'
  return 'topo-dot normal'
}

// ── Mock initial devices ──
function makeTime(minutesAgo = 0) {
  return new Date(Date.now() - minutesAgo * 60000).toISOString()
}

function makeHistory(baseRx, points = 20) {
  return Array.from({ length: points }, (_, i) => ({
    time: makeTime((points - i) * 3),
    value: parseFloat((baseRx + (Math.random() - 0.5) * 1.8).toFixed(2))
  }))
}

const INITIAL_DEVICES = [
  { id:'OLT-01', type:'OLT', location:'Bogor',          area:'Bogor',        rxPower:-3.12,  txPower:2.45, temperature:45, uptime:'15d 08:21', status:'Normal',   lastSeen:makeTime(2),  onu:128, lat:-6.5971, lng:106.8060 },
  { id:'ODP-12', type:'ODP', location:'Bogor Area',     area:'Bogor',        rxPower:-29.48, txPower:2.10, temperature:48, uptime:'3d 14:22',  status:'Critical', lastSeen:makeTime(1),  onu:32,  lat:-6.6100, lng:106.8200 },
  { id:'ODP-08', type:'ODP', location:'Depok Area',     area:'Depok',        rxPower:-25.67, txPower:2.35, temperature:46, uptime:'7d 06:11',  status:'Warning',  lastSeen:makeTime(3),  onu:24,  lat:-6.4100, lng:106.8200 },
  { id:'ODP-31', type:'ODP', location:'Jakarta Utara',  area:'Jakarta',      rxPower:-20.15, txPower:1.95, temperature:43, uptime:'12d 19:33', status:'Normal',   lastSeen:makeTime(2),  onu:16,  lat:-6.1200, lng:106.9000 },
  { id:'ODP-05', type:'ODP', location:'Bekasi Area',    area:'Bekasi',       rxPower:-18.45, txPower:2.25, temperature:44, uptime:'8d 22:10',  status:'Normal',   lastSeen:makeTime(6),  onu:29,  lat:-6.2500, lng:107.0000 },
  { id:'ODP-07', type:'ODP', location:'Depok Area',     area:'Depok',        rxPower:-30.12, txPower:2.05, temperature:52, uptime:'1d 08:44',  status:'Critical', lastSeen:makeTime(2),  onu:18,  lat:-6.4300, lng:106.8100 },
  { id:'ODP-21', type:'ODP', location:'Tangerang',      area:'Tangerang',    rxPower:-22.34, txPower:2.50, temperature:67, uptime:'5d 12:00',  status:'Warning',  lastSeen:makeTime(5),  onu:24,  lat:-6.2200, lng:106.6300 },
  { id:'ODP-42', type:'ODP', location:'Bekasi Selatan', area:'Bekasi',       rxPower:-16.20, txPower:2.80, temperature:39, uptime:'0d 04:12',  status:'Normal',   lastSeen:makeTime(0),  onu:12,  lat:-6.3000, lng:107.0200 },
  { id:'ODP-03', type:'ODP', location:'Jakarta Pusat',  area:'Jakarta',      rxPower:-28.90, txPower:1.80, temperature:49, uptime:'2d 17:05',  status:'Critical', lastSeen:makeTime(1),  onu:8,   lat:-6.1800, lng:106.8300 },
  { id:'ODP-17', type:'ODP', location:'Depok Tengah',   area:'Depok',        rxPower:-19.55, txPower:2.20, temperature:41, uptime:'10d 03:14', status:'Normal',   lastSeen:makeTime(8),  onu:20,  lat:-6.3900, lng:106.8350 },
]

const STORAGE_KEY = 'fibersight_devices_v2'

export const useDeviceStore = defineStore('device', () => {
  // ── State ──
  const devices = ref(loadDevices())
  const selectedDeviceId = ref(null)      // Sinkronisasi antar-widget (PDR §4)
  const liveTimer = ref(null)

  // Riwayat Rx tiap device — FIFO max 30 titik (PDR §6)
  const rxHistories = ref(
    Object.fromEntries(
      INITIAL_DEVICES.map(d => [d.id, makeHistory(d.rxPower)])
    )
  )

  // ── Computed ──
  const selectedDevice = computed(() =>
    devices.value.find(d => d.id === selectedDeviceId.value) ?? null
  )

  const analytics = computed(() => {
    const d = devices.value
    const critical = d.filter(x => x.status === 'Critical').length
    const warning  = d.filter(x => x.status === 'Warning').length
    const normal   = d.filter(x => x.status === 'Normal').length
    const avgRx    = d.reduce((s, x) => s + x.rxPower, 0) / d.length
    const health   = Math.max(0, Math.round(100 - critical * 7 - warning * 2.5))
    return {
      critical, warning, normal,
      total: d.length,
      avgRx: parseFloat(avgRx.toFixed(2)),
      activeOlt: d.filter(x => x.type === 'OLT').length,
      activeOdp: d.filter(x => x.type === 'ODP').length,
      healthScore: health
    }
  })

  const odps = computed(() => devices.value.filter(d => d.type === 'ODP'))
  const olts = computed(() => devices.value.filter(d => d.type === 'OLT'))

  // ── Actions ──
  function selectDevice(id) {
    selectedDeviceId.value = id === selectedDeviceId.value ? null : id
  }

  function addDevice(deviceData) {
    if (devices.value.find(d => d.id === deviceData.id)) return false
    const newDev = {
      ...deviceData,
      status: getStatus(deviceData.rxPower),
      lastSeen: new Date().toISOString(),
      uptime: '0d 00:00',
      onu: 0,
      lat: -6.2 + (Math.random() - 0.5) * 0.5,
      lng: 106.8 + (Math.random() - 0.5) * 0.5,
    }
    devices.value.push(newDev)
    rxHistories.value[newDev.id] = makeHistory(newDev.rxPower)
    persistDevices()
    return true
  }

  function deleteDevice(id) {
    devices.value = devices.value.filter(d => d.id !== id)
    if (selectedDeviceId.value === id) selectedDeviceId.value = null
    persistDevices()
  }

  // Simulate live IoT telemetry — runs every 4 sec
  function startLiveSimulation() {
    if (liveTimer.value) return
    liveTimer.value = setInterval(() => {
      const odpDevices = devices.value.filter(d => d.type === 'ODP')
      if (!odpDevices.length) return

      // Update 1-2 random devices per tick
      const count = Math.random() > 0.5 ? 2 : 1
      for (let i = 0; i < count; i++) {
        const target = odpDevices[Math.floor(Math.random() * odpDevices.length)]
        const idx = devices.value.findIndex(d => d.id === target.id)
        const drift = (Math.random() - 0.46) * 0.9
        const newRx = parseFloat((target.rxPower + drift).toFixed(2))

        devices.value[idx] = {
          ...target,
          rxPower: newRx,
          status:  getStatus(newRx),
          lastSeen: new Date().toISOString()
        }

        // FIFO push — drop oldest if > HISTORY_LIMIT
        if (!rxHistories.value[target.id]) rxHistories.value[target.id] = []
        rxHistories.value[target.id].push({
          time:  new Date().toISOString(),
          value: newRx
        })
        if (rxHistories.value[target.id].length > THRESHOLD.HISTORY_LIMIT) {
          rxHistories.value[target.id].shift()
        }
      }
    }, 4000)
  }

  function stopLiveSimulation() {
    clearInterval(liveTimer.value)
    liveTimer.value = null
  }

  function getDeviceHistory(id) {
    return rxHistories.value[id] ?? []
  }

  // ── Persistence helpers ──
  function persistDevices() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(devices.value)) } catch {}
  }

  function loadDevices() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved && Array.isArray(saved) && saved.length) return saved
    } catch {}
    return [...INITIAL_DEVICES]
  }

  return {
    devices, selectedDeviceId, selectedDevice,
    analytics, odps, olts, rxHistories,
    selectDevice, addDevice, deleteDevice,
    startLiveSimulation, stopLiveSimulation,
    getDeviceHistory
  }
})
