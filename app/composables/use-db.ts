import { openDB } from "idb";

import type { Category, MonthSnapshot } from "./use-budget";

import { DEFAULT_CATEGORIES } from "./use-budget";

const DB_NAME = "budgetAllocator";
const DB_VERSION = 2;
const STORE_MONTHS = "months";
const STORE_META = "meta";
const STORE_GAJI = "gajiPokok";
const STORE_FREELANCE = "freelanceIncome";

const LEGACY_STORAGE_KEY = "moneyPlanner";
const META_KEY_DEFAULT_CATS = "defaultCategories";
const META_KEY_INCOME_MIGRATION_DONE = "incomeMigrationV2Done";

type IncomeRecord = {
  monthKey: string;
  amount: number;
};

// ─── DB init ─────────────────────────────────────────────────────────────────

type BudgetDB = Awaited<ReturnType<typeof openBudgetDB>>;
let _db: BudgetDB | null = null;

async function openBudgetDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_MONTHS)) {
        db.createObjectStore(STORE_MONTHS, { keyPath: "monthKey" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_GAJI)) {
        db.createObjectStore(STORE_GAJI, { keyPath: "monthKey" });
      }
      if (!db.objectStoreNames.contains(STORE_FREELANCE)) {
        db.createObjectStore(STORE_FREELANCE, { keyPath: "monthKey" });
      }
    },
  });
}

async function getDB(): Promise<BudgetDB> {
  if (!_db) {
    _db = await openBudgetDB();
  }
  return _db;
}

// ─── Migration from localStorage ─────────────────────────────────────────────

async function migrateLegacyData(db: BudgetDB) {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw)
      return;

    const data = JSON.parse(raw) as {
      categories?: Category[];
      historyData?: Record<string, Omit<MonthSnapshot, "monthKey">>;
    };

    const tx = db.transaction([STORE_MONTHS, STORE_META], "readwrite");
    const monthsStore = tx.objectStore(STORE_MONTHS);
    const metaStore = tx.objectStore(STORE_META);

    // Migrate each month snapshot
    if (data.historyData) {
      for (const [monthKey, snap] of Object.entries(data.historyData)) {
        const existing = await monthsStore.get(monthKey);
        if (!existing) {
          await monthsStore.put({
            monthKey,
            salary: snap.salary,
            freelance: snap.freelance,
            categories: snap.categories,
            savedAt: snap.savedAt,
            calcMode: "legacy_total",
          });
        }
      }
    }

    // Use the top-level categories as the default template
    const defaultCats = data.categories ?? structuredClone(DEFAULT_CATEGORIES);
    const existingDefault = await metaStore.get(META_KEY_DEFAULT_CATS);
    if (!existingDefault) {
      await metaStore.put({ key: META_KEY_DEFAULT_CATS, value: defaultCats });
    }

    await tx.done;

    // Clean up legacy storage
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
  catch (e) {
    console.warn("[use-db] Legacy migration failed:", e);
  }
}

async function migrateIncomeTables(db: BudgetDB) {
  const alreadyMigrated = await db.get(STORE_META, META_KEY_INCOME_MIGRATION_DONE);
  if (alreadyMigrated) {
    return;
  }

  const months = await db.getAll(STORE_MONTHS);
  const tx = db.transaction([STORE_MONTHS, STORE_GAJI, STORE_FREELANCE, STORE_META], "readwrite");
  const monthsStore = tx.objectStore(STORE_MONTHS);
  const gajiStore = tx.objectStore(STORE_GAJI);
  const freelanceStore = tx.objectStore(STORE_FREELANCE);

  for (const month of months) {
    const legacySalary = typeof month.salary === "number" ? month.salary : 0;
    const legacyFreelance = typeof month.freelance === "number" ? month.freelance : 0;

    const existingGaji = await gajiStore.get(month.monthKey) as IncomeRecord | undefined;
    if (!existingGaji) {
      await gajiStore.put({ monthKey: month.monthKey, amount: legacySalary });
    }

    const existingFreelance = await freelanceStore.get(month.monthKey) as IncomeRecord | undefined;
    if (!existingFreelance) {
      await freelanceStore.put({ monthKey: month.monthKey, amount: legacyFreelance });
    }

    if (!month.calcMode) {
      await monthsStore.put({
        ...month,
        calcMode: "legacy_total",
      });
    }
  }

  await tx.objectStore(STORE_META).put({
    key: META_KEY_INCOME_MIGRATION_DONE,
    value: true,
    migratedAt: new Date().toISOString(),
  });
  await tx.done;
}

