<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAlarmStore } from '@/store/useAlarmStore.js'

const router  = useRouter()
const route   = useRoute()
const alarmSt = useAlarmStore()

const navItems = [
  { path: '/overview',  label: 'Overview',       icon: '⊞', section: 'main' },
  { path: '/devices',   label: 'Devices',         icon: '◉', section: 'main' },
  { path: '/topology',  label: 'Fiber Topology',  icon: '⬡', section: 'main' },
  { path: '/analytics', label: 'Analytics',       icon: '⌇', section: 'main' },
  { path: '/alerts',    label: 'Alarm Center',    icon: '⚡', section: 'main', badge: true },
  { path: '/settings',  label: 'Settings',        icon: '⚙', section: 'config' },
]

const mainItems   = navItems.filter(n => n.section === 'main')
const configItems = navItems.filter(n => n.section === 'config')

const unackCount = computed(() => alarmSt.unackCount)

function goTo(path) { router.push(path) }
function isActive(path) { return route.path === path }
</script>

<template>
  <nav class="flex-1 px-2 py-3 overflow-y-auto flex flex-col gap-0.5">
    <div class="text-[9px] font-mono tracking-[1.5px] uppercase px-2 py-2 mt-1"
         style="color:#565248">Main</div>

    <div v-for="item in mainItems" :key="item.path"
         class="nav-item" :class="{ active: isActive(item.path) }"
         @click="goTo(item.path)">
      <span class="w-4 h-4 flex items-center justify-center text-sm flex-shrink-0 opacity-70">
        {{ item.icon }}
      </span>
      <span>{{ item.label }}</span>
      <!-- Alarm badge -->
      <span v-if="item.badge && unackCount > 0"
            class="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold"
            style="background:#c45252;color:#fff;min-width:18px;text-align:center">
        {{ unackCount }}
      </span>
    </div>

    <div class="text-[9px] font-mono tracking-[1.5px] uppercase px-2 py-2 mt-3"
         style="color:#565248">Config</div>

    <div v-for="item in configItems" :key="item.path"
         class="nav-item" :class="{ active: isActive(item.path) }"
         @click="goTo(item.path)">
      <span class="w-4 h-4 flex items-center justify-center text-sm flex-shrink-0 opacity-70">
        {{ item.icon }}
      </span>
      <span>{{ item.label }}</span>
    </div>
  </nav>
</template>
