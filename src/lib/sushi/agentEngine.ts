import {
  AgentThoughtStep,
  Customer,
  DiningTable,
  IngredientKey,
  InterAgentMessage,
  KitchenStation,
  OrderTicket,
  RestaurantFinancials,
  RestaurantMetrics,
  SushiAgentConfig,
  SushiAgentRole,
  SushiSimulationState
} from './types';
import { canCraftRecipe, SUSHI_RECIPES } from './recipes';
import { sushiAudio } from './audio';

export interface MultiAgentCycleResult {
  thoughtSteps: AgentThoughtStep[];
  newMessages: InterAgentMessage[];
  updatedInventory: SushiSimulationState['inventory'];
  updatedFinancials: RestaurantFinancials;
  updatedMetrics: RestaurantMetrics;
  updatedTables: DiningTable[];
  updatedCustomersInQueue: Customer[];
  updatedSeatedCustomers: Customer[];
  updatedKitchenStations: KitchenStation[];
  updatedActiveTickets: OrderTicket[];
  updatedCompletedTickets: OrderTicket[];
}

/**
 * Parses user prompt directives for custom behavior
 */
export interface AgentPromptDirectives {
  isAggressiveSpeed: boolean;
  isStrictArtisan: boolean;
  isVipFocused: boolean;
  safetyStockThreshold: number;
  autoRemedyComplaints: boolean;
  batchCrafting: boolean;
}

export function parseSushiPrompt(prompt: string): AgentPromptDirectives {
  const p = prompt.toLowerCase();
  let threshold = 5;

  const match = p.match(/(?:低于|低於|少于|少於|less than|threshold)[^\d]*(\d{1,2})/);
  if (match && match[1]) {
    threshold = parseInt(match[1], 10);
  }

  return {
    isAggressiveSpeed: p.includes('速') || p.includes('翻台') || p.includes('fast') || p.includes('quick'),
    isStrictArtisan: p.includes('匠') || p.includes('品质') || p.includes('品質') || p.includes('artisan'),
    isVipFocused: p.includes('vip') || p.includes('米其林') || p.includes('贵宾') || p.includes('貴賓'),
    safetyStockThreshold: Math.max(2, Math.min(25, threshold)),
    autoRemedyComplaints: p.includes('安抚') || p.includes('安撫') || p.includes('甜点') || p.includes('remedy') || p.includes('茶'),
    batchCrafting: p.includes('批次') || p.includes('合并') || p.includes('合併') || p.includes('batch')
  };
}

