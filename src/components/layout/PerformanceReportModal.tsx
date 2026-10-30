'use client';

import React, { useState } from 'react';
import {
  Trophy,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  Clock,
  Battery,
  Lightbulb,
  RotateCcw,
  X,
  Target,
  DollarSign,
  Activity,
  Zap,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { SimulationState, GameScenario } from '../../lib/types';
import { translations, Language } from '../../lib/i18n';
import { DEFAULT_SCENARIOS } from '../../lib/defaultScenarios';
import { CITIES_DATA, getCitySectorStatus } from '../../lib/cityData';

interface PerformanceReportModalProps {
  state: SimulationState;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelectScenario: (scenario: GameScenario) => void;
  onContinueEndless?: () => void;
  agentPrompt?: string;
  promptIterations?: number;
  lang: Language;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  state,
  isOpen,
  onClose,
  onRetry,
  onSelectScenario,
  onContinueEndless,
  agentPrompt = '',
  promptIterations = 1,
  lang
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const t = translations[lang].report;
  const isVictory = state.status === 'victory';
  const isGameOver = state.status === 'game_over';

  const {
    metrics,
    financials,
    orders,
    robots,
    scenario
  } = state;

  const netProfit = financials.totalRevenue - financials.totalExpenses;
  const currentCity = CITIES_DATA[state.currentCityId] || CITIES_DATA.singapore;
  const currentLevel = state.levelProgression?.currentLevel || 1;
  const sectorStatus = getCitySectorStatus(currentCity, state.hubs);

  // Generate automated constructive prompt critiques based on simulation trace & metrics
  const generatePromptCritiques = (): string[] => {
    const critiques: string[] = [];

    // 1. Battery depletion critique
    const hasStrandedBots = robots.some(r => r.batteryPct <= 5);
    const lowBatteryWarningCount = state.thoughtLogs.filter(l => l.content.includes('CRITICAL: ') && l.content.includes('battery')).length;
    if (hasStrandedBots || lowBatteryWarningCount > 0) {
      critiques.push(
        lang === 'zh'
          ? '🔋 电池耗尽抛锚：检测到机器人在中途抛锚，触发了额外救援施救费。建议在系统提示词中增加硬性阈值，例如：“严禁将电池低于30%的机器人分配长途订单”，并确保开启 order_battery_recharge 工具。'
          : '🔋 Battery Starvation Detected: Robots ran out of battery mid-transit, incurring recovery penalties. Add a strict safety threshold in your System Prompt: "Never dispatch any robot below 30% battery" and ensure the order_battery_recharge tool is enabled.'
      );
    }

    // 2. SLA breach critique
    if (metrics.totalFailed > 0) {
      critiques.push(
        lang === 'zh'
          ? `⏱️ SLA超时违约：共有 ${metrics.totalFailed} 单因超时履约被扣罚违约金。建议在提示词中优先处理剩余时钟周期短的订单（如：“按 remainingTicks 升序优先调度”），并在拥堵区域启用交通绕行。`
          : `⏱️ SLA Deadline Breaches: ${metrics.totalFailed} order(s) exceeded their delivery window. Suggestion: Instruct your agent to sort by urgency ("Prioritize orders where (deadlineTick - currentTick) < 20") and avoid routes with trafficMultiplier > 2.0.`
      );
    }

    // 3. Profit margin & travel cost critique
    if (metrics.profitMargin < 20) {
      critiques.push(
        lang === 'zh'
          ? '💰 净利润率偏低：里程磨损与能耗成本过高。建议在提示词中加入载重容量匹配：“优先将高报酬大件包裹分配给高载重小车，避免绕远路单趟空载”。'
          : '💰 Low Profit Margin: Travel mileage wear and energy costs eroded your delivery income. Add directives to optimize route efficiency: "Select the closest available robot to the pickup hub and favor high-reward parcel routes".'
      );
    }

    // 4. Fallback if flawless
    if (critiques.length === 0) {
      critiques.push(
        lang === 'zh'
          ? '🏆 卓越架构表现：提示词策略出色兼顾了电量、载重与SLA时效！可尝试切换至【中央主干动脉高峰大拥堵】或【热带暴雨电量危机】挑战更高阶智能体场景。'
          : '🏆 Exemplary Prompt Architecture: Your agent balanced SLA urgency, battery safety, and routing costs flawlessly. Try stepping up to Scenario 2 (Rush Hour Detours) or Scenario 3 (Battery Monsoon)!'
      );
    }

    return critiques.slice(0, 3);
  };

  const critiques = generatePromptCritiques();

  // Find next scenario if current is completed
  const currentScenarioIndex = DEFAULT_SCENARIOS.findIndex(s => s.id === scenario.id);
  const nextScenario = currentScenarioIndex >= 0 && currentScenarioIndex < DEFAULT_SCENARIOS.length - 1
    ? DEFAULT_SCENARIOS[currentScenarioIndex + 1]
    : null;

  const nextScenarioTitle = nextScenario
    ? ((translations[lang].scenarios as any)[nextScenario.id]?.title || nextScenario.title)
    : '';

  // Copy Classroom Assignment to Clipboard
  const handleCopyReport = () => {
    const sectorStatus = getCitySectorStatus(currentCity, state.hubs);
    const reportText = [
      `=========================================`,
      `🎓 RoboFlow 2028 课堂实验答卷 (Classroom Assignment)`,
      `=========================================`,
      `- 关卡阶段: 第 ${currentLevel} 关 (${currentLevel === 1 ? '新手第一公里' : currentLevel === 2 ? '车队与枢纽大亨' : '全城物流霸主'})`,
      `- 运营城市: ${lang === 'zh' ? currentCity.nameZh : currentCity.name}`,
      `- 商业版图扩张: 已解锁至【${lang === 'zh' ? sectorStatus.currentSectorNameZh : sectorStatus.currentSectorNameEn}】(全城拥有 ${state.hubs.length} 座枢纽站点，车队规模 ${robots.length} 台)`,
      `- 提示词迭代优化: 共 ${promptIterations} 次调整尝试`,
      `- 财库期末余额: $${financials.balance.toFixed(2)}`,
      `- 净利润: $${netProfit.toFixed(2)} (净利润率: ${metrics.profitMargin}%)`,
      `- 履约准时率 (SLA): ${metrics.onTimeDeliveryRate}%`,
      `- 成功送达: ${metrics.totalDelivered} 单 | 超时违约: ${metrics.totalFailed} 单`,
      `- 运营支出明细: 电力 $${financials.energyCosts.toFixed(2)} | 里程磨损 $${financials.mileageCosts.toFixed(2)} | 站点租金 $${(financials.hubRentCosts || 0).toFixed(2)} | SLA罚金 $${financials.slaPenalties.toFixed(2)}`,
      ``,
      `💡 系统架构师诊断与改进建议:`,
      ...critiques.map((c, i) => `${i + 1}. ${c}`),
      ``,
      `📝 我的调度系统提示词 (System Prompt):`,
      `-----------------------------------------`,
      agentPrompt.trim() ? agentPrompt.trim() : `(学员使用空提示词/默认逻辑)`,
      `-----------------------------------------`,
      `提交时间: ${new Date().toLocaleString()}`,
      `=========================================`
    ].join('\n');

    navigator.clipboard.writeText(reportText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header Banner */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isVictory
            ? 'bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-cyan-500/50'
            : isGameOver
            ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border-rose-500/50'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isVictory
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : isGameOver
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {isVictory ? <Trophy className="w-6 h-6 text-amber-400" /> : <AlertOctagon className="w-6 h-6 text-rose-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {isVictory ? (lang === 'zh' ? '闯关胜利！物流帝国扩张' : t.victoryTitle) : isGameOver ? (lang === 'zh' ? '挑战失败：财库破产' : t.defeatTitle) : t.title}
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                  {lang === 'zh' ? `第${currentLevel}关` : `LVL ${currentLevel}`}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {lang === 'zh' ? currentCity.nameZh : currentCity.name} &bull; {scenario.title} &bull; {lang === 'zh' ? `第 ${promptIterations} 次迭代` : `Iter #${promptIterations}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-sm text-center">
              <span className="text-[11px] text-slate-400 block mb-1">{t.netTreasury}</span>
              <span className={`text-xl font-black ${financials.balance > 0 ? 'text-cyan-300' : 'text-rose-400'}`}>
                ${financials.balance.toFixed(0)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-sm text-center">
              <span className="text-[11px] text-slate-400 block mb-1">{lang === 'zh' ? '净利润' : 'Net Profit'}</span>
              <span className={`text-xl font-black flex items-center justify-center gap-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(0)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-sm text-center">
              <span className="text-[11px] text-slate-400 block mb-1">{t.onTimeRate}</span>
              <span className={`text-xl font-black ${metrics.onTimeDeliveryRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.onTimeDeliveryRate}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-sm text-center">
              <span className="text-[11px] text-slate-400 block mb-1">{t.ordersDelivered}</span>
              <span className="text-xl font-black text-cyan-300">
                {metrics.totalDelivered}/{metrics.totalOrdersSpawned}
              </span>
            </div>
          </div>

          {/* Logistics Empire Expansion Card */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-indigo-950/60 border border-purple-500/40 flex items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🗺️</span>
              <div>
                <span className="text-[10px] text-purple-300 font-bold block">
                  {lang === 'zh' ? '全城物流商业版图' : 'METROPOLIS EMPIRE EXPANSION'}
                </span>
                <span className="text-slate-200 font-bold">
                  {lang === 'zh' ? sectorStatus.currentSectorNameZh : sectorStatus.currentSectorNameEn}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-1 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-200 font-bold text-[11px]">
                {lang === 'zh' ? `已建 ${state.hubs.length} 座站点` : `${state.hubs.length} Hubs Active`}
              </span>
              <span className="px-2 py-1 rounded-lg bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-bold text-[11px]">
                {lang === 'zh' ? `车队 ${robots.length} 台` : `${robots.length} Bots`}
              </span>
            </div>
          </div>

          {/* Detailed Financial Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[11px] text-slate-500 block">{lang === 'zh' ? '电费能耗' : 'Energy'}</span>
              <span className="font-bold text-slate-300">-${financials.energyCosts.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">{lang === 'zh' ? '里程磨损' : 'Mileage'}</span>
              <span className="font-bold text-slate-300">-${financials.mileageCosts.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">{lang === 'zh' ? '站点租金' : 'Hub Rent'}</span>
              <span className="font-bold text-slate-300">-${(financials.hubRentCosts || 0).toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">{lang === 'zh' ? 'SLA罚金' : 'Penalties'}</span>
              <span className="font-bold text-amber-400">-${financials.slaPenalties.toFixed(1)}</span>
            </div>
          </div>

          {/* Automated Constructive Prompt Critiques */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{t.promptCritiqueTitle}</span>
            </div>
            <div className="space-y-2">
              {critiques.map((critique, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-950 text-xs text-slate-200 leading-relaxed font-sans"
                >
                  {critique}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.playAgain}</span>
            </button>

            {/* Copy Classroom Assignment Button */}
            <button
              onClick={handleCopyReport}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all font-bold ${
                isCopied
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/50 text-cyan-300 hover:text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{isCopied ? (lang === 'zh' ? '已复制答卷到剪贴板！' : 'Copied to Clipboard!') : (lang === 'zh' ? '📋 复制课堂答卷' : '📋 Copy Assignment')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isVictory && (
              <button
                onClick={() => {
                  if (onContinueEndless) onContinueEndless();
                  else onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '👑 开启无尽大亨模式' : '👑 ENDLESS EMPIRE'}</span>
              </button>
            )}

            {nextScenario && isVictory && (
              <button
                onClick={() => {
                  onSelectScenario(nextScenario);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                {lang === 'zh' ? '下一关卡: ' : 'NEXT LEVEL: '}
                {nextScenarioTitle} &rarr;
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
            >
              {t.closeModal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
