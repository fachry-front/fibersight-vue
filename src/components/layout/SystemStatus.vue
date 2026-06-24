<script setup>
const services = [
  { label: 'Data Collection', status: 'Active'    },
  { label: 'MQTT Broker',     status: 'Connected' },
  { label: 'API Server',      status: 'Healthy'   },
  { label: 'Database',        status: 'Healthy'   },
]
</script>

<template>
  <div class="px-3 py-3 flex-shrink-0"
       style="border-top:1px solid rgba(200,195,170,0.08)">
    <!-- Main indicator -->
    <div class="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl mb-2"
         style="background:rgba(200,195,170,0.05)">
      <div class="w-2 h-2 rounded-full flex-shrink-0"
           style="background:#6aaa56;box-shadow:0 0 6px rgba(106,170,86,0.7);
                  animation:pulse-dot 2.2s ease-in-out infinite"></div>
      <div>
        <div class="text-xs font-semibold leading-none mb-0.5"
             style="color:#e8e4d8">System Status</div>
        <div class="text-[10px] font-mono" style="color:#6aaa56">All systems operational</div>
      </div>
    </div>

    <!-- Services -->
    <div class="space-y-0.5 px-1">
      <div v-for="s in services" :key="s.label"
           class="flex items-center justify-between py-1">
        <span class="text-[10px] font-mono" style="color:rgba(200,195,170,0.35)">{{ s.label }}</span>
        <span class="text-[10px] font-mono font-bold" style="color:#6aaa56">{{ s.status }}</span>
      </div>
    </div>

    <div class="text-[9px] font-mono text-center mt-3 pt-2"
         style="color:rgba(200,195,170,0.15);border-top:1px solid rgba(200,195,170,0.06)">
      © 2026 FiberSight · PT. SOLU
    </div>
  </div>
</template>