let _uniqueSeq = 0;
export function genSushiId(prefix: string): string {
  _uniqueSeq = (_uniqueSeq + 1) % 10000000;
  return `${prefix}_${Date.now()}_${_uniqueSeq}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Runs a single collaborative cycle across all enabled AI Agents
 */
export async function executeMultiAgentCycle(
  state: SushiSimulationState,
  agents: Record<SushiAgentRole, SushiAgentConfig>
): Promise<MultiAgentCycleResult> {
  const currentTick = state.tick;
  const timestamp = new Date().toLocaleTimeString('zh-TW', { hour12: false });

  const thoughtSteps: AgentThoughtStep[] = [];
  const newMessages: InterAgentMessage[] = [];

  // Working deep copies
  const inventory = JSON.parse(JSON.stringify(state.inventory));
  const financials = { ...state.financials };
  const metrics = { ...state.metrics };
  const tables = JSON.parse(JSON.stringify(state.tables)) as DiningTable[];
  const customersInQueue = JSON.parse(JSON.stringify(state.customersInQueue)) as Customer[];
  const seatedCustomers = JSON.parse(JSON.stringify(state.seatedCustomers)) as Customer[];
  const kitchenStations = JSON.parse(JSON.stringify(state.kitchenStations)) as KitchenStation[];
  const activeTickets = JSON.parse(JSON.stringify(state.activeTickets)) as OrderTicket[];
  const completedTickets = JSON.parse(JSON.stringify(state.completedTickets)) as OrderTicket[];

  const unlocked = state.scenario.unlockedAgents;

  // -------------------------------------------------------------
  // 1. HOST AGENT (阿葵 Aoi)
  // -------------------------------------------------------------
  if (unlocked.includes('host') && agents.host) {
    const hostDirectives = parseSushiPrompt(agents.host.systemPrompt);

    // 1A. Greet & Seat waiting customers
    const emptyTables = tables.filter(t => t.status === 'empty');
    if (customersInQueue.length > 0 && emptyTables.length > 0) {
      // Prioritize VIPs if prompt directives focus on VIP
      if (hostDirectives.isVipFocused) {
        customersInQueue.sort((a, b) => (b.isVip ? 1 : 0) - (a.isVip ? 1 : 0));
      }

      const nextCustomer = customersInQueue.shift()!;
      const chosenTable = emptyTables[0];
      chosenTable.status = 'occupied';
      chosenTable.assignedCustomerId = nextCustomer.id;
      nextCustomer.tableId = chosenTable.id;
      nextCustomer.status = 'seated_ordering';
      seatedCustomers.push(nextCustomer);

      thoughtSteps.push({
        id: genSushiId('th_host_greet'),
        agentRole: 'host',
        agentName: agents.host.name,
        tick: currentTick,
        timestamp,
        type: 'observe',
        content: `看見顧客【${nextCustomer.name}】${nextCustomer.isVip ? '⭐VIP貴賓' : ''}在隊列中等待，帶位至【${chosenTable.name}】。`
      });

      thoughtSteps.push({
        id: genSushiId('th_host_seat'),
        agentRole: 'host',
        agentName: agents.host.name,
        tick: currentTick,
        timestamp,
        type: 'tool_call',
        content: `執行工具 greet_and_seat({ customerId: "${nextCustomer.id}", tableId: "${chosenTable.id}" })`
      });

      sushiAudio.playOrderTaken();
    }

    // 1B. Take orders for newly seated customers
    for (const cust of seatedCustomers) {
      if (cust.status === 'seated_ordering') {
        cust.status = 'waiting_food';

        for (const item of cust.orders) {
          const recipe = SUSHI_RECIPES[item.recipeId];
          if (!recipe) continue;

          const isDietary = cust.specialPreference !== 'none';
          const ticketId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

          const newTicket: OrderTicket = {
            id: ticketId,
            tableId: cust.tableId || 'T1',
            customerId: cust.id,
            customerName: cust.name,
            recipeId: recipe.id,
            recipeName: recipe.name,
            recipeEmoji: recipe.emoji,
            price: recipe.price,
            status: 'pending',
            createdAtTick: currentTick,
            customNote: cust.specialNote,
            isSpecialDietary: isDietary
          };

          activeTickets.push(newTicket);
          metrics.activeOrdersCount = activeTickets.length;

          thoughtSteps.push({
            id: genSushiId(`th_host_order_${ticketId}`),
            agentRole: 'host',
            agentName: agents.host.name,
            tick: currentTick,
            timestamp,
            type: 'tool_call',
            content: `記錄點餐【${recipe.name}】${cust.specialNote ? `(備註: ${cust.specialNote})` : ''}，生成工單 #${ticketId} 傳送後廚。`
          });

          newMessages.push({
            id: genSushiId(`msg_host_order_${ticketId}`),
            tick: currentTick,
            timestamp,
            fromRole: 'host',
            toRole: 'chef',
            channel: 'order_dispatch',
            content: `【新工單 #${ticketId}】桌號 ${cust.tableId}: 製作 ${recipe.emoji} ${recipe.name}${cust.specialNote ? ` [重點備註: ${cust.specialNote}]` : ''}`
          });
        }
      }
    }

    // 1C. Check for plated dishes ready to serve
    const platedStations = kitchenStations.filter(s => s.status === 'plated' && s.currentTicketId);
    for (const station of platedStations) {
      const ticket = activeTickets.find(t => t.id === station.currentTicketId);
      if (ticket) {
        ticket.status = 'served';
        ticket.servedAtTick = currentTick;

        // Reset station
        station.status = 'idle';
        station.currentTicketId = undefined;
        station.currentRecipeId = undefined;
        station.prepProgress = 0;

        // Find customer and update eating status
        const cust = seatedCustomers.find(c => c.id === ticket.customerId);
        if (cust) {
          cust.status = 'eating';
          cust.eatingTicksRemaining = 6; // Eats for 6 ticks

          thoughtSteps.push({
            id: genSushiId(`th_host_serve_${ticket.id}`),
            agentRole: 'host',
            agentName: agents.host.name,
            tick: currentTick,
            timestamp,
            type: 'tool_call',
            content: `從料理台【${station.name}】端送【${ticket.recipeName}】給【${cust.name}】。`
          });

          newMessages.push({
            id: genSushiId(`msg_host_serve_${ticket.id}`),
            tick: currentTick,
            timestamp,
            fromRole: 'host',
            toRole: 'manager',
            channel: 'order_dispatch',
            content: `【出餐完畢】已順利將工單 #${ticket.id} 上桌至 ${ticket.tableId}。`
          });
        }
      }
    }

    // 1D. Collect payment for customers who finished eating
    for (let i = seatedCustomers.length - 1; i >= 0; i--) {
      const cust = seatedCustomers[i];
      if (cust.status === 'eating') {
        cust.eatingTicksRemaining = (cust.eatingTicksRemaining ?? 1) - 1;
        if (cust.eatingTicksRemaining <= 0) {
          cust.status = 'paying';
        }
      }

      if (cust.status === 'paying') {
        // Calculate bill
        const bill = cust.billAmount;
        let satisfaction = Math.max(1, Math.min(5, Math.round((cust.patienceRemaining / cust.patienceMax) * 5)));
        if (cust.isVip && satisfaction < 4) satisfaction = 3;

        let tip = 0;
        if (satisfaction >= 4) {
          tip = Math.round(bill * 0.15);
        } else if (satisfaction >= 5) {
          tip = Math.round(bill * 0.25);
        }

        financials.balance += bill + tip;
        financials.totalRevenue += bill + tip;
        financials.tipsTotal += tip;
        metrics.customersServed += 1;
        if (cust.isVip) metrics.vipCustomersServed += 1;

        // Update cumulative satisfaction stars and average score
        const prevCumStars = metrics.cumulativeSatisfactionStars ?? 25;
        const updatedCumStars = prevCumStars + satisfaction;
        metrics.cumulativeSatisfactionStars = updatedCumStars;
        const totalReviews = 5 + metrics.customersServed + metrics.customersWalkout;
        metrics.averageSatisfactionStars = Math.max(1.0, Math.min(5.0, Number((updatedCumStars / totalReviews).toFixed(1))));

        // Update table to dirty then empty
        const tbl = tables.find(t => t.id === cust.tableId);
        if (tbl) {
          tbl.status = 'empty';
          tbl.assignedCustomerId = undefined;
        }

        thoughtSteps.push({
          id: genSushiId(`th_host_pay_${cust.id}`),
          agentRole: 'host',
          agentName: agents.host.name,
          tick: currentTick,
          timestamp,
          type: 'tool_call',
          content: `為【${cust.name}】辦理結帳：實收 $${bill}，收到小費 $${tip}。評價：${'★'.repeat(satisfaction)}`
        });

        sushiAudio.playPayment();
        seatedCustomers.splice(i, 1);
      }
    }
  }

  // -------------------------------------------------------------
  // 2. CHEF AGENT (健次 Kenji)
  // -------------------------------------------------------------
  if (unlocked.includes('chef') && agents.chef) {
    const chefDirectives = parseSushiPrompt(agents.chef.systemPrompt);

    // 2A. Update currently prepping stations
    for (const station of kitchenStations) {
      if (station.status === 'prepping') {
        station.remainingPrepTicks -= 1;
        station.prepProgress = Math.min(
          100,
          Math.round(((station.totalPrepTicks - station.remainingPrepTicks) / station.totalPrepTicks) * 100)
        );

        if (station.remainingPrepTicks <= 0) {
          station.status = 'plated';
          station.prepProgress = 100;
          metrics.dishesPreparedCount += 1;

          const ticket = activeTickets.find(t => t.id === station.currentTicketId);
          if (ticket) {
            ticket.status = 'ready_to_serve';

            thoughtSteps.push({
              id: genSushiId(`th_chef_plate_${station.id}_${ticket.id}`),
              agentRole: 'chef',
              agentName: agents.chef.name,
              tick: currentTick,
              timestamp,
              type: 'tool_call',
              content: `料理完成！在【${station.name}】完成【${ticket.recipeName}】精美擺盤，呼叫阿葵取餐。`
            });

            newMessages.push({
              id: genSushiId(`msg_chef_ready_${station.id}_${ticket.id}`),
              tick: currentTick,
              timestamp,
              fromRole: 'chef',
              toRole: 'host',
              channel: 'order_dispatch',
              content: `【擺盤完成】工單 #${ticket.id} (${ticket.recipeName}) 已在 ${station.name} 備妥，請迅速上桌！`
            });

            sushiAudio.playDishReady();
          }
        }
      }
    }

    // 2B. Start crafting new pending tickets
    const idleStations = kitchenStations.filter(s => s.status === 'idle');
    const pendingTickets = activeTickets.filter(t => t.status === 'pending');

    if (idleStations.length > 0 && pendingTickets.length > 0) {
      for (const station of idleStations) {
        if (pendingTickets.length === 0) break;

        // If batching is preferred in prompt, try to pick tickets with same recipe
        const ticket = pendingTickets.shift()!;
        const recipe = SUSHI_RECIPES[ticket.recipeId];

        if (recipe) {
          const { canCraft, missing } = canCraftRecipe(recipe, inventory, ticket.customNote);

          if (!canCraft) {
            // Out of ingredients!
            metrics.stockoutIncidentsCount += 1;

            thoughtSteps.push({
              id: genSushiId(`th_chef_alert_${ticket.id}`),
              agentRole: 'chef',
              agentName: agents.chef.name,
              tick: currentTick,
              timestamp,
              type: 'thought',
              content: `【食材不足】製作【${recipe.name}】短缺: ${missing.map(m => inventory[m]?.name || m).join(', ')}！無法出餐！`
            });

            newMessages.push({
              id: genSushiId(`msg_chef_alert_${ticket.id}`),
              tick: currentTick,
              timestamp,
              fromRole: 'chef',
              toRole: 'inventory',
              channel: 'inventory_alert',
              content: `【緊急斷料告警】工單 #${ticket.id} 嚴重缺料：${missing.join(', ')}！請蓮立刻調配採購！`
            });

            sushiAudio.playAlert();
            // Put ticket back to end of pending
            activeTickets.push(ticket);
            continue;
          }

          // Consume ingredients
          for (const req of recipe.ingredients) {
            if (req.ingredient === 'wasabi' && ticket.customNote?.includes('不要芥末')) {
              continue;
            }
            if (inventory[req.ingredient]) {
              inventory[req.ingredient].currentStock = Math.max(0, inventory[req.ingredient].currentStock - req.amount);
            }
          }

          // Setup station
          station.status = 'prepping';
          station.currentTicketId = ticket.id;
          station.currentRecipeId = recipe.id;
          station.totalPrepTicks = recipe.prepTicks;
          station.remainingPrepTicks = recipe.prepTicks;
          station.prepProgress = 10;
          station.assignedChef = agents.chef.name;

          ticket.status = 'in_prep';
          ticket.startedAtTick = currentTick;
          ticket.kitchenStationId = station.id;

          thoughtSteps.push({
            id: genSushiId(`th_chef_craft_${station.id}_${ticket.id}`),
            agentRole: 'chef',
            agentName: agents.chef.name,
            tick: currentTick,
            timestamp,
            type: 'tool_call',
            content: `在【${station.name}】開火製作【${recipe.name}】工單 #${ticket.id} (耗時 ${recipe.prepTicks} 刻度)${ticket.customNote ? ` [守則: ${ticket.customNote}]` : ''}`
          });

          sushiAudio.playKnifeChop();
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 3. INVENTORY AGENT (蓮 Ren)
  // -------------------------------------------------------------
  if (unlocked.includes('inventory') && agents.inventory) {
    const invDirectives = parseSushiPrompt(agents.inventory.systemPrompt);
    const safetyThreshold = invDirectives.safetyStockThreshold;

    // 3A. Scan ingredients and restock if below threshold
    const keys = Object.keys(inventory) as IngredientKey[];
    for (const key of keys) {
      const item = inventory[key];
      if (!item) continue;

      if (item.currentStock <= safetyThreshold) {
        const orderCost = item.costPerUnit * item.reorderPackSize;

        // Check if balance allows
        if (financials.balance >= orderCost) {
          financials.balance -= orderCost;
          financials.totalExpenses += orderCost;
          financials.procurementCosts += orderCost;
          item.currentStock += item.reorderPackSize;

          thoughtSteps.push({
            id: genSushiId(`th_inv_restock_${key}`),
            agentRole: 'inventory',
            agentName: agents.inventory.name,
            tick: currentTick,
            timestamp,
            type: 'tool_call',
            content: `庫存盤點發現【${item.name}】僅剩 ${item.currentStock - item.reorderPackSize} 份（低於安全門檻 ${safetyThreshold}），執行 order_ingredient 向豐洲市場採購 ${item.reorderPackSize} 份 (花費 $${orderCost})。`
          });

          newMessages.push({
            id: genSushiId(`msg_inv_restock_${key}`),
            tick: currentTick,
            timestamp,
            fromRole: 'inventory',
            toRole: 'chef',
            channel: 'inventory_alert',
            content: `【物資入庫通知】已採購補充 ${item.emoji} ${item.name} +${item.reorderPackSize} 份，目前儲備充裕！`
          });

          sushiAudio.playDeliveryArrival();
        } else {
          thoughtSteps.push({
            id: genSushiId(`th_inv_broke_${key}`),
            agentRole: 'inventory',
            agentName: agents.inventory.name,
            tick: currentTick,
            timestamp,
            type: 'thought',
            content: `【資金預警】想要採購【${item.name}】需要 $${orderCost}，但當前資金僅剩 $${financials.balance.toFixed(0)}！暫緩採購。`
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 4. MANAGER AGENT (櫻 Sakura)
  // -------------------------------------------------------------
  if (unlocked.includes('manager') && agents.manager) {
    const mgrDirectives = parseSushiPrompt(agents.manager.systemPrompt);

    // 4A. Monitor impatient customers and offer remedies
    for (const cust of seatedCustomers) {
      if (cust.status === 'waiting_food') {
        const patiencePct = cust.patienceRemaining / cust.patienceMax;
        if (patiencePct < 0.45 && mgrDirectives.autoRemedyComplaints) {
          // Restore 30% patience
          const restored = Math.round(cust.patienceMax * 0.3);
          cust.patienceRemaining = Math.min(cust.patienceMax, cust.patienceRemaining + restored);

          thoughtSteps.push({
            id: genSushiId(`th_mgr_remedy_${cust.id}`),
            agentRole: 'manager',
            agentName: agents.manager.name,
            tick: currentTick,
            timestamp,
            type: 'tool_call',
            content: `發現顧客【${cust.name}】等待時間過長（耐心值僅剩 ${(patiencePct * 100).toFixed(0)}%），店長授權 complaint_remedy 贈送高級宇治抹茶甜品，恢復耐心值 +30%！`
          });

          newMessages.push({
            id: genSushiId(`msg_mgr_remedy_${cust.id}`),
            tick: currentTick,
            timestamp,
            fromRole: 'manager',
            toRole: 'all',
            channel: 'customer_feedback',
            content: `【店長關懷】已向桌號 ${cust.tableId}【${cust.name}】贈送御抹茶點心，有效撫平客訴風險。`
          });
          break; // One remedy per cycle
        }
      }
    }

    // 4B. Periodic KPI audit
    if (currentTick % 10 === 0) {
      thoughtSteps.push({
        id: genSushiId('th_mgr_audit'),
        agentRole: 'manager',
        agentName: agents.manager.name,
        tick: currentTick,
        timestamp,
        type: 'observe',
        content: `【營運健康度審計】目前營收: $${financials.totalRevenue.toFixed(0)} | 結餘: $${financials.balance.toFixed(0)} | 已接待客數: ${metrics.customersServed} | 待出餐工單: ${activeTickets.filter(t => t.status === 'pending').length} 張。`
      });
    }
  }

  // Update efficiency score
  const totalCompleted = metrics.customersServed;
  const totalWalkouts = metrics.customersWalkout;
  metrics.efficiencyScore = Math.min(100, Math.round((totalCompleted / Math.max(1, totalCompleted + totalWalkouts)) * 100));

  return {
    thoughtSteps,
    newMessages,
    updatedInventory: inventory,
    updatedFinancials: financials,
    updatedMetrics: metrics,
    updatedTables: tables,
    updatedCustomersInQueue: customersInQueue,
    updatedSeatedCustomers: seatedCustomers,
    updatedKitchenStations: kitchenStations,
    updatedActiveTickets: activeTickets,
    updatedCompletedTickets: completedTickets
  };
}

/**
 * Direct client-side LLM dispatch fallback when server API route is unreachable on static hosting
 */
export async function executeDirectSushiDispatch(body: {
  role: string;
  provider: 'gemini' | 'openai' | 'deepseek';
  model?: string;
  apiKey?: string;
  systemPrompt: string;
  currentTick: number;
  tables: any[];
  customersInQueue: any[];
  seatedCustomers: any[];
  kitchenStations: any[];
  activeTickets: any[];
  inventory: any;
  financials: any;
  enabledTools: string[];
}): Promise<{ success: boolean; result: any }> {
  const {
    role,
    provider,
    model,
    apiKey,
    systemPrompt,
    currentTick,
    inventory,
    financials,
    activeTickets,
    customersInQueue,
    seatedCustomers,
    enabledTools
  } = body;

  if (!apiKey) {
    throw new Error(`缺少 ${provider} API Key，請在 Multi-Agent 視窗中填入金鑰。`);
  }

  const contextPayload = {
    tick: currentTick,
    role,
    cashBalance: financials?.balance ?? 500,
    inventoryLevels: Object.fromEntries(
      Object.entries(inventory || {}).map(([k, v]: [string, any]) => [k, v.currentStock])
    ),
    queueCount: customersInQueue?.length || 0,
    seatedCount: seatedCustomers?.length || 0,
    activeTickets: (activeTickets || []).map((t: any) => ({
      id: t.id,
      recipe: t.recipeName,
      status: t.status,
      note: t.customNote
    })),
    enabledTools
  };

  const promptText = `
${systemPrompt}

CURRENT RESTAURANT STATE (TICK ${currentTick}):
${JSON.stringify(contextPayload, null, 2)}

INSTRUCTIONS:
You are role-playing as the AI Agent "${role}".
Based on your role and rules, determine your next action, observation, reasoning, and any tool you want to invoke.
Output strict JSON with format:
{
  "thought": "Your internal chain-of-thought reasoning",
  "toolCall": {
    "name": "one of enabledTools",
    "params": {}
  },
  "messageToTeam": "Optional message to post to other agents"
}
`;

  let rawResponseText = '';

  if (provider === 'gemini') {
    let targetModel = model || 'gemini-2.5-flash';
    if (targetModel === 'gemini-2.0-flash' || targetModel === 'gemini-2.0-flash-exp') {
      targetModel = 'gemini-2.5-flash';
    }
    const candidateModels = Array.from(new Set([targetModel, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.5-pro']));
    let lastErrText = '';
    let success = false;

    for (const cand of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cand}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json'
            }
          })
        });
        if (res.ok) {
          const gemData = await res.json();
          rawResponseText = gemData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          success = true;
          break;
        } else {
          lastErrText = await res.text();
          if (res.status === 404) continue;
          break;
        }
      } catch (e: any) {
        lastErrText = e.message;
      }
    }
    if (!success) {
      throw new Error(`Gemini API 呼叫失敗: ${lastErrText}`);
    }
  } else {
    // OpenAI or DeepSeek
    const apiUrl =
      provider === 'deepseek'
        ? 'https://api.deepseek.com/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    let targetModel = model;
    if (!targetModel || targetModel === 'local-heuristic') {
      targetModel = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';
    }

    const payload: any = {
      model: targetModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText }
      ],
      temperature: 0.3
    };
    if (targetModel !== 'deepseek-reasoner') {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      let userFriendlyMsg = `${provider} API 呼叫失敗 (HTTP ${res.status}): ${errText}`;
      if (res.status === 401) {
        userFriendlyMsg = `API Key 認證失敗 (401)：請檢查您輸入的金鑰是否正確。`;
      } else if (res.status === 402) {
        userFriendlyMsg = `帳戶餘額不足 (402)：您的 ${provider} 帳戶已無可用額度，請檢查儲值餘額。`;
      } else if (res.status === 404) {
        userFriendlyMsg = `找不到指定模型 (404)："${targetModel}"。`;
      }
      throw new Error(userFriendlyMsg);
    }

    const data = await res.json();
    rawResponseText = data.choices?.[0]?.message?.content || '{}';
  }

  let cleaned = rawResponseText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  let parsed = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = rawResponseText.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      parsed = { rawText: rawResponseText };
    }
  }

  return { success: true, result: parsed };
}
