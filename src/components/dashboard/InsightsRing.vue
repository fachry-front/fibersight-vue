<script setup>
import { computed, ref, onMounted, nextTick } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'
import { useThemeStore }  from '@/store/useThemeStore.js'

const store      = useDeviceStore()
const themeSt    = useThemeStore()
const chartReady = ref(false)

onMounted(async () => {
  await nextTick()
  chartReady.value = true
})

const aiInsight = computed(() => {
  const worst = [...store.devices].sort((a, b) => a.rxPower - b.rxPower)[0]
  if (!worst) return null
  const score = Math.min(99, Math.round((Math.abs(worst.rxPower) - 15) / 20 * 100))
  return { device: worst, score }
})

const CIRC = 2 * Math.PI * 36
const riskDash = computed(() => {
  if (!aiInsight.value) return '0 226.2'
  return `${CIRC * aiInsight.value.score / 100} ${CIRC}`
})

const donutOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent' },
  labels: ['Normal', 'Warning', 'Critical'],
  colors: ['#6aaa56','#c4a23e','#c25050'],
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '74%' } } },
  stroke: { show: false },
  tooltip: { theme: themeSt.isDark ? 'dark' : 'light', style: { fontSize: '10px', fontFamily: 'Space Mono' }, y: { formatter: v => `${v} devices` } },
}))

const donutSeries = computed(() => {
  const a = store.analytics
  return [a.normal || 0, a.warning || 0, a.critical || 0]
})

const bars = computed(() => {
  const a = store.analytics; const t = a.total || 1
  return [
    { label: 'Normal',   count: a.normal,   pct: Math.round(a.normal  /t*100), color: '#6aaa56' },
    { label: 'Warning',  count: a.warning,  pct: Math.round(a.warning /t*100), color: '#c4a23e' },
    { label: 'Critical', count: a.critical, pct: Math.round(a.critical/t*100), color: '#c25050' },
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

    <!-- AI Ring -->
    <div class="card flex flex-col">
      <div class="card-title mb-3">AI Prediction Insight</div>
      <div v-if="aiInsight" class="flex items-center gap-4 flex-1">
        <div class="flex-shrink-0 relative" style="width:90px;height:90px">
          <svg viewBox="0 0 88 88" width="90" height="90">
            <circle cx="44" cy="44" r="36" fill="none"
                    stroke="var(--border)" stroke-width="7"/>
            <circle cx="44" cy="44" r="36" fill="none"
                    stroke="#c25050" stroke-width="7"
                    :stroke-dasharray="riskDash"
                    stroke-linecap="round" transform="rotate(-90 44 44)"
                    style="transition:stroke-dasharray 0.6s ease"/>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-display font-bold text-xl leading-none"
                  style="color:var(--text-primary)">{{ aiInsight.score }}%</span>
            <span class="text-[8px] font-mono mt-0.5" style="color:var(--text-muted)">RISK</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[10px] font-mono font-bold mb-1.5"
               style="color:var(--critical-text)">⚠ High Risk Detected</div>
          <div class="text-sm font-bold font-mono" style="color:var(--text-primary)">
            {{ aiInsight.device.id }}
          </div>
          <div class="text-[11px] mt-1 leading-relaxed" style="color:var(--text-secondary)">
            Kemungkinan putus fiber dalam 14 hari ke depan
          </div>
          <button class="btn btn-xs mt-2.5">View Detail</button>
        </div>
      </div>
    </div>

    <!-- Donut Distribution -->
    <div class="card flex flex-col">
      <div class="card-title mb-3">Optical Power Distribution</div>
      <div class="flex items-center gap-4 flex-1">
        <div class="flex-shrink-0" style="width:90px;height:90px">
          <apexchart v-if="chartReady" type="donut" height="90"
                     :options="donutOptions" :series="donutSeries"/>
        </div>
        <div class="flex-1 space-y-2.5 min-w-0">
          <div v-for="b in bars" :key="b.label">
            <div class="flex justify-between mb-1">
              <span class="text-[10px] font-mono" style="color:var(--text-muted)">{{ b.label }}</span>
              <span class="text-[10px] font-mono font-bold" :style="{color:b.color}">{{ b.count }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{width:b.pct+'%',background:b.color}"></div>
            </div>
          </div>
          <div class="text-[9px] font-mono" style="color:var(--text-muted)">
            Total {{ store.analytics.total }} devices
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
