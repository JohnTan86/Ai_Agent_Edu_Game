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
  ArrowRightLeft,
  Truck
} from 'lucide-react';
import { SimulationSpeed, SushiScenario, SushiSimulationState } from '../../lib/sushi/types';
import { SUSHI_SCENARIOS } from '../../lib/sushi/defaultScenarios';

interface SushiHeaderHUDProps {
  state: SushiSimulationState;
  currentScenario: SushiScenario;
  onSelectScenario: (id: string) => void;
  onTogglePlay: () => void;
  onSetSpeed: (speed: SimulationSpeed) => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpawnCustomer: (isVip?: boolean) => void;
  onToggleRushHour: () => void;
  onToggleSound: () => void;
  onOpenGuide: () => void;
  onOpenReport: () => void;
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
  onOpenReport
}) => {
  const isRunning = state.status === 'running';

  return (
    <header className="h-16 bg-slate-900/95 border-b border-amber-900/40 px-4 flex items-center justify-between select-none shadow-lg z-20 backdrop-blur-md">
      {/* 1. Brand Logo & Scenario Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-xl shadow-md shadow-rose-950/40">
            🍣
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide text-white">壽司物語 AI</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Multi-Agent
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">SushiFlow Restaurant Simulation</p>
          </div>
        </div>

        {/* Scenario Switcher */}
        <div className="hidden lg:flex items-center">
          <select
            value={currentScenario.id}
            onChange={e => onSelectScenario(e.target.value)}
            className="bg-slate-800/90 hover:bg-slate-750 text-xs text-amber-200 border border-amber-800/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium cursor-pointer"
          >
            {SUSHI_SCENARIOS.map(sc => (
              <option key={sc.id} value={sc.id} className="bg-slate-900 text-white">
                [{sc.difficulty}] {sc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Central Live KPI Badges */}
      <div className="hidden md:flex items-center gap-3">
        {/* Cash Balance */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-sm">
          <Coins className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">結餘現金</span>
            <span
              className={`text-xs font-mono font-bold leading-tight ${
                state.financials.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ${state.financials.balance.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">累積營業額</span>
            <span className="text-xs font-mono font-bold text-white leading-tight">
              ${state.financials.totalRevenue.toFixed(0)}
            </span>
          </div>
        </div>

        {/* CSAT Stars */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-sm">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">滿意度</span>
            <span className="text-xs font-mono font-bold text-amber-300 leading-tight">
              {state.metrics.customersServed > 0
                ? (
                    (5 * state.metrics.customersServed - state.metrics.customersWalkout * 2) /
                    state.metrics.customersServed
                  ).toFixed(1)
                : '5.0'}{' '}
              ★
            </span>
          </div>
        </div>

        {/* Customers Served */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-sm">
          <Users className="w-4 h-4 text-sky-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 leading-none">已接待 / 目標</span>
            <span className="text-xs font-mono font-bold text-sky-300 leading-tight">
              {state.metrics.customersServed}{' '}
              <span className="text-slate-500 font-normal">
                {currentScenario.difficulty === 'Sandbox' ? '' : `/ ${currentScenario.targetServed}`}
              </span>
            </span>
          </div>
        </div>

        {/* Clock / Tick */}
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 shadow-sm font-mono text-xs">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-slate-300 font-semibold">
            {state.tick}{' '}
            <span className="text-slate-500 font-normal">
              {currentScenario.difficulty === 'Sandbox' ? 'T' : `/ ${currentScenario.maxTicks}T`}
            </span>
          </span>
        </div>
      </div>

      {/* 3. Action & Simulation Controls */}
      <div className="flex items-center gap-2">
        {/* Rush Hour Toggle */}
        <button
          onClick={onToggleRushHour}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
            state.rushHourActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm shadow-rose-950 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60'
          }`}
          title="切換午間爆單潮 (Rush Hour)"
        >
          <Zap className={`w-3.5 h-3.5 ${state.rushHourActive ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">爆單潮</span>
        </button>

        {/* Spawn Customer Manually */}
        <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden">
          <button
            onClick={() => onSpawnCustomer(false)}
            className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-1 transition"
            title="召喚新顧客"
          >
            <UserPlus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">+顧客</span>
          </button>
          <button
            onClick={() => onSpawnCustomer(true)}
            className="px-2 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 border-l border-slate-700/60 transition"
            title="召喚米其林 VIP 貴賓"
          >
            +VIP
          </button>
        </div>

        {/* Playback Controls (Play / Pause, Speed, Step) */}
        <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg p-0.5">
          <button
            onClick={onTogglePlay}
            className={`p-1.5 rounded-md transition ${
              isRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
            title={isRunning ? '暫停 (空白鍵)' : '開始運行 (空白鍵)'}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={isRunning}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-40 transition"
            title="單步前進 1 刻度"
          >
            <FastForward className="w-4 h-4" />
          </button>

          {/* Speed 1x, 2x, 5x */}
          <div className="flex items-center border-l border-slate-700/60 ml-0.5 pl-0.5">
            {([1, 2, 5] as SimulationSpeed[]).map(spd => (
              <button
                key={spd}
                onClick={() => onSetSpeed(spd)}
                className={`px-1.5 py-1 text-[11px] font-mono rounded transition ${
                  state.speed === spd
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-rose-400 transition ml-0.5"
            title="重設當前關卡"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-lg border transition ${
            state.soundEnabled
              ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750'
              : 'bg-slate-800/50 text-slate-500 border-slate-800'
          }`}
          title={state.soundEnabled ? '音效已開啟' : '音效已靜音'}
        >
          {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Report Button */}
        <button
          onClick={onOpenReport}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-purple-300 border border-slate-700 transition"
          title="查看經營評分報告"
        >
          <Award className="w-4 h-4" />
        </button>

        {/* Help Guide */}
        <button
          onClick={onOpenGuide}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-sky-300 border border-slate-700 transition"
          title="多 Agent 教學指南"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Return to Portal Hub */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-amber-300 border border-slate-700 text-xs font-medium transition"
          title="返回 AI Agent 遊戲教育大廳"
        >
          <span>🏠</span>
          <span className="hidden sm:inline">遊戲大廳</span>
        </Link>

        {/* Switch to RoboFlow Button */}
        <Link
          href="/roboflow"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/50 text-xs font-medium transition"
          title="切換至 RoboFlow 物流車隊派單遊戲"
        >
          <Truck className="w-3.5 h-3.5 text-sky-400" />
          <span>RoboFlow 派單</span>
          <ArrowRightLeft className="w-3 h-3 text-sky-400/80" />
        </Link>
      </div>
    </header>
  );
};
