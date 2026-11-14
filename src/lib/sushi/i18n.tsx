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
    roboflow: 'RoboFlow',
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
    shiftPreShift: '開工前準備',
    shiftOpen: '開店迎賓',
    shiftLunchRush: '午市高峰爆單',
    shiftAfternoonLull: '午後微憩整理',
    shiftDinnerRush: '晚市用餐人潮',
    shiftLastCall: '最後點餐時段',
    shiftClosed: '打烊收工',

    // Action Controls
    startNextDay: '開啟第 {day} 天 (11:00 AM)',
    startNextDayShort: '第 {day} 天開工',
    staff: '員工',
    rushHour: '爆單潮',
    addCustomer: '+顧客',
    addVip: '+VIP',
    burst: '吸客潮',
    burstShort: '潮',
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
    report: '經營總結評等報告',
    guide: '多 Agent 教學指南',
    language: '語言 / Language',

    // Multi-Agent Workspace (Left Column)
    masConsole: 'AI Agent 控制中樞',
    architecture4: '4-Agent 協同架構',
    tabPrompt: 'Prompt',
    tabTools: '工具 ({count})',
    tabModel: '模型參數',
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
    titleAoi: '首席服務接待員 (Host)',
    titleKenji: '壽司料理長 (Chef)',
    titleRen: '採購與庫存主管 (Inventory)',
    titleSakura: '營運店長 (Manager)',

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

    // Dialogue & Status Strip
    knifeSkill: '神級刀工特急',
    smileGreeting: '笑容迎賓待命',
    remedyActive: '客訴安撫機制',
    autoActive: '自動生效中',
    storageTitle: '後院物料冷藏庫 & 豐洲市場進貨碼頭',
    renMonitoringSub: '採購主管 蓮 (Ren) 嚴格把關',
    renStorageMsg: '越光米與生鮮庫存巡檢中...',
    aoiGreeting: '歡迎光臨壽司物語！',
    kenjiDirectingMsg: '嚴選時令魚鮮，即叫即捏！',
    sakuraDirectiveMsg: '今日毛利率與翻台率達標，繼續保持！',
    stageHostAction: '帶位 ➔ 點餐 ➔ 取盤 ➔ 送餐 ➔ 收銀',
    stageChefAction: '握壽司砧板 ➔ 炙燒噴槍 ➔ 敲鈴擺盤',
    stageInventoryAction: '安全庫存監控',
    stageManagerAction: '店長滿意度稽核',

    // Telemetry & Tabs (Right Column)
    tabComms: '協同通訊',
    tabThoughts: '思維鏈',
    tabFinance: '經營數據',
    tabTickets: '工單 ({count})',
    eventBusTitle: '跨 Agent 訊息總線 (Event Bus)',
    thoughtTraceTitle: '跨 Agent 思考與工具執行軌跡',
    plAuditTitle: '財務損益帳單 (P&L Audit)',
    noTickets: '目前暫無未完成工單',
    chOrderDispatch: '工單傳遞',
    chStockAlert: '採購警報',
    chCustomerFeedback: '顧客關懷',
    chStrategySync: '經營方針',
    chGeneral: '通訊',

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

    // Layout toggles
    collapseLeft: '收起左側欄',
    expandLeft: '展開 Agent 設定',
    collapseRight: '收起通訊數據',
    expandRight: '展開通訊數據'
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
    shiftPreShift: 'Pre-Shift Prep',
    shiftOpen: 'Doors Open',
    shiftLunchRush: 'Lunch Rush',
    shiftAfternoonLull: 'Afternoon Lull',
    shiftDinnerRush: 'Dinner Rush',
    shiftLastCall: 'Last Call',
    shiftClosed: 'Shift Ended',

    // Action Controls
    startNextDay: 'Start Day {day} (11:00 AM)',
    startNextDayShort: 'Day {day} Open',
    staff: 'Staff',
    rushHour: 'Rush',
    addCustomer: '+Guest',
    addVip: '+VIP',
    burst: 'Surge',
    burstShort: 'Surge',
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
    guide: 'Tutorial',
    language: 'Language',

    // Multi-Agent Workspace (Left Column)
    masConsole: 'AI Agent Console',
    architecture4: '4-Agent Co-op',
    tabPrompt: 'Prompt',
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
    prepStation1: 'Station 1 (Nigiri)',
    prepStation2: 'Station 2 (Gunkan)',
    prepStation3: 'Station 3 (Aburi)',
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

    // Dialogue & Status Strip
    knifeSkill: 'God-Tier Knife Speed',
    smileGreeting: 'Warm Welcome Ready',
    remedyActive: 'Complaint Remedy Active',
    autoActive: 'Auto-Active',
    storageTitle: 'Pantry Storage & Toyosu Logistics Bay',
    renMonitoringSub: 'Ren: Procurement Quality Control',
    renStorageMsg: 'Inspecting sushi rice and seafood freshness...',
    aoiGreeting: 'Welcome to SushiFlow!',
    kenjiDirectingMsg: 'Finest seasonal fish, crafted fresh!',
    sakuraDirectiveMsg: 'Margins and turnover meet targets, keep it up!',
    stageHostAction: 'Seat ➔ Order ➔ Pick Up ➔ Serve ➔ Bill',
    stageChefAction: 'Nigiri Board ➔ Aburi Torch ➔ Plating Bell',
    stageInventoryAction: 'Pantry Stock Monitor',
    stageManagerAction: 'CSAT & Profit Audit',

    // Telemetry & Tabs (Right Column)
    tabComms: 'Event Bus',
    tabThoughts: 'Thoughts',
    tabFinance: 'P&L Audit',
    tabTickets: 'Orders ({count})',
    eventBusTitle: 'Inter-Agent Message Bus',
    thoughtTraceTitle: 'Agent Reasoning & Tool Calls',
    plAuditTitle: 'Financial P&L Audit',
    noTickets: 'No active tickets',
    chOrderDispatch: 'Order Dispatch',
    chStockAlert: 'Stock Alert',
    chCustomerFeedback: 'Customer Care',
    chStrategySync: 'Strategy Sync',
    chGeneral: 'Comms',

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

    // Layout toggles
    collapseLeft: 'Collapse',
    expandLeft: 'Workspace',
    collapseRight: 'Collapse',
    expandRight: 'Telemetry'
  },

  'zh-CN': {
    // Top Bar Brand & Navigation
    brandTitle: '寿司物语 AI',
    brandSub: 'SushiFlow Multi-Agent',
    lobby: '大厅',
    roboflow: 'RoboFlow',
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
    shiftPreShift: '开工前准备',
    shiftOpen: '开店迎宾',
    shiftLunchRush: '午市高峰爆单',
    shiftAfternoonLull: '午后微憩整理',
    shiftDinnerRush: '晚市用餐人潮',
    shiftLastCall: '最后点餐时段',
    shiftClosed: '打烊收工',

    // Action Controls
    startNextDay: '开启第 {day} 天 (11:00 AM)',
    startNextDayShort: '第 {day} 天开工',
    staff: '员工',
    rushHour: '爆单潮',
    addCustomer: '+顾客',
    addVip: '+VIP',
    burst: '吸客潮',
    burstShort: '潮',
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
    report: '经营总结评等报告',
    guide: '多 Agent 教学指南',
    language: '语言 / Language',

    // Multi-Agent Workspace (Left Column)
    masConsole: 'AI Agent 控制中枢',
    architecture4: '4-Agent 协同架构',
    tabPrompt: 'Prompt',
    tabTools: '工具 ({count})',
    tabModel: '模型参数',
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
    titleAoi: '首席服务接待员 (Host)',
    titleKenji: '寿司料理长 (Chef)',
    titleRen: '采购与库存主管 (Inventory)',
    titleSakura: '营运店长 (Manager)',

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
    orderPaying: '结帐中',
    addTableBlueprint: '➕ 点击扩建席位',
    addTableCost: '$150 添置 ({count}/16)',
    maxTableBannerTitle: '🎊 席位达 16 桌上限！',
    maxTableBannerSub: '🗺️ 请点击开设新分店',
    openBranchCardTitle: '席位已满 16 桌上限！',
    openBranchCardSub: '点击进入 Google Map 开设新分店 ➔',
    gameOverTitle: 'GAME OVER - 餐厅经营失败',

    // Dialogue & Status Strip
    knifeSkill: '神级刀工特急',
    smileGreeting: '笑容迎宾待命',
    remedyActive: '客诉安抚机制',
    autoActive: '自动生效中',
    storageTitle: '后院物料冷藏库 & 丰洲市场进货码头',
    renMonitoringSub: '采购主管 莲 (Ren) 严格把关',
    renStorageMsg: '越光米与生鲜库存巡检中...',
    aoiGreeting: '欢迎光临寿司物语！',
    kenjiDirectingMsg: '严选时令鱼鲜，即叫即捏！',
    sakuraDirectiveMsg: '今日毛利率与翻台率达标，继续保持！',
    stageHostAction: '带位 ➔ 点餐 ➔ 取盘 ➔ 送餐 ➔ 收银',
    stageChefAction: '握寿司砧板 ➔ 炙烧喷枪 ➔ 敲铃摆盘',
    stageInventoryAction: '安全库存监控',
    stageManagerAction: '店长满意度稽核',

    // Telemetry & Tabs (Right Column)
    tabComms: '协同通讯',
    tabThoughts: '思维链',
    tabFinance: '经营数据',
    tabTickets: '工单 ({count})',
    eventBusTitle: '跨 Agent 讯息总线 (Event Bus)',
    thoughtTraceTitle: '跨 Agent 思考与工具执行轨迹',
    plAuditTitle: '财务损益帐单 (P&L Audit)',
    noTickets: '目前暂无未完成工单',
    chOrderDispatch: '工单传递',
    chStockAlert: '采购警报',
    chCustomerFeedback: '顾客关怀',
    chStrategySync: '经营方针',
    chGeneral: '通讯',

    // Modals
    mapModalTitle: '寿司物语 全国连锁选址地图',
    mapModalSub: 'Google Maps 实景商圈勘察与跨分行实景管理',
    operatingBranches: '已营业分店 ({count})',
    prospectiveBranches: '待开拓热门商圈 ({count})',
    customPinNotice: '🗺️ 提示：可直接在地图上任意点击选址，自订全新分店！',
    openBranchBtn: '立即开设此分店',
    switchBranchBtn: '切换至此分店实景',
    need16TablesNotice: '需将当前分店餐桌扩展至 16 桌上限（目前 {count}/16 桌）方开设新分店！',
    staffModalTitle: '员工招聘与薪酬管理 (Staff Management)',
    staffModalSub: '聘雇外场服务生加速带位收银，聘雇后厨助厨加速备料摆盘',
    hireBtn: '聘雇员工',
    dismissBtn: '解聘资遣',
    wageEvery10Ticks: '每期工资 ${wage}',
    reportModalTitle: '每日营业结算与评分报告',
    reportModalSub: '日营业收入、采购原料、员工薪资与租金综合核算',
    closeReportBtn: '关闭报告',
    nextDayBtn: '进入第 {day} 天开工 (11:00 AM)',

    // Layout toggles
    collapseLeft: '收起左侧栏',
    expandLeft: '展开 Agent 设定',
    collapseRight: '收起通讯数据',
    expandRight: '展开通讯数据'
  }
};

