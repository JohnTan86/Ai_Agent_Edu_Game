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
  Calendar,
  Trophy,
  User,
  Sparkles
} from 'lucide-react';
import { GameScenario, SimulationStatus, LevelProgression, StudentUser } from '../../lib/types';
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
  currentUser?: StudentUser | null;
  onOpenAuth?: () => void;
  onOpenLeaderboard?: () => void;
  onStartTournament?: () => void;
  isTournamentMode?: boolean;
  tournamentTargetOrders?: number;
  tournamentDeliveredCount?: number;
  netProfit?: number;
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
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onOpenLeaderboard,
  onStartTournament,
  isTournamentMode,
  tournamentTargetOrders = 100,
  tournamentDeliveredCount = 0,
  netProfit
}) => {
  const t = translations[lang];
  const clockInfo = getDayClockInfo(tick, currentDay, isShiftEnded);

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 animate-pulse whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            {t.liveSimulation}
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/90 border border-amber-500/50 text-amber-400 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            {t.paused}
          </span>
        );
      case 'game_over':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/90 border border-rose-500/50 text-rose-400 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            {t.fleetCritical}
          </span>
        );
      case 'victory':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/90 border border-cyan-500/50 text-cyan-400 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            {t.missionAccomplished}
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 whitespace-nowrap shrink-0">
            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
            {t.standby}
          </span>
        );
    }
  };

  return (
    <header className="h-14 min-h-[56px] max-h-14 border-b border-cyan-950/60 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between gap-2 lg:gap-3 z-20 select-none overflow-x-auto overflow-y-hidden no-scrollbar">
      {/* 1. Left: Brand & Academy Title */}
      <div className="flex items-center gap-2.5 shrink-0 whitespace-nowrap">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-black tracking-wider text-base text-slate-100 flex items-center shrink-0">
            {t.appTitle}
            <span className="text-cyan-400 ml-1.5 text-xs font-semibold tracking-normal px-1 py-0.5 rounded bg-cyan-950 border border-cyan-800/50">
              2028
            </span>
          </span>
          <span className="hidden 2xl:inline-block text-[11px] font-mono tracking-widest text-slate-400 uppercase border-l border-slate-800 pl-2 shrink-0">
            {t.appSubtitle}
          </span>
        </div>
      </div>

      {/* 2. Center: Level Progression & Shift Clock & Status */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0 whitespace-nowrap">
        {/* Scenario Selector (Compact on larger screens) */}
        <div className="hidden 2xl:flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{t.scenarioLabel}:</span>
          <select
            value={currentScenario.id}
            onChange={(e) => {
              const found = DEFAULT_SCENARIOS.find(s => s.id === e.target.value);
              if (found) onSelectScenario(found);
            }}
            className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer max-w-[130px] truncate"
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

        {/* Level Progression Banner (Never wraps or squishes) */}
        {levelProgression && (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono transition-all shrink-0 whitespace-nowrap ${
              levelProgression.currentLevel === 3
                ? 'bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-cyan-950/90 border border-purple-500/60 shadow-[0_0_18px_rgba(168,85,247,0.3)]'
                : 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}
          >
            <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <span
                className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                  levelProgression.currentLevel === 3 ? 'bg-purple-400' : 'bg-cyan-400'
                }`}
              />
              <span
                className={`font-bold whitespace-nowrap shrink-0 ${
                  levelProgression.currentLevel === 3 ? 'text-purple-300' : 'text-cyan-300'
                }`}
              >
                <span className="xl:hidden">
                  {lang === 'zh' ? `第${levelProgression.currentLevel}关` : `LVL ${levelProgression.currentLevel}`}
                </span>
                <span className="hidden xl:inline whitespace-nowrap shrink-0">
                  {lang === 'zh'
                    ? (levelProgression.currentLevel === 1
                        ? '第1关：新手第一公里'
                        : (levelProgression.currentLevel === 2 ? '第2关：车队与枢纽大亨' : '第3关：全城物流霸主'))
                    : (levelProgression.currentLevel === 1
                        ? 'LVL 1: First Mile'
                        : (levelProgression.currentLevel === 2 ? 'LVL 2: Fleet Tycoon' : 'LVL 3: Metropolis Master'))}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-cyan-800/60 text-[11px] shrink-0 whitespace-nowrap">
              <span className="text-slate-400 whitespace-nowrap shrink-0">
                <span className="hidden sm:inline">{lang === 'zh' ? '配送:' : 'Orders:'}</span>
                <span className="sm:hidden">📦</span>
              </span>
              <span className="font-bold text-emerald-400 whitespace-nowrap shrink-0">
                {levelProgression.levelDeliveriesCompleted}/{levelProgression.levelTargetDeliveries}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 whitespace-nowrap shrink-0">
                <span className="hidden sm:inline">{lang === 'zh' ? '财库:' : 'Cash:'}</span>
                <span className="sm:hidden">💰</span>
              </span>
              <span className={`font-bold whitespace-nowrap shrink-0 ${balance >= levelProgression.levelTargetCash ? 'text-emerald-400' : 'text-amber-300'}`}>
                ${balance.toFixed(0)}/${levelProgression.levelTargetCash}
              </span>
              {levelProgression.currentLevel === 3 && cityCoveragePct !== undefined && (
                <>
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400 whitespace-nowrap shrink-0">
                    {lang === 'zh' ? '覆盖:' : 'Coverage:'}
                  </span>
                  <span
                    className={`font-bold whitespace-nowrap shrink-0 ${
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

        {/* Day & Shift Clock HUD (08:00 AM - 06:00 PM) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 border border-cyan-500/40 px-2.5 py-1 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.18)] shrink-0 whitespace-nowrap">
          <div className="flex items-center gap-1 pr-1.5 border-r border-slate-700/80 shrink-0 whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-mono font-bold text-amber-300 whitespace-nowrap shrink-0">
              {lang === 'zh' ? `第${clockInfo.day}天` : `DAY ${clockInfo.day}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wide whitespace-nowrap shrink-0">
              {clockInfo.time12}
            </span>
            <span
              className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 whitespace-nowrap ${
                clockInfo.isShiftEnd
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                  : clockInfo.isPreShift
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              }`}
            >
              {clockInfo.isShiftEnd
                ? (lang === 'zh' ? '已收工' : 'Closed')
                : clockInfo.isPreShift
                ? (lang === 'zh' ? '开工前' : 'Pre-Shift')
                : (lang === 'zh' ? '班次中' : 'Active')}
            </span>
          </div>
        </div>

        {/* Tournament Progress Banner */}
        {isTournamentMode && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-mono shrink-0">
            <span className="text-amber-400 text-xs">🏁</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-300">
                {lang === 'zh' ? '100单挑战' : '100 RACE'}:
              </span>
              <span className="text-xs font-black text-cyan-300">
                {tournamentDeliveredCount}/{tournamentTargetOrders} 📦
              </span>
            </div>
            <div className="w-14 sm:w-20 h-2 rounded-full bg-slate-950 border border-slate-700 overflow-hidden hidden sm:block">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((tournamentDeliveredCount / tournamentTargetOrders) * 100))}%` }}
              />
            </div>
            {netProfit !== undefined && (
              <div className="text-xs font-bold text-emerald-400 hidden md:block">
                {netProfit >= 0 ? `+$${netProfit.toFixed(1)}` : `-$${Math.abs(netProfit).toFixed(1)}`}
              </div>
            )}
          </div>
        )}

        {/* Status Pill */}
        <div className="shrink-0 whitespace-nowrap">{getStatusBadge()}</div>
      </div>

      {/* 3. Right: Sleek Action Buttons (Tooltips on hover, compact responsive layout) */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
        {/* Tournament Fast Launch Button */}
        {!isTournamentMode && onStartTournament && (
          <button
            onClick={onStartTournament}
            title={lang === 'zh' ? '开启固定 100 笔订单比赛，比拼最终净利润！' : 'Start 100-Order Profit Race!'}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>{lang === 'zh' ? '100单比赛' : '100 RACE'}</span>
          </button>
        )}

        {/* Leaderboard Button */}
        {onOpenLeaderboard && (
          <button
            onClick={onOpenLeaderboard}
            title={lang === 'zh' ? '查看 100 笔订单比赛全球排行榜' : 'View 100-Order Tournament Leaderboard'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40" />
            <span className="font-bold">{lang === 'zh' ? '排行榜' : 'RANKS'}</span>
          </button>
        )}

        {/* Student Profile / Google Sign-In Pill */}
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            title={currentUser ? (lang === 'zh' ? `已登录: ${currentUser.name}` : `Signed in: ${currentUser.name}`) : (lang === 'zh' ? '点击进行 Google 账号或学生身份登录' : 'Sign in to record race score')}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              currentUser
                ? 'bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/80 text-cyan-200 animate-pulse'
            }`}
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="avatar" className="w-4 h-4 rounded-full object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="font-bold max-w-[85px] truncate">
              {currentUser ? currentUser.name : (lang === 'zh' ? '竞赛登录' : 'Sign In')}
            </span>
          </button>
        )}

        {/* Light / Dark Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={
              lang === 'zh'
                ? (theme === 'dark' ? '切换至亮色模式 (Light)' : '切换至暗色模式 (Dark)')
                : (theme === 'dark' ? 'Switch to Light' : 'Switch to Dark')
            }
            className="flex items-center justify-center p-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:text-amber-300 shrink-0"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>
        )}

        {/* Multi-language Toggle */}
        <button
          onClick={onToggleLang}
          title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:text-cyan-300 shrink-0 whitespace-nowrap"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold">{lang === 'zh' ? '中' : 'EN'}</span>
        </button>

        {/* Heatmap Toggle */}
        <button
          onClick={onToggleHeatmap}
          title={lang === 'zh' ? '切换全城交通热力图' : 'Toggle Traffic Heatmap'}
          className={`flex items-center justify-center p-2 rounded-lg text-xs font-mono border transition-all shrink-0 ${
            showHeatmap
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
        </button>

        {/* Inject Parcel Order */}
        <button
          onClick={onSpawnOrder}
          title={lang === 'zh' ? '人工注入加急测试包裹订单' : 'Inject dynamic parcel order'}
          className="flex items-center justify-center p-2 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition-all hover:border-cyan-500/40 shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
        </button>

        {/* Shop Button (Unlocked in Level 2) */}
        {onOpenShop && (
          <button
            onClick={levelProgression?.currentLevel === 1 ? undefined : onOpenShop}
            title={
              levelProgression?.currentLevel === 1
                ? (lang === 'zh' ? '第 1 关完成后解锁车队科技商店' : 'Unlocked after Level 1')
                : (lang === 'zh' ? '打开车队与站点科技商店' : 'Open Fleet & Hub Tech Shop')
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all shrink-0 whitespace-nowrap ${
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

        {/* Architect Report Button */}
        <button
          onClick={onOpenReport}
          title={lang === 'zh' ? '查看架构师性能评估报表' : 'View Architect Performance Report'}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-all hover:border-amber-500/40 shrink-0 whitespace-nowrap"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">{t.reportBtn}</span>
        </button>

        {/* Game Guide Button */}
        <button
          onClick={onOpenGuide}
          title={lang === 'zh' ? '游戏规则与提示词架构指南' : 'Game Rules & Agent Guide'}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 transition-all shrink-0 whitespace-nowrap"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline">{t.guideBtn}</span>
        </button>
      </div>
    </header>
  );
};
