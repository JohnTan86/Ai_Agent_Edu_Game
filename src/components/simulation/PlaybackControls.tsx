'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronRight,
  AlertOctagon,
  Trophy,
  Sunrise,
  Sparkles,
  Clock
} from 'lucide-react';
import { SimulationState } from '../../lib/types';
import { getDayClockInfo } from '../../lib/constants';
import { translations, Language } from '../../lib/i18n';

interface PlaybackControlsProps {
  state: SimulationState;
  onTogglePlay: () => void;
  onSetSpeed: (speed: 1 | 2 | 5) => void;
  onStepForward: () => void;
  onReset: () => void;
  onStartNextDay?: () => void;
  isAgentExecuting?: boolean;
  lang: Language;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  state,
  onTogglePlay,
  onSetSpeed,
  onStepForward,
  onReset,
  onStartNextDay,
  isAgentExecuting = false,
  lang
}) => {
  const t = translations[lang].playback;
  const isRunning = state.status === 'running';
  const isGameOver = state.status === 'game_over';
  const isVictory = state.status === 'victory';
  const clockInfo = getDayClockInfo(state.tick, state.currentDay, state.isShiftEnded);
  const unassignedCount = state.orders.filter(o => o.status === 'pending' && !o.assignedRobotId).length;
  const activeOrdersCount = state.orders.filter(o => o.status === 'pending' || o.status === 'assigned' || o.status === 'in_transit').length;

  return (
    <div className="h-12 border-t border-cyan-950/60 bg-slate-950/90 px-4 flex items-center justify-between text-xs font-mono select-none gap-2">
      {/* Left: Play / Pause / Next Day / Step */}
      <div className="flex items-center gap-2">
        {state.isShiftEnded && onStartNextDay ? (
          <button
            onClick={onStartNextDay}
            disabled={isGameOver}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse disabled:opacity-40"
          >
            <Sunrise className="w-4 h-4" />
            <span>
              {lang === 'zh'
                ? `🌅 开启第 ${clockInfo.day + 1} 天 (08:00 AM)`
                : `🌅 Start Day ${clockInfo.day + 1} (08:00 AM)`}
            </span>
          </button>
        ) : (
          <button
            onClick={onTogglePlay}
            disabled={isGameOver || isVictory || isAgentExecuting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm ${
              isAgentExecuting
                ? 'bg-purple-600 text-slate-100 animate-pulse'
                : isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isAgentExecuting ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>{lang === 'zh' ? 'LLM 排程规划中...' : 'LLM Planning Shift...'}</span>
              </>
            ) : isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {clockInfo.isPreShift
                    ? (lang === 'zh' ? '开始今日送货 (08:00 AM)' : 'Start Shift (08:00 AM)')
                    : t.simulate}
                </span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onStepForward}
          disabled={isRunning || isGameOver || isVictory || Boolean(state.isShiftEnded)}
          title="Advance 1 simulation tick (6 mins)"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 disabled:opacity-40"
        >
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{t.step}</span>
        </button>

        <button
          onClick={onReset}
          title="Reset fleet & simulation state"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.reset}</span>
        </button>
      </div>

      {/* Middle Shift Status / Pre-Shift Planning Banner */}
      {!isGameOver && !isVictory && (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {state.isShiftEnded ? (
            <span className="text-emerald-300 font-medium">
              {lang === 'zh'
                ? `第 ${clockInfo.day} 天已收工 (${clockInfo.time12})！可升级车队或点击左侧开启第 ${clockInfo.day + 1} 天。`
                : `Day ${clockInfo.day} shift ended (${clockInfo.time12})! Upgrade fleet or start Day ${clockInfo.day + 1}.`}
            </span>
          ) : clockInfo.isPreShift ? (
            <span className="text-amber-300 font-medium">
              {unassignedCount > 0
                ? (lang === 'zh'
                    ? `🌅 08:00 AM 开工前：今日共 ${activeOrdersCount} 单全量显示，点击「执行调度」让 LLM 先规划全天路线，再按「开始今日送货」正式计时！`
                    : `🌅 08:00 AM Pre-Shift: All ${activeOrdersCount} daily orders visible! Run LLM Dispatch to plan routes, or click Start Shift to begin clock.`)
                : (lang === 'zh'
                    ? `✅ 今日 ${activeOrdersCount} 单已完成排程规划！点击「开始今日送货 (08:00 AM)」正式发车计时（18:00 收工）。`
                    : `✅ All ${activeOrdersCount} orders planned! Click Start Shift (08:00 AM) to start the clock until 06:00 PM.`)}
            </span>
          ) : (
            <span className="text-cyan-300">
              {lang === 'zh'
                ? `🚚 第 ${clockInfo.day} 天配送中 (${clockInfo.time12} / 06:00 PM 收工) • 剩余待送包裹: ${activeOrdersCount} 单`
                : `🚚 Day ${clockInfo.day} Shift (${clockInfo.time12} / 06:00 PM Close) • Remaining Orders: ${activeOrdersCount}`}
            </span>
          )}
        </div>
      )}

      {/* Middle Banner (Game Over or Victory Alert) */}
      {isGameOver && (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-300 text-[11px] animate-pulse">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>{state.gameOverReason || 'SIMULATION TERMINATED: THRESHOLD BREACHED'}</span>
        </div>
      )}

      {isVictory && (
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded-lg text-cyan-300 text-[11px] animate-pulse">
          <Trophy className="w-3.5 h-3.5 text-cyan-400" />
          <span>ALL DISPATCH TARGETS ACCOMPLISHED WITH HIGH EFFICIENCY</span>
        </div>
      )}

      {/* Right: Speed Multiplier */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
        <span className="text-[10px] text-slate-500 px-2">{t.speed}</span>
        {([1, 2, 5] as const).map(sp => (
          <button
            key={sp}
            onClick={() => onSetSpeed(sp)}
            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
              state.speed === sp
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sp}x
          </button>
        ))}
      </div>
    </div>
  );
};
