import React, { useState } from 'react';
import {
  AgentThoughtStep,
  InterAgentMessage,
  OrderTicket,
  RestaurantFinancials,
  RestaurantMetrics,
  SushiAgentRole
} from '../../lib/sushi/types';
import { useSushiI18n } from '../../lib/sushi/i18n';
import {
  MessageSquare,
  Activity,
  Receipt,
  TrendingUp,
  ArrowRight,
  Filter
} from 'lucide-react';

interface MultiAgentTelemetryProps {
  financials: RestaurantFinancials;
  metrics: RestaurantMetrics;
  messages: InterAgentMessage[];
  thoughtSteps: AgentThoughtStep[];
  activeTickets: OrderTicket[];
  completedTickets: OrderTicket[];
  selectedRole: SushiAgentRole;
  tick: number;
  onToggleCollapse?: () => void;
}

export const MultiAgentTelemetry: React.FC<MultiAgentTelemetryProps> = ({
  financials,
  metrics,
  messages,
  thoughtSteps,
  activeTickets,
  completedTickets,
  selectedRole,
  tick,
  onToggleCollapse
}) => {
  const { language, t, getRecipeTitle, translateMsg, translateCustName, translateCustNote } = useSushiI18n();
  const [activeTab, setActiveTab] = useState<'comms' | 'thoughts' | 'finance' | 'tickets'>('comms');
  const [roleFilter, setRoleFilter] = useState<SushiAgentRole | 'all'>('all');
  const isEn = language === 'en';

  // Filter thoughts
  const filteredThoughts = thoughtSteps.filter(th =>
    roleFilter === 'all' ? true : th.agentRole === roleFilter
  );

  // Helper for agent avatar
  const getAgentAvatar = (role: SushiAgentRole) => {
    switch (role) {
      case 'host':
        return '💁‍♀️';
      case 'chef':
        return '👨‍🍳';
      case 'inventory':
        return '📦';
      case 'manager':
        return '👩‍💼';
    }
  };

  const getAgentName = (role: SushiAgentRole) => {
    switch (role) {
      case 'host':
        return t('roleAoi');
      case 'chef':
        return t('roleKenji');
      case 'inventory':
        return t('roleRen');
      case 'manager':
        return t('roleSakura');
    }
  };

  const getChannelBadge = (channel: InterAgentMessage['channel']) => {
    switch (channel) {
      case 'order_dispatch':
        return <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">{t('chOrderDispatch')}</span>;
      case 'inventory_alert':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">{t('chStockAlert')}</span>;
      case 'customer_feedback':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">{t('chCustomerFeedback')}</span>;
      case 'strategy_sync':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">{t('chStrategySync')}</span>;
      default:
        return <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold">{t('chGeneral')}</span>;
    }
  };

  return (
    <div className="w-72 xl:w-80 2xl:w-96 h-full flex flex-col bg-slate-900 border-l border-slate-800 select-none z-10 shrink-0">
      {/* 1. Header Tabs */}
      <div className="flex border-b border-slate-800 text-xs sm:text-sm font-semibold bg-slate-950/80 shrink-0">
        <button
          onClick={() => setActiveTab('comms')}
          className={`flex-1 py-2.5 sm:py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'comms'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Inter-Agent live chat bus"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('tabComms')}</span>
        </button>

        <button
          onClick={() => setActiveTab('thoughts')}
          className={`flex-1 py-2.5 sm:py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'thoughts'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Agent reasoning and tool execution log"
        >
          <Activity className="w-4 h-4" />
          <span>{t('tabThoughts')}</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex-1 py-2.5 sm:py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'finance'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="P&L audit and operational metrics"
        >
          <TrendingUp className="w-4 h-4" />
          <span>{t('tabFinance')}</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-2.5 sm:py-3 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'tickets'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          title="Kitchen tickets queue"
        >
          <Receipt className="w-4 h-4" />
          <span>{t('tabTickets', { count: activeTickets.length })}</span>
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="px-2 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono transition border-b-2 border-transparent"
            title={t('collapseRight')}
          >
            ▶
          </button>
        )}
      </div>

      {/* 2. Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 min-h-0">
        {/* TAB 1: Inter-Agent Comms Stream */}
        {activeTab === 'comms' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {t('eventBusTitle')}
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                {messages.length} {isEn ? 'msgs' : '條通訊'}
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-12 text-center">
                <span className="font-semibold">{isEn ? 'No communication records yet' : '暫無通訊紀錄'}</span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {isEn ? 'Agents will interact here automatically during service' : '開始運行後 Agent 將自動交流'}
                </span>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={`${msg.id}_${idx}`}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-sm flex flex-col gap-1.5 shrink-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <span>{getAgentAvatar(msg.fromRole)}</span>
                      <span className="text-xs font-bold text-white">
                        {getAgentName(msg.fromRole).split(' ')[0]}
                      </span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                      <span>{msg.toRole === 'all' ? (isEn ? '📢 All' : '📢 全員') : getAgentAvatar(msg.toRole)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {getChannelBadge(msg.channel)}
                      <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    {translateMsg(msg.content)}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Agent Thought Trace */}
        {activeTab === 'thoughts' && (
          <div className="flex flex-col gap-2.5">
            {/* Filter by role */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" />
                <span>{isEn ? 'Filter:' : '篩選 Agent:'}</span>
              </span>
              <div className="flex items-center gap-1">
                {(['all', 'host', 'chef', 'inventory', 'manager'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-2 py-0.5 text-xs rounded transition font-medium ${
                      roleFilter === role
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white bg-slate-800'
                    }`}
                  >
                    {role === 'all' ? (isEn ? 'All' : '全部') : getAgentAvatar(role)}
                  </button>
                ))}
              </div>
            </div>

            {filteredThoughts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                <span>{isEn ? 'No thought records yet' : '暫無思維鏈紀錄'}</span>
              </div>
            ) : (
              filteredThoughts.map((th, idx) => {
                const isTool = th.type === 'tool_call';
                const isObserve = th.type === 'observe';

                return (
                  <div
                    key={`${th.id}_${idx}`}
                    className={`p-2.5 rounded-xl border text-xs leading-relaxed flex flex-col gap-1 shrink-0 ${
                      isTool
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : isObserve
                        ? 'bg-sky-950/20 border-sky-500/40'
                        : 'bg-slate-800/60 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>{getAgentAvatar(th.agentRole)}</span>
                        <span className="font-bold text-slate-300">
                          {isEn
                            ? th.agentRole === 'host'
                              ? 'Aoi'
                              : th.agentRole === 'chef'
                              ? 'Kenji'
                              : th.agentRole === 'inventory'
                              ? 'Ren'
                              : th.agentRole === 'manager'
                              ? 'Sakura'
                              : th.agentName
                            : th.agentName}
                        </span>
                        <span
                          className={`px-1 rounded text-[10px] uppercase font-bold ${
                            isTool
                              ? 'bg-amber-500/20 text-amber-300'
                              : isObserve
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {th.type}
                        </span>
                      </div>
                      <span className="text-slate-500">{th.timestamp}</span>
                    </div>

                    <p className="text-slate-200 font-mono text-xs mt-0.5">{translateMsg(th.content)}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Financials & Business Metrics */}
        {activeTab === 'finance' && (
          <div className="flex flex-col gap-3">
            {/* Financial Card */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-2.5 shadow-sm shrink-0">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>{t('plAuditTitle')}</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">{isEn ? 'Operating Revenue' : '總營業收入'}</span>
                  <span className="text-sm font-bold text-emerald-400">
                    ${financials.totalRevenue.toFixed(0)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">{isEn ? 'Procurement Costs' : '採購支出'}</span>
                  <span className="text-sm font-bold text-rose-400">
                    -${financials.procurementCosts.toFixed(0)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">{isEn ? 'Total Tips' : '小費總計'}</span>
                  <span className="text-sm font-bold text-amber-300">
                    +${financials.tipsTotal.toFixed(0)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col">
                  <span className="text-[11px] text-slate-400">{isEn ? 'Net Cash' : '現金結餘'}</span>
                  <span
                    className={`text-sm font-bold ${
                      financials.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ${financials.balance.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics Card */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col gap-2.5 shadow-sm shrink-0">
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>{isEn ? 'Service Efficiency (KPIs)' : '服務效率指標 (KPIs)'}</span>
              </span>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">{isEn ? 'Guests Served:' : '已完餐顧客數:'}</span>
                  <span className="font-bold text-white font-mono">{metrics.customersServed}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">{isEn ? 'Walkout Complaints:' : '久候離店客訴:'}</span>
                  <span
                    className={`font-bold font-mono ${
                      metrics.customersWalkout > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {metrics.customersWalkout}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">{isEn ? 'Dishes Plated:' : '料理出盤總量:'}</span>
                  <span className="font-bold text-white font-mono">
                    {metrics.dishesPreparedCount}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">{isEn ? 'Stockout Alerts:' : '食材缺貨告警:'}</span>
                  <span
                    className={`font-bold font-mono ${
                      metrics.stockoutIncidentsCount > 0 ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {metrics.stockoutIncidentsCount}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">{isEn ? 'Team Efficiency:' : '全店協同效率:'}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {metrics.efficiencyScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Active Order Tickets */}
        {activeTab === 'tickets' && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {isEn ? 'Kitchen Order Tickets' : '工單監控清單'}
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold">
                {activeTickets.length} {isEn ? 'pending' : '張未完成'}
              </span>
            </div>

            {activeTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 text-xs py-12 text-center">
                <span>{isEn ? 'Kitchen queue currently clear 🎉' : '後廚佇列目前已清空 🎉'}</span>
              </div>
            ) : (
              activeTickets.map((ticket, idx) => {
                const isPrep = ticket.status === 'in_prep';
                const isReady = ticket.status === 'ready_to_serve';
                const recipeTitle = getRecipeTitle(ticket.recipeId, ticket.recipeName);

                return (
                  <div
                    key={`${ticket.id}_${idx}`}
                    className={`p-2.5 rounded-xl border flex flex-col gap-1.5 shrink-0 ${
                      isReady
                        ? 'bg-emerald-950/30 border-emerald-500/50'
                        : isPrep
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-slate-800/80 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{ticket.recipeEmoji}</span>
                        <span className="text-xs font-bold text-white">{recipeTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        #{ticket.id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{isEn ? 'Guest:' : '顧客:'} {translateCustName(ticket.customerName)}</span>
                      <span>{isEn ? 'Table:' : '桌號:'} {ticket.tableId}</span>
                    </div>

                    {ticket.customNote && (
                      <div className="text-[11px] bg-purple-950/40 text-purple-300 border border-purple-800/40 px-2 py-0.5 rounded font-mono">
                        {isEn ? 'Note:' : '備註:'} {translateCustNote(ticket.customNote)}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono">
                      <span className="text-slate-500">{isEn ? 'Status:' : '進度:'}</span>
                      <span
                        className={`font-bold uppercase ${
                          isReady ? 'text-emerald-400' : isPrep ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
