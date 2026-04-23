<template>
  <header class="header">
    <div class="header-icon">
      <UIcon name="i-lucide-wallet" class="logo-icon" />
    </div>
    <h1>Perencana Keuangan</h1>
    <p>Atur pemasukan &amp; pengeluaran bulananmu</p>
  </header>
</template>

<style scoped>
.header {
  text-align: center;
  padding: 64px 0 48px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  background: var(--bg-btn-primary);
  border: 1px solid var(--border-dark);
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: var(--supabase-green);
}

.header h1 {
  font-size: 64px;
  line-height: 1.0;
  font-weight: 400;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
  color: var(--white-off);
}

.header p {
  color: var(--gray-light);
  font-size: 18px;
  line-height: 1.5;
  font-weight: 400;
}

@media (max-width: 600px) {
  .header {
    padding: 40px 0 32px;
  }
  
  .header h1 {
    font-size: 40px;
  }
}
</style>
