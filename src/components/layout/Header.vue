<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlarmStore } from '@/store/useAlarmStore.js'

const router  = useRouter()
const alarmSt = useAlarmStore()
const search  = ref('')
const timeStr = ref('')
let clockTimer

function updateTime() {
  timeStr.value = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

onMounted(() => { updateTime(); clockTimer = setInterval(updateTime, 1000) })
onUnmounted(() => clearInterval(clockTimer))

const unackCount = computed(() => alarmSt.unackCount)
const hasCritical = computed(() => alarmSt.critical.length > 0)
</script>

<template>
  <header class="flex items-center gap-3 px-5 flex-shrink-0"
          style="height:56px;background:#161512;border-bottom:1px solid rgba(160,158,140,0.1)">

    <!-- Search -->
    <div class="relative flex-1 max-w-xs">
      <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3"
           style="color:#565248" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input v-model="search" type="text"
             class="form-input pl-8 py-1.5 text-xs"
             placeholder="Search device, OLT, ODP..."/>
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Timestamp -->
    <div class="hidden md:flex items-center gap-1.5 text-[10px] font-mono" style="color:#565248">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {{ timeStr }}
    </div>

    <!-- Alarm bell -->
    <button class="relative w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                   transition-all duration-150"
            style="background:#1c1a16;border:1px solid rgba(160,158,140,0.12)"
            :class="{ 'animate-glow-pulse border-red-700': hasCritical }"
            @click="router.push('/alerts')">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           :style="{ color: hasCritical ? '#e06464' : '#9a9688' }">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      <span v-if="unackCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center
                   text-[8px] font-mono font-bold"
            style="background:#c45252;color:#fff;border:1.5px solid #161512">
        {{ unackCount > 9 ? '9+' : unackCount }}
      </span>
    </button>

    <!-- Expand -->
    <button class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer
                   transition-all duration-150"
            style="background:#1c1a16;border:1px solid rgba(160,158,140,0.12)">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           style="color:#9a9688">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>
      </svg>
    </button>

    <!-- Admin Profile -->
    <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg cursor-pointer"
         style="background:#1c1a16;border:1px solid rgba(160,158,140,0.12)">
      <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
           style="background:#c4a23e;color:#131210">A</div>
      <div class="hidden sm:block">
        <div class="text-xs font-semibold leading-none mb-0.5" style="color:#e3e1dc">Admin</div>
        <div class="text-[9px] font-mono leading-none" style="color:#565248">NOC Engineer</div>
      </div>
    </div>
  </header>
</template>
