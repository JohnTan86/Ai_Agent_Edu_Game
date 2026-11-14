'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SushiLanguage = 'zh-TW' | 'en' | 'zh-CN';

export interface TranslationDictionary {
  [key: string]: string;
}

export const TRANSLATIONS: Record<SushiLanguage, TranslationDictionary> = {
  'zh-TW': {
    // Top Bar Brand & Navigation
    brandTitle: '壽司物語 AI',
    brandSub: 'SushiFlow Multi-Agent',
    lobby: '大廳',
    roboflow: 'RoboFlow 派單',
    multiAgentBadge: 'Multi-Agent',
    gameOverBadge: '💀 GAME OVER',
    scenarioSelectLabel: '關卡選擇',

    // Live KPI Badges
    cashBalance: '結餘現金',
    bankrupt: '破產',
    urgent: '告急',
    totalRevenue: '累積營業額',
    satisfaction: '滿意度',
    csatDanger: '危險',
    csatCrash: '崩盤',
    servedTarget: '已接待 / 目標',
    dayClock: '第 {day} 天 • {time}',
    marketCondition: '市場行情',

    // Shift Phases
    shiftMorning: '早班備料',
    shiftLunch: '午間營運',
    shiftRush: '尖峰爆單',
    shiftAfternoon: '午後微憩',
    shiftDinner: '晚市客流',
    shiftClosed: '收工打烊',

    // Action Controls
    startNextDay: '開啟第 {day} 天 (11:00 AM)',
    startNextDayShort: '第 {day} 天開工',
    staff: '員工',
    rushHour: '爆單潮',
    addCustomer: '+顧客',
    addVip: '+VIP',
    burst: '吸客潮',
    burstTooltip: '發動街頭吸客潮 (一次湧入 3 位顧客！考驗翻台速度，滿意度下滑有 Game Over 風險！)',
    addTable: '增設餐桌',
    addTableShort: '+餐桌',
    tableFull: '席位已滿',
    branchMap: '開設新分店',
    branchMapShort: '連鎖地圖',
    branchCount: '{count} 店',
    play: '開始運行 (空白鍵)',
    pause: '暫停 (空白鍵)',
    step: '單步前進 1 刻度',
    speed: '{spd}x 速度',
    reset: '重設當前關卡',
    soundOn: '音效已開啟',
    soundOff: '音效已靜音',
    report: '查看經營評分報告',
    guide: '多 Agent 教學指南',
    language: '語言 / Language',

    // Multi-Agent Workspace (Left Column)
    masConsole: 'AI Agent 控制中樞 (MAS Console)',
    architecture4: '4-Agent 協同架構',
    tabPrompt: 'System Prompt',
    tabTools: '工具清單 ({count})',
    tabModel: '模型與參數',
    quickPresets: '快速策略模板 (Quick Strategy)',
    customPromptTitle: '自訂系統提示詞 (System Prompt)',
    promptPlaceholder: '請在此輸入指導該 Agent 的提示詞...',
    runManualTurn: '單步 Agent 思考 (Run Turn)',
    agentExecuting: 'Agent 思考中...',
    llmProvider: '推論引擎提供商 (LLM Provider)',
    modelIdentifier: '模型名稱 (Model Identifier)',
    temperature: '思考創意度 (Temperature)',
    strictMode: '精準守紀 (0.0)',
    creativeMode: '靈活創新 (1.0)',
    apiKeyLabel: 'API 金鑰 (自訂模型服務)',
    apiKeyPlaceholder: '可留空使用本地啟發式引擎，或輸入 API 金鑰',

    // Agent Roles & Titles
    roleAoi: '阿葵 (Aoi)',
    roleKenji: '健次 (Kenji)',
    roleRen: '蓮 (Ren)',
    roleSakura: '櫻 (Sakura)',
    titleAoi: '首席服務接待員 (Front-of-House Host)',
    titleKenji: '壽司料理長 (Master Sushi Chef)',
    titleRen: '採購與庫存主管 (Procurement & Inventory Lead)',
    titleSakura: '營運店長 (Restaurant GM & Auditor)',

    // Restaurant View & 2D Canvas (Center Column)
    animeStageTitle: '⛩️ 江戶前・壽司物語 2D 動畫實景',
    animeTheaterBtn: '卡通動畫劇場',
    dataBoardBtn: '數值看板',
    liveSimulationSub: '現場即時營運模擬：接待員阿葵、料理長健次、採購主管蓮、營運店長櫻',
    waitingQueueTitle: '玄關迎賓候位區 (Waiting Queue)',
    waitingCount: '{count} 位等待中',
    noQueueText: '🍃 目前玄關暫無排隊顧客',
    noQueueSub: '點擊頂部「+顧客」可手動招徠客人',
    pantryTitle: '冷藏庫存區 (Pantry Storage)',
    renMonitoring: '蓮 (Ren) 監控中',
    masterStationsTitle: '板前中央料理台 (Master Sushi Bar)',
    kenjiDirecting: '料理長 健次 (Kenji) 掌勺',
    prepStation1: '一號 握壽司台',
    prepStation2: '二號 軍艦卷台',
    prepStation3: '三號 炙燒台',
    passStation: '板前出餐口',
    diningTablesTitle: '客席用餐大廳 (Dining Hall)',
    tableCapacityCount: '({count}/16 席: 板前雅席 & 和風卡座)',
    emptySeat: '空席待客',
    orderWaiting: '等待出餐',
    orderDining: '品嚐美饌中',
    orderPaying: '結帳中',
    addTableBlueprint: '➕ 點擊擴建席位',
    addTableCost: '$150 添置 ({count}/16)',
    maxTableBannerTitle: '🎊 席位達 16 桌上限！',
    maxTableBannerSub: '🗺️ 請點擊開設新分店',
    openBranchCardTitle: '席位已滿 16 桌上限！',
    openBranchCardSub: '點擊進入 Google Map 開設新分店 ➔',
    gameOverTitle: 'GAME OVER - 餐廳經營失敗',

    // Telemetry & Tabs (Right Column)
    tabComms: '協同通訊',
    tabThoughts: '思維鏈',
    tabFinance: '經營數據',
    tabTickets: '工單 ({count})',
    eventBusTitle: '跨 Agent 訊息總線 (Event Bus)',
    thoughtTraceTitle: '跨 Agent 思考與工具執行軌跡',
    plAuditTitle: '財務損益帳單 (P&L Audit)',
    noTickets: '目前暫無未完成工單',

    // Modals
    mapModalTitle: '壽司物語 全國連鎖選址地圖',
    mapModalSub: 'Google Maps 實景商圈勘察與跨分行實景管理',
    operatingBranches: '已營業分店 ({count})',
    prospectiveBranches: '待開拓熱門商圈 ({count})',
    customPinNotice: '🗺️ 提示：可直接在地圖上任意點擊選址，自訂全新分店！',
    openBranchBtn: '立即開設此分店',
    switchBranchBtn: '切換至此分店實景',
    need16TablesNotice: '需將當前分店餐桌擴展至 16 桌上限（目前 {count}/16 桌）方可開設新分店！',
    staffModalTitle: '員工招聘與薪酬管理 (Staff Management)',
    staffModalSub: '聘僱外場服務生加速帶位收銀，聘僱後廚助廚加速備料擺盤',
    hireBtn: '聘僱員工',
    dismissBtn: '解聘資遣',
    wageEvery10Ticks: '每期工資 ${wage}',
    reportModalTitle: '每日營業結算與評分報告',
    reportModalSub: '日營業收入、採購原料、員工薪資與租金綜合核算',
    closeReportBtn: '關閉報告',
    nextDayBtn: '進入第 {day} 天開工 (11:00 AM)',
  },

  'en': {
    // Top Bar Brand & Navigation
    brandTitle: 'SushiFlow AI',
    brandSub: 'Multi-Agent Sim',
    lobby: 'Lobby',
    roboflow: 'RoboFlow',
    multiAgentBadge: 'Multi-Agent',
    gameOverBadge: '💀 GAME OVER',
    scenarioSelectLabel: 'Scenarios',

    // Live KPI Badges
    cashBalance: 'Cash Balance',
    bankrupt: 'Bankrupt',
    urgent: 'Low',
    totalRevenue: 'Revenue',
    satisfaction: 'Rating',
    csatDanger: 'Danger',
    csatCrash: 'Crash',
    servedTarget: 'Served / Target',
    dayClock: 'Day {day} • {time}',
    marketCondition: 'Market Trend',

    // Shift Phases
    shiftMorning: 'Morning Prep',
    shiftLunch: 'Lunch Service',
    shiftRush: 'Rush Hour',
    shiftAfternoon: 'Afternoon',
    shiftDinner: 'Dinner Rush',
    shiftClosed: 'Shift Ended',

    // Action Controls
    startNextDay: 'Start Day {day} (11:00 AM)',
    startNextDayShort: 'Day {day} Open',
    staff: 'Staff',
    rushHour: 'Rush',
    addCustomer: '+Guest',
    addVip: '+VIP',
    burst: 'Burst',
    burstTooltip: 'Street crowd surge! Spawns 3 guests at once. High turnover test, lower satisfaction may cause Game Over!',
    addTable: 'Add Table',
    addTableShort: '+Table',
    tableFull: 'Full',
    branchMap: 'New Branch',
    branchMapShort: 'Map',
    branchCount: '{count} Store(s)',
    play: 'Start (Space)',
    pause: 'Pause (Space)',
    step: 'Step 1 Tick',
    speed: '{spd}x Speed',
    reset: 'Reset Scenario',
    soundOn: 'Audio Enabled',
    soundOff: 'Audio Muted',
    report: 'Business Report',
    guide: 'Agent Tutorial',
    language: 'Language',

    // Multi-Agent Workspace (Left Column)
    masConsole: 'AI Agent Hub (MAS Console)',
    architecture4: '4-Agent Architecture',
    tabPrompt: 'System Prompt',
    tabTools: 'Tools ({count})',
    tabModel: 'Model & Config',
    quickPresets: 'Quick Strategy Presets',
    customPromptTitle: 'Custom System Prompt',
    promptPlaceholder: 'Enter instructions and strategy for this Agent...',
    runManualTurn: 'Run Agent Turn',
    agentExecuting: 'Agent Thinking...',
    llmProvider: 'LLM Provider',
    modelIdentifier: 'Model Identifier',
    temperature: 'Creativity (Temperature)',
    strictMode: 'Strict (0.0)',
    creativeMode: 'Creative (1.0)',
    apiKeyLabel: 'API Key (Custom Service)',
    apiKeyPlaceholder: 'Leave empty for local heuristic engine, or enter API key',

    // Agent Roles & Titles
    roleAoi: 'Aoi (Host)',
    roleKenji: 'Kenji (Chef)',
    roleRen: 'Ren (Pantry)',
    roleSakura: 'Sakura (GM)',
    titleAoi: 'Front-of-House Host',
    titleKenji: 'Master Sushi Chef',
    titleRen: 'Procurement & Inventory Lead',
    titleSakura: 'Restaurant GM & Auditor',

    // Restaurant View & 2D Canvas (Center Column)
    animeStageTitle: '⛩️ Edo-Style SushiFlow 2D Anime Stage',
    animeTheaterBtn: 'Anime Stage',
    dataBoardBtn: 'Data Board',
    liveSimulationSub: 'Real-Time Restaurant Sim: Host Aoi, Chef Kenji, Inventory Ren, GM Sakura',
    waitingQueueTitle: 'Entrance Waiting Queue',
    waitingCount: '{count} Waiting',
    noQueueText: '🍃 No customers currently in queue',
    noQueueSub: 'Click "+Guest" at the top to greet customers',
    pantryTitle: 'Pantry & Cold Storage',
    renMonitoring: 'Ren Monitoring',
    masterStationsTitle: 'Master Sushi Bar',
    kenjiDirecting: 'Chef Kenji at Counter',
    prepStation1: 'Prep Station 1 (Nigiri)',
    prepStation2: 'Prep Station 2 (Gunkan)',
    prepStation3: 'Prep Station 3 (Aburi)',
    passStation: 'Delivery Pass',
    diningTablesTitle: 'Dining Hall',
    tableCapacityCount: '({count}/16 Tables: Counter & Booths)',
    emptySeat: 'Empty Table',
    orderWaiting: 'Waiting for Dish',
    orderDining: 'Dining',
    orderPaying: 'Paying Bill',
    addTableBlueprint: '➕ Click to Add Table',
    addTableCost: '$150 ({count}/16)',
    maxTableBannerTitle: '🎊 16 Tables Limit Reached!',
    maxTableBannerSub: '🗺️ Click to Open New Branch',
    openBranchCardTitle: '16 Tables Maximum Reached!',
    openBranchCardSub: 'Click to Open Google Map & Expand ➔',
    gameOverTitle: 'GAME OVER - Restaurant Failed',

    // Telemetry & Tabs (Right Column)
    tabComms: 'Event Bus',
    tabThoughts: 'Thought Trace',
    tabFinance: 'P&L Audit',
    tabTickets: 'Orders ({count})',
    eventBusTitle: 'Inter-Agent Message Bus',
    thoughtTraceTitle: 'Agent Reasoning & Tool Calls',
    plAuditTitle: 'Financial P&L Audit',
    noTickets: 'No active tickets',

    // Modals
    mapModalTitle: 'SushiFlow Nationwide Chain Map',
    mapModalSub: 'Google Maps District Survey & Real-Life Branch Management',
    operatingBranches: 'Active Branches ({count})',
    prospectiveBranches: 'Prospective Districts ({count})',
    customPinNotice: '🗺️ Tip: Click anywhere on map to add your custom branch!',
    openBranchBtn: 'Open This Branch Now',
    switchBranchBtn: 'Switch to This Branch View',
    need16TablesNotice: 'Must expand current branch to 16 tables ({count}/16 now) to open new branches!',
    staffModalTitle: 'Staff Recruitment & Payroll',
    staffModalSub: 'Hire waiters to speed up seating/billing, hire sous chefs to accelerate prep',
    hireBtn: 'Hire Staff',
    dismissBtn: 'Dismiss',
    wageEvery10Ticks: '${wage} / 10 ticks',
    reportModalTitle: 'Daily Financial Settlement & Evaluation',
    reportModalSub: 'Revenue, ingredient costs, staff payroll, and facility rent audit',
    closeReportBtn: 'Close Report',
    nextDayBtn: 'Start Day {day} (11:00 AM)',
  },

  'zh-CN': {
    // Top Bar Brand & Navigation
    brandTitle: '寿司物语 AI',
    brandSub: 'SushiFlow Multi-Agent',
    lobby: '大厅',
    roboflow: 'RoboFlow 派单',
    multiAgentBadge: 'Multi-Agent',
    gameOverBadge: '💀 GAME OVER',
    scenarioSelectLabel: '关卡选择',

    // Live KPI Badges
    cashBalance: '结余现金',
    bankrupt: '破产',
    urgent: '告急',
    totalRevenue: '累积营业额',
    satisfaction: '满意度',
    csatDanger: '危险',
    csatCrash: '崩盘',
    servedTarget: '已接待 / 目标',
    dayClock: '第 {day} 天 • {time}',
    marketCondition: '市场行情',

    // Shift Phases
    shiftMorning: '早班备料',
    shiftLunch: '午间营运',
    shiftRush: '尖峰爆单',
    shiftAfternoon: '午后微憩',
    shiftDinner: '晚市客流',
    shiftClosed: '收工打烊',

    // Action Controls
    startNextDay: '开启第 {day} 天 (11:00 AM)',
    startNextDayShort: '第 {day} 天开工',
    staff: '员工',
    rushHour: '爆单潮',
    addCustomer: '+顾客',
    addVip: '+VIP',
    burst: '吸客潮',
    burstTooltip: '发动街头吸客潮 (一次涌入 3 位顾客！考验翻台速度，满意度下滑有 Game Over 风险！)',
    addTable: '增设餐桌',
    addTableShort: '+餐桌',
    tableFull: '席位已满',
    branchMap: '开设新分店',
    branchMapShort: '连锁地图',
    branchCount: '{count} 店',
    play: '开始运行 (空格键)',
    pause: '暂停 (空格键)',
    step: '单步前进 1 刻度',
    speed: '{spd}x 速度',
    reset: '重设当前关卡',
    soundOn: '音效已开启',
    soundOff: '音效已静音',
    report: '经营评分报告',
    guide: '教学指南',
    language: '语言 / Language',

    // Multi-Agent Workspace (Left Column)
    masConsole: 'AI Agent 控制中枢 (MAS Console)',
    architecture4: '4-Agent 协同架构',
    tabPrompt: 'System Prompt',
    tabTools: '工具清单 ({count})',
    tabModel: '模型与参数',
    quickPresets: '快速策略模板 (Quick Strategy)',
    customPromptTitle: '自订系统提示词 (System Prompt)',
    promptPlaceholder: '请在此输入指导该 Agent 的提示词...',
    runManualTurn: '单步 Agent 思考 (Run Turn)',
    agentExecuting: 'Agent 思考中...',
    llmProvider: '推论引擎提供商 (LLM Provider)',
    modelIdentifier: '模型名称 (Model Identifier)',
    temperature: '思考创意度 (Temperature)',
    strictMode: '精准守纪 (0.0)',
    creativeMode: '灵活创新 (1.0)',
    apiKeyLabel: 'API 金钥 (自订模型服务)',
    apiKeyPlaceholder: '可留空使用本地启发式引擎，或输入 API 金钥',

    // Agent Roles & Titles
    roleAoi: '阿葵 (Aoi)',
    roleKenji: '健次 (Kenji)',
    roleRen: '莲 (Ren)',
    roleSakura: '樱 (Sakura)',
    titleAoi: '首席服务接待员 (Front-of-House Host)',
    titleKenji: '寿司料理长 (Master Sushi Chef)',
    titleRen: '采购与库存主管 (Procurement & Inventory Lead)',
    titleSakura: '营运店长 (Restaurant GM & Auditor)',

    // Restaurant View & 2D Canvas (Center Column)
    animeStageTitle: '⛩️ 江户前・寿司物语 2D 动画实景',
    animeTheaterBtn: '卡通动画剧场',
    dataBoardBtn: '数值看板',
    liveSimulationSub: '现场即时营运模拟：接待员阿葵、料理长健次、采购主管莲、营运店长樱',
    waitingQueueTitle: '玄关迎宾候位区 (Waiting Queue)',
    waitingCount: '{count} 位等待中',
    noQueueText: '🍃 目前玄关暂无排队顾客',
    noQueueSub: '点击顶部「+顾客」可手动招徕客人',
    pantryTitle: '冷藏库存区 (Pantry Storage)',
    renMonitoring: '莲 (Ren) 监控中',
    masterStationsTitle: '板前中央料理台 (Master Sushi Bar)',
    kenjiDirecting: '料理长 健次 (Kenji) 掌勺',
    prepStation1: '一号 握寿司台',
    prepStation2: '二号 军舰卷台',
    prepStation3: '三号 炙烧台',
    passStation: '板前出餐口',
    diningTablesTitle: '客席用餐大厅 (Dining Hall)',
    tableCapacityCount: '({count}/16 席: 板前雅席 & 和风卡座)',
    emptySeat: '空席待客',
    orderWaiting: '等待出餐',
    orderDining: '品尝美馔中',
    orderPaying: '结账中',
    addTableBlueprint: '➕ 点击扩建席位',
    addTableCost: '$150 添置 ({count}/16)',
    maxTableBannerTitle: '🎊 席位达 16 桌上限！',
    maxTableBannerSub: '🗺️ 请点击开设新分店',
    openBranchCardTitle: '席位已满 16 桌上限！',
    openBranchCardSub: '点击进入 Google Map 开设新分店 ➔',
    gameOverTitle: 'GAME OVER - 餐厅经营失败',

    // Telemetry & Tabs (Right Column)
    tabComms: '协同通讯',
    tabThoughts: '思维链',
    tabFinance: '经营数据',
    tabTickets: '工单 ({count})',
    eventBusTitle: '跨 Agent 讯息总线 (Event Bus)',
    thoughtTraceTitle: '跨 Agent 思考与工具执行轨迹',
    plAuditTitle: '财务损益帐单 (P&L Audit)',
    noTickets: '目前暂无未完成工单',

    // Modals
    mapModalTitle: '寿司物语 全国连锁选址地图',
    mapModalSub: 'Google Maps 实景商圈勘察与跨分行实景管理',
    operatingBranches: '已营业分店 ({count})',
    prospectiveBranches: '待开拓热门商圈 ({count})',
    customPinNotice: '🗺️ 提示：可直接在地图上任意点击选址，自订全新分店！',
    openBranchBtn: '立即开设此分店',
    switchBranchBtn: '切换至此分店实景',
    need16TablesNotice: '需将当前分店餐桌扩展至 16 桌上限（目前 {count}/16 桌）方可开设新分店！',
    staffModalTitle: '员工招聘与薪酬管理 (Staff Management)',
    staffModalSub: '聘雇外场服务生加速带位收银，聘雇后厨助厨加速备料摆盘',
    hireBtn: '聘雇员工',
    dismissBtn: '解聘资遣',
    wageEvery10Ticks: '每期工资 ${wage}',
    reportModalTitle: '每日营业结算与评分报告',
    reportModalSub: '日营业收入、采购原料、员工薪资与租金综合核算',
    closeReportBtn: '关闭报告',
    nextDayBtn: '进入第 {day} 天开工 (11:00 AM)',
  }
};

