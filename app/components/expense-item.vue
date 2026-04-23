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
    <div class="icon-wrapper">
      <UIcon :name="category.icon || 'i-lucide-circle'" class="cat-icon" />
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
        <UIcon name="i-lucide-pencil" />
      </button>
      <button
        v-if="canDelete"
        class="btn-icon btn-delete"
        title="Hapus"
        @click="$emit('delete')"
      >
        <UIcon name="i-lucide-trash-2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.expense-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--bg-page);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius);
  margin-bottom: 8px;
  transition: border-color 0.2s;
  position: relative;
}

.expense-item:hover {
  border-color: var(--border-mid);
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
}

.cat-icon {
  width: 18px;
  height: 18px;
  color: var(--gray-mid);
}

.info {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: 400;
  color: var(--white-off);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge {
  font-size: 10px;
  font-weight: 400;
  font-family: "Source Code Pro", monospace;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  white-space: nowrap;
  border: 1px solid var(--border-dark);
  background: var(--bg-btn-primary);
}

.badge-fixed {
  color: var(--gray-light);
}

.badge-percent-gaji {
  color: var(--supabase-green);
  border-color: var(--border-mid);
}

.badge-percent-total {
  color: var(--supabase-green);
  border-color: var(--border-mid);
}

.badge-percent-freelance {
  color: var(--blue-accent);
  border-color: var(--border-mid);
}

.badge-custom {
  color: var(--gray-light);
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
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: "Onest", sans-serif;
  color: var(--gray-light);
  white-space: normal;
  width: 280px;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  line-height: 1.5;
}

.tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--border-mid);
}

.tooltip-trigger:hover .tooltip-content {
  display: block;
}

.detail {
  font-size: 12px;
  font-family: "Source Code Pro", monospace;
  color: var(--gray-mid);
  margin-top: 4px;
}

.amount-col {
  text-align: right;
  flex-shrink: 0;
  margin-left: 12px;
}

.amount-val {
  font-size: 15px;
  font-weight: 400;
  font-family: "Source Code Pro", monospace;
  color: var(--white-off);
}

.action-btns {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}

.btn-icon {
  background: transparent;
  border: 1px solid transparent;
  color: var(--gray-mid);
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: var(--bg-btn-primary);
  border-color: var(--border-dark);
  color: var(--white-off);
}

.btn-icon.btn-delete:hover {
  color: var(--crimson);
  border-color: var(--border-dark);
}

.btn-icon :deep(svg) {
  width: 16px;
  height: 16px;
}
</style>
