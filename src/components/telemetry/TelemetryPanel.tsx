'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Terminal,
  Activity,
  Package,
  Battery,
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  XCircle,
  HelpCircle,
  Crosshair,
  Search,
  Receipt,
  Building2,
  Zap
} from 'lucide-react';
import {
  Financials,
  TelemetryMetrics,
  ThoughtStep,
  AgentDispatchAction,
  Order,
  DeliveryRobot
} from '../../lib/types';
import { getDayClockInfo, formatSimTimestamp } from '../../lib/constants';
import { translations, Language } from '../../lib/i18n';

interface TelemetryPanelProps {
  financials: Financials;
  metrics: TelemetryMetrics;
  thoughtLogs: ThoughtStep[];
  activeActions: AgentDispatchAction[];
  orders: Order[];
  robots: DeliveryRobot[];
  selectedRobotId?: string;
  selectedOrderId?: string;
  onClearSelection: () => void;
  onSelectRobot: (robotId?: string) => void;
  onSelectOrder: (orderId?: string) => void;
  tick: number;
  lang: Language;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  financials,
  metrics,
  thoughtLogs,
  activeActions,
  orders,
  robots,
  selectedRobotId,
  selectedOrderId,
  onClearSelection,
  onSelectRobot,
  onSelectOrder,
  tick,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'thoughts' | 'actions' | 'orders' | 'fleet'>('thoughts');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [showLedger, setShowLedger] = useState<boolean>(false);

  const t = translations[lang].telemetry;
  const netProfit = financials.totalRevenue - financials.totalExpenses;
  const isZh = lang === 'zh';
  const ticksUntilNextInvoice = 20 - (tick % 20);

  const selectedRobot = robots.find(r => r.id === selectedRobotId);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Find dispatch action for selected robot or order
  const relevantAction = activeActions.find(
    a => a.assignedRobotId === selectedRobotId || a.orderId === selectedOrderId
  );

