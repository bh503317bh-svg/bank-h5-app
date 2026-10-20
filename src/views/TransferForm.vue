<template>
  <div class="page no-tab">
    <van-nav-bar :title="pageTitle" left-arrow @click-left="$router.back()" />

    <van-form @submit="onSubmit" style="margin-top:12px">
      <van-cell-group inset>
        <van-field
          v-model="fromLabel"
          :label="t('transfer.from')"
          readonly
          is-link
          :placeholder="t('transfer.pickFrom')"
          @click="openPick('from')"
        />
        <van-field
          v-if="mode === 'self'"
          v-model="toLabel"
          :label="t('transfer.toSelfAcct')"
          readonly
          is-link
          required
          :placeholder="t('transfer.pickTo')"
          @click="openPick('to')"
        />
        <template v-else>
          <van-field
            v-model="beneficiaryName"
            :label="t('transfer.beneficiary')"
            :placeholder="t('transfer.beneficiaryPh')"
            required
          />
          <van-field
            v-model="toAccount"
            :label="mode === 'card' ? t('transfer.cardNoLabel') : t('transfer.to')"
            :placeholder="mode === 'card' ? t('transfer.cardPh') : t('transfer.toPh')"
            required
          />
        </template>
        <template v-if="needWire">
          <van-field
            v-model="swiftCode"
            :label="t('transfer.swift')"
            :placeholder="t('transfer.swiftPh')"
            required
          />
          <van-field
            v-model="routing"
            :label="t('transfer.routing')"
            :placeholder="t('transfer.routingPh')"
          />
          <van-field
            v-model="bankName"
            :label="t('transfer.bankName')"
            :placeholder="t('transfer.bankNamePh')"
          />
          <van-field
            v-model="bankCountry"
            :label="t('transfer.bankCountry')"
            placeholder="US"
          />
          <van-field
            v-model="bankAddress"
            :label="t('transfer.bankAddress')"
            :placeholder="t('transfer.bankAddressPh')"
          />
          <van-field
            v-model="remittanceInfo"
            :label="t('transfer.memo')"
            :placeholder="t('transfer.memoPh')"
          />
        </template>
        <van-field v-model="amount" :label="t('transfer.amount')" placeholder="10.00" />
      </van-cell-group>
      <div style="margin:24px 16px">
        <van-button round block type="primary" color="#0052d9" native-type="submit" :loading="loading">
          {{ t('transfer.confirmOut') }}
        </van-button>
      </div>
    </van-form>

    <van-action-sheet
      v-model:show="showPick"
      :actions="pickActions"
      :cancel-text="t('common.cancel')"
      close-on-click-action
      @select="onPick"
    />
    <PayPassword ref="payPwd" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { fetchHome, transfer } from '../api'
import PayPassword from '../components/PayPassword.vue'
import { pushNotice } from '../utils/local'

const { t } = useI18n()
const route = useRoute()
const mode = computed(() => String(route.query.mode || 'wire'))
const needWire = computed(() => mode.value === 'wire' || mode.value === 'other' || mode.value === 'card')

const pageTitle = computed(() => {
  if (mode.value === 'self') return t('transfer.toSelf')
  if (mode.value === 'other') return t('transfer.toOther')
  if (mode.value === 'card') return t('transfer.toCard')
  return t('transfer.hubWire')
})

const fromAccount = ref('')
const toAccount = ref('')
const amount = ref('10.00')
const beneficiaryName = ref('')
const swiftCode = ref('CHASUS33')
const routing = ref('021000021')
const bankName = ref('JPMorgan Chase Bank')
const bankCountry = ref('US')
const bankAddress = ref('')
const remittanceInfo = ref('')
const loading = ref(false)
const payPwd = ref(null)
const myAccounts = ref([])
const showPick = ref(false)
const pickTarget = ref('from')

function fmtBal(a) {
  const b = a?.balance ?? a?.available_balance
  if (b == null || b === '') return ''
  return ` · $${b}`
}

const fromLabel = computed(() => {
  const a = myAccounts.value.find((x) => x.account_no === fromAccount.value)
  if (!a) return fromAccount.value
  return `${a.account_no}${fmtBal(a)}`
})

