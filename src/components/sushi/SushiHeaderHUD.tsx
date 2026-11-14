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
  Truck,
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
  const clockInfo = getSushiClockInfo(state.tick, state.day, state.isShiftEnded);
  const marketInfo = state.marketCondition
    ? getMarketInfo(state.marketCondition.id, state.marketCondition.title, state.marketCondition.description)
    : null;

  return (
    <header className="h-16 bg-slate-900/95 border-b border-amber-900/40 px-2.5 sm:px-4 flex items-center justify-between gap-2.5 select-none shadow-lg z-20 backdrop-blur-md overflow-x-auto overflow-y-hidden scrollbar-none">
      {/* 1. Brand Logo & Portal Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Return to Portal Hub */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 hover:text-white font-mono text-xs transition shrink-0 shadow-sm shadow-amber-950 whitespace-nowrap"
          title="返回 AI Agent 遊戲教育大廳"
        >
          <span className="text-sm">🏠</span>
          <span className="font-bold">{t('lobby')}</span>
        </Link>

        {/* Switch to RoboFlow Button */}
        <Link
          href="/roboflow"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/50 text-xs font-mono transition shrink-0 whitespace-nowrap"
          title="切換至 RoboFlow 物流車隊派單遊戲"
        >
          <Truck className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden xl:inline font-semibold">{t('roboflow')}</span>
        </Link>

        <div className="h-5 w-[1px] bg-slate-800 mx-0.5 hidden sm:block shrink-0" />

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-lg shadow-md shadow-rose-950/40 shrink-0">
            🍣
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm sm:text-base tracking-wide text-white whitespace-nowrap">
                {t('brandTitle')}
              </span>
              {state.status === 'failed' ? (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-600 text-white font-black animate-pulse shadow-md shadow-rose-950 shrink-0 whitespace-nowrap">
                  {t('gameOverBadge')}
                </span>
              ) : (
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 whitespace-nowrap">
                  {t('multiAgentBadge')}
                </span>
              )}
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 font-mono whitespace-nowrap">{t('brandSub')}</p>
          </div>
        </div>

        {/* Scenario Switcher with compact max-width */}
        <div className="hidden lg:flex items-center shrink-0">
          <select
            value={currentScenario.id}
            onChange={e => onSelectScenario(e.target.value)}
            className="bg-slate-800/90 hover:bg-slate-750 text-xs sm:text-sm text-amber-200 border border-amber-800/60 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-semibold cursor-pointer shadow-sm max-w-[150px] sm:max-w-[200px] xl:max-w-[260px] truncate"
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

      {/* 2. Central Live KPI Badges: Compact Pill Bar (< 2xl) and Rich Badges (>= 2xl) */}
      
      {/* 2A. Compact Streamlined KPI Bar (Visible below 2xl screens: 1280px, 1366px, 1440px) */}
      <div className="flex 2xl:hidden items-center gap-1.5 font-mono text-xs shrink-0">
        {/* Cash */}
        <div
          className={`flex items-center gap-1 bg-slate-800/90 border px-2 py-1 rounded-lg shrink-0 whitespace-nowrap ${
            state.financials.balance < 50
              ? 'border-rose-500/80 bg-rose-950/40 text-rose-300 animate-pulse font-bold'
              : 'border-slate-750 text-emerald-400 font-bold'
          }`}
          title={t('cashBalance')}
        >
          <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>${state.financials.balance.toFixed(0)}</span>
          {state.financials.balance < 50 && (
            <span className="text-[9px] text-rose-400 font-bold uppercase ml-0.5">
              {state.financials.balance < 0 ? t('bankrupt') : t('urgent')}
            </span>
          )}
        </div>

        {/* Revenue */}
        <div
          className="hidden sm:flex items-center gap-1 bg-slate-800/90 border border-slate-750 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap text-white font-bold"
          title={t('totalRevenue')}
        >
          <span className="text-[10px] text-emerald-400">📈</span>
          <span>${state.financials.totalRevenue.toFixed(0)}</span>
        </div>

        {/* Rating */}
        <div
          className={`flex items-center gap-1 bg-slate-800/90 border px-2 py-1 rounded-lg shrink-0 whitespace-nowrap ${
            state.metrics.averageSatisfactionStars <= 3.5
              ? 'border-rose-500/80 bg-rose-950/40 text-rose-300 animate-pulse font-bold'
              : 'border-slate-750 text-amber-300 font-bold'
          }`}
          title={t('satisfaction')}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
          <span>{state.metrics.averageSatisfactionStars.toFixed(1)}</span>
        </div>

        {/* Customers */}
        <div
          className="flex items-center gap-1 bg-slate-800/90 border border-slate-750 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap text-sky-300 font-bold"
          title={t('servedTarget')}
        >
          <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            {state.metrics.customersServed}
            {currentScenario.difficulty === 'Sandbox' ? '' : `/${currentScenario.targetServed}`}
          </span>
        </div>

        {/* Shift Clock */}
        <div
          className="flex items-center gap-1 bg-slate-800/90 border border-slate-750 px-2 py-1 rounded-lg shrink-0 whitespace-nowrap text-amber-300 font-bold"
          title={clockInfo.shiftPhaseLabel}
        >
          <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>D{clockInfo.day} {clockInfo.time12}</span>
        </div>

        {/* Market condition */}
        {marketInfo && (
          <div
            className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-750 text-xs shrink-0 whitespace-nowrap"
            title={marketInfo.desc}
          >
            <span>{state.marketCondition?.emoji}</span>
            <span className="font-semibold text-amber-200">{marketInfo.title}</span>
          </div>
        )}
      </div>

      {/* 2B. Rich Expanded KPI Badges (Visible only on 2xl: >= 1536px) */}
      <div className="hidden 2xl:flex items-center gap-2.5 shrink-0">
        {/* Cash Balance */}
        <div
          className={`flex items-center gap-2 bg-slate-800/90 border rounded-xl px-3 py-1.5 shadow-sm shrink-0 whitespace-nowrap ${
            state.financials.balance < 50
              ? 'border-rose-500/80 bg-rose-950/40 animate-pulse'
              : 'border-slate-700/80'
          }`}
        >
          <Coins className={`w-4 h-4 ${state.financials.balance < 50 ? 'text-rose-400' : 'text-amber-400'} shrink-0`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 leading-none">{t('cashBalance')}</span>
              {state.financials.balance < 50 && (
                <span className="text-[9px] text-rose-400 font-bold leading-none animate-pulse">
                  {state.financials.balance < 0 ? t('bankrupt') : t('urgent')}
                </span>
              )}
            </div>
            <span
              className={`text-sm font-mono font-bold leading-tight ${
                state.financials.balance < 0
                  ? 'text-rose-400'
                  : state.financials.balance < 50
                  ? 'text-amber-300'
                  : 'text-emerald-400'
              }`}
            >
              ${state.financials.balance.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm shrink-0 whitespace-nowrap">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 leading-none">{t('totalRevenue')}</span>
            <span className="text-sm font-mono font-bold text-white leading-tight">
              ${state.financials.totalRevenue.toFixed(0)}
            </span>
          </div>
        </div>

        {/* CSAT Stars */}
        <div
          className={`flex items-center gap-2 bg-slate-800/90 border rounded-xl px-3 py-1.5 shadow-sm shrink-0 whitespace-nowrap ${
            state.metrics.averageSatisfactionStars <= 3.5
              ? 'border-rose-500/80 bg-rose-950/40 animate-pulse'
              : 'border-slate-700/80'
          }`}
        >
          <Star
            className={`w-4 h-4 ${
              state.metrics.averageSatisfactionStars <= 3.5
                ? 'text-rose-400 fill-rose-400'
                : 'text-amber-400 fill-amber-400'
            } shrink-0`}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 leading-none">{t('satisfaction')}</span>
              {state.metrics.averageSatisfactionStars <= 3.5 && (
                <span className="text-[9px] text-rose-400 font-bold leading-none animate-pulse">
                  {state.metrics.averageSatisfactionStars <= 3.0 ? t('csatCrash') : t('csatDanger')}
                </span>
              )}
            </div>
            <span
              className={`text-sm font-mono font-bold leading-tight ${
                state.metrics.averageSatisfactionStars <= 3.5 ? 'text-rose-300' : 'text-amber-300'
              }`}
            >
              {state.metrics.averageSatisfactionStars.toFixed(1)} ★
            </span>
          </div>
        </div>

        {/* Customers Served */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-sm shrink-0 whitespace-nowrap">
          <Users className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 leading-none">{t('servedTarget')}</span>
            <span className="text-sm font-mono font-bold text-sky-300 leading-tight">
              {state.metrics.customersServed}{' '}
              <span className="text-slate-500 font-normal">
                {currentScenario.difficulty === 'Sandbox' ? '' : `/ ${currentScenario.targetServed}`}
              </span>
            </span>
          </div>
        </div>

        {/* Structured Day & Shift Clock HUD */}
        <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-sm shrink-0 whitespace-nowrap">
          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-1.5 font-mono">
              <span className="text-xs text-amber-300 font-bold leading-none">
                {t('dayClock', { day: clockInfo.day, time: clockInfo.time12 })}
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950/80 text-amber-200 border border-amber-800/50 leading-none">
                {clockInfo.shiftPhaseEmoji} {clockInfo.shiftPhaseLabel}
              </span>
            </div>
            <div className="w-24 bg-slate-900 rounded-full h-1.5 overflow-hidden mt-1 border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${clockInfo.progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Market Condition Pill */}
        {marketInfo && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-750 text-xs shrink-0 whitespace-nowrap"
            title={marketInfo.desc}
          >
            <span>{state.marketCondition?.emoji}</span>
            <span className="font-semibold text-amber-200">{marketInfo.title}</span>
          </div>
        )}
      </div>

      {/* 3. Action & Simulation Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Next Day Shift Transition Button */}
        {state.isShiftEnded && onStartNextDay && (
          <button
            onClick={onStartNextDay}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-rose-950 animate-bounce active:scale-95 shrink-0 whitespace-nowrap"
            title={t('startNextDay', { day: state.day + 1 })}
          >
            <span>🌅</span>
            <span className="font-black">{t('startNextDayShort', { day: state.day + 1 })}</span>
          </button>
        )}

        {/* Staff Management Button */}
        {onOpenStaffModal && (
          <button
            onClick={onOpenStaffModal}
            className="px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all bg-sky-950/70 hover:bg-sky-900 text-sky-200 border border-sky-600/50 shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
            title="招聘或管理員工 (Staff Management)"
          >
            <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden lg:inline">{t('staff')}</span>
            <span className="text-[10px] bg-sky-900/90 px-1 py-0.5 rounded text-sky-200 border border-sky-700 font-mono font-bold">
              {state.hiredStaff?.length || 0}
            </span>
          </button>
        )}

        {/* Rush Hour Toggle */}
        <button
          onClick={onToggleRushHour}
          className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all shrink-0 whitespace-nowrap ${
            state.rushHourActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
          }`}
          title="切換午間爆單潮 (Rush Hour)"
        >
          <Zap className={`w-3.5 h-3.5 ${state.rushHourActive ? 'text-rose-400' : 'text-slate-400'} shrink-0`} />
          <span className="hidden xl:inline">{t('rushHour')}</span>
        </button>

        {/* Spawn Customer Manually with Burst */}
        <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 whitespace-nowrap">
          <button
            onClick={() => onSpawnCustomer(false, 1)}
            className="px-2 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-1 transition"
            title="手動外場攬客：引導 1 位顧客進店排隊"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="hidden xl:inline">{t('addCustomer')}</span>
          </button>
          <button
            onClick={() => onSpawnCustomer(true, 1)}
            className="px-1.5 sm:px-2 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 border-l border-slate-700/60 transition"
            title="手動邀約米其林 VIP 貴賓進店"
          >
            {t('addVip')}
          </button>
          <button
            onClick={() => onSpawnCustomer(false, 3)}
            className="px-1.5 sm:px-2 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 border-l border-slate-700/60 transition flex items-center gap-0.5"
            title={t('burstTooltip')}
          >
            <span>🔥</span>
            <span className="hidden 2xl:inline">{t('burstShort')}</span>
          </button>
        </div>

        {/* Expand Restaurant Tables */}
        {onAddTable && (
          <button
            onClick={onAddTable}
            disabled={state.tables.length >= 16}
            className="px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
            title={state.tables.length >= 16 ? t('tableFull') : `${t('addTable')} ($150)`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden xl:inline">{t('addTableShort')}</span>
            <span className="text-[10px] bg-amber-950/90 px-1 py-0.5 rounded text-amber-200 border border-amber-800/80 font-mono">
              {state.tables.length}/16
            </span>
          </button>
        )}

        {/* Multi-Branch Switcher Dropdown (when > 1 branch) */}
        {state.branches && state.branches.length > 1 && (
          <select
            value={state.activeBranchId}
            onChange={e => onSelectBranch?.(e.target.value)}
            className="hidden sm:inline-block bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/50 rounded-lg px-2 py-1 text-xs font-bold cursor-pointer shrink-0 max-w-[130px] truncate"
            title="切換不同分店實景"
          >
            {state.branches.map(b => (
              <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                🏢 {b.name} ({b.tables?.length || 6}/16)
              </option>
            ))}
          </select>
        )}

        {/* Google Map Branch Expansion Button */}
        {onOpenBranchMapModal && (
          <button
            onClick={onOpenBranchMapModal}
            className={`px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap ${
              state.tables.length >= 16 || state.hasReachedMaxTables
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 border border-amber-300 animate-pulse shadow-rose-950'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
            }`}
            title={
              state.tables.length >= 16 || state.hasReachedMaxTables
                ? t('branchMap')
                : t('branchMapShort')
            }
          >
            <span>🗺️</span>
            <span className="hidden xl:inline">
              {state.tables.length >= 16 || state.hasReachedMaxTables ? t('branchMap') : t('branchMapShort')}
            </span>
            {state.branches && (
              <span className="text-[10px] bg-slate-950/80 text-amber-300 px-1 py-0.5 rounded font-mono font-bold">
                {t('branchCount', { count: state.branches.length })}
              </span>
            )}
          </button>
        )}

        {/* Playback Controls (Play / Pause, Speed, Step) */}
        <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg p-0.5 shrink-0">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded-md transition shrink-0 ${
              isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
            title={isRunning ? t('pause') : t('play')}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={isRunning}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-40 transition shrink-0"
            title={t('step')}
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Speed 1x, 2x, 5x */}
          <div className="flex items-center border-l border-slate-700/60 ml-0.5 pl-0.5 shrink-0">
            {([1, 2, 5] as SimulationSpeed[]).map(spd => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-1.5 py-1 text-[11px] font-mono rounded transition shrink-0 ${
                  state.speed === spd
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={t('speed', { spd })}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition ml-0.5 shrink-0"
            title={t('reset')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition shrink-0 ${
            state.soundEnabled
              ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
              : 'bg-slate-800/50 text-slate-500 border-slate-800'
          }`}
          title={state.soundEnabled ? t('soundOn') : t('soundOff')}
        >
          {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Report Button */}
        <button
          onClick={onOpenReport}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-purple-300 border border-slate-700 transition shrink-0"
          title={t('report')}
        >
          <Award className="w-4 h-4" />
        </button>

        {/* Help Guide */}
        <button
          onClick={onOpenGuide}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 transition shrink-0"
          title={t('guide')}
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Language Switcher Dropdown */}
        <div className="flex items-center bg-slate-800/90 border border-slate-700/60 rounded-lg px-2 py-1 shrink-0 text-xs text-amber-200 shadow-sm hover:border-amber-500/50 transition">
          <Globe className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as SushiLanguage)}
            className="bg-transparent text-xs text-amber-200 focus:outline-none cursor-pointer font-bold shrink-0"
            title={t('language')}
          >
            <option value="zh-TW" className="bg-slate-900 text-white font-medium">繁中</option>
            <option value="en" className="bg-slate-900 text-white font-medium">EN</option>
            <option value="zh-CN" className="bg-slate-900 text-white font-medium">简中</option>
          </select>
        </div>
      </div>
    </header>
  );
};
