<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  // 'default' | 'primary' | 'danger' | 'ghost'
  size:    { type: String, default: 'sm' },
  // 'xs' | 'sm' | 'md'
  disabled:{ type: Boolean, default: false },
})
defineEmits(['click'])
</script>

<template>
  <button
    class="btn"
    :class="[
      variant === 'primary' ? 'btn-primary' : '',
      variant === 'danger'  ? 'btn-danger'  : '',
      size === 'xs'         ? 'btn-xs'      : '',
      size === 'md'         ? 'px-4 py-2 text-sm' : '',
      disabled              ? 'opacity-40 cursor-not-allowed' : '',
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
