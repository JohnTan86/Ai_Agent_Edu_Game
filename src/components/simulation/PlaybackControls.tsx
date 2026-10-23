'use client';

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronRight,
  AlertOctagon,
  Trophy
} from 'lucide-react';
import { SimulationState } from '../../lib/types';
import { translations, Language } from '../../lib/i18n';

interface PlaybackControlsProps {
  state: SimulationState;
  onTogglePlay: () => void;
  onSetSpeed: (speed: 1 | 2 | 5) => void;
  onStepForward: () => void;
  onReset: () => void;
  lang: Language;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  state,
  onTogglePlay,
  onSetSpeed,
  onStepForward,
  onReset,
  lang
}) => {
  const t = translations[lang].playback;
  const isRunning = state.status === 'running';
  const isGameOver = state.status === 'game_over';
  const isVictory = state.status === 'victory';

  return (
    <div className="h-12 border-t border-cyan-950/60 bg-slate-950/90 px-4 flex items-center justify-between text-xs font-mono select-none">
      {/* Left: Play / Pause / Step */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          disabled={isGameOver || isVictory}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isRunning ? t.pause : t.simulate}</span>
        </button>

        <button
          onClick={onStepForward}
          disabled={isRunning || isGameOver || isVictory}
          title="Advance 1 simulation tick"
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
