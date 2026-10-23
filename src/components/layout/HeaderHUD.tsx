'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  HelpCircle,
  Bot,
  Zap,
  Flame,
  Globe,
  Award,
  Truck,
  Lock,
  Sun,
  Moon,
  Clock,
  Calendar
} from 'lucide-react';
import { GameScenario, SimulationStatus, LevelProgression } from '../../lib/types';
import { DEFAULT_SCENARIOS } from '../../lib/defaultScenarios';
import { getDayClockInfo } from '../../lib/constants';
import { translations, Language } from '../../lib/i18n';

interface HeaderHUDProps {
  currentScenario: GameScenario;
  onSelectScenario: (scenario: GameScenario) => void;
  status: SimulationStatus;
  tick: number;
  currentDay?: number;
  isShiftEnded?: boolean;
  levelProgression?: LevelProgression;
  balance?: number;
  cityCoveragePct?: number;
  onOpenGuide: () => void;
  onOpenReport: () => void;
  onOpenShop?: () => void;
  onSpawnOrder: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  currentScenario,
  onSelectScenario,
  status,
  tick,
  currentDay,
  isShiftEnded,
  levelProgression,
  balance = 100,
  cityCoveragePct,
  onOpenGuide,
  onOpenReport,
  onOpenShop,
  onSpawnOrder,
  showHeatmap,
  onToggleHeatmap,
  lang,
  onToggleLang,
  theme = 'dark',
  onToggleTheme
}) => {
  const t = translations[lang];
  const clockInfo = getDayClockInfo(tick, currentDay, isShiftEnded);

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {t.liveSimulation}
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {t.paused}
          </span>
        );
      case 'game_over':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            {t.fleetCritical}
          </span>
        );
      case 'victory':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            {t.missionAccomplished}
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            {t.standby}
          </span>
        );
    }
  };

  return (
    <header className="h-14 border-b border-cyan-950/60 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none">
      {/* Brand & Academy Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-black tracking-wider text-base text-slate-100 flex items-center">
              {t.appTitle}<span className="text-cyan-400 ml-1.5 text-xs font-semibold tracking-normal px-1 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">2028</span>
            </span>
            <span className="hidden md:inline-block text-[10px] font-mono tracking-widest text-slate-400 uppercase border-l border-slate-800 pl-2">
              {t.appSubtitle}
            </span>
          </div>
        </div>
      </div>

      {/* Middle HUD: Scenario Selector & Tick Counter */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Scenario Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1">
          <span className="text-[11px] font-mono text-slate-400">{t.scenarioLabel}:</span>
          <select
            value={currentScenario.id}
            onChange={(e) => {
              const found = DEFAULT_SCENARIOS.find(s => s.id === e.target.value);
              if (found) onSelectScenario(found);
            }}
            className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer"
          >
            {DEFAULT_SCENARIOS.map(sc => {
              const translated = t.scenarios[sc.id as keyof typeof t.scenarios];
              return (
                <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                  {translated ? `${translated.title} [${translated.difficulty}]` : `${sc.title} [${sc.difficulty}]`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Level Progression Banner */}
        {levelProgression && (
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              levelProgression.currentLevel === 3
                ? 'bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-cyan-950/90 border border-purple-500/60 shadow-[0_0_18px_rgba(168,85,247,0.3)]'
                : 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  levelProgression.currentLevel === 3 ? 'bg-purple-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`font-bold ${
                  levelProgression.currentLevel === 3 ? 'text-purple-300' : 'text-cyan-300'
                }`}
              >
                {lang === 'zh'
                  ? (levelProgression.currentLevel === 1
                      ? '第1关：新手第一公里'
                      : (levelProgression.currentLevel === 2 ? '第2关：车队与枢纽大亨' : '第3关：全城物流霸主'))
                  : (levelProgression.currentLevel === 1
                      ? 'LVL 1: The First Mile'
                      : (levelProgression.currentLevel === 2 ? 'LVL 2: Fleet Tycoon' : 'LVL 3: Metropolis Master'))}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-cyan-800/60 text-[11px]">
              <span className="text-slate-400">
                {lang === 'zh' ? '配送:' : 'Orders:'}
              </span>
              <span className="font-bold text-emerald-400">
                {levelProgression.levelDeliveriesCompleted}/{levelProgression.levelTargetDeliveries}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                {lang === 'zh' ? '财库:' : 'Cash:'}
              </span>
              <span className={`font-bold ${balance >= levelProgression.levelTargetCash ? 'text-emerald-400' : 'text-amber-300'}`}>
                ${balance.toFixed(0)}/${levelProgression.levelTargetCash}
              </span>
              {levelProgression.currentLevel === 3 && cityCoveragePct !== undefined && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">
                    {lang === 'zh' ? '全城覆盖:' : 'Coverage:'}
                  </span>
                  <span
                    className={`font-bold ${
                      cityCoveragePct >= 85 ? 'text-emerald-400' : 'text-purple-300'
                    }`}
                  >
                    {cityCoveragePct}%
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Status Pill */}
        <div>{getStatusBadge()}</div>

        {/* Day & Real-Time Shift Clock HUD (08:00 AM - 06:00 PM) */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/40 px-3 py-1 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.18)]">
          <div className="flex items-center gap-1 pr-2 border-r border-slate-700/80">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-mono font-bold text-amber-300">
              {lang === 'zh' ? `第 ${clockInfo.day} 天` : `DAY ${clockInfo.day}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wide">
              {clockInfo.time12}
            </span>
            <span
              className={`hidden xl:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                clockInfo.isShiftEnd
                  ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                  : clockInfo.isPreShift
                  ? 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {clockInfo.isShiftEnd
                ? (lang === 'zh' ? '🌇 18:00 已收工' : '🌇 06:00 PM Closed')
                : clockInfo.isPreShift
                ? (lang === 'zh' ? '🌅 08:00 开工前规划' : '🌅 08:00 AM Pre-Shift')
                : (lang === 'zh' ? '🚚 08:00-18:00 班次中' : '🚚 Shift Active')}
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions: Theme Toggle, Language Toggle, Heatmap, Spawn Order, Report, Guide */}
      <div className="flex items-center gap-2">
        {/* Light / Dark Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={
              lang === 'zh'
                ? (theme === 'dark' ? '切换至亮色主题 (Light Theme)' : '切换至暗色主题 (Dark Theme)')
                : (theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme')
            }
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:text-amber-300"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{lang === 'zh' ? '亮色' : 'Light'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">{lang === 'zh' ? '暗色' : 'Dark'}</span>
              </>
            )}
          </button>
        )}

        {/* Multi-language Toggle Button */}
        <button
          onClick={onToggleLang}
          title="Switch Language (English / 中文)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:text-cyan-300"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.langToggle}</span>
        </button>

        <button
          onClick={onToggleHeatmap}
          title="Toggle Traffic Heatmap"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
            showHeatmap
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{t.trafficBtn}</span>
        </button>

        <button
          onClick={onSpawnOrder}
          title="Inject dynamic customer parcel order"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition-all hover:border-cyan-500/40"
        >
          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">{t.addOrderBtn}</span>
        </button>

        {/* Shop Button (Locked in Level 1, Unlocked in Level 2) */}
        {onOpenShop && (
          <button
            onClick={levelProgression?.currentLevel === 1 ? undefined : onOpenShop}
            title={levelProgression?.currentLevel === 1 ? (lang === 'zh' ? '第 1 关完成后解锁科技商店' : 'Unlocked after Level 1') : (lang === 'zh' ? '打开车队与站点科技商店' : 'Open Fleet & Hub Tech Shop')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              levelProgression?.currentLevel === 1
                ? 'bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse'
            }`}
          >
            {levelProgression?.currentLevel === 1 ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Truck className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-bold">
              {lang === 'zh'
                ? (levelProgression?.currentLevel === 1 ? '商店 (L2解锁)' : '科技商店')
                : (levelProgression?.currentLevel === 1 ? 'SHOP (LVL 2)' : 'TECH SHOP')}
            </span>
          </button>
        )}

        <button
          onClick={onOpenReport}
          title="View Architect Performance Evaluation Report"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-all hover:border-amber-500/40"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{t.reportBtn}</span>
        </button>

        <button
          onClick={onOpenGuide}
          title="Game Rules & Agent Architecting Guide"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{t.guideBtn}</span>
        </button>
      </div>
    </header>
  );
};