export const SCENARIO_TITLES: Record<SushiLanguage, Record<string, string>> = {
  'zh-TW': {
    scenario_level_1: '第一關：新手試營運 - 接待與料理雙工協同',
    scenario_level_2: '第二關：午間爆單潮 - 庫存採購與防破產控管',
    scenario_level_3: '第三關：極品評鑑家 - 米其林神秘客與忌口考驗',
    scenario_sandbox: '第四關：自由沙盒 - 無限進階經營'
  },
  'en': {
    scenario_level_1: 'Lvl 1: Host & Chef Co-op',
    scenario_level_2: 'Lvl 2: Pantry & Cashflow',
    scenario_level_3: 'Lvl 3: Michelin VIP Critic',
    scenario_sandbox: 'Sandbox: Infinite Mode'
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
    market_standard: { title: '晴朗工作日', desc: '客流規律，午市與晚市皆有穩定客群進店用餐。' },
    market_festival: { title: '商圈美食祭', desc: '街頭人潮湧動！客流提升 50%，且顧客給予小費更加慷慨！' },
    market_rainy: { title: '梅雨濕冷天', desc: '雨勢影響出行，客流下降 25%，但進店顧客耐心更加沉穩。' },
    market_critic: { title: '米其林巡迴', desc: '美食家與 VIP 稽查員出沒機率大增 25%！菜品鮮度與忌口不容絲毫差錯！' },
    market_michelin_week: { title: '米其林探店週', desc: '各大美食名家與神秘稽查員高頻巡訪 (VIP 機率翻倍)！' },
    market_holiday: { title: '黃金週連假', desc: '客流全面暴增 50%！外場與後廚高壓運轉，翻台效率決定成敗！' },
    market_friday_rush: { title: '週五犒賞狂歡', desc: '上班族下班聚餐狂潮！午間快節奏速食、晚間海鮮大單頻出！' }
  },
  'en': {
    market_standard: { title: 'Sunny Day', desc: 'Steady customer flow with standard lunch and dinner peaks.' },
    market_festival: { title: 'Food Fest', desc: 'Street crowd surge! Guest arrival +50% with generous tips!' },
    market_rainy: { title: 'Rainy Day', desc: 'Rain slows down foot traffic (-25%), but guests have more patience.' },
    market_critic: { title: 'Critic Week', desc: 'VIP Food Critic arrival rate +25%! Strict quality checks!' },
    market_michelin_week: { title: 'Michelin Week', desc: 'VIP Food Critics and inspectors arrive frequently!' },
    market_holiday: { title: 'Golden Week', desc: 'Massive holiday tourist surge! Tests turnover speed!' },
    market_friday_rush: { title: 'Friday Night Rush', desc: 'After-work party surge! Fast dining and seafood feasts!' }
  },
  'zh-CN': {
    market_standard: { title: '晴朗工作日', desc: '客流规律，午市与晚市皆有稳定客群进店用餐。' },
    market_festival: { title: '商圈美食祭', desc: '街头人潮涌动！客流提升 50%，且顾客给予小费更加慷慨！' },
    market_rainy: { title: '梅雨湿冷天', desc: '雨势影响出行，客流下降 25%，但进店顾客耐心更加沉稳。' },
    market_critic: { title: '米其林巡回', desc: '美食家与 VIP 稽查员出没机率大增 25%！菜品鲜度与忌口不容丝毫差错！' },
    market_michelin_week: { title: '米其林探店周', desc: '各大美食名家与神秘稽查员高频巡访 (VIP 机率翻倍)！' },
    market_holiday: { title: '黄金周连假', desc: '客流全面暴增 50%！外场与后厨高压运转，翻台效率决定成败！' },
    market_friday_rush: { title: '周五犒赏狂欢', desc: '上班族下班聚餐狂潮！午间快节奏速食、晚间海鲜大单频出！' }
  }
};

export const RECIPE_TITLES: Record<SushiLanguage, Record<string, string>> = {
  'zh-TW': {
    salmon_nigiri: '特上鮭魚握壽司',
    tuna_nigiri: '熟成金槍魚握壽司',
    wagyu_aburi: '炙燒A5和牛壽司',
    uni_gunkan: '北海道海膽軍艦',
    salmon_roll: '鮭魚酪梨卷',
    avocado_roll: '青綠酪梨素食卷',
    omakase_platter: '主廚特上盛合'
  },
  'en': {
    salmon_nigiri: 'Salmon Nigiri',
    tuna_nigiri: 'Tuna Nigiri',
    wagyu_aburi: 'Seared Wagyu',
    uni_gunkan: 'Sea Urchin Gunkan',
    salmon_roll: 'Salmon Avocado Roll',
    avocado_roll: 'Avocado Vegan Roll',
    omakase_platter: 'Chef Omakase Platter'
  },
  'zh-CN': {
    salmon_nigiri: '特上三文鱼握寿司',
    tuna_nigiri: '熟成金枪鱼握寿司',
    wagyu_aburi: '炙烧A5和牛寿司',
    uni_gunkan: '北海道海胆军舰',
    salmon_roll: '三文鱼牛油果卷',
    avocado_roll: '青绿牛油果素食卷',
    omakase_platter: '主厨特上盛合'
  }
};