async function getMonthIncome(monthKey: string): Promise<{ salary: number; freelance: number }> {
  const db = await getDB();
  const [gajiRecord, freelanceRecord] = await Promise.all([
    db.get(STORE_GAJI, monthKey) as Promise<IncomeRecord | undefined>,
    db.get(STORE_FREELANCE, monthKey) as Promise<IncomeRecord | undefined>,
  ]);

  return {
    salary: gajiRecord?.amount ?? 0,
    freelance: freelanceRecord?.amount ?? 0,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function initDB(): Promise<void> {
  const db = await getDB();

  // Check if we need to migrate legacy data
  const hasMonths = (await db.count(STORE_MONTHS)) > 0;
  const hasDefault = !!(await db.get(STORE_META, META_KEY_DEFAULT_CATS));

  if (!hasMonths && !hasDefault) {
    // Either a brand new user or a legacy user — attempt migration first
    await migrateLegacyData(db);

    // If still no default after migration (truly new user), seed with hardcoded defaults
    const stillNoDefault = !(await db.get(STORE_META, META_KEY_DEFAULT_CATS));
    if (stillNoDefault) {
      await db.put(STORE_META, {
        key: META_KEY_DEFAULT_CATS,
        value: structuredClone(DEFAULT_CATEGORIES),
      });
    }
  }

  await migrateIncomeTables(db);
}

export async function getMonth(monthKey: string): Promise<MonthSnapshot | null> {
  const db = await getDB();
  const record = await db.get(STORE_MONTHS, monthKey);
  if (!record) {
    return null;
  }

  const income = await getMonthIncome(monthKey);
  return {
    ...record,
    salary: income.salary,
    freelance: income.freelance,
  };
}

export async function saveMonth(monthKey: string, snapshot: Omit<MonthSnapshot, "monthKey">): Promise<void> {
  const db = await getDB();
  const tx = db.transaction([STORE_MONTHS, STORE_GAJI, STORE_FREELANCE], "readwrite");
  const { salary, freelance, ...monthWithoutIncome } = snapshot;

  await tx.objectStore(STORE_MONTHS).put({ monthKey, ...monthWithoutIncome });
  await tx.objectStore(STORE_GAJI).put({ monthKey, amount: salary });
  await tx.objectStore(STORE_FREELANCE).put({ monthKey, amount: freelance });

  await tx.done;
}

export async function getAllMonths(): Promise<Record<string, MonthSnapshot>> {
  const db = await getDB();
  const [allMonths, allGaji, allFreelance] = await Promise.all([
    db.getAll(STORE_MONTHS),
    db.getAll(STORE_GAJI) as Promise<IncomeRecord[]>,
    db.getAll(STORE_FREELANCE) as Promise<IncomeRecord[]>,
  ]);

  const salaryMap = new Map(allGaji.map(item => [item.monthKey, item.amount]));
  const freelanceMap = new Map(allFreelance.map(item => [item.monthKey, item.amount]));

  const result: Record<string, MonthSnapshot> = {};
  for (const record of allMonths) {
    result[record.monthKey] = {
      ...record,
      salary: salaryMap.get(record.monthKey) ?? 0,
      freelance: freelanceMap.get(record.monthKey) ?? 0,
    };
  }
  return result;
}

export async function getDefaultCategories(): Promise<Category[]> {
  const db = await getDB();
  const record = await db.get(STORE_META, META_KEY_DEFAULT_CATS);
  if (record?.value) {
    return (record.value as Category[]).map((category) => {
      if (category.type === "percent_total") {
        return {
          ...category,
          type: "percent_gaji",
        };
      }
      return category;
    });
  }
  return structuredClone(DEFAULT_CATEGORIES);
}

export async function saveDefaultCategories(categories: Category[]): Promise<void> {
  const db = await getDB();
  await db.put(STORE_META, { key: META_KEY_DEFAULT_CATS, value: categories });
}