  // Filter thought logs if user typed a search or selected an entity
  const filteredLogs = thoughtLogs.filter(log => {
    if (selectedRobotId && (log.content.includes(selectedRobotId) || (selectedRobot && log.content.includes(selectedRobot.name)))) {
      return true;
    }
    if (selectedOrderId && log.content.includes(selectedOrderId)) {
      return true;
    }
    if (filterQuery) {
      return log.content.toLowerCase().includes(filterQuery.toLowerCase()) || log.type.includes(filterQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="w-84 lg:w-[410px] xl:w-[450px] 2xl:w-[470px] h-full flex flex-col bg-slate-950/95 border-l border-cyan-950/60 overflow-hidden font-sans select-none shrink-0 transition-all">
      {/* 1. Header & Live Financials */}
      <div className="p-3.5 border-b border-cyan-950/60 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Activity className="w-4 h-4 text-cyan-400" />
            {t.title}
          </span>
          <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-lg shadow-[0_0_8px_rgba(6,182,212,0.2)]">
            {formatSimTimestamp(tick)}
          </span>
        </div>

        {/* Low Cash Alert Banner */}
        {financials.balance <= 50 && financials.balance > 0 && (
          <div className="mb-2.5 p-2 rounded-xl bg-rose-950/90 border border-rose-500/60 text-xs text-rose-300 font-bold flex items-center justify-between animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              {isZh ? '财库资金告急！谨防破产清算' : 'Treasury Critical! Risk of Insolvency'}
            </span>
            <span className="font-mono">${financials.balance.toFixed(2)}</span>
          </div>
        )}

        {/* Live Balance Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider font-mono">
              {t.treasuryBalance}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-cyan-900/50 text-cyan-300">
              {isZh ? `下期周期账单: 剩 ${ticksUntilNextInvoice} Ticks` : `Next Invoice: ${ticksUntilNextInvoice}T`}
            </span>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className={`text-3xl lg:text-4xl font-black font-mono tracking-tight ${financials.balance > 150 ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'text-rose-400'}`}>
              ${financials.balance.toFixed(2)}
            </div>
            <div className={`flex items-center text-xs sm:text-sm font-bold font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netProfit >= 0 ? <TrendingUp className="w-4 h-4 mr-1 text-emerald-400" /> : <TrendingDown className="w-4 h-4 mr-1 text-rose-400" />}
              {metrics.profitMargin}% {t.netMargin}
            </div>
          </div>

          {/* Quick Revenue vs Expenses */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-slate-800/80 text-xs font-mono">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px]">{t.revenue}</span>
              <span className="text-emerald-400 font-bold text-sm">+${financials.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px]">{t.expenses}</span>
              <span className="text-rose-400 font-bold text-sm">-${financials.totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          {/* Toggle Full Operational Ledger Button */}
          <button
            type="button"
            onClick={() => setShowLedger(!showLedger)}
            className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 text-xs text-slate-300 flex items-center justify-between transition-colors font-mono"
          >
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <Receipt className="w-3.5 h-3.5 text-cyan-400" />
              {isZh ? '查看成本明细与市政账单' : 'Cost Breakdown & Municipal Invoices'}
            </span>
            {showLedger ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Expanded Detailed Cost Ledger */}
          {showLedger && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-xs font-mono space-y-2 animate-in fade-in duration-150">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {isZh ? '运营支出科目明细' : 'Operational Cost Ledger'}
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {isZh ? '电力补能电费' : 'Energy & Charging'}
                </span>
                <span className="font-bold text-slate-200">-${financials.energyCosts.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  {isZh ? '里程行驶折旧' : 'Mileage Travel Wear'}
                </span>
                <span className="font-bold text-slate-200">-${financials.mileageCosts.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  {isZh ? '车队定期维保' : 'Fleet Maintenance'}
                </span>
                <span className="font-bold text-slate-200">-${financials.maintenanceCosts.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  {isZh ? '站点租金市政' : 'Hub Leases & Utilities'}
                </span>
                <span className="font-bold text-slate-200">-${(financials.hubRentCosts || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  {isZh ? 'SLA违约罚金' : 'SLA Breach Penalties'}
                </span>
                <span className={`font-bold ${financials.slaPenalties > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  -${financials.slaPenalties.toFixed(2)}
                </span>
              </div>

              {/* Latest Periodic Invoice Mini-Receipt */}
              {financials.lastInvoice && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950 border border-purple-900/60 text-xs text-slate-300 space-y-1.5 shadow-inner">
                  <div className="flex justify-between font-bold text-purple-300">
                    <span>
                      {isZh
                        ? `🧾 第 ${financials.lastInvoice.period} 期账单 (Tick ${financials.lastInvoice.tick})`
                        : `🧾 Invoice #${financials.lastInvoice.period} (T${financials.lastInvoice.tick})`}
                    </span>
                    <span className="text-rose-400">-${financials.lastInvoice.totalInvoiceCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{isZh ? `车队维护 (${financials.lastInvoice.robotCount} 台车)` : `Fleet (${financials.lastInvoice.robotCount} bots)`}</span>
                    <span>-${financials.lastInvoice.robotMaintenanceTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{isZh ? `站点租金 (${financials.lastInvoice.hubCount} 座站点)` : `Hub Lease (${financials.lastInvoice.hubCount} hubs)`}</span>
                    <span>-${financials.lastInvoice.hubRentTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Performance Indicators HUD */}
      <div className="p-3 border-b border-cyan-950/60 bg-slate-950/80 grid grid-cols-3 gap-2 font-mono">
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block font-bold">{t.onTimeSla}</span>
          <span className={`text-base lg:text-lg font-black ${metrics.onTimeDeliveryRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.onTimeDeliveryRate}%
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block font-bold">{t.delivered}</span>
          <span className="text-base lg:text-lg font-black text-cyan-300">
            {metrics.totalDelivered}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block font-bold">{t.slaBreached}</span>
          <span className={`text-base lg:text-lg font-black ${metrics.totalFailed > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {metrics.totalFailed}
          </span>
        </div>
      </div>

      {/* 3. Interactive Prompt Debugging (Selected Entity Inspector) */}
      {(selectedRobot || selectedOrder) && (
        <div className="p-3 bg-gradient-to-b from-cyan-950/60 to-slate-950/90 border-b border-cyan-500/40 flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              {selectedRobot ? t.selectedRobot : t.selectedOrder}
            </span>
            <button
              onClick={onClearSelection}
              className="text-slate-300 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono transition-colors"
            >
              {t.close}
            </button>
          </div>

          {/* Robot Telemetry */}
          {selectedRobot && (
            <div className="text-xs text-slate-200 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.name}:</span>
                <span className="font-bold text-slate-100">{selectedRobot.name} ({selectedRobot.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.battery}:</span>
                <span className={`font-bold ${selectedRobot.batteryPct > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedRobot.batteryPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.statusPayload}:</span>
                <span className="text-cyan-300 font-bold">{selectedRobot.status.toUpperCase()} ({selectedRobot.currentPayloadKg}/{selectedRobot.maxCapacityKg}kg)</span>
              </div>
            </div>
          )}

          {/* Order Details */}
          {selectedOrder && (
            <div className="text-xs text-slate-200 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.orderId}:</span>
                <span className="font-bold text-slate-100">#{selectedOrder.id} ({selectedOrder.sender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.destination}:</span>
                <span className="text-cyan-300">({selectedOrder.recipientAddress.x}, {selectedOrder.recipientAddress.y}) - {selectedOrder.recipientAddress.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.rewardSla}:</span>
                <span className="font-bold text-emerald-400">
                  ${selectedOrder.reward} / {getDayClockInfo(selectedOrder.deadlineTick).time12}
                </span>
              </div>
            </div>
          )}

          {/* Exact Prompt Snippet & LLM Decision Justification */}
          {relevantAction && (
            <div className="mt-1 p-2.5 rounded-xl bg-slate-900/95 border border-cyan-800/60 text-xs">
              <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1 font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>ARCHITECT DECISION RATIONALE:</span>
              </div>
              <div className="text-slate-200 leading-relaxed italic font-sans text-xs">
                &ldquo;{relevantAction.priorityReasoning}&rdquo;
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between font-mono">
                <span>Waypoints: {relevantAction.routeWaypoints.length} nodes</span>
                <span className="text-emerald-400 font-bold">STATUS: EXECUTED</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Tab Navigation for Inspector */}
      <div className="flex items-center border-b border-cyan-950/60 bg-slate-900/70 px-2 pt-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('thoughts')}
          className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
            activeTab === 'thoughts'
              ? 'bg-slate-950 text-cyan-300 border-t border-x border-cyan-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.tabs.thoughts}</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
            activeTab === 'actions'
              ? 'bg-slate-950 text-cyan-300 border-t border-x border-cyan-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.tabs.actions} ({activeActions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
            activeTab === 'orders'
              ? 'bg-slate-950 text-cyan-300 border-t border-x border-cyan-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.tabs.orders}</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-3 py-2 rounded-t-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
            activeTab === 'fleet'
              ? 'bg-slate-950 text-cyan-300 border-t border-x border-cyan-900/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Battery className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.tabs.fleet}</span>
        </button>
      </div>

      {/* 5. Tab Content: Terminal / Inspector */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Tab 1: Agent Thought Inspector */}
        {activeTab === 'thoughts' && (
          <div className="space-y-2.5">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                {t.awaitingThoughts}
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeColor = 'bg-slate-800 text-slate-300 border border-slate-700';
                if (log.type === 'tool_call') badgeColor = 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-[0_0_8px_rgba(6,182,212,0.2)]';
                if (log.type === 'tool_result') badgeColor = 'bg-emerald-950 text-emerald-300 border border-emerald-700/60';
                if (log.type === 'reasoning') badgeColor = 'bg-purple-950 text-purple-200 border border-purple-700/60 shadow-[0_0_8px_rgba(168,85,247,0.2)]';
                if (log.type === 'dispatch_plan') badgeColor = 'bg-amber-950 text-amber-200 border border-amber-700/60 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
                if (log.type === 'error') badgeColor = 'bg-rose-950 text-rose-300 border border-rose-700/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]';

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm leading-relaxed"
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wide ${badgeColor}`}>
                        {log.type}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold">
                        T+{log.tick} &bull; {log.timestamp}
                      </span>
                    </div>
                    <div className="text-slate-200 text-xs sm:text-[13px] leading-relaxed break-words font-mono">
                      {log.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Structured JSON Dispatch Actions */}
        {activeTab === 'actions' && (
          <div className="space-y-2.5">
            {activeActions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 font-mono text-xs">
                {t.noActions}
              </div>
            ) : (
              activeActions.map((action, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-cyan-300 font-bold mb-1 font-mono text-xs">
                    <span>Order #{action.orderId} &rarr; {action.assignedRobotId}</span>
                    <span className="text-[11px] text-slate-400">{action.routeWaypoints.length} waypoints</span>
                  </div>
                  <div className="text-xs text-slate-200 mb-2 leading-relaxed">
                    {action.priorityReasoning}
                  </div>
                  <pre className="p-2 rounded-lg bg-slate-950 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800/80">
                    {JSON.stringify(action, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Order Queue */}
        {activeTab === 'orders' && (
          <div className="space-y-2">
            {orders.map(order => {
              const remainingTicks = order.deadlineTick - tick;
              const isUrgent = remainingTicks <= 15 && order.status !== 'delivered';
              const isSelected = order.id === selectedOrderId;

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : order.status === 'delivered'
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-300'
                      : order.status === 'failed'
                      ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs font-mono">
                    <span className="text-slate-100">#{order.id} - {order.sender}</span>
                    <span className="text-emerald-400 font-bold">${order.reward}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex justify-between mt-1">
                    <span className="font-semibold">STATUS: {order.status.toUpperCase()}</span>
                    <span className={isUrgent ? 'text-rose-400 font-bold' : ''}>
                      {order.status === 'delivered'
                        ? (isZh ? `已送达 @ ${getDayClockInfo(order.deliveredAtTick || tick).time12}` : `Delivered @ ${getDayClockInfo(order.deliveredAtTick || tick).time12}`)
                        : order.status === 'failed'
                        ? (isZh ? `已超时违约 (截止 ${getDayClockInfo(order.deadlineTick).time12})` : `Failed (Due ${getDayClockInfo(order.deadlineTick).time12})`)
                        : (isZh
                            ? `截止 ${getDayClockInfo(order.deadlineTick).time12} (剩 ${Math.max(0, remainingTicks * 6)}分钟)`
                            : `Due ${getDayClockInfo(order.deadlineTick).time12} (${Math.max(0, remainingTicks * 6)}m left)`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Fleet Telemetry */}
        {activeTab === 'fleet' && (
          <div className="space-y-2">
            {robots.map(bot => {
              const isSelected = bot.id === selectedRobotId;
              return (
                <div
                  key={bot.id}
                  onClick={() => onSelectRobot(bot.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100 font-bold">{bot.name}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        bot.archetype === 'heavy'
                          ? 'bg-purple-950/80 border-purple-800/60 text-purple-300'
                          : (bot.archetype === 'speedy'
                              ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                              : 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300')
                      }`}>
                        {bot.archetype === 'heavy' ? (lang === 'zh' ? '重载长途' : 'HEAVY') : (bot.archetype === 'speedy' ? (lang === 'zh' ? '极速轻骑' : 'SPEEDY') : (lang === 'zh' ? '全能标准' : 'STANDARD'))}
                      </span>
                    </div>
                    <span className={`font-bold ${bot.batteryPct > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {bot.batteryPct.toFixed(0)}% 电池
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex justify-between mt-1.5">
                    <span>状态: {bot.status.toUpperCase()}</span>
                    <span>载重: {bot.currentPayloadKg.toFixed(1)}/{bot.maxCapacityKg}kg ({bot.carriedOrderIds?.length || (bot.currentOrderId ? 1 : 0)}/{bot.maxOrdersCapacity || (bot.archetype === 'heavy' ? 2 : 1)}单)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-2 border border-slate-800/80">
                    <div
                      className={`h-full transition-all duration-300 ${bot.batteryPct > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-400'}`}
                      style={{ width: `${bot.batteryPct}%` }}
                    />
                  </div>
                  {bot.carriedOrderIds && bot.carriedOrderIds.length > 1 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2 py-1 rounded-lg shadow-[0_0_8px_rgba(168,85,247,0.25)] animate-pulse font-mono">
                      <span>📦📦</span>
                      <span className="font-bold">{lang === 'zh' ? `一车双单连运中: ${bot.carriedOrderIds.map(id => '#' + id).join(' ➔ ')}` : `Multi-Drop: ${bot.carriedOrderIds.map(id => '#' + id).join(' -> ')}`}</span>
                    </div>
                  )}
                  {bot.missionQueue && bot.missionQueue.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-1 rounded-lg font-mono">
                      <span>⚡</span>
                      <span>{lang === 'zh' ? `已排程后续任务: ${bot.missionQueue.length} 单 (零空闲无缝执行)` : `Queued: ${bot.missionQueue.length} missions (Zero idle)`}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
