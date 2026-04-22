<script setup lang="ts">
import type { Category } from "~/composables/use-budget";

import { formatRupiah } from "~/composables/use-budget";

type FreelanceImpactItem = {
  cat: Category;
  diff: number;
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
  freelanceImpact: FreelanceImpactItem[];
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
        <span>Pengeluaran</span>
        <span>{{ expensePct }}%</span>
      </div>
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="progressFillClass"
          :style="{ width: `${Math.min(expensePct, 100)}%` }"
        />
      </div>
    </div>

    <!-- Freelance impact -->
    <div v-if="freelanceImpact.length > 0" class="freelance-breakdown">
      <div class="fb-title">
        📈 Dampak Freelance terhadap Pengeluaran
      </div>
      <div
        v-for="item in freelanceImpact"
        :key="item.cat.id"
        class="fb-row"
      >
        <span class="fb-label">{{ item.cat.emoji }} {{ item.cat.name }} (+{{ item.cat.value }}%)</span>
        <span class="fb-val">+{{ formatRupiah(item.diff) }}</span>
      </div>
    </div>

    <!-- Savings allocation -->
    <div v-if="savingsAllocation" class="savings-alloc">
      <div class="sa-title">
        💰 Alokasi Tabungan (Saran)
      </div>
      <div class="sa-row">
        <span class="sa-label">🛡️ Dana Darurat (40%)</span>
        <span class="sa-val">{{ formatRupiah(savingsAllocation.emergency) }}</span>
      </div>
      <div class="sa-row">
        <span class="sa-label">📈 Investasi (30%)</span>
        <span class="sa-val">{{ formatRupiah(savingsAllocation.investment) }}</span>
      </div>
      <div class="sa-row">
        <span class="sa-label">🎉 Hiburan (15%)</span>
        <span class="sa-val">{{ formatRupiah(savingsAllocation.fun) }}</span>
      </div>
      <div class="sa-row">
        <span class="sa-label">🔄 Buffer/Fleksibel (15%)</span>
        <span class="sa-val">{{ formatRupiah(savingsAllocation.buffer) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-green {
  background: var(--green);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

.summary-card {
  padding: 18px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.expense-card {
  background: rgba(225, 112, 85, 0.05);
  border-color: rgba(225, 112, 85, 0.15);
}

.savings-card {
  background: rgba(0, 184, 148, 0.05);
  border-color: rgba(0, 184, 148, 0.15);
}

.s-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 6px;
}

.s-value {
  font-size: 24px;
  font-weight: 800;
}

.s-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.expense-card .s-value {
  color: var(--red-light);
}

.savings-card .s-value {
  color: var(--green-light);
}

.progress-bar-container {
  margin-top: 8px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: var(--bg-input);
  border-radius: 20px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 20px;
  transition: width 0.5s ease;
  background: linear-gradient(90deg, var(--green), var(--green-light));
}

.progress-fill.warning {
  background: linear-gradient(90deg, var(--orange), #f9ca24);
}

.progress-fill.danger {
  background: linear-gradient(90deg, var(--red), var(--red-light));
}

/* Freelance impact */
.freelance-breakdown {
  margin-top: 16px;
  padding: 14px 16px;
  background: rgba(0, 184, 148, 0.06);
  border: 1px solid rgba(0, 184, 148, 0.12);
  border-radius: var(--radius-sm);
}

.fb-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--green);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.fb-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 3px 0;
}

.fb-label {
  color: var(--text-secondary);
}

.fb-val {
  font-weight: 600;
  color: var(--green-light);
}

/* Savings allocation */
.savings-alloc {
  margin-top: 16px;
  padding: 14px 16px;
  background: rgba(108, 92, 231, 0.06);
  border: 1px solid rgba(108, 92, 231, 0.12);
  border-radius: var(--radius-sm);
}

.sa-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.sa-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
}

.sa-label {
  color: var(--text-secondary);
}

.sa-val {
  font-weight: 600;
  color: var(--accent-light);
}
</style>
