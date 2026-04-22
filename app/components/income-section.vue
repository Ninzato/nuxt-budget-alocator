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
        Simpan
      </button>
    </div>
  </div>
</template>

<style scoped>
.income-section {
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
  background: var(--accent);
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
  gap: 6px;
}

.input-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 12px 12px 42px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-wrapper input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
  font-weight: 400;
}

.total-income-bar {
  margin-top: 20px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05));
  border: 1px solid rgba(108, 92, 231, 0.2);
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-income-bar .label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.total-income-bar .amount {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent-light);
}

.save-row {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.save-info {
  min-width: 0;
}

.save-status {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.save-meta {
  margin-top: 2px;
  font-size: 12px;
  color: var(--text-muted);
}

.save-info.stale .save-status {
  color: var(--orange);
}

.save-info.error .save-status {
  color: var(--red-light);
}

.btn-save {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-save:hover:not(:disabled) {
  background: var(--accent-light);
  border-color: var(--accent-light);
}

.btn-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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
