<script setup>
import { ref, onMounted } from 'vue'
import Sidebar      from '@/components/layout/Sidebar.vue'
import Header       from '@/components/layout/Header.vue'
import SystemStatus from '@/components/layout/SystemStatus.vue'

const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 1800)
})
</script>

<template>
  <!-- ── Loading Screen ── -->
  <Transition name="fade">
    <div v-if="loading" class="fixed inset-0 z-[500] flex flex-col items-center justify-center gap-5"
         style="background:#131210">
      <div class="font-display text-3xl font-bold" style="color:#e3e1dc">FiberSight</div>
      <div class="flex items-end gap-1.5 h-8">
        <div v-for="i in 5" :key="i"
             class="w-1.5 rounded-sm animate-loading-bar"
             :style="{
               height: [14,22,30,22,14][i-1]+'px',
               background:'#c4a23e',
               animationDelay: ((i-1)*0.14)+'s'
             }"></div>
      </div>
      <div class="text-[10px] font-mono tracking-[3px]" style="color:#565248">
        INITIALIZING OPTICAL MONITORING...
      </div>
    </div>
  </Transition>

  <!-- ── Main App Shell ── -->
  <div v-if="!loading" class="app-shell">

    <!-- Sidebar -->
    <aside class="flex flex-col h-screen flex-shrink-0"
           style="width:190px;background:#161512;border-right:1px solid rgba(160,158,140,0.1)">
      <!-- Logo -->
      <div class="px-4 py-4 border-b" style="border-color:rgba(160,158,140,0.1)">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
               style="background:#c4a23e">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#131210" stroke-width="2.5">
              <path d="M3 12h4l3-9 4 18 3-9h4"/>
            </svg>
          </div>
          <div>
            <div class="font-display text-sm font-bold" style="color:#e3e1dc">FiberSight</div>
            <div class="text-[9px] font-mono" style="color:#565248">Optical Monitoring</div>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <Sidebar />

      <!-- System Status at bottom -->
      <div class="mt-auto">
        <SystemStatus />
      </div>
    </aside>

    <!-- Main content -->
    <div class="main-wrap">
      <Header />
      <main class="page-area">
        <RouterView v-slot="{ Component, route }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
.page-enter-active, .page-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.page-enter-from  { opacity: 0; transform: translateY(5px); }
.page-leave-to    { opacity: 0; }
</style>
