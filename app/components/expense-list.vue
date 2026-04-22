<script setup lang="ts">
import type { Category } from "~/composables/use-budget";

defineProps<{
  categories: Category[];
  salary: number;
  freelance: number;
}>();

defineEmits<{
  add: [];
  edit: [idx: number];
  delete: [idx: number];
}>();
</script>

<template>
  <div class="expenses-section">
    <div class="expenses-header">
      <div class="section-title">
        <span class="dot" />
        Pengeluaran Wajib
      </div>
      <button class="btn-add" @click="$emit('add')">
        <svg viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Tambah
      </button>
    </div>

    <div v-if="categories.length === 0" class="empty-state">
      Belum ada kategori pengeluaran.
    </div>

    <ExpenseItem
      v-for="(cat, idx) in categories"
      :key="cat.id"
      :category="cat"
      :salary="salary"
      :freelance="freelance"
      @edit="$emit('edit', idx)"
      @delete="$emit('delete', idx)"
    />
  </div>
</template>

<style scoped>
.expenses-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.expenses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--accent-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--accent-glow);
}

.btn-add svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
