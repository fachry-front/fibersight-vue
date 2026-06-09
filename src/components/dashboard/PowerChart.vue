<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'

const store    = useDeviceStore()
const selected = ref('All')

// Devices to display
const displayDevices = computed(() => {
  const odps = store.odps.slice(0, 5)   // show max 5 lines
  return odps
})

const PALETTE = ['#c45252', '#7aad68', '#c4a23e', '#4a9080', '#c47030']

// Build ApexCharts series from FIFO history
const series = computed(() => {
  return displayDevices.value.map((d, i) => {
    const hist = store.getDeviceHistory(d.id)
    return {
      name: d.id,
      data: hist.map(p => parseFloat(p.value))
    }
  })
})

const categories = computed(() => {
  const first = displayDevices.value[0]
  if (!first) return []
  return (store.getDeviceHistory(first.id) || []).map(p =>
    new Date(p.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  )
})

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: '100%',
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 400 },
    zoom: { enabled: false },
  },
  stroke: {
    curve: 'smooth',
    width: 1.8,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.12,
      opacityTo: 0.01,
      stops: [0, 100]
    }
  },
  colors: PALETTE,
  grid: {
    borderColor: 'rgba(160,158,140,0.08)',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: categories.value,
    labels: {
      style: { colors: '#565248', fontSize: '9px', fontFamily: 'Space Mono' },
      rotate: 0,
      maxHeight: 30,
    },
    axisBorder: { show: false },
    axisTicks:  { show: false },
    tickAmount: 6,
  },
  yaxis: {
    min: -38, max: -5,
    labels: {
      style: { colors: '#565248', fontSize: '9px', fontFamily: 'Space Mono' },
      formatter: v => `${v} dBm`
    },
  },
  tooltip: {
    theme: 'dark',
    style: { fontSize: '10px', fontFamily: 'Space Mono' },
    x: { show: true },
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    labels: { colors: '#9a9688' },
    fontSize: '10px',
    fontFamily: 'Space Mono',
    markers: { width: 8, height: 8 },
    itemMargin: { horizontal: 8 },
  },
  dataLabels: { enabled: false },
  // Threshold annotations
  annotations: {
    yaxis: [
      { y: -24, borderColor: '#c4a23e', borderWidth: 1, strokeDashArray: 4,
        label: { text: 'Warning', style: { background: 'transparent', color: '#c4a23e', fontSize: '9px', fontFamily: 'Space Mono' } } },
      { y: -28, borderColor: '#c45252', borderWidth: 1, strokeDashArray: 4,
        label: { text: 'Critical', style: { background: 'transparent', color: '#c45252', fontSize: '9px', fontFamily: 'Space Mono' } } },
    ]
  }
}))
</script>

<template>
  <div class="card h-full flex flex-col" style="min-height:240px">
    <div class="card-header">
      <div>
        <div class="card-title">Real-time Optical Power (dBm)</div>
        <div class="text-[10px] mt-0.5" style="color:#565248">Rx Power live — FIFO 30 titik terakhir</div>
      </div>
      <select v-model="selected"
              class="form-input py-1 text-[10px] font-mono"
              style="width:110px;padding:4px 8px">
        <option>All</option>
        <option v-for="d in store.odps" :key="d.id">{{ d.id }}</option>
      </select>
    </div>

    <div class="flex-1" style="min-height:170px">
      <apexchart
        type="area"
        height="100%"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>
