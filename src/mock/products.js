/** Product shells; localized fields resolved via i18n keys in views. */
export const accountProductsMeta = [
  { id: 'hqPlus', vanIcon: 'gold-coin-o', color: '#4c8dff', rate: '4.85%', key: 'products.hqPlus' },
  { id: 'hqPlusX', vanIcon: 'diamond-o', color: '#ff8a3d', rate: '5.20%', key: 'products.hqPlusX', hasTag: true },
  { id: 'gsPlus', vanIcon: 'chart-trending-o', color: '#f25c54', rate: '4.12%', key: 'products.gsPlus' }
]

export const wealthProductMeta = [
  { id: 'w1', rate: '4.65%', key: 'products.w1' },
  { id: 'w2', rate: '18.40%', key: 'products.w2' }
]

/** pop: higher = more popular; sector used by Hot Sectors tab */
export const fundMeta = [
  { id: 'f1', ticker: 'IBB', w1: '2.62%', y1: '23.46%', pop: 98, sector: 'biotech', key: 'products.f1' },
  { id: 'f2', ticker: 'QQQ', w1: '-2.60%', y1: '18.20%', pop: 96, sector: 'tech', key: 'products.f2' },
  { id: 'f3', ticker: 'VIG', w1: '1.12%', y1: '9.87%', pop: 88, sector: 'dividend', key: 'products.f3' },
  { id: 'f4', ticker: 'SPY', w1: '-0.41%', y1: '22.10%', pop: 95, sector: 'broad', key: 'products.f4' },
  { id: 'f5', ticker: 'XLK', w1: '-1.80%', y1: '28.55%', pop: 90, sector: 'tech', key: 'products.f5' },
  { id: 'f6', ticker: 'XLV', w1: '1.05%', y1: '12.40%', pop: 82, sector: 'healthcare', key: 'products.f6' },
  { id: 'f7', ticker: 'GLD', w1: '0.88%', y1: '31.20%', pop: 85, sector: 'gold', key: 'products.f7' },
  { id: 'f8', ticker: 'TLT', w1: '-0.55%', y1: '-2.10%', pop: 70, sector: 'bond', key: 'products.f8' },
  { id: 'f9', ticker: 'ARKK', w1: '3.40%', y1: '15.80%', pop: 78, sector: 'tech', key: 'products.f9' },
  { id: 'f10', ticker: 'VTI', w1: '-0.30%', y1: '20.05%', pop: 92, sector: 'broad', key: 'products.f10' }
]

export const mockCardMeta = [
  {
    id: 'chase',
    nameKey: 'cards.chase',
    networkKey: 'cards.networkVisa',
    masked: '**** **** **** 4242',
    color: 'linear-gradient(135deg,#0d47a1,#1565c0)'
  },
  {
    id: 'boa',
    nameKey: 'cards.boa',
    networkKey: 'cards.networkMc',
    masked: '**** **** **** 1881',
    color: 'linear-gradient(135deg,#b71c1c,#e53935)'
  }
]

export function localizeAccountProducts(t) {
  return accountProductsMeta.map((p) => ({
    ...p,
    name: t(`${p.key}.name`),
    desc: t(`${p.key}.desc`),
    rateLabel: t(`${p.key}.rateLabel`),
    tag: p.hasTag ? t(`${p.key}.tag`) : ''
  }))
}

export function localizeWealthProducts(t) {
  return wealthProductMeta.map((p) => ({
    ...p,
    org: t(`${p.key}.org`),
    name: t(`${p.key}.name`),
    tag: t(`${p.key}.tag`),
    rateLabel: t(`${p.key}.rateLabel`),
    hold: t(`${p.key}.hold`),
    risk: t(`${p.key}.risk`),
    tip: t(`${p.key}.tip`)
  }))
}

export function localizeFunds(t) {
  return fundMeta.map((p) => ({
    ...p,
    name: t(`${p.key}.name`),
    tag: t(`${p.key}.tag`)
  }))
}

export function wealthCategories(t) {
  return [
    { name: t('wealth.catGs'), tone: '#ff8a3d', icon: 'coupon-o' },
    { name: t('wealth.catStable'), tone: '#4c8dff', icon: 'shield-o' },
    { name: t('wealth.catFund'), tone: '#00a870', icon: 'chart-trending-o' },
    { name: t('wealth.catHigh'), tone: '#8b5cf6', icon: 'fire' },
    { name: t('wealth.catDeposit'), tone: '#2563eb', icon: 'balance-o' }
  ]
}

export function fundEntryRows(entries) {
  const e = Array.isArray(entries) ? entries : []
  return [e.slice(0, 5), e.slice(5, 10)]
}

export const SECTOR_KEYS = ['tech', 'biotech', 'healthcare', 'gold', 'bond', 'dividend', 'broad']
