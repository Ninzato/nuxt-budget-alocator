<script setup lang="ts">
import type { CalcMode, Category } from "~/composables/use-budget";

import { calcCategoryAmount, formatRupiah, getCategoryDetail } from "~/composables/use-budget";

const props = defineProps<{
  category: Category;
  salary: number;
  freelance: number;
  calcMode?: CalcMode;
}>();

defineEmits<{
  edit: [];
  delete: [];
}>();

const EMOJI_BG: Record<string, string> = {
  nafkah: "rgba(255,118,117,0.12)",
  listrik: "rgba(253,203,110,0.12)",
  kucing: "rgba(162,155,254,0.12)",
  sedekah: "rgba(0,184,148,0.12)",
  jajan: "rgba(116,185,255,0.12)",
  kuota: "rgba(225,112,85,0.12)",
};

const emojiBackground = computed(
  () => EMOJI_BG[props.category.id] ?? "rgba(108,92,231,0.12)",
);

const amount = computed(() =>
  calcCategoryAmount(props.category, props.salary, props.freelance, props.calcMode),
);

const detail = computed(() => getCategoryDetail(props.category, props.calcMode));

const canEdit = computed(
  () => props.category.deletable || props.category.type !== "custom",
);
const canDelete = computed(() => props.category.deletable);
</script>

<template>
  <div class="expense-item">
    <div class="emoji" :style="{ background: emojiBackground }">
      {{ category.emoji }}
    </div>
    <div class="info">
      <div class="name">
        {{ category.name }}
        <template v-if="category.type === 'fixed'">
          <span class="badge badge-fixed">Fixed</span>
        </template>
        <template v-else-if="category.type === 'percent_gaji'">
          <span class="badge badge-percent-gaji">{{ category.value }}% Gaji</span>
        </template>
        <template v-else-if="category.type === 'percent_freelance'">
          <span class="badge badge-percent-freelance">{{ category.value }}% Freelance</span>
        </template>
        <template v-else-if="category.type === 'percent_total'">
          <span class="badge badge-percent-total">{{ category.value }}% Total (Legacy)</span>
        </template>
        <template v-else-if="category.type === 'custom'">
          <span
            v-if="category.formula === 'jajan_adik'"
            class="tooltip-trigger"
          >
            <span class="badge badge-custom">Custom</span>
            <div class="tooltip-content">
              <strong>Formula Jajan Adik:</strong><br>
              Max(Rp 500.000, 5% dari gaji pokok), dengan batas maksimum Rp 800.000.<br><br>
              • Minimum: Rp 500.000<br>
              • Jika 5% gaji &gt; 500rb, maka pakai 5%<br>
              • Maksimum: Rp 800.000<br>
              • <em>Tidak termasuk pendapatan freelance</em>
            </div>
          </span>
          <span v-else class="badge badge-custom">Custom</span>
        </template>
      </div>
      <div class="detail">
        {{ detail }}
      </div>
    </div>
    <div class="amount-col">
      <div class="amount-val">
        {{ formatRupiah(amount) }}
      </div>
    </div>
    <div v-if="canEdit || canDelete" class="action-btns">
      <button
        v-if="canEdit"
        class="btn-icon"
        title="Edit"
        @click="$emit('edit')"
      >
        <svg viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </button>
      <button
        v-if="canDelete"
        class="btn-icon btn-delete"
        title="Hapus"
        @click="$emit('delete')"
      >
        <svg viewBox="0 0 24 24">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.expense-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
  transition: all 0.2s;
  position: relative;
}

.expense-item:hover {
  border-color: var(--accent);
}

.emoji {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 14px;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.badge-fixed {
  background: rgba(116, 185, 255, 0.15);
  color: var(--blue);
}

.badge-percent-gaji {
  background: rgba(253, 203, 110, 0.15);
  color: var(--orange);
}

.badge-percent-total {
  background: rgba(0, 184, 148, 0.15);
  color: var(--green-light);
}

.badge-percent-freelance {
  background: rgba(116, 185, 255, 0.15);
  color: var(--blue);
}

.badge-custom {
  background: rgba(162, 155, 254, 0.15);
  color: var(--accent-light);
  cursor: help;
}

.tooltip-trigger {
  position: relative;
  display: inline-flex;
}

.tooltip-content {
  display: none;
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
  white-space: normal;
  width: 280px;
  z-index: 100;
  box-shadow: var(--shadow);
  line-height: 1.5;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--border);
}

.tooltip-trigger:hover .tooltip-content {
  display: block;
}

.detail {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.amount-col {
  text-align: right;
  flex-shrink: 0;
  margin-left: 12px;
}

.amount-val {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

.action-btns {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(108, 92, 231, 0.15);
  color: var(--accent-light);
}

.btn-icon.btn-delete:hover {
  background: rgba(225, 112, 85, 0.15);
  color: var(--red);
}

.btn-icon svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}
</style>
