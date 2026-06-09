<script setup>
defineProps({
  /** Add 'hoverable' class for lift animation on hover */
  hoverable: { type: Boolean, default: true },
  padding:   { type: String,  default: 'p-4' },
})
</script>

<template>
  <div class="card" :class="[padding, { 'hoverable': hoverable }]">
    <slot />
  </div>
</template>
