<script setup>
import { computed } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'

const store = useDeviceStore()

// AI Insight — worst device
const aiInsight = computed(() => {
  const worst = [...store.devices].sort((a, b) => a.rxPower - b.rxPower)[0]
  if (!worst) return null
  const score = Math.min(99, Math.round((Math.abs(worst.rxPower) - 15) / 20 * 100))
  return { device: worst, score }
})

// Gauge ring SVG params
const RADIUS = 36
const CIRC   = 2 * Math.PI * RADIUS  // ≈ 226.2

const riskDash = computed(() => {
  if (!aiInsight.value) return '0 226.2'
  const pct = aiInsight.value.score / 100
  return `${CIRC * pct} ${CIRC}`
})

// Power distribution donut
const distChartOptions = computed(() => ({
  chart: { type: 'donut', background: 'transparent', animations: { enabled: true } },
  labels: ['Normal', 'Warning', 'Critical'],
  colors: ['#7aad68', '#c4a23e', '#c45252'],
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: '72%' } } },
  tooltip: {
    theme: 'dark',
    style: { fontSize: '10px', fontFamily: 'Space Mono' },
    y: { formatter: v => `${v} devices` }
  },
  stroke: { show: false },
}))

const distSeries = computed(() => {
  const a = store.analytics
  return [a.normal, a.warning, a.critical]
})

const distBars = computed(() => {
  const a = store.analytics
  const t = a.total || 1
  return [
    { label: 'Normal (-8 ~ -24)',    count: a.normal,   pct: Math.round(a.normal   / t * 100), color: '#7aad68' },
    { label: 'Warning (-24 ~ -27)',  count: a.warning,  pct: Math.round(a.warning  / t * 100), color: '#c4a23e' },
    { label: 'Critical (< -27)',     count: a.critical, pct: Math.round(a.critical / t * 100), color: '#c45252' },
  ]
})
</script>

<template>
  <div class="grid grid-cols-2 gap-3 h-full">

    <!-- AI Prediction Ring -->
    <div class="card flex flex-col">
      <div class="card-title mb-2">AI Prediction Insight</div>

      <div v-if="aiInsight" class="flex items-center gap-3 flex-1">
        <!-- SVG Ring -->
        <div class="flex-shrink-0 relative" style="width:88px;height:88px">
          <svg viewBox="0 0 88 88" width="88" height="88">
            <!-- Track -->
            <circle cx="44" cy="44" :r="RADIUS" fill="none"
                    stroke="rgba(160,158,140,0.08)" stroke-width="7"/>
            <!-- Risk arc -->
            <circle cx="44" cy="44" :r="RADIUS" fill="none"
                    stroke="#c45252" stroke-width="7"
                    :stroke-dasharray="riskDash"
                    stroke-linecap="round"
                    transform="rotate(-90 44 44)"
                    style="transition:stroke-dasharray 0.6s ease"/>
          </svg>
          <!-- Center text -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-display font-bold text-xl leading-none" style="color:#e3e1dc">
              {{ aiInsight.score }}%
            </span>
            <span class="text-[8px] font-mono" style="color:#565248">RISK</span>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="text-[10px] font-mono font-bold mb-1" style="color:#e06464">⚠ High Risk Detected</div>
          <div class="text-sm font-bold font-mono" style="color:#e3e1dc">{{ aiInsight.device.id }}</div>
          <div class="text-[11px] mt-1 leading-relaxed" style="color:#9a9688">
            Kemungkinan putus fiber dalam 14 hari ke depan
          </div>
          <button class="btn btn-xs mt-2">View Detail</button>
        </div>
      </div>
    </div>

    <!-- Optical Power Distribution -->
    <div class="card flex flex-col">
      <div class="card-title mb-2">Optical Power Distribution (dBm)</div>

      <div class="flex items-center gap-3 flex-1">
        <!-- Donut -->
        <div class="flex-shrink-0" style="width:88px;height:88px">
          <apexchart
            type="donut"
            height="88"
            :options="distChartOptions"
            :series="distSeries"
          />
        </div>

        <!-- Bars -->
        <div class="flex-1 space-y-2">
          <div v-for="b in distBars" :key="b.label">
            <div class="flex justify-between mb-0.5">
              <span class="text-[9px] font-mono" style="color:#565248">{{ b.label }}</span>
              <span class="text-[9px] font-mono font-bold" :style="{ color: b.color }">{{ b.count }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: b.pct + '%', background: b.color }"></div>
            </div>
          </div>
          <div class="text-[9px] font-mono mt-1" style="color:#565248">
            Total {{ store.analytics.total }} devices
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
