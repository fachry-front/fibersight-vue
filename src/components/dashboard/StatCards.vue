<script setup>
import { computed } from 'vue'
import { useDeviceStore } from '@/store/useDeviceStore.js'

const store = useDeviceStore()
const a     = computed(() => store.analytics)

const cards = computed(() => [
  {
    label: 'Active OLT', value: a.value.activeOlt,
    unit: null, delta: '0 from yesterday', up: true, accent: 'var(--accent-teal)',
    icon: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>',
  },
  {
    label: 'Active ODP', value: a.value.activeOdp,
    unit: null, delta: '+1 from yesterday', up: true, accent: 'var(--accent-blue)',
    icon: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  },
  {
    label: 'Critical Alarm', value: a.value.critical,
    unit: null, delta: `${a.value.critical} active now`, up: false, accent: 'var(--accent-red)',
    icon: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  },
  {
    label: 'Warning Alarm', value: a.value.warning,
    unit: null, delta: `${a.value.warning} active now`, up: false, accent: 'var(--accent-gold)',
    icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  },
  {
    label: 'Avg Rx Power', value: a.value.avgRx,
    unit: 'dBm', delta: `Health: ${a.value.healthScore}%`, up: a.value.healthScore >= 80, accent: 'var(--accent-gold)',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  },
])
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
    <div v-for="(c, i) in cards" :key="i"
         class="stat-card"
         :style="{ '--accent': c.accent }"
         v-motion
         :initial="{ opacity: 0, y: 12 }"
         :enter="{ opacity: 1, y: 0, transition: { delay: i * 70, duration: 400 } }">

      <!-- Icon top-right -->
      <div class="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center"
           style="background:rgba(128,120,100,0.08)">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8"
             :style="{ color: c.accent }" v-html="c.icon"/>
      </div>

      <div class="stat-lbl">{{ c.label }}</div>
      <div class="stat-val mt-1" :style="{ color: c.accent }">
        {{ c.value }}
        <span v-if="c.unit" class="text-base font-normal ml-1"
              style="color:var(--text-muted)">{{ c.unit }}</span>
      </div>
      <div class="stat-delta" :style="{ color: c.up ? 'var(--normal-text)' : 'var(--critical-text)' }">
        {{ c.up ? '▲' : '▼' }} {{ c.delta }}
      </div>
    </div>
  </div>
</template>
