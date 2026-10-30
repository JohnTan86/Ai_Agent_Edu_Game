'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, CheckCircle, Sparkles, TrendingUp, Clock, DollarSign, Share2, ArrowRight, X } from 'lucide-react';
import { SimulationState, StudentUser } from '../../lib/types';
import { Language } from '../../lib/i18n';

interface TournamentFinishModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  currentUser: StudentUser | null;
  onOpenLeaderboard: () => void;
  onRestartTournament: () => void;
  lang?: Language;
}

export const TournamentFinishModal: React.FC<TournamentFinishModalProps> = ({
  isOpen,
  onClose,
  state,
  currentUser,
  onOpenLeaderboard,
  onRestartTournament,
  lang = 'zh'
}) => {
  const isZh = lang === 'zh';
  const [assignedRank, setAssignedRank] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const netProfit = +(state.financials.totalRevenue - state.financials.totalExpenses).toFixed(2);
  const onTimeRate = state.metrics.onTimeDeliveryRate;
  const totalDelivered = state.metrics.totalDelivered;
  const durationTicks = state.tick;

  // Auto-submit score to backend on open
  useEffect(() => {
    if (!isOpen || submitted) return;

    const submitScore = async () => {
      setIsSubmitting(true);
      try {
        const payload = {
          userId: currentUser?.id || `anon_${Date.now()}`,
          name: currentUser?.name || (isZh ? '匿名智能体调度师' : 'Anonymous Architect'),
          email: currentUser?.email || '',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Winner',
          schoolClass: currentUser?.schoolClass || '',
          netProfit,
          totalRevenue: state.financials.totalRevenue,
          totalExpenses: state.financials.totalExpenses,
          onTimeRate,
          ordersDelivered: totalDelivered,
          targetOrders: state.tournamentTargetOrders || 100,
          durationTicks,
          cityId: state.currentCityId
        };

        let res = await fetch('/api/leaderboard/index.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.rank) {
            setAssignedRank(data.rank);
          }
          setSubmitted(true);
        }
      } catch (err) {
        console.warn('Failed to submit tournament score:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitScore();
  }, [isOpen, submitted, currentUser, netProfit, onTimeRate, totalDelivered, durationTicks, state.financials, state.tournamentTargetOrders, state.currentCityId, isZh]);

  if (!isOpen) return null;

  const handleShare = () => {
    const text = `🏆 RoboFlow 100 笔订单比赛战报！\n选手: ${currentUser?.name || '智能体调度师'}\n净利润 (Net Profit): +$${netProfit.toFixed(2)}\n准时履约率: ${onTimeRate}%\n累计耗时: ${durationTicks} Ticks\n排行榜排名: 第 #${assignedRank || 1} 名！\n快来挑战：https://eduagent.makerkluang.com/`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.35)] p-6 sm:p-8 text-slate-100 flex flex-col items-center text-center gap-5 overflow-hidden">
        
        {/* Glow ambient background element */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown & Trophy Icon */}
        <div className="relative mt-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center animate-bounce">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center text-amber-400 text-3xl">
              🏆
            </div>
          </div>
          <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow">
            100 / 100
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
            {isZh ? '🎉 100 笔订单竞速圆满完成！' : '🎉 100 ORDERS RACE COMPLETE!'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isZh
              ? `恭喜 ${currentUser?.name || '您'} 成功达成全部 100 笔同城物流配送，展现卓越的 Agent 调度战略！`
              : `Congratulations ${currentUser?.name || 'Architect'}! Successfully finished all 100 deliveries with high profitability.`}
          </p>
        </div>

        {/* Primary Metric: Net Profit */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow-inner flex flex-col items-center gap-1 font-mono">
          <span className="text-xs font-bold text-amber-400/90 tracking-wider">
            {isZh ? '🏅 最终商业净利润 (NET PROFIT)' : 'FINAL NET PROFIT'}
          </span>
          <span className={`text-3xl sm:text-4xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'} drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]`}>
            {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
          </span>
          {assignedRank && (
            <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isZh ? `全球实时排位: 第 #${assignedRank} 名` : `Global Rank: #${assignedRank}`}</span>
            </div>
          )}
        </div>

        {/* Auxiliary Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-slate-400 text-[10px]">{isZh ? '准时履约率' : 'SLA Rate'}</span>
            <span className="text-base font-bold text-cyan-300 mt-0.5">{onTimeRate}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-slate-400 text-[10px]">{isZh ? '总营业额' : 'Revenue'}</span>
            <span className="text-base font-bold text-slate-200 mt-0.5">${state.financials.totalRevenue.toFixed(0)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
            <span className="text-slate-400 text-[10px]">{isZh ? '运营总成本' : 'Costs'}</span>
            <span className="text-base font-bold text-rose-300 mt-0.5">-${state.financials.totalExpenses.toFixed(0)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full mt-1">
          <button
            onClick={() => {
              onClose();
              onOpenLeaderboard();
            }}
            className="flex-1 w-full py-3 rounded-xl font-black text-xs font-mono bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>{isZh ? '查看全球排行榜' : 'VIEW LEADERBOARD'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-xl font-bold text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{copied ? (isZh ? '已复制战报!' : 'Copied!') : (isZh ? '复制战报' : 'Share')}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onRestartTournament();
            }}
            className="px-4 py-3 rounded-xl font-bold text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isZh ? '再来一局' : 'Retry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
