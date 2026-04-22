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

export type CategoryType = "fixed" | "percent_gaji" | "percent_total" | "custom";

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
  salary: number;
  freelance: number;
  categories: Category[];
  savedAt: string;
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "nafkah",
    name: "Nafkah Istri",
    emoji: "💑",
    type: "percent_total",
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
    type: "percent_total",
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

export function calcCategoryAmount(cat: Category, salary: number, freelance: number): number {
  const totalIncome = salary + freelance;
  if (cat.type === "fixed") {
    return cat.value ?? 0;
  }
  else if (cat.type === "percent_gaji") {
    return Math.round(salary * ((cat.value ?? 0) / 100));
  }
  else if (cat.type === "percent_total") {
    return Math.round(totalIncome * ((cat.value ?? 0) / 100));
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

export function getCategoryDetail(cat: Category): string {
  if (cat.type === "fixed") {
    return formatRupiah(cat.value ?? 0);
  }
  else if (cat.type === "percent_gaji") {
    return `${cat.value}% dari gaji pokok`;
  }
  else if (cat.type === "percent_total") {
    return `${cat.value}% dari gaji + freelance`;
  }
  else if (cat.type === "custom") {
    return "Custom";
  }
  return "";
}

// ─── Storage key ──────────────────────────────────────────────────────

const STORAGE_KEY = "moneyPlanner";

// ─── Composable ───────────────────────────────────────────────────────

export function useBudget() {
  const currentDate = ref(new Date());
  const categories = ref<Category[]>(structuredClone(DEFAULT_CATEGORIES));
  const historyData = ref<Record<string, MonthSnapshot>>({});
  const salary = ref(0);
  const freelance = ref(0);

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

  function saveCurrentMonth() {
    if (salary.value > 0 || freelance.value > 0) {
      const key = getMonthKey();
      historyData.value[key] = {
        salary: salary.value,
        freelance: freelance.value,
        categories: structuredClone(categories.value),
        savedAt: new Date().toISOString(),
      };
      saveToStorage();
    }
  }

  function loadMonthData() {
    const key = getMonthKey();
    const snapshot = historyData.value[key];
    if (snapshot) {
      salary.value = snapshot.salary;
      freelance.value = snapshot.freelance;
    }
    else {
      salary.value = 0;
      freelance.value = 0;
    }
  }

  function changeMonth(dir: -1 | 1) {
    saveCurrentMonth();
    const d = new Date(currentDate.value);
    d.setMonth(d.getMonth() + dir);
    currentDate.value = d;
    loadMonthData();
  }

  // ── Computeds ────────────────────────────────────────────────────────

  const totalIncome = computed(() => salary.value + freelance.value);

  const totalExpense = computed(() =>
    categories.value.reduce(
      (sum, cat) => sum + calcCategoryAmount(cat, salary.value, freelance.value),
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

  const freelanceImpact = computed(() => {
    if (freelance.value <= 0)
      return [];
    return categories.value
      .filter(cat => cat.type === "percent_total")
      .map((cat) => {
        const withFreelance = calcCategoryAmount(cat, salary.value, freelance.value);
        const withoutFreelance = calcCategoryAmount(cat, salary.value, 0);
        const diff = withFreelance - withoutFreelance;
        return { cat, diff };
      })
      .filter(item => item.diff > 0);
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

  function addCategory(cat: Omit<Category, "id" | "deletable">) {
    categories.value.push({
      ...cat,
      id: `custom_${Date.now()}`,
      deletable: true,
    });
    saveToStorage();
  }

  function editCategory(idx: number, updates: Partial<Omit<Category, "id" | "deletable">>) {
    const existing = categories.value[idx];
    if (!existing)
      return;
    Object.assign(existing, updates);
    // Remove stale formula if type changed away from custom
    if (updates.type && updates.type !== "custom") {
      delete existing.formula;
    }
    saveToStorage();
  }

  function deleteCategory(idx: number) {
    if (categories.value[idx]?.deletable) {
      categories.value.splice(idx, 1);
      saveToStorage();
    }
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

  // ── Storage ──────────────────────────────────────────────────────────

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        categories: categories.value,
        historyData: historyData.value,
      }));
    }
    catch {}
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved)
        return;
      const data = JSON.parse(saved);
      if (data.categories)
        categories.value = data.categories;
      if (data.historyData)
        historyData.value = data.historyData;
    }
    catch {}
  }

  // ── History helpers ────────────────────────────────────────────────

  const sortedHistoryKeys = computed(() =>
    Object.keys(historyData.value).sort().reverse(),
  );

  function getHistoryMonthLabel(key: string): string {
    const [y, m] = key.split("-");
    return `${MONTHS_ID[Number.parseInt(m) - 1]} ${y}`;
  }

  function getHistorySnapshot(key: string) {
    const d = historyData.value[key];
    if (!d)
      return null;
    const totalIncomeH = d.salary + d.freelance;
    const totalExpenseH = d.categories.reduce(
      (sum, cat) => sum + calcCategoryAmount(cat, d.salary, d.freelance),
      0,
    );
    const savingsH = totalIncomeH - totalExpenseH;
    return { totalIncome: totalIncomeH, totalExpense: totalExpenseH, savings: savingsH };
  }

  // Called when switching to history tab — persist current data first
  function onSwitchToHistory() {
    saveCurrentMonth();
  }

  return {
    // State
    currentDate,
    categories,
    historyData,
    salary,
    freelance,
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
    freelanceImpact,
    savingsAllocation,
    sortedHistoryKeys,
    // Methods
    changeMonth,
    saveCurrentMonth,
    addCategory,
    editCategory,
    deleteCategory,
    openAddModal,
    openEditModal,
    closeModal,
    loadFromStorage,
    saveToStorage,
    onSwitchToHistory,
    getHistoryMonthLabel,
    getHistorySnapshot,
    // Helpers (exposed for components)
    calcCategoryAmount,
    getCategoryDetail,
    formatRupiah,
    formatNumber,
    parseNumber,
    MONTHS_ID,
  };
}
