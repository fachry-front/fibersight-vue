<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAlarmStore }  from '@/store/useAlarmStore.js'
import { useThemeStore }  from '@/store/useThemeStore.js'
import { useSearchStore } from '@/store/useSearchStore.js'

const emit      = defineEmits(['toggle-sidebar'])
const router    = useRouter()
const alarmSt   = useAlarmStore()
const themeSt   = useThemeStore()
const searchSt  = useSearchStore()

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

const unackCount  = computed(() => alarmSt.unackCount)
const hasCritical = computed(() => alarmSt.critical.length > 0)

function onSearchKeydown(e) {
  if (e.key === 'Enter') searchSt.submitSearch()
}
</script>

<template>
  <header class="flex items-center gap-2 px-3 md:px-5 flex-shrink-0"
          style="height:56px;border-bottom:1px solid var(--border);background:var(--bg-surface)">

    <!-- Hamburger -->
    <button class="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center
                   flex-shrink-0 btn"
            type="button"
            aria-label="Toggle navigation menu"
            @click="emit('toggle-sidebar')">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.2">
        <line x1="3" y1="6"  x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <!-- Search -->
    <div class="relative hidden sm:block" style="width:260px">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-3.5 h-3.5"
           style="color:var(--text-muted)" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        :value="searchSt.query"
        @input="searchSt.setQuery($event.target.value)"
        @keydown="onSearchKeydown"
        type="text"
        placeholder="Search device, OLT, ODP... (Enter)"
        aria-label="Search device, OLT, ODP"
        class="form-input pl-9 py-1.5 text-xs"
        style="height:34px"/>
      <button v-if="searchSt.query"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full"
              style="background:var(--border-hover);color:var(--text-muted)"
              aria-label="Clear search"
              @click="searchSt.clear()">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="flex-1"></div>

    <!-- Timestamp -->
    <div class="hidden lg:flex items-center gap-1.5 text-[10px] font-mono flex-shrink-0"
         style="color:var(--text-muted)">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {{ timeStr }}
    </div>

    <!-- Scheduled Theme Status -->
    <div class="btn btn-xs flex items-center gap-1.5 flex-shrink-0"
         role="status"
         :aria-label="themeSt.isDark ? 'Scheduled Dark Mode is active' : 'Scheduled Light Mode is active'"
         :title="themeSt.isDark ? 'Scheduled Dark Mode active: 17:00-05:00' : 'Scheduled Light Mode active: 05:01-16:59'"
         style="cursor:default;opacity:0.85">
      <svg v-if="themeSt.isDark" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <!-- Moon icon (shown in light mode) -->
      <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <span class="hidden sm:inline">{{ themeSt.isDark ? 'Dark' : 'Light' }}</span>
    </div>

    <!-- Alarm bell -->
    <button class="relative w-8 h-8 rounded-lg flex items-center justify-center
                   flex-shrink-0 btn"
            type="button"
            :aria-label="`Alarm center, ${unackCount} unacknowledged`"
            :style="hasCritical ? 'animation:glow-pulse 1.6s infinite;border-color:rgba(194,80,80,0.4)' : ''"
            @click="router.push('/alerts')">
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           :style="{ color: hasCritical ? 'var(--critical-text)' : 'var(--text-secondary)' }">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      <span v-if="unackCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center
                   justify-center text-[8px] font-mono font-bold"
            style="background:var(--accent-red);color:#fff;border:1.5px solid var(--bg-surface)">
        {{ unackCount > 9 ? '9+' : unackCount }}
      </span>
    </button>

    <!-- Profile -->
    <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer
                flex-shrink-0 transition-all duration-150"
         style="background:var(--bg-card);border:1px solid var(--border)">
      <div class="w-6 h-6 rounded-full flex items-center justify-center
                  text-[10px] font-bold flex-shrink-0"
           style="background:var(--accent-gold);color:var(--text-inverse)">A</div>
      <div class="hidden md:block">
        <div class="text-xs font-semibold leading-none mb-0.5"
             style="color:var(--text-primary)">Admin</div>
        <div class="text-[9px] font-mono leading-none"
             style="color:var(--text-muted)">NOC Engineer</div>
      </div>
    </div>
  </header>
</template>
