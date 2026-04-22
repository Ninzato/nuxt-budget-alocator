<script setup lang="ts">
defineProps<{
  activeTab: "planner" | "history";
}>();

defineEmits<{
  change: ["planner" | "history"];
}>();
</script>

<template>
  <div class="tab-bar">
    <button
      class="tab-btn"
      :class="{ active: activeTab === 'planner' }"
      @click="$emit('change', 'planner')"
    >
      📊 Planner
    </button>
    <button
      class="tab-btn"
      :class="{ active: activeTab === 'history' }"
      @click="$emit('change', 'history')"
    >
      📋 Riwayat
    </button>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--accent);
  color: white;
}

.tab-btn:not(.active):hover {
  color: var(--text-primary);
}
</style>
