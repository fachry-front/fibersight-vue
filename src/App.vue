<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/store/useThemeStore.js'
import Sidebar      from '@/components/layout/Sidebar.vue'
import Header       from '@/components/layout/Header.vue'
import SystemStatus from '@/components/layout/SystemStatus.vue'

const themeStore  = useThemeStore()
const loading     = ref(true)
const sidebarOpen = ref(false)
let autoThemeInterval

onMounted(() => {
  themeStore.initTheme()
  setTimeout(() => { loading.value = false }, 2200)
  window.addEventListener('resize', onResize)

  // Fix 1: Auto dark/light — cek tiap 60 detik tanpa refresh
  autoThemeInterval = setInterval(() => {
    themeStore.autoCheckTime()
  }, 60 * 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  clearInterval(autoThemeInterval)
})

function onResize() {
  if (window.innerWidth >= 1024) sidebarOpen.value = false
}
</script>

<template>
  <!-- ══ SOLU Loading Screen ══ -->
  <Transition name="fade">
    <div v-if="loading" class="solu-loading">
      <div class="solu-glow-1"></div>
      <div class="solu-glow-2"></div>
      <div class="solu-logo-wrap">
        <div class="solu-orbit-ring">
          <div class="solu-orbit-dot solu-dot-1"></div>
          <div class="solu-orbit-dot solu-dot-2"></div>
          <div class="solu-orbit-dot solu-dot-3"></div>
          <div class="solu-orbit-dot solu-dot-4"></div>
        </div>
        <div class="solu-center-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="#c4a23e" stroke-width="2.2" stroke-linecap="round">
            <path d="M3 12h4l3-9 4 18 3-9h4"/>
          </svg>
          <div class="solu-pulse-ring"></div>
          <div class="solu-pulse-ring solu-pulse-2"></div>
        </div>
      </div>
      <div class="solu-brand">
        <div class="solu-pt-name">PT. SOLU</div>
        <div class="solu-product-name">FiberSight</div>
        <div class="solu-product-sub">Optical Monitoring System</div>
      </div>
      <div class="solu-progress-wrap">
        <div class="solu-progress-track">
          <div class="solu-progress-fill"></div>
        </div>
        <div class="solu-progress-label">INITIALIZING SYSTEM...</div>
      </div>
    </div>
  </Transition>

  <!-- ══ App Shell ══ -->
  <div v-if="!loading" class="app-shell">

    <!-- Mobile overlay -->
    <Transition name="fade">
      <div v-if="sidebarOpen"
           class="fixed inset-0 z-[90] lg:hidden"
           style="background:rgba(0,0,0,0.6);backdrop-filter:blur(3px)"
           @click="sidebarOpen = false"/>
    </Transition>

    <!-- ── Sidebar ── -->
    <aside class="flex flex-col h-screen flex-shrink-0 z-[95]
                  fixed lg:static
                  transition-transform duration-300 ease-in-out"
           :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
           style="width:200px;background:#161412;border-right:1px solid rgba(200,195,170,0.08)">

      <!-- Logo row -->
      <div class="px-4 py-4 flex items-center justify-between flex-shrink-0"
           style="border-bottom:1px solid rgba(200,195,170,0.08)">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
               style="background:#c4a23e">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="#131210" stroke-width="2.5" stroke-linecap="round">
              <path d="M3 12h4l3-9 4 18 3-9h4"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-bold font-display leading-none"
                 style="color:#e8e4d8">FiberSight</div>
            <div class="text-[9px] font-mono mt-0.5"
                 style="color:rgba(200,195,170,0.3)">by PT. SOLU</div>
          </div>
        </div>
        <!-- Close btn (mobile only) -->
        <button class="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center"
                type="button"
                aria-label="Close sidebar"
                style="background:rgba(200,195,170,0.06)"
                @click="sidebarOpen = false">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="#9a9480" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <Sidebar @navigate="sidebarOpen = false"/>
      <div class="mt-auto"><SystemStatus /></div>
    </aside>

    <!-- ── Main ── -->
    <div class="main-wrap min-w-0">
      <Header @toggle-sidebar="sidebarOpen = !sidebarOpen"/>
      <main class="page-area">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.path"/>
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
