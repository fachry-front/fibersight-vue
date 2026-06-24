<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAlarmStore } from '@/store/useAlarmStore.js'

const emit    = defineEmits(['navigate'])
const router  = useRouter()
const route   = useRoute()
const alarmSt = useAlarmStore()

const navItems = [
  { path: '/overview',  label: 'Overview',       section: 'main',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
  { path: '/devices',   label: 'Devices',         section: 'main',
    icon: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8m-4-4v4"/>' },
  { path: '/topology',  label: 'Fiber Topology',  section: 'main',
    icon: '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>' },
  { path: '/analytics', label: 'Analytics',       section: 'main',
    icon: '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>' },
  { path: '/alerts',    label: 'Alarm Center',    section: 'main', badge: true,
    icon: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>' },
  { path: '/settings',  label: 'Settings',        section: 'config',
    icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
]

const mainItems   = navItems.filter(n => n.section === 'main')
const configItems = navItems.filter(n => n.section === 'config')
const unackCount  = computed(() => alarmSt.unackCount)

function goTo(path) {
  router.push(path)
  emit('navigate')
}
function isActive(path) { return route.path === path }
</script>

<template>
  <nav class="flex-1 px-2 py-3 overflow-y-auto flex flex-col gap-0.5" aria-label="Main navigation">
    <div class="section-label" id="nav-section-main">Main</div>

    <button v-for="item in mainItems" :key="item.path"
         class="nav-item" :class="{ active: isActive(item.path) }"
         type="button"
         :aria-label="item.label"
         :aria-current="isActive(item.path) ? 'page' : undefined"
         @click="goTo(item.path)">
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.8" v-html="item.icon"
           style="opacity:0.7" aria-hidden="true"/>
      <span class="text-[13px]">{{ item.label }}</span>
      <span v-if="item.badge && unackCount > 0"
            class="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold"
            style="background:#c25050;color:#fff;min-width:18px;text-align:center"
            :aria-label="`${unackCount} unacknowledged alarms`">
        {{ unackCount }}
      </span>
    </button>

    <div class="section-label" style="margin-top:8px" id="nav-section-config">Config</div>

    <button v-for="item in configItems" :key="item.path"
         class="nav-item" :class="{ active: isActive(item.path) }"
         type="button"
         :aria-label="item.label"
         :aria-current="isActive(item.path) ? 'page' : undefined"
         @click="goTo(item.path)">
      <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="1.8" v-html="item.icon"
           style="opacity:0.7" aria-hidden="true"/>
      <span class="text-[13px]">{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
/* nav-item sebelumnya didesain untuk <div>; pastikan <button> mewarisi style yang sama
   dan tidak menambahkan default browser button styling */
.nav-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  font-family: inherit;
}
</style>
