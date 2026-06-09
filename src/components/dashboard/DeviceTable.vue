<script setup>
import { ref, computed } from 'vue'
import { useDeviceStore, getRxClass, getBadgeClass } from '@/store/useDeviceStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

const store   = useDeviceStore()
const searchQ = ref('')

const filtered = computed(() => {
  const q = searchQ.value.toLowerCase()
  return store.devices.filter(d =>
    !q || d.id.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
  )
})

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

function handleRowClick(d) {
  // Sinkronisasi selectedDeviceId → PowerChart + FiberMap (PDR §4)
  store.selectDevice(d.id)
}
</script>

<template>
  <div class="card flex flex-col">
    <div class="card-header">
      <div>
        <div class="card-title">Device Status Overview</div>
        <div class="text-[10px] mt-0.5" style="color:#565248">
          Klik baris → sinkronisasi grafik & peta
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input v-model="searchQ" type="text" placeholder="Search device..."
               class="form-input py-1 text-[10px]" style="width:160px"/>
        <button class="btn btn-xs">⊞</button>
      </div>
    </div>

    <div class="overflow-auto">
      <table class="data-table">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Type</th>
            <th>Location</th>
            <th>Rx Power (dBm)</th>
            <th>Tx Power (dBm)</th>
            <th>Temp (°C)</th>
            <th>Status</th>
            <th>Uptime</th>
            <th>Last Seen</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in filtered"
            :key="d.id"
            class="cursor-pointer transition-colors duration-100"
            :class="{ 'ring-1 ring-inset ring-accent-gold': store.selectedDeviceId === d.id }"
            @click="handleRowClick(d)"
          >
            <td class="td-mono font-bold">{{ d.id }}</td>
            <td class="td-mono">{{ d.type }}</td>
            <td class="text-xs">{{ d.location }}</td>
            <td :class="getRxClass(d.rxPower)" class="td-mono">{{ d.rxPower }}</td>
            <td class="td-mono">{{ d.txPower }}</td>
            <td class="td-mono"
                :class="d.temperature >= 65 ? 'td-crit' : d.temperature >= 55 ? 'td-warn' : ''">
              {{ d.temperature }}
            </td>
            <td><BaseBadge :status="d.status" /></td>
            <td class="td-mono" style="color:#565248">{{ d.uptime }}</td>
            <td class="td-mono" style="color:#565248">{{ fmtTime(d.lastSeen) }}</td>
            <td>
              <div class="flex gap-1">
                <button class="btn btn-xs" title="Detail">👁</button>
                <button class="btn btn-xs" title="Chart">📊</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
