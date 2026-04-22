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
  isModalOpen,
  editingIdx,
  monthLabel,
  totalIncome,
  totalExpense,
  savings,
  expensePct,
  savingsPct,
  progressFillClass,
  freelanceImpact,
  savingsAllocation,
  sortedHistoryKeys,
  changeMonth,
  addCategory,
  editCategory,
  deleteCategory,
  openAddModal,
  openEditModal,
  closeModal,
  loadFromStorage,
  onSwitchToHistory,
  getHistoryMonthLabel,
  getHistorySnapshot,
} = useBudget();

const activeTab = ref<"planner" | "history">("planner");

function onTabChange(tab: "planner" | "history") {
  activeTab.value = tab;
  if (tab === "history") {
    onSwitchToHistory();
  }
}

function onModalSave(payload: Omit<Category, "id" | "deletable">) {
  if (editingIdx.value >= 0) {
    editCategory(editingIdx.value, payload);
  }
  else {
    addCategory(payload);
  }
  closeModal();
}

// Load persisted data on client only (localStorage is not available on server)
onMounted(() => {
  loadFromStorage();
});
</script>

<template>
  <div class="app-container">
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
        @update:salary="salary = $event"
        @update:freelance="freelance = $event"
      />

      <FreelanceNote />

      <ExpenseList
        :categories="categories"
        :salary="salary"
        :freelance="freelance"
        @add="openAddModal"
        @edit="openEditModal"
        @delete="deleteCategory"
      />

      <SummarySection
        :total-expense="totalExpense"
        :savings="savings"
        :expense-pct="expensePct"
        :savings-pct="savingsPct"
        :progress-fill-class="progressFillClass"
        :freelance-impact="freelanceImpact"
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
  </div>
</template>

<style scoped>
.app-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px 80px;
}
</style>