interface SushiI18nContextType {
  language: SushiLanguage;
  setLanguage: (lang: SushiLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const SushiI18nContext = createContext<SushiI18nContextType>({
  language: 'zh-TW',
  setLanguage: () => {},
  t: (key: string) => key
});

export const SushiI18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SushiLanguage>('zh-TW');

  // Load language preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sushiflow_lang_pref');
      if (saved === 'zh-TW' || saved === 'en' || saved === 'zh-CN') {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: SushiLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sushiflow_lang_pref', lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['zh-TW'];
    let val = dict[key] || TRANSLATIONS['zh-TW'][key] || key;

    if (params) {
      for (const [pKey, pVal] of Object.entries(params)) {
        val = val.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      }
    }

    return val;
  };

  return (
    <SushiI18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </SushiI18nContext.Provider>
  );
};

export const SCENARIO_TITLES: Record<SushiLanguage, Record<string, string>> = {
  'zh-TW': {
    scenario_level_1: '第一關：新手試營運 - 接待與料理雙工協同',
    scenario_level_2: '第二關：午間爆單潮 - 庫存採購與防破產控管',
    scenario_level_3: '第三關：極品評鑑家 - 米其林神秘客與忌口考驗',
    scenario_sandbox: '第四關：自由沙盒 - 無限進階經營'
  },
  'en': {
    scenario_level_1: 'Lvl 1: Novice - Host & Chef Co-op',
    scenario_level_2: 'Lvl 2: Lunch Rush - Pantry & Cashflow',
    scenario_level_3: 'Lvl 3: Food Critic - Michelin VIP Audit',
    scenario_sandbox: 'Sandbox: Infinite Free Mode'
  },
  'zh-CN': {
    scenario_level_1: '第一关：新手试营运 - 接待与料理双工协同',
    scenario_level_2: '第二关：午间爆单潮 - 库存采购与防破产控管',
    scenario_level_3: '第三关：极品评鉴家 - 米其林神秘客与忌口考验',
    scenario_sandbox: '第四关：自由沙盒 - 无限进阶经营'
  }
};

export const MARKET_TITLES: Record<SushiLanguage, Record<string, { title: string; desc: string }>> = {
  'zh-TW': {
    market_standard: { title: '標準晴朗工作日', desc: '客流規律，午市與晚市皆有穩定客群進店用餐。' },
    market_festival: { title: '鄰近商圈美食祭典', desc: '街頭人潮湧動！客流提升 40%，且顧客給予小費更加慷慨！' },
    market_rainy: { title: '梅雨綿綿濕冷天', desc: '雨勢影響出行意願，進店客流下降 25%，但進店顧客耐心更加沉穩。' },
    market_critic: { title: '米其林評審巡迴週', desc: '美食家與 VIP 稽查員出沒機率大增 25%！菜品鮮度與忌口不容絲毫差錯！' },
    market_holiday: { title: '日本黃金週連假', desc: '客流全面暴增 50%！外場與後廚高壓運轉，翻台效率決定成敗！' }
  },
  'en': {
    market_standard: { title: 'Sunny Workday', desc: 'Steady customer flow with standard lunch and dinner peaks.' },
    market_festival: { title: 'Food Festival', desc: 'Street crowd surge! Guest arrival +40% with generous tips!' },
    market_rainy: { title: 'Rainy Weather', desc: 'Rain slows down foot traffic (-25%), but guests have more patience.' },
    market_critic: { title: 'Critic Week', desc: 'VIP Food Critic arrival rate +25%! Strict quality checks!' },
    market_holiday: { title: 'Golden Week', desc: 'Massive +50% holiday tourist surge! Tests turnover speed!' }
  },
  'zh-CN': {
    market_standard: { title: '标准晴朗工作日', desc: '客流规律，午市与晚市皆有稳定客群进店用餐。' },
    market_festival: { title: '邻近商圈美食祭典', desc: '街头人潮涌动！客流提升 40%，且顾客给予小费更加慷慨！' },
    market_rainy: { title: '梅雨绵绵湿冷天', desc: '雨势影响出行意愿，进店客流下降 25%，但进店顾客耐心更加沉稳。' },
    market_critic: { title: '米其林评审巡回周', desc: '美食家与 VIP 稽查员出没机率大增 25%！菜品鲜度与忌口不容丝毫差错！' },
    market_holiday: { title: '日本黄金周连假', desc: '客流全面暴增 50%！外场与后厨高压运转，翻台效率决定成败！' }
  }
};

export const useSushiI18n = () => {
  const context = useContext(SushiI18nContext);
  const getScenarioName = (id: string) => {
    return SCENARIO_TITLES[context.language]?.[id] || SCENARIO_TITLES['zh-TW']?.[id] || id;
  };
  const getMarketInfo = (id: string, fallbackTitle: string, fallbackDesc: string) => {
    const item = MARKET_TITLES[context.language]?.[id];
    if (item) return item;
    return { title: fallbackTitle, desc: fallbackDesc };
  };
  return {
    ...context,
    getScenarioName,
    getMarketInfo
  };
};
