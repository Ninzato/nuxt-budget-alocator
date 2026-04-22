import {
  getAllMonths,
  getDefaultCategories,
  getMonth,
  initDB,
  saveDefaultCategories,
  saveMonth,
} from "./use-db";

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export type CategoryType = "fixed" | "percent_gaji" | "percent_freelance" | "percent_total" | "custom";

export type CalcMode = "legacy_total" | "split_sources";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  type: CategoryType;
  value?: number;
  formula?: string;
  deletable: boolean;
};

export type MonthSnapshot = {
  monthKey: string;
  salary: number;
  freelance: number;
  categories: Category[];
  savedAt: string;
  calcMode?: CalcMode;
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "nafkah",
    name: "Nafkah Istri",
    emoji: "💑",
    type: "percent_gaji",
    value: 10,
    deletable: false,
  },
  {
    id: "listrik",
    name: "Uang Listrik",
    emoji: "💡",
    type: "fixed",
    value: 300000,
    deletable: true,
  },
  {
    id: "kucing",
    name: "Makan Kucing",
    emoji: "🐱",
    type: "fixed",
    value: 300000,
    deletable: true,
  },
  {
    id: "sedekah",
    name: "Uang Sedekah",
    emoji: "🤲",
    type: "percent_gaji",
    value: 2.5,
    deletable: false,
  },
  {
    id: "jajan",
    name: "Jajan Adik",
    emoji: "🧒",
    type: "custom",
    formula: "jajan_adik",
    deletable: true,
  },
  {
    id: "kuota",
    name: "Uang Kuota",
    emoji: "📱",
    type: "fixed",
    value: 100000,
    deletable: true,
  },
];

// ─── Pure helpers ──────────────────────────────────────────────────────

export function parseNumber(str: string): number {
  if (!str)
    return 0;
  return Number.parseInt(str.replace(/\D/g, "")) || 0;
}

