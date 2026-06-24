<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useDeviceStore, getRxClass } from '@/store/useDeviceStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

const store      = useDeviceStore()
const timeRange  = ref('1H')
const chartReady = ref(false)

onMounted(async () => {
  await nextTick()
  chartReady.value = true
  store.startLiveSimulation()
})
onUnmounted(() => store.stopLiveSimulation())

// Multi-device trend series from FIFO histories
const PALETTE = ['#c45252','#7aad68','#c4a23e','#4a9080','#c47030']

const trendSeries = computed(() => {
  return store.odps.slice(0, 5).map((d, i) => ({
    name: d.id,
    data: store.getDeviceHistory(d.id).map(p => ({
      x: p.time,
      y: parseFloat(p.value)
    }))
  }))
})

const trendOptions = computed(() => ({
  chart: {
    type: 'line',
    height: '100%',
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 500 },
    zoom: { enabled: false },
  },
  stroke: { curve: 'smooth', width: 2 },
  colors: PALETTE,
  grid: { borderColor: 'rgba(160,158,140,0.08)', strokeDashArray: 3 },
  xaxis: {
    type: 'datetime',
    labels: {
      style: { colors: '#565248', fontSize: '9px', fontFamily: 'Space Mono' },
      rotate: 0,
      datetimeFormatter: { hour: '2-digit', minute: '2-digit' }
    },
    axisBorder: { show: false }, axisTicks: { show: false }, tickAmount: 8,
    tooltip: { enabled: false },
  },
  yaxis: {
    min: -38, max: -5,
    labels: {
      style: { colors: '#565248', fontSize: '9px', fontFamily: 'Space Mono' },
      formatter: v => `${v}`
    },
    title: { text: 'dBm', style: { color: '#565248', fontSize: '9px', fontFamily: 'Space Mono' } }
  },
  tooltip: { theme: 'dark', style: { fontSize: '10px', fontFamily: 'Space Mono' } },
  legend: {
    position: 'top', horizontalAlign: 'left',
    labels: { colors: '#9a9688' }, fontSize: '10px', fontFamily: 'Space Mono',
    markers: { width: 8, height: 8 }, itemMargin: { horizontal: 8 },
  },
  dataLabels: { enabled: false },
  annotations: {
    yaxis: [
      { y: -24, borderColor: '#c4a23e', borderWidth: 1, strokeDashArray: 4,
        label: { text: 'Warning', style: { background: 'transparent', color: '#c4a23e', fontSize: '9px', fontFamily: 'Space Mono' } } },
      { y: -28, borderColor: '#c45252', borderWidth: 1, strokeDashArray: 4,
        label: { text: 'Critical', style: { background: 'transparent', color: '#c45252', fontSize: '9px', fontFamily: 'Space Mono' } } },
    ]
  }
}))

// Worst performers
const worstDevices = computed(() =>
  [...store.devices].sort((a, b) => a.rxPower - b.rxPower).slice(0, 8)
)

// Temp bar chart
const tempOptions = computed(() => ({
  chart: { type: 'bar', background: 'transparent', toolbar: { show: false }, animations: { enabled: true } },
  plotOptions: { bar: { borderRadius: 3, horizontal: true, barHeight: '60%' } },
  colors: store.odps.slice(0,8).map(d =>
    d.temperature >= 65 ? '#c45252' : d.temperature >= 55 ? '#c4a23e' : '#4a9080'
  ),
  grid: { borderColor: 'rgba(160,158,140,0.08)', xaxis: { lines: { show: true } } },
  xaxis: {
    min: 0, max: 80,
    labels: { style: { colors: '#565248', fontSize: '9px', fontFamily: 'Space Mono' }, formatter: v => `${v}°C` },
    axisBorder: { show: false }, axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#9a9688', fontSize: '9px', fontFamily: 'Space Mono' } }
  },
  dataLabels: {
    enabled: true,
    formatter: v => `${v}°C`,
    style: { fontSize: '9px', fontFamily: 'Space Mono', colors: ['#e3e1dc'] }
  },
  tooltip: { theme: 'dark', style: { fontSize: '10px', fontFamily: 'Space Mono' } },
  legend: { show: false },
}))

const tempSeries = computed(() => [{
  name: 'Temperature',
  data: store.odps.slice(0,8).map(d => ({ x: d.id, y: d.temperature }))
}])

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-3">
    <div class="page-hdr">
      <div>
        <div class="page-title">Analytics & Trends</div>
        <div class="page-subtitle">Multi-device Rx Power deep analysis</div>
      </div>
      <div class="flex gap-1">
        <button v-for="t in ['1H','6H','24H','ALL']" :key="t"
                class="filter-tab" :class="{ active: timeRange === t }"
                @click="timeRange = t">{{ t }}</button>
      </div>
    </div>

    <!-- Trend Chart -->
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Rx Power Trend — Multi Device</div>
          <div class="text-[10px] mt-0.5" style="color:#565248">Optical receive power (dBm) — FIFO 30 points</div>
        </div>
      </div>
      <div style="height:260px">
        <apexchart v-if="chartReady" type="line" height="260"
                   :options="trendOptions"
                   :series="trendSeries" />
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">

      <!-- Worst Performers -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Worst Performing Devices</div>
          <div class="text-[10px]" style="color:#565248">Sorted by Rx Power ↑</div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Device</th><th>Location</th><th>Rx Power</th><th>Status</th><th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in worstDevices" :key="d.id">
              <td class="td-mono font-bold">{{ d.id }}</td>
              <td class="text-xs">{{ d.location }}</td>
              <td :class="getRxClass(d.rxPower)">{{ d.rxPower }} dBm</td>
              <td><BaseBadge :status="d.status"/></td>
              <td class="td-mono" style="color:#565248">{{ fmtTime(d.lastSeen) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Temperature Bar Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Temperature per Device</div>
          <div class="text-[10px]" style="color:#565248">
            <span class="text-ok">■</span> Normal
            <span class="text-warn ml-2">■</span> Warning (≥55°C)
            <span class="text-crit ml-2">■</span> Critical (≥65°C)
          </div>
        </div>
        <div style="height:220px">
          <apexchart v-if="chartReady" type="bar" height="220"
                     :options="tempOptions"
                     :series="tempSeries" />
        </div>
      </div>
    </div>
  </div>
</template>