export const INGREDIENT_TITLES: Record<SushiLanguage, Record<string, { name: string; unit: string }>> = {
  'zh-TW': {
    rice: { name: '越光米', unit: '份' },
    salmon: { name: '挪威鮭魚', unit: '片' },
    tuna: { name: '藍鰭金槍魚', unit: '片' },
    uni: { name: '北海道海膽', unit: '瓣' },
    wagyu: { name: 'A5極品和牛', unit: '片' },
    nori: { name: '有明海苔', unit: '張' },
    wasabi: { name: '靜岡本山葵', unit: '份' },
    avocado: { name: '熟成酪梨', unit: '塊' }
  },
  'en': {
    rice: { name: 'Sushi Rice', unit: 'pcs' },
    salmon: { name: 'Salmon', unit: 'slices' },
    tuna: { name: 'Bluefin Tuna', unit: 'slices' },
    uni: { name: 'Sea Urchin', unit: 'lobes' },
    wagyu: { name: 'A5 Wagyu', unit: 'slices' },
    nori: { name: 'Nori Seaweed', unit: 'sheets' },
    wasabi: { name: 'Wasabi', unit: 'portions' },
    avocado: { name: 'Avocado', unit: 'cubes' }
  },
  'zh-CN': {
    rice: { name: '越光米', unit: '份' },
    salmon: { name: '挪威三文鱼', unit: '片' },
    tuna: { name: '蓝鳍金枪鱼', unit: '片' },
    uni: { name: '北海道海胆', unit: '瓣' },
    wagyu: { name: 'A5极品和牛', unit: '片' },
    nori: { name: '有明海苔', unit: '张' },
    wasabi: { name: '静冈本山葵', unit: '份' },
    avocado: { name: '熟成牛油果', unit: '块' }
  }
};

export const TOOL_LOCALIZATION: Record<SushiLanguage, Record<string, { name: string; desc: string }>> = {
  'zh-TW': {
    greet_and_seat: { name: '迎賓入座 (greet_and_seat)', desc: '引導排隊中的顧客進入空桌或吧台，記錄入座時間' },
    take_customer_order: { name: '點餐與意圖識別 (take_order)', desc: '記錄顧客所選菜單，提取特殊忌口標籤（如不要芥末、素食等）' },
    relay_ticket_to_chef: { name: '工單發送 (relay_ticket)', desc: '將結構化點餐工單傳送至後廚佇列' },
    serve_dish: { name: '出餐上桌 (serve_dish)', desc: '將料理台已完成的壽司端給相應座位的顧客' },
    collect_bill: { name: '收銀結帳 (collect_bill)', desc: '為用餐完畢的顧客辦理結帳、收取小費，並整理桌台' },
    review_pending_tickets: { name: '工單審核 (review_tickets)', desc: '檢視當前等待製作的壽司清單與顧客特殊備註' },
    craft_sushi: { name: '壽司料理製作 (craft_sushi)', desc: '指派空閒料理台，消耗相應食材製作單份壽司' },
    batch_craft_sushi: { name: '批次合併製作 (batch_craft)', desc: '合併相同魚種的多份訂單，縮短切魚與捏醋飯時間' },
    alert_low_inventory: { name: '庫存報警 (alert_low_stock)', desc: '發現食材見底時，立即向採購部長發送急救通訊' },
    plate_and_notify: { name: '擺盤完成通報 (plate_notify)', desc: '料理出鍋完成，呼叫接待員前來端餐' },
    check_inventory_levels: { name: '食材盤點 (check_stock)', desc: '掃描目前各項生鮮海產與醋飯的儲備量與保鮮期' },
    order_ingredient: { name: '向市場採購 (order_stock)', desc: '向豐洲批發市場訂購指定數量的單項食材' },
    bulk_restock: { name: '安全庫存一鍵補貨 (bulk_restock)', desc: '自動將所有低於警戒線的食材補齊至安全水準' },
    forecast_demand: { name: '客流預測 (forecast_demand)', desc: '根據當前天氣行情預測下一週期的熱銷魚種' },
    audit_restaurant_kpi: { name: '營運稽核 (audit_kpi)', desc: '即時評估全店毛利率、翻台速度與顧客滿意星級' },
    broadcast_team_directive: { name: '店長廣播方針 (broadcast)', desc: '向全體員工下達動態營運方針' },
    complaint_remedy: { name: '客訴安撫處置 (remedy)', desc: '發現不耐煩顧客時贈送迎賓特飲挽回滿意度' },
    launch_marketing_promo: { name: '促銷推廣 (marketing)', desc: '花費小額行銷預算吸引更多顧客進店' }
  },
  'en': {
    greet_and_seat: { name: 'Greet & Seat (greet_and_seat)', desc: 'Guide queuing guests to empty tables or counter seats' },
    take_customer_order: { name: 'Take Order & Intent (take_order)', desc: 'Record guest order and extract dietary restrictions (no wasabi, vegetarian, etc.)' },
    relay_ticket_to_chef: { name: 'Relay Ticket (relay_ticket)', desc: 'Send structured order ticket to the kitchen queue' },
    serve_dish: { name: 'Serve Dish (serve_dish)', desc: 'Deliver plated sushi from counter pass to the guest table' },
    collect_bill: { name: 'Collect Bill (collect_bill)', desc: 'Handle guest checkout, collect tips, and clear tables' },
    review_pending_tickets: { name: 'Review Tickets (review_tickets)', desc: 'Inspect pending orders and guest dietary notes' },
    craft_sushi: { name: 'Craft Sushi (craft_sushi)', desc: 'Assign idle prep station and consume ingredients to craft dish' },
    batch_craft_sushi: { name: 'Batch Crafting (batch_craft)', desc: 'Combine identical sushi orders to save prep time' },
    alert_low_inventory: { name: 'Stock Alert (alert_low_stock)', desc: 'Send urgent message to Procurement when ingredients run out' },
    plate_and_notify: { name: 'Plate & Notify (plate_notify)', desc: 'Ring bell and alert host that dish is ready for pickup' },
    check_inventory_levels: { name: 'Check Inventory (check_stock)', desc: 'Scan pantry stock levels and shelf freshness' },
    order_ingredient: { name: 'Order Ingredient (order_stock)', desc: 'Purchase specified units of raw ingredients from market' },
    bulk_restock: { name: 'Safe Restock (bulk_restock)', desc: 'Automatically restock all low ingredients up to safety threshold' },
    forecast_demand: { name: 'Demand Forecast (forecast_demand)', desc: 'Forecast popular dishes based on market conditions' },
    audit_restaurant_kpi: { name: 'Audit KPIs (audit_kpi)', desc: 'Evaluate margins, turnover rate, and CSAT star rating' },
    broadcast_team_directive: { name: 'Team Directive (broadcast)', desc: 'Broadcast operational priorities to all agents' },
    complaint_remedy: { name: 'Complaint Remedy (remedy)', desc: 'Offer complimentary drinks to soothe waiting guests' },
    launch_marketing_promo: { name: 'Marketing Promo (marketing)', desc: 'Spend budget to draw more customers from the street' }
  },
  'zh-CN': {
    greet_and_seat: { name: '迎宾入座 (greet_and_seat)', desc: '引导排队中的顾客进入空桌或吧台，记录入座时间' },
    take_customer_order: { name: '点餐与意图识别 (take_order)', desc: '记录顾客所选菜单，提取特殊忌口标签（如不要芥末、素食等）' },
    relay_ticket_to_chef: { name: '工单发送 (relay_ticket)', desc: '将结构化点餐工单传送至后厨队列' },
    serve_dish: { name: '出餐上桌 (serve_dish)', desc: '将料理台已完成的寿司端给相应座位的顾客' },
    collect_bill: { name: '收银结帐 (collect_bill)', desc: '为用餐完毕的顾客办理结帐、收取小费，并整理桌台' },
    review_pending_tickets: { name: '工单审核 (review_tickets)', desc: '检视当前等待制作的寿司清单与顾客特殊备注' },
    craft_sushi: { name: '寿司料理制作 (craft_sushi)', desc: '指派空闲料理台，消耗相应食材制作单份寿司' },
    batch_craft_sushi: { name: '批次合并制作 (batch_craft)', desc: '合并相同鱼种的多份订单，缩短切鱼与捏醋饭时间' },
    alert_low_inventory: { name: '库存报警 (alert_low_stock)', desc: '发现食材见底时，立即向采购部长发送急救通讯' },
    plate_and_notify: { name: '摆盘完成通报 (plate_notify)', desc: '料理出锅完成，呼叫接待员前来端餐' },
    check_inventory_levels: { name: '食材盘点 (check_stock)', desc: '扫描目前各项生鲜海产与醋饭的储备量与保鲜期' },
    order_ingredient: { name: '向市场采购 (order_stock)', desc: '向丰洲批发市场订购指定数量的单项食材' },
    bulk_restock: { name: '安全库存一键补货 (bulk_restock)', desc: '自动将所有低于警戒线的食材补齐至安全水准' },
    forecast_demand: { name: '客流预测 (forecast_demand)', desc: '根据当前天气行情预测下一周期的热销鱼种' },
    audit_restaurant_kpi: { name: '营运稽核 (audit_kpi)', desc: '即时评估全店毛利率、翻台速度与顾客满意星级' },
    broadcast_team_directive: { name: '店长广播方针 (broadcast)', desc: '向全体员工下达动态营运方针' },
    complaint_remedy: { name: '客诉安抚处置 (remedy)', desc: '发现不耐烦顾客时赠送迎宾特饮挽回满意度' },
    launch_marketing_promo: { name: '促销推广 (marketing)', desc: '花费小额行销预算吸引更多顾客进店' }
  }
};

