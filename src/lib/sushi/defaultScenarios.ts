import { SushiScenario } from './types';

export const SUSHI_SCENARIOS: SushiScenario[] = [
  {
    id: 'scenario_level_1',
    title: '第一關：新手試營運 - 接待與料理雙工協同',
    subtitle: '學習基礎多 Agent 職責分工與客製化忌口傳遞',
    difficulty: 'Novice',
    description:
      '歡迎來到壽司物語 AI 實習餐廳！在本關中，你需要調教「服務接待員 阿葵」與「壽司大將 健次」。注意：客人有嚴格忌口（如不要芥末、素食），若阿葵未在 Prompt 提取備註，或健次未遵守忌口，顧客將留下 1 顆星負評；滿意度低於 3.0 即 Game Over 停業！',
    learningGoal:
      '1. 在阿葵 Prompt 補充【忌口/備忘/備註】指令，提取特殊需求。\n2. 在健次 Prompt 補充【遵守/不要芥末/嚴格】指令，客製化出餐。\n3. 注意顧客耐心已緊縮至 44 刻度，考驗出餐節奏。',
    initialCash: 260,
    maxTicks: 120,
    targetServed: 10,
    targetRevenue: 240,
    targetSatisfaction: 4.2,
    customerArrivalRate: 0.18,
    specialRequestsFrequency: 0.38,
    initialStock: {
      rice: 14,
      salmon: 7,
      tuna: 5,
      nori: 10,
      wasabi: 8,
      avocado: 5,
      uni: 0,
      wagyu: 0
    },
    unlockedAgents: ['host', 'chef']
  },
  {
    id: 'scenario_level_2',
    title: '第二關：午間爆單潮 - 庫存採購與防破產控管',
    subtitle: '引入採購 Agent 蓮，平衡安全庫存與現金流生命線',
    difficulty: 'Intermediate',
    description:
      '午間尖峰爆單潮來臨！初始食材極度吃緊（鮭魚僅 6 份、醋飯僅 12 份），若不及時補貨後廚將停工；但若蓮盲目採購昂貴和牛或海膽，資金將快速見底（赤字 < $0 即破產 Game Over）！學生必須為蓮編寫精密的安全庫存與預算防破產提示詞。',
    learningGoal:
      '1. 在蓮 Prompt 設定安全庫存門檻（如低於 6 份時補貨）。\n2. 在蓮 Prompt 明確加入【預算/防破產/節約】指令，避免流動資金崩潰。\n3. 定期面臨固定店租水電支出，考驗收支平衡。',
    initialCash: 320,
    maxTicks: 150,
    targetServed: 16,
    targetRevenue: 520,
    targetSatisfaction: 4.3,
    customerArrivalRate: 0.24,
    specialRequestsFrequency: 0.45,
    initialStock: {
      rice: 12,
      salmon: 6,
      tuna: 5,
      nori: 10,
      wasabi: 8,
      avocado: 4,
      uni: 1,
      wagyu: 1
    },
    unlockedAgents: ['host', 'chef', 'inventory']
  },
  {
    id: 'scenario_level_3',
    title: '第三關：米其林暗訪與客製化危機',
    subtitle: '四 Agent 全員實時聯動，應對嚴苛米其林神秘客與極限客流',
    difficulty: 'Master',
    description:
      '店裡迎來了知名米其林神秘客 VIP（耐心僅 34 刻度），同時湧入大量素食與忌口食客！「店長 櫻」必須全面介入，統籌全場節奏；阿葵優先引導 VIP，健次進行批次加速與 VIP 插單，蓮謹慎控管現金，櫻隨時進行客訴撫慰。任何環節失守，口碑或財務都將面臨滅頂之災！',
    learningGoal:
      '1. 阿葵與健次 Prompt：加入【VIP/優先/加急】與【批次製作】。\n2. 蓮 Prompt：嚴格【預算/防破產】確保現金流安全。\n3. 櫻 Prompt：啟動【安撫/客訴/抹茶】在食客不滿時主動撫平危機。',
    initialCash: 380,
    maxTicks: 180,
    targetServed: 20,
    targetRevenue: 780,
    targetSatisfaction: 4.6,
    customerArrivalRate: 0.28,
    specialRequestsFrequency: 0.65,
    initialStock: {
      rice: 16,
      salmon: 8,
      tuna: 6,
      uni: 2,
      wagyu: 2,
      nori: 12,
      wasabi: 10,
      avocado: 6
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
