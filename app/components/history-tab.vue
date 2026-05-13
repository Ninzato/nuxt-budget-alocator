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
  background: var(--bg-page);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-lg);
  padding: 24px;
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
  background: var(--supabase-green);
  box-shadow: 0 0 0 4px var(--green-border);
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--gray-mid);
  font-size: 14px;
  font-family: "Source Code Pro", monospace;
  border: 1px dashed var(--border-mid);
  border-radius: var(--radius);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.history-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.h-month {
  font-size: 16px;
  font-weight: 400;
  color: var(--white-off);
}

.h-detail {
  font-size: 12px;
  color: var(--gray-mid);
  font-family: "Source Code Pro", monospace;
  margin-top: 4px;
}

.h-savings {
  font-size: 15px;
  font-weight: 400;
  font-family: "Source Code Pro", monospace;
  color: var(--supabase-green);
}

.h-savings.negative {
  color: var(--crimson);
}
</style>
