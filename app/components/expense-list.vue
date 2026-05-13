<script setup lang="ts">
import type { CalcMode, Category } from "~/composables/use-budget";

const props = defineProps<{
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

const hasGajiPokok = computed(() => props.categories.some(c => c.type !== 'percent_freelance'));
const hasFreelance = computed(() => props.categories.some(c => c.type === 'percent_freelance'));

function isSameGroup(idxA: number, idxB: number) {
  const catA = props.categories[idxA];
  const catB = props.categories[idxB];
  if (!catA || !catB) return false;
  const isFreelanceA = catA.type === 'percent_freelance';
  const isFreelanceB = catB.type === 'percent_freelance';
  return isFreelanceA === isFreelanceB;
}

function onDragStart(idx: number, event: DragEvent) {
  draggedIdx.value = idx;
  dragOverIdx.value = idx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(idx));
  }
}

function onDragOver(idx: number, event: DragEvent) {
  if (draggedIdx.value === null) return;
  if (!isSameGroup(draggedIdx.value, idx)) return; // Prevent cross-column dragging
  
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
  
  if (!isSameGroup(fromIdx, idx)) {
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
        <UIcon name="i-lucide-plus" class="btn-icon" />
        Tambah
      </button>
    </div>

    <div class="type-legend" aria-label="Tipe kategori pengeluaran">
      <span class="legend-item legend-fixed">Fixed</span>
      <span class="legend-item legend-percent-gaji">% Gaji Pokok</span>
      <span class="legend-item legend-percent-freelance">% Freelance</span>
    </div>

    <div class="columns-wrapper">
      <!-- Kolom Gaji Pokok -->
      <div class="column">
        <h3 class="column-title">Alokasi Gaji Pokok</h3>
        <template v-for="(cat, idx) in categories" :key="cat.id">
          <div
            v-if="cat.type !== 'percent_freelance'"
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
        </template>
        
        <div v-if="!hasGajiPokok" class="empty-state">
          Belum ada alokasi dari gaji pokok.
        </div>
      </div>

      <!-- Kolom Freelance -->
      <div class="column">
        <h3 class="column-title">Alokasi Freelance</h3>
        <template v-for="(cat, idx) in categories" :key="cat.id">
          <div
            v-if="cat.type === 'percent_freelance'"
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
        </template>
        
        <div v-if="!hasFreelance" class="empty-state">
          Belum ada alokasi dari freelance.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expenses-section {
  background: var(--bg-page);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-lg);
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
  font-size: 24px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
  letter-spacing: -0.16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--blue-accent);
  box-shadow: 0 0 0 4px rgba(116, 185, 255, 0.15);
  flex-shrink: 0;
}

.type-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: "Source Code Pro", monospace;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  border: 1px solid var(--border-dark);
  background: var(--bg-btn-primary);
}

.legend-fixed {
  color: var(--gray-light);
}

.legend-percent-gaji {
  color: var(--supabase-green);
  border-color: var(--border-mid);
}

.legend-percent-freelance {
  color: var(--blue-accent);
  border-color: var(--border-mid);
}

.columns-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .columns-wrapper {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.column {
  display: flex;
  flex-direction: column;
}

.column-title {
  font-size: 12px;
  font-weight: 400;
  color: var(--gray-mid);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-family: "Source Code Pro", monospace;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.draggable-row {
  margin-bottom: 10px;
  border-left: 2px solid transparent;
  border-radius: var(--radius);
  transition:
    border-color 0.2s,
    transform 0.15s,
    box-shadow 0.2s;
}

.draggable-row:last-of-type {
  margin-bottom: 0;
}

.draggable-row.row-fixed {
  border-left-color: var(--gray-mid);
}

.draggable-row.row-percent-gaji {
  border-left-color: var(--supabase-green);
}

.draggable-row.row-percent-freelance {
  border-left-color: var(--blue-accent);
}

.draggable-row.row-percent-total,
.draggable-row.row-custom {
  border-left-color: var(--gray-light);
}

.draggable-row.is-drag-source {
  opacity: 0.5;
  transform: scale(0.995);
}

.draggable-row.is-drop-target {
  box-shadow: 0 0 0 2px var(--supabase-green);
}

.draggable-row :deep(.expense-item) {
  margin-bottom: 0;
  cursor: grab;
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.draggable-row :deep(.expense-item:active) {
  cursor: grabbing;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-btn-primary);
  color: var(--white-off);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-pill);
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: var(--white-off);
  color: var(--bg-btn-primary);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--gray-mid);
  font-size: 14px;
  border: 1px dashed var(--border-mid);
  border-radius: var(--radius);
}
</style>
