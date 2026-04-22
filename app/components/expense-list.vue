<script setup lang="ts">
import type { CalcMode, Category } from "~/composables/use-budget";

defineProps<{
  categories: Category[];
  salary: number;
  freelance: number;
  calcMode: CalcMode;
}>();

const emit = defineEmits<{
  add: [];
  edit: [idx: number];
  delete: [idx: number];
  reorder: [fromIdx: number, toIdx: number];
}>();

const draggedIdx = ref<number | null>(null);
const dragOverIdx = ref<number | null>(null);

function onDragStart(idx: number, event: DragEvent) {
  draggedIdx.value = idx;
  dragOverIdx.value = idx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(idx));
  }
}

function onDragOver(idx: number, event: DragEvent) {
  event.preventDefault();
  if (draggedIdx.value !== idx) {
    dragOverIdx.value = idx;
  }
}

function onDrop(idx: number, event: DragEvent) {
  event.preventDefault();
  const fromIdx = draggedIdx.value;
  if (fromIdx === null || fromIdx === idx) {
    resetDragState();
    return;
  }

  emit("reorder", fromIdx, idx);
  resetDragState();
}

function onDragEnd() {
  resetDragState();
}

function resetDragState() {
  draggedIdx.value = null;
  dragOverIdx.value = null;
}
</script>

<template>
  <div class="expenses-section">
    <div class="expenses-header">
      <div class="section-title">
        <span class="dot" />
        Pengeluaran Wajib
      </div>
      <button class="btn-add" @click="emit('add')">
        <svg viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Tambah
      </button>
    </div>

    <div class="type-legend" aria-label="Tipe kategori pengeluaran">
      <span class="legend-item legend-fixed">Fixed</span>
      <span class="legend-item legend-percent-gaji">% Gaji Pokok</span>
      <span class="legend-item legend-percent-freelance">% Freelance</span>
    </div>

    <div v-if="categories.length === 0" class="empty-state">
      Belum ada kategori pengeluaran.
    </div>

    <div
      v-for="(cat, idx) in categories"
      :key="cat.id"
      class="draggable-row cursor-pointer"
      :class="[
        `row-${cat.type}`,
        { 'is-drag-source': draggedIdx === idx, 'is-drop-target': dragOverIdx === idx && draggedIdx !== idx },
      ]"
      draggable="true"
      @dragstart="onDragStart(idx, $event)"
      @dragover="onDragOver(idx, $event)"
      @drop="onDrop(idx, $event)"
      @dragend="onDragEnd"
    >
      <ExpenseItem
        :category="cat"
        :salary="salary"
        :freelance="freelance"
        :calc-mode="calcMode"
        @edit="emit('edit', idx)"
        @delete="emit('delete', idx)"
      />
    </div>
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

.type-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  border: 1px solid transparent;
}

.legend-fixed {
  background: rgba(116, 185, 255, 0.15);
  border-color: rgba(116, 185, 255, 0.35);
  color: var(--blue);
}

.legend-percent-gaji {
  background: rgba(253, 203, 110, 0.15);
  border-color: rgba(253, 203, 110, 0.35);
  color: var(--orange);
}

.legend-percent-freelance {
  background: rgba(0, 184, 148, 0.14);
  border-color: rgba(0, 184, 148, 0.35);
  color: var(--green-light);
}

.draggable-row {
  margin-bottom: 10px;
  border-left: 4px solid transparent;
  border-radius: var(--radius-sm);
  transition:
    border-color 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
}

.draggable-row:last-of-type {
  margin-bottom: 0;
}

.draggable-row.row-fixed {
  border-left-color: var(--blue);
}

.draggable-row.row-percent-gaji {
  border-left-color: var(--orange);
}

.draggable-row.row-percent-freelance {
  border-left-color: var(--green-light);
}

.draggable-row.row-percent-total,
.draggable-row.row-custom {
  border-left-color: var(--accent-light);
}

.draggable-row.is-drag-source {
  opacity: 0.7;
  transform: scale(0.995);
}

.draggable-row.is-drop-target {
  box-shadow: 0 0 0 2px var(--accent-glow);
}

.draggable-row :deep(.expense-item) {
  margin-bottom: 0;
  cursor: grab;
}

.draggable-row :deep(.expense-item:active) {
  cursor: grabbing;
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
