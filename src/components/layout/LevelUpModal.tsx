'use client';

import React from 'react';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  BatteryCharging,
  Truck,
  Building2,
  DollarSign,
  CheckCircle2,
  Cpu,
  Radio,
  Zap,
  Award,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { SimulationState } from '../../lib/types';
import { Language } from '../../lib/i18n';
import { CITIES_DATA } from '../../lib/cityData';

interface LevelUpModalProps {
  state: SimulationState;
  isOpen: boolean;
  onProceedToLevel2: () => void;
  onProceedToLevel3?: () => void;
  onClose: () => void;
  lang: Language;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  state,
  isOpen,
  onProceedToLevel2,
  onProceedToLevel3,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  const isZh = lang === 'zh';
  const cash = state.financials.balance;
  const netProfit = state.financials.totalRevenue - state.financials.totalExpenses;
  const currentLevel = state.levelProgression?.currentLevel || 1;
  const city = CITIES_DATA[state.currentCityId] || CITIES_DATA.singapore;
  const cityName = isZh ? city.nameZh : city.name;

  if (currentLevel === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-purple-500/60 rounded-2xl shadow-[0_0_60px_rgba(168,85,247,0.3)] max-h-[90vh] flex flex-col overflow-hidden font-mono">
          {/* Glow Header */}
          <div className="relative px-6 py-5 border-b border-purple-900/60 bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-cyan-950/70 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-yellow-300 text-slate-950 mb-2 shadow-[0_0_30px_rgba(245,158,11,0.7)]">
              <Trophy className="w-7 h-7 fill-current" />
            </div>
            <h2 className="text-xl font-black tracking-wider text-slate-100 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              {isZh ? `第 2 关大亨达成！${cityName}智能物流网络全线攻克` : `LEVEL 2 COMPLETE: ${city.name.toUpperCase()} TYCOON MASTER`}
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-purple-300 mt-1">
              {isZh
                ? `恭喜完成 8 笔订单！你已成功掌握多车型扩建与智能建站。继续坐镇【${cityName}】，向全城覆盖率 ≥85% 与 $1,000 最终大奖进军！`
                : `Congratulations! Continue in ${city.name} to expand your logistics kingdom to >=85% city coverage & $1,000 profit!`}
            </p>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
            {/* Key Achievements Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {isZh ? '累计送达' : 'DELIVERIES'}
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {state.metrics.totalDelivered}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                  {isZh ? '当前财库储备' : 'BANK BALANCE'}
                </div>
                <div className="text-lg font-bold text-cyan-300">
                  ${cash.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  {isZh ? '履约净利润' : 'NET PROFIT'}
                </div>
                <div className="text-lg font-bold text-amber-400">
                  +${netProfit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Current Kingdom Assets Persistence Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/40 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isZh ? `【${cityName}大本营】公司现有资产完整保留` : `CURRENT KINGDOM ASSETS RETAINED IN ${city.name.toUpperCase()}`}
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  {isZh ? '无缝继承 · 永久留存' : '100% Retained'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    {isZh ? '在役车队规模:' : 'Fleet in Service:'}
                  </span>
                  <span className="font-bold text-cyan-300">{state.robots.length} 台机器人</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" />
                    {isZh ? '充电中心网点:' : 'Charging Hubs:'}
                  </span>
                  <span className="font-bold text-purple-300">{state.hubs.length} 座中心站</span>
                </div>
              </div>
            </div>

            {/* What's Unlocked in Level 3 */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {isZh ? 'Level 3 全城物流霸主 特权解锁' : 'UNLOCKED IN LEVEL 3: METROPOLIS DOMINATION'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Feature 1: City Coverage Radar */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-900/40 space-y-1">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Radio className="w-4 h-4 text-purple-400" />
                    <span>{isZh ? '全城覆盖率雷达 (City Coverage %)' : 'City Coverage Radar'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isZh
                      ? '顶部实时监控站点对全城路网的辐射覆盖率，通过智能建站将覆盖率提升至 ≥85%！'
                      : 'Live top HUD meter tracking hub coverage across all road networks! Aim for >=85%!'}
                  </p>
                </div>

                {/* Feature 2: High Concurrency Orders */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>{isZh ? '12+ 笔高密度并发订单潮' : 'High Concurrency Orders'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isZh
                      ? `全城商圈全面爆发大宗急单潮，极速跑车与重载长途车协同出勤，考验调度效率！`
                      : 'Simultaneously deploy Heavy Haulers and Speedy Scouts to clear massive city order surges!'}
                  </p>
                </div>

                {/* Feature 3: Endless Tycoon Mode */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-900/40 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Flame className="w-4 h-4 text-emerald-400" />
                    <span>{isZh ? '无尽大亨沙盒模式 (永不关停)' : 'Endless Empire Sandbox'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isZh
                      ? '只要公司不破产，订单将源源不断生成！你可以无限扩建车队与站点，冲击千万营收！'
                      : 'Orders continuously stream into the metropolis! Expand your empire infinitely as long as you remain solvent!'}
                  </p>
                </div>

                {/* Feature 4: Grand Trophy */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-900/40 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>{isZh ? '全球总调度大师金杯' : 'Grand Architect Trophy'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isZh
                      ? '完成 12 笔订单、覆盖率 ≥85% 且财库冲破 $1,000，登顶 RoboFlow 全球人工智能物流殿堂！'
                      : 'Achieve >=85% city coverage & $1,000 net treasury to claim the ultimate Grand Architect Trophy!'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              {isZh ? '继续停留在第2关' : 'Stay in Level 2'}
            </button>

            <button
              onClick={() => {
                if (onProceedToLevel3) {
                  onProceedToLevel3();
                }
              }}
              className="flex-1 max-w-md py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_25px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all"
            >
              <span>
                {isZh
                  ? `👑 晋升 Level 3：开启【${cityName}】全城物流王国扩张`
                  : `PROCEED TO LEVEL 3: EXPAND ${city.name.toUpperCase()} EMPIRE`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level 1 -> Level 2 UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-cyan-500/60 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)] max-h-[90vh] flex flex-col overflow-hidden font-mono">
        {/* Glow Header */}
        <div className="relative px-6 py-5 border-b border-cyan-900/60 bg-gradient-to-r from-cyan-950/70 via-blue-950/60 to-purple-950/70 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 mb-2 shadow-[0_0_25px_rgba(245,158,11,0.6)]">
            <Trophy className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-xl font-black tracking-wider text-slate-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {isZh ? '第一关通关达成！第一公里圆满完成' : 'LEVEL 1 COMPLETE: THE FIRST MILE'}
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-cyan-300 mt-1">
            {isZh
              ? '你已成功通过自然语言提示词指挥单机机器人完成全部 3 笔新手配送！'
              : 'You successfully orchestrated your first autonomous rover with natural language prompting!'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Key Achievements Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isZh ? '完成单量' : 'DELIVERIES'}
              </div>
              <div className="text-lg font-bold text-emerald-400">
                3 / 3
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                {isZh ? '当前财库资金' : 'BANK BALANCE'}
              </div>
              <div className="text-lg font-bold text-cyan-300">
                ${cash.toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                {isZh ? '净利润收益' : 'NET PROFIT'}
              </div>
              <div className="text-lg font-bold text-amber-400">
                +${netProfit.toFixed(2)}
              </div>
            </div>
          </div>

          {/* What's Unlocked in Level 2 */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              {isZh ? 'Level 2 解锁全新特权与玩法' : 'UNLOCKED IN LEVEL 2: FLEET & HUB TYCOON'}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Feature 1: Multi-order & Heavy Hauler */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>{isZh ? '重载长途型 & 一车多单' : 'Heavy Hauler & Multi-Drop'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isZh
                    ? '可升级或购买重载小车，一次出库装载 2 笔以上包裹，兼备高电量长续航！'
                    : 'Upgrade to rovers that can carry 2+ orders simultaneously with 160% battery range!'}
                </p>
              </div>

              {/* Feature 2: Speedy Scout */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  <span>{isZh ? '极速轻骑型 & 超级快充' : 'Speedy Scout & Fast Charging'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isZh
                    ? '1.4倍极速跑车专攻紧急高额加急单，站点支持升级超级快充机位！'
                    : '1.4x sprint speed for urgent SLAs, plus upgrade hubs to rapid charging bays!'}
                </p>
              </div>

              {/* Feature 3: Prompt-Driven Hub Building */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-900/40 space-y-1">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>{isZh ? '智能体自主选址建站' : 'Prompt-Driven Hub Construction'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isZh
                    ? '在提示词中编写规则：“当资金>300时，在订单密集区域建立新中心站点”！'
                    : 'Instruct your agent to analyze density and build new charging hubs dynamically!'}
                </p>
              </div>

              {/* Feature 4: Living City Economy */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-amber-900/40 space-y-1">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>{isZh ? '动态运维账单体系' : 'Living Operational Bills'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isZh
                    ? '每20时钟周期结算电费、车辆折旧与站租。只要持续盈利不破产，即可无限扩张！'
                    : 'Manage periodic utility & maintenance invoices. Maintain positive cashflow to dominate the city!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          >
            {isZh ? '继续停留在第1关' : 'Stay in Level 1'}
          </button>

          <button
            onClick={onProceedToLevel2}
            className="flex-1 max-w-sm py-2.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-all"
          >
            <span>{isZh ? '进入第 2 关：车队与枢纽大亨' : 'PROCEED TO LEVEL 2: FLEET TYCOON'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
