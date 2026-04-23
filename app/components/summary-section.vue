<script setup lang="ts">
import type { Category } from "~/composables/use-budget";

import { formatRupiah } from "~/composables/use-budget";

type FreelanceAllocationItem = {
  cat: Category;
  amount: number;
};

type SavingsAllocation = {
  emergency: number;
  investment: number;
  fun: number;
  buffer: number;
};

defineProps<{
  totalExpense: number;
  savings: number;
  expensePct: number;
  savingsPct: number;
  progressFillClass: string;
  freelanceAllocation: FreelanceAllocationItem[];
  savingsAllocation: SavingsAllocation | null;
}>();
</script>

<template>
  <div class="summary-section">
    <div class="section-title">
      <span class="dot dot-green" />
      Ringkasan
    </div>
    <div class="summary-grid">
      <div class="summary-card expense-card">
        <div class="s-label">
          Total Pengeluaran
        </div>
        <div class="s-value">
          {{ formatRupiah(totalExpense) }}
        </div>
        <div class="s-sub">
          {{ expensePct }}% dari pemasukan
        </div>
      </div>
      <div class="summary-card savings-card">
        <div class="s-label">
          Bisa Ditabung
        </div>
        <div class="s-value">
          {{ formatRupiah(savings) }}
        </div>
        <div class="s-sub">
          {{ savingsPct }}% dari pemasukan
        </div>
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-label">
        <span class="progress-title">PENGELUARAN</span>
        <span class="progress-pct">{{ expensePct }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="progressFillClass"
          :style="{ width: `${Math.min(expensePct, 100)}%` }"
        />
      </div>
    </div>

    <!-- Savings allocation -->
    <div v-if="savingsAllocation" class="allocation-block savings-alloc">
      <div class="alloc-title">
        <UIcon name="i-lucide-wallet" class="alloc-icon" />
        Alokasi Tabungan (TO BE IMPLEMENTED)
      </div>
      <!-- <div class="alloc-row">
        <span class="alloc-label">
          <UIcon name="i-lucide-shield-check" class="cat-icon" />
          Dana Darurat (40%)
        </span>
        <span class="alloc-val">{{ formatRupiah(savingsAllocation.emergency) }}</span>
      </div>
      <div class="alloc-row">
        <span class="alloc-label">
          <UIcon name="i-lucide-line-chart" class="cat-icon" />
          Investasi (30%)
        </span>
        <span class="alloc-val">{{ formatRupiah(savingsAllocation.investment) }}</span>
      </div>
      <div class="alloc-row">
        <span class="alloc-label">
          <UIcon name="i-lucide-party-popper" class="cat-icon" />
          Hiburan (15%)
        </span>
        <span class="alloc-val">{{ formatRupiah(savingsAllocation.fun) }}</span>
      </div>
      <div class="alloc-row">
        <span class="alloc-label">
          <UIcon name="i-lucide-refresh-cw" class="cat-icon" />
          Buffer/Fleksibel (15%)
        </span>
        <span class="alloc-val">{{ formatRupiah(savingsAllocation.buffer) }}</span>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.summary-section {
  background: var(--bg-page);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green {
  background: var(--supabase-green);
  box-shadow: 0 0 0 4px var(--green-border);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border-dark);
  background: var(--bg-btn-primary);
}

.expense-card {
  border-color: var(--border-mid);
}

.savings-card {
  border-color: var(--border-mid);
}

.s-label {
  font-size: 14px;
  color: var(--gray-mid);
  font-weight: 400;
  margin-bottom: 6px;
}

.s-value {
  font-size: 24px;
  font-weight: 400;
  color: var(--white-off);
  line-height: 1.2;
}

.s-sub {
  font-size: 12px;
  color: var(--gray-dark);
  margin-top: 6px;
  font-family: "Source Code Pro", monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expense-card .s-value {
  color: var(--crimson);
}

.savings-card .s-value {
  color: var(--supabase-green);
}

.progress-bar-container {
  margin-top: 16px;
  margin-bottom: 32px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-family: "Source Code Pro", monospace;
  color: var(--gray-mid);
  margin-bottom: 8px;
}

.progress-title {
  letter-spacing: 1.2px;
}

.progress-track {
  width: 100%;
  height: 8px;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width 0.5s ease;
  background: var(--supabase-green);
}

.progress-fill.warning {
  background: var(--blue-accent);
}

.progress-fill.danger {
  background: var(--crimson);
}

/* Allocation Blocks */
.allocation-block {
  margin-top: 16px;
  padding: 16px 20px;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius);
}

.alloc-title {
  font-size: 12px;
  font-weight: 400;
  font-family: "Source Code Pro", monospace;
  color: var(--gray-mid);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alloc-icon {
  width: 14px;
  height: 14px;
}

.alloc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.alloc-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.alloc-label {
  color: var(--gray-light);
  display: flex;
  align-items: center;
  gap: 8px;
}

.cat-icon {
  width: 16px;
  height: 16px;
  color: var(--gray-mid);
}

.alloc-val {
  font-weight: 400;
  font-family: "Source Code Pro", monospace;
  color: var(--white-off);
}
</style>
