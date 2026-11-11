import React, { useState } from 'react';
import {
  Customer,
  DiningTable,
  IngredientKey,
  KitchenStation,
  SushiSimulationState
} from '../../lib/sushi/types';
import { SUSHI_RECIPES } from '../../lib/sushi/recipes';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Coins,
  Heart,
  Volume2,
  VolumeX,
  Tv,
  LayoutGrid
} from 'lucide-react';

interface SushiAnimatedFloorProps {
  state: SushiSimulationState;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectTable?: (table: DiningTable) => void;
  onSelectStation?: (station: KitchenStation) => void;
  onSelectIngredient?: (key: IngredientKey) => void;
}

export const SushiAnimatedFloor: React.FC<SushiAnimatedFloorProps> = ({
  state,
  onSelectCustomer,
  onSelectTable,
  onSelectStation,
  onSelectIngredient
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Derive dynamic character positions and action states
  const hasQueue = state.customersInQueue.length > 0;
  const emptyTables = state.tables.filter(t => t.status === 'empty');
  const eatingCustomers = state.seatedCustomers.filter(c => c.status === 'eating');
  const payingCustomers = state.seatedCustomers.filter(c => c.status === 'paying');
  const orderingCustomers = state.seatedCustomers.filter(c => c.status === 'seated_ordering');
  const waitingFoodCustomers = state.seatedCustomers.filter(c => c.status === 'waiting_food');

  const preppingStation = state.kitchenStations.find(s => s.status === 'prepping');
  const platedStation = state.kitchenStations.find(s => s.status === 'plated');
  const isChefTorching = preppingStation?.currentRecipeId === 'wagyu_aburi';
  const isChefChopping = preppingStation && !isChefTorching;
  const isChefPlating = !!platedStation;

  // Stock alerts for Ren
  const isLowStock = Object.values(state.inventory).some(i => i.currentStock <= i.reorderThreshold);
  const isZeroStock = Object.values(state.inventory).some(i => i.currentStock === 0);

  // Impatient customer for Sakura
  const angryCustomer = state.seatedCustomers.find(
    c => c.status === 'waiting_food' && c.patienceRemaining / c.patienceMax < 0.4
  );

  // Aoi's target position on the restaurant floor
  // If someone is paying, Aoi is at their table
  // If food is ready, Aoi is running between kitchen and table
  // If someone is ordering, Aoi is at their table
  // If queue needs seating, Aoi is at entrance
  // Otherwise, Aoi is at the center service counter
  let aoiTarget = 'center';
  let aoiAction = '笑容迎賓';
  let aoiBubble = '歡迎光臨江戶前・壽司物語！';

  if (payingCustomers.length > 0) {
    const tableId = payingCustomers[0].tableId || 'T1';
    aoiTarget = `table_${tableId}`;
    aoiAction = '桌邊結帳收款';
    aoiBubble = `感謝${payingCustomers[0].name}！誠摯歡迎再次光臨～`;
  } else if (platedStation) {
    aoiTarget = 'kitchen_pass';
    aoiAction = '出餐端送';
    aoiBubble = '現捏握壽司備妥！這就為貴賓上桌～';
  } else if (orderingCustomers.length > 0) {
    const tableId = orderingCustomers[0].tableId || 'T1';
    aoiTarget = `table_${tableId}`;
    aoiAction = '親切點餐記錄';
    aoiBubble = '收到！記下您的忌口與喜好～';
  } else if (hasQueue && emptyTables.length > 0) {
    aoiTarget = 'entrance';
    aoiAction = '迎賓引導入座';
    aoiBubble = '貴賓請隨我來！為您安排雅座～';
  }

  // Chef Kenji states
  let kenjiBubble = '嚴選豐洲新鮮直送，即點即捏！';
  if (isZeroStock) {
    kenjiBubble = '💦 食材見底了！蓮，快向市場追單！';
  } else if (isChefTorching) {
    kenjiBubble = '🔥 嘶——噴槍高溫炙燒封鎖和牛香氣！';
  } else if (isChefChopping) {
    kenjiBubble = '🔪 噠噠噠！精準刀工切片，鎖住鮮甜！';
  } else if (isChefPlating) {
    kenjiBubble = '🔔 叮！料理完成！阿葵快來端盤！';
  }

  // Ren states
  let renBubble = '每日嚴選食材，安全庫存監控中...';
  if (isZeroStock) {
    renBubble = '📞 喂！豐洲市場嗎？極急專車馬上送過來！';
  } else if (isLowStock) {
    renBubble = '🛵📦 觸發安全水位！市場採購專車進貨中！';
  }

  // Sakura states
  let sakuraBubble = '今日翻台率與營業額達標，大家加油！';
  if (angryCustomer) {
    sakuraBubble = `🍵🍰 久等了！店長招待特製抹茶大福，請您消消氣～`;
  } else if (state.rushHourActive) {
    sakuraBubble = '📢 午間爆單潮來臨！全員加速協同，全力衝刺！';
  }

  return (
    <div className="w-full h-full flex flex-col bg-stone-950 text-stone-100 select-none overflow-hidden relative rounded-2xl border border-amber-950/60 shadow-2xl">
      {/* 🏮 Scenic Eaves Ribbon */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 px-4 py-2 border-b border-amber-900/50 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-lantern inline-block">🏮</span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-200 tracking-wider text-xs sm:text-sm">
              ⛩️ 江戶前・壽司物語 AI 本館
            </span>
            <span className="text-[10px] font-mono bg-red-900/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
              2D 實景卡通動畫劇場
            </span>
            {state.rushHourActive && (
              <span className="text-[10px] bg-rose-600 text-white font-mono px-2 py-0.2 rounded-full animate-bounce font-bold">
                ⚡ 爆單高峰中
              </span>
            )}
          </div>
        </div>

        {/* Live HUD Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-800">
            <Coins className="w-3.5 h-3.5" /> ${(state.financials?.balance ?? 0).toFixed(0)}
          </span>
          <span className="text-amber-400 font-bold bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-800">
            ★ {(state.metrics?.averageSatisfactionStars ?? 5).toFixed(1)}
          </span>
          <span className="text-sky-300 font-bold bg-stone-900/90 px-2.5 py-1 rounded-lg border border-stone-800">
            已送達 {state.metrics?.customersServed ?? 0} 人
          </span>
          <span className="text-xl animate-lantern inline-block" style={{ animationDelay: '1.2s' }}>
            🏮
          </span>
        </div>
      </div>

      {/* ========================================================
          🏯 TRUE 2D ANIMATED RESTAURANT FLOOR (NO BOXES / NO CARDS)
          A unified, contiguous Japanese sushi restaurant environment!
          ======================================================== */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#2b1d14] flex flex-col justify-between p-3 select-none">
        {/* Floor Pattern (Warm Tatami & Japanese Hinoki Wood Planks) */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(217, 119, 6, 0.08) 1px, transparent 1px),
              linear-gradient(rgba(217, 119, 6, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* ========================================================
            TOP ZONE: ENTRANCE (LEFT) | SUSHI BAR & CHEF (CENTER) | SAKURA'S DESK (RIGHT)
            ======================================================== */}
        <div className="w-full flex items-start justify-between relative z-10 gap-3">
          {/* 1. Outside Entrance & Waiting Bench */}
          <div className="w-64 flex-shrink-0 flex flex-col items-start bg-[#1e1510]/80 p-2.5 rounded-2xl border border-amber-900/40 backdrop-blur-sm shadow-lg relative">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <span>🚪 玄關暖簾門店</span>
                <span className="text-[10px] text-amber-400/80 font-mono">({state.customersInQueue.length}人候位)</span>
              </span>
              {/* Lucky Cat */}
              <div className="flex items-center gap-1 text-[11px] bg-amber-950/60 px-1.5 py-0.5 rounded-full border border-amber-800/40">
                <span className="animate-cat-paw inline-block">🐾</span>
                <span className="text-amber-300 font-bold text-[9px]">招財</span>
              </div>
            </div>

            {/* Entrance Sliding Door Graphics */}
            <div className="w-full h-3 bg-stone-900 rounded-sm border-t border-amber-700/50 mb-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-amber-800 to-red-900 opacity-60" />
            </div>

            {/* Waiting Bench with Sitting Customers */}
            <div className="w-full bg-[#18110b] p-2 rounded-xl border border-amber-900/30 flex items-center gap-2 overflow-x-auto min-h-[70px] no-scrollbar">
              {state.customersInQueue.length === 0 ? (
                <div className="w-full flex items-center justify-center text-stone-500 text-[11px] italic py-2">
                  <span>🍃 候位長凳清幽，暫無顧客</span>
                </div>
              ) : (
                state.customersInQueue.map(cust => {
                  const craving = SUSHI_RECIPES[cust.orders[0]?.recipeId];
                  return (
                    <div
                      key={cust.id}
                      onClick={() => onSelectCustomer?.(cust)}
                      className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                    >
                      {/* Thought Bubble */}
                      <div className="animate-speech-pop bg-amber-100 text-stone-950 text-[9px] font-bold px-1.5 py-0.2 rounded shadow mb-1 border border-amber-300 flex items-center gap-0.5">
                        <span>💭</span>
                        <span className="truncate max-w-[45px]">{craving?.name.slice(0, 3) || '壽司'}</span>
                      </div>
                      {/* Customer Chibi */}
                      <div className="w-9 h-9 rounded-xl bg-stone-800 border border-amber-600/60 flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition relative">
                        <span className="animate-chibi-bob">{cust.avatar}</span>
                        {cust.isVip && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
                      </div>
                      <span className="text-[9px] text-stone-300 truncate max-w-[48px] mt-0.5">
                        {cust.name}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Central Hinoki Sushi Master Bar & Chef Kenji (The Heart of the Restaurant) */}
          <div className="flex-1 max-w-2xl bg-[#24170e]/90 border-2 border-amber-800/60 rounded-3xl p-3 shadow-2xl relative flex flex-col items-center backdrop-blur-sm">
            {/* Wooden Bar Top Trim */}
            <div className="w-full flex items-center justify-between pb-1.5 mb-2 border-b border-amber-900/40">
              <div className="flex items-center gap-2">
                <span className="text-lg">🍣</span>
                <span className="text-xs font-extrabold text-amber-200">
                  檜木板前料理吧台 (Hinoki Sushi Counter)
                </span>
                <span className="text-[10px] bg-orange-950/80 text-orange-300 border border-orange-800/50 px-2 py-0.2 rounded-full font-mono">
                  料理長 健次 (Kenji) 掌勺
                </span>
              </div>

              {/* Station Indicators */}
              <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span>運轉: {state.kitchenStations.filter(s => s.status === 'prepping').length}/3 爐台</span>
                </span>
              </div>
            </div>

            {/* Chef Kenji Center Stage Animation */}
            <div className="w-full flex items-center justify-between px-3 py-1 bg-[#1a110a] rounded-2xl border border-amber-900/40 relative">
              {/* Left: Chef Cutting Board & Chibi Kenji */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Master Chef Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600/30 to-orange-700/40 border-2 border-orange-500 flex items-center justify-center text-3xl shadow-xl">
                    <span
                      className={
                        isChefTorching
                          ? 'animate-torch-flame inline-block'
                          : isChefChopping
                          ? 'animate-knife-chop inline-block'
                          : 'animate-chibi-bob inline-block'
                      }
                    >
                      👨‍🍳
                    </span>
                  </div>

                  {/* Dynamic cooking fx */}
                  {isChefTorching && (
                    <span className="absolute -top-3 -right-2 text-xl animate-torch-flame">🔥</span>
                  )}
                  {isChefChopping && (
                    <span className="absolute -top-3 -right-2 text-lg animate-knife-chop">🔪</span>
                  )}
                  {isChefPlating && (
                    <span className="absolute -top-3 -right-2 text-lg animate-bounce">🔔</span>
                  )}
                </div>

                {/* Chef's Speech Bubble */}
                <div className="flex flex-col">
                  <div className="animate-speech-pop bg-amber-950/90 border border-orange-600/60 rounded-xl px-3 py-1.5 text-xs text-amber-100 shadow-md relative max-w-sm">
                    <span className="font-bold text-orange-400 mr-1.5">健次:</span>
                    <span>{kenjiBubble}</span>
                    {/* Bubble pointer */}
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 bg-amber-950 border-l border-b border-orange-600/60 rotate-45" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-1 font-mono">
                    <span>累計捏製: {state.metrics.dishesPreparedCount} 份壽司</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">精湛刀工 × 職人捏技</span>
                  </div>
                </div>
              </div>

              {/* Right: Plated Geta Pass & Golden Bell */}
              <div className="flex flex-col items-center bg-[#291b10] border border-amber-700/50 rounded-xl px-3 py-2 shadow-inner">
                <span className="text-[9px] text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <span>🔔</span>
                  <span>出餐取餐台</span>
                </span>
                <div className="flex items-center gap-2">
                  {isChefPlating ? (
                    <div className="animate-plate-slide flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/80 px-2 py-1 rounded-lg">
                      <span className="text-xl">🍱</span>
                      <span className="text-[10px] text-emerald-300 font-bold animate-pulse">
                        現做待端
                      </span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-stone-500 italic py-1">
                      板前整備中
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3 Real Hinoki Cooking Stations Inside the Counter */}
            <div className="w-full grid grid-cols-3 gap-2 mt-2">
              {state.kitchenStations.map(station => {
                const isPrepping = station.status === 'prepping';
                const isPlated = station.status === 'plated';
                const ticket = state.activeTickets.find(t => t.id === station.currentTicketId);
                const recipe = ticket ? SUSHI_RECIPES[ticket.recipeId] : null;

                return (
                  <div
                    key={station.id}
                    onClick={() => onSelectStation?.(station)}
                    className={`p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                      isPlated
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/50'
                        : isPrepping
                        ? 'bg-orange-950/50 border-orange-500 shadow-md shadow-orange-950/40'
                        : 'bg-[#18110b] border-amber-900/30 hover:border-amber-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-100 flex items-center gap-1 truncate">
                        <span>{station.emoji}</span>
                        <span>{station.name.split(' ')[0]}</span>
                      </span>
                      {isPlated ? (
                        <span className="text-[8px] bg-emerald-600 text-white font-bold px-1 rounded animate-pulse">
                          擺盤完畢
                        </span>
                      ) : isPrepping ? (
                        <span className="text-[8px] bg-orange-600 text-white font-bold px-1 rounded animate-pulse">
                          製作中
                        </span>
                      ) : (
                        <span className="text-[8px] text-stone-500">待命</span>
                      )}
                    </div>

                    {ticket && recipe ? (
                      <div className="mt-1">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-amber-200 font-bold truncate">
                            {recipe.emoji} {recipe.name}
                          </span>
                          <span className="font-mono text-stone-400 text-[9px]">
                            {station.prepProgress}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isPlated ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}
                            style={{ width: `${station.prepProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[9px] text-stone-600 mt-1 italic text-center">爐台整潔待命</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Manager Sakura's Executive Observation Podium (Right) */}
          <div className="w-64 flex-shrink-0 flex flex-col items-start bg-[#1e1510]/80 p-2.5 rounded-2xl border border-purple-900/40 backdrop-blur-sm shadow-lg relative">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <span>👩‍💼 店長指揮辦公台</span>
                <span className="text-[10px] text-purple-400 font-mono">櫻 (Sakura)</span>
              </span>
              <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800 px-1 rounded font-mono">
                店長總監
              </span>
            </div>

            {/* Sakura Chibi & Speech */}
            <div className="w-full bg-[#18110b] p-2 rounded-xl border border-purple-900/30 flex items-center gap-2.5 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-purple-950/80 border-2 border-purple-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                <span className="animate-chibi-bob">
                  {angryCustomer ? '🍵🍰' : state.rushHourActive ? '📢' : '👩‍💼'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="animate-speech-pop bg-purple-950/90 border border-purple-700/60 rounded-xl px-2.5 py-1 text-[10px] text-purple-100 shadow-sm relative">
                  <span className="font-bold text-purple-300 mr-1">櫻:</span>
                  <span className="truncate block">{sakuraBubble}</span>
                </div>
              </div>
            </div>

            {/* Store Health Badges */}
            <div className="w-full grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="bg-[#18110b] p-1.5 rounded-lg border border-purple-950 flex justify-between">
                <span className="text-stone-400">滿意度:</span>
                <span className="text-amber-300 font-bold">{(state.metrics?.averageSatisfactionStars ?? 5).toFixed(1)} ★</span>
              </div>
              <div className="bg-[#18110b] p-1.5 rounded-lg border border-purple-950 flex justify-between">
                <span className="text-stone-400">總翻台:</span>
                <span className="text-emerald-400 font-bold">{state.metrics?.customersServed ?? 0} 次</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MIDDLE ZONE: THE MAIN DINING FLOOR (6 DINING TABLES)
            Featuring real wooden tables, sitting patrons eating sushi,
            and Host Waitress Aoi walking between tables!
            ======================================================== */}
        <div className="w-full flex-1 my-3 bg-[#1e140d]/70 rounded-3xl border border-amber-900/30 p-4 shadow-inner relative flex flex-col justify-between">
          {/* Walking Corridor Label */}
          <div className="flex items-center justify-between pb-1 mb-2 border-b border-amber-900/20">
            <span className="text-xs font-extrabold text-amber-200/90 flex items-center gap-1.5">
              <span>🍵 客席雅座大廳 (Dining Hall)</span>
              <span className="text-[10px] font-mono text-stone-400">
                [板前吧台席 1~3] & [和風榻榻米包廂 4~6]
              </span>
            </span>

            {/* Aoi Dynamic Position & Status Banner */}
            <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-600/50 px-3 py-1 rounded-full shadow-md animate-chibi-bob">
              <span className="text-base">💁‍♀️</span>
              <span className="text-xs font-bold text-amber-200">
                阿葵 (Aoi): <span className="text-amber-300 font-normal italic">"{aoiBubble}"</span>
              </span>
              <span className="text-[9px] bg-amber-900 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                {aoiAction}
              </span>
            </div>
          </div>

          {/* 6 Real Dining Tables Arranged on the Wooden Floor */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1 items-center">
            {state.tables.map(table => {
              const customer = state.seatedCustomers.find(c => c.tableId === table.id);
              const isEating = customer?.status === 'eating';
              const isPaying = customer?.status === 'paying';
              const isWaiting = customer?.status === 'waiting_food';
              const isOrdering = customer?.status === 'seated_ordering';
              const isOccupied = !!customer;

              // Customer mood & patience
              let moodEmoji = '😊';
              let moodText = '期待時令握壽司...';
              if (customer) {
                const pct = customer.patienceRemaining / customer.patienceMax;
                if (isEating) {
                  moodEmoji = '😋';
                  moodText = '入口即化！人間絕味！';
                } else if (isPaying) {
                  moodEmoji = '😍';
                  moodText = '結帳！太滿足了！';
                } else if (pct < 0.3) {
                  moodEmoji = '😡';
                  moodText = '等好久了！快餓昏了！';
                } else if (pct < 0.6) {
                  moodEmoji = '😅';
                  moodText = '師傅捏好了沒呢...';
                }
              }

              // Check if Aoi is currently at this table!
              const isAoiHere = aoiTarget === `table_${table.id}`;

              return (
                <div
                  key={table.id}
                  onClick={() => onSelectTable?.(table)}
                  className={`h-full min-h-[160px] p-3 rounded-2xl border-2 transition flex flex-col justify-between cursor-pointer relative shadow-md ${
                    isEating
                      ? 'bg-[#1b2615] border-emerald-500 shadow-emerald-950/40'
                      : isPaying
                      ? 'bg-[#25152a] border-purple-500 shadow-purple-950/40 animate-pulse'
                      : isOccupied
                      ? 'bg-[#24180e] border-amber-600/70 shadow-amber-950/30'
                      : 'bg-[#17100b]/80 border-dashed border-amber-900/40 hover:border-amber-700/60'
                  }`}
                >
                  {/* Table Header Sign */}
                  <div className="flex items-center justify-between pb-1 border-b border-amber-900/30">
                    <span className="text-[11px] font-bold text-amber-200">{table.name}</span>
                    <span className="text-[9px] font-mono px-1 rounded bg-[#2b1b11] text-amber-400">
                      {table.type === 'counter' ? '吧台' : '包廂'}
                    </span>
                  </div>

                  {/* Table Surface & Patron Animation */}
                  {customer ? (
                    <div className="my-auto flex flex-col items-center relative py-1">
                      {/* Thought / Speech Bubble */}
                      <div className="animate-speech-pop bg-stone-900/90 text-stone-200 border border-amber-800/60 text-[9px] px-2 py-0.5 rounded-lg shadow mb-1 max-w-[125px] text-center truncate">
                        <span>{moodText}</span>
                      </div>

                      {/* Patron Sitting on Chair Graphics */}
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-stone-800 border-2 flex items-center justify-center text-2xl shadow-lg ${
                            isEating
                              ? 'border-emerald-500 animate-eating'
                              : isPaying
                              ? 'border-purple-500 animate-bounce'
                              : 'border-amber-500 animate-chibi-bob'
                          }`}
                        >
                          <span>{customer.avatar}</span>
                        </div>

                        {/* VIP Crown */}
                        {customer.isVip && <span className="absolute -top-1 -right-1 text-xs">👑</span>}

                        {/* Emotion Mini Badge */}
                        <span className="absolute -bottom-1 -right-1 text-xs bg-stone-900 rounded-full px-0.5 border border-stone-700">
                          {moodEmoji}
                        </span>

                        {/* Floating Heart if Eating */}
                        {isEating && (
                          <span className="absolute -top-3 left-0 text-sm animate-coin-float text-pink-400">
                            💕
                          </span>
                        )}

                        {/* Floating Gold Coin if Paying */}
                        {isPaying && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold font-mono animate-coin-float text-amber-300 bg-stone-900 px-1 rounded border border-amber-500">
                            +${customer.billAmount} 🪙
                          </span>
                        )}

                        {/* Aoi Sprite Appearing Next to the Table! */}
                        {isAoiHere && (
                          <div className="absolute -right-5 top-0 animate-chibi-fast z-10 flex flex-col items-center">
                            <span className="text-xl">💁‍♀️</span>
                            <span className="text-[7px] bg-amber-500 text-stone-950 px-1 rounded font-bold">
                              阿葵
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Customer Name */}
                      <span className="text-[11px] font-bold text-amber-100 truncate max-w-[90px] mt-1">
                        {customer.name}
                      </span>

                      {/* Actual Dishes Served on Table! */}
                      <div className="flex items-center gap-1 mt-1 bg-[#1a110a] px-2 py-0.5 rounded-lg border border-amber-900/40">
                        {customer.orders.map((o, idx) => (
                          <span key={idx} className="text-sm" title={o.recipeId}>
                            {SUSHI_RECIPES[o.recipeId]?.emoji || '🍣'}
                          </span>
                        ))}
                        {customer.specialPreference === 'no_wasabi' && (
                          <span className="text-[8px] bg-purple-900 text-purple-200 px-1 rounded font-mono">
                            去芥末
                          </span>
                        )}
                        {customer.specialPreference === 'vegetarian' && (
                          <span className="text-[8px] bg-emerald-900 text-emerald-200 px-1 rounded font-mono">
                            素食
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto flex flex-col items-center justify-center py-4 text-stone-500">
                      <span className="text-2xl mb-1 opacity-70 animate-chibi-bob">🪑</span>
                      <span className="text-[10px] font-mono text-amber-200/50">空席待客</span>
                      <span className="text-[9px] text-stone-600">茶具備妥</span>
                    </div>
                  )}

                  {/* Patience & Bill Footer */}
                  {customer && (
                    <div className="pt-1.5 border-t border-amber-900/30 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-300 font-bold">${customer.billAmount}</span>
                      <div className="w-14 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            customer.patienceRemaining / customer.patienceMax > 0.5
                              ? 'bg-emerald-400'
                              : customer.patienceRemaining / customer.patienceMax > 0.25
                              ? 'bg-amber-400'
                              : 'bg-rose-500 animate-pulse'
                          }`}
                          style={{
                            width: `${(customer.patienceRemaining / customer.patienceMax) * 100}%`
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

        {/* ========================================================
            BOTTOM ZONE: BACKYARD STORAGE & LOGISTICS DOCK (REN'S BAY)
            Featuring real wooden ice-crates, delivery scooter, and Ren!
            ======================================================== */}
        <div className="w-full bg-[#1b120c]/90 rounded-2xl border border-emerald-900/50 p-2.5 shadow-xl relative z-10">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-900/30">
            <div className="flex items-center gap-2">
              <span className="text-base">📦</span>
              <span className="text-xs font-bold text-emerald-200">
                後院生鮮冷藏庫 & 豐洲市場卸貨碼頭 (Logistics Bay)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                採購主管 蓮 (Ren) 全權監控
              </span>
            </div>

            {/* Ren's Speech & Delivery Scooter */}
            <div className="flex items-center gap-3">
              {/* Delivery Scooter arriving when restocking */}
              {isLowStock && (
                <div className="flex items-center gap-1 bg-amber-950/80 border border-amber-500/80 px-2 py-0.5 rounded-full text-[10px] text-amber-300 animate-scooter">
                  <span className="text-sm">🛵💨</span>
                  <span className="font-bold">豐洲專車進貨中</span>
                </div>
              )}

              {/* Ren Sprite & Speech */}
              <div className="flex items-center gap-2 bg-[#140d08] px-2.5 py-1 rounded-xl border border-emerald-800/40">
                <span className="text-lg animate-chibi-bob">📦🧑‍🔧</span>
                <span className="text-[10px] text-emerald-200 font-sans italic">
                  蓮: "{renBubble}"
                </span>
              </div>
            </div>
          </div>

          {/* 8 Authentic Japanese Fresh Ingredient Wooden Crates */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {(Object.keys(state.inventory) as IngredientKey[]).map(key => {
              const item = state.inventory[key];
              const isLow = item.currentStock <= item.reorderThreshold;
              const isOut = item.currentStock === 0;

              return (
                <div
                  key={key}
                  onClick={() => onSelectIngredient?.(key)}
                  className={`p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer relative ${
                    isOut
                      ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-950 animate-pulse'
                      : isLow
                      ? 'bg-amber-950/50 border-amber-500 shadow-md shadow-amber-950'
                      : 'bg-[#140d08] border-emerald-900/40 hover:border-emerald-600/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <span className="text-xl inline-block">{item.emoji}</span>
                      {key === 'rice' && (
                        <span className="absolute -top-1 right-0 text-[10px] animate-steam">♨️</span>
                      )}
                    </div>
                    {isOut ? (
                      <span className="text-[8px] bg-rose-600 text-white font-bold px-1 rounded animate-pulse">
                        缺料
                      </span>
                    ) : isLow ? (
                      <span className="text-[8px] bg-amber-600 text-white font-bold px-1 rounded">
                        告急
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-stone-200 block truncate">
                      {item.name.split(' ')[0]}
                    </span>
                    <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                      <span className="text-stone-400">儲量:</span>
                      <span
                        className={`font-bold ${
                          isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                    </div>

                    {/* Stock Capacity Fill */}
                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden mt-1">
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
    </div>
  );
};
