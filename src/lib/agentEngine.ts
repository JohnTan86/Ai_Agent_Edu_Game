import {
  Order,
  DeliveryRobot,
  AgentDispatchAction,
  ThoughtStep,
  DispatchCycleResult,
  GridCell,
  Hub,
  AgentConfig,
  CityWeather,
  Financials,
  InfrastructureAction
} from './types';
import { findPathAStar, findCityRoadPath, findNearestHub, manhattanDistance } from './pathfinding';
import { formatSimTimestamp } from './constants';
import { CITIES_DATA, getCitySectorStatus, isNodeOccupiedByHub } from './cityData';

/**
 * Parses user prompt guidelines for heuristic configuration in English and Chinese
 */
export interface PromptDirectives {
  prioritizeSLA: boolean;
  prioritizeRevenue: boolean;
  batteryThreshold: number;
  rechargeTarget: number;
  chainDeliveries: boolean;
  multiDropBatching: boolean;
  avoidTraffic: boolean;
  autoRecharge: boolean;
  autoBuildHub: boolean;
  autoUpgradeHub: boolean;
}

export function parsePromptDirectives(prompt: string): PromptDirectives {
  const p = prompt.toLowerCase();

  // Extract battery safety threshold if mentioned e.g. "battery < 30%" or "电量低于 25%"
  let batteryThreshold = 25;
  const batteryMatch = p.match(/(?:battery|charge|电池|电量)[^\d<]*[<＜≤\s]*(\d{1,2})%/);
  if (batteryMatch && batteryMatch[1]) {
    const val = parseInt(batteryMatch[1], 10);
    if (val >= 10 && val <= 70) {
      batteryThreshold = val;
    }
  }

  // Detect chained deliveries / continuous dispatch / low idle instructions
  const chainDeliveries =
    p.includes('chain') ||
    p.includes('continuous') ||
    p.includes('consecutive') ||
    p.includes('multi-drop') ||
    p.includes('immediate') ||
    p.includes('next order') ||
    p.includes('proceed to next') ||
    p.includes('proceed to next order') ||
    p.includes('quicky') || // Common typo for quickly
    p.includes('quickly') ||
    p.includes('reduce idle') ||
    p.includes('reduce the idle') ||
    p.includes('idle time') ||
    p.includes('low idle') ||
    p.includes('no return') ||
    p.includes("don't return") ||
    p.includes('keep delivering') ||
    p.includes('fast turnaround') ||
    p.includes('zero idle') ||
    p.includes('zero-idle') ||
    p.includes('连环') ||
    p.includes('连续') ||
    p.includes('连续派送') ||
    p.includes('连续接单') ||
    p.includes('接力') ||
    p.includes('立即接单') ||
    p.includes('直接接单') ||
    p.includes('不回充') ||
    p.includes('无需回充') ||
    p.includes('就近接单') ||
    p.includes('减少空闲') ||
    p.includes('降低空闲') ||
    p.includes('迅速');

  // Extract recharge target if mentioned e.g. "charge to 50%" or "充至 60%" or "充到 50%"
  // If user explicitly asks for low idle time / chained dispatch, quick turnaround threshold is 40% instead of 75%
  let rechargeTarget = chainDeliveries ? 40 : 75;
  const targetMatch = p.match(/(?:charge to|reach|reaches|recharge to|充至|达到|充到|充上)[^\d]*(\d{1,2})%/);
  if (targetMatch && targetMatch[1]) {
    const val = parseInt(targetMatch[1], 10);
    if (val >= 20 && val <= 100) {
      rechargeTarget = val;
    }
  }

  return {
    prioritizeSLA:
      p.includes('sla') ||
      p.includes('deadline') ||
      p.includes('urgent') ||
      p.includes('on-time') ||
      p.includes('时效') ||
      p.includes('准时') ||
      p.includes('紧急') ||
      p.includes('截止'),
    prioritizeRevenue:
      p.includes('revenue') ||
      p.includes('reward') ||
      p.includes('profit') ||
      p.includes('high-paying') ||
      p.includes('运费') ||
      p.includes('报酬') ||
      p.includes('收益') ||
      p.includes('利润'),
    batteryThreshold,
    rechargeTarget,
    chainDeliveries,
    multiDropBatching:
      p.includes('multi-drop') ||
      p.includes('multidrop') ||
      p.includes('batch') ||
      p.includes('multi-parcel') ||
      p.includes('carry 2') ||
      p.includes('carry multiple') ||
      p.includes('concurrent') ||
      p.includes('heavy hauler') ||
      p.includes('一车多单') ||
      p.includes('多单') ||
      p.includes('拼单') ||
      p.includes('双单') ||
      p.includes('重载') ||
      p.includes('同时装载'),
    avoidTraffic:
      p.includes('traffic') ||
      p.includes('jam') ||
      p.includes('congestion') ||
      p.includes('detour') ||
      p.includes('交通') ||
      p.includes('拥堵') ||
      p.includes('堵车') ||
      p.includes('绕行'),
    autoRecharge:
      p.includes('recharge') ||
      p.includes('charging') ||
      p.includes('charge hub') ||
      p.includes('return') ||
      p.includes('回充') ||
      p.includes('充电') ||
      p.includes('返航'),
    autoBuildHub:
      p.includes('build hub') ||
      p.includes('construct hub') ||
      p.includes('new hub') ||
      p.includes('expand hub') ||
      p.includes('建站') ||
      p.includes('新建站点') ||
      p.includes('设立网点') ||
      p.includes('增设站点') ||
      p.includes('扩建站点'),
    autoUpgradeHub:
      p.includes('upgrade hub') ||
      p.includes('upgrade station') ||
      p.includes('升级站点') ||
      p.includes('升级机位') ||
      p.includes('快充') ||
      p.includes('超级快充')
  };
}

/**
 * Main Agent Dispatch Cycle Runner: Supports both Real LLM APIs (Gemini/OpenAI/DeepSeek)
 * and the Zero-Latency Local Mock Engine with Bilingual Thought Logs.
 */
