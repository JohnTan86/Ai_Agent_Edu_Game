'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  X,
  Search,
  Zap,
  Globe,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LeaderboardEntry, StudentUser } from '../../lib/types';
import { Language } from '../../lib/i18n';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentUser | null;
  onStartTournament: () => void;
  lang?: Language;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onStartTournament,
  lang = 'zh'
}) => {
  const isZh = lang === 'zh';
  const [cityFilter, setCityFilter] = useState<'all' | 'singapore' | 'tokyo' | 'newyork'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<{ totalParticipants: number; topProfit: number; avgOnTimeRate: number }>({
    totalParticipants: 0,
    topProfit: 0,
    avgOnTimeRate: 100
  });

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // Try production cPanel PHP endpoint first, fallback to Next.js route
      const query = cityFilter !== 'all' ? `?city=${cityFilter}` : '';
      let res = await fetch(`/api/leaderboard/index.php${query}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`/api/leaderboard${query}`);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.entries) {
          setEntries(data.entries);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, cityFilter]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      (item.school_class && item.school_class.toLowerCase().includes(term))
    );
  });

  const top1 = filteredEntries[0];
  const top2 = filteredEntries[1];
  const top3 = filteredEntries[2];
  const restList = filteredEntries.slice(3);

  // Find current user's best rank
  const myEntry = currentUser
    ? entries.find(e => e.user_id === currentUser.id || (currentUser.email && e.email === currentUser.email))
    : null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden text-slate-100">
        
        {/* 1. Header Banner */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
                  {isZh ? 'RoboFlow 全球班级竞赛排行榜' : 'RoboFlow Global Tournament Leaderboard'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                  {isZh ? '100 笔订单竞速' : '100-Order Race'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isZh
                  ? '排名标准：以最终「净利润 Net Profit ($)」最高者问鼎冠军，兼顾准时履约率'
                  : 'Ranked by highest Net Profit ($) over 100 deliveries, with on-time SLA tie-breaker'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              disabled={isLoading}
              title={isZh ? '刷新实时榜单' : 'Refresh Leaderboard'}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. City Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400 hidden sm:inline mr-1">{isZh ? '赛区筛选:' : 'City:'}</span>
            {(['all', 'singapore', 'tokyo', 'newyork'] as const).map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  cityFilter === city
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {city === 'all'
                  ? (isZh ? '🌐 全球总榜' : 'Global')
                  : city === 'singapore'
                  ? (isZh ? '🇸🇬 新加坡' : 'Singapore')
                  : city === 'tokyo'
                  ? (isZh ? '🇯🇵 东京' : 'Tokyo')
                  : (isZh ? '🇺🇸 纽约' : 'New York')}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] max-w-[260px] flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={isZh ? '搜索姓名或班级...' : 'Search student or class...'}
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* 3. Main Content: Podium & Full Rankings */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5 custom-scrollbar">
          
          {/* Top 3 Podium Cards */}
          {filteredEntries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              
              {/* 2nd Place (Silver) */}
              <div className="order-2 md:order-1 flex flex-col items-center justify-between p-4 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-600/60 shadow-lg text-center relative">
                <span className="absolute -top-3 px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-700 text-slate-200 border border-slate-500 shadow">
                  🥈 亚军 #2
                </span>
                {top2 ? (
                  <>
                    <img
                      src={top2.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Silver'}
                      alt={top2.name}
                      className="w-14 h-14 rounded-full border-2 border-slate-300 shadow mt-2 object-cover bg-slate-950"
                    />
                    <div className="my-2">
                      <h4 className="font-bold text-sm text-slate-100 truncate max-w-[180px]">{top2.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{top2.school_class || 'RoboFlow Class'}</p>
                    </div>
                    <div className="w-full py-1.5 px-3 rounded-xl bg-slate-950/80 border border-slate-700 font-mono">
                      <div className="text-xs text-slate-400">{isZh ? '净利润 (Net Profit)' : 'Net Profit'}</div>
                      <div className="text-base font-extrabold text-emerald-400">
                        +${top2.net_profit.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 mt-2 px-1">
                      <span>{isZh ? '准时率' : 'SLA'}: {top2.on_time_rate}%</span>
                      <span>{top2.orders_delivered} {isZh ? '单' : 'orders'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 my-auto py-8">{isZh ? '虚位以待' : 'Awaiting Runner-Up'}</div>
                )}
              </div>

              {/* 1st Place (Gold Champion) */}
              <div className="order-1 md:order-2 flex flex-col items-center justify-between p-4 rounded-2xl bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-900 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] text-center relative scale-105 z-10">
                <span className="absolute -top-3.5 px-3.5 py-1 rounded-full text-xs font-black font-mono bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md">
                  👑 冠军 #1
                </span>
                {top1 ? (
                  <>
                    <img
                      src={top1.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Gold'}
                      alt={top1.name}
                      className="w-16 h-16 rounded-full border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] mt-2 object-cover bg-slate-950"
                    />
                    <div className="my-2">
                      <h4 className="font-extrabold text-base text-yellow-200 truncate max-w-[200px]">{top1.name}</h4>
                      <p className="text-xs text-amber-300/80 font-mono">{top1.school_class || 'Elite Architect'}</p>
                    </div>
                    <div className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-amber-500/40 font-mono">
                      <div className="text-xs text-amber-400/80">{isZh ? '冠军净利润 (Net Profit)' : 'Net Profit'}</div>
                      <div className="text-xl font-black text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.4)]">
                        +${top1.net_profit.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full text-xs font-mono text-amber-200/90 mt-2 px-1">
                      <span>{isZh ? '准时率' : 'SLA'}: {top1.on_time_rate}%</span>
                      <span>{top1.orders_delivered}/100 {isZh ? '单' : 'orders'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 my-auto py-8">{isZh ? '虚位以待' : 'Awaiting Champion'}</div>
                )}
              </div>

              {/* 3rd Place (Bronze) */}
              <div className="order-3 flex flex-col items-center justify-between p-4 rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-amber-700/60 shadow-lg text-center relative">
                <span className="absolute -top-3 px-3 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-800 text-amber-200 border border-amber-600 shadow">
                  🥉 季军 #3
                </span>
                {top3 ? (
                  <>
                    <img
                      src={top3.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Bronze'}
                      alt={top3.name}
                      className="w-14 h-14 rounded-full border-2 border-amber-600 shadow mt-2 object-cover bg-slate-950"
                    />
                    <div className="my-2">
                      <h4 className="font-bold text-sm text-slate-100 truncate max-w-[180px]">{top3.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{top3.school_class || 'RoboFlow Class'}</p>
                    </div>
                    <div className="w-full py-1.5 px-3 rounded-xl bg-slate-950/80 border border-slate-700 font-mono">
                      <div className="text-xs text-slate-400">{isZh ? '净利润 (Net Profit)' : 'Net Profit'}</div>
                      <div className="text-base font-extrabold text-emerald-400">
                        +${top3.net_profit.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full text-[11px] font-mono text-slate-400 mt-2 px-1">
                      <span>{isZh ? '准时率' : 'SLA'}: {top3.on_time_rate}%</span>
                      <span>{top3.orders_delivered} {isZh ? '单' : 'orders'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 my-auto py-8">{isZh ? '虚位以待' : 'Awaiting 3rd Place'}</div>
                )}
              </div>
            </div>
          )}

          {/* Full Ranked Table */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 font-mono flex items-center justify-between">
              <span>{isZh ? '全员竞速大榜名单' : 'All Contestants Ranking'}</span>
              <span>{isZh ? `共 ${filteredEntries.length} 位参赛选手` : `${filteredEntries.length} total players`}</span>
            </h3>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">{isZh ? '排名' : 'Rank'}</th>
                    <th className="py-2.5 px-3">{isZh ? '选手档案' : 'Architect'}</th>
                    <th className="py-2.5 px-3 text-right">{isZh ? '净利润 (Net Profit)' : 'Net Profit'}</th>
                    <th className="py-2.5 px-3 text-right hidden sm:table-cell">{isZh ? '总收入 / 支出' : 'Revenue / Cost'}</th>
                    <th className="py-2.5 px-3 text-right">{isZh ? '准时履约率' : 'SLA On-Time'}</th>
                    <th className="py-2.5 px-3 text-right hidden md:table-cell">{isZh ? '赛区' : 'City'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        {isLoading ? (isZh ? '加载排行榜中...' : 'Loading ranks...') : (isZh ? '暂无参赛记录，快来参加第一场比赛吧！' : 'No tournament records yet. Be the first to race!')}
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((item, idx) => {
                      const isMe = currentUser && (item.user_id === currentUser.id || item.email === currentUser.email);
                      return (
                        <tr
                          key={item.id || idx}
                          className={`hover:bg-slate-900/60 transition-colors ${
                            isMe ? 'bg-amber-950/30 border-l-2 border-l-amber-400' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-bold text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950'
                                : idx === 2
                                ? 'bg-amber-700 text-amber-100'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                                alt={item.name}
                                className="w-7 h-7 rounded-full object-cover bg-slate-900 border border-slate-700 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-slate-200 truncate flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                  {isMe && (
                                    <span className="px-1 py-0.2 rounded text-[9px] bg-amber-950 text-amber-300 border border-amber-600">
                                      {isZh ? '我' : 'YOU'}
                                    </span>
                                  )}
                                </div>
                                {item.school_class && (
                                  <div className="text-[10px] text-slate-500 truncate">{item.school_class}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-extrabold text-sm text-emerald-400">
                              +${item.net_profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right hidden sm:table-cell text-slate-400 text-[11px]">
                            <span className="text-cyan-300">${item.total_revenue.toFixed(0)}</span>
                            <span className="mx-1">/</span>
                            <span className="text-rose-400">-${item.total_expenses.toFixed(0)}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.on_time_rate >= 95
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            }`}>
                              {item.on_time_rate}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right hidden md:table-cell text-slate-400 text-[11px]">
                            {item.city_id === 'singapore' ? '🇸🇬 新加坡' : item.city_id === 'tokyo' ? '🇯🇵 东京' : '🇺🇸 纽约'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 4. Bottom Sticky Banner & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 bg-slate-950 border-t border-slate-800">
          {/* User's own status */}
          <div className="flex items-center gap-2.5 text-xs font-mono">
            {myEntry ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{isZh ? '您的最高战绩:' : 'Your Best Score:'}</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-bold">
                  第 #{myEntry.rank} 名
                </span>
                <span className="font-extrabold text-emerald-400">+${myEntry.net_profit.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-slate-500">
                {currentUser
                  ? (isZh ? `已登录: ${currentUser.name} (尚未提交比赛成绩)` : `Signed in: ${currentUser.name} (No race score yet)`)
                  : (isZh ? '登录 Google 账号后即可参赛并上传战报' : 'Sign in to record your tournament score')}
              </span>
            )}
          </div>

          {/* Start Tournament CTA */}
          <button
            onClick={() => {
              onClose();
              onStartTournament();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs font-mono tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>{isZh ? '开启 100 笔订单比赛 (START 100 RACE)' : 'START 100-ORDER TOURNAMENT'}</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
