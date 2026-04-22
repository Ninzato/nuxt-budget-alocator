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

const EMOJIS = [
  "🏠",
  "🍔",
  "🚗",
  "📱",
  "💊",
  "🎮",
  "👕",
  "📚",
  "✈️",
  "🎁",
  "💡",
  "🐱",
  "💰",
  "🏥",
  "☕",
  "🎬",
  "🛒",
  "💳",
  "📦",
  "🎯",
  "🏋️",
  "🎵",
  "🧹",
  "🔧",
  "👶",
  "🐶",
  "🌐",
  "💻",
  "📝",
  "🎓",
  "🏦",
  "⛽",
];

type FormState = {
  name: string;
  emoji: string;
  type: CategoryType;
  rawValue: number;
};

const isEditing = computed(() => props.editingCategory !== null);

const errorMessage = ref("");

const form = reactive<FormState>({
  name: "",
  emoji: "📦",
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
      form.emoji = cat.emoji;
      form.type = cat.type === "custom" ? "fixed" : (cat.type as CategoryType);
      form.rawValue = cat.type !== "custom" ? (cat.value ?? 0) : 0;
    }
    else {
      form.name = "";
      form.emoji = "📦";
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
    (form.type === "percent_gaji" || form.type === "percent_total")
    && (form.rawValue <= 0 || form.rawValue > 100)
  ) {
    errorMessage.value = "Masukkan persentase antara 1-100!";
    return;
  }
  errorMessage.value = "";

  emit("save", {
    name: form.name.trim(),
    emoji: form.emoji,
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
      <h2>{{ isEditing ? "✏️ Edit Kategori Pengeluaran" : "➕ Tambah Kategori Pengeluaran" }}</h2>

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
        <label>Emoji</label>
        <div class="emoji-picker-grid">
          <div
            v-for="em in EMOJIS"
            :key="em"
            class="emoji-option"
            :class="{ selected: form.emoji === em }"
            @click="form.emoji = em"
          >
            {{ em }}
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
          <option value="percent_total">
            % dari Gaji + Freelance
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
        ⚠️ {{ errorMessage }}
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
  background: rgba(0, 0, 0, 0.6);
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
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 28px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
  animation: modal-in 0.25s ease;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal h2 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.modal input,
.modal select {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.modal input:focus,
.modal select:focus {
  border-color: var(--accent);
}

.modal select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%239ca3b8'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.modal select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.error-message {
  font-size: 13px;
  color: var(--red-light);
  background: rgba(225, 112, 85, 0.08);
  border: 1px solid rgba(225, 112, 85, 0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-cancel {
  flex: 1;
  padding: 11px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: var(--bg-primary);
}

.btn-save {
  flex: 1;
  padding: 11px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: var(--accent-light);
}

.emoji-picker-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-top: 6px;
}

.emoji-option {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: var(--bg-input);
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.emoji-option:hover {
  background: var(--bg-primary);
}

.emoji-option.selected {
  border-color: var(--accent);
  background: rgba(108, 92, 231, 0.15);
}
</style>
