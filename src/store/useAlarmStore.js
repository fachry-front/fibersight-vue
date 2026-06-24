import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import deviceApi from '@/services/deviceApi'

function loadThresholds() {
  try {
    const saved = localStorage.getItem('fibersight_settings_thresholds')
    if (!saved) return {
      rxCritical: -28, rxWarning: -24,
      tempCritical: 65, tempWarning: 55,
    }
    return { ...{
      rxCritical: -28, rxWarning: -24,
      tempCritical: 65, tempWarning: 55,
    }, ...JSON.parse(saved) }
  } catch {
    return {
      rxCritical: -28, rxWarning: -24,
      tempCritical: 65, tempWarning: 55,
    }
  }
}

export const useAlarmStore = defineStore('alarm', () => {
  const alarms       = ref([])
  const acknowledged = ref(new Set())

  const critical   = computed(() => alarms.value.filter(a => a.type === 'Critical'))
  const warnings   = computed(() => alarms.value.filter(a => a.type === 'Warning'))
  const unackCount = computed(() =>
    alarms.value.filter(a => !acknowledged.value.has(a.id)).length
  )

  async function syncFromDevices() {
    try {
      const devices = await deviceApi.getDevices(true)
      const thresholds = loadThresholds()

      alarms.value = devices.flatMap(device => {
        const rx = parseFloat(device.rxPower)
        const temp = parseFloat(device.temperature)
        const type = rx <= thresholds.rxCritical || temp >= thresholds.tempCritical
          ? 'Critical'
          : (rx < thresholds.rxWarning || temp >= thresholds.tempWarning)
            ? 'Warning'
            : null

        if (!type) return []

        const detail = type === 'Critical'
          ? rx <= thresholds.rxCritical
            ? `Rx Power: ${rx} dBm — Signal critical`
            : `Temperature: ${temp}°C — Critical heat`
          : rx < thresholds.rxWarning
            ? `Rx Power: ${rx} dBm — Signal degraded`
            : `Temperature: ${temp}°C — High heat`

        return [{
          id: `${device.id}-${type}`,
          device: device.id,
          type,
          detail,
          location: device.location,
          time: device.lastSeen || new Date().toISOString(),
        }]
      })
    } catch (err) {
      console.error('syncFromDevices error:', err.message)
    }
  }

  function acknowledge(id) {
    const s = new Set(acknowledged.value)
    s.add(id)
    acknowledged.value = s
  }

  function acknowledgeAll() {
    const s = new Set(acknowledged.value)
    alarms.value.forEach(a => s.add(a.id))
    acknowledged.value = s
  }

  function isAcknowledged(id) {
    return acknowledged.value.has(id)
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  return {
    alarms, critical, warnings, unackCount,
    syncFromDevices, acknowledge, acknowledgeAll, isAcknowledged, formatTime,
  }
})
