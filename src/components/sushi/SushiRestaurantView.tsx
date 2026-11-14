import React, { useState } from 'react';
import {
  Customer,
  DiningTable,
  IngredientKey,
  KitchenStation,
  SushiSimulationState
} from '../../lib/sushi/types';
import { SUSHI_RECIPES } from '../../lib/sushi/recipes';
import { SushiOvercookedStage } from './SushiOvercookedStage';
import { useSushiI18n } from '../../lib/sushi/i18n';
import {
  Utensils,
  Clock,
  Flame,
  CheckCircle2,
  Package,
  Tv,
  LayoutGrid,
  PlusCircle,
  Users
} from 'lucide-react';

interface SushiRestaurantViewProps {
  state: SushiSimulationState;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectTable?: (table: DiningTable) => void;
  onSelectStation?: (station: KitchenStation) => void;
  onAddTable?: () => void;
  onReset?: () => void;
  onOpenStaffModal?: () => void;
  onOpenBranchMapModal?: () => void;
  onSelectBranch?: (branchId: string) => void;
}

export const SushiRestaurantView: React.FC<SushiRestaurantViewProps> = ({
  state,
  onSelectCustomer,
  onSelectTable,
  onSelectStation,
  onAddTable,
  onOpenStaffModal,
  onOpenBranchMapModal,
  onSelectBranch
}) => {
  const { language, t, getRecipeTitle, getIngredientInfo, translateCustName } = useSushiI18n();
  const [hoveredCustomer, setHoveredCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'cartoon' | 'classic'>('cartoon');
  const isEn = language === 'en';

  const branchName = state.branches?.find(b => b.id === state.activeBranchId)?.name;
  const displayBranchName = branchName || (isEn ? 'SushiFlow AI Flagship Store' : '江戶前・壽司物語 AI 旗艦店');

  // Helper for patience color
  const getPatienceColor = (rem: number, max: number) => {
    const pct = rem / max;
    if (pct > 0.6) return 'bg-emerald-500';
    if (pct > 0.3) return 'bg-amber-500';
    return 'bg-rose-500 animate-pulse';
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950/90 text-slate-200 select-none overflow-y-auto p-2 sm:p-2.5 gap-2 relative">
      {/* Sleek Ambience Bar with View Mode Toggle */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-amber-950/40 border border-amber-900/30 rounded-xl px-3 py-1.5 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏮</span>
          <h2 className="text-xs sm:text-sm font-bold text-amber-200 tracking-wider flex items-center gap-2">
            {displayBranchName}
            {state.rushHourActive && (
              <span className="text-[10px] bg-rose-600 text-white font-mono px-1.5 py-0.2 rounded-full animate-bounce font-bold">
                ⚡ {isEn ? 'Rush Hour' : '尖峰客流'}
              </span>
            )}
          </h2>
        </div>

        {/* View Mode Switcher + Multi-Branch + Counters */}
        <div className="flex items-center gap-2.5">
          {/* Multi-Branch Switcher */}
          {state.branches && state.branches.length > 1 && (
            <select
              value={state.activeBranchId}
              onChange={e => onSelectBranch?.(e.target.value)}
              className="bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-500/50 rounded-lg px-2 py-0.5 text-xs font-bold cursor-pointer"
              title="Switch Branch View"
            >
              {state.branches.map(b => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  🏢 {b.name} ({b.tables?.length || 6}/16)
                </option>
              ))}
            </select>
          )}

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 p-0.5 rounded-lg text-xs font-medium shadow-inner">
            <button
              onClick={() => setViewMode('cartoon')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all text-xs ${
                viewMode === 'cartoon'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>{t('animeTheaterBtn')}</span>
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md transition-all text-xs ${
                viewMode === 'classic'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{t('dataBoardBtn')}</span>
            </button>
          </div>

          {/* Quick status counters */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>{isEn ? 'Queue:' : '候位:'}</span>
              <span className="text-white font-bold">{state.customersInQueue.length}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isEn ? 'Tables:' : '席位:'}</span>
              <span className="text-white font-bold">{state.seatedCustomers.length}/{state.tables.length}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isEn ? 'Orders:' : '工單:'}</span>
              <span className="text-white font-bold">{state.activeTickets.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Either Animated Cartoon Scene or Classic Data Grid */}
      {viewMode === 'cartoon' ? (
        <div className="flex-1 flex flex-col min-h-0">
          <SushiOvercookedStage
            state={state}
            onSelectCustomer={onSelectCustomer}
            onSelectTable={onSelectTable}
            onSelectStation={onSelectStation}
            onAddTable={onAddTable}
            onOpenBranchMapModal={onOpenBranchMapModal}
          />
        </div>
      ) : (
        /* Main Restaurant Floor Grid (Classic) */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1">
        {/* Left Column (4 cols): Queue Entrance & Cold Storage Inventory */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* 1. Entrance Waiting Line */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🚪</span>
                <span className="text-xs font-bold text-slate-200">{t('waitingQueueTitle')}</span>
              </div>
              <span className="text-xs bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-mono">
                {state.customersInQueue.length} {isEn ? 'waiting' : '位等待中'}
              </span>
            </div>

            {/* Queue List */}
            <div className="flex flex-col gap-2 min-h-[140px] max-h-[220px] overflow-y-auto pr-1">
              {state.customersInQueue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8 text-center">
                  <span>{t('noQueueText')}</span>
                  <span className="text-[11px] text-slate-400 mt-1">{t('noQueueSub')}</span>
                </div>
              ) : (
                state.customersInQueue.map((cust) => (
                  <div
                    key={cust.id}
                    onMouseEnter={() => setHoveredCustomer(cust)}
                    onMouseLeave={() => setHoveredCustomer(null)}
                    onClick={() => onSelectCustomer?.(cust)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{cust.avatar}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{translateCustName(cust.name)}</span>
                          {cust.isVip && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                              VIP
                            </span>
                          )}
                          {cust.specialPreference !== 'none' && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1 rounded">
                              {cust.specialPreference === 'no_wasabi'
                                ? (isEn ? 'No Wasabi' : '免芥末')
                                : cust.specialPreference === 'vegetarian'
                                ? (isEn ? 'Vegetarian' : '素食')
                                : (isEn ? 'In Rush' : '趕時間')}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {isEn ? 'Prefers: ' : '想吃: '}
                          {cust.orders.map(o => getRecipeTitle(o.recipeId)).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Patience Bar */}
                    <div className="flex flex-col items-end gap-1 w-16">
                      <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{Math.round((cust.patienceRemaining / cust.patienceMax) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPatienceColor(
                            cust.patienceRemaining,
                            cust.patienceMax
                          )}`}
                          style={{
                            width: `${Math.max(0, Math.min(100, (cust.patienceRemaining / cust.patienceMax) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Cold Storage & Pantry Inventory */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">{t('pantryTitle')}</span>
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('renMonitoring')}
              </span>
            </div>

            {/* Ingredient Grid */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {(Object.keys(state.inventory) as IngredientKey[]).map(key => {
                const item = state.inventory[key];
                const ingInfo = getIngredientInfo(key, item.name, item.unit);
                const isLow = item.currentStock <= item.reorderThreshold;
                const isOut = item.currentStock === 0;

                return (
                  <div
                    key={key}
                    className={`p-2 rounded-xl border transition flex flex-col justify-between ${
                      isOut
                        ? 'bg-rose-950/40 border-rose-500/60 shadow-sm shadow-rose-950'
                        : isLow
                        ? 'bg-amber-950/30 border-amber-600/50'
                        : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[80px]">
                          {ingInfo.name.split(' ')[0]}
                        </span>
                      </div>
                      {isOut ? (
                        <span className="text-[9px] bg-rose-600 text-white font-bold px-1 rounded animate-pulse">
                          {isEn ? 'OUT' : '斷貨'}
                        </span>
                      ) : isLow ? (
                        <span className="text-[9px] bg-amber-600 text-white font-bold px-1 rounded">
                          {isEn ? 'LOW' : '告急'}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                        <span>{isEn ? 'Stock:' : '庫存:'}</span>
                        <span
                          className={`font-bold ${
                            isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.currentStock} {ingInfo.unit}
                        </span>
                      </div>

                      {/* Stock capacity bar */}
                      <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (item.currentStock / item.maxCapacity) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Sushi Bar, Kitchen Stations & Dining Tables */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* 3. Kitchen & Chef Kenji Station */}
          <div className="bg-slate-900/90 border border-amber-900/30 rounded-2xl p-4 shadow-md flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-sm">
                  👨‍🍳
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{t('masterStationsTitle')}</span>
                    <span className="text-xs text-orange-400 font-mono font-medium">{t('kenjiDirecting')}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {t('stageChefAction')}
                  </p>
                </div>
              </div>

              {/* Station Activity Badges */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  {isEn ? 'Active Stations: ' : '料理台運轉中: '}
                  <span className="text-amber-300 font-bold">
                    {state.kitchenStations.filter(s => s.status === 'prepping').length} / 3
                  </span>
                </span>
              </div>
            </div>

            {/* 3 Kitchen Stations Horizontal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {state.kitchenStations.map(station => {
                const isPrepping = station.status === 'prepping';
                const isPlated = station.status === 'plated';
                const ticket = state.activeTickets.find(t => t.id === station.currentTicketId);
                const stationTitle = station.id === 'station_1' ? t('prepStation1') : station.id === 'station_2' ? t('prepStation2') : t('prepStation3');

                return (
                  <div
                    key={station.id}
                    onClick={() => onSelectStation?.(station)}
                    className={`p-3 rounded-xl border transition flex flex-col justify-between min-h-[110px] cursor-pointer ${
                      isPlated
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm shadow-emerald-950 animate-pulse'
                        : isPrepping
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-sm shadow-amber-950'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{station.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{stationTitle}</span>
                          <span className="text-[10px] text-slate-400">{isEn ? 'Chef Kenji' : station.assignedChef}</span>
                        </div>
                      </div>

                      {isPlated ? (
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {isEn ? 'Ready' : '待取餐'}
                        </span>
                      ) : isPrepping ? (
                        <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                          <Flame className="w-2.5 h-2.5" /> {isEn ? 'Cooking' : '製作中'}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                          {isEn ? 'Idle' : '空閒'}
                        </span>
                      )}
                    </div>

                    {/* Dish in prep */}
                    {ticket ? (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-amber-200 font-semibold truncate max-w-[120px]">
                            {ticket.recipeEmoji} {getRecipeTitle(ticket.recipeId, ticket.recipeName)}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            #{ticket.id}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isPlated ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${station.prepProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center justify-center text-[11px] text-slate-500 italic">
                        {isEn ? 'Waiting for orders...' : '等待新工單注入...'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Dining Tables & Guests Layout */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">
                  {t('diningTablesTitle')} ({state.tables.length}/16 {isEn ? 'Tables' : '席'})
                </span>
                {onAddTable && state.tables.length < 16 && (
                  <button
                    onClick={onAddTable}
                    className="ml-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    title="Add Table ($150)"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('addTable')} ($150)</span>
                  </button>
                )}
                {onOpenBranchMapModal && (state.tables.length >= 16 || state.hasReachedMaxTables) && (
                  <button
                    onClick={onOpenBranchMapModal}
                    className="ml-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 transition active:scale-95 shadow-sm animate-pulse"
                    title="16 Tables Max! Open new branch"
                  >
                    <span>🗺️ {t('branchMap')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 flex-1 overflow-y-auto pr-1">
              {state.tables.map(table => {
                const customer = state.seatedCustomers.find(c => c.tableId === table.id);
                const isEating = customer?.status === 'eating';
                const isPaying = customer?.status === 'paying';
                const tableName = isEn ? table.id.replace('T', 'Table ') : table.name;

                return (
                  <div
                    key={table.id}
                    onClick={() => onSelectTable?.(table)}
                    className={`p-2.5 rounded-xl border transition flex flex-col justify-between min-h-[90px] cursor-pointer ${
                      customer
                        ? isEating
                          ? 'bg-emerald-950/30 border-emerald-500/50'
                          : isPaying
                          ? 'bg-purple-950/30 border-purple-500/50'
                          : 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{tableName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {table.type === 'counter' ? (isEn ? 'Bar' : '吧台') : (isEn ? 'Booth' : '卡座')}
                      </span>
                    </div>

                    {customer ? (
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-amber-200 truncate">{translateCustName(customer.name)}</span>
                          <span className="text-xs">{customer.avatar}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate">
                          {isEating ? t('orderDining') : isPaying ? t('orderPaying') : t('orderWaiting')}
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic mt-2">
                        {t('emptySeat')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