const toLabel = computed(() => {
  const a = myAccounts.value.find((x) => x.account_no === toAccount.value)
  if (!a) return toAccount.value
  return `${a.account_no}${fmtBal(a)}`
})

const pickActions = computed(() => {
  const list = myAccounts.value.map((a) => ({
    name: `${a.account_no}${fmtBal(a)}`,
    subname: a.product_name || 'USD',
    account_no: a.account_no,
    disabled:
      (pickTarget.value === 'from' && a.account_no === toAccount.value) ||
      (pickTarget.value === 'to' && a.account_no === fromAccount.value)
  }))
  return list.length ? list : [{ name: t('transfer.noAccount'), disabled: true }]
})

function openPick(target) {
  if (!myAccounts.value.length) {
    showFailToast(t('transfer.noAccount'))
    return
  }
  pickTarget.value = target
  showPick.value = true
}

function onPick(action) {
  if (!action?.account_no || action.disabled) return
  if (pickTarget.value === 'from') {
    fromAccount.value = action.account_no
    if (mode.value === 'self' && fromAccount.value === toAccount.value) {
      const other = myAccounts.value.find((a) => a.account_no !== fromAccount.value)
      if (other) toAccount.value = other.account_no
    }
  } else {
    toAccount.value = action.account_no
  }
}

onMounted(async () => {
  const res = await fetchHome()
  if (res.code !== 0) return
  myAccounts.value = res.data.accounts || []
  if (myAccounts.value[0]) fromAccount.value = myAccounts.value[0].account_no
  beneficiaryName.value = res.data.user?.display_name || res.data.customer?.name || 'Beneficiary'

  if (mode.value === 'self') {
    const second = myAccounts.value.find((a) => a.account_no !== fromAccount.value)
    toAccount.value = second?.account_no || ''
    beneficiaryName.value = res.data.user?.display_name || beneficiaryName.value
    if (myAccounts.value.length < 2) {
      showFailToast(t('transfer.needTwoAccts'))
    }
  } else if (mode.value === 'card') {
    toAccount.value = '4242424242424242'
    beneficiaryName.value = 'Cardholder'
    bankName.value = 'Visa / Mastercard'
  } else {
    toAccount.value = 'DE89370400440532013000'
  }
})

async function onSubmit() {
  if (!fromAccount.value) {
    showFailToast(t('transfer.pickFrom'))
    return
  }
  if (mode.value === 'self') {
    if (!toAccount.value) {
      showFailToast(t('transfer.pickTo'))
      return
    }
    if (fromAccount.value === toAccount.value) {
      showFailToast(t('transfer.sameAccount'))
      return
    }
  } else if (!beneficiaryName.value.trim()) {
    showFailToast(t('transfer.needBeneficiary'))
    return
  }
  if (needWire.value && !swiftCode.value.trim()) {
    showFailToast(t('transfer.needSwift'))
    return
  }
  const pin = await payPwd.value.ask()
  if (!pin) return
  loading.value = true
  try {
    const transferType = mode.value === 'self' ? 'internal' : 'wire'
    const res = await transfer({
      from_account_no: fromAccount.value,
      to_account_no: toAccount.value,
      amount: amount.value,
      pay_password: pin,
      beneficiary_name: (mode.value === 'self' ? beneficiaryName.value : beneficiaryName.value).trim(),
      swift_code: transferType === 'wire' ? swiftCode.value.trim() : '',
      bank_name: bankName.value,
      bank_country: bankCountry.value,
      bank_address: bankAddress.value || `ABA ${routing.value}`,
      remittance_info: remittanceInfo.value || (mode.value === 'card' ? 'credit card repayment' : ''),
      transfer_type: transferType
    })
    if (res.code !== 0) {
      showFailToast(res.message || t('transfer.outFail'))
      return
    }
    pushNotice(t('transfer.outOk'), `${toAccount.value} ${amount.value}`)
    showSuccessToast(t('transfer.outOk'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.van-nav-bar) { background: #0052d9; }
:deep(.van-nav-bar__title), :deep(.van-nav-bar .van-icon) { color: #fff !important; }
:deep(.van-field__control) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
