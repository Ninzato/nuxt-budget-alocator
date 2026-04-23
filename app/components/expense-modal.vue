<script setup lang="ts">
import type { Category, CategoryType } from "~/composables/use-budget";

import { formatNumber } from "~/composables/use-budget";

const props = defineProps<{
  isOpen: boolean;
  editingCategory: Category | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [payload: Omit<Category, "id" | "deletable">];
}>();

const ICONS = [
  "i-lucide-home",
  "i-lucide-car",
  "i-lucide-smartphone",
  "i-lucide-coffee",
  "i-lucide-shopping-cart",
  "i-lucide-credit-card",
  "i-lucide-gift",
  "i-lucide-cat",
  "i-lucide-heart-handshake",
  "i-lucide-briefcase",
  "i-lucide-globe",
  "i-lucide-monitor",
  "i-lucide-wifi",
  "i-lucide-zap",
  "i-lucide-graduation-cap",
  "i-lucide-scissors",
  "i-lucide-umbrella",
  "i-lucide-train",
  "i-lucide-bus",
  "i-lucide-pizza",
  "i-lucide-music",
  "i-lucide-film",
  "i-lucide-tv",
  "i-lucide-dumbbell",
];

type FormState = {
  name: string;
  icon: string;
  type: CategoryType;
  rawValue: number;
};

const isEditing = computed(() => props.editingCategory !== null);

const errorMessage = ref("");

const form = reactive<FormState>({
  name: "",
  icon: "i-lucide-shopping-cart",
  type: "fixed",
  rawValue: 0,
});

const valueDisplay = computed(() =>
  form.rawValue ? formatNumber(form.rawValue) : "",
);

function onValueInput(event: Event) {
  errorMessage.value = "";
  const el = event.target as HTMLInputElement;
  const raw = el.value.replace(/\D/g, "");
  form.rawValue = raw ? Number.parseInt(raw) : 0;
  el.value = form.rawValue ? formatNumber(form.rawValue) : "";
}

// Clear error when user types in the name field
watch(() => form.name, () => {
  errorMessage.value = "";
});

// Sync form when the modal opens or editingCategory changes
watch(
  () => [props.isOpen, props.editingCategory] as const,
  ([open, cat]) => {
    errorMessage.value = "";
    if (!open)
      return;
    if (cat) {
      form.name = cat.name;
      form.icon = cat.icon || "i-lucide-circle";
      form.type = cat.type === "custom" ? "fixed" : (cat.type as CategoryType);
      form.rawValue = cat.type !== "custom" ? (cat.value ?? 0) : 0;
    }
    else {
      form.name = "";
      form.icon = "i-lucide-shopping-cart";
      form.type = "fixed";
      form.rawValue = 0;
    }
  },
  { immediate: true },
);

function handleSave() {
  if (!form.name.trim()) {
    errorMessage.value = "Masukkan nama kategori!";
    return;
  }
  if (form.type === "fixed" && form.rawValue <= 0) {
    errorMessage.value = "Masukkan jumlah yang valid!";
    return;
  }
  if (
    (form.type === "percent_gaji" || form.type === "percent_freelance")
    && (form.rawValue <= 0 || form.rawValue > 100)
  ) {
    errorMessage.value = "Masukkan persentase antara 1-100!";
    return;
  }
  errorMessage.value = "";

  emit("save", {
    name: form.name.trim(),
    icon: form.icon,
    type: form.type,
    value: form.rawValue,
  });
}
</script>

<template>
  <div
    class="modal-overlay"
    :class="{ active: isOpen }"
    @click.self="$emit('close')"
  >
    <div class="modal">
      <h2>
        <UIcon :name="isEditing ? 'i-lucide-pencil' : 'i-lucide-plus'" class="modal-title-icon" />
        {{ isEditing ? "Edit Kategori" : "Tambah Kategori" }}
      </h2>

      <div class="form-group">
        <label for="modal-name">Nama Kategori</label>
        <input
          id="modal-name"
          v-model="form.name"
          type="text"
          placeholder="Contoh: Transportasi"
        >
      </div>

      <div class="form-group">
        <label>Ikon</label>
        <div class="icon-picker-grid">
          <div
            v-for="ic in ICONS"
            :key="ic"
            class="icon-option"
            :class="{ selected: form.icon === ic }"
            @click="form.icon = ic"
          >
            <UIcon :name="ic" />
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="modal-type">Tipe</label>
        <select id="modal-type" v-model="form.type">
          <option value="fixed">
            Fixed (Jumlah Tetap)
          </option>
          <option value="percent_gaji">
            % dari Gaji Pokok
          </option>
          <option value="percent_freelance">
            % dari Freelance
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="modal-value">{{ form.type === "fixed" ? "Jumlah (Rp)" : "Persentase (%)" }}</label>
        <input
          id="modal-value"
          type="text"
          :value="valueDisplay"
          placeholder="0"
          @input="onValueInput"
        >
      </div>

      <div v-if="errorMessage" class="error-message">
        <UIcon name="i-lucide-alert-circle" />
        {{ errorMessage }}
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">
          Batal
        </button>
        <button class="btn-save" @click="handleSave">
          {{ isEditing ? "Perbarui" : "Simpan" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 15, 15, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-overlay.active {
  display: flex;
}

.modal {
  background: var(--bg-page);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-lg);
  padding: 32px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  animation: modal-in 0.2s ease;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal h2 {
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 24px;
  color: var(--white-off);
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title-icon {
  color: var(--gray-mid);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 400;
  font-family: "Source Code Pro", monospace;
  color: var(--gray-mid);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 8px;
}

.modal input,
.modal select {
  width: 100%;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  color: var(--white-off);
  font-size: 16px;
  font-family: "Source Code Pro", monospace;
  outline: none;
  transition: border-color 0.2s;
}

.modal input:focus,
.modal select:focus {
  border-color: var(--border-light);
}

.modal select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23898989' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
}

.modal select option {
  background: var(--bg-page);
  color: var(--white-off);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--crimson);
  background: rgba(255, 30, 86, 0.1);
  border: 1px solid rgba(255, 30, 86, 0.2);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: transparent;
  border: 1px solid var(--border-mid);
  border-radius: var(--radius-pill);
  color: var(--gray-light);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--border-subtle);
  color: var(--white-off);
}

.btn-save {
  flex: 1;
  padding: 12px;
  background: var(--bg-btn-primary);
  border: 1px solid var(--white-off);
  border-radius: var(--radius-pill);
  color: var(--white-off);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: var(--white-off);
  color: var(--bg-btn-primary);
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.icon-option {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--gray-mid);
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.icon-option:hover {
  border-color: var(--border-mid);
  color: var(--white-off);
}

.icon-option.selected {
  border-color: var(--supabase-green);
  color: var(--supabase-green);
  background: rgba(62, 207, 142, 0.1);
}
</style>
