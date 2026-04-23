<script setup lang="ts">
defineProps<{
  monthLabel: string;
}>();

defineEmits<{
  prev: [];
  next: [];
}>();
</script>

<template>
  <div class="month-nav">
    <button @click="$emit('prev')">
      <UIcon name="i-lucide-chevron-left" class="nav-icon" />
    </button>
    <span class="month-label">{{ monthLabel }}</span>
    <button @click="$emit('next')">
      <UIcon name="i-lucide-chevron-right" class="nav-icon" />
    </button>
  </div>
</template>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.month-nav button {
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  color: var(--gray-mid);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.month-nav button:hover {
  background: var(--bg-page);
  color: var(--white-off);
  border-color: var(--border-mid);
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.month-label {
  font-size: 18px;
  font-weight: 400;
  min-width: 180px;
  text-align: center;
  letter-spacing: -0.01em;
}
</style>
