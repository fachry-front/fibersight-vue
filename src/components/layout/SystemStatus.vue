<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const services = ref([
  { label: 'Data Collection', status: 'Active'     },
  { label: 'MQTT Broker',     status: 'Connected'  },
  { label: 'API Server',      status: 'Healthy'    },
  { label: 'Database',        status: 'Healthy'    },
])
</script>

<template>
  <div class="px-3 py-3 border-t" style="border-color:rgba(160,158,140,0.1)">
    <!-- Main indicator -->
    <div class="flex items-center gap-2 px-2.5 py-2 rounded-lg mb-2"
         style="background:rgba(160,158,140,0.05)">
      <!-- Breathing dot (PDR §5) -->
      <div class="w-2 h-2 rounded-full flex-shrink-0 animate-pulse-dot"
           style="background:#7aad68;box-shadow:0 0 6px rgba(122,173,104,0.7)"></div>
      <div>
        <div class="text-xs font-semibold leading-none mb-0.5" style="color:#e3e1dc">System Status</div>
        <div class="text-[10px] font-mono" style="color:#7aad68">All systems operational</div>
      </div>
    </div>

    <!-- Service list -->
    <div class="space-y-0.5">
      <div v-for="s in services" :key="s.label"
           class="flex items-center justify-between px-2 py-1">
        <span class="text-[10px] font-mono" style="color:#565248">{{ s.label }}</span>
        <span class="text-[10px] font-mono font-bold" style="color:#7aad68">{{ s.status }}</span>
      </div>
    </div>

    <div class="text-[9px] font-mono text-center mt-2 pt-2 border-t"
         style="color:#3a3830;border-color:rgba(160,158,140,0.07)">
      © 2026 FiberSight v1.0.0
    </div>
  </div>
</template>
