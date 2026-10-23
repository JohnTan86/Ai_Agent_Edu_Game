'use client';

import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { SimulationState, GameScenario } from '../../lib/types';
import { translations, Language } from '../../lib/i18n';
import { DEFAULT_SCENARIOS } from '../../lib/defaultScenarios';

interface PerformanceReportModalProps {
  state: SimulationState;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelectScenario: (scenario: GameScenario) => void;
  onContinueEndless?: () => void;
  lang: Language;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  state,
  isOpen,
  onClose,
  onRetry,
  onSelectScenario,
  onContinueEndless,
  lang
}) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header Banner */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${
          isVictory
            ? 'bg-gradient-to-r from-cyan-950/80 via-emerald-950/40 to-slate-900 border-cyan-500/40'
            : 'bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isVictory
                ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-rose-900/50 border-rose-400 text-rose-300'
            }`}>
              {isVictory ? <Trophy className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-wider text-slate-100 uppercase">
                {isVictory ? t.victoryTitle : t.defeatTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {isVictory ? t.victoryDesc : t.defeatDesc}
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

        {/* Evaluation Metrics Grid */}
        <div className="p-6 overflow-y-auto space-y-5 font-mono">
          {/* Key Formula Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* 1. Efficiency Score */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-900/60 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">
                {t.efficiencyScore}
              </span>
              <div className="text-2xl font-black text-cyan-300">
                {metrics.agentEfficiencyScore}%
              </div>
              <span className="text-[9px] text-slate-500">
                ({metrics.totalDelivered} / {Math.max(1, metrics.totalTravelTicks)} ticks)
              </span>
            </div>

            {/* 2. Profit Margin */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">
                {t.profitMargin}
              </span>
              <div className={`text-2xl font-black ${metrics.profitMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.profitMargin}%
              </div>
              <span className="text-[9px] text-slate-500">
                Net: ${netProfit.toFixed(2)}
              </span>
            </div>

            {/* 3. SLA Adherence */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block mb-1">
                {t.onTimeRate}
              </span>
              <div className={`text-2xl font-black ${metrics.onTimeDeliveryRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.onTimeDeliveryRate}%
              </div>
              <span className="text-[9px] text-slate-500">
                {metrics.totalDelivered} on-time
              </span>
            </div>
          </div>

          {/* Secondary Financial Breakdown */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block">{t.ordersDelivered}</span>
              <span className="font-bold text-slate-200">{metrics.totalDelivered}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{t.netTreasury}</span>
              <span className="font-bold text-cyan-300">${financials.balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{t.totalExpenses}</span>
              <span className="font-bold text-rose-400">-${financials.totalExpenses.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">SLA BREACHES</span>
              <span className="font-bold text-amber-400">{metrics.totalFailed}</span>
            </div>
          </div>

          {/* Living Economy Operational Cost Breakdown */}
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[10px] grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-slate-400">
            <div>
              <span className="text-[9px] text-slate-500 block">{lang === 'zh' ? '充电电费' : 'Power'}</span>
              <span className="font-bold text-slate-300">-${financials.energyCosts.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">{lang === 'zh' ? '里程磨损' : 'Mileage'}</span>
              <span className="font-bold text-slate-300">-${financials.mileageCosts.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">{lang === 'zh' ? '车队维保' : 'Maint'}</span>
              <span className="font-bold text-slate-300">-${financials.maintenanceCosts.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">{lang === 'zh' ? '站点租金' : 'Hub Rent'}</span>
              <span className="font-bold text-slate-300">-${(financials.hubRentCosts || 0).toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 block">{lang === 'zh' ? 'SLA罚金' : 'Penalties'}</span>
              <span className="font-bold text-amber-400">-${financials.slaPenalties.toFixed(1)}</span>
            </div>
          </div>

          {/* Automated Constructive Prompt Critiques */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{t.promptCritiqueTitle}</span>
            </div>
            <div className="space-y-2">
              {critiques.map((critique, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/90 border border-cyan-950 text-xs text-slate-300 leading-relaxed font-sans"
                >
                  {critique}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between font-mono text-xs">
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.playAgain}</span>
          </button>

          <div className="flex items-center gap-2">
            {isVictory && (
              <button
                onClick={() => {
                  if (onContinueEndless) onContinueEndless();
                  else onClose();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '👑 开启无尽大亨模式 (无限经营)' : '👑 CONTINUE ENDLESS EMPIRE'}</span>
              </button>
            )}

            {nextScenario && isVictory && (
              <button
                onClick={() => {
                  onSelectScenario(nextScenario);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                {lang === 'zh' ? '下一关卡: ' : 'NEXT LEVEL: '}
                {nextScenarioTitle} &rarr;
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
            >
              {t.closeModal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
