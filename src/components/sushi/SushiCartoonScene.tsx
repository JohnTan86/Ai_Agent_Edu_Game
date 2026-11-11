import React, { useState, useEffect } from 'react';
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
  Package,
  AlertTriangle,
  Clock,
  Coins,
  Heart,
  PhoneCall,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';

interface SushiCartoonSceneProps {
  state: SushiSimulationState;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectTable?: (table: DiningTable) => void;
  onSelectStation?: (station: KitchenStation) => void;
  onSelectIngredient?: (key: IngredientKey) => void;
}

export const SushiCartoonScene: React.FC<SushiCartoonSceneProps> = ({
  state,
  onSelectCustomer,
  onSelectTable,
  onSelectStation,
  onSelectIngredient
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Derive active animations and states for each AI Agent
  // 1. Host (Aoi)
  const isAoiPaying = state.seatedCustomers.some(c => c.status === 'paying');
  const isAoiServing = state.kitchenStations.some(s => s.status === 'plated');
  const isAoiTakingOrder = state.seatedCustomers.some(c => c.status === 'seated_ordering');
  const isAoiGreeting = state.customersInQueue.length > 0 && state.tables.some(t => t.status === 'empty');

  let aoiActionText = '笑容迎賓待命';
  let aoiPoseEmoji = '💁‍♀️';
  let aoiBubble = '歡迎光臨壽司物語！';
  if (isAoiPaying) {
    aoiActionText = '桌邊收款結帳';
    aoiPoseEmoji = '🪙💁‍♀️';
    aoiBubble = '多謝款待！期待您再次光臨～';
  } else if (isAoiServing) {
    aoiActionText = '端送極上壽司';
    aoiPoseEmoji = '🍱🏃‍♀️';
    aoiBubble = '久等了！現捏壽司上桌囉！';
  } else if (isAoiTakingOrder) {
    aoiActionText = '記錄點單與忌口';
    aoiPoseEmoji = '📝💁‍♀️';
    aoiBubble = '好的！為您特製去芥末～馬上傳送後廚！';
  } else if (isAoiGreeting) {
    aoiActionText = '引導貴賓入座';
    aoiPoseEmoji = '✨💁‍♀️';
    aoiBubble = '貴賓請隨我來～為您安排板前雅席！';
  }

  // 2. Chef (Kenji)
  const preppingStation = state.kitchenStations.find(s => s.status === 'prepping');
  const platedStation = state.kitchenStations.find(s => s.status === 'plated');
  const isChefTorching = preppingStation?.currentRecipeId === 'wagyu_aburi';
  const isChefChopping = preppingStation && !isChefTorching;
  const isChefPlating = !!platedStation;

  // Check recent stockout
  const hasLowStockAlert = Object.values(state.inventory).some(
    i => i.currentStock <= i.reorderThreshold
  );
  const hasZeroStock = Object.values(state.inventory).some(i => i.currentStock === 0);

  let chefActionText = '神級刀工待命';
  let chefPoseEmoji = '👨‍🍳';
  let chefBubble = '嚴選時令魚鮮，即叫即捏！';
  if (hasZeroStock) {
    chefActionText = '急呼採購補貨！';
    chefPoseEmoji = '💦👨‍🍳';
    chefBubble = '食材見底了！蓮！快向市場追單！';
  } else if (isChefTorching) {
    chefActionText = '烈火炙燒和牛';
    chefPoseEmoji = '🔥👨‍🍳';
    chefBubble = '嘶——大火封鎖油脂香氣！';
  } else if (isChefChopping) {
    chefActionText = '飛刀薄切刺身';
    chefPoseEmoji = '🔪👨‍🍳';
    chefBubble = '噠噠噠！精準斷筋，鎖住甘甜！';
  } else if (isChefPlating) {
    chefActionText = '精緻盛盤敲鈴';
    chefPoseEmoji = '🔔👨‍🍳';
    chefBubble = '叮！料理完成！阿葵快來端盤！';
  }

  // 3. Inventory (Ren)
  const isRenRestocking = hasLowStockAlert;
  let renActionText = '倉庫盤點監控';
  let renPoseEmoji = '📦🧑‍🔧';
  let renBubble = '越光米與刺身庫存巡檢中...';
  if (hasZeroStock) {
    renActionText = '市場緊急加急單';
    renPoseEmoji = '📞🏃‍♂️';
    renBubble = '喂！豐洲市場嗎？極急專車馬上送過來！';
  } else if (isRenRestocking) {
    renActionText = '安全水位自動補貨';
    renPoseEmoji = '🛵📦';
    renBubble = '觸發安全水位！外送專車採購進貨中！';
  }

  // 4. Manager (Sakura)
  const impatientCustomer = state.seatedCustomers.find(
    c => c.status === 'waiting_food' && c.patienceRemaining / c.patienceMax < 0.45
  );
  let sakuraActionText = '全店運營稽核';
  let sakuraPoseEmoji = '👩‍💼';
  let sakuraBubble = '今日毛利率與翻台率達標，繼續保持！';
  if (impatientCustomer) {
    sakuraActionText = '客訴安撫甜點招待';
    sakuraPoseEmoji = '🍵🍰👩‍💼';
    sakuraBubble = `久等了！店長招待特製抹茶大福，請您消消氣～`;
  } else if (state.rushHourActive) {
    sakuraActionText = '高峰期全員動員';
    sakuraPoseEmoji = '📢👩‍💼';
    sakuraBubble = '午間人潮湧入！全員加速協同，衝刺業績！';
  }

  return (
    <div className="w-full flex flex-col bg-stone-950 text-stone-100 select-none rounded-2xl border border-amber-950/60 overflow-hidden shadow-2xl relative">
      {/* 🏮 Authentic Japanese Noren & Roof Eaves Header */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 px-4 py-2.5 border-b border-amber-900/50 flex items-center justify-between shadow-md relative">
        {/* Left Roof lantern */}
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-lantern inline-block">🏮</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-200 tracking-wider text-sm flex items-center gap-1.5">
                <span>⛩️ 江戶前・壽司物語</span>
                <span className="text-[10px] font-mono bg-red-900/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                  2D Chibi Pixel Anime
                </span>
              </span>
              {state.rushHourActive && (
                <span className="text-[10px] bg-rose-600 text-white font-mono px-2 py-0.5 rounded-full animate-bounce font-bold">
                  ⚡ 爆單高峰中
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 font-sans flex items-center gap-2">
              <span>四智能體實況：</span>
              <span className="text-amber-300 font-mono">葵(外場)</span>
              <span>•</span>
              <span className="text-orange-300 font-mono">健次(主廚)</span>
              <span>•</span>
              <span className="text-emerald-300 font-mono">蓮(採購)</span>
              <span>•</span>
              <span className="text-purple-300 font-mono">櫻(店長)</span>
            </p>
          </div>
        </div>

        {/* Right Roof lantern */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-800 rounded-xl px-3 py-1 font-mono text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Coins className="w-3.5 h-3.5" /> ${(state.financials?.balance ?? 0).toFixed(0)}
            </span>
            <span className="text-stone-600">|</span>
            <span className="text-amber-400 font-bold">★ {(state.metrics?.averageSatisfactionStars ?? 5).toFixed(1)}</span>
            <span className="text-stone-600">|</span>
            <span className="text-sky-300 font-bold">已出餐 {state.metrics?.customersServed ?? 0} 人</span>
          </div>
          <div className="text-2xl animate-lantern inline-block" style={{ animationDelay: '1.5s' }}>
            🏮
          </div>
        </div>
      </div>

      {/* ========================================================
          STAGE 1: TOP ROW (Waiting Queue + Sushi Bar + Manager)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3.5 bg-gradient-to-b from-stone-900/90 to-stone-950/95 border-b border-stone-800/80">
        {/* SECTION 1A: Entrance Waiting Lounge & Aoi Greeting (3 cols) */}
        <div className="lg:col-span-3 bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden shadow-inner">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-800/80 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🚪</span>
              <span className="text-xs font-bold text-amber-200">玄關迎賓候位</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-sky-400 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">
              <span>排隊: {state.customersInQueue.length} 人</span>
            </div>
          </div>

          {/* Animated Waiting Bench & Customers */}
          <div className="flex-1 flex flex-col justify-center min-h-[95px] relative bg-stone-950/60 rounded-xl p-2 border border-stone-800/60">
            {/* Lucky Waving Cat on the Counter */}
            <div className="absolute top-1.5 right-2 flex items-center gap-1 text-[11px] bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded-full">
              <span className="animate-cat-paw inline-block">🐾</span>
              <span className="text-amber-300 font-bold text-[9px]">千客萬來</span>
            </div>

            {state.customersInQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-stone-500 py-3 text-xs">
                <span className="text-xl mb-1">🍵</span>
                <span>玄關雅緻安靜，暫無排隊</span>
                <span className="text-[10px] text-stone-600 mt-0.5">點擊頂部「+顧客」招徠客人</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                {state.customersInQueue.map((cust, i) => {
                  const cravingRecipe = SUSHI_RECIPES[cust.orders[0]?.recipeId];
                  return (
                    <div
                      key={cust.id}
                      onClick={() => onSelectCustomer?.(cust)}
                      className="flex flex-col items-center flex-shrink-0 cursor-pointer group relative"
                    >
                      {/* Thought Bubble */}
                      <div className="animate-speech-pop bg-amber-100 text-stone-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-md mb-1 relative border border-amber-300 flex items-center gap-0.5">
                        <span>💭</span>
                        <span className="truncate max-w-[50px]">{cravingRecipe?.name.slice(0, 3) || '壽司'}</span>
                        {/* Bubble tail */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-100 rotate-45 border-r border-b border-amber-300" />
                      </div>

                      {/* Chibi Customer Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-stone-800 border-2 border-amber-600/60 flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-md relative">
                        <span className="animate-chibi-bob">{cust.avatar}</span>
                        {cust.isVip && (
                          <span className="absolute -top-1 -right-1 text-xs">👑</span>
                        )}
                      </div>

                      <span className="text-[10px] text-stone-300 font-medium truncate max-w-[52px] mt-1">
                        {cust.name}
                      </span>

                      {/* Mini Patience Bar */}
                      <div className="w-8 h-1 bg-stone-700 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="h-full bg-emerald-400"
                          style={{
                            width: `${(cust.patienceRemaining / cust.patienceMax) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Aoi (Host) Active Work Card */}
          <div className="mt-2 p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl flex-shrink-0 shadow-sm relative">
              <span className="animate-chibi-bob">{aoiPoseEmoji}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute bottom-0 right-0 border border-stone-900" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-200">阿葵 (Aoi) 外場</span>
                <span className="text-[9px] bg-amber-900/60 text-amber-300 px-1 rounded font-mono">
                  {aoiActionText}
                </span>
              </div>
              <p className="text-[10px] text-stone-400 truncate mt-0.5 italic">
                "{aoiBubble}"
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1B: Hinoki Sushi Master Counter & Kenji (6 cols) */}
        <div className="lg:col-span-6 bg-stone-900/90 border border-amber-900/50 rounded-2xl p-3 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Japanese Wood Banner */}
          <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/40 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍣</span>
              <div>
                <span className="text-xs font-bold text-amber-200">板前中央料理台 (Master Sushi Bar)</span>
                <span className="text-[10px] text-orange-400 ml-2 font-mono">料理長 健次 (Kenji) 掌勺</span>
              </div>
            </div>

            {/* Chef Action Status Badge */}
            <div className="flex items-center gap-1.5 bg-orange-950/60 border border-orange-700/50 px-2 py-0.5 rounded-full text-[10px] text-orange-300 font-mono">
              <span className="animate-pulse">●</span>
              <span>{chefActionText}</span>
            </div>
          </div>

          {/* Central Animated Chef & Speech Bubble */}
          <div className="flex items-center justify-between bg-stone-950/70 rounded-xl p-2.5 border border-amber-900/30 mb-2 relative">
            <div className="flex items-center gap-3">
              {/* Chef Avatar with dynamic animations */}
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-600/30 border-2 border-orange-500/60 flex items-center justify-center text-3xl shadow-lg">
                  <span
                    className={
                      isChefTorching
                        ? 'animate-torch-flame inline-block'
                        : isChefChopping
                        ? 'animate-knife-chop inline-block'
                        : 'animate-chibi-bob inline-block'
                    }
                  >
                    {chefPoseEmoji}
                  </span>
                </div>
                {/* Flame or Sparkle effect */}
                {isChefTorching && (
                  <span className="absolute -top-2 -right-2 text-base animate-torch-flame">🔥</span>
                )}
                {isChefPlating && (
                  <span className="absolute -top-2 -right-2 text-base animate-bounce">🔔</span>
                )}
              </div>

              {/* Chef Comic Dialogue Bubble */}
              <div className="flex flex-col">
                <div className="bg-amber-950/60 border border-amber-700/50 rounded-xl px-2.5 py-1 text-xs text-amber-100 shadow-sm relative">
                  <span className="font-semibold text-amber-300 mr-1">健次:</span>
                  <span>{chefBubble}</span>
                  {/* Bubble pointer */}
                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 bg-amber-950 border-l border-b border-amber-700/50 rotate-45" />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-1 font-mono">
                  <span>累計製作: {state.metrics.dishesPreparedCount} 份</span>
                  <span>•</span>
                  <span>當前運轉: {state.kitchenStations.filter(s => s.status === 'prepping').length}/3 爐台</span>
                </div>
              </div>
            </div>

            {/* Traditional Sushi Geta Wooden Platter Display */}
            <div className="hidden sm:flex flex-col items-center bg-amber-950/40 border border-amber-800/40 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-[9px] text-amber-300 font-mono font-bold mb-0.5">板前出餐口</span>
              <div className="flex items-center gap-1.5 text-xl">
                {isChefPlating ? (
                  <span className="animate-plate-slide flex items-center gap-1">
                    <span>🍱</span>
                    <span className="text-[10px] text-emerald-400 font-bold animate-pulse">待取餐</span>
                  </span>
                ) : (
                  <span className="text-stone-600 text-xs italic">空置中</span>
                )}
              </div>
            </div>
          </div>

          {/* 3 Kitchen Stations Cartoon Cards */}
          <div className="grid grid-cols-3 gap-2">
            {state.kitchenStations.map(station => {
              const isPrepping = station.status === 'prepping';
              const isPlated = station.status === 'plated';
              const ticket = state.activeTickets.find(t => t.id === station.currentTicketId);
              const recipe = ticket ? SUSHI_RECIPES[ticket.recipeId] : null;

              return (
                <div
                  key={station.id}
                  onClick={() => onSelectStation?.(station)}
                  className={`p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                    isPlated
                      ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/50'
                      : isPrepping
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-md shadow-amber-950/40'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{station.emoji}</span>
                      <span className="text-[11px] font-bold text-stone-200 truncate max-w-[65px]">
                        {station.name.slice(0, 4)}
                      </span>
                    </div>

                    {isPlated ? (
                      <span className="text-[8px] bg-emerald-600 text-white font-bold px-1 rounded animate-pulse">
                        已擺盤
                      </span>
                    ) : isPrepping ? (
                      <span className="text-[8px] bg-amber-600 text-white font-bold px-1 rounded animate-pulse">
                        料理中
                      </span>
                    ) : (
                      <span className="text-[8px] bg-stone-800 text-stone-400 px-1 rounded">
                        待命
                      </span>
                    )}
                  </div>

                  {ticket && recipe ? (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-200 font-bold truncate max-w-[70px]">
                          {recipe.emoji} {recipe.name.slice(0, 4)}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400">
                          {station.prepProgress}%
                        </span>
                      </div>
                      {/* Animated Progress Bar */}
                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isPlated
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${station.prepProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-center text-[10px] text-stone-600 italic">
                      準備就緒
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 1C: Store Manager Sakura Command Post (3 cols) */}
        <div className="lg:col-span-3 bg-stone-900/80 border border-stone-800 rounded-2xl p-3 flex flex-col justify-between shadow-inner relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-800 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">👩‍💼</span>
              <span className="text-xs font-bold text-purple-200">店長指揮總部</span>
            </div>
            <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800/50 px-1.5 py-0.2 rounded font-mono">
              櫻 (Sakura)
            </span>
          </div>

          {/* Sakura Animated Chibi & Speech */}
          <div className="flex-1 flex flex-col justify-center bg-stone-950/60 rounded-xl p-2.5 border border-stone-800/60 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-950/60 border border-purple-500/50 flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                <span className="animate-chibi-bob">{sakuraPoseEmoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-200">
                  <span>櫻店長</span>
                  <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1 rounded font-mono">
                    {sakuraActionText}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 truncate mt-0.5 italic">
                  "{sakuraBubble}"
                </p>
              </div>
            </div>

            {/* KPI Mini Badges */}
            <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-stone-800/80 text-[10px] font-mono">
              <div className="bg-stone-900/80 p-1 rounded border border-stone-800 flex justify-between">
                <span className="text-stone-400">客滿意度:</span>
                <span className="text-amber-300 font-bold">{(state.metrics?.averageSatisfactionStars ?? 5).toFixed(1)} ★</span>
              </div>
              <div className="bg-stone-900/80 p-1 rounded border border-stone-800 flex justify-between">
                <span className="text-stone-400">總翻台數:</span>
                <span className="text-emerald-400 font-bold">{state.metrics?.customersServed ?? 0} 次</span>
              </div>
            </div>
          </div>

          {/* Manager Action Remedy Status */}
          <div className="p-1.5 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between text-[10px]">
            <span className="text-purple-300 flex items-center gap-1">
              <span>🍵</span>
              <span>御抹茶客訴安撫機制</span>
            </span>
            <span className="text-emerald-400 font-mono font-bold">自動生效中</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          STAGE 2: DINING HALL (6 Tables: 3 Counter Bar + 3 Booths)
          ======================================================== */}
      <div className="p-3.5 bg-gradient-to-b from-stone-950 via-stone-900/60 to-stone-950">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="text-base">🍵</span>
            <span className="text-xs font-bold text-amber-200">
              客席用餐大廳 (6席位：板前雅席 & 和風卡座包廂)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-stone-400">
              <span className="w-2 h-2 rounded-full bg-stone-700" /> 空席待客
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> 等候料理
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> 咀嚼品嚐中
            </span>
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" /> 結帳付款
            </span>
          </div>
        </div>

        {/* 6 Tables Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {state.tables.map(table => {
            const customer = state.seatedCustomers.find(c => c.tableId === table.id);
            const isOccupied = table.status === 'occupied' && customer;
            const isEating = customer?.status === 'eating';
            const isPaying = customer?.status === 'paying';
            const isWaitingFood = customer?.status === 'waiting_food';

            // Customer patience & emotion
            let moodEmoji = '😊';
            let moodBubble = '期待極品握壽司...';
            if (customer) {
              const pct = customer.patienceRemaining / customer.patienceMax;
              if (isEating) {
                moodEmoji = '😋';
                moodBubble = '太美味了！油脂入口即化！';
              } else if (isPaying) {
                moodEmoji = '😍';
                moodBubble = '結帳！下次一定再來！';
              } else if (pct < 0.25) {
                moodEmoji = '😡';
                moodBubble = '等好久了！快餓昏了！';
              } else if (pct < 0.5) {
                moodEmoji = '😅';
                moodBubble = '師傅捏好沒呢...';
              }
            }

            return (
              <div
                key={table.id}
                onClick={() => onSelectTable?.(table)}
                className={`p-2.5 rounded-2xl border transition flex flex-col justify-between min-h-[145px] cursor-pointer relative overflow-hidden shadow-sm ${
                  isEating
                    ? 'bg-gradient-to-b from-emerald-950/40 to-stone-900 border-emerald-500/60 shadow-emerald-950/40'
                    : isPaying
                    ? 'bg-gradient-to-b from-purple-950/40 to-stone-900 border-purple-500/60 shadow-purple-950/40 animate-pulse'
                    : isOccupied
                    ? 'bg-gradient-to-b from-amber-950/30 to-stone-900 border-amber-600/50 shadow-amber-950/30'
                    : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700 border-dashed'
                }`}
              >
                {/* Table Header */}
                <div className="flex items-center justify-between pb-1 border-b border-stone-800/50">
                  <span className="text-[11px] font-bold text-stone-200">{table.name}</span>
                  <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-stone-800 text-stone-400">
                    {table.type === 'counter' ? '吧台' : '包廂'}
                  </span>
                </div>

                {/* Table Cartoon Scene */}
                {customer ? (
                  <div className="my-auto flex flex-col items-center relative py-1">
                    {/* Comic Thought Bubble */}
                    <div className="animate-speech-pop bg-stone-900 text-stone-200 border border-stone-700 text-[9px] px-1.5 py-0.5 rounded-md shadow-md mb-1 max-w-[120px] text-center truncate">
                      <span>{moodBubble}</span>
                    </div>

                    {/* Customer Chibi & Eating Animation */}
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-2xl bg-stone-800 border-2 flex items-center justify-center text-2xl shadow-md ${
                          isEating
                            ? 'border-emerald-500 animate-eating'
                            : isPaying
                            ? 'border-purple-500 animate-bounce'
                            : 'border-amber-500/60 animate-chibi-bob'
                        }`}
                      >
                        <span>{customer.avatar}</span>
                      </div>

                      {/* VIP Crown */}
                      {customer.isVip && (
                        <span className="absolute -top-1 -right-1 text-xs">👑</span>
                      )}

                      {/* Emotion Badge */}
                      <span className="absolute -bottom-1 -right-1 text-xs">{moodEmoji}</span>

                      {/* Floating Hearts if eating */}
                      {isEating && (
                        <span className="absolute -top-2 left-0 text-xs animate-coin-float text-pink-400">
                          💕
                        </span>
                      )}

                      {/* Floating Gold Coin if paying */}
                      {isPaying && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold font-mono animate-coin-float text-amber-300">
                          +${customer.billAmount} 🪙
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-stone-200 truncate max-w-[80px] mt-1">
                      {customer.name}
                    </span>

                    {/* Ordered Dishes Icons on Table */}
                    <div className="flex items-center gap-1 mt-0.5 text-xs">
                      {customer.orders.map((o, idx) => (
                        <span key={idx} title={o.recipeId}>
                          {SUSHI_RECIPES[o.recipeId]?.emoji || '🍣'}
                        </span>
                      ))}
                      {customer.specialPreference === 'no_wasabi' && (
                        <span className="text-[8px] bg-purple-900/80 text-purple-200 px-1 rounded font-mono">
                          去芥末
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="my-auto flex flex-col items-center justify-center py-3 text-stone-600">
                    <span className="text-2xl mb-1 animate-chibi-bob">🪑</span>
                    <span className="text-[10px] font-mono">空席待客</span>
                  </div>
                )}

                {/* Table Footer: Patience or Bill */}
                {customer && (
                  <div className="pt-1.5 border-t border-stone-800/60 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-stone-400">${customer.billAmount}</span>
                    <div className="w-12 h-1 bg-stone-800 rounded-full overflow-hidden">
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
          STAGE 3: COLD PANTRY STORAGE & DOCK (Ren's Kingdom)
          ======================================================== */}
      <div className="p-3.5 bg-gradient-to-b from-stone-900/90 to-stone-950 border-t border-stone-800/80">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-stone-800/60">
          <div className="flex items-center gap-2">
            <span className="text-base">📦</span>
            <div>
              <span className="text-xs font-bold text-emerald-200">
                後院物料冷藏庫 & 豐洲市場進貨碼頭 (Cold Storage & Logistics Bay)
              </span>
              <span className="text-[10px] text-emerald-400 ml-2 font-mono">
                採購主管 蓮 (Ren) 嚴格把關
              </span>
            </div>
          </div>

          {/* Ren's Comic Speech Bubble */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-sm shadow-sm">
              <span className="animate-chibi-bob">{renPoseEmoji}</span>
            </div>
            <div className="bg-stone-900/90 border border-emerald-800/50 rounded-xl px-2.5 py-0.5 text-[10px] text-emerald-200 font-sans shadow-sm flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">蓮:</span>
              <span>"{renBubble}"</span>
            </div>
          </div>
        </div>

        {/* 8 Ingredient Animated Wooden Crates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {(Object.keys(state.inventory) as IngredientKey[]).map(key => {
            const item = state.inventory[key];
            const isLow = item.currentStock <= item.reorderThreshold;
            const isOut = item.currentStock === 0;

            return (
              <div
                key={key}
                onClick={() => onSelectIngredient?.(key)}
                className={`p-2 rounded-xl border transition flex flex-col justify-between cursor-pointer relative overflow-hidden ${
                  isOut
                    ? 'bg-rose-950/50 border-rose-500 shadow-md shadow-rose-950/50 animate-pulse'
                    : isLow
                    ? 'bg-amber-950/40 border-amber-500/70 shadow-md shadow-amber-950/30'
                    : 'bg-stone-900/80 border-stone-800 hover:border-emerald-700/60'
                }`}
              >
                {/* Crate Header */}
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
                  <span className="text-[11px] font-bold text-stone-200 block truncate">
                    {item.name.split(' ')[0]}
                  </span>
                  <div className="flex items-center justify-between text-[10px] font-mono mt-0.5">
                    <span className="text-stone-400">存量:</span>
                    <span
                      className={`font-bold ${
                        isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.currentStock} {item.unit}
                    </span>
                  </div>

                  {/* Stock Bar */}
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
  );
};
