<script setup lang="ts">
import { formatNumber, formatRupiah } from "~/composables/use-budget";

const props = defineProps<{
  salary: number;
  freelance: number;
  totalIncome: number;
}>();

const emit = defineEmits<{
  "update:salary": [value: number];
  "update:freelance": [value: number];
}>();

const salaryDisplay = computed(() => (props.salary ? formatNumber(props.salary) : ""));
const freelanceDisplay = computed(() => (props.freelance ? formatNumber(props.freelance) : ""));

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
</style>
