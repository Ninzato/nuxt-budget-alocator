<template>
  <div class="freelance-note">
    <span class="note-icon">💡</span>
    <div class="note-text">
      <strong>Catatan Freelance:</strong> Pendapatan freelance bervariasi setiap bulan. Kategori bertipe
      <strong>"% Gaji + Freelance"</strong> menghitung dari total pemasukan, sedangkan
      <strong>"% Gaji Pokok"</strong> hanya dari gaji.
    </div>
  </div>
</template>

<style scoped>
.freelance-note {
  background: rgba(253, 203, 110, 0.08);
  border: 1px solid rgba(253, 203, 110, 0.15);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.note-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.note-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.note-text strong {
  color: var(--orange);
}
</style>
