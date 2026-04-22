<script setup lang="ts">
import type { Category } from "~/composables/use-budget";

useHead({
  title: "Perencana Keuangan",
  meta: [
    {
      name: "description",
      content: "Atur pemasukan dan pengeluaran bulananmu dengan mudah menggunakan Perencana Keuangan.",
    },
  ],
});

const {
  categories,
  historyData,
  salary,
  freelance,
  currentCalcMode,
  isLoading,
  isDirty,
  saveStatus,
  lastSavedAt,
  isSaveStale,
  unsavedMinutes,
  isModalOpen,
  editingIdx,
  monthLabel,
  totalIncome,
  totalExpense,
  savings,
  expensePct,
  savingsPct,
  progressFillClass,
  freelanceAllocation,
  savingsAllocation,
  sortedHistoryKeys,
  changeMonth,
  saveManually,
  shouldWarnBeforeUnload,
  updateSalary,
  updateFreelance,
  addCategory,
  editCategory,
  deleteCategory,
  reorderCategory,
  openAddModal,
  openEditModal,
  closeModal,
  initBudget,
  onSwitchToHistory,
  getHistoryMonthLabel,
  getHistorySnapshot,
} = useBudget();

const activeTab = ref<"planner" | "history">("planner");

function onTabChange(tab: "planner" | "history") {
  activeTab.value = tab;
  if (tab === "history") {
    void onSwitchToHistory();
  }
}

function onSalaryUpdate(value: number) {
  updateSalary(value);
}

function onFreelanceUpdate(value: number) {
  updateFreelance(value);
}

async function onCategoryReorder(fromIdx: number, toIdx: number) {
  await reorderCategory(fromIdx, toIdx);
}

async function onSaveClick() {
  await saveManually();
}

async function onModalSave(payload: Omit<Category, "id" | "deletable">) {
  if (editingIdx.value >= 0) {
    await editCategory(editingIdx.value, payload);
  }
  else {
    await addCategory(payload);
  }
  closeModal();
}

// Initialize from IndexedDB on client only
onMounted(async () => {
  await initBudget();

  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!shouldWarnBeforeUnload()) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  };

  window.addEventListener("beforeunload", onBeforeUnload);
  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", onBeforeUnload);
  });
});
</script>

<template>
  <div class="app-container">
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner" />
      <span class="loading-text">Memuat data...</span>
    </div>

    <template v-else>
      <AppHeader />

      <MonthNav
        :month-label="monthLabel"
        @prev="changeMonth(-1)"
        @next="changeMonth(1)"
      />

      <TabBar
        :active-tab="activeTab"
        @change="onTabChange"
      />

      <!-- Planner Tab -->
      <div v-show="activeTab === 'planner'">
        <IncomeSection
          :salary="salary"
          :freelance="freelance"
          :total-income="totalIncome"
          :is-dirty="isDirty"
          :save-status="saveStatus"
          :last-saved-at="lastSavedAt"
          :is-save-stale="isSaveStale"
          :unsaved-minutes="unsavedMinutes"
          @update:salary="onSalaryUpdate"
          @update:freelance="onFreelanceUpdate"
          @save="onSaveClick"
        />

        <FreelanceNote />

        <ExpenseList
          :categories="categories"
          :salary="salary"
          :freelance="freelance"
          :calc-mode="currentCalcMode"
          @add="openAddModal"
          @edit="openEditModal"
          @delete="deleteCategory"
          @reorder="onCategoryReorder"
        />

        <SummarySection
          :total-expense="totalExpense"
          :savings="savings"
          :expense-pct="expensePct"
          :savings-pct="savingsPct"
          :progress-fill-class="progressFillClass"
          :freelance-allocation="freelanceAllocation"
          :savings-allocation="savingsAllocation"
        />
      </div>

      <!-- History Tab -->
      <div v-show="activeTab === 'history'">
        <HistoryTab
          :sorted-keys="sortedHistoryKeys"
          :history-data="historyData"
          :get-month-label="getHistoryMonthLabel"
          :get-snapshot="getHistorySnapshot"
        />
      </div>

      <ExpenseModal
        :is-open="isModalOpen"
        :editing-category="editingIdx >= 0 ? categories[editingIdx] ?? null : null"
        @close="closeModal"
        @save="onModalSave"
      />
    </template>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px 80px;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