export async function runAgentDispatchCycle(
  config: AgentConfig,
  currentTick: number,
  orders: Order[],
  robots: DeliveryRobot[],
  grid: GridCell[][],
  hubs: Hub[],
  environment?: {
    weather?: CityWeather;
    rushHourActive?: boolean;
    roadClosureNodeId?: string;
    financials?: Financials;
  }
): Promise<DispatchCycleResult> {
  const startTime = performance.now();
  const trace: ThoughtStep[] = [];
  const actions: AgentDispatchAction[] = [];
  const infrastructureActions: InfrastructureAction[] = [];

  // Detect language of prompt
  const isZh = /[\u4e00-\u9fa5]/.test(config.systemPrompt);

  const addTrace = (
    type: ThoughtStep['type'],
    content: string,
    payload?: any
  ) => {
    trace.push({
      id: `step-${currentTick}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content,
      payload
    });
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const directives = parsePromptDirectives(config.systemPrompt);

  const activeCity = Object.values(CITIES_DATA).find(c => {
    if (robots[0]?.position.lat && Math.abs(robots[0].position.lat - c.center[0]) < 0.3) return true;
    return false;
  }) || CITIES_DATA.singapore;

  // Environmental Observation Log
  if (environment?.weather && environment.weather !== 'clear') {
    addTrace(
      'observe',
      isZh
        ? `【城市气象感知】实时气象为：${environment.weather === 'typhoon' ? '⚡ 暴风台风 (能耗大幅提升+75%, 配送享有高额风险津贴+25%)' : '🌧️ 热带暴雨 (路面湿滑，能耗消耗+35%)'}。`
        : `[WEATHER SENSING] Active condition: ${environment.weather.toUpperCase()} (battery consumption elevated).`
    );
  }
  if (environment?.rushHourActive) {
    addTrace(
      'observe',
      isZh
        ? '【晚高峰拥堵预警】城市主干线进入晚高峰严重拥堵状态，关键路段延误最高达 4.2x！'
        : '[RUSH HOUR PEAK] Downtown main corridors are experiencing peak congestion (delays up to 4.2x).'
    );
  }
  if (environment?.roadClosureNodeId) {
    const closedNode = activeCity.roadNodes.find(n => n.id === environment.roadClosureNodeId);
    addTrace(
      'observe',
      isZh
        ? `【突发路障避让】检测到 ${closedNode ? closedNode.nameZh : environment.roadClosureNodeId} 发生道路封闭，调度引擎将自动绕行！`
        : `[ROAD HAZARD] Intersection ${closedNode ? closedNode.name : environment.roadClosureNodeId} closed! Automatic detour routing active.`
    );
  }

  // -------------------------------------------------------------
  // BRANCH A: REAL LIVE LLM ENGINE (Gemini / OpenAI / DeepSeek)
  // -------------------------------------------------------------
  if (config.provider && config.provider !== 'mock') {
    addTrace(
      'observe',
      isZh
        ? `正在连接至在线大模型服务商 [${config.provider.toUpperCase()} // ${config.model}]，发送系统提示词与车队实时遥测...`
        : `Connecting to Live LLM API Provider [${config.provider.toUpperCase()} // ${config.model}]. Sending prompt and telemetry...`
    );

    try {
      const trafficHotspots: Array<{ x: number; y: number; multiplier: number }> = [];
      for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
          if (grid[x][y].trafficMultiplier > 1.5) {
            trafficHotspots.push({ x, y, multiplier: grid[x][y].trafficMultiplier });
          }
        }
      }

      const requestPayload = {
        provider: config.provider,
        model: config.model,
        apiKey: config.apiKey,
        systemPrompt: config.systemPrompt,
        currentTick,
        orders: orders.map(o => ({
          id: o.id,
          sender: o.sender,
          recipientAddress: o.recipientAddress,
          deadlineTick: o.deadlineTick,
          reward: o.reward,
          weightKg: o.weightKg,
          status: o.status,
          pickupHubId: o.pickupHubId
        })),
        robots: robots.map(r => ({
          id: r.id,
          name: r.name,
          archetype: r.archetype || 'standard',
          maxOrdersCapacity: r.maxOrdersCapacity || (r.archetype === 'heavy' ? 2 : 1),
          carriedOrderIds: r.carriedOrderIds || [],
          position: r.position,
          batteryPct: r.batteryPct,
          maxCapacityKg: r.maxCapacityKg,
          currentPayloadKg: r.currentPayloadKg,
          status: r.status,
          homeHubId: r.homeHubId
        })),
        financials: environment?.financials,
        candidateNodes: getCitySectorStatus(activeCity, hubs).availableBuildNodes.map(n => ({
          id: n.id,
          name: n.name,
          nameZh: n.nameZh,
          sector: n.sector || 1,
          lat: n.lat,
          lng: n.lng
        })),
        hubs: hubs.map(h => ({
          id: h.id,
          name: h.name,
          level: h.level || 1,
          chargingBays: h.chargingBays || 2,
          chargingRatePerTick: h.chargingRatePerTick || (h.level === 3 ? 14 : (h.level === 2 ? 9 : 6)),
          position: h.position
        })),
        trafficHotspots: trafficHotspots.slice(0, 10),
        enabledTools: config.enabledTools,
        environment: {
          weather: environment?.weather,
          rushHourActive: environment?.rushHourActive,
          roadClosureNodeId: environment?.roadClosureNodeId
        }
      };

      let data: any = null;
      try {
        const res = await fetch('/api/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload)
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || `HTTP error ${res.status}`);
          }
        } else {
          // Static hosting (e.g. cPanel static deployment without Node server): execute direct client-side LLM request
          data = await executeDirectClientLLMDispatch(requestPayload);
        }
      } catch (fetchErr: any) {
        if (data && data.error) {
          throw fetchErr;
        }
        // Fallback to direct client-side LLM call if /api/dispatch route is unreachable on static host
        data = await executeDirectClientLLMDispatch(requestPayload);
      }

      // Log Live LLM Thought Process
      addTrace(
        'reasoning',
        isZh
          ? `[${config.provider.toUpperCase()} 思考推理]: ${data.thoughtProcess}`
          : `[${config.provider.toUpperCase()} REASONING]: ${data.thoughtProcess}`
      );

      // Log Live LLM Tool Calls
      if (Array.isArray(data.toolCalls)) {
        data.toolCalls.forEach((tc: any) => {
          addTrace(
            'tool_call',
            `CALL ${tc.tool || 'inspect'}() -> ${tc.rationale || (isZh ? '评估车队实时状态' : 'Evaluating fleet state')}`
          );
        });
      }

      // Parse Live LLM Infrastructure Actions (Autonomous Hub Construction & Upgrades)
      if (Array.isArray(data.infrastructureActions)) {
        for (const infra of data.infrastructureActions) {
          if (infra.action === 'build_hub') {
            const availNodes = getCitySectorStatus(activeCity, hubs).availableBuildNodes;
            const targetNode = availNodes.find(n =>
              n.id === infra.nodeId ||
              n.name.toLowerCase().includes(String(infra.nodeId || '').toLowerCase()) ||
              n.nameZh.includes(String(infra.nodeId || ''))
            ) || availNodes[0];

            if (targetNode) {
              const newHubName = isZh ? `${targetNode.nameZh}中心站` : `${targetNode.name} Depot`;
              infrastructureActions.push({
                action: 'build_hub',
                nodeId: targetNode.id,
                hubName: newHubName,
                lat: targetNode.lat,
                lng: targetNode.lng,
                reasoning: infra.reasoning
              });
              addTrace(
                'tool_call',
                isZh
                  ? `CALL build_charging_hub(node="${targetNode.nameZh}") -> 决策建设新枢纽网点：${infra.reasoning || '扩大全城配送辐射圈'}`
                  : `CALL build_charging_hub(node="${targetNode.name}") -> ${infra.reasoning || 'Network expansion'}`
              );
            }
          } else if (infra.action === 'upgrade_hub') {
            const targetHub = hubs.find(h => h.id === infra.hubId) || hubs[0];
            if (targetHub) {
              const targetLevel = infra.targetLevel === 3 ? 3 : 2;
              infrastructureActions.push({
                action: 'upgrade_hub',
                hubId: targetHub.id,
                targetLevel,
                reasoning: infra.reasoning
              });
              addTrace(
                'tool_call',
                isZh
                  ? `CALL upgrade_charging_hub(hub="${targetHub.name}", level=${targetLevel}) -> 决策升级站点机位：${infra.reasoning || '提升车队充能速度'}`
                  : `CALL upgrade_charging_hub(hub="${targetHub.name}", level=${targetLevel}) -> ${infra.reasoning || 'Boost fleet charging rate'}`
              );
            }
          }
        }
      }

      console.log('[AGENT_ENGINE] Received dispatchActions from API:', JSON.stringify(data.dispatchActions, null, 2));

      // Process Live LLM Dispatch Actions (Supporting Upfront Sequential Multi-Order Itineraries)
      const assignedOrderIds = new Set<string>();
      const robotProjectedPos = new Map<string, { x: number; y: number; lat?: number; lng?: number }>();
      const robotActionCounts = new Map<string, number>();

      const matchOrder = (rawId: any) => {
        const str = String(rawId || '').trim().toLowerCase();
        if (!str) return undefined;

        // 1. Exact match (case insensitive) e.g. "l1-ord-01" === "l1-ord-01"
        let found = pendingOrders.find(o => !assignedOrderIds.has(o.id) && o.id.toLowerCase() === str);
        if (found) return found;

        // 2. Exact match ignoring hyphens/underscores/spaces e.g. "l1ord01" === "l1ord01"
        const cleanStr = str.replace(/[-_\s]/g, '');
        found = pendingOrders.find(o => !assignedOrderIds.has(o.id) && o.id.toLowerCase().replace(/[-_\s]/g, '') === cleanStr);
        if (found) return found;

        // 3. Substring match if full order ID is contained in raw text
        found = pendingOrders.find(o => !assignedOrderIds.has(o.id) && str.includes(o.id.toLowerCase()));
        if (found) return found;

        // 4. Single/Last Number extraction: Match ONLY the order sequence number (e.g. 1 in L1-ORD-01, 2 in L1-ORD-02)
        // CRITICAL: Do NOT loop through strNums matching "1" from "L1", as that falsely matched Order 01 for Order 02 & 03!
        const strNums = (str.match(/\d+/g) || []).map(Number);
        if (strNums.length > 0) {
          const strLastNum = strNums[strNums.length - 1]; // e.g. 2 for "L1-ORD-02", "Order 2", "102"
          found = pendingOrders.find(o => {
            if (assignedOrderIds.has(o.id)) return false;
            const oNums = (o.id.match(/\d+/g) || []).map(Number);
            const oLastNum = oNums[oNums.length - 1]; // 1 for L1-ORD-01, 2 for L1-ORD-02, 3 for L1-ORD-03
            if (strLastNum === oLastNum) return true;
            if (strLastNum % 100 === oLastNum) return true; // e.g. 102 % 100 === 2
            return false;
          });
          if (found) return found;
        }

        // 5. Sender / Zone keyword matching
        found = pendingOrders.find(o => !assignedOrderIds.has(o.id) && (
          (o.sender && (str.includes(o.sender.toLowerCase()) || o.sender.toLowerCase().includes(str))) ||
          (o.recipientAddress.zone && (str.includes(o.recipientAddress.zone.toLowerCase()) || o.recipientAddress.zone.toLowerCase().includes(str)))
        ));
        if (found) return found;

        return undefined;
      };

      const matchRobot = (rawId: any) => {
        const str = String(rawId || '').trim().toLowerCase();
        // 1. Exact ID
        let found = robots.find(r => r.id.toLowerCase() === str);
        if (found) return found;

        // 2. Exact Name
        found = robots.find(r => r.name.toLowerCase() === str);
        if (found) return found;

        // 3. Substring / Suffix (e.g. "bot-01" matches "singapore-bot-01")
        found = robots.find(r => r.id.toLowerCase().includes(str) || str.includes(r.id.toLowerCase()) || r.name.toLowerCase().includes(str));
        if (found) return found;

        // 4. Fallback to active idle robot
        return robots.find(r => r.status === 'idle') || robots[0];
      };

      if (Array.isArray(data.dispatchActions)) {
        // Sort actions to honor student SLA priority protocol if directive is active
        const sortedActions = [...data.dispatchActions];
        if (directives.prioritizeSLA) {
          sortedActions.sort((a, b) => {
            const ordA = matchOrder(a.orderId);
            const ordB = matchOrder(b.orderId);
            if (ordA && ordB) return ordA.deadlineTick - ordB.deadlineTick;
            return 0;
          });
        }

        for (const act of sortedActions) {
          const order = matchOrder(act.orderId);
          const bot = matchRobot(act.assignedRobotId);

          if (order && bot && !assignedOrderIds.has(order.id)) {
            assignedOrderIds.add(order.id);
            const count = robotActionCounts.get(bot.id) || 0;
            robotActionCounts.set(bot.id, count + 1);

            const pickupHub = hubs.find(h => h.id === order.pickupHubId) || hubs[0];
            const startPos = robotProjectedPos.get(bot.id) || bot.position;

            const pathOpts = {
              avoidHighTraffic: directives.avoidTraffic,
              closedNodeId: environment?.roadClosureNodeId,
              isRushHour: environment?.rushHourActive
            };

            const isAtHub = (startPos.lat !== undefined && pickupHub.position.lat !== undefined &&
              Math.abs(startPos.lat - pickupHub.position.lat) < 0.0005 &&
              Math.abs((startPos.lng || 0) - (pickupHub.position.lng || 0)) < 0.0005) ||
              (startPos.x === pickupHub.position.x && startPos.y === pickupHub.position.y);

            const pathToHub = isAtHub
              ? [startPos]
              : (startPos.lat && pickupHub.position.lat
                  ? findCityRoadPath(startPos, pickupHub.position, activeCity, pathOpts)
                  : findPathAStar(startPos, pickupHub.position, grid, { avoidHighTraffic: directives.avoidTraffic }));

            const pathToRecipient = pickupHub.position.lat && order.recipientAddress.lat
              ? findCityRoadPath(pickupHub.position, order.recipientAddress, activeCity, pathOpts)
              : findPathAStar(pickupHub.position, order.recipientAddress, grid, { avoidHighTraffic: directives.avoidTraffic });

            const fullRoute = [
              ...pathToHub,
              ...(pathToRecipient.length > 1 ? pathToRecipient.slice(1) : pathToRecipient)
            ];

            actions.push({
              orderId: order.id,
              assignedRobotId: bot.id,
              routeWaypoints: fullRoute,
              priorityReasoning: act.priorityReasoning || (isZh
                ? `在线大模型为订单 #${order.id} 规划派送路线（第 ${count + 1} 序位行动）`
                : `Live LLM planned route for Order #${order.id} (Sequence leg #${count + 1})`)
            });

            // Update projected position to this customer's dropoff point
            robotProjectedPos.set(bot.id, {
              x: order.recipientAddress.x,
              y: order.recipientAddress.y,
              lat: order.recipientAddress.lat,
              lng: order.recipientAddress.lng
            });

            addTrace(
              'tool_call',
              count === 0
                ? `EXECUTE assign_route(order="#${order.id}", bot="${bot.name}"): ${act.priorityReasoning || 'Immediate execution'}`
                : `QUEUE_MISSION schedule_next(order="#${order.id}", bot="${bot.name}", leg=${count + 1}): ${act.priorityReasoning || 'Zero-idle continuous leg'}`
            );
          }
        }
      }

      // GUARANTEE: If any pending orders were omitted by the LLM response, sequentially chain them!
      const remainingUnassigned = pendingOrders.filter(o => !assignedOrderIds.has(o.id));
      if (remainingUnassigned.length > 0) {
        // Sort remaining orders by SLA urgency to preserve protocol
        remainingUnassigned.sort((a, b) => a.deadlineTick - b.deadlineTick);
        const primaryBot = robots.find(r => r.status === 'idle') || robots[0];
        for (const order of remainingUnassigned) {
          assignedOrderIds.add(order.id);
          const count = robotActionCounts.get(primaryBot.id) || 0;
          robotActionCounts.set(primaryBot.id, count + 1);

          const pickupHub = hubs.find(h => h.id === order.pickupHubId) || hubs[0];
          const startPos = robotProjectedPos.get(primaryBot.id) || primaryBot.position;

          const pathOpts = {
            avoidHighTraffic: directives.avoidTraffic,
            closedNodeId: environment?.roadClosureNodeId,
            isRushHour: environment?.rushHourActive
          };

          const isAtHub = (startPos.lat !== undefined && pickupHub.position.lat !== undefined &&
            Math.abs(startPos.lat - pickupHub.position.lat) < 0.0005 &&
            Math.abs((startPos.lng || 0) - (pickupHub.position.lng || 0)) < 0.0005) ||
            (startPos.x === pickupHub.position.x && startPos.y === pickupHub.position.y);

          const pathToHub = isAtHub
            ? [startPos]
            : (startPos.lat && pickupHub.position.lat
                ? findCityRoadPath(startPos, pickupHub.position, activeCity, pathOpts)
                : findPathAStar(startPos, pickupHub.position, grid, { avoidHighTraffic: directives.avoidTraffic }));

          const pathToRecipient = pickupHub.position.lat && order.recipientAddress.lat
            ? findCityRoadPath(pickupHub.position, order.recipientAddress, activeCity, pathOpts)
            : findPathAStar(pickupHub.position, order.recipientAddress, grid, { avoidHighTraffic: directives.avoidTraffic });

          const fullRoute = [
            ...pathToHub,
            ...(pathToRecipient.length > 1 ? pathToRecipient.slice(1) : pathToRecipient)
          ];

          actions.push({
            orderId: order.id,
            assignedRobotId: primaryBot.id,
            routeWaypoints: fullRoute,
            priorityReasoning: isZh
              ? `【全量保障】自动补全未排程订单 #${order.id} 至 ${primaryBot.name}（第 ${count + 1} 序位行动）`
              : `[AUTO-CHAIN] Sequentially queued remaining pending Order #${order.id} to ${primaryBot.name} (Leg #${count + 1})`
          });

          robotProjectedPos.set(primaryBot.id, {
            x: order.recipientAddress.x,
            y: order.recipientAddress.y,
            lat: order.recipientAddress.lat,
            lng: order.recipientAddress.lng
          });

          addTrace(
            'tool_call',
            `QUEUE_MISSION schedule_next(order="#${order.id}", bot="${primaryBot.name}", leg=${count + 1}): Automated complete itinerary chain`
          );
        }
      }

      console.log('[AGENT_ENGINE] Final actions produced:', JSON.stringify(actions.map(a => ({
        orderId: a.orderId,
        bot: a.assignedRobotId,
        wpCount: a.routeWaypoints.length,
        firstWp: a.routeWaypoints[0],
        lastWp: a.routeWaypoints[a.routeWaypoints.length - 1]
      })), null, 2));

      addTrace(
        'dispatch_plan',
        isZh
          ? `在线大模型派单执行完成。生成 ${actions.length} 项派单行动。消耗 Token: ${data.tokensUsed || 350}。`
          : `Live LLM dispatch complete. Assigned ${actions.length} action(s). Tokens consumed: ${data.tokensUsed || 350}.`,
        actions
      );

      const endTime = performance.now();
      return {
        cycleId: `cycle-${currentTick}-${Date.now().toString(36)}`,
        tick: currentTick,
        ordersEvaluated: pendingOrders.length,
        robotsEvaluated: robots.length,
        actions,
        infrastructureActions,
        reasoningTrace: trace,
        tokensUsed: data.tokensUsed || 350,
        executionTimeMs: Math.round(endTime - startTime)
      };
    } catch (apiError: any) {
      addTrace(
        'error',
        isZh
          ? `大模型 API 调用提示: ${apiError.message}。自动平滑切换至本地模拟启发式引擎，确保游戏不中断。`
          : `Live LLM API Warning: ${apiError.message}. Seamlessly falling back to Local Heuristic Engine to prevent downtime.`
      );
    }
  }

  // -------------------------------------------------------------
  // BRANCH B: LOCAL MOCK HEURISTIC ENGINE (Instant / Zero-Cost)
  // -------------------------------------------------------------
  addTrace(
    'observe',
    isZh
      ? `本地智能体模拟引擎已激活。正在解析系统提示词决策策略...`
      : `Local Mock Agent Engine active. Parsing System Prompt directives...`
  );

  addTrace(
    'reasoning',
    isZh
      ? `已提取生效指令: [SLA时效优先: ${directives.prioritizeSLA ? '是' : '否'}, ` +
        `运费收益优先: ${directives.prioritizeRevenue ? '是' : '否'}, ` +
        `最低电量红线: ${directives.batteryThreshold}%, ` +
        `拥堵避让: ${directives.avoidTraffic ? '已激活' : '已关闭'}, ` +
        `自主回充: ${directives.autoRecharge ? '已开启' : '已停用'}]`
      : `Active directives: [SLA-Priority: ${directives.prioritizeSLA ? 'YES' : 'NO'}, ` +
        `Revenue-Priority: ${directives.prioritizeRevenue ? 'YES' : 'NO'}, ` +
        `Min-Battery Safeguard: ${directives.batteryThreshold}%, ` +
        `Traffic Avoidance: ${directives.avoidTraffic ? 'ACTIVE' : 'OFF'}, ` +
        `Auto-Recharge: ${directives.autoRecharge ? 'ENABLED' : 'DISABLED'}]`
  );

  // 2. Tool Invocation: Check Robot Telemetry
  if (config.enabledTools.includes('check_robot_telemetry')) {
    addTrace(
      'tool_call',
      isZh
        ? `CALL check_robot_telemetry() -> 查询 ${robots.length} 台车队单元的实时电量、载重与运行状态。`
        : `CALL check_robot_telemetry() -> Querying operational status of ${robots.length} fleet units.`
    );

    const idleRobots = robots.filter(r => r.status === 'idle');
    const lowBatteryRobots = robots.filter(r => r.batteryPct < directives.batteryThreshold);

    addTrace(
      'tool_result',
      isZh
        ? `遥测返回：${idleRobots.length} 台空闲机器人，${lowBatteryRobots.length} 台低于电量安全阈值 (${directives.batteryThreshold}%)。`
        : `Telemetry returned: ${idleRobots.length} idle robots, ${lowBatteryRobots.length} below safety battery threshold (${directives.batteryThreshold}%).`,
      {
        totalRobots: robots.length,
        idleCount: idleRobots.length,
        idleIds: idleRobots.map(r => `${r.name} (${r.batteryPct.toFixed(0)}%)`)
      }
    );
  }

  // 3. Tool Invocation: Query Traffic
  if (config.enabledTools.includes('get_traffic_conditions')) {
    addTrace(
      'tool_call',
      isZh
        ? `CALL get_traffic_conditions() -> 正在扫描全城交通热力数据与拥堵路段...`
        : `CALL get_traffic_conditions() -> Scanning grid for congestion hotspots...`
    );

    const corridorSummary = activeCity.trafficCorridors
      .map(c => `${isZh ? c.nameZh : c.name} (${c.speedKmh}km/h, ${c.multiplier}x)`)
      .join('; ');

    addTrace(
      'tool_result',
      isZh
        ? `全城实时交通扫描完成：[${corridorSummary}]。决策策略：${directives.avoidTraffic ? '启用智能绕行' : '直达路线'}。`
        : `Live city traffic scan complete: [${corridorSummary}]. Strategy: ${directives.avoidTraffic ? 'Enabled detours' : 'Direct path'}.`
    );
  }

  // 4. Autonomous Battery Management (Auto-Recharge)
  const availableRobots = robots.filter(r => r.status === 'idle');
  const assignedRobotIds = new Set<string>();

  if (directives.autoRecharge && config.enabledTools.includes('order_battery_recharge')) {
    for (const bot of availableRobots) {
      if (bot.batteryPct < directives.batteryThreshold) {
        const nearestHub = findNearestHub(bot.position, hubs);
        if (nearestHub) {
          addTrace(
            'tool_call',
            isZh
              ? `CALL order_battery_recharge(robotId="${bot.id}", hub="${nearestHub.name}") -> 触发低电量安全保护协议 (${bot.batteryPct.toFixed(1)}% < ${directives.batteryThreshold}%)。`
              : `CALL order_battery_recharge(robotId="${bot.id}", hub="${nearestHub.name}") -> Low battery safeguard triggered (${bot.batteryPct.toFixed(1)}% < ${directives.batteryThreshold}%).`
          );

          const chargePath = bot.position.lat && nearestHub.position.lat
            ? findCityRoadPath(bot.position, nearestHub.position, activeCity, { avoidHighTraffic: directives.avoidTraffic })
            : findPathAStar(bot.position, nearestHub.position, grid, { avoidHighTraffic: directives.avoidTraffic });

          assignedRobotIds.add(bot.id);
          bot.status = 'moving';
          bot.targetDestination = {
            x: nearestHub.position.x,
            y: nearestHub.position.y,
            lat: nearestHub.position.lat,
            lng: nearestHub.position.lng,
            label: isZh ? `回充 @ ${nearestHub.name}` : `Charge @ ${nearestHub.name}`
          };
          bot.pathQueue = chargePath.slice(1);
        }
      }
    }
  }

  // 5. Evaluate Infrastructure & Pending Orders
  const currentBalance = environment?.financials?.balance ?? 350;
  if (directives.autoBuildHub && currentBalance >= 280) {
    const candidateNode = getCitySectorStatus(activeCity, hubs).availableBuildNodes[0];
    if (candidateNode && !infrastructureActions.some(i => i.action === 'build_hub')) {
      const newHubName = isZh ? `${candidateNode.nameZh}中心站` : `${candidateNode.name} Depot`;
      infrastructureActions.push({
        action: 'build_hub',
        nodeId: candidateNode.id,
        hubName: newHubName,
        lat: candidateNode.lat,
        lng: candidateNode.lng,
        reasoning: isZh ? `财库资金达标 ($${currentBalance.toFixed(0)} >= $280)，执行自然语言建站指令` : 'Sufficient capital for autonomous network expansion'
      });
      addTrace(
        'tool_call',
        isZh
          ? `CALL build_charging_hub(node="${candidateNode.nameZh}") -> 执行自主建站战略：资金充沛，新建 ${newHubName}！`
          : `CALL build_charging_hub(node="${candidateNode.name}") -> Executing autonomous expansion directive!`
      );
    }
  }
  if (directives.autoUpgradeHub && currentBalance >= 160) {
    const upgradableHub = hubs.find(h => (h.level || 1) < 2);
    if (upgradableHub && !infrastructureActions.some(i => i.action === 'upgrade_hub')) {
      infrastructureActions.push({
        action: 'upgrade_hub',
        hubId: upgradableHub.id,
        targetLevel: 2,
        reasoning: isZh ? `执行快充升级指令，将 ${upgradableHub.name} 升级至 Lv.2 双机位快充` : 'Upgrading hub to Level 2 dual-bay fast charge'
      });
      addTrace(
        'tool_call',
        isZh
          ? `CALL upgrade_charging_hub(hub="${upgradableHub.name}", level=2) -> 执行自主升级指令：升级至双机位快充！`
          : `CALL upgrade_charging_hub(hub="${upgradableHub.name}", level=2) -> Upgrading to dual-bay fast charge!`
      );
    }
  }

  addTrace(
    'observe',
    isZh
      ? `正在评估订单池中待分配的 ${pendingOrders.length} 个客户包裹。`
      : `Evaluating ${pendingOrders.length} pending orders waiting in queue.`
  );

  if (pendingOrders.length === 0) {
    addTrace(
      'reasoning',
      isZh
        ? '当前无等待分配的包裹订单。车队维持就绪巡航状态。'
        : 'No orders currently pending dispatch. Fleet remaining in active standby.'
    );
  } else {
    const scoredOrders = pendingOrders.map(order => {
      const remainingTicks = order.deadlineTick - currentTick;

      let score = 100;
      if (directives.prioritizeSLA) {
        score += Math.max(0, 500 - remainingTicks) * 10;
      }
      if (directives.prioritizeRevenue) {
        score += order.reward * 1.5;
      }
      score -= order.weightKg * 1.0;

      return {
        order,
        remainingTicks,
        score
      };
    });

    scoredOrders.sort((a, b) => {
      if (directives.prioritizeSLA && a.remainingTicks !== b.remainingTicks) {
        return a.remainingTicks - b.remainingTicks; // Earliest deadline strictly first
      }
      return b.score - a.score;
    });

    addTrace(
      'reasoning',
      isZh
        ? `依据 SLA 紧急度与运费特征完成派单队列排序。首选候选订单：#${scoredOrders[0].order.id}（剩余 ${scoredOrders[0].remainingTicks} 周期，运费 $${scoredOrders[0].order.reward}）。`
        : `Prioritized dispatch queue based on SLA urgency and reward profile. Top candidate: Order #${scoredOrders[0].order.id} (Urgency: ${scoredOrders[0].remainingTicks} ticks remaining, Reward: $${scoredOrders[0].order.reward}).`
    );

    // 6. Match Orders with Qualified Available Robots (Supporting Sequential Itinerary Planning)
    const robotProjectedPosMock = new Map<string, { x: number; y: number; lat?: number; lng?: number }>();
    const robotProjectedBatteryMock = new Map<string, number>();
    const robotActionCountsMock = new Map<string, number>();

    robots.forEach(r => {
      robotProjectedPosMock.set(r.id, r.position);
      robotProjectedBatteryMock.set(r.id, r.batteryPct);
      robotActionCountsMock.set(r.id, 0);
    });

    const hasMeaningfulPrompt = config.systemPrompt.trim().length >= 10 ||
      directives.prioritizeSLA ||
      directives.prioritizeRevenue ||
      directives.avoidTraffic ||
      directives.autoRecharge ||
      directives.chainDeliveries ||
      directives.autoBuildHub;

    for (const item of scoredOrders) {
      const { order, remainingTicks } = item;

      // Pedagogical Safeguard: If the student hasn't written any prompt directives,
      // only dispatch 1 single starter parcel so the student sees the robot move,
      // then pause dispatch and prompt the student to write their own instructions!
      if (!hasMeaningfulPrompt) {
        const totalCompleted = robots.reduce((acc, r) => acc + (r.totalDeliveriesCompleted || 0), 0);
        if (actions.length >= 1 || totalCompleted >= 1) {
          addTrace(
            'observe',
            isZh
              ? `💡【导师提示】检测到系统提示词（System Prompt）中尚未编写明确调度规则。智能体在完成初次演示后已在站点待命。请在左侧编辑器中补充派单策略（例如设置时效排序或电量回充阈值），然后再次点击【执行调度】继续通关！`
              : `💡 [TUTOR GUIDANCE] No explicit prompt directives detected. The agent completed initial trial delivery and is waiting at hub. Add your dispatch rules in the editor and click [EXECUTE DISPATCH] to continue!`
          );
          break;
        }
      }

      // Candidate selection: First priority = idle robots with 0 assignments
      let candidateBots = robots.filter(
        r => r.status === 'idle' &&
             (robotActionCountsMock.get(r.id) || 0) === 0 &&
             (robotProjectedBatteryMock.get(r.id) || r.batteryPct) >= (directives.batteryThreshold - 5) &&
             r.maxCapacityKg >= order.weightKg
      );

      // If no completely unassigned bot, check for chained sequential assignment
      if (candidateBots.length === 0) {
        candidateBots = robots.filter(
          r => r.status === 'idle' &&
               (robotActionCountsMock.get(r.id) || 0) < 4 &&
               (robotProjectedBatteryMock.get(r.id) || r.batteryPct) >= directives.batteryThreshold &&
               r.maxCapacityKg >= order.weightKg
        );
      }

      if (candidateBots.length === 0) {
        addTrace(
          'reasoning',
          isZh
            ? `订单 #${order.id} 暂缓派发：暂无满足载重 (${order.weightKg}kg) 且电量达标的机器人。`
            : `Order #${order.id} deferred: No qualified robot available meeting payload (${order.weightKg}kg) and battery requirements.`
        );
        continue;
      }

      const pickupHub = hubs.find(h => h.id === order.pickupHubId) || hubs[0];
      candidateBots.sort((a, b) => {
        const countA = robotActionCountsMock.get(a.id) || 0;
        const countB = robotActionCountsMock.get(b.id) || 0;
        if (countA !== countB) return countA - countB;
        const distA = manhattanDistance(robotProjectedPosMock.get(a.id) || a.position, pickupHub.position);
        const distB = manhattanDistance(robotProjectedPosMock.get(b.id) || b.position, pickupHub.position);
        return distA - distB;
      });

      const selectedBot = candidateBots[0];
      const count = robotActionCountsMock.get(selectedBot.id) || 0;
      robotActionCountsMock.set(selectedBot.id, count + 1);

      const startPos = robotProjectedPosMock.get(selectedBot.id) || selectedBot.position;

      const pathOpts = {
        avoidHighTraffic: directives.avoidTraffic,
        closedNodeId: environment?.roadClosureNodeId,
        isRushHour: environment?.rushHourActive
      };

      const isAtHub = (startPos.lat !== undefined && pickupHub.position.lat !== undefined &&
        Math.abs(startPos.lat - pickupHub.position.lat) < 0.0005 &&
        Math.abs((startPos.lng || 0) - (pickupHub.position.lng || 0)) < 0.0005) ||
        (startPos.x === pickupHub.position.x && startPos.y === pickupHub.position.y);

      const pathToHub = isAtHub
        ? [startPos]
        : (startPos.lat && pickupHub.position.lat
            ? findCityRoadPath(startPos, pickupHub.position, activeCity, pathOpts)
            : findPathAStar(startPos, pickupHub.position, grid, { avoidHighTraffic: directives.avoidTraffic }));

      const pathToRecipient = pickupHub.position.lat && order.recipientAddress.lat
        ? findCityRoadPath(pickupHub.position, order.recipientAddress, activeCity, pathOpts)
        : findPathAStar(pickupHub.position, order.recipientAddress, grid, { avoidHighTraffic: directives.avoidTraffic });

      const fullRoute = [
        ...pathToHub,
        ...(pathToRecipient.length > 1 ? pathToRecipient.slice(1) : pathToRecipient)
      ];

      const estTicks = Math.ceil(fullRoute.length / selectedBot.speed);
      const isExpectedOnTime = (currentTick + estTicks) <= order.deadlineTick;

      const reasoning = isZh
        ? `分配 ${selectedBot.name} (第 ${count + 1} 序位行动, 预计用时: ${estTicks} 周期 vs SLA 剩余: ${remainingTicks} 周期)。` +
          `从 ${pickupHub.name} 取件 -> 配送至 ${order.recipientAddress.zone}。`
        : `Assigned ${selectedBot.name} (Leg #${count + 1}, Est. ETA: ${estTicks} ticks vs. SLA: ${remainingTicks} ticks). ` +
          `Pickup at ${pickupHub.name} -> Dropoff in ${order.recipientAddress.zone}.`;

      actions.push({
        orderId: order.id,
        assignedRobotId: selectedBot.id,
        routeWaypoints: fullRoute,
        priorityReasoning: reasoning
      });

      robotProjectedPosMock.set(selectedBot.id, {
        x: order.recipientAddress.x,
        y: order.recipientAddress.y,
        lat: order.recipientAddress.lat,
        lng: order.recipientAddress.lng
      });
      const currentProjBat = robotProjectedBatteryMock.get(selectedBot.id) || selectedBot.batteryPct;
      robotProjectedBatteryMock.set(selectedBot.id, Math.max(0, currentProjBat - fullRoute.length * 0.9));

      addTrace(
        'tool_call',
        count === 0
          ? `CALL assign_route(orderId="${order.id}", robotId="${selectedBot.id}") -> ${fullRoute.length} steps. ${reasoning}`
          : `QUEUE_MISSION schedule_next(orderId="${order.id}", robotId="${selectedBot.id}", leg=${count + 1}) -> ${fullRoute.length} steps. ${reasoning}`
      );

      // Check for multi-drop batching (Heavy Hauler or Cargo Expanded upgrade)
      const maxBatch = selectedBot.maxOrdersCapacity || (selectedBot.archetype === 'heavy' ? 2 : 1);
      if (maxBatch > 1) {
        const remainingCapacityKg = selectedBot.maxCapacityKg - order.weightKg;
        const secondCandidate = scoredOrders.find(
          item2 => item2.order.id !== order.id &&
                   !actions.some(a => a.orderId === item2.order.id) &&
                   item2.order.pickupHubId === pickupHub.id &&
                   item2.order.weightKg <= remainingCapacityKg
        );

        if (secondCandidate) {
          const secondOrder = secondCandidate.order;
          // Plan route: order.recipientAddress -> secondOrder.recipientAddress
          const pathDrop1ToDrop2 = order.recipientAddress.lat && secondOrder.recipientAddress.lat
            ? findCityRoadPath(order.recipientAddress, secondOrder.recipientAddress, activeCity, pathOpts)
            : [];

          const multiRoute = [
            ...fullRoute,
            ...(pathDrop1ToDrop2.length > 1 ? pathDrop1ToDrop2.slice(1) : pathDrop1ToDrop2)
          ];

          // Register second order dispatch action
          actions.push({
            orderId: secondOrder.id,
            assignedRobotId: selectedBot.id,
            routeWaypoints: multiRoute,
            priorityReasoning: isZh
              ? `【一车双单优化】${selectedBot.name} (重载) 顺路合并携带订单 #${secondOrder.id}，同车连环派送！`
              : `[MULTI-DROP BATCH] ${selectedBot.name} loaded second parcel #${secondOrder.id} simultaneously!`
          });

          addTrace(
            'tool_call',
            isZh
              ? `一车多单合并执行：${selectedBot.name} (重载猛犸) 同时装载订单 #${order.id} 与 #${secondOrder.id}！大幅削减往返空驶里程。`
              : `Multi-Drop Consolidated: ${selectedBot.name} loaded Order #${order.id} & #${secondOrder.id} simultaneously!`
          );
        }
      }
    }
  }

  // 7. Output Final Structured JSON Dispatch Plan
  addTrace(
    'dispatch_plan',
    isZh
      ? `结构化派单方案生成完毕，包含 ${actions.length} 项派单行动。本轮调度周期结束。`
      : `Generated structured dispatch plan with ${actions.length} action assignments. Dispatch cycle complete.`,
    actions
  );

  const endTime = performance.now();
  const promptTokens = Math.round(config.systemPrompt.length / 3.8);
  const telemetryTokens = Math.round((orders.length * 28) + (robots.length * 32));
  const outputTokens = Math.round(actions.length * 45) + 35;
  const totalTokens = promptTokens + telemetryTokens + outputTokens;

  return {
    cycleId: `cycle-${currentTick}-${Date.now().toString(36)}`,
    tick: currentTick,
    ordersEvaluated: pendingOrders.length,
    robotsEvaluated: robots.length,
    actions,
    infrastructureActions,
    reasoningTrace: trace,
    tokensUsed: totalTokens,
    executionTimeMs: Math.round(endTime - startTime)
  };
}

