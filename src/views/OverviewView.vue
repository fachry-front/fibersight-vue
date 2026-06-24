<script setup>
import { onMounted, onUnmounted } from 'vue'
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

onMounted(async () => {
  // 1. Fetch data awal dari backend
  await deviceStore.fetchDevices()
  await alarmStore.syncFromDevices()

  // 2. Sambungkan WebSocket untuk live update
  deviceStore.startLiveSimulation()

  // 3. Sync alarm tiap 8 detik
  window.__alarmTimer = setInterval(() => alarmStore.syncFromDevices(), 8000)
})

onUnmounted(() => {
  deviceStore.stopLiveSimulation()
  clearInterval(window.__alarmTimer)
})
</script>

<template>
  <div class="space-y-4">

    <!-- Loading state -->
    <div v-if="deviceStore.loading"
         class="flex items-center justify-center py-20 gap-3">
      <div class="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
           style="border-color:var(--accent-gold);border-top-color:transparent"></div>
      <span class="text-sm font-mono" style="color:var(--text-muted)">
        Memuat data dari backend...
      </span>
    </div>

    <!-- Error state -->
    <div v-else-if="deviceStore.error"
         class="card flex items-center gap-3 py-6"
         style="border-color:rgba(194,80,80,0.3);background:rgba(194,80,80,0.05)">
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" style="color:var(--critical-text)">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <div>
        <div class="text-sm font-semibold" style="color:var(--critical-text)">
          Gagal konek ke backend
        </div>
        <div class="text-xs mt-1" style="color:var(--text-muted)">
          Pastikan backend berjalan di http://localhost:3000 — Error: {{ deviceStore.error }}
        </div>
      </div>
      <button class="btn btn-xs ml-auto" @click="deviceStore.fetchDevices()">↺ Retry</button>
    </div>

    <!-- Dashboard content -->
    <template v-else>
      <div class="page-hdr">
        <div>
          <div class="page-title">Overview</div>
          <div class="page-subtitle">Real-time Optical Network Dashboard</div>
        </div>
        <div class="flex items-center gap-2">
          <div class="btn-group">
            <button class="btn btn-xs active">1H</button>
            <button class="btn btn-xs">6H</button>
            <button class="btn btn-xs">24H</button>
          </div>
          <button class="btn btn-xs" @click="deviceStore.fetchDevices()">↺ Refresh</button>
        </div>
      </div>

      <StatCards/>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div class="md:col-span-2 xl:col-span-1"><PowerChart/></div>
        <TopologyTree/>
        <AlarmCenter/>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InsightsRing/>
        <FiberMap/>
      </div>

      <DeviceTable/>
    </template>

  </div>
</template>
