<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'
import { useThemeStore }  from '@/store/useThemeStore.js'

const store   = useDeviceStore()
const themeSt = useThemeStore()
const PALETTE = ['#c25050','#6aaa56','#c4a23e','#4a9282','#c47830']

const series = computed(() =>
  store.odps.slice(0, 5).map((d, i) => ({
    name: d.id,
    data: store.getDeviceHistory(d.id).map(p => parseFloat(p.value))
  }))
)

const categories = computed(() => {
  const first = store.odps[0]
  if (!first) return []
  return (store.getDeviceHistory(first.id) || []).map(p =>
    new Date(p.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )
})

const isDark = computed(() => themeSt.isDark)
const chartReady = ref(false)

const chartOptions = computed(() => ({
  chart: {
    type: 'area', background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 400 },
    zoom: { enabled: false },
  },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.15, opacityTo: 0.01, stops: [0, 100] }
  },
  colors: PALETTE,
  grid: {
    borderColor: isDark.value ? 'rgba(200,195,170,0.07)' : 'rgba(100,95,80,0.1)',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: categories.value,
    labels: { style: { colors: isDark.value ? '#58544a' : '#9a9080', fontSize: '9px', fontFamily: 'Space Mono' }, rotate: 0 },
    axisBorder: { show: false }, axisTicks: { show: false }, tickAmount: 6,
  },
  yaxis: {
    min: -40, max: -5,
    labels: {
      style: { colors: isDark.value ? '#58544a' : '#9a9080', fontSize: '9px', fontFamily: 'Space Mono' },
      formatter: v => `${v}`
    },
  },
  tooltip: {
    theme: isDark.value ? 'dark' : 'light',
    style: { fontSize: '10px', fontFamily: 'Space Mono' },
  },
  legend: {
    position: 'top', horizontalAlign: 'left',
    labels: { colors: isDark.value ? '#9a9480' : '#5a5648' },
    fontSize: '10px', fontFamily: 'Space Mono',
    markers: { width: 8, height: 8 }, itemMargin: { horizontal: 10 },
  },
  dataLabels: { enabled: false },
  annotations: {
    yaxis: [
      { y: -24, borderColor: '#c4a23e', borderWidth: 1, strokeDashArray: 4,
        label: { text: 'Warn', style: { background: 'transparent', color: '#c4a23e', fontSize: '9px', fontFamily: 'Space Mono' } } },
      { y: -28, borderColor: '#c25050', borderWidth: 1, strokeDashArray: 4,
        label: { text: 'Crit', style: { background: 'transparent', color: '#c25050', fontSize: '9px', fontFamily: 'Space Mono' } } },
    ]
  }
}))

onMounted(async () => {
  await nextTick()
  chartReady.value = true
})
</script>

<template>
  <div class="card h-full flex flex-col" style="min-height:260px">
    <div class="card-header">
      <div>
        <div class="card-title">Real-time Optical Power (dBm)</div>
        <div class="text-[10px] mt-0.5" style="color:var(--text-muted)">
          Live Rx Power · FIFO 30 pts
        </div>
      </div>
      <select class="form-input text-[10px] font-mono py-1" aria-label="Filter chart by ODP device"
              style="width:100px;height:30px;padding:0 8px">
        <option>All ODP</option>
        <option v-for="d in store.odps" :key="d.id">{{ d.id }}</option>
      </select>
    </div>
    <div class="flex-1" style="min-height:180px">
      <apexchart v-if="chartReady" type="area" height="100%"
                 :options="chartOptions" :series="series"/>
    </div>
  </div>
</template>
