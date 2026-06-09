<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'
import { useAlarmStore }  from '@/store/useAlarmStore.js'

import StatCards    from '@/components/dashboard/StatCards.vue'
import PowerChart   from '@/components/dashboard/PowerChart.vue'
import TopologyTree from '@/components/dashboard/TopologyTree.vue'
import AlarmCenter  from '@/components/dashboard/AlarmCenter.vue'
import InsightsRing from '@/components/dashboard/InsightsRing.vue'
import FiberMap     from '@/components/dashboard/FiberMap.vue'
import DeviceTable  from '@/components/dashboard/DeviceTable.vue'

const deviceStore = useDeviceStore()
const alarmStore  = useAlarmStore()

// Start live simulation on mount, stop on unmount
onMounted(() => {
  deviceStore.startLiveSimulation()
  // Sync alarms every 5 sec
  const alarmTimer = setInterval(() => alarmStore.syncFromDevices(), 5000)
  alarmStore.syncFromDevices()
  // Save timer to clear
  window.__alarmTimer = alarmTimer
})

onUnmounted(() => {
  deviceStore.stopLiveSimulation()
  clearInterval(window.__alarmTimer)
})

function nowStr() {
  return new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-3">

    <!-- Page Header -->
    <div class="page-hdr">
      <div>
        <div class="page-title">Overview</div>
        <div class="page-subtitle">Real-time Optical Network Dashboard</div>
      </div>
      <div class="flex items-center gap-2">
        <div class="btn-group">
          <button class="btn btn-xs active">Last 1 Hour</button>
          <button class="btn btn-xs">6H</button>
          <button class="btn btn-xs">24H</button>
        </div>
        <button class="btn btn-xs">↺ Refresh</button>
      </div>
    </div>

    <!-- Row 1: Stat Cards (staggered animation via v-motion in StatCards) -->
    <StatCards />

    <!-- Row 2: PowerChart | Topology | AlarmCenter -->
    <div class="grid gap-3" style="grid-template-columns:1.9fr 1.3fr 1fr">
      <div style="min-height:250px"><PowerChart /></div>
      <div style="min-height:250px"><TopologyTree /></div>
      <div style="min-height:250px"><AlarmCenter /></div>
    </div>

    <!-- Row 3: InsightsRing + FiberMap -->
    <div class="grid gap-3" style="grid-template-columns:1fr 1.2fr">
      <InsightsRing />
      <div style="min-height:200px"><FiberMap /></div>
    </div>

    <!-- Row 4: Device Table -->
    <DeviceTable />

  </div>
</template>
