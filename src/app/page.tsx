'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  Sparkles,
  Bot,
  Brain,
  Zap,
  Key,
  Globe,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  UtensilsCrossed,
  Activity,
  Tractor,
  ExternalLink,
  Info,
  ChevronRight,
  Play
} from 'lucide-react';

export default function EduAgentPortal() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'deepseek'>('gemini');
  const [isSaved, setIsSaved] = useState(false);

  // Load API Key from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('eduagent_gemini_key') || localStorage.getItem('eduagent_api_key');
      const savedProvider = (localStorage.getItem('eduagent_provider') as any) || 'gemini';
      if (savedKey) setApiKey(savedKey);
      if (savedProvider) setProvider(savedProvider);
    } catch {
      // ignore
    }
  }, []);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('eduagent_gemini_key', apiKey.trim());
      localStorage.setItem('eduagent_api_key', apiKey.trim());
      localStorage.setItem('eduagent_provider', provider);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      setTimeout(() => setApiKeyModalOpen(false), 1200);
    } catch {
      // ignore
    }
  };

  const t = {
    zh: {
      platformBadge: 'AI 智能體遊戲化教育中心 · 課堂實戰平台',
      titleHighlight: 'AI Agent 遊戲教育大廳',
      heroTitle: '用系統提示詞，指揮真實世界的自主智能體',
      heroSubtitle:
        '告別枯燥的傳統對話框！讓學生化身 AI 系統架構師，透過「Prompt Engineering」與「多智能體協同 (Multi-Agent Swarm)」指揮城市無人車隊與迴轉壽司名店，在動態商業世界中體驗決策的魅力。',
      btnPlayRoboFlow: '進入 RoboFlow 物流車隊',
      btnPlaySushi: '進入 壽司物語 AI 餐廳',
      btnConfigureKey: '設定全域 API Key',
      keyConfiguredBadge: '已設定 API Key',
      keyEmptyBadge: '使用免 Key 本地模式',
      guideBtn: '課堂教學指南',
      statGames: '2 款完整上線遊戲',
      statRealTime: '100% 瀏覽器即開即玩',
      statModels: 'Gemini 2.5 / OpenAI / DeepSeek',
      statClassroom: '支援 60~90 分鐘專題課程',

      // Games Section
      gamesHeader: '精選 AI Agent 教育遊戲專區',
      gamesSub: '每個遊戲聚焦不同的 AI 智能體核心概念，從單智能體排程到多智能體協同。',

      // Game 1
      g1Tag: '核心專題 · 已上線',
      g1Title: 'RoboFlow 2028',
      g1Sub: '智慧城市無人車隊自主調度系統',
      g1Desc:
        '你將擔任無人配送車隊的中央調度智能體。面對全城不斷湧入的高價值包裹、SLA 履約倒數、突發暴雨與道路嚴重擁堵，如何設計完美的系統提示詞（System Prompt），實現準時送達率 100% 與商業淨利潤最大化？',
      g1Highlights: [
        '單智能體決策與約束條件權衡 (Constraint Optimization)',
        'SLA 截止時限倒數與超時罰款防護',
        '電池續航管理、基站自動回充與充電樁升級擴建',
        '新加坡、東京、紐約 3 大真實都市真實路網 (OSRM) 避障'
      ],
      g1Level: '難度：初級 ～ 中級',
      g1Role: '角色：中央調度智能體 (Dispatcher Agent)',

      // Game 2
      g2Tag: '多智能體協同 · 全新推出',
      g2Title: '壽司物語 AI (Sushi Master)',
      g2Sub: 'AI 多智能體協同經營迴轉壽司名店',
      g2Desc:
        '突破單一 Agent 局限！帶領一個由 4 名 AI 智能體組成的團隊：帶位迎賓員 (Host)、壽司大廚 (Chef)、庫存採購經理 (Inventory) 與營運店長 (Manager)。體驗智能體間的通信訊息流、生鮮耗損控制與客流滿意度管理。',
      g2Highlights: [
        'Multi-Agent 職責拆解與跨智能體通訊機制 (Agent Comms)',
        '生鮮食材保鮮期與尖峰客流需求預測 (Demand Forecasting)',
        '座位輪轉效率、顧客滿意度 (CSAT) 與利潤平衡',
        '即時 2D 壽司店面可視化與透明思考推理鏈 (Reasoning Trace)'
      ],
      g2Level: '難度：中級 ～ 高級',
      g2Role: '角色：4 大智能體協同團隊 (Host / Chef / Inventory / Manager)',

      // Upcoming
      g3Tag: '即將推出 · Coming Soon',
      g3Title: '智慧醫院 AI (Smart Hospital)',
      g3Sub: '急診三級分診與重症監護資源調度',
      g3Desc: '模擬綜合醫院急診室與 ICU 病床資源調度，考驗學生設計 AI 道德守衛邊界 (Guardrails)、救治優先級判斷與醫護排班協同。',
      g4Tag: '規劃中 · Planned',
      g4Title: '智慧農場 AI (Smart Farm)',
      g4Sub: '氣象預測與無人農機集群協同',
      g4Desc: '結合實時氣象雷達與大宗糧價期貨，指揮多台無人收割機與灌溉無人機，實現抗旱防災與產量最大化。',

      // Steps
      stepsTitle: '教師與學生 4 步通關學習路徑',
      s1Title: '1. 選擇業務情境',
      s1Desc: '挑選無人配送物流或迴轉壽司店，了解業務核心目標與約束條件。',
      s2Title: '2. 配置大模型引擎',
      s2Desc: '填入 Google Gemini API Key，或直接使用內建的本地啟發式引擎零門檻開跑。',
      s3Title: '3. 編寫系統提示詞 (Prompt)',
      s3Desc: '在工作台寫下你的調度決策協議、邊界規則與任務優先級，隨時點擊手動派單測試。',
      s4Title: '4. 觀察思考與績效複盤',
      s4Desc: '展開右側 Telemetry 觀察 Agent 的思考推理鏈 (Reasoning Trace)，查看當日評分報告。'
    },
    en: {
      platformBadge: 'AI Agent Educational Arcade · Classroom Ready',
      titleHighlight: 'AI Agent Edu Arcade Hub',
      heroTitle: 'Command Autonomous Agents with System Prompts in Real-World Scenarios',
      heroSubtitle:
        'Move beyond static chatbots! Students become AI System Architects, utilizing Prompt Engineering and Multi-Agent Orchestration to command autonomous delivery fleets and bustling sushi restaurants.',
      btnPlayRoboFlow: 'Play RoboFlow Fleet',
      btnPlaySushi: 'Play Sushi Master AI',
      btnConfigureKey: 'Set Global API Key',
      keyConfiguredBadge: 'API Key Active',
      keyEmptyBadge: 'Zero-Key Local Mode',
      guideBtn: 'Teaching Guide',
      statGames: '2 Fully Playable Games',
      statRealTime: '100% In-Browser Zero Setup',
      statModels: 'Gemini 2.5 / OpenAI / DeepSeek',
      statClassroom: 'Optimized for 60-90 min Lessons',

      gamesHeader: 'Featured AI Agent Educational Games',
      gamesSub: 'Each game focuses on key autonomous agent architectures, from single-agent scheduling to multi-agent swarms.',

      g1Tag: 'Core Track · Live',
      g1Title: 'RoboFlow 2028',
      g1Sub: 'Autonomous Delivery Fleet Central Dispatcher',
      g1Desc:
        'Act as the central dispatch AI for a 2028 autonomous delivery fleet. Navigate rush hour bottlenecks, heavy storms, and ticking SLA deadlines across Singapore, Tokyo, and New York. Can your prompt achieve 100% on-time delivery with maximum net profit?',
      g1Highlights: [
        'Single-agent decision-making & constraint trade-offs',
        'SLA deadline countdowns & penalty prevention',
        'Battery management & charging hub network expansion',
        'Real-world OSRM street road curves & congestion detours'
      ],
      g1Level: 'Difficulty: Beginner to Intermediate',
      g1Role: 'Role: Central Dispatcher Agent',

      g2Tag: 'Multi-Agent Swarm · New',
      g2Title: 'Sushi Master AI',
      g2Sub: 'Multi-Agent Collaborative Conveyor Restaurant',
      g2Desc:
        'Step into multi-agent systems! Orchestrate a synchronized team of 4 AI agents: Host, Chef, Inventory Manager, and Store Manager. Master agent-to-agent communication, perishable shelf-life forecasting, and customer satisfaction.',
      g2Highlights: [
        'Multi-Agent role decomposition & inter-agent communication',
        'Perishable ingredient shelf-life & demand forecasting',
        'Seating turnover, customer satisfaction (CSAT) & profit',
        'Live 2D restaurant visualization & visible reasoning traces'
      ],
      g2Level: 'Difficulty: Intermediate to Advanced',
      g2Role: 'Role: 4 Collaborative Agents (Host / Chef / Inventory / Manager)',

      g3Tag: 'Coming Soon',
      g3Title: 'Smart Hospital AI',
      g3Sub: 'Emergency Triage & ICU Bed Orchestration',
      g3Desc: 'Simulate emergency ward triage and ICU bed allocation, challenging students to design safety guardrails and critical care priority protocols.',
      g4Tag: 'Planned',
      g4Title: 'Smart Farm AI',
      g4Sub: 'Weather Radar & Autonomous Harvester Swarm',
      g4Desc: 'Analyze radar telemetry and crop futures to coordinate autonomous tractors and irrigation drones for maximum harvest yield.',

      stepsTitle: '4-Step Classroom Learning Workflow',
      s1Title: '1. Select Business Domain',
      s1Desc: 'Pick between autonomous city logistics or a multi-agent restaurant.',
      s2Title: '2. Select LLM Engine',
      s2Desc: 'Connect Google Gemini or test instantly with the built-in local heuristic engine.',
      s3Title: '3. Engineer System Prompts',
      s3Desc: 'Craft decision protocols, triage constraints, and test prompt iterations in real time.',
      s4Title: '4. Inspect Traces & Report',
      s4Desc: 'Review transparent step-by-step LLM reasoning traces and comprehensive performance scorecards.'
    }
  }[lang];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-cyan-950/50">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                EduAgent.AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              {lang === 'zh' ? 'AI 智能體遊戲化教育平台' : 'Autonomous Agent Educational Arcade'}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Key Global Config Button */}
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.btnConfigureKey}</span>
            {apiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title={t.keyConfiguredBadge} />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-500" title={t.keyEmptyBadge} />
            )}
          </button>

          {/* Guide Modal Button */}
          <button
            onClick={() => setGuideModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-sky-300 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t.guideBtn}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(prev => (prev === 'zh' ? 'en' : 'zh'))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'zh' ? '繁中' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-600/15 blur-[120px] pointer-events-none -z-10" />

        {/* Small platform badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-medium mb-6 backdrop-blur-md shadow-inner shadow-cyan-950">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.platformBadge}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-100 max-w-4xl leading-tight sm:leading-tight">
          {t.heroTitle}
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Hero Quick Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-xs text-slate-400">{lang === 'zh' ? '遊戲庫' : 'Catalog'}</div>
            <div className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
              <span>🎮</span> {t.statGames}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-xs text-slate-400">{lang === 'zh' ? '運行模式' : 'Setup'}</div>
            <div className="text-sm font-bold text-emerald-300 mt-1 flex items-center gap-1.5">
              <span>⚡</span> {t.statRealTime}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-xs text-slate-400">{lang === 'zh' ? '支援模型' : 'AI Models'}</div>
            <div className="text-sm font-bold text-purple-300 mt-1 flex items-center gap-1.5">
              <span>🧠</span> Gemini 2.5 Flash
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="text-xs text-slate-400">{lang === 'zh' ? '課堂友善' : 'Pedagogy'}</div>
            <div className="text-sm font-bold text-amber-300 mt-1 flex items-center gap-1.5">
              <span>🎓</span> 60~90 min 實戰
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="px-4 sm:px-8 max-w-7xl mx-auto w-full pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>🕹️</span>
              <span>{t.gamesHeader}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              {t.gamesSub}
            </p>
          </div>
        </div>

        {/* 2 Primary Playable Games (Large Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* GAME 1: RoboFlow 2028 */}
          <div className="group rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/30 hover:border-cyan-400/70 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/40 relative overflow-hidden">
            {/* Background cyber accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/10 transition" />

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  {t.g1Tag}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  {t.g1Level}
                </span>
              </div>

              {/* Game Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-3xl shadow-lg shadow-cyan-950/60 shrink-0">
                  🚚
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition">
                    {t.g1Title}
                  </h3>
                  <p className="text-sm font-medium text-cyan-400/90 mt-0.5">
                    {t.g1Sub}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {t.g1Desc}
              </p>

              {/* Highlights */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {lang === 'zh' ? '核心 AI 學習要點：' : 'Core AI Concepts:'}
                </div>
                {t.g1Highlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {t.g1Role}
              </span>
              <Link
                href="/roboflow"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-900/40 hover:shadow-cyan-800/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t.btnPlayRoboFlow}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* GAME 2: Sushi Master AI */}
          <div className="group rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-amber-500/30 hover:border-amber-400/70 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-950/40 relative overflow-hidden">
            {/* Background warm accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/10 transition" />

            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  {t.g2Tag}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                  {t.g2Level}
                </span>
              </div>

              {/* Game Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-950/60 shrink-0">
                  🍣
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-amber-300 transition">
                    {t.g2Title}
                  </h3>
                  <p className="text-sm font-medium text-amber-400/90 mt-0.5">
                    {t.g2Sub}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                {t.g2Desc}
              </p>

              {/* Highlights */}
              <div className="space-y-2 mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {lang === 'zh' ? '核心 AI 學習要點：' : 'Core AI Concepts:'}
                </div>
                {t.g2Highlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {lang === 'zh' ? '角色：4 大智能體協同 (Host / Chef / Inventory / Manager)' : 'Role: 4 Collaborative Agents'}
              </span>
              <Link
                href="/sushi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/40 hover:shadow-amber-800/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t.btnPlaySushi}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Future Track Slots (Upcoming Games) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 3: Smart Hospital */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-4 opacity-75 hover:opacity-100 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-2xl shrink-0">
              🏥
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-200 text-base">{t.g3Title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  {t.g3Tag}
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 mt-0.5 font-medium">{t.g3Sub}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.g3Desc}</p>
            </div>
          </div>

          {/* Card 4: Smart Farm */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-4 opacity-75 hover:opacity-100 transition">
            <div className="w-12 h-12 rounded-xl bg-lime-950/80 border border-lime-800/50 flex items-center justify-center text-2xl shrink-0">
              🚜
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-200 text-base">{t.g4Title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-950 text-lime-400 border border-lime-800/40">
                  {t.g4Tag}
                </span>
              </div>
              <p className="text-xs text-lime-400/90 mt-0.5 font-medium">{t.g4Sub}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.g4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Classroom Learning Workflow */}
      <section className="bg-slate-900/40 border-y border-slate-800/80 py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
              {t.stepsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {lang === 'zh'
                ? '專為 60~90 分鐘課堂與工作坊量身打造的沉浸式實驗教學流程'
                : 'Designed specifically for 60-90 minute AI agent workshops and high school / university classes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                01
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1.5">{t.s1Title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t.s1Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 text-blue-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                02
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1.5">{t.s2Title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t.s2Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 text-amber-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                03
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1.5">{t.s3Title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t.s3Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 relative">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800/60 text-purple-400 font-mono font-bold flex items-center justify-center text-sm mb-3">
                04
              </div>
              <h4 className="font-bold text-sm text-slate-200 mb-1.5">{t.s4Title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{t.s4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-slate-900 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          <span>© 2026 EduAgent.AI · MakerKluang Education</span>
          <span className="mx-2">|</span>
          <span>Designed for AI Agent Educational Pedagogy</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setApiKeyModalOpen(true)}
            className="hover:text-cyan-400 transition"
          >
            {t.btnConfigureKey}
          </button>
          <button
            onClick={() => setGuideModalOpen(true)}
            className="hover:text-cyan-400 transition"
          >
            {t.guideBtn}
          </button>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* MODAL 1: Global API Key Setup Modal */}
      {/* ============================================================== */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    {lang === 'zh' ? '全域 API Key 集中管理' : 'Global API Key Settings'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'zh'
                      ? '在此輸入一次，所有 AI Agent 遊戲皆可共用'
                      : 'Saved in your local browser, shared across all games.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {lang === 'zh' ? '模型提供商 (Provider)' : 'AI Provider'}
                </label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini">Google Gemini (Recommended · Free Tier Available)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="deepseek">DeepSeek (V3 / R1)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{lang === 'zh' ? 'API Key 金鑰' : 'API Key Secret'}</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>{lang === 'zh' ? '獲取免費 Gemini Key' : 'Get Free Gemini Key'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <p>
                  💡 <strong>{lang === 'zh' ? '隱私與安全說明' : 'Privacy Note'}:</strong>{' '}
                  {lang === 'zh'
                    ? '您的 API Key 僅儲存於您目前的本機瀏覽器 (localStorage) 中，平台絕不會將金鑰記錄於伺服器。若無金鑰，亦可直接使用內建的「本地啟發式引擎」進行練習。'
                    : 'Your API Key is stored strictly in your browser localStorage. It is never logged on any server.'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      <span>{lang === 'zh' ? '已成功儲存！' : 'Saved Successfully!'}</span>
                    </>
                  ) : (
                    <span>{lang === 'zh' ? '儲存並同步至所有遊戲' : 'Save & Sync across Games'}</span>
                  )}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey('');
                      localStorage.removeItem('eduagent_gemini_key');
                      localStorage.removeItem('eduagent_api_key');
                    }}
                    className="px-3 py-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs transition font-medium"
                    title={lang === 'zh' ? '清除已存的金鑰' : 'Clear Key'}
                  >
                    {lang === 'zh' ? '清除' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Teaching Guide Modal */}
      {/* ============================================================== */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] p-6 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">
                    {lang === 'zh' ? 'AI Agent 課堂教學指引' : 'Classroom Pedagogical Guide'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'zh'
                      ? '專為教師、講師與自學者設計的教學指引'
                      : 'How to run effective 60-90 minute prompt engineering workshops.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-slate-300 leading-relaxed pr-1">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-cyan-300 text-sm mb-2 flex items-center gap-2">
                  <span>🎯</span>
                  <span>{lang === 'zh' ? '教學核心目標 (Learning Objectives)' : 'Learning Objectives'}</span>
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                  <li>
                    <strong>{lang === 'zh' ? '擺脫隨機對話' : 'Structured Output'}</strong>: 理解 AI Agent
                    需要輸出結構化行動方案（如 JSON 派單協議），而非無格式的聊天回覆。
                  </li>
                  <li>
                    <strong>{lang === 'zh' ? '約束條件優先級' : 'Constraint Optimization'}</strong>:
                    學習在有限資源（電量、時間、載重、保鮮期）下，如何用 Prompt 指導 Agent 作出最優決策。
                  </li>
                  <li>
                    <strong>{lang === 'zh' ? '可解釋性與除錯' : 'Reasoning Transparency'}</strong>: 透過右側
                    Telemetry 觀察 Agent 的思考推理過程（Reasoning Trace），找出提示詞邏輯漏洞。
                  </li>
                  <li>
                    <strong>{lang === 'zh' ? '單 Agent ➔ 多 Agent 演進' : 'Single to Multi-Agent'}</strong>: 先在
                    RoboFlow 掌握中央調度，再進入 壽司店 體驗多角色分工與訊息通信。
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <h4 className="font-bold text-amber-300 text-sm mb-2 flex items-center gap-2">
                  <span>⏱️</span>
                  <span>{lang === 'zh' ? '建議 60 分鐘課堂時間表' : 'Suggested 60-min Lesson Plan'}</span>
                </h4>
                <div className="space-y-2 text-slate-300">
                  <div className="flex gap-2">
                    <span className="font-mono font-bold text-amber-400 w-16 shrink-0">00-10 分</span>
                    <span><strong>情境破冰</strong>：介紹無人配送或壽司店經營痛點，展示未經提示詞的 Agent 混亂表現。</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono font-bold text-amber-400 w-16 shrink-0">10-25 分</span>
                    <span><strong>第一輪挑戰</strong>：學生撰寫基礎 Prompt（SLA 優先級、電量保護），運行第 1 個工作日。</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono font-bold text-amber-400 w-16 shrink-0">25-45 分</span>
                    <span><strong>應對突發挑戰</strong>：引入晚高峰嚴重擁堵 (Rush Hour) 或食材斷供，學生疊代修訂 Prompt。</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-mono font-bold text-amber-400 w-16 shrink-0">45-60 分</span>
                    <span><strong>成果評比與覆盤</strong>：調出 Architect Performance Report 查看淨利潤、SLA 履約率與全班分享。</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                {lang === 'zh' ? '關閉指南' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
