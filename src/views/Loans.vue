<template>
  <div class="page no-tab loans">
    <van-nav-bar :title="t('loans.title')" left-arrow @click-left="$router.back()" />

    <div class="wb-card summary">
      <div class="muted">{{ t('loans.outstanding') }}</div>
      <div class="num">{{ money(dash?.outstanding_principal || '0.00') }}</div>
      <div class="muted">{{ t('loans.activeCount', { n: dash?.active_loans ?? 0 }) }}</div>
    </div>

    <div class="section-hd"><span>{{ t('loans.products') }}</span></div>
    <div class="wb-card list">
      <div v-for="p in products" :key="p.product_id" class="item" @click="apply(p)">
        <div class="row1">
          <span class="name">{{ p.name }}</span>
          <span class="tag">{{ p.risk_level }}</span>
        </div>
        <div class="row2">
          <div>
            <div class="rate">{{ p.annual_rate }}</div>
            <div class="muted">{{ t('loans.rateLabel') }}</div>
          </div>
          <div class="right muted">{{ p.min_amount }} - {{ p.max_amount }}</div>
        </div>
      </div>
    </div>

    <div class="section-hd"><span>{{ t('loans.myLoans') }}</span></div>
    <div class="wb-card list">
      <div v-if="!loans.length" class="empty">{{ t('loans.empty') }}</div>
      <div v-for="l in loans" :key="l.loan_id" class="item">
        <div class="row1">
          <span class="name">{{ l.loan_id.slice(0, 14) }}…</span>
          <span class="tag">{{ l.status }}</span>
        </div>
        <div class="row2">
          <div>
            <div class="rate">{{ money(l.outstanding_principal) }}</div>
            <div class="muted">{{ t('loans.leftPrincipal') }}</div>
          </div>
          <van-button
            v-if="l.status === 'active' || l.status === 'overdue'"
            size="small"
            color="#0052d9"
            round
            @click="repay(l)"
          >{{ t('loans.repay') }}</van-button>
        </div>
      </div>
    </div>
    <PayPassword ref="payPwd" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showConfirmDialog, showFailToast, showSuccessToast } from 'vant'
import { fetchLoanDashboard, fetchLoanProducts, loanApply, loanRepay } from '../api'
import PayPassword from '../components/PayPassword.vue'
import { money } from '../utils'

const { t } = useI18n()
const products = ref([])
const loans = ref([])
const dash = ref(null)
const payPwd = ref(null)

async function load() {
  const [p, d] = await Promise.all([fetchLoanProducts(), fetchLoanDashboard()])
  if (p.code === 0) products.value = (p.data?.items || []).slice(0, 8)
  if (d.code === 0) {
    dash.value = d.data
    loans.value = d.data?.loans || []
  }
}

async function apply(p) {
  try {
    await showConfirmDialog({
      title: t('loans.applyTitle'),
      message: t('loans.applyMsg', { name: p.name, amount: '2000' }),
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    })
  } catch {
    return
  }
  const pin = await payPwd.value.ask()
  if (!pin) return
  const term = (p.term_months_options || [6])[0]
  const res = await loanApply({
    product_id: p.product_id,
    amount: '2000',
    term_months: term,
    purpose: 'electronics',
    monthly_income: '15000',
    industry: 'IT',
    city_tier: 'T2',
    pay_password: pin
  })
  if (res.code !== 0) {
    showFailToast(res.message || t('loans.applyFail'))
    return
  }
  showSuccessToast(t('loans.applyOk'))
  await load()
}

async function repay(l) {
  try {
    await showConfirmDialog({
      title: t('loans.repayTitle'),
      message: t('loans.repayMsg', { amount: '100' }),
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    })
  } catch {
    return
  }
  const pin = await payPwd.value.ask()
  if (!pin) return
  const res = await loanRepay({ loan_id: l.loan_id, amount: '100', pay_password: pin })
  if (res.code !== 0) {
    showFailToast(res.message || t('loans.repayFail'))
    return
  }
  showSuccessToast(t('loans.repayOk'))
  await load()
}

onMounted(load)
</script>

<style scoped>
:deep(.van-nav-bar) { background: #0052d9; }
:deep(.van-nav-bar__title), :deep(.van-nav-bar .van-icon) { color: #fff !important; }
.loans { padding-bottom: 24px; }
.summary { margin: 12px; padding: 16px; }
.num { font-size: 28px; font-weight: 800; margin: 6px 0; }
.list { margin: 0 12px; padding: 4px 12px; }
.item { padding: 14px 0; border-bottom: 1px solid #f0f2f5; }
.item:last-child { border-bottom: none; }
.row1 { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
.name { font-weight: 600; font-size: 14px; }
.tag { font-size: 10px; color: #ff6b00; background: #fff1e6; border-radius: 4px; padding: 1px 6px; }
.row2 { margin-top: 8px; display: flex; justify-content: space-between; align-items: center; }
.rate { color: #e34d59; font-size: 18px; font-weight: 700; }
.muted { color: #8a8f99; font-size: 12px; }
.right { text-align: right; }
.empty { padding: 18px 0; text-align: center; color: #999; font-size: 13px; }
</style>
