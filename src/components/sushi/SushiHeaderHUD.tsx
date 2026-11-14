import React from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Award,
  Zap,
  UserPlus,
  Coins,
  Star,
  Users,
  Clock,
  PlusCircle,
  Globe
} from 'lucide-react';
import { SimulationSpeed, SushiScenario, SushiSimulationState } from '../../lib/sushi/types';
import { SUSHI_SCENARIOS } from '../../lib/sushi/defaultScenarios';
import { getSushiClockInfo } from '../../lib/sushi/timeConstants';
import { useSushiI18n, SushiLanguage } from '../../lib/sushi/i18n';

interface SushiHeaderHUDProps {
  state: SushiSimulationState;
  currentScenario: SushiScenario;
  onSelectScenario: (id: string) => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: SimulationSpeed) => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpawnCustomer: (isVip?: boolean, burstCount?: number) => void;
  onToggleRushHour: () => void;
  onToggleSound: () => void;
  onOpenGuide: () => void;
  onOpenReport: () => void;
  onAddTable?: () => void;
  onOpenStaffModal?: () => void;
  onStartNextDay?: () => void;
  onOpenBranchMapModal?: () => void;
  onSelectBranch?: (branchId: string) => void;
}

export const SushiHeaderHUD: React.FC<SushiHeaderHUDProps> = ({
  state,
  currentScenario,
  onSelectScenario,
  onTogglePlay,
  onSetSpeed,
  onStepForward,
  onReset,
  onSpawnCustomer,
  onToggleRushHour,
  onToggleSound,
  onOpenGuide,
  onOpenReport,
  onAddTable,
  onOpenStaffModal,
  onStartNextDay,
  onOpenBranchMapModal,
  onSelectBranch
}) => {
  const { language, setLanguage, t, getScenarioName, getMarketInfo } = useSushiI18n();
  const isRunning = state.status === 'running';
  const clockInfo = getSushiClockInfo(state.tick, state.day, state.isShiftEnded, language);
  const marketInfo = state.marketCondition
    ? getMarketInfo(state.marketCondition.id, state.marketCondition.title, state.marketCondition.description)
    : null;

  return (
    <header className="flex flex-col bg-slate-900 border-b border-amber-900/40 select-none shadow-xl z-20 shrink-0">
      {/* ── ROW 1: BRAND, PRIMARY SIMULATION CONTROLS & UTILITIES ───────────── */}
      <div className="h-10 px-2 sm:px-3 flex items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-950/70 text-slate-200 min-w-0 max-w-full overflow-hidden">
        {/* Left: Brand & Scenario Switcher */}
        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white font-mono text-xs transition shrink-0 whitespace-nowrap shadow-sm"
            title="Return to Hub Lobby"
          >
            <span>🏠</span>
            <span className="font-bold">{t('lobby')}</span>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-base">🍣</span>
            <span className="font-black text-xs sm:text-sm text-white tracking-wide whitespace-nowrap">
              {t('brandTitle')}
            </span>
            {state.status === 'failed' ? (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-600 text-white font-black animate-pulse whitespace-nowrap">
                {t('gameOverBadge')}
              </span>
            ) : (
              <span className="hidden xl:inline text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                {t('multiAgentBadge')}
              </span>
            )}
          </div>

          {/* Scenario Switcher Dropdown */}
          <div className="flex items-center shrink-0">
            <select
              value={currentScenario.id}
              onChange={e => onSelectScenario(e.target.value)}
              className="bg-slate-800 hover:bg-slate-750 text-xs text-amber-200 border border-amber-700/60 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-semibold cursor-pointer max-w-[130px] sm:max-w-[170px] md:max-w-[210px] truncate shadow-sm"
              title={getScenarioName(currentScenario.id)}
            >
              {SUSHI_SCENARIOS.map(sc => (
                <option key={sc.id} value={sc.id} className="bg-slate-900 text-white font-medium">
                  [{sc.difficulty}] {getScenarioName(sc.id)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Play/Pause, Step, Speed, Reset Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-lg p-0.5 shadow-sm">
            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-sm ${
                isRunning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title={isRunning ? t('pause') : t('play')}
            >
              {isRunning ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isRunning ? t('pause').split(' ')[0] : t('play').split(' ')[0]}</span>
            </button>

            {/* Step Button */}
            <button
              onClick={onStepForward}
              disabled={isRunning}
              className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition shrink-0 ml-0.5"
              title={t('step')}
            >
              <FastForward className="w-3 h-3" />
            </button>

            {/* Speeds */}
            <div className="flex items-center border-l border-slate-700 ml-1 pl-1 shrink-0 font-mono">
              {([1, 2, 5] as SimulationSpeed[]).map(spd => (
                <button
                  key={spd}
                  onClick={() => onSetSpeed(spd)}
                  className={`px-1.5 py-0.2 text-xs font-bold rounded transition shrink-0 ${
                    state.speed === spd
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={t('speed', { spd })}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={onReset}
              className="p-1 text-slate-400 hover:text-rose-400 transition ml-0.5 shrink-0"
              title={t('reset')}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Sound, Report, Guide & Multi-Language Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-1 rounded-lg border transition shrink-0 ${
              state.soundEnabled
                ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
            title={state.soundEnabled ? t('soundOn') : t('soundOff')}
          >
            {state.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Report Button */}
          <button
            onClick={onOpenReport}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-purple-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition shrink-0 shadow-sm"
            title={t('report')}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">{t('report').split(' ')[0]}</span>
          </button>

          {/* Guide Tutorial */}
          <button
            onClick={onOpenGuide}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition shrink-0 shadow-sm"
            title={t('guide')}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t('guide').split(' ')[0]}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="flex items-center bg-slate-800 border border-amber-500/40 rounded-lg px-1.5 py-0.5 shrink-0 text-xs text-amber-200 shadow-sm hover:border-amber-400 transition">
            <Globe className="w-3 h-3 text-amber-400 mr-1 shrink-0" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as SushiLanguage)}
              className="bg-transparent text-xs text-amber-200 focus:outline-none cursor-pointer font-bold shrink-0"
              title={t('language')}
            >
              <option value="zh-TW" className="bg-slate-900 text-white font-medium">繁中</option>
              <option value="en" className="bg-slate-900 text-white font-medium">English</option>
              <option value="zh-CN" className="bg-slate-900 text-white font-medium">简中</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── ROW 2: LIVE METRICS STRIP & INTERACTIVE QUICK-OPS ───────────────── */}
      <div className="h-10 px-2 sm:px-3 flex items-center justify-between gap-2 bg-slate-900/95 text-xs whitespace-nowrap overflow-x-auto scrollbar-none min-w-0 max-w-full">
        {/* Left: Clear Live KPI Badges */}
        <div className="flex items-center gap-1.5 font-mono shrink-0 whitespace-nowrap">
          {/* Cash Balance */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border shrink-0 ${
              state.financials.balance < 50
                ? 'border-rose-500 bg-rose-950/60 text-rose-300 animate-pulse font-bold'
                : 'border-slate-700 bg-slate-800 text-emerald-400 font-bold'
            }`}
            title={t('cashBalance')}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black">${state.financials.balance.toFixed(0)}</span>
            {state.financials.balance < 50 && (
              <span className="text-[10px] text-rose-400 font-bold uppercase">
                {state.financials.balance < 0 ? t('bankrupt') : t('urgent')}
              </span>
            )}
          </div>

          {/* Revenue */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-white font-bold shrink-0"
            title={t('totalRevenue')}
          >
            <span className="text-emerald-400 text-xs">📈</span>
            <span className="text-xs sm:text-sm font-black text-emerald-300">${state.financials.totalRevenue.toFixed(0)}</span>
          </div>

          {/* Rating */}
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border shrink-0 ${
              state.metrics.averageSatisfactionStars <= 3.5
                ? 'border-rose-500 bg-rose-950/60 text-rose-300 animate-pulse font-bold'
                : 'border-slate-700 bg-slate-800 text-amber-300 font-bold'
            }`}
            title={t('satisfaction')}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black">{state.metrics.averageSatisfactionStars.toFixed(1)}</span>
          </div>

          {/* Customers Served */}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-sky-300 font-bold shrink-0"
            title={t('servedTarget')}
          >
            <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black">
              {state.metrics.customersServed}
              {currentScenario.difficulty === 'Sandbox' ? '' : `/${currentScenario.targetServed}`}
            </span>
          </div>

          {/* Structured Shift Clock */}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-800 text-amber-300 font-bold shrink-0"
            title={clockInfo.shiftPhaseLabel}
          >
            <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-white text-xs font-bold">
              {clockInfo.time12} (D{clockInfo.day})
            </span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950 text-amber-200 border border-amber-800 font-sans hidden sm:inline">
              {clockInfo.shiftPhaseEmoji} {clockInfo.shiftPhaseLabel}
            </span>
          </div>

          {/* Market Trend */}
          {marketInfo && (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shrink-0 cursor-help"
              title={`${marketInfo.title}: ${marketInfo.desc}`}
            >
              <span>{state.marketCondition?.emoji}</span>
              <span className="font-semibold text-amber-200 hidden 2xl:inline">{marketInfo.title}</span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Operation Tools */}
        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
          {/* Next Day Transition Button */}
          {state.isShiftEnded && onStartNextDay && (
            <button
              onClick={onStartNextDay}
              className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 flex items-center gap-1 shadow-md shadow-rose-950 animate-bounce active:scale-95 shrink-0"
              title={t('startNextDay', { day: state.day + 1 })}
            >
              <span>🌅</span>
              <span>{t('startNextDayShort', { day: state.day + 1 })}</span>
            </button>
          )}

          {/* Spawn Customer Group */}
          <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-sm">
            <button
              onClick={() => onSpawnCustomer(false, 1)}
              className="px-2 py-0.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 flex items-center gap-1 transition"
              title="Spawn 1 regular guest to queue"
            >
              <UserPlus className="w-3 h-3 text-sky-400 shrink-0" />
              <span>{t('addCustomer')}</span>
            </button>
            <button
              onClick={() => onSpawnCustomer(true, 1)}
              className="px-1.5 py-0.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 border-l border-slate-700 transition"
              title="Invite VIP Critic to dine"
            >
              {t('addVip')}
            </button>
            <button
              onClick={() => onSpawnCustomer(false, 3)}
              className="px-1.5 py-0.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 border-l border-slate-700 transition flex items-center gap-0.5"
              title={t('burstTooltip')}
            >
              <span>🔥</span>
              <span>{t('burstShort')}</span>
            </button>
          </div>

          {/* Add Table Button */}
          {onAddTable && (
            <button
              onClick={onAddTable}
              disabled={state.tables.length >= 16}
              className="px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
              title={state.tables.length >= 16 ? t('tableFull') : `${t('addTable')} ($150)`}
            >
              <PlusCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{t('addTableShort')}</span>
              <span className="font-mono font-bold bg-amber-950 px-1 py-0.2 rounded border border-amber-800 text-[11px]">
                {state.tables.length}/16
              </span>
            </button>
          )}

          {/* Staff Modal Button */}
          {onOpenStaffModal && (
            <button
              onClick={onOpenStaffModal}
              className="px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-600/50 shadow-sm shrink-0"
              title="Staff Recruitment & Management"
            >
              <Users className="w-3 h-3 text-sky-400 shrink-0" />
              <span>{t('staff')}</span>
              <span className="font-mono font-bold bg-sky-900 px-1 py-0.2 rounded border border-sky-700 text-[11px]">
                {state.hiredStaff?.length || 0}
              </span>
            </button>
          )}

          {/* Google Map Branch Modal Button */}
          {onOpenBranchMapModal && (
            <button
              onClick={onOpenBranchMapModal}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm shrink-0 ${
                state.tables.length >= 16 || state.hasReachedMaxTables
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 border border-amber-300 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
              }`}
              title={state.tables.length >= 16 || state.hasReachedMaxTables ? t('branchMap') : t('branchMapShort')}
            >
              <span>🗺️</span>
              <span>{state.tables.length >= 16 || state.hasReachedMaxTables ? t('branchMap') : t('branchMapShort')}</span>
              {state.branches && (
                <span className="font-mono font-bold bg-slate-950 text-amber-300 px-1 py-0.2 rounded text-[11px]">
                  {state.branches.length}
                </span>
              )}
            </button>
          )}

          {/* Rush Hour Toggle */}
          <button
            onClick={onToggleRushHour}
            className={`px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition shrink-0 ${
              state.rushHourActive
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/60 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
            }`}
            title="Toggle Peak Rush Hour"
          >
            <Zap className={`w-3 h-3 ${state.rushHourActive ? 'text-rose-400' : 'text-slate-400'} shrink-0`} />
            <span>{t('rushHour')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
