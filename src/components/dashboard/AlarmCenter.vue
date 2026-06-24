<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAlarmStore } from '@/store/useAlarmStore.js'
import BaseBadge from '@/components/common/BaseBadge.vue'

const router  = useRouter()
const alarmSt = useAlarmStore()
const topAlarms = computed(() => alarmSt.alarms.slice(0, 6))

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
}
</script>

<template>
  <div class="card h-full flex flex-col" style="min-height:200px">
    <div class="card-header">
      <div class="card-title">Alarm Center</div>
      <span class="view-all-link" @click="router.push('/alerts')">View All</span>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div v-for="alarm in topAlarms" :key="alarm.id" class="alarm-item">
        <div class="flex-shrink-0 pt-0.5">
          <BaseBadge :status="alarm.type"/>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold font-mono truncate"
               style="color:var(--text-primary)">{{ alarm.device }}</div>
          <div class="text-[11px] truncate mt-0.5"
               style="color:var(--text-secondary)">{{ alarm.detail }}</div>
          <div class="text-[10px] mt-0.5"
               style="color:var(--text-muted)">{{ alarm.location }}</div>
        </div>
        <div class="text-[10px] font-mono flex-shrink-0 ml-2"
             style="color:var(--text-muted)">{{ fmtTime(alarm.time) }}</div>
      </div>
      <div v-if="!topAlarms.length"
           class="flex flex-col items-center justify-center py-10 gap-2">
        <svg class="w-8 h-8 opacity-20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <div class="text-[11px] font-mono" style="color:var(--text-muted)">No active alarms</div>
      </div>
    </div>
  </div>
</template>
