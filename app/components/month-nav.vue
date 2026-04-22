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
      <svg viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>
    <span class="month-label">{{ monthLabel }}</span>
    <button @click="$emit('next')">
      <svg viewBox="0 0 24 24">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.month-nav button {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.month-nav button:hover {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.month-nav button svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.month-label {
  font-size: 16px;
  font-weight: 700;
  min-width: 160px;
  text-align: center;
}
</style>
