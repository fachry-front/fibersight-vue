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
  <div class="card h-full flex flex-col">
    <div class="card-header">
      <div class="card-title">Alarm Center</div>
      <span class="view-all-link" @click="router.push('/alerts')">View All</span>
    </div>

    <div class="flex-1 overflow-y-auto space-y-0">
      <div v-for="alarm in topAlarms" :key="alarm.id" class="alarm-item">
        <!-- Badge -->
        <div class="flex-shrink-0 pt-0.5">
          <BaseBadge :status="alarm.type" />
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold font-mono truncate" style="color:#e3e1dc">{{ alarm.device }}</div>
          <div class="text-[11px] truncate" style="color:#9a9688">{{ alarm.detail }}</div>
          <div class="text-[10px]" style="color:#565248">{{ alarm.location }}</div>
        </div>
        <!-- Time -->
        <div class="text-[10px] font-mono flex-shrink-0" style="color:#565248">
          {{ fmtTime(alarm.time) }}
        </div>
      </div>

      <div v-if="!topAlarms.length"
           class="flex flex-col items-center justify-center py-8 gap-2">
        <div class="text-2xl">✓</div>
        <div class="text-[10px] font-mono" style="color:#565248">No active alarms</div>
      </div>
    </div>
  </div>
</template>
