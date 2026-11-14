import React, { useEffect, useRef, useState } from 'react';
import {
  Customer,
  DiningTable,
  IngredientKey,
  KitchenStation,
  SushiSimulationState
} from '../../lib/sushi/types';
import { SUSHI_RECIPES } from '../../lib/sushi/recipes';
import { getSushiClockInfo } from '../../lib/sushi/timeConstants';
import { useSushiI18n } from '../../lib/sushi/i18n';
import {
  Play,
  Pause,
  FastForward,
  Plus,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface SushiOvercookedStageProps {
  state: SushiSimulationState;
  onSelectCustomer?: (customer: Customer) => void;
  onSelectTable?: (table: DiningTable) => void;
  onSelectStation?: (station: KitchenStation) => void;
  onSelectIngredient?: (key: IngredientKey) => void;
  onAddTable?: () => void;
  onOpenBranchMapModal?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'flame' | 'steam' | 'heart' | 'coin' | 'dust';
  text?: string;
  color?: string;
  size?: number;
}

interface AnimatedActor {
  id: string;
  name: string;
  role: 'aoi' | 'kenji' | 'ren' | 'sakura' | 'customer';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walking' | 'chopping' | 'torching' | 'carrying' | 'eating' | 'calling';
  carryingItem?: string; // recipe id, ingredient or coins
  bubbleText?: string;
  bubbleTimer?: number;
  walkCycle: number;
  customerRef?: Customer;
}

export const SushiOvercookedStage: React.FC<SushiOvercookedStageProps> = ({
  state,
  onSelectCustomer,
  onSelectTable,
  onSelectStation,
  onSelectIngredient,
  onAddTable,
  onOpenBranchMapModal
}) => {
  const { t, language, getIngredientInfo } = useSushiI18n();
  const isEn = language === 'en';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Persistent actor positions across renders
  const actorsRef = useRef<{
    aoi: AnimatedActor;
    kenji: AnimatedActor;
    ren: AnimatedActor;
    sakura: AnimatedActor;
    customers: Map<string, AnimatedActor>;
  }>({
    aoi: {
      id: 'aoi',
      name: '阿葵 (Aoi)',
      role: 'aoi',
      x: 240,
      y: 280,
      targetX: 240,
      targetY: 280,
      speed: 3.2,
      facing: 'right',
      state: 'idle',
      walkCycle: 0
    },
    kenji: {
      id: 'kenji',
      name: '健次 (Kenji)',
      role: 'kenji',
      x: 520,
      y: 110,
      targetX: 520,
      targetY: 110,
      speed: 2.5,
      facing: 'right',
      state: 'idle',
      walkCycle: 0
    },
    ren: {
      id: 'ren',
      name: '蓮 (Ren)',
      role: 'ren',
      x: 480,
      y: 560,
      targetX: 480,
      targetY: 560,
      speed: 2.8,
      facing: 'left',
      state: 'idle',
      walkCycle: 0
    },
    sakura: {
      id: 'sakura',
      name: '櫻 (Sakura)',
      role: 'sakura',
      x: 880,
      y: 120,
      targetX: 880,
      targetY: 120,
      speed: 2.6,
      facing: 'left',
      state: 'idle',
      walkCycle: 0
    },
    customers: new Map()
  });

  const particlesRef = useRef<Particle[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Table Coordinates in Virtual Space (1000 x 660) - Supports Up to 16 Tables (3 Rows)
  const TABLE_COORDS: Record<string, { x: number; y: number; type: 'counter' | 'booth'; name: string }> = {
    // Row 1: Hinoki Counter Bar (y: 235)
    T1: { x: 320, y: 235, type: 'counter', name: '吧台 1' },
    T2: { x: 440, y: 235, type: 'counter', name: '吧台 2' },
    T3: { x: 560, y: 235, type: 'counter', name: '吧台 3' },
    T7: { x: 680, y: 235, type: 'counter', name: '吧台 7' },
    T9: { x: 800, y: 235, type: 'counter', name: '特等 9' },
    T11: { x: 920, y: 235, type: 'counter', name: '板前 11' },

    // Row 2: Dining Hall Booths (y: 340)
    T4: { x: 320, y: 340, type: 'booth', name: '庭園 4' },
    T5: { x: 440, y: 340, type: 'booth', name: '櫻花 5' },
    T6: { x: 560, y: 340, type: 'booth', name: '松木 6' },
    T8: { x: 680, y: 340, type: 'booth', name: '楓葉 8' },
    T10: { x: 800, y: 340, type: 'booth', name: '富士 10' },
    T12: { x: 920, y: 340, type: 'booth', name: '竹林 12' },

    // Row 3: Garden & VIP Tatami (y: 445)
    T13: { x: 320, y: 445, type: 'booth', name: '茶室 13' },
    T14: { x: 440, y: 445, type: 'booth', name: '枯山 14' },
    T15: { x: 560, y: 445, type: 'booth', name: '鶴羽 15' },
    T16: { x: 680, y: 445, type: 'booth', name: '御所 16' }
  };

  // Kitchen Station Coordinates
  const STATION_COORDS = {
    prep1: { x: 420, y: 110, name: '一號 握壽司台' },
    prep2: { x: 520, y: 110, name: '二號 軍艦卷台' },
    prep3: { x: 620, y: 110, name: '三號 炙燒台' },
    pass: { x: 660, y: 160, name: '出餐擺盤口' }
  };

  // High-level AI Coordinator: Updates actor targets based on simulation state
  useEffect(() => {
    const s = state;
    const actors = actorsRef.current;

    // 1. Host (Aoi) Decision Routine
    const plated = s.kitchenStations.find(st => st.status === 'plated' && st.currentTicketId);
    const payingCust = s.seatedCustomers.find(c => c.status === 'paying');
    const orderingCust = s.seatedCustomers.find(c => c.status === 'seated_ordering');
    const queueWaiting = s.customersInQueue.length > 0;
    const emptyTable = s.tables.find(t => t.status === 'empty');

    if (payingCust && payingCust.tableId && TABLE_COORDS[payingCust.tableId]) {
      const coord = TABLE_COORDS[payingCust.tableId];
      actors.aoi.targetX = coord.x + 35;
      actors.aoi.targetY = coord.y;
      actors.aoi.bubbleText = '多謝款待！收銀結帳中～';
      actors.aoi.bubbleTimer = 60;
    } else if (plated) {
      if (actors.aoi.carryingItem) {
        // Find who ordered this dish
        const ticket = s.activeTickets.find(t => t.id === plated.currentTicketId);
        if (ticket && ticket.tableId && TABLE_COORDS[ticket.tableId]) {
          const coord = TABLE_COORDS[ticket.tableId];
          actors.aoi.targetX = coord.x + 35;
          actors.aoi.targetY = coord.y;
          actors.aoi.bubbleText = isEn
            ? `Order #${ticket.id} (${ticket.recipeName || 'Sushi'}) served!`
            : `極上【${ticket.recipeName}】上桌！`;
          actors.aoi.bubbleTimer = 60;
        }
      } else {
        // Go to pass to pick up
        actors.aoi.targetX = STATION_COORDS.pass.x;
        actors.aoi.targetY = STATION_COORDS.pass.y + 20;
        actors.aoi.carryingItem = plated.currentRecipeId || 'salmon_nigiri';
        actors.aoi.bubbleText = isEn
          ? 'Order ready! Delivering now~'
          : '料理備妥！阿葵這就端送～';
        actors.aoi.bubbleTimer = 60;
      }
    } else if (orderingCust && orderingCust.tableId && TABLE_COORDS[orderingCust.tableId]) {
      const coord = TABLE_COORDS[orderingCust.tableId];
      actors.aoi.targetX = coord.x + 35;
      actors.aoi.targetY = coord.y;
      actors.aoi.carryingItem = undefined;
      actors.aoi.bubbleText = isEn
        ? 'Any dietary needs or requests?'
        : '請問貴賓有忌口或特殊偏好嗎？';
      actors.aoi.bubbleTimer = 60;
    } else if (queueWaiting && emptyTable) {
      actors.aoi.targetX = 140;
      actors.aoi.targetY = 220;
      actors.aoi.carryingItem = undefined;
      actors.aoi.bubbleText = isEn
        ? 'Welcome! Please follow me~'
        : '歡迎光臨！請隨我來～';
      actors.aoi.bubbleTimer = 60;
    } else {
      // Idle patrol near dining center
      actors.aoi.targetX = 240;
      actors.aoi.targetY = 320;
      actors.aoi.carryingItem = undefined;
    }

    // 2. Chef (Kenji) Decision Routine
    const prepping = s.kitchenStations.find(st => st.status === 'prepping');
    if (prepping) {
      if (prepping.id === 'station_3') {
        actors.kenji.targetX = STATION_COORDS.prep3.x;
        actors.kenji.targetY = STATION_COORDS.prep3.y;
        actors.kenji.state = 'torching';
        actors.kenji.bubbleText = isEn
          ? '🔥 Sizzle! High heat aburi torching!'
          : '🔥 嘶——噴槍高溫炙燒和牛！';
      } else if (prepping.id === 'station_2') {
        actors.kenji.targetX = STATION_COORDS.prep2.x;
        actors.kenji.targetY = STATION_COORDS.prep2.y;
        actors.kenji.state = 'chopping';
        actors.kenji.bubbleText = isEn
          ? '🍙 Wrapping crispy gunkan nori!'
          : '🍙 巧手包卷軍艦海苔！';
      } else {
        actors.kenji.targetX = STATION_COORDS.prep1.x;
        actors.kenji.targetY = STATION_COORDS.prep1.y;
        actors.kenji.state = 'chopping';
        actors.kenji.bubbleText = isEn
          ? '🔪 Chop! Precision sashimi slicing!'
          : '🔪 噠噠噠！俐落厚切極鮮刺身！';
      }
      actors.kenji.bubbleTimer = 50;
    } else if (plated) {
      actors.kenji.targetX = STATION_COORDS.pass.x - 20;
      actors.kenji.targetY = STATION_COORDS.pass.y - 20;
      actors.kenji.state = 'idle';
      actors.kenji.bubbleText = isEn
        ? '🔔 Plated! Order ready for pickup!'
        : '🔔 叮！壽司擺盤完成！請取餐！';
      actors.kenji.bubbleTimer = 50;
    } else {
      actors.kenji.targetX = 520;
      actors.kenji.targetY = 110;
      actors.kenji.state = 'idle';
    }

    // 3. Inventory (Ren) Decision Routine
    const isLow = Object.values(s.inventory).some(i => i.currentStock <= i.reorderThreshold);
    const isOut = Object.values(s.inventory).some(i => i.currentStock === 0);

    if (isOut) {
      actors.ren.targetX = 220;
      actors.ren.targetY = 560;
      actors.ren.state = 'calling';
      actors.ren.bubbleText = isEn
        ? '📞 Urgent! Toyosu market reorder!'
        : '📞 喂！豐洲市場嗎？食材見底了加急追加！';
      actors.ren.bubbleTimer = 60;
    } else if (isLow) {
      actors.ren.targetX = 140; // At delivery scooter dock
      actors.ren.targetY = 570;
      actors.ren.state = 'carrying';
      actors.ren.bubbleText = isEn
        ? '🛵 Shipment arrived! Restocking pantry!'
        : '🛵 到貨啦！正把鮮魚水產搬運入庫！';
      actors.ren.bubbleTimer = 60;
    } else {
      actors.ren.targetX = 500;
      actors.ren.targetY = 560;
      actors.ren.state = 'idle';
    }

    // 4. Manager (Sakura) Decision Routine
    const upset = s.seatedCustomers.find(
      c => c.status === 'waiting_food' && c.patienceRemaining / c.patienceMax < 0.4
    );

    if (upset && upset.tableId && TABLE_COORDS[upset.tableId]) {
      const coord = TABLE_COORDS[upset.tableId];
      actors.sakura.targetX = coord.x - 35;
      actors.sakura.targetY = coord.y;
      actors.sakura.bubbleText = isEn
        ? '🍵 Apologies for waiting! Special matcha dessert on us!'
        : '🍵 抱歉讓您久等！店長招待特製御抹茶甜點！';
      actors.sakura.bubbleTimer = 70;
    } else {
      actors.sakura.targetX = 880;
      actors.sakura.targetY = 120;
      actors.sakura.bubbleText = s.rushHourActive
        ? (isEn ? '📢 Rush hour! All hands on deck!' : '📢 爆單人潮湧入！全員加油衝刺！')
        : (isEn ? 'Turnover and revenue on target today~' : '今日翻台率與營業額穩定達標～');
      actors.sakura.bubbleTimer = 40;
    }

    // 5. Update Customer Actors
    const activeCustomerIds = new Set<string>();

    // Queued customers
    s.customersInQueue.forEach((c, idx) => {
      activeCustomerIds.add(c.id);
      let actor = actors.customers.get(c.id);
      const queuePos = { x: 70 + idx * 30, y: 220 };
      if (!actor) {
        actor = {
          id: c.id,
          name: c.name,
          role: 'customer',
          x: 40,
          y: 220,
          targetX: queuePos.x,
          targetY: queuePos.y,
          speed: 2.2,
          facing: 'right',
          state: 'idle',
          walkCycle: 0,
          customerRef: c
        };
        actors.customers.set(c.id, actor);
      } else {
        actor.targetX = queuePos.x;
        actor.targetY = queuePos.y;
        actor.customerRef = c;
      }
    });

    // Seated customers
    s.seatedCustomers.forEach(c => {
      activeCustomerIds.add(c.id);
      let actor = actors.customers.get(c.id);
      const tablePos = c.tableId && TABLE_COORDS[c.tableId] ? TABLE_COORDS[c.tableId] : { x: 360, y: 250 };
      if (!actor) {
        actor = {
          id: c.id,
          name: c.name,
          role: 'customer',
          x: tablePos.x,
          y: tablePos.y,
          targetX: tablePos.x,
          targetY: tablePos.y,
          speed: 2.5,
          facing: 'right',
          state: c.status === 'eating' ? 'eating' : 'idle',
          walkCycle: 0,
          customerRef: c
        };
        actors.customers.set(c.id, actor);
      } else {
        actor.targetX = tablePos.x;
        actor.targetY = tablePos.y;
        actor.state = c.status === 'eating' ? 'eating' : 'idle';
        actor.customerRef = c;
      }
    });

    // Clean up departed customers
    for (const [id] of actors.customers) {
      if (!activeCustomerIds.has(id)) {
        actors.customers.delete(id);
      }
    }
  }, [state]);

  // 60 FPS Canvas Game Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Auto-resize Canvas to container width and height
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const targetWidth = Math.floor(rect.width * dpr);
      const targetHeight = Math.floor(rect.height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Virtual Canvas Dimensions
      const V_W = 1000;
      const V_H = 660;
      const scaleX = rect.width / V_W;
      const scaleY = rect.height / V_H;
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (rect.width - V_W * scale) / 2;
      const offsetY = (rect.height - V_H * scale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // ==========================================
      // A. DRAW RESTAURANT ENVIRONMENT & ROOMS
      // ==========================================

      // 1. Wooden Tatami & Pine Plank Floor
      ctx.fillStyle = '#26180f';
      ctx.fillRect(0, 0, V_W, V_H);

      // Tatami mat tiles
      ctx.strokeStyle = '#3d2516';
      ctx.lineWidth = 1;
      for (let x = 0; x < V_W; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, V_H);
        ctx.stroke();
      }
      for (let y = 0; y < V_H; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(V_W, y);
        ctx.stroke();
      }

      // 2. Kitchen Zone (Top Center)
      ctx.fillStyle = '#1c1109';
      ctx.fillRect(320, 30, 440, 160);
      ctx.strokeStyle = '#6d3c19';
      ctx.lineWidth = 3;
      ctx.strokeRect(320, 30, 440, 160);

      // Kitchen Floor Tiles
      ctx.fillStyle = '#2d1a0e';
      ctx.fillRect(330, 40, 420, 90);

      // Hinoki Sushi Counter (Front Bar)
      ctx.fillStyle = '#9a5e2c';
      ctx.fillRect(320, 140, 440, 32);
      ctx.fillStyle = '#c57d3f';
      ctx.fillRect(322, 142, 436, 12); // Counter bevel highlight
      ctx.strokeStyle = '#5a3418';
      ctx.lineWidth = 2;
      ctx.strokeRect(320, 140, 440, 32);

      // Counter Title Signboard
      ctx.fillStyle = '#1c120a';
      ctx.fillRect(450, 144, 180, 24);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(450, 144, 180, 24);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isEn ? '🍣 Edo-Style Sushi Bar' : '🍣 江戶前・板前壽司吧台', 540, 161);

      // 3. Chef Cooking Stations on Kitchen Counter
      // Station 1: Nigiri
      ctx.fillStyle = '#452614';
      ctx.fillRect(400, 75, 55, 45);
      ctx.strokeRect(400, 75, 55, 45);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isEn ? '🔪 Nigiri' : '🔪 握壽司', 427, 95);
      ctx.fillText(isEn ? 'Board' : '砧板', 427, 109);

      // Station 2: Gunkan / Maki
      ctx.fillStyle = '#452614';
      ctx.fillRect(500, 75, 55, 45);
      ctx.strokeRect(500, 75, 55, 45);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isEn ? '🍙 Gunkan' : '🍙 軍艦卷', 527, 95);
      ctx.fillText(isEn ? 'Mat' : '竹簾', 527, 109);

      // Station 3: Aburi Torch Grill
      ctx.fillStyle = '#452614';
      ctx.fillRect(600, 75, 55, 45);
      ctx.strokeRect(600, 75, 55, 45);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isEn ? '🔥 Aburi' : '🔥 炙燒台', 627, 95);
      ctx.fillText(isEn ? 'Torch' : '噴槍', 627, 109);

      // Plated Pickup Pass (右端)
      ctx.fillStyle = '#5c1d1d';
      ctx.fillRect(680, 135, 65, 38);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(680, 135, 65, 38);
      ctx.fillStyle = '#fde68a';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(isEn ? '🔔 Pass' : '🔔 出餐取盤口', 712, 150);

      const hasPlated = stateRef.current.kitchenStations.some(s => s.status === 'plated');
      if (hasPlated) {
        ctx.font = '18px sans-serif';
        ctx.fillText('🍱', 712, 168);
      }

      // 4. Entrance & Waiting Porch (Left)
      ctx.fillStyle = '#1c130b';
      ctx.fillRect(20, 30, 260, 230);
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 30, 260, 230);

      // Noren Curtains at Entrance
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(40, 32, 220, 24);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(isEn ? '⛩️ SushiFlow Entrance' : '⛩️ 壽司物語 AI 暖簾入口', 150, 48);

      // Waiting Bench
      ctx.fillStyle = '#78350f';
      ctx.fillRect(40, 205, 220, 35);
      ctx.strokeStyle = '#451a03';
      ctx.strokeRect(40, 205, 220, 35);
      ctx.fillStyle = '#fef3c7';
      ctx.font = '11px sans-serif';
      ctx.fillText(isEn ? '🪑 Waiting Bench' : '🪑 迎賓等候長凳區', 150, 226);

      // Lucky Waving Cat
      ctx.font = '22px sans-serif';
      ctx.fillText('🐾', 245, 100);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(isEn ? 'Welcome' : '千客萬來', 245, 116);

      // 5. Manager Sakura Podium (Top Right)
      ctx.fillStyle = '#201026';
      ctx.fillRect(800, 30, 180, 160);
      ctx.strokeStyle = '#7e22ce';
      ctx.lineWidth = 2;
      ctx.strokeRect(800, 30, 180, 160);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(isEn ? '👩‍💼 GM Command Desk' : '👩‍💼 店長營運指揮台', 890, 52);

      // Manager's Desk & Laptop
      ctx.fillStyle = '#3b1747';
      ctx.fillRect(830, 80, 120, 50);
      ctx.strokeRect(830, 80, 120, 50);
      ctx.font = '16px sans-serif';
      ctx.fillText('💻 📊 🍵', 890, 110);

      // 6. Backyard Cold Storage & Logistics Dock (Bottom Zone)
      ctx.fillStyle = '#0f1712';
      ctx.fillRect(40, 500, 920, 130);
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 500, 920, 130);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(isEn ? '📦 Pantry & Logistics Bay' : '📦 後院生鮮冷藏庫 & 豐洲市場卸貨碼頭 (Logistics Bay)', 500, 520);

      // Delivery Scooter at Dock
      ctx.font = '24px sans-serif';
      ctx.fillText('🛵💨', 110, 580);
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#6ee7b7';
      ctx.fillText(isEn ? 'Logistics' : '市場專車', 110, 600);

      // 8 Ingredient Wooden Crates Drawn on Shelves
      const invKeys: IngredientKey[] = ['rice', 'salmon', 'tuna', 'uni', 'wagyu', 'nori', 'wasabi', 'avocado'];
      invKeys.forEach((key, idx) => {
        const item = stateRef.current.inventory[key];
        const ingInfo = getIngredientInfo(key, item.name, item.unit);
        const boxX = 220 + idx * 90;
        const boxY = 545;

        const isLow = item.currentStock <= item.reorderThreshold;
        const isOut = item.currentStock === 0;

        ctx.fillStyle = isOut ? '#450a0a' : isLow ? '#451a03' : '#1e293b';
        ctx.fillRect(boxX, boxY, 78, 56);
        ctx.strokeStyle = isOut ? '#ef4444' : isLow ? '#f59e0b' : '#334155';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(boxX, boxY, 78, 56);

        ctx.font = '18px sans-serif';
        ctx.fillText(item.emoji, boxX + 39, boxY + 24);

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(ingInfo.name.split(' ')[0], boxX + 39, boxY + 38);

        ctx.font = '9px monospace';
        ctx.fillStyle = isOut ? '#f87171' : isLow ? '#fcd34d' : '#86efac';
        ctx.fillText(`${item.currentStock} ${ingInfo.unit}`, boxX + 39, boxY + 50);
      });

      // 7. Dining Tables & Counter Seats (Center Floor) - Render Active Tables
      stateRef.current.tables.forEach(table => {
        const pos = TABLE_COORDS[table.id] || { x: 330, y: 250, type: table.type, name: table.name };
        const customer = stateRef.current.seatedCustomers.find(c => c.tableId === table.id);
        const isEating = customer?.status === 'eating';
        const isPaying = customer?.status === 'paying';
        const isOccupied = !!customer;

        // Table Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 18, 48, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Table Surface
        ctx.fillStyle = isEating ? '#14381e' : isPaying ? '#36173d' : isOccupied ? '#452310' : '#2b190f';
        ctx.fillRect(pos.x - 45, pos.y - 20, 90, 42);
        ctx.strokeStyle = isEating ? '#10b981' : isPaying ? '#a855f7' : isOccupied ? '#d97706' : '#5c351b';
        ctx.lineWidth = 2;
        ctx.strokeRect(pos.x - 45, pos.y - 20, 90, 42);

        // Table Name Label
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        const tableName = isEn ? table.id.replace('T', 'Table ') : (table.name || pos.name);
        ctx.fillText(tableName, pos.x, pos.y - 6);

        // Table Status
        if (customer) {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = isEating ? '#6ee7b7' : isPaying ? '#e9d5ff' : '#fcd34d';
          ctx.fillText(isEating ? (isEn ? '🥢 Dining' : '🥢 品嚐中') : isPaying ? (isEn ? '🪙 Paying' : '🪙 結帳中') : (isEn ? '⏳ Waiting' : '⏳ 等出餐'), pos.x, pos.y + 10);

          // Plate on table
          ctx.font = '14px sans-serif';
          ctx.fillText('🍱', pos.x, pos.y + 26);

          // Patience Gauge above table
          const pct = customer.patienceRemaining / customer.patienceMax;
          ctx.fillStyle = '#374151';
          ctx.fillRect(pos.x - 30, pos.y - 32, 60, 4);
          ctx.fillStyle = pct > 0.5 ? '#10b981' : pct > 0.25 ? '#f59e0b' : '#ef4444';
          ctx.fillRect(pos.x - 30, pos.y - 32, Math.max(0, 60 * pct), 4);
        } else {
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText(isEn ? '🪑 Empty' : '🪑 空席待客', pos.x, pos.y + 10);
        }
      });

      // Draw dashed blueprint expansion slot for next expandable table (up to 16)
      const CANDIDATE_TABLE_IDS = ['T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16'];
      const existingTableIds = new Set(stateRef.current.tables.map(t => t.id));
      const nextCandidateId = CANDIDATE_TABLE_IDS.find(id => !existingTableIds.has(id));
      if (nextCandidateId && TABLE_COORDS[nextCandidateId] && stateRef.current.tables.length < 16) {
        const slotPos = TABLE_COORDS[nextCandidateId];
        ctx.save();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(slotPos.x - 45, slotPos.y - 20, 90, 42);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
        ctx.fillRect(slotPos.x - 45, slotPos.y - 20, 90, 42);

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText(isEn ? '➕ Add Table' : '➕ 點擊擴建席位', slotPos.x, slotPos.y - 4);
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#fde68a';
        ctx.fillText(`$150 (${stateRef.current.tables.length}/16)`, slotPos.x, slotPos.y + 12);
        ctx.restore();
      } else if (stateRef.current.tables.length >= 16) {
        // Draw Max Tables Celebration Banner
        ctx.save();
        ctx.fillStyle = 'rgba(225, 29, 72, 0.15)';
        ctx.fillRect(800, 425, 175, 45);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(800, 425, 175, 45);

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#fecdd3';
        ctx.textAlign = 'center';
        ctx.fillText(isEn ? '🎊 16 Tables Limit!' : '🎊 席位達 16 桌上限！', 887, 442);
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(isEn ? '🗺️ Open New Branch' : '🗺️ 請點擊開設新分店', 887, 458);
        ctx.restore();
      }

      // ==========================================
      // B. UPDATE & DRAW 2D ANIMATED ACTORS (OVERCOOKED STYLE)
      // ==========================================

      const drawActor = (actor: AnimatedActor) => {
        // Interpolate walking movement towards target
        const dx = actor.targetX - actor.x;
        const dy = actor.targetY - actor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 3) {
          actor.x += (dx / dist) * actor.speed;
          actor.y += (dy / dist) * actor.speed;
          actor.facing = dx < 0 ? 'left' : 'right';
          actor.walkCycle += 0.2;

          // Emit dust particle when walking
          if (Math.random() < 0.2) {
            particlesRef.current.push({
              x: actor.x + (Math.random() - 0.5) * 8,
              y: actor.y + 16,
              vx: (Math.random() - 0.5) * 0.5,
              vy: -0.5,
              life: 15,
              maxLife: 15,
              type: 'dust',
              color: 'rgba(217, 119, 6, 0.4)',
              size: 3
            });
          }
        } else {
          actor.x = actor.targetX;
          actor.y = actor.targetY;
          actor.walkCycle = 0;
        }

        const isMoving = dist > 3;
        const bounce = isMoving ? Math.sin(actor.walkCycle) * 3 : 0;

        ctx.save();
        ctx.translate(actor.x, actor.y + bounce);

        // 1. Soft Oval Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 16 - bounce, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Chibi Character Body & Outfit
        let bodyColor = '#f43f5e';
        let hatEmoji = '💁‍♀️';
        if (actor.role === 'kenji') {
          bodyColor = '#f97316';
          hatEmoji = '👨‍🍳';
        } else if (actor.role === 'ren') {
          bodyColor = '#10b981';
          hatEmoji = '📦';
        } else if (actor.role === 'sakura') {
          bodyColor = '#a855f7';
          hatEmoji = '👩‍💼';
        } else if (actor.role === 'customer') {
          bodyColor = '#3b82f6';
          hatEmoji = actor.customerRef?.avatar || '🧑';
        }

        // Animated Feet (Stepping legs)
        const legOffset = isMoving ? Math.sin(actor.walkCycle) * 4 : 0;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-6 + legOffset, 10, 4, 6);
        ctx.fillRect(2 - legOffset, 10, 4, 6);

        // Chibi Tunic Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.roundRect(-10, -6, 20, 18, 6);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Apron / Details
        if (actor.role === 'aoi' || actor.role === 'kenji') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-6, -2, 12, 12);
        }

        // Chibi Head & Face
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(hatEmoji, 0, -8);

        // Name Tag underneath
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#f8fafc';
        const displayName = isEn
          ? actor.role === 'aoi'
            ? 'Aoi'
            : actor.role === 'kenji'
            ? 'Kenji'
            : actor.role === 'ren'
            ? 'Ren'
            : actor.role === 'sakura'
            ? 'Sakura'
            : actor.customerRef
            ? (actor.customerRef.isVip ? 'VIP' : 'Guest')
            : actor.name
          : actor.name.split(' ')[0];
        ctx.fillText(displayName, 0, 26);

        // 3. Hands & Carried Items (Overcooked Style: Platter over head or in hands)
        if (actor.carryingItem) {
          ctx.font = '16px sans-serif';
          ctx.fillText('🍱', 0, -26);
        }

        // Chef Special Effects (Chopping knife or blowtorch flame)
        if (actor.role === 'kenji' && actor.state === 'chopping') {
          const chopOffset = Math.sin(Date.now() / 60) * 6;
          ctx.font = '16px sans-serif';
          ctx.fillText('🔪', 14, -6 + chopOffset);
        } else if (actor.role === 'kenji' && actor.state === 'torching') {
          ctx.font = '16px sans-serif';
          ctx.fillText('🔥', 16, -6);
          // Spawn flame particles
          if (Math.random() < 0.4) {
            particlesRef.current.push({
              x: actor.x + 18,
              y: actor.y - 6,
              vx: (Math.random() - 0.2) * 1.5,
              vy: -Math.random() * 2,
              life: 12,
              maxLife: 12,
              type: 'flame',
              color: '#f97316',
              size: 4
            });
          }
        }

        // Eating particles if customer is eating
        if (actor.role === 'customer' && actor.state === 'eating') {
          ctx.font = '14px sans-serif';
          ctx.fillText('🥢😋', 0, -22);
          if (Math.random() < 0.08) {
            particlesRef.current.push({
              x: actor.x + (Math.random() - 0.5) * 20,
              y: actor.y - 25,
              vx: 0,
              vy: -1.2,
              life: 25,
              maxLife: 25,
              type: 'heart',
              text: '💕'
            });
          }
        }

        // 4. Comic Speech / Thought Bubble
        if (actor.bubbleText && (actor.bubbleTimer ?? 0) > 0) {
          actor.bubbleTimer = (actor.bubbleTimer ?? 0) - 0.5;

          const text = actor.bubbleText;
          ctx.font = 'bold 12px sans-serif';
          const textMetrics = ctx.measureText(text);
          const bubbleW = textMetrics.width + 18;
          const bubbleH = 24;
          const bubbleY = -45;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(-bubbleW / 2, bubbleY - bubbleH, bubbleW, bubbleH, 8);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bubble Tail
          ctx.beginPath();
          ctx.moveTo(-4, bubbleY);
          ctx.lineTo(4, bubbleY);
          ctx.lineTo(0, bubbleY + 6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.fillText(text, 0, bubbleY - 6);
        }

        ctx.restore();
      };

      // Draw all actors in depth order (Y sorting)
      const allActors: AnimatedActor[] = [
        actorsRef.current.kenji,
        actorsRef.current.sakura,
        actorsRef.current.aoi,
        actorsRef.current.ren,
        ...Array.from(actorsRef.current.customers.values())
      ].sort((a, b) => a.y - b.y);

      allActors.forEach(drawActor);

      // ==========================================
      // C. UPDATE & DRAW PARTICLE EFFECTS
      // ==========================================
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;

        if (p.type === 'flame') {
          ctx.fillStyle = p.color || '#f97316';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'dust') {
          ctx.fillStyle = p.color || 'rgba(200, 200, 200, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'heart') {
          ctx.font = '14px sans-serif';
          ctx.fillText('💕', p.x, p.y);
        } else if (p.type === 'coin') {
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.fillText(p.text || '+$$ 🪙', p.x, p.y);
        }

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 660 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked the candidate expansion table slot
    const CANDIDATE_TABLE_IDS = ['T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16'];
    const existingTableIds = new Set(state.tables.map(t => t.id));
    const nextCandidateId = CANDIDATE_TABLE_IDS.find(id => !existingTableIds.has(id));
    if (nextCandidateId && TABLE_COORDS[nextCandidateId] && state.tables.length < 16) {
      const slot = TABLE_COORDS[nextCandidateId];
      if (
        clickX >= slot.x - 45 &&
        clickX <= slot.x + 45 &&
        clickY >= slot.y - 20 &&
        clickY <= slot.y + 22
      ) {
        onAddTable?.();
        return;
      }
    }

    // Check if clicked the Max Tables branch banner
    if (state.tables.length >= 16 && onOpenBranchMapModal) {
      if (clickX >= 800 && clickX <= 975 && clickY >= 425 && clickY <= 470) {
        onOpenBranchMapModal();
        return;
      }
    }

    // Check if clicked any existing table
    for (const table of state.tables) {
      const pos = TABLE_COORDS[table.id];
      if (pos) {
        if (
          clickX >= pos.x - 45 &&
          clickX <= pos.x + 45 &&
          clickY >= pos.y - 20 &&
          clickY <= pos.y + 22
        ) {
          onSelectTable?.(table);
          return;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-stone-950 text-stone-100 select-none overflow-hidden rounded-2xl border-2 border-amber-900/50 shadow-2xl relative"
    >
      {/* The 60 FPS HTML5 Canvas Interactive Stage */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[#1c120a] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Bottom Operational Status Bar */}
      <div className="bg-stone-900/95 border-t border-amber-900/40 px-3 py-1.5 flex items-center justify-between text-xs text-stone-300 font-mono z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-300 font-semibold">
            <span>💁‍♀️ {isEn ? 'Aoi:' : '阿葵:'}</span>
            <span className="text-stone-300 font-normal">{t('stageHostAction')}</span>
          </span>
          <span className="text-stone-600">|</span>
          <span className="flex items-center gap-1 text-orange-300 font-semibold">
            <span>👨‍🍳 {isEn ? 'Kenji:' : '健次:'}</span>
            <span className="text-stone-300 font-normal">{t('stageChefAction')}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400">
            📦 {isEn ? 'Ren: ' : '蓮: '}{t('stageInventoryAction')}
          </span>
          <span className="text-stone-600">|</span>
          <span className="text-purple-300">
            👩‍💼 {isEn ? 'Sakura: ' : '櫻: '}{t('stageManagerAction')}
          </span>
        </div>
      </div>
    </div>
  );
};