export const PRESET_LOCALIZATION: Record<SushiLanguage, Record<string, { title: string; desc: string; prompt: string }>> = {
  'zh-TW': {
    preset_host_vip: {
      title: 'VIP 尊榮服務策略',
      desc: '優先識別 VIP 貴賓與嚴格記錄忌口，安排景觀卡座',
      prompt: `你是服務接待員阿葵（Aoi）。
【專屬策略 - VIP尊榮服務】：
1. 迎賓入座時，優先引導 VIP 貴賓至景觀卡座。
2. 點餐時，若顧客提及「不要芥末」、「素食」或「過敏」，必須在工單備註中明確加註【嚴格忌口】。
3. VIP 顧客點餐後，立即以加急 priority="urgent" 發送至料理長健次。
4. 顧客用餐完畢後第一時間收銀，保持桌面清潔。`
    },
    preset_host_fast: {
      title: '極速翻台攬客策略',
      desc: '極速引導排隊顧客，出餐後第一時間端盤，縮短等待時間',
      prompt: `你是服務接待員阿葵（Aoi）。
【專屬策略 - 極速翻台】：
1. 隨時注意玄關排隊隊列，有空桌立即迎賓入座。
2. 料理出餐口只要有壽司完成，立即中斷其他事務前往端餐上桌。
3. 顧客用餐完畢即刻收銀結帳，騰出空桌迎接下一批顧客。`
    },
    preset_chef_meticulous: {
      title: '匠人忌口守則策略',
      desc: '嚴格審核每份工單特殊備註，客製化烹調防止客訴',
      prompt: `你是壽司料理長健次（Kenji）。
【專屬策略 - 匠人忌口】：
1. 製作每份壽司前，先審查工單備註。
2. 若備註標記「不要芥末」，絕對不在握壽司中加入山葵。
3. 若備註標記「素食」，僅使用越光米、有明海苔與熟成酪梨製作。
4. 嚴禁任何錯誤出餐，確保每一位顧客滿意度獲得 5 顆星！`
    },
    preset_chef_batch: {
      title: '尖峰高產能批次烹飪',
      desc: '尖峰時段合併相同壽司製作，縮短等待時間',
      prompt: `你是壽司料理長健次（Kenji）。
【專屬策略 - 尖峰高產能】：
1. 尖峰時段若有多份相同握壽司，優先合併批次製作。
2. 保持料理台滿載運轉，製作完成後立即敲鈴呼叫前台。
3. 食材低於 3 份時立刻發送報警給採購蓮。`
    },
    preset_ren_safe: {
      title: '安全防破產採購守則',
      desc: '安全庫存門檻補貨，嚴格控制採購預算防止破產',
      prompt: `你是採購主管蓮（Ren）。
【專屬策略 - 安全防破產】：
1. 食材低於 6 份時自動發起補貨。
2. 資金結餘低於 $80 時，嚴禁採購高單價食材（如和牛、海膽），優先補充足夠的醋飯與鮭魚。
3. 每次採購量維持在 5-10 份，保留充足現金流以應對店租與水電支出！`
    },
    preset_sakura_audit: {
      title: '滿意度與利潤綜合稽核',
      desc: '動態發布團隊方針，低滿意度時啟動安撫補償防止 Game Over',
      prompt: `你是營運店長櫻（Sakura）。
【專屬策略 - 全店綜合稽核】：
1. 密切監控顧客平均滿意度星級，若低於 3.8 顆星立即廣播全體加快出餐。
2. 發現等待時間過長的不耐煩顧客，立即調用客訴安撫贈送特飲。
3. 監控全店毛利率，維持健康收支平衡。`
    }
  },
  'en': {
    preset_host_vip: {
      title: 'VIP Premium Service',
      desc: 'Prioritize VIP guests, record dietary notes, assign booth seats',
      prompt: `You are Aoi, Front-of-House Host at SushiFlow.
[Strategy - VIP Premium Service]:
1. When greeting guests, prioritize VIP critics and seat them in scenic booth tables.
2. During ordering, if guests mention "no wasabi", "vegetarian", or allergies, you MUST strictly record dietary notes in the ticket.
3. Mark VIP orders with priority="urgent" and relay immediately to Chef Kenji.
4. Process bills promptly after dining to keep table turnover high.`
    },
    preset_host_fast: {
      title: 'Express Turnover Strategy',
      desc: 'Rapidly seat queuing guests and deliver dishes instantly to minimize wait time',
      prompt: `You are Aoi, Front-of-House Host at SushiFlow.
[Strategy - Express Turnover]:
1. Monitor the entrance queue constantly; seat guests as soon as tables become empty.
2. When dishes appear at the kitchen pass, immediately prioritize serving them to guests.
3. Promptly process payments when guests finish dining to free up tables for the next party.`
    },
    preset_chef_meticulous: {
      title: 'Artisan Dietary Compliance',
      desc: 'Strictly check ticket dietary notes and customize sushi to avoid complaints',
      prompt: `You are Chef Kenji, Master Sushi Chef.
[Strategy - Artisan Dietary Compliance]:
1. Review special notes on each ticket carefully before starting prep.
2. If ticket says "no wasabi", NEVER add wasabi into the nigiri.
3. If ticket says "vegetarian", only use rice, nori, and avocado.
4. Ensure zero mistakes to maintain a flawless 5.0 star CSAT rating!`
    },
    preset_chef_batch: {
      title: 'Peak Rush Batch Crafting',
      desc: 'Merge identical sushi orders during peak rush to speed up preparation',
      prompt: `You are Chef Kenji, Master Sushi Chef.
[Strategy - Peak Rush High Output]:
1. During rush hour, combine multiple orders of the same sushi recipe for batch crafting.
2. Keep all prep stations actively running; ring bell immediately when plated.
3. Alert Procurement Ren when any ingredient drops below 3 units.`
    },
    preset_ren_safe: {
      title: 'Anti-Bankruptcy Safe Reorder',
      desc: 'Maintain safe stock thresholds while guarding cashflow to prevent bankruptcy',
      prompt: `You are Ren, Procurement & Inventory Lead.
[Strategy - Anti-Bankruptcy Safe Stock]:
1. Automatically restock ingredients whenever current stock drops below 6 units.
2. If cash balance is under $80, NEVER purchase expensive Wagyu or Sea Urchin; prioritize affordable rice and salmon staples.
3. Order in moderate batches (5-10 units) to retain sufficient cash for rent and utility payments!`
    },
    preset_sakura_audit: {
      title: 'CSAT & Profit Balanced Audit',
      desc: 'Issue team directives and apply customer remedies when satisfaction drops to prevent Game Over',
      prompt: `You are Sakura, General Restaurant Manager.
[Strategy - Balanced Audit & CSAT Protection]:
1. Closely monitor average CSAT stars; if rating drops below 3.8, immediately broadcast team speedup.
2. Whenever impatient customers are spotted waiting too long, apply remedies with complimentary drinks.
3. Audit profit margins regularly to ensure steady financial health.`
    }
  },
  'zh-CN': {
    preset_host_vip: {
      title: 'VIP 尊荣服务策略',
      desc: '优先识别 VIP 贵宾与严格记录忌口，安排景观卡座',
      prompt: `你是服务接待员阿葵（Aoi）。
【专属策略 - VIP尊荣服务】：
1. 迎宾入座时，优先引导 VIP 贵宾至景观卡座。
2. 点餐时，若顾客提及「不要芥末」、「素食」或「过敏」，必须在工单备注中明确加注【严格忌口】。
3. VIP 顾客点餐后，立即以加急 priority="urgent" 发送至料理长健次。
4. 顾客用餐完毕后第一时间收银，保持桌面清洁。`
    },
    preset_host_fast: {
      title: '极速翻台揽客策略',
      desc: '极速引导排队顾客，出餐后第一时间端盘，缩短等待时间',
      prompt: `你是服务接待员阿葵（Aoi）。
【专属策略 - 极速翻台】：
1. 随时注意玄关排队队列，有空桌立即迎宾入座。
2. 料理出餐口只要有寿司完成，立即中断其他事务前往端餐上桌。
3. 顾客用餐完毕即刻收银结帐，腾出空桌迎接下一批顾客。`
    },
    preset_chef_meticulous: {
      title: '匠人忌口守则策略',
      desc: '严格审核每份工单特殊备注，客制化烹调防止客诉',
      prompt: `你是寿司料理长健次（Kenji）。
【专属策略 - 匠人忌口】：
1. 制作每份寿司前，先审查工单备注。
2. 若备注标记「不要芥末」，绝对不在握寿司中加入山葵。
3. 若备注标记「素食」，仅使用越光米、有明海苔与熟成牛油果制作。
4. 严禁任何错误出餐，确保每一位顾客满意度获得 5 颗星！`
    },
    preset_chef_batch: {
      title: '尖峰高产能批次烹饪',
      desc: '尖峰时段合并相同寿司制作，缩短等待时间',
      prompt: `你是寿司料理长健次（Kenji）。
【专属策略 - 尖峰高产能】：
1. 尖峰时段若有多份相同握寿司，优先合并批次制作。
2. 保持料理台满载运转，制作完成后立即敲铃呼叫前台。
3. 食材低于 3 份时立刻发送报警给采购莲。`
    },
    preset_ren_safe: {
      title: '安全防破产采购守则',
      desc: '安全库存门槛补货，严格控制采购预算防止破产',
      prompt: `你是采购主管莲（Ren）。
【专属策略 - 安全防破产】：
1. 食材低于 6 份时自动发起补货。
2. 资金结余低于 $80 时，严禁采购高单价食材（如和牛、海胆），优先补充足够的醋饭与三文鱼。
3. 每次采购量维持在 5-10 份，保留充足现金流以应对店租与水电支出！`
    },
    preset_sakura_audit: {
      title: '满意度与利润综合稽核',
      desc: '动态发布团队方针，低满意度时启动安抚补偿防止 Game Over',
      prompt: `你是营运店长樱（Sakura）。
【专属策略 - 全店综合稽核】：
1. 密切监控顾客平均满意度星级，若低于 3.8 颗星立即广播全体加快出餐。
2. 发现等待时间过长的不耐烦顾客，立即调用客诉安抚赠送特饮。
3. 监控全店毛利率，维持健康收支平衡。`
    }
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

export const useSushiI18n = () => {
  const context = useContext(SushiI18nContext);
  const lang = context.language || 'zh-TW';

  const getScenarioName = (id: string) => {
    return SCENARIO_TITLES[lang]?.[id] || SCENARIO_TITLES['zh-TW']?.[id] || id;
  };

  const getMarketInfo = (id: string, fallbackTitle: string, fallbackDesc: string) => {
    const item = MARKET_TITLES[lang]?.[id];
    if (item) return item;
    return { title: fallbackTitle, desc: fallbackDesc };
  };

  const getRecipeTitle = (recipeId: string, fallbackName?: string) => {
    return RECIPE_TITLES[lang]?.[recipeId] || fallbackName || recipeId;
  };

  const getIngredientInfo = (key: string, fallbackName?: string, fallbackUnit?: string) => {
    const info = INGREDIENT_TITLES[lang]?.[key];
    if (info) return info;
    return { name: fallbackName || key, unit: fallbackUnit || 'pcs' };
  };

  const getToolTitleAndDesc = (toolId: string, fallbackName?: string, fallbackDesc?: string) => {
    const info = TOOL_LOCALIZATION[lang]?.[toolId];
    if (info) return info;
    return { name: fallbackName || toolId, desc: fallbackDesc || '' };
  };

  const getPresetLocalization = (presetId: string) => {
    return PRESET_LOCALIZATION[lang]?.[presetId] || PRESET_LOCALIZATION['zh-TW']?.[presetId];
  };

  const translateMsg = (content: string) => {
    return translateLogMessage(content, lang);
  };

  const translateCustName = (name: string) => {
    return translateCustomerName(name, lang);
  };

  const translateCustNote = (note: string) => {
    return translateCustomerNote(note, lang);
  };

  const translateBranch = (name: string) => {
    return translateBranchName(name, lang);
  };

  return {
    ...context,
    getScenarioName,
    getMarketInfo,
    getRecipeTitle,
    getIngredientInfo,
    getToolTitleAndDesc,
    getPresetLocalization,
    translateMsg,
    translateCustName,
    translateCustNote,
    translateBranch
  };
};

export function translateBranchName(name: string, lang: SushiLanguage): string {
  if (lang !== 'en' || !name) return name;
  const map: Record<string, string> = {
    '江戶前・銀座旗艦總店': 'Ginza Flagship Store',
    '澀谷十字路口潮流分店': 'Shibuya Crossing Trend Store',
    '新宿歌舞伎町不夜城分店': 'Shinjuku Nightlife Branch',
    '六本木之丘奢華景觀分店': 'Roppongi Hills Luxury View Branch',
    '秋葉原電器街動漫聯名分店': 'Akihabara Anime & Tech Branch',
    '淺草雷門傳統老街分店': 'Asakusa Kaminarimon Heritage Branch',
    '橫濱未來港海灣景觀分店': 'Yokohama Harbor View Branch',
    '京都祇園傳統茶寮旗艦店': 'Kyoto Gion Traditional Teahouse',
    '自訂・特色連鎖分店': 'Custom Franchise Branch',
    '江戶前・壽司物語 AI 旗艦店': 'SushiFlow AI Flagship Store',
    '江戶前・壽司物語 AI 本店': 'SushiFlow AI Main Store'
  };
  return map[name] || name;
}

export function translateCustomerName(name: string, lang: SushiLanguage): string {
  if (lang !== 'en' || !name) return name;
  const isVip = name.includes('【VIP】') || name.startsWith('VIP');
  const cleanName = name.replace(/【VIP】/g, '').replace(/^VIP\s*/g, '').trim();

  const map: Record<string, string> = {
    '米其林密探・小野先生': 'Michelin Inspector Ono',
    '美食博主・愛麗絲': 'Food Critic Alice',
    '美饌家・佐藤': 'Gourmet Sato',
    '商界元老・德川': 'Elder Statesman Tokugawa',
    '松本 總裁': 'President Matsumoto',
    '神谷 夫人': 'Mrs. Kamiya',
    '德川 律師': 'Attorney Tokugawa',
    '竹田 評論家': 'Critic Takeda',
    '白石 貴婦': 'Lady Shiraishi',
    '佐藤 董事': 'Director Sato',
    '北野 博士': 'Dr. Kitano',
    '早川 收藏家': 'Collector Hayakawa',
    '百萬潮流博主・愛麗絲': 'Trend Influencer Alice',
    '澀谷街頭主理人・翔': 'Shibuya Curator Sho',
    '超人氣偶像・蓮': 'Pop Idol Ren',
    '早川 蓮': 'Ren Hayakawa',
    '星野 結愛': 'Yua Hoshino',
    '西園寺 拓海': 'Takumi Saionji',
    '愛麗絲 (網紅)': 'Alice (Influencer)',
    '木村 翼': 'Tsubasa Kimura',
    '長谷川 翔': 'Sho Hasegawa',
    '藤井 奈奈': 'Nana Fujii',
    '高橋 翔太': 'Shota Takahashi',
    '佐佐木 健': 'Ken Sasaki',
    '鈴木 莉子': 'Riko Suzuki',
    '歌舞伎町傳奇店主・桐生': 'Kabukicho Legend Kiryu',
    '深夜老饕・黑澤': 'Midnight Foodie Ryu',
    '俱樂部王牌・美咲': 'Nightclub Ace Misaki',
    '黑澤 龍': 'Ryu Kurosawa',
    '神崎 美咲': 'Misaki Kanzaki',
    '橘 駿': 'Shun Tachibana',
    '一之瀨 茜': 'Akane Ichinose',
    'DJ 健次郎': 'DJ Kenjiro',
    '桐生 徹': 'Tohru Kiryu',
    '雨宮 遙': 'Haruka Amamiya',
    '冴島 勇樹': 'Yuki Saejima',
    '真島 浩二': 'Koji Majima',
    '米其林評審秘書長・Charles': 'Michelin Secretary Charles',
    '跨國基金主席・Nicholas': 'Chairman Nicholas',
    '國際電影節主席・Elena': 'Film Festival Chair Elena',
    'Ambassador Charles (查爾斯大使)': 'Ambassador Charles',
    'Elena Rostova (影業製片)': 'Elena Rostova (Producer)',
    'Sir Arthur Pendelton': 'Sir Arthur Pendelton',
    '佐佐木 建築大師': 'Architect Sasaki',
    'Camilla (珠寶鑑賞)': 'Camilla (Jeweler)',
    'Nicholas (跨國基金合夥人)': 'Nicholas (Fund Partner)',
    'Diane de Poitiers': 'Diane de Poitiers',
    '超人氣動漫偶像・芽衣': 'Anime Idol Mei',
    '百萬訂閱遊戲主播・大輝': 'Top Streamer Daiki',
    '傳奇機器人工程博士': 'Robotics Master Dr. Mitarai',
    '芽衣 (職業 Coser)': 'Mei (Cosplayer)',
    '大輝 (遊戲實況主)': 'Daiki (Streamer)',
    '御手洗 博士': 'Dr. Mitarai',
    '小日向 櫻': 'Sakura Kohinata',
    '風間 駿介': 'Shunsuke Kazama',
    '初音 鐵粉・健二': 'Kenji (Anime Fan)',
    '千代田 電子匠人': 'Akiba Engineer',
    '星空 漫研社長': 'Manga Club President',
    '國際旅行指南主筆・Lucas': 'Travel Guide Editor Lucas',
    '法國藍帶名廚・Pierre': 'Cordon Bleu Chef Pierre',
    '國寶陶藝大師・吉田': 'Master Potter Yoshida',
    'Lucas & Sophie (背包客)': 'Lucas & Sophie (Backpackers)',
    'Pierre (巴黎名廚)': 'Pierre (Paris Chef)',
    '吉田 陶藝大師': 'Master Yoshida (Potter)',
    'Hans (德國攝影家)': 'Hans (Photographer)',
    '春日 婆婆': 'Grandma Kasuga',
    'Mateo (文化學者)': 'Mateo (Scholar)',
    '山田 茶道師範': 'Master Yamada (Tea Ceremony)',
    '橫濱商工會議所會長・岡本': 'Chamber President Okamoto',
    '港灣觀光親善大使・優香': 'Port Goodwill Ambassador Yuka',
    '遠洋郵輪船長・海野': 'Cruise Captain Unno',
    '渡邊 一家 (3人家庭)': 'The Watanabe Family',
    '健太與優香 (甜蜜情侶)': 'Kenta & Yuka (Couple)',
    '橫濱商會 岡本 會長': 'President Okamoto',
    '海野 船長': 'Captain Unno',
    '森田 夫婦': 'Mr. & Mrs. Morita',
    '港灣物流 鈴木 經理': 'Port Manager Suzuki',
    '祇園甲部名藝伎・小鈴': 'Master Geisha Kosuzu',
    '西陣織人間國寶・吉野': 'National Treasure Yoshino',
    '裏千家茶道宗匠・千代': 'Grand Tea Master Chiyo',
    '八坂 藝伎 小鈴': 'Geisha Kosuzu (Yasaka)',
    '西陣織大師 吉野': 'Weaver Master Yoshino',
    '京都大學 藤原 教授': 'Professor Fujiwara',
    '茶道宗匠 千代': 'Tea Master Chiyo',
    '祇園老舖主理人 近藤': 'Gion Historic Owner Kondo',
    '妙心寺 禪師': 'Zen Monk of Myoshin-ji',
    '鈴木 祥平': 'Shohei Suzuki',
    '井上 彩乃': 'Ayano Inoue',
    '高木 達也': 'Tatsuya Takagi',
    '松井 健太郎': 'Kentaro Matsui',
    '山根 結衣': 'Yui Yamane',
    '長尾 俊介': 'Shunsuke Nagao',
    '森川 葵': 'Aoi Morikawa',
    '山田先生': 'Mr. Yamada',
    '佐藤小姐': 'Ms. Sato',
    '鈴木先生': 'Mr. Suzuki',
    '田中先生': 'Mr. Tanaka',
    '高橋小姐': 'Ms. Takahashi',
    '渡邊先生': 'Mr. Watanabe',
    '伊藤小姐': 'Ms. Ito',
    '中村先生': 'Mr. Nakamura',
    '小林小姐': 'Ms. Kobayashi',
    '加藤先生': 'Mr. Kato',
    '吉田先生': 'Mr. Yoshida',
    '山口小姐': 'Ms. Yamaguchi',
    '松本小姐': 'Ms. Matsumoto',
    '井上先生': 'Mr. Inoue',
    '木村先生': 'Mr. Kimura',
    '林先生': 'Mr. Hayashi',
    '清水小姐': 'Ms. Shimizu',
    '山崎先生': 'Mr. Yamazaki',
    '池田小姐': 'Ms. Ikeda',
    '橋本先生': 'Mr. Hashimoto'
  };

  const translated = map[cleanName] || cleanName;
  return isVip ? `【VIP】${translated}` : translated;
}

export function translateCustomerNote(note: string, lang: SushiLanguage): string {
  if (lang !== 'en' || !note) return note;
  if (note.includes('不要放山葵') || note.includes('不要芥末') || note.includes('辛辣')) {
    return 'Sensitive to wasabi spice; strictly NO wasabi!';
  }
  if (note.includes('素食') || note.includes('酪梨蔬食卷')) {
    return 'Strict vegan; only eats Avocado Veggie Roll!';
  }
  if (note.includes('米其林') || note.includes('評鑑')) {
    return '3-Star Michelin Inspector; expects supreme freshness & swift service!';
  }
  if (note.includes('上班族') || note.includes('趕時間')) {
    return 'Busy office worker; needs rapid service & fast turnover!';
  }
  if (note.includes('炙燒') || note.includes('初次品嚐')) {
    return 'First time eating sashimi; prefers seared aburi dishes.';
  }
  if (note.includes('主廚推薦') || note.includes('無特殊偏好')) {
    return 'No special request; eager for chef omakase.';
  }
  return note;
}

export function translateLogMessage(content: string, lang: SushiLanguage): string {
  if (lang !== 'en' || !content) return content;

  if (content.includes('【開店早會】')) {
    return '[Morning Briefing] Hello team! The sushi restaurant is officially open. Please collaborate closely and give your best!';
  }
  if (content.includes('【出餐完畢】')) {
    return content.replace(/【出餐完畢】已順利將工單 #(\w+) 上桌至 (\w+)。/g, '[Served] Successfully served order #$1 to table $2.');
  }
  if (content.includes('【新工單 #')) {
    return content
      .replace(/【新工單 #(\w+)】桌號 (\w+): 製作 (.+)/g, (m, id, tbl, dish) => {
        return `[New Order #${id}] Table ${tbl}: Prepare ${dish}`;
      })
      .replace(/極上鮭魚握壽司/g, 'Salmon Nigiri')
      .replace(/鮮金槍魚握壽司/g, 'Tuna Nigiri')
      .replace(/海膽軍艦卷/g, 'Uni Gunkan')
      .replace(/特級炙燒和牛握壽司/g, 'Aburi Wagyu Nigiri')
      .replace(/加州酪梨蔬食卷/g, 'Avocado Veggie Roll')
      .replace(/極上壽司拼盤/g, 'Omakase Platter')
      .replace(/\[重點備註: (.+)\]/g, (m, note) => `[Note: ${translateCustomerNote(note, 'en')}]`);
  }
  if (content.includes('【擺盤完成】')) {
    return content
      .replace(/【擺盤完成】工單 #(\w+) \((.+)\) 已在 (.+) 備妥，請迅速上桌！/g, '[Plated] Order #$1 ($2) is ready at $3, please serve promptly!')
      .replace(/極上鮭魚握壽司/g, 'Salmon Nigiri')
      .replace(/鮮金槍魚握壽司/g, 'Tuna Nigiri')
      .replace(/海膽軍艦卷/g, 'Uni Gunkan')
      .replace(/特級炙燒和牛握壽司/g, 'Aburi Wagyu Nigiri')
      .replace(/加州酪梨蔬食卷/g, 'Avocado Veggie Roll')
      .replace(/極上壽司拼盤/g, 'Omakase Platter');
  }
  if (content.includes('【食材不足】')) {
    return content
      .replace(/【食材不足】製作【(.+)】短缺: (.+)！無法出餐！/g, '[Out of Stock] Shortage of $2 for $1! Cannot prepare!')
      .replace(/越光米/g, 'Rice').replace(/生鮮鮭魚/g, 'Salmon').replace(/黃金金槍魚/g, 'Tuna')
      .replace(/北海道海膽/g, 'Uni').replace(/A5極品和牛/g, 'Wagyu').replace(/有明海苔/g, 'Nori')
      .replace(/靜岡本格山葵/g, 'Wasabi').replace(/熟成酪梨/g, 'Avocado');
  }
  if (content.includes('【緊急斷料告警】')) {
    return content
      .replace(/【緊急斷料告警】工單 #(\w+) 嚴重缺料：(.+)！請蓮立刻調配採購！/g, '[Stockout Alert] Order #$1 critically short on $2! Ren, please restock urgently!')
      .replace(/rice/g, 'Rice').replace(/salmon/g, 'Salmon').replace(/tuna/g, 'Tuna')
      .replace(/uni/g, 'Uni').replace(/wagyu/g, 'Wagyu').replace(/nori/g, 'Nori')
      .replace(/wasabi/g, 'Wasabi').replace(/avocado/g, 'Avocado');
  }
  if (content.includes('【物資入庫通知】')) {
    return content
      .replace(/【物資入庫通知】已採購補充 (.+) \+(\d+) 份，目前儲備充裕！/g, '[Stock Arrived] Procured and restocked $1 +$2 packs. Supply is healthy!')
      .replace(/越光米/g, 'Rice').replace(/生鮮鮭魚/g, 'Salmon').replace(/黃金金槍魚/g, 'Tuna')
      .replace(/北海道海膽/g, 'Uni').replace(/A5極品和牛/g, 'Wagyu').replace(/有明海苔/g, 'Nori')
      .replace(/靜岡本格山葵/g, 'Wasabi').replace(/熟成酪梨/g, 'Avocado');
  }
  if (content.includes('【資金預警】')) {
    return content
      .replace(/【資金預警】想要採購【(.+)】需要 \$(\d+)，但當前資金僅剩 \$(\d+)！暫緩採購。/g, '[Budget Warning] Procurement for $1 needs $$2, but cash is only $$3! Postponed.')
      .replace(/越光米/g, 'Rice').replace(/生鮮鮭魚/g, 'Salmon').replace(/黃金金槍魚/g, 'Tuna')
      .replace(/北海道海膽/g, 'Uni').replace(/A5極品和牛/g, 'Wagyu').replace(/有明海苔/g, 'Nori')
      .replace(/靜岡本格山葵/g, 'Wasabi').replace(/熟成酪梨/g, 'Avocado');
  }
  if (content.includes('【店長關懷】')) {
    return content.replace(/【店長關懷】已向桌號 (\w+)【(.+)】贈送御抹茶點心，有效撫平客訴風險。/g, (m, tbl, cust) => {
      return `[Manager Care] Offered premium matcha treat to table ${tbl} (${translateCustomerName(cust, 'en')}), successfully restoring patience.`;
    });
  }
  if (content.includes('【營運健康度審計】')) {
    return content.replace(/【營運健康度審計】目前營收: \$(\d+) \| 結餘: \$(\d+) \| 已接待客數: (\d+) \| 待出餐工單: (\d+) 張。/g,
      '[Audit] Total Revenue: $$1 | Cash: $$2 | Guests Served: $3 | Pending Orders: $4 tickets.');
  }
  if (content.includes('【顧客離去】')) {
    return content.replace(/【顧客離去】隊列中的顧客【(.+)】因久候不耐離店！/g, (m, c) => {
      return `[Guest Left] Queued guest ${translateCustomerName(c, 'en')} left due to long wait!`;
    });
  }
  if (content.includes('【客訴離席】')) {
    return content.replace(/【客訴離席】已入座的顧客【(.+)】因後廚出餐過慢憤而離席！/g, (m, c) => {
      return `[Complaint Walkout] Seated guest ${translateCustomerName(c, 'en')} walked out due to slow kitchen service!`;
    });
  }
  if (content.includes('【定期營運成本結算】')) {
    return content.replace(/【定期營運成本結算】店租水電 -\$(\d+)，發放 (\d+) 位員工工資 -\$(\d+)（總支出: -\$(\d+)，當前可用結餘: \$(\d+)）。/g,
      '[Overhead Settlement] Rent & utilities -$$1, payroll ($2 staff) -$$3 (Total: -$$4, Balance: $$5).');
  }
  if (content.includes('打烊收工】')) {
    return content.replace(/🌇【第 (\d+) 天 21:00 打烊收工】今日營業時段圓滿結束！請檢閱今日收支結算，並點擊「🌅 進入第 (\d+) 天」準備明日開工！/g,
      '🌇 [Day $1 Shift Ended (9:00 PM)] Business hours concluded! Review daily performance and click "Day $2 Open" to prepare for tomorrow!');
  }
  if (content.includes('【餐廳破產 Game Over】')) {
    return content.replace(/【餐廳破產 Game Over】資金赤字已達 \$(-?\d+)（小於 \$0），現金流斷裂無法繼續營運！請優化食材採購與員工薪資支出。/g,
      '[Bankruptcy Game Over] Deficit reached $$1 (< $0)! Cash flow collapsed. Please optimize purchasing and payroll.');
  }
  if (content.includes('【口碑崩盤 Game Over】')) {
    return content.replace(/【口碑崩盤 Game Over】顧客平均滿意度已跌至 (.+) 顆星（下滑至 3.0 顆星門檻），食客紛紛留下負評抵制，餐廳被迫歇業！/g,
      '[Rating Crash Game Over] Satisfaction dropped to $1 stars (below 3.0-star threshold)! Negative reviews forced the restaurant to close.');
  }
  if (content.includes('【排隊告急預警】')) {
    return content.replace(/⚠️【排隊告急預警】手動攬客使候位隊列膨脹至 (\d+) 人！顧客耐心消耗極快，後廚出餐不及將引發大量客訴離店（滿意度跌破 3.0 即 Game Over）！/g,
      '⚠️ [Queue Surge Alert] Queue has reached $1 guests! Kitchen must speed up service, or rating drops below 3.0 will trigger Game Over!');
  }
  if (content.includes('【手動邀約 VIP】')) {
    return '👑 [VIP Invited] Michelin food critic entered! Aoi must prioritize seating, Kenji must strictly enforce dietary rules!';
  }
  if (content.includes('【發動街頭吸客潮】')) {
    return content.replace(/🎉【發動街頭吸客潮】吸引 (\d+) 位新顧客湧入！考驗產能與翻台平衡！/g,
      '🎉 [Street Surge] Attracted $1 new guests at once! Testing kitchen capacity and table turnover!');
  }
  if (content.includes('【外場主動攬客】')) {
    return '📢 [Host Welcomed Guest] Guided 1 new guest to the waiting queue.';
  }
  if (content.includes('【招聘新員工入職】')) {
    return content.replace(/🤝【招聘新員工入職】成功聘用【(.+)】擔任【(.+)】！支付簽約金 \$(\d+)，每期工資 \$(\d+)。特長：(.+)/g,
      '🤝 [Staff Hired] Hired $1 as $2! Signing bonus $$3, wage $$4/cycle. Perk: $5');
  }
  if (content.includes('【員工解聘資遣】')) {
    return content.replace(/👋【員工解聘資遣】店長辦理解聘【(.+)】（(.+)），停止計發後續每期工資 \$(\d+)，以降低固定營運成本。/g,
      '👋 [Staff Dismissed] Dismissed $1 ($2), stopped periodic wage $$3 to lower fixed overhead.');
  }
  if (content.includes('開工營業 (11:00 AM)】')) {
    return content.replace(/🌅【第 (\d+) 天 開工營業 \(11:00 AM\)】今日市況：(.+) 全體員工已就位！請點擊「開始運行」開門迎賓！/g,
      '🌅 [Day $1 Shift Open (11:00 AM)] Market trend active. All staff ready! Click Start to open doors!');
  }
  if (content.includes('【席位已達上限】')) {
    return '⚠️ [Max Tables Limit] Capacity reached maximum 16 tables! Chain branch expansion unlocked! Click Google Map button to expand!';
  }
  if (content.includes('【擴建失敗】')) {
    return content.replace(/❌【擴建失敗】資金不足！增設一張餐桌需要 \$(\d+)，目前結餘僅有 \$(\d+)。/g,
      '❌ [Expansion Failed] Insufficient funds! Adding a table requires $$1, current balance is only $$2.');
  }
  if (content.includes('【席位達最高上限 (16席)！】')) {
    return '🎊 [16 Tables Max Limit!] Successfully expanded to 16 tables! Chain Franchise Expansion unlocked! Open branches on Google Map!';
  }
  if (content.includes('【店面擴建】')) {
    return content.replace(/🎉【店面擴建】投資 \$(\d+) 成功添置【(.+)】（(.+)）！目前總席位擴增至 (\d+)\/16 席！/g,
      '🎉 [Dining Area Expanded] Invested $$1 to install $2! Total capacity expanded to $4/16 tables!');
  }
  if (content.includes('【開設分店失敗】')) {
    return content.replace(/❌【開設分店失敗】資金不足！開設【(.+)】需要開辦金 \$(\d+)，目前結餘僅有 \$(\d+)。/g,
      '❌ [Branch Failed] Insufficient funds! Opening $1 requires $$2, current balance is only $$3.');
  }
  if (content.includes('【開設全新分店成功！】')) {
    return content.replace(/🏢【開設全新分店成功！】投資 \$(\d+) 在【(.+)】開設了全新的連鎖分店【(.+)】！/g,
      '🏢 [New Branch Opened!] Invested $$1 to establish new branch "$3" in $2!');
  }
  if (content.includes('【忌口備註疏漏】')) {
    return content.replace(/⚠️【忌口備註疏漏】阿葵提示詞未指示記錄特殊忌口，忽略了顧客【(.+)】的要求（(.+)）！/g, (m, c, note) => {
      return `⚠️ [Dietary Note Missed] Aoi prompt did not instruct recording special dietary needs, ignoring guest ${translateCustomerName(c, 'en')} note (${translateCustomerNote(note, 'en')})!`;
    });
  }
  if (content.includes('【重大客訴】')) {
    return content.replace(/❌【重大客訴】顧客【(.+)】極度憤怒：『我交代了忌口（(.+)），餐廳竟然未按要求出餐！』留下 1 顆星極差負評！/g, (m, c, note) => {
      return `❌ [Severe Complaint] Guest ${translateCustomerName(c, 'en')} is furious: "I gave dietary instructions (${translateCustomerNote(note, 'en')}), and the kitchen ignored them!" Left a 1-star negative review!`;
    });
  }
  if (content.includes('【店長客訴挽救生效】')) {
    return content.replace(/🍵【店長客訴挽救生效】提示詞指示主動安撫！發現顧客【(.+)】等待時間過長（耐心值僅剩 (\d+)%），店長授權 complaint_remedy 贈送高級宇治抹茶甜品，恢復耐心值 \+35%！/g, (m, c, pct) => {
      return `🍵 [Manager Remedy Active] Prompt instructed proactive soothing! Guest ${translateCustomerName(c, 'en')} was impatient (patience ${pct}%), manager sent matcha dessert, restoring +35% patience!`;
    });
  }
  if (content.includes('【客訴危機警示】')) {
    return content.replace(/⚠️【客訴危機警示】顧客【(.+)】耐心值告急（剩 (\d+)%）！但櫻的提示詞中未指示【客訴安撫\/抹茶甜品】，未能及時挽留客人！/g, (m, c, pct) => {
      return `⚠️ [Patience Alert] Guest ${translateCustomerName(c, 'en')} patience low (${pct}%)! Sakura's prompt lacked soothing instructions to retain guest!`;
    });
  }
  if (content.includes('【預算控管策略生效】')) {
    return content.replace(/🛡️【預算控管策略生效】提示詞指示節流防破產！當前結餘 \$(\d+) < \$140，暫緩高價食材【(.+)】採購（單次花費 \$(\d+)），優先維持越光米與鮭魚等基本盤！/g,
      '🛡️ [Budget Defense Active] Frugal policy active! Cash balance $$1 < $140, postponing expensive ingredient $2 (cost $$3) to protect cash flow!');
  }

  // Thoughts patterns
  let out = content;
  out = out.replace(/看見顧客【(.+)】(.*)在隊列中等待，引導帶位至【(.+)】。/g, (m, c, vip, tbl) => {
    return `Saw guest ${translateCustomerName(c, 'en')} waiting in queue, escorted to ${tbl}.`;
  });
  out = out.replace(/記錄點餐【(.+)】(.*)，生成工單 #(\w+) 傳送後廚。/g, (m, dish, note, id) => {
    return `Recorded order ${dish}, generated ticket #${id} for kitchen.`;
  });
  out = out.replace(/從料理台【(.+)】端送【(.+)】給【(.+)】。/g, (m, stn, dish, c) => {
    return `Delivered ${dish} from station ${stn} to ${translateCustomerName(c, 'en')}.`;
  });
  out = out.replace(/為【(.+)】辦理結帳：實收 \$(\d+)，收到小費 \$(\d+)。評價：(.*)/g, (m, c, bill, tip, stars) => {
    return `Processed bill for ${translateCustomerName(c, 'en')}: collected $$${bill}, tip $$${tip}. Rating: ${stars}`;
  });
  out = out.replace(/料理完成！在【(.+)】完成【(.+)】精美擺盤，呼叫阿葵取餐。/g, (m, stn, dish) => {
    return `Plated ${dish} at ${stn}, notified Aoi for pickup.`;
  });
  out = out.replace(/在【(.+)】開火製作【(.+)】工單 #(\w+)(.*)/g, (m, stn, dish, id, note) => {
    return `Started prepping ${dish} at ${stn} for ticket #${id}.`;
  });
  out = out.replace(/庫存盤點發現【(.+)】僅剩 (\d+) 份（低於安全門檻 (\d+)），執行 order_ingredient 向豐洲市場採購 (\d+) 份 \(花費 \$(\d+)\)。/g, (m, item, cur, th, qty, cost) => {
    return `Audit found ${item} at ${cur} units (< threshold ${th}). Procured ${qty} units from market (cost $$${cost}).`;
  });

  // General vocabulary substitution
  out = out
    .replace(/越光米/g, 'Rice')
    .replace(/生鮮鮭魚/g, 'Salmon')
    .replace(/黃金金槍魚/g, 'Tuna')
    .replace(/北海道海膽/g, 'Uni')
    .replace(/A5極品和牛/g, 'Wagyu')
    .replace(/有明海苔/g, 'Nori')
    .replace(/靜岡本格山葵/g, 'Wasabi')
    .replace(/熟成酪梨/g, 'Avocado')
    .replace(/極上鮭魚握壽司/g, 'Salmon Nigiri')
    .replace(/鮮金槍魚握壽司/g, 'Tuna Nigiri')
    .replace(/海膽軍艦卷/g, 'Uni Gunkan')
    .replace(/特級炙燒和牛握壽司/g, 'Aburi Wagyu Nigiri')
    .replace(/加州酪梨蔬食卷/g, 'Avocado Veggie Roll')
    .replace(/極上壽司拼盤/g, 'Omakase Platter')
    .replace(/吧台/g, 'Counter')
    .replace(/雅座/g, 'Table')
    .replace(/阿葵/g, 'Aoi')
    .replace(/健次/g, 'Kenji')
    .replace(/蓮/g, 'Ren')
    .replace(/櫻/g, 'Sakura');

  return out;
}
