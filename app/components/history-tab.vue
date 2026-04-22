<script setup lang="ts">
import type { MonthSnapshot } from "~/composables/use-budget";

import { formatRupiah } from "~/composables/use-budget";

defineProps<{
  sortedKeys: string[];
  historyData: Record<string, MonthSnapshot>;
  getMonthLabel: (key: string) => string;
  getSnapshot: (key: string) => { totalIncome: number; totalExpense: number; savings: number } | null;
}>();
</script>

<template>
  <div class="history-section">
    <div class="section-title">
      <span class="dot" />
      Riwayat Bulanan
    </div>
    <div v-if="sortedKeys.length === 0" class="empty-state">
      Belum ada riwayat. Mulai isi pemasukan bulan ini!
    </div>
    <div
      v-for="key in sortedKeys"
      :key="key"
      class="history-item"
    >
      <div>
        <div class="h-month">
          {{ getMonthLabel(key) }}
        </div>
        <div class="h-detail">
          Pemasukan: {{ formatRupiah(getSnapshot(key)!.totalIncome) }}
          &middot;
          Pengeluaran: {{ formatRupiah(getSnapshot(key)!.totalExpense) }}
        </div>
      </div>
      <div
        class="h-savings"
        :class="{ negative: getSnapshot(key)!.savings < 0 }"
      >
        {{ getSnapshot(key)!.savings < 0 ? "-" : "" }}{{ formatRupiah(Math.abs(getSnapshot(key)!.savings)) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
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
  background: var(--accent);
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 14px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.history-item:last-child {
  border-bottom: none;
}

.h-month {
  font-size: 14px;
  font-weight: 600;
}

.h-detail {
  font-size: 12px;
  color: var(--text-muted);
}

.h-savings {
  font-size: 15px;
  font-weight: 700;
  color: var(--green-light);
}

.h-savings.negative {
  color: var(--red-light);
}
</style>
