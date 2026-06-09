import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useDeviceStore, getStatus } from './useDeviceStore.js'

export const useAlarmStore = defineStore('alarm', () => {
  const alarms       = ref([])
  const acknowledged = ref(new Set())

  // ── Computed ──
  const critical   = computed(() => alarms.value.filter(a => a.type === 'Critical'))
  const warnings   = computed(() => alarms.value.filter(a => a.type === 'Warning'))
  const unackCount = computed(() =>
    alarms.value.filter(a => !acknowledged.value.has(a.id)).length
  )

  // ── Build alarms from device store ──
  function syncFromDevices() {
    const deviceStore = useDeviceStore()
    const newAlarms = deviceStore.devices
      .filter(d => d.status === 'Critical' || d.status === 'Warning')
      .map(d => ({
        id:       d.id,
        type:     d.status,
        device:   d.id,
        detail:   buildDetail(d),
        location: d.location,
        time:     d.lastSeen,
        rxPower:  d.rxPower,
      }))

    // Merge — keep existing ack state, add new alarms at top
    newAlarms.forEach(a => {
      const exists = alarms.value.find(x => x.id === a.id)
      if (!exists) {
        alarms.value.unshift(a)
      } else {
        Object.assign(exists, a)
      }
    })

    // Remove resolved alarms (back to Normal)
    const problemIds = new Set(newAlarms.map(a => a.id))
    alarms.value = alarms.value.filter(a => problemIds.has(a.id))
  }

  function buildDetail(d) {
    if (d.status === 'Critical') return `Rx Power: ${d.rxPower} dBm — Signal critical`
    if (d.temperature > 60)     return `High Temperature: ${d.temperature}°C`
    if (d.rxPower < -24)        return `Rx Power: ${d.rxPower} dBm — Degraded signal`
    return `Packet Loss detected — monitor closely`
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

  // Init
  syncFromDevices()

  return {
    alarms, critical, warnings, unackCount,
    syncFromDevices, acknowledge, acknowledgeAll, isAcknowledged, formatTime
  }
})