/**
 * Direct Client-Side LLM Dispatch Executor for Static Hosting (cPanel / Static Export)
 */
async function executeDirectClientLLMDispatch(body: any): Promise<any> {
  const {
    provider = 'gemini',
    model,
    apiKey,
    systemPrompt,
    currentTick,
    orders = [],
    robots = [],
    hubs = [],
    trafficHotspots = [],
    enabledTools = []
  } = body;

  if (!apiKey) {
    throw new Error(`Missing API Key for provider "${provider}". Please enter your API Key in the Agent Workspace.`);
  }

  const pendingOrders = orders.filter((o: any) => o.status === 'pending');

  const promptContext = `
SIMULATION TICK: ${currentTick}

COMPANY CASH RESERVES: $${Number(body.financials?.balance ?? 200).toFixed(2)}

CITY LOGISTICS HUBS (Pickup points & charging infrastructure):
${JSON.stringify(
  (hubs || []).map((h: any) => ({
    id: h.id,
    name: h.name,
    level: h.level || 1,
    chargingBays: h.chargingBays || 2,
    chargingRatePerTick: h.chargingRatePerTick || (h.level === 3 ? 14 : (h.level === 2 ? 9 : 6)),
    position: h.position
  })),
  null,
  2
)}

CANDIDATE BUILD NODES FOR NEW HUBS (Corridors where new hubs can be constructed):
${JSON.stringify(body.candidateNodes || [], null, 2)}

CURRENT PENDING ORDERS:
${JSON.stringify(
  pendingOrders.map((o: any) => ({
    id: o.id,
    sender: o.sender,
    pickupHubId: o.pickupHubId,
    recipient: o.recipientAddress,
    deadlineTick: o.deadlineTick,
    remainingTicks: o.deadlineTick - currentTick,
    reward: o.reward,
    weightKg: o.weightKg
  })),
  null,
  2
)}

FLEET TELEMETRY:
${JSON.stringify(
  robots.map((r: any) => ({
    id: r.id,
    name: r.name,
    archetype: r.archetype || 'standard',
    maxOrdersCapacity: r.maxOrdersCapacity || (r.archetype === 'heavy' ? 2 : 1),
    carriedOrderIds: r.carriedOrderIds || [],
    status: r.status,
    position: r.position,
    batteryPct: Math.round(r.batteryPct),
    maxCapacityKg: r.maxCapacityKg,
    currentPayloadKg: r.currentPayloadKg,
    homeHubId: r.homeHubId
  })),
  null,
  2
)}

CONGESTED TRAFFIC ZONES:
${JSON.stringify(trafficHotspots || [], null, 2)}

ENVIRONMENTAL CONDITIONS:
- Weather: ${(body.environment?.weather || 'clear').toUpperCase()} (Rain: +35% battery drain; Typhoon: +75% battery drain, +25% hazard reward)
- Rush Hour Peak Congestion: ${body.environment?.rushHourActive ? 'ACTIVE (up to 4.2x travel delay on major avenues)' : 'OFF (normal traffic flow)'}
- Active Road Closures: ${body.environment?.roadClosureNodeId ? `Node "${body.environment.roadClosureNodeId}" is CLOSED for emergency roadworks` : 'None (all roads open)'}

ENABLED TOOLS:
${JSON.stringify(enabledTools || [], null, 2)}

INSTRUCTIONS & SEQUENTIAL PLANNING PROTOCOL:
You are the Autonomous Fleet Dispatcher. Follow the User's System Prompt protocol strictly.
1. Plan the ENTIRE delivery itinerary upfront for ALL pending orders across available robots in dispatchActions.
2. Use the exact order IDs from CURRENT PENDING ORDERS and exact robot IDs from FLEET TELEMETRY.
3. Respond with ONLY a valid JSON object matching this schema:
{
  "thoughtProcess": "Step-by-step reasoning explaining your triage strategy, battery checks, infrastructure actions, and order prioritization.",
  "toolCalls": [
    { "tool": "check_robot_telemetry", "rationale": "Evaluated fleet telemetry and hubs" }
  ],
  "infrastructureActions": [],
  "dispatchActions": [
    {
      "orderId": "string",
      "assignedRobotId": "string",
      "priorityReasoning": "Detailed justification"
    }
  ]
}
`.trim();

  let rawResponseText = '';
  let tokensUsed = 0;

  if (provider === 'gemini') {
    let requestedModel = model || 'gemini-2.5-flash';
    if (requestedModel === 'gemini-2.0-flash' || requestedModel === 'gemini-2.0-flash-exp') {
      requestedModel = 'gemini-2.5-flash';
    }
    if (requestedModel === 'gemini-1.5-flash-latest') {
      requestedModel = 'gemini-1.5-flash';
    }

    const candidateModels = Array.from(new Set([
      requestedModel,
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-pro'
    ]));

    let lastError: Error | null = null;
    let successfulData: any = null;

    for (const candModel of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${candModel}:generateContent?key=${apiKey}`;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: promptContext }] }],
            generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
          })
        });

        if (res.ok) {
          successfulData = await res.json();
          break;
        } else {
          const errText = await res.text();
          lastError = new Error(`Gemini API Error (${res.status}): ${errText}`);
          if (res.status === 404) {
            continue;
          } else {
            throw lastError;
          }
        }
      } catch (err: any) {
        lastError = err;
        if (err.message && err.message.includes('(404)')) {
          continue;
        }
        throw err;
      }
    }

    if (!successfulData) {
      throw lastError || new Error('Gemini API Error: all model candidates unavailable');
    }

    rawResponseText = successfulData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    tokensUsed = (successfulData?.usageMetadata?.promptTokenCount || 0) + (successfulData?.usageMetadata?.candidatesTokenCount || 0);
  } else if (provider === 'openai') {
    const targetModel = model || 'gpt-4o-mini';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptContext }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
    }
    const data = await res.json();
    rawResponseText = data?.choices?.[0]?.message?.content || '{}';
    tokensUsed = data?.usage?.total_tokens || 0;
  } else if (provider === 'deepseek') {
    const targetModel = model || 'deepseek-chat';
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptContext }
        ],
        temperature: 0.2
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DeepSeek API Error (${res.status}): ${errText}`);
    }
    const data = await res.json();
    rawResponseText = data?.choices?.[0]?.message?.content || '{}';
    tokensUsed = data?.usage?.total_tokens || 0;
  }

  let parsedData: any = {};
  let cleaned = rawResponseText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  try {
    parsedData = JSON.parse(cleaned);
  } catch {
    const match = rawResponseText.match(/\{[\s\S]*\}/);
    if (match) {
      parsedData = JSON.parse(match[0]);
    } else {
      throw new Error('LLM output could not be parsed into valid JSON');
    }
  }

  if (!tokensUsed) {
    tokensUsed = Math.round((systemPrompt.length + promptContext.length + rawResponseText.length) / 3.8);
  }

  return {
    success: true,
    provider,
    model,
    rawResponseText,
    thoughtProcess: parsedData.thoughtProcess || 'Dispatch actions computed successfully.',
    toolCalls: parsedData.toolCalls || [],
    infrastructureActions: Array.isArray(parsedData.infrastructureActions) ? parsedData.infrastructureActions : [],
    dispatchActions: Array.isArray(parsedData.dispatchActions) ? parsedData.dispatchActions : [],
    tokensUsed
  };
}