export function formatNumber(num: number): string {
  if (!num && num !== 0)
    return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatRupiah(num: number): string {
  if (num === 0)
    return "Rp 0";
  const abs = Math.abs(num);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (num < 0 ? "-Rp " : "Rp ") + formatted;
}

export function normalizeCategoryForCurrentMode(category: Category): Category {
  if (category.type !== "percent_total") {
    return category;
  }

  return {
    ...category,
    type: "percent_gaji",
  };
}

export function normalizeCategoriesForCurrentMode(list: Category[]): Category[] {
  return list.map(normalizeCategoryForCurrentMode);
}

function toPlainCategory(category: Category): Category {
  const plain: Category = {
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    type: category.type,
    deletable: category.deletable,
  };

  if (typeof category.value !== "undefined") {
    plain.value = category.value;
  }
  if (typeof category.formula !== "undefined") {
    plain.formula = category.formula;
  }

  return plain;
}

function cloneCategories(list: Category[]): Category[] {
  return list.map(toPlainCategory);
}

export function calcCategoryAmount(
  cat: Category,
  salary: number,
  freelance: number,
  calcMode: CalcMode = "split_sources",
): number {
  const totalIncome = salary + freelance;

  if (cat.type === "fixed") {
    return cat.value ?? 0;
  }
  else if (cat.type === "percent_gaji") {
    return Math.round(salary * ((cat.value ?? 0) / 100));
  }
  else if (cat.type === "percent_freelance") {
    return Math.round(freelance * ((cat.value ?? 0) / 100));
  }
  else if (cat.type === "percent_total") {
    if (calcMode === "legacy_total") {
      return Math.round(totalIncome * ((cat.value ?? 0) / 100));
    }
    return Math.round(salary * ((cat.value ?? 0) / 100));
  }
  else if (cat.type === "custom") {
    if (cat.formula === "jajan_adik") {
      const fivePercent = Math.round(salary * 0.05);
      const amount = Math.max(500000, fivePercent);
      return Math.min(amount, 800000);
    }
    return 0;
  }
  return 0;
}

export function getCategoryDetail(cat: Category, calcMode: CalcMode = "split_sources"): string {
  if (cat.type === "fixed") {
    return formatRupiah(cat.value ?? 0);
  }
  else if (cat.type === "percent_gaji") {
    return `${cat.value}% dari gaji pokok`;
  }
  else if (cat.type === "percent_freelance") {
    return `${cat.value}% dari freelance`;
  }
  else if (cat.type === "percent_total") {
    return calcMode === "legacy_total"
      ? `${cat.value}% dari gaji + freelance (legacy)`
      : `${cat.value}% dari gaji pokok`;
  }
  else if (cat.type === "custom") {
    return "Custom";
  }
  return "";
}

// ─── Composable ───────────────────────────────────────────────────────

export function useBudget() {
  const currentDate = ref(new Date());
  const categories = ref<Category[]>(structuredClone(DEFAULT_CATEGORIES));
  const historyData = ref<Record<string, MonthSnapshot>>({});
  const salary = ref(0);
  const freelance = ref(0);
  const currentCalcMode = ref<CalcMode>("split_sources");
  const isLoading = ref(true);

  // Save state
  const isDirty = ref(false);
  const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedAt = ref<string | null>(null);
  const lastManualSaveAt = ref<string | null>(null);
  const dirtySince = ref<number | null>(null);
  const lastSaveError = ref<string | null>(null);
  const nowTick = ref(Date.now());

  const STALE_LIMIT_MS = 5 * 60 * 1000;
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let staleTicker: ReturnType<typeof setInterval> | null = null;

  // Modal state
  const isModalOpen = ref(false);
  const editingIdx = ref(-1);

  // ── Month helpers ────────────────────────────────────────────────────

  const monthLabel = computed(() => {
    return `${MONTHS_ID[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`;
  });

  function getMonthKey(date: Date = currentDate.value): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  // Returns the key of the most recently saved month (or null)
  function getLatestSavedMonthKey(): string | null {
    const keys = Object.keys(historyData.value).sort();
    return keys.length > 0 ? keys[keys.length - 1]! : null;
  }

  // Returns true if the current month is at or after the latest saved month
  function isCurrentMonthLatestOrNewer(): boolean {
    const latestKey = getLatestSavedMonthKey();
    if (!latestKey)
      return true;
    return getMonthKey() >= latestKey;
  }

  function markDirty() {
    if (!isDirty.value) {
      dirtySince.value = Date.now();
    }
    isDirty.value = true;
    if (saveStatus.value !== "saving") {
      saveStatus.value = "idle";
    }
  }

  function clearAutosaveTimer() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
  }

  function scheduleAutoSave() {
    clearAutosaveTimer();
    autosaveTimer = setTimeout(() => {
      void saveCurrentMonth();
    }, 1500);
  }

  function updateSalary(value: number) {
    salary.value = value;
    markDirty();
    scheduleAutoSave();
  }

  function updateFreelance(value: number) {
    freelance.value = value;
    markDirty();
    scheduleAutoSave();
  }

  async function saveCurrentMonth(options?: { manual?: boolean }) {
    const isManualSave = options?.manual ?? false;
    const key = getMonthKey();
    const nowIso = new Date().toISOString();
    const snapshot: MonthSnapshot = {
      monthKey: key,
      salary: salary.value,
      freelance: freelance.value,
      categories: cloneCategories(categories.value),
      savedAt: nowIso,
      calcMode: currentCalcMode.value,
    };

    saveStatus.value = "saving";
    lastSaveError.value = null;

    try {
      await saveMonth(key, snapshot);
      historyData.value[key] = snapshot;
      isDirty.value = false;
      dirtySince.value = null;
      lastSavedAt.value = nowIso;
      if (isManualSave) {
        lastManualSaveAt.value = nowIso;
      }
      saveStatus.value = "saved";
    }
    catch (error) {
      saveStatus.value = "error";
      lastSaveError.value = error instanceof Error ? error.message : "Gagal menyimpan data";
      console.error("[useBudget] saveCurrentMonth failed:", error);
    }
  }

  async function saveManually() {
    await saveCurrentMonth({ manual: true });
  }

  async function flushPendingAutosave() {
    if (!isDirty.value || saveStatus.value === "saving") {
      return;
    }
    clearAutosaveTimer();
    await saveCurrentMonth();
  }

  function shouldWarnBeforeUnload(): boolean {
    if (!isDirty.value || !dirtySince.value) {
      return false;
    }

    const baseline = lastManualSaveAt.value
      ? new Date(lastManualSaveAt.value).getTime()
      : dirtySince.value;

    return Date.now() - baseline >= STALE_LIMIT_MS;
  }

  async function loadMonthData(date: Date = currentDate.value) {
    const key = getMonthKey(date);
    const snapshot = await getMonth(key);
    if (snapshot) {
      salary.value = snapshot.salary;
      freelance.value = snapshot.freelance;
      categories.value = cloneCategories(snapshot.categories);
      currentCalcMode.value = snapshot.calcMode ?? "legacy_total";
      lastSavedAt.value = snapshot.savedAt;
    }
    else {
      // New month: seed from default categories template
      salary.value = 0;
      freelance.value = 0;
      categories.value = normalizeCategoriesForCurrentMode(cloneCategories(await getDefaultCategories()));
      currentCalcMode.value = "split_sources";
      lastSavedAt.value = null;
    }

    isDirty.value = false;
    saveStatus.value = "idle";
    dirtySince.value = null;
    lastSaveError.value = null;
  }

  async function changeMonth(dir: -1 | 1) {
    await flushPendingAutosave();
    const d = new Date(currentDate.value);
    d.setMonth(d.getMonth() + dir);
    currentDate.value = d;
    await loadMonthData(d);
  }

  // ── Computeds ────────────────────────────────────────────────────────

  const totalIncome = computed(() => salary.value + freelance.value);

  const totalExpense = computed(() =>
    categories.value.reduce(
      (sum, cat) => sum + calcCategoryAmount(cat, salary.value, freelance.value, currentCalcMode.value),
      0,
    ),
  );

  const savings = computed(() => totalIncome.value - totalExpense.value);

  const expensePct = computed(() =>
    totalIncome.value > 0
      ? Number((totalExpense.value / totalIncome.value * 100).toFixed(1))
      : 0,
  );

  const savingsPct = computed(() =>
    totalIncome.value > 0
      ? Number((savings.value / totalIncome.value * 100).toFixed(1))
      : 0,
  );

  const progressFillClass = computed(() => {
    if (expensePct.value > 80)
      return "danger";
    if (expensePct.value > 60)
      return "warning";
    return "";
  });

  const freelanceAllocation = computed(() =>
    categories.value
      .filter(cat => cat.type === "percent_freelance")
      .map(cat => ({
        cat,
        amount: calcCategoryAmount(cat, salary.value, freelance.value, currentCalcMode.value),
      }))
      .filter(item => item.amount > 0),
  );

  const isSaveStale = computed(() => {
    if (!isDirty.value || !dirtySince.value) {
      return false;
    }

    const baseline = lastManualSaveAt.value
      ? new Date(lastManualSaveAt.value).getTime()
      : dirtySince.value;

    return nowTick.value - baseline >= STALE_LIMIT_MS;
  });

  const unsavedMinutes = computed(() => {
    if (!isDirty.value || !dirtySince.value) {
      return 0;
    }
    return Math.floor((nowTick.value - dirtySince.value) / 60000);
  });

  const savingsAllocation = computed(() => {
    if (savings.value <= 0)
      return null;
    const emergency = Math.round(savings.value * 0.4);
    const investment = Math.round(savings.value * 0.3);
    const fun = Math.round(savings.value * 0.15);
    const buffer = savings.value - emergency - investment - fun;
    return { emergency, investment, fun, buffer };
  });

  // ── Category mutations ───────────────────────────────────────────────

  async function updateDefaultIfNeeded() {
    if (isCurrentMonthLatestOrNewer()) {
      await saveDefaultCategories(normalizeCategoriesForCurrentMode(cloneCategories(categories.value)));
    }
  }

  async function addCategory(cat: Omit<Category, "id" | "deletable">) {
    markDirty();
    categories.value.push({
      ...normalizeCategoryForCurrentMode(cat as Category),
      id: `custom_${Date.now()}`,
      deletable: true,
    });
    await updateDefaultIfNeeded();
    await saveCurrentMonth();
  }

  async function editCategory(idx: number, updates: Partial<Omit<Category, "id" | "deletable">>) {
    const existing = categories.value[idx];
    if (!existing)
      return;
    markDirty();
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.type === "percent_total") {
      normalizedUpdates.type = "percent_gaji";
    }
    Object.assign(existing, normalizedUpdates);
    // Remove stale formula if type changed away from custom
    if (normalizedUpdates.type && normalizedUpdates.type !== "custom") {
      delete existing.formula;
    }
    await updateDefaultIfNeeded();
    await saveCurrentMonth();
  }

  async function deleteCategory(idx: number) {
    if (categories.value[idx]?.deletable) {
      markDirty();
      categories.value.splice(idx, 1);
      await updateDefaultIfNeeded();
      await saveCurrentMonth();
    }
  }

  async function reorderCategory(fromIdx: number, toIdx: number) {
    if (
      fromIdx < 0
      || toIdx < 0
      || fromIdx >= categories.value.length
      || toIdx >= categories.value.length
      || fromIdx === toIdx
    ) {
      return;
    }

    markDirty();
    const [moved] = categories.value.splice(fromIdx, 1);
    if (!moved) {
      return;
    }
    categories.value.splice(toIdx, 0, moved);
    await updateDefaultIfNeeded();
    await saveCurrentMonth();
  }

  // ── Modal helpers ─────────────────────────────────────────────────────

  function openAddModal() {
    editingIdx.value = -1;
    isModalOpen.value = true;
  }

  function openEditModal(idx: number) {
    editingIdx.value = idx;
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
    editingIdx.value = -1;
  }

  // ── Init ──────────────────────────────────────────────────────────────

  async function initBudget() {
    isLoading.value = true;
    try {
      await initDB();
      historyData.value = await getAllMonths();
      await loadMonthData();

      if (!lastManualSaveAt.value) {
        lastManualSaveAt.value = lastSavedAt.value;
      }

      if (import.meta.client && !staleTicker) {
        staleTicker = setInterval(() => {
          nowTick.value = Date.now();
        }, 30000);
      }
    }
    catch (e) {
      console.error("[useBudget] initBudget failed:", e);
    }
    finally {
      isLoading.value = false;
    }
  }

  onBeforeUnmount(() => {
    clearAutosaveTimer();
    if (staleTicker) {
      clearInterval(staleTicker);
      staleTicker = null;
    }
  });

  // ── History helpers ────────────────────────────────────────────────

  const sortedHistoryKeys = computed(() =>
    Object.keys(historyData.value).sort().reverse(),
  );

  function getHistoryMonthLabel(key: string): string {
    const [y, m] = key.split("-");
    return `${MONTHS_ID[Number.parseInt(m!) - 1]} ${y}`;
  }

  function getHistorySnapshot(key: string) {
    const d = historyData.value[key];
    if (!d)
      return null;
    const calcMode = d.calcMode ?? "legacy_total";
    const totalIncomeH = d.salary + d.freelance;
    const totalExpenseH = d.categories.reduce(
      (sum, cat) => sum + calcCategoryAmount(cat, d.salary, d.freelance, calcMode),
      0,
    );
    const savingsH = totalIncomeH - totalExpenseH;
    return { totalIncome: totalIncomeH, totalExpense: totalExpenseH, savings: savingsH };
  }

  // Called when switching to history tab — persist current data first
  async function onSwitchToHistory() {
    await flushPendingAutosave();
    historyData.value = await getAllMonths();
  }

  return {
    // State
    currentDate,
    categories,
    historyData,
    salary,
    freelance,
    currentCalcMode,
    isLoading,
    isDirty,
    saveStatus,
    lastSavedAt,
    lastManualSaveAt,
    lastSaveError,
    isModalOpen,
    editingIdx,
    // Computed
    monthLabel,
    totalIncome,
    totalExpense,
    savings,
    expensePct,
    savingsPct,
    progressFillClass,
    freelanceAllocation,
    isSaveStale,
    unsavedMinutes,
    savingsAllocation,
    sortedHistoryKeys,
    // Methods
    changeMonth,
    saveCurrentMonth,
    saveManually,
    flushPendingAutosave,
    shouldWarnBeforeUnload,
    updateSalary,
    updateFreelance,
    markDirty,
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
    // Helpers (exposed for components)
    calcCategoryAmount,
    getCategoryDetail,
    normalizeCategoriesForCurrentMode,
    formatRupiah,
    formatNumber,
    parseNumber,
    MONTHS_ID,
  };
}
