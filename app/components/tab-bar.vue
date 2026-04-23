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
      <UIcon name="i-lucide-bar-chart-3" class="tab-icon" />
      Planner
    </button>
    <button
      class="tab-btn"
      :class="{ active: activeTab === 'history' }"
      @click="$emit('change', 'history')"
    >
      <UIcon name="i-lucide-history" class="tab-icon" />
      Riwayat
    </button>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 8px;
  background: var(--bg-page);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-pill);
  padding: 6px;
  margin-bottom: 32px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  color: var(--gray-mid);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.tab-btn.active {
  background: var(--bg-btn-primary);
  border-color: var(--border-dark);
  color: var(--white-off);
}

.tab-btn:not(.active):hover {
  color: var(--gray-light);
}
</style>
