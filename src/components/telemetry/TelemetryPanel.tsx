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
    <div className="w-80 lg:w-96 h-full flex flex-col bg-slate-950/95 border-l border-cyan-950/60 overflow-hidden text-xs font-mono select-none">
      {/* 1. Header & Live Financials */}
      <div className="p-3 border-b border-cyan-950/60 bg-slate-900/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            {t.title}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono font-bold">{formatSimTimestamp(tick)}</span>
        </div>

        {/* Low Cash Alert Banner */}
        {financials.balance <= 50 && financials.balance > 0 && (
          <div className="mb-2 p-1.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-[10px] text-rose-300 font-bold flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              {isZh ? '财库资金告急！谨防破产清算' : 'Treasury Critical! Risk of Insolvency'}
            </span>
            <span>${financials.balance.toFixed(2)}</span>
          </div>
        )}

        {/* Live Balance Card */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between mb-0.5 text-[10px]">
            <span className="text-slate-400 uppercase tracking-wider">
              {t.treasuryBalance}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 border border-cyan-900/50 text-cyan-300">
              {isZh ? `下期账单: ${ticksUntilNextInvoice} Ticks` : `Next Bill: ${ticksUntilNextInvoice}T`}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className={`text-2xl font-black tracking-tight ${financials.balance > 150 ? 'text-cyan-300' : 'text-rose-400'}`}>
              ${financials.balance.toFixed(2)}
            </div>
            <div className={`flex items-center text-xs font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {metrics.profitMargin}% {t.netMargin}
            </div>
          </div>

          {/* Quick Revenue vs Expenses */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
            <div>
              <span className="text-slate-500 block">{t.revenue}</span>
              <span className="text-emerald-400 font-bold">+${financials.totalRevenue.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{t.expenses}</span>
              <span className="text-rose-400 font-bold">-${financials.totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          {/* Toggle Full Operational Ledger Button */}
          <button
            type="button"
            onClick={() => setShowLedger(!showLedger)}
            className="mt-2.5 w-full py-1 px-2 rounded-lg bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1 text-cyan-400">
              <Receipt className="w-3 h-3 text-cyan-400" />
              {isZh ? '成本明细与周期账单' : 'Cost Ledger & Invoices'}
            </span>
            {showLedger ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Expanded Detailed Cost Ledger */}
          {showLedger && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1.5 animate-in fade-in duration-150">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {isZh ? '运营支出科目清单' : 'Operational Cost Ledger'}
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {isZh ? '电力补能电费' : 'Energy & Charging'}
                </span>
                <span className="font-bold text-slate-200">-${financials.energyCosts.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  {isZh ? '里程行驶折旧' : 'Mileage Travel Wear'}
                </span>
                <span className="font-bold text-slate-200">-${financials.mileageCosts.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-blue-400" />
                  {isZh ? '车队定期维保' : 'Fleet Maintenance'}
                </span>
                <span className="font-bold text-slate-200">-${financials.maintenanceCosts.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-purple-400" />
                  {isZh ? '站点租金市政' : 'Hub Leases & Utilities'}
                </span>
                <span className="font-bold text-slate-200">-${(financials.hubRentCosts || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  {isZh ? 'SLA违约罚金' : 'SLA Breach Penalties'}
                </span>
                <span className={`font-bold ${financials.slaPenalties > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  -${financials.slaPenalties.toFixed(2)}
                </span>
              </div>

              {/* Latest Periodic Invoice Mini-Receipt */}
              {financials.lastInvoice && (
                <div className="mt-2 p-2 rounded-lg bg-slate-950 border border-purple-900/60 text-[9px] text-slate-300 space-y-1 shadow-inner">
                  <div className="flex justify-between font-bold text-purple-300">
                    <span>
                      {isZh
                        ? `🧾 第 ${financials.lastInvoice.period} 期账单 (Tick ${financials.lastInvoice.tick})`
                        : `🧾 Invoice #${financials.lastInvoice.period} (T${financials.lastInvoice.tick})`}
                    </span>
                    <span className="text-rose-400">-${financials.lastInvoice.totalInvoiceCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isZh ? `车队维护 (${financials.lastInvoice.robotCount} 台车)` : `Fleet (${financials.lastInvoice.robotCount} bots)`}</span>
                    <span>-${financials.lastInvoice.robotMaintenanceTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
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
      <div className="p-3 border-b border-cyan-950/60 bg-slate-950/60 grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-400 block">{t.onTimeSla}</span>
          <span className={`text-sm font-black ${metrics.onTimeDeliveryRate >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.onTimeDeliveryRate}%
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-400 block">{t.delivered}</span>
          <span className="text-sm font-black text-cyan-300">
            {metrics.totalDelivered}
          </span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-[9px] text-slate-400 block">{t.slaBreached}</span>
          <span className={`text-sm font-black ${metrics.totalFailed > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {metrics.totalFailed}
          </span>
        </div>
      </div>

      {/* 3. Interactive Prompt Debugging (Selected Entity Inspector) */}
      {(selectedRobot || selectedOrder) && (
        <div className="p-3 bg-gradient-to-b from-cyan-950/50 to-slate-950/80 border-b border-cyan-500/40 flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              {selectedRobot ? t.selectedRobot : t.selectedOrder}
            </span>
            <button
              onClick={onClearSelection}
              className="text-slate-400 hover:text-slate-200 text-[10px] px-1 py-0.5 rounded bg-slate-900 border border-slate-800"
            >
              {t.close}
            </button>
          </div>

          {/* Robot Telemetry */}
          {selectedRobot && (
            <div className="text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.name}</span>
                <span className="font-bold text-slate-100">{selectedRobot.name} ({selectedRobot.id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.battery}</span>
                <span className={`font-bold ${selectedRobot.batteryPct > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedRobot.batteryPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.statusPayload}</span>
                <span className="text-cyan-300">{selectedRobot.status.toUpperCase()} ({selectedRobot.currentPayloadKg}/{selectedRobot.maxCapacityKg}kg)</span>
              </div>
            </div>
          )}

          {/* Order Details */}
          {selectedOrder && (
            <div className="text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">{t.orderId}</span>
                <span className="font-bold text-slate-100">#{selectedOrder.id} ({selectedOrder.sender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.destination}</span>
                <span className="text-cyan-300">({selectedOrder.recipientAddress.x}, {selectedOrder.recipientAddress.y}) - {selectedOrder.recipientAddress.zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{t.rewardSla}</span>
                <span className="font-bold text-emerald-400">
                  ${selectedOrder.reward} / {getDayClockInfo(selectedOrder.deadlineTick).time12}
                </span>
              </div>
            </div>
          )}

          {/* Exact Prompt Snippet & LLM Decision Justification */}
          {relevantAction && (
            <div className="mt-1 p-2 rounded-lg bg-slate-900/90 border border-cyan-800/60 text-[10px]">
              <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>ARCHITECT DECISION RATIONALE:</span>
              </div>
              <div className="text-slate-300 leading-relaxed italic">
                &ldquo;{relevantAction.priorityReasoning}&rdquo;
              </div>
              <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-slate-400 flex justify-between">
                <span>Waypoints: {relevantAction.routeWaypoints.length} nodes</span>
                <span className="text-emerald-400">STATUS: EXECUTED</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Tab Navigation for Inspector */}
      <div className="flex items-center border-b border-cyan-950/60 bg-slate-900/60 px-2 pt-1 gap-1">
        <button
          onClick={() => setActiveTab('thoughts')}
          className={`px-2.5 py-1.5 rounded-t text-[10px] font-bold transition-colors flex items-center gap-1 ${
            activeTab === 'thoughts'
              ? 'bg-slate-950 text-cyan-400 border-t border-x border-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3 h-3" />
          <span>{t.tabs.thoughts}</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-2.5 py-1.5 rounded-t text-[10px] font-bold transition-colors flex items-center gap-1 ${
            activeTab === 'actions'
              ? 'bg-slate-950 text-cyan-400 border-t border-x border-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3 h-3" />
          <span>{t.tabs.actions} ({activeActions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-2.5 py-1.5 rounded-t text-[10px] font-bold transition-colors flex items-center gap-1 ${
            activeTab === 'orders'
              ? 'bg-slate-950 text-cyan-400 border-t border-x border-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-3 h-3" />
          <span>{t.tabs.orders}</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-2.5 py-1.5 rounded-t text-[10px] font-bold transition-colors flex items-center gap-1 ${
            activeTab === 'fleet'
              ? 'bg-slate-950 text-cyan-400 border-t border-x border-cyan-950/60'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Battery className="w-3 h-3" />
          <span>{t.tabs.fleet}</span>
        </button>
      </div>

      {/* 5. Tab Content: Terminal / Inspector */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-[10px]">
        {/* Tab 1: Agent Thought Inspector */}
        {activeTab === 'thoughts' && (
          <div className="space-y-1.5">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                {t.awaitingThoughts}
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeColor = 'bg-slate-800 text-slate-400';
                if (log.type === 'tool_call') badgeColor = 'bg-cyan-950 text-cyan-400 border border-cyan-800/40';
                if (log.type === 'tool_result') badgeColor = 'bg-emerald-950 text-emerald-400 border border-emerald-800/40';
                if (log.type === 'reasoning') badgeColor = 'bg-purple-950 text-purple-300 border border-purple-800/40';
                if (log.type === 'dispatch_plan') badgeColor = 'bg-amber-950 text-amber-300 border border-amber-800/40';
                if (log.type === 'error') badgeColor = 'bg-rose-950 text-rose-400 border border-rose-800/40';

                return (
                  <div
                    key={log.id}
                    className="p-2 rounded bg-slate-900/60 border border-slate-800/60 leading-relaxed"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${badgeColor}`}>
                        {log.type}
                      </span>
                      <span className="text-slate-500 text-[9px]">
                        T+{log.tick} &bull; {log.timestamp}
                      </span>
                    </div>
                    <div className="text-slate-200 break-words">
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
          <div className="space-y-2">
            {activeActions.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                {t.noActions}
              </div>
            ) : (
              activeActions.map((action, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
                    <span>Order #{action.orderId} &rarr; {action.assignedRobotId}</span>
                    <span className="text-[9px] text-slate-400">{action.routeWaypoints.length} waypoints</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mb-1.5 leading-relaxed">
                    {action.priorityReasoning}
                  </div>
                  <pre className="p-1.5 rounded bg-slate-950 text-[9px] text-emerald-400 overflow-x-auto">
                    {JSON.stringify(action, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Order Queue */}
        {activeTab === 'orders' && (
          <div className="space-y-1.5">
            {orders.map(order => {
              const remainingTicks = order.deadlineTick - tick;
              const isUrgent = remainingTicks <= 15 && order.status !== 'delivered';
              const isSelected = order.id === selectedOrderId;

              return (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order.id)}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : order.status === 'delivered'
                      ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400'
                      : order.status === 'failed'
                      ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                      : 'bg-slate-900/70 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>#{order.id} - {order.sender}</span>
                    <span className="text-emerald-400">${order.reward}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 flex justify-between mt-0.5">
                    <span>Status: {order.status.toUpperCase()}</span>
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
          <div className="space-y-1.5">
            {robots.map(bot => {
              const isSelected = bot.id === selectedRobotId;
              return (
                <div
                  key={bot.id}
                  onClick={() => onSelectRobot(bot.id)}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-100">{bot.name}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border ${
                        bot.archetype === 'heavy'
                          ? 'bg-purple-950/80 border-purple-800/60 text-purple-300'
                          : (bot.archetype === 'speedy'
                              ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                              : 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300')
                      }`}>
                        {bot.archetype === 'heavy' ? (lang === 'zh' ? '重载长途' : 'HEAVY') : (bot.archetype === 'speedy' ? (lang === 'zh' ? '极速轻骑' : 'SPEEDY') : (lang === 'zh' ? '全能标准' : 'STANDARD'))}
                      </span>
                    </div>
                    <span className={bot.batteryPct > 50 ? 'text-emerald-400' : 'text-amber-400'}>
                      {bot.batteryPct.toFixed(0)}% BATTERY
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-400 flex justify-between mt-1">
                    <span>Status: {bot.status.toUpperCase()}</span>
                    <span>载重: {bot.currentPayloadKg.toFixed(1)}/{bot.maxCapacityKg}kg ({bot.carriedOrderIds?.length || (bot.currentOrderId ? 1 : 0)}/{bot.maxOrdersCapacity || (bot.archetype === 'heavy' ? 2 : 1)}单)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full ${bot.batteryPct > 50 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      style={{ width: `${bot.batteryPct}%` }}
                    />
                  </div>
                  {bot.carriedOrderIds && bot.carriedOrderIds.length > 1 && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-purple-300 bg-purple-950/60 border border-purple-800/60 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(168,85,247,0.25)] animate-pulse">
                      <span>📦📦</span>
                      <span className="font-bold">{lang === 'zh' ? `一车双单连运中: ${bot.carriedOrderIds.map(id => '#' + id).join(' ➔ ')}` : `Multi-Drop: ${bot.carriedOrderIds.map(id => '#' + id).join(' -> ')}`}</span>
                    </div>
                  )}
                  {bot.missionQueue && bot.missionQueue.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-amber-300 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
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
