import { SushiScenario } from './types';

export const SUSHI_SCENARIOS: SushiScenario[] = [
  {
    id: 'scenario_level_1',
    title: '第一關：新手試營運 - 接待與料理雙工協同',
    subtitle: '學習基礎多 Agent 職責分工與點餐工單傳遞',
    difficulty: 'Novice',
    description:
      '歡迎來到壽司物語 AI 實習餐廳！在本關中，你需要調教「服務接待員 阿葵」與「壽司大將 健次」。阿葵負責理解客人需求（包含忌口、不要芥末等客製化），並精準傳送工單給健次進行料理製作。',
    learningGoal:
      '1. 理解 Agent 角色專精化（Role-Based Specialization）。\n2. 透過 Prompt 讓接待員精準提取顧客意圖與特殊備註。\n3. 觀察 Agent 之間的工單流轉與非同步交付。',
    initialCash: 350,
    maxTicks: 120,
    targetServed: 8,
    targetRevenue: 200,
    targetSatisfaction: 4.2,
    customerArrivalRate: 0.12,
    specialRequestsFrequency: 0.25,
    initialStock: {
      rice: 40,
      salmon: 20,
      tuna: 15,
      nori: 30,
      wasabi: 25,
      avocado: 15,
      uni: 5,
      wagyu: 5
    },
    unlockedAgents: ['host', 'chef']
  },
  {
    id: 'scenario_level_2',
    title: '第二關：午間爆單潮 - 庫存採購與供需平衡',
    subtitle: '引入採購 Agent 蓮，動態預測食材缺口與補貨',
    difficulty: 'Intermediate',
    description:
      '中午尖峰用餐潮來臨！客流速度大幅提升，食材消耗極快。如果三文魚或醋飯見底，廚房將直接停擺引發顧客投訴。學生需要指揮「採購部長 蓮」，根據安全庫存門檻與預算動態向豐洲市場採購！',
    learningGoal:
      '1. 掌握供應鏈 Agent 與生產 Agent 的跨部門通訊（Inter-Agent Alert）。\n2. 在 Prompt 中設定安全庫存門檻（如低於 6 份時自動批發進貨）。\n3. 平衡現金流與缺貨風險，防止流動資金斷裂。',
    initialCash: 450,
    maxTicks: 150,
    targetServed: 14,
    targetRevenue: 480,
    targetSatisfaction: 4.3,
    customerArrivalRate: 0.18,
    specialRequestsFrequency: 0.35,
    initialStock: {
      rice: 25,
      salmon: 12,
      tuna: 10,
      nori: 20,
      wasabi: 15,
      avocado: 8,
      uni: 4,
      wagyu: 3
    },
    unlockedAgents: ['host', 'chef', 'inventory']
  },
  {
    id: 'scenario_level_3',
    title: '第三關：米其林暗訪與客製化危機',
    subtitle: '應對嚴苛美食評論家與複雜過敏忌口考驗',
    difficulty: 'Master',
    description:
      '店裡迎來了知名米其林神秘客 VIP，同時還有素食主義者與生魚過敏顧客！「店長 櫻」必須全面介入，統籌全場節奏、監督出餐品質，並授權優先插單處理 VIP 貴賓！',
    learningGoal:
      '1. 多 Agent 複雜情境下的優先級排隊與動態插單調度。\n2. 意圖邊界識別：嚴格過濾葷素與過敏源。\n3. 店長 Agent 的全局品質監控與客訴仲裁能力。',
    initialCash: 600,
    maxTicks: 180,
    targetServed: 18,
    targetRevenue: 750,
    targetSatisfaction: 4.6,
    customerArrivalRate: 0.22,
    specialRequestsFrequency: 0.55,
    initialStock: {
      rice: 40,
      salmon: 18,
      tuna: 16,
      uni: 8,
      wagyu: 8,
      nori: 35,
      wasabi: 25,
      avocado: 16
    },
    unlockedAgents: ['host', 'chef', 'inventory', 'manager']
  },
  {
    id: 'scenario_sandbox',
    title: '自由經營沙盒模式 (Infinite Sandbox)',
    subtitle: '完全自由調校所有 Agent，挑戰無上限營運指標',
    difficulty: 'Sandbox',
    description:
      '無時間上限的自由沙盒環境。你可以自由測試不同的 Prompt 策略：無論是極限效率翻台流、尊榮米其林無菜單流，還是極致節儉成本流，看看你的 AI 團隊能創造多高的營收！',
    learningGoal:
      '開放性實驗環境，探索不同 Prompt 組合在長期商業模擬中的穩定性與多 Agent 協同上限。',
    initialCash: 800,
    maxTicks: 9999,
    targetServed: 50,
    targetRevenue: 2500,
    targetSatisfaction: 4.5,
    customerArrivalRate: 0.16,
    specialRequestsFrequency: 0.4,
    initialStock: {
      rice: 60,
      salmon: 30,
      tuna: 25,
      uni: 15,
      wagyu: 15,
      nori: 50,
      wasabi: 40,
      avocado: 25
    },
    unlockedAgents: ['host', 'chef', 'inventory', 'manager']
  }
];
