<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  // 'status' accepts: 'Normal' | 'Warning' | 'Critical' | 'Offline'
})

const cls = computed(() => {
  switch (props.status) {
    case 'Critical': return 'badge-critical'
    case 'Warning':  return 'badge-warning'
    case 'Normal':   return 'badge-normal'
    default:         return 'badge-offline'
  }
})
</script>

<template>
  <span class="badge" :class="cls">{{ status }}</span>
</template>
