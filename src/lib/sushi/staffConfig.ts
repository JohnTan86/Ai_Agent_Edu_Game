/**
 * Staff hiring roster, roles, and economics for SushiFlow
 */

export type StaffRole = 'waiter' | 'chef' | 'logistics';

export interface StaffCandidate {
  id: string;
  name: string;
  role: StaffRole;
  roleTitle: string;
  avatar: string;
  hireCost: number;       // One-off onboarding recruitment cost ($)
  wagePer10Ticks: number; // Recurring operational payroll cost every 10 ticks ($)
  perks: string;
  description: string;
}

export const AVAILABLE_STAFF_CANDIDATES: StaffCandidate[] = [
  {
    id: 'staff_waiter_momo',
    name: '小桃 (Momo)',
    role: 'waiter',
    roleTitle: '活力外場接待生',
    avatar: '👧',
    hireCost: 80,
    wagePer10Ticks: 6,
    perks: '雙線迎賓送餐：外場每輪可額外同時引導入座與端餐 1 組顧客',
    description: '笑容滿面的元氣兼職生，極大緩解外場阿葵的排隊壓力和端餐塞車。'
  },
  {
    id: 'staff_waiter_yuki',
    name: '小雪 (Yuki)',
    role: 'waiter',
    roleTitle: '資深禮儀管家',
    avatar: '👩‍🦰',
    hireCost: 120,
    wagePer10Ticks: 9,
    perks: '閃電結帳翻台：顧客用餐結束後立即清桌結帳，翻台率顯著提升',
    description: '擁有一流日料餐廳外場禮儀，動作俐落，大幅縮短顧客佔桌結帳時間。'
  },
  {
    id: 'staff_chef_shota',
    name: '匠太 (Shota)',
    role: 'chef',
    roleTitle: '壽司刀工二廚',
    avatar: '🧑‍🍳',
    hireCost: 110,
    wagePer10Ticks: 8,
    perks: '刀工輔助：後廚壽司製作耗時縮短 25%，解鎖雙料理台極速並行',
    description: '師承築地名師的年輕二廚，切魚俐落，能大幅分擔健次捏壽司的時間。'
  },
  {
    id: 'staff_chef_daiki',
    name: '大輝 (Daiki)',
    role: 'chef',
    roleTitle: '炙燒料理大廚',
    avatar: '👨‍🍳',
    hireCost: 150,
    wagePer10Ticks: 12,
    perks: '雙台極速暴風出餐：工單製作效率提升 35%，優先消化多品項大單',
    description: '五年資歷的熟練壽司匠人，專精火候與炙燒，可穩定扛住尖峰出餐暴單。'
  },
  {
    id: 'staff_logistics_takuya',
    name: '拓也 (Takuya)',
    role: 'logistics',
    roleTitle: '豐洲食材理貨員',
    avatar: '🧑‍💼',
    hireCost: 75,
    wagePer10Ticks: 5,
    perks: '產地直採議價：食材進貨成本享受 10% 批發折扣，降低浪費損耗',
    description: '在豐洲魚市擁有良好人脈的採購助理，協助蓮嚴控食材新鮮度與進貨支出。'
  }
];

export interface MarketCondition {
  id: string;
  title: string;
  emoji: string;
  description: string;
  arrivalMultiplier: number;
  vipChanceBonus: number;
  tipMultiplier: number;
}

export const DAILY_MARKET_CONDITIONS: MarketCondition[] = [
  {
    id: 'market_standard',
    title: '標準晴朗工作日',
    emoji: '☀️',
    description: '客流規律，午市與晚市皆有穩定客群進店用餐。',
    arrivalMultiplier: 1.0,
    vipChanceBonus: 0.0,
    tipMultiplier: 1.0
  },
  {
    id: 'market_festival',
    title: '鄰近商圈美食祭典',
    emoji: '🏮',
    description: '周邊舉辦傳統夏日祭典！客流大幅激增 (+50%)，排隊隊列迅速爆滿，極度考驗出餐節奏！',
    arrivalMultiplier: 1.5,
    vipChanceBonus: 0.1,
    tipMultiplier: 1.2
  },
  {
    id: 'market_rainy',
    title: '陰雨寒流降溫天',
    emoji: '🌧️',
    description: '戶外細雨綿綿，自來客流稍降 (-25%)，但進店客人喜好精緻美食，小費更為豐厚！',
    arrivalMultiplier: 0.75,
    vipChanceBonus: 0.05,
    tipMultiplier: 1.35
  },
  {
    id: 'market_michelin_week',
    title: '米其林指南探店週',
    emoji: '👑',
    description: '各大美食名家與神秘稽查員高頻巡訪 (VIP 機率翻倍)！嚴格考驗客製化忌口與極致手藝！',
    arrivalMultiplier: 1.2,
    vipChanceBonus: 0.25,
    tipMultiplier: 1.5
  },
  {
    id: 'market_friday_rush',
    title: '週五下班犒賞狂歡',
    emoji: '🍻',
    description: '上班族聚餐狂潮！午間快節奏速食、晚間海鮮大單頻出，考驗後廚大批量批次出餐！',
    arrivalMultiplier: 1.4,
    vipChanceBonus: 0.12,
    tipMultiplier: 1.25
  }
];
