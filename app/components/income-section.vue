<script setup lang="ts">
import { formatNumber, formatRupiah } from "~/composables/use-budget";

const props = defineProps<{
  salary: number;
  freelance: number;
  totalIncome: number;
  isDirty: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt: string | null;
  isSaveStale: boolean;
  unsavedMinutes: number;
}>();

const emit = defineEmits<{
  "update:salary": [value: number];
  "update:freelance": [value: number];
  "save": [];
}>();

const salaryDisplay = computed(() => (props.salary ? formatNumber(props.salary) : ""));
const freelanceDisplay = computed(() => (props.freelance ? formatNumber(props.freelance) : ""));

const saveStatusText = computed(() => {
  if (props.saveStatus === "saving")
    return "Menyimpan...";
  if (props.saveStatus === "saved")
    return "Tersimpan";
  if (props.saveStatus === "error")
    return "Gagal menyimpan";
  if (props.isDirty)
    return "Belum disimpan";
  return "Belum ada perubahan";
});

const saveMetaText = computed(() => {
  if (props.isDirty) {
    return props.isSaveStale
      ? `Perubahan belum disimpan manual selama ${props.unsavedMinutes} menit`
      : `Perubahan menunggu sinkronisasi (${props.unsavedMinutes} menit)`;
  }

  if (props.lastSavedAt) {
    const savedDate = new Date(props.lastSavedAt);
    return `Terakhir disimpan ${savedDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return "Belum ada data tersimpan";
});

function onSalaryInput(event: Event) {
  const el = event.target as HTMLInputElement;
  const raw = el.value.replace(/\D/g, "");
  const num = raw ? Number.parseInt(raw) : 0;
  el.value = num ? formatNumber(num) : "";
  emit("update:salary", num);
}

function onFreelanceInput(event: Event) {
  const el = event.target as HTMLInputElement;
  const raw = el.value.replace(/\D/g, "");
  const num = raw ? Number.parseInt(raw) : 0;
  el.value = num ? formatNumber(num) : "";
  emit("update:freelance", num);
}
</script>

<template>
  <div class="income-section">
    <div class="section-title">
      <span class="dot" />
      Pemasukan Bulanan
    </div>
    <div class="income-grid">
      <div class="input-group">
        <label for="salary-input">Gaji Pokok (Fulltime)</label>
        <div class="input-wrapper">
          <span class="prefix">Rp</span>
          <input
            id="salary-input"
            type="text"
            :value="salaryDisplay"
            placeholder="0"
            @input="onSalaryInput"
          >
        </div>
      </div>
      <div class="input-group">
        <label for="freelance-input">Pendapatan Freelance</label>
        <div class="input-wrapper">
          <span class="prefix">Rp</span>
          <input
            id="freelance-input"
            type="text"
            :value="freelanceDisplay"
            placeholder="0"
            @input="onFreelanceInput"
          >
        </div>
      </div>
    </div>
    <div class="total-income-bar">
      <span class="label">Total Pemasukan</span>
      <span class="amount">{{ formatRupiah(totalIncome) }}</span>
    </div>

    <div class="save-row">
      <div class="save-info" :class="{ stale: isSaveStale, error: saveStatus === 'error' }">
        <div class="save-status">
          {{ saveStatusText }}
        </div>
        <div class="save-meta">
          {{ saveMetaText }}
        </div>
      </div>
      <button
        class="btn-save"
        :disabled="saveStatus === 'saving'"
        @click="$emit('save')"
      >
        Simpan Data
      </button>
    </div>
  </div>
</template>

<style scoped>
.income-section {
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
  background: var(--supabase-green);
  box-shadow: 0 0 0 4px var(--green-border);
  flex-shrink: 0;
}

.income-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 600px) {
  .income-grid {
    grid-template-columns: 1fr;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 12px;
  font-weight: 400;
  color: var(--gray-mid);
  text-transform: uppercase;
  font-family: "Source Code Pro", monospace;
  letter-spacing: 1.2px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-mid);
  font-size: 14px;
  font-family: "Source Code Pro", monospace;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  padding: 12px 14px 12px 42px;
  color: var(--white-off);
  font-size: 16px;
  font-family: "Source Code Pro", monospace;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper input:focus {
  border-color: var(--border-light);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
}

.input-wrapper input::placeholder {
  color: var(--gray-dark);
}

.total-income-bar {
  margin-top: 24px;
  padding: 16px 20px;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-mid);
  border-radius: var(--radius);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-income-bar .label {
  font-size: 14px;
  color: var(--gray-light);
  font-weight: 400;
}

.total-income-bar .amount {
  font-size: 24px;
  font-weight: 400;
  color: var(--supabase-green);
  font-family: "Source Code Pro", monospace;
  line-height: 1.2;
}

.save-row {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.save-info {
  min-width: 0;
}

.save-status {
  font-size: 14px;
  font-weight: 500;
  color: var(--white-off);
}

.save-meta {
  margin-top: 4px;
  font-size: 12px;
  font-family: "Source Code Pro", monospace;
  color: var(--gray-mid);
}

.save-info.stale .save-status {
  color: var(--blue-accent);
}

.save-info.error .save-status {
  color: var(--crimson);
}

.btn-save {
  background: var(--bg-btn-primary);
  border: 1px solid var(--white-off);
  color: var(--white-off);
  border-radius: var(--radius-pill);
  padding: 8px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-save:hover:not(:disabled) {
  background: var(--white-off);
  color: var(--bg-btn-primary);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--border-mid);
  color: var(--gray-mid);
}

@media (max-width: 600px) {
  .save-row {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-save {
    width: 100%;
  }
}
</style>
