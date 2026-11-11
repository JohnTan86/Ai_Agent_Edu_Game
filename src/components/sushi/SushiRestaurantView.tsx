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
import {
  Utensils,
  Clock,
  AlertTriangle,
  Sparkles,
  Flame,
  CheckCircle2,
  Package,
  Layers,
  ChefHat,
  HeartHandshake,
  Tv,
  LayoutGrid
} from 'lucide-react';

interface SushiRestaurantViewProps {
  state: SushiSimulationState;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectTable?: (table: DiningTable) => void;
  onSelectStation?: (station: KitchenStation) => void;
}

export const SushiRestaurantView: React.FC<SushiRestaurantViewProps> = ({
  state,
  onSelectCustomer,
  onSelectTable,
  onSelectStation
}) => {
  const [hoveredCustomer, setHoveredCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<'cartoon' | 'classic'>('cartoon');

  // Helper for patience color
  const getPatienceColor = (rem: number, max: number) => {
    const pct = rem / max;
    if (pct > 0.6) return 'bg-emerald-500';
    if (pct > 0.3) return 'bg-amber-500';
    return 'bg-rose-500 animate-pulse';
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950/90 text-slate-200 select-none overflow-y-auto p-3.5 gap-3 relative">
      {/* Top Banner / Ambience HUD with View Mode Toggle */}
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-amber-950/40 border border-amber-900/30 rounded-xl px-4 py-2 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🏮</span>
          <div>
            <h2 className="text-xs font-bold text-amber-200 tracking-wider flex items-center gap-2">
              江戶前・壽司物語 AI 旗艦店
              {state.rushHourActive && (
                <span className="text-[10px] bg-rose-600 text-white font-mono px-2 py-0.5 rounded-full animate-bounce">
                  ⚡ 尖峰客流湧入中
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              現場即時營運模擬：接待員阿葵、料理長健次、採購主管蓮、營運店長櫻
            </p>
          </div>
        </div>

        {/* View Mode Switcher + Counters */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-700/60 p-0.5 rounded-xl text-xs font-medium shadow-inner">
            <button
              onClick={() => setViewMode('cartoon')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'cartoon'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold shadow-md shadow-amber-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>卡通動畫劇場</span>
            </button>
            <button
              onClick={() => setViewMode('classic')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                viewMode === 'classic'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>數值看板</span>
            </button>
          </div>

          {/* Quick status counters */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>候位:</span>
              <span className="text-white font-bold">{state.customersInQueue.length}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>就座:</span>
              <span className="text-white font-bold">{state.seatedCustomers.length}/6</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>工單:</span>
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
                <span className="text-xs font-bold text-slate-200">玄關迎賓候位區 (Waiting Queue)</span>
              </div>
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded-full font-mono">
                {state.customersInQueue.length} 位等待中
              </span>
            </div>

            {/* Queue List */}
            <div className="flex flex-col gap-2 min-h-[140px] max-h-[220px] overflow-y-auto pr-1">
              {state.customersInQueue.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs py-8">
                  <span>🍃 目前玄關暫無排隊顧客</span>
                  <span className="text-[10px] text-slate-500 mt-1">點擊頂部「+顧客」可手動招徠客人</span>
                </div>
              ) : (
                state.customersInQueue.map((cust, idx) => (
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
                          <span className="text-xs font-bold text-white">{cust.name}</span>
                          {cust.isVip && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                              VIP
                            </span>
                          )}
                          {cust.specialPreference !== 'none' && (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1 rounded">
                              {cust.specialPreference === 'no_wasabi'
                                ? '免芥末'
                                : cust.specialPreference === 'vegetarian'
                                ? '素食'
                                : '趕時間'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          想吃:{' '}
                          {cust.orders.map(o => SUSHI_RECIPES[o.recipeId]?.name || o.recipeId).join(', ')}
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
                <span className="text-xs font-bold text-slate-200">冷藏庫存區 (Pantry Storage)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                蓮 (Ren) 監控中
              </span>
            </div>

            {/* Ingredient Grid */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {(Object.keys(state.inventory) as IngredientKey[]).map(key => {
                const item = state.inventory[key];
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
                        <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[80px]">
                          {item.name.split(' ')[0]}
                        </span>
                      </div>
                      {isOut ? (
                        <span className="text-[9px] bg-rose-600 text-white font-bold px-1 rounded animate-pulse">
                          斷貨
                        </span>
                      ) : isLow ? (
                        <span className="text-[9px] bg-amber-600/80 text-white font-bold px-1 rounded">
                          告急
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                        <span>庫存:</span>
                        <span
                          className={`font-bold ${
                            isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {item.currentStock} {item.unit}
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
                    <span className="text-xs font-bold text-white">後廚料理台 (Sushi Master Stations)</span>
                    <span className="text-[10px] text-orange-400 font-mono font-medium">健次 (Kenji) 主理</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    工單審核 ➔ 食材消耗 ➔ 精準刀工捏製 ➔ 出餐擺盤
                  </p>
                </div>
              </div>

              {/* Station Activity Badges */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  料理台運轉中:{' '}
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
                          <span className="text-xs font-bold text-white">{station.name}</span>
                          <span className="text-[10px] text-slate-400">{station.assignedChef}</span>
                        </div>
                      </div>

                      {isPlated ? (
                        <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 待取餐
                        </span>
                      ) : isPrepping ? (
                        <span className="text-[9px] bg-amber-600 text-white font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                          <Flame className="w-2.5 h-2.5" /> 製作中
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                          空閒
                        </span>
                      )}
                    </div>

                    {/* Dish in prep */}
                    {ticket ? (
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-amber-200 font-semibold truncate max-w-[120px]">
                            {ticket.recipeEmoji} {ticket.recipeName}
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
                        等待新工單注入...
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
                <span className="text-xs font-bold text-white">客席用餐區 (Dining Tables & Counter Bar)</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-700" /> 空位
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 等候料理
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> 品嚐用餐
                </span>
              </div>
            </div>

            {/* 6 Tables Grid (3 Counter + 3 Booth) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
              {state.tables.map(table => {
                const customer = state.seatedCustomers.find(c => c.tableId === table.id);
                const isOccupied = table.status === 'occupied' && customer;
                const isEating = customer?.status === 'eating';
                const isPaying = customer?.status === 'paying';

                return (
                  <div
                    key={table.id}
                    onClick={() => onSelectTable?.(table)}
                    className={`p-3 rounded-2xl border transition flex flex-col justify-between min-h-[130px] cursor-pointer relative overflow-hidden ${
                      isEating
                        ? 'bg-emerald-950/30 border-emerald-600/50'
                        : isPaying
                        ? 'bg-purple-950/30 border-purple-600/50 animate-pulse'
                        : isOccupied
                        ? 'bg-amber-950/20 border-amber-600/40'
                        : 'bg-slate-800/40 border-slate-750 hover:bg-slate-800/70 border-dashed'
                    }`}
                  >
                    {/* Header: Table Name & Type */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{table.name}</span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {table.type === 'counter' ? '吧台' : '包廂'}
                      </span>
                    </div>

                    {/* Table Body / Customer Sitting */}
                    {customer ? (
                      <div className="my-2 flex items-center gap-2.5">
                        <div className="relative">
                          <span className="text-2xl">{customer.avatar}</span>
                          {customer.isVip && (
                            <span className="absolute -top-1 -right-1 text-xs">⭐</span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-white truncate">
                              {customer.name}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="mt-0.5">
                            {isEating ? (
                              <span className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                                <span>😋</span>
                                <span>享用美饌中...</span>
                              </span>
                            ) : isPaying ? (
                              <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                                <span>💰</span>
                                <span>結帳中...</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-300 font-medium flex items-center gap-1">
                                <span>⏳</span>
                                <span>等待出餐</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="my-auto flex flex-col items-center justify-center text-slate-600 py-3">
                        <span className="text-lg">🪑</span>
                        <span className="text-[10px] mt-1 font-mono">空席待客</span>
                      </div>
                    )}

                    {/* Footer: Patience Bar or Bill */}
                    {customer && (
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">消費: ${customer.billAmount}</span>
                        <div className="w-14 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPatienceColor(
                              customer.patienceRemaining,
                              customer.patienceMax
                            )}`}
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(100, (customer.patienceRemaining / customer.patienceMax) * 100)
                              )}%`
                            }}
                          />
                        </div>
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
