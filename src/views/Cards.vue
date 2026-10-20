<template>
  <div class="page no-tab cards-page">
    <van-nav-bar :title="t('cards.title')" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="service-o" size="18" @click="showService = true" />
      </template>
    </van-nav-bar>

    <div class="tip-box">
      <div class="tip-title">{{ t('cards.tipTitle') }} <van-icon name="info-o" /></div>
      <div class="tip-sub">{{ t('cards.tipSub') }}</div>
    </div>

    <div class="card-list">
      <div class="bank-card wecode">
        <div class="bc-top">
          <div>
            <div class="bc-name">{{ t('cards.wecodeName') }}</div>
            <div class="bc-type">{{ t('cards.debit') }}</div>
          </div>
          <div class="union">{{ t('cards.networkVisa') }}</div>
        </div>
        <div class="bc-no">{{ maskedMain }}</div>
        <div class="bc-action" @click="copyMain">{{ t('cards.copy') }}</div>
      </div>

      <div v-for="c in allCards" :key="c.id" class="bank-card" :style="{ background: c.color }">
        <div class="bc-top">
          <div>
            <div class="bc-name">{{ c.name }}</div>
            <div class="bc-type">{{ t('cards.debit') }}</div>
          </div>
          <div class="union">{{ c.network }}</div>
        </div>
        <div class="bc-no">{{ c.masked }}</div>
      </div>
    </div>

    <div class="safe-bottom-btn">
      <van-button block round plain type="primary" color="#0052d9" @click="showAdd = true">
        {{ t('cards.add') }}
      </van-button>
    </div>

    <van-dialog v-model:show="showAdd" :title="t('cards.add')" show-cancel-button @confirm="onAdd">
      <van-field v-model="form.bank" :label="t('cards.bankName')" :placeholder="t('cards.bankPh')" />
      <van-field v-model="form.number" type="digit" maxlength="16" :label="t('cards.cardNo')" :placeholder="t('cards.cardPh')" />
    </van-dialog>

    <van-dialog v-model:show="showService" :title="t('common.service')" :confirm-button-text="t('common.confirm')">
      <div class="svc">{{ t('cards.serviceBody') }}</div>
    </van-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showFailToast, showSuccessToast } from 'vant'
import { fetchHome } from '../api'
import { mockCardMeta } from '../mock/products'
import { addExtraCard, getExtraCards, pushNotice } from '../utils/local'
import { maskAccount } from '../utils'

const { t } = useI18n()
const mainNo = ref('')
const showAdd = ref(false)
const showService = ref(false)
const extra = ref([])
const form = reactive({ bank: 'Wells Fargo', number: '' })

const maskedMain = computed(() => maskAccount(mainNo.value || '0000'))

const allCards = computed(() => {
  const seeded = mockCardMeta.map((c) => ({
    id: c.id,
    name: t(c.nameKey),
    network: t(c.networkKey),
    masked: c.masked,
    color: c.color
  }))
  return [...extra.value, ...seeded]
})

async function copyMain() {
  try {
    await navigator.clipboard.writeText(mainNo.value)
    showSuccessToast(t('common.copyOk'))
  } catch {
    showSuccessToast(mainNo.value || '-')
  }
}

function onAdd() {
  const num = form.number.replace(/\D/g, '')
  if (num.length < 12) {
    showFailToast(t('cards.cardInvalid'))
    return false
  }
  const id = 'u_' + Date.now()
  const masked = `**** **** **** ${num.slice(-4)}`
  addExtraCard({
    id,
    name: form.bank || 'US Bank',
    network: t('cards.networkVisa'),
    masked,
    full: num.replace(/(\d{4})(?=\d)/g, '$1 ').trim(),
    color: 'linear-gradient(135deg,#37474f,#546e7a)'
  })
  extra.value = getExtraCards()
  pushNotice(t('cards.addOk'), form.bank)
  form.number = ''
  showSuccessToast(t('cards.addOk'))
}

onMounted(async () => {
  extra.value = getExtraCards()
  const res = await fetchHome()
  if (res.code === 0) mainNo.value = res.data?.accounts?.[0]?.account_no || ''
})
</script>

<style scoped>
:deep(.van-nav-bar) { background: #0052d9; }
:deep(.van-nav-bar__title),
:deep(.van-nav-bar .van-icon) { color: #fff !important; }
.tip-box { background: #fff; padding: 14px 16px; }
.tip-title { font-size: 14px; font-weight: 600; }
.tip-sub { margin-top: 6px; font-size: 12px; color: #8a8f99; line-height: 1.5; }
.card-list { padding: 12px 16px 80px; }
.bank-card {
  border-radius: 14px; color: #fff; padding: 16px; margin-bottom: 12px;
  min-height: 140px; position: relative;
  box-shadow: 0 8px 20px rgba(0,0,0,.12);
}
.bank-card.wecode { background: linear-gradient(135deg, #0052d9, #2f7bff); }
.bc-top { display: flex; justify-content: space-between; }
.bc-name { font-size: 15px; font-weight: 600; }
.bc-type { margin-top: 4px; font-size: 12px; opacity: .85; }
.union { opacity: .55; font-size: 12px; }
.bc-no { margin-top: 28px; font-size: 20px; letter-spacing: 2px; font-weight: 600; }
.bc-action {
  position: absolute; right: 16px; bottom: 16px;
  font-size: 12px; opacity: .95; border: 1px solid rgba(255,255,255,.5);
  border-radius: 12px; padding: 2px 8px;
}
.svc { padding: 16px; font-size: 14px; color: #333; line-height: 1.6; }
</style>
