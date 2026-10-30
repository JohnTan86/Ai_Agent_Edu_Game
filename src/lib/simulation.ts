import {
  SimulationState,
  DeliveryRobot,
  Order,
  Financials,
  TelemetryMetrics,
  AgentDispatchAction,
  ThoughtStep,
  GameScenario,
  SimulationStatus,
  LevelProgression,
  Position,
  CityWeather
} from './types';
import { COSTS, ROBOT_PARAMS, TICKS_PER_DAY, formatSimTimestamp } from './constants';
import { createEmptyGrid, applyTrafficHotspots, DEFAULT_SCENARIOS } from './defaultScenarios';
import { CITIES_DATA, getCitySectorStatus } from './cityData';
import { findNearestHub, findCityRoadPath, findPathAStar } from './pathfinding';
import { parsePromptDirectives } from './agentEngine';

/**
 * Initializes a new simulation state from a chosen scenario and real-world city
 */
export function initializeSimulationState(
  scenario: GameScenario = DEFAULT_SCENARIOS[0],
  cityId: string = 'singapore',
  level: 1 | 2 | 3 = 1
): SimulationState {
  const city = CITIES_DATA[cityId] || CITIES_DATA.singapore;
  const grid = createEmptyGrid(scenario.gridSize.width, scenario.gridSize.height);
  applyTrafficHotspots(grid, scenario.trafficHotspots);

  // Level 1: Exactly 1 Central Hub, 1 Robot, and 3 Delivery orders within 10 km
  const primaryHub = { ...city.hubs[0], level: 1, chargingRatePerTick: 6.0 };
  const initialHubs = level === 1 ? [primaryHub] : city.hubs.map(h => ({ ...h, level: 1, chargingRatePerTick: 6.0 }));

  const defaultBotName = city.id === 'singapore'
    ? 'MerlionRover-01'
    : (city.id === 'tokyo' ? 'ShibuyaRunner-01' : 'EmpireRover-01');

  const initialRobots: DeliveryRobot[] = level === 1
    ? [
        {
          id: `${city.id}-bot-01`,
          name: defaultBotName,
          position: { ...primaryHub.position },
          batteryPct: 100,
          maxCapacityKg: 10,
          currentPayloadKg: 0,
          speed: 1,
          costPerTick: 0.15,
          status: 'idle',
          homeHubId: primaryHub.id,
          pathQueue: [],
          totalDistanceTraveled: 0,
          totalDeliveriesCompleted: 0,
          color: '#06b6d4',
          archetype: 'standard',
          carriedOrderIds: []
        }
      ]
    : city.initialRobots.map(r => ({
        ...r,
        pathQueue: [...r.pathQueue],
        archetype: 'standard' as const,
        carriedOrderIds: []
      }));

  // All daily orders are known at 08:00 AM before the shift starts, and must be delivered before 06:00 PM (18:00, tick 100)
  const initialOrders: Order[] = level === 1
    ? city.initialOrders
        .filter(o => o.pickupHubId === primaryHub.id)
        .concat(city.initialOrders)
        .slice(0, 3)
        .map((o, idx) => ({
          ...o,
          id: `L1-ORD-0${idx + 1}`,
          pickupHubId: primaryHub.id,
          reward: 50 + idx * 10, // $50, $60, $70 -> potential: $180
          deadlineTick: 65 + idx * 15, // Due at 14:30, 16:00, 17:30 (all before 18:00 closing!)
          status: 'pending' as const
        }))
    : (level === 2
        ? city.initialOrders.slice(0, 8).map((o, idx) => ({
            ...o,
            id: `L2-ORD-${idx + 101}`,
            status: 'pending' as const,
            reward: 65 + (idx % 4) * 15,
            deadlineTick: Math.min(TICKS_PER_DAY, 55 + idx * 6)
          }))
        : Array.from({ length: 8 }, (_, idx) => {
            const baseOrder = city.initialOrders[idx % city.initialOrders.length];
            const sectorStatus = getCitySectorStatus(city, initialHubs);
            const activeSectorNodes = sectorStatus.unlockedNodes.length > 0 ? sectorStatus.unlockedNodes : city.roadNodes.filter(n => (n.sector || 1) <= 1);
            const randomNode = activeSectorNodes[(idx * 3 + 1) % activeSectorNodes.length];
            const assignedHub = initialHubs[idx % initialHubs.length] || primaryHub;
            return {
              ...baseOrder,
              id: `D1-ORD-${idx + 201}`,
              status: 'pending' as const,
              sender: `${city.name} Express #${idx + 10}`,
              recipientAddress: {
                x: Math.round(randomNode.lat * 100) % 18,
                y: Math.round(randomNode.lng * 100) % 18,
                lat: randomNode.lat,
                lng: randomNode.lng,
                zone: randomNode.name
              },
              reward: 85 + (idx % 5) * 20,
              deadlineTick: Math.min(TICKS_PER_DAY, 55 + idx * 6),
              pickupHubId: assignedHub.id,
              weightKg: +((idx % 4) * 2.5 + 2).toFixed(1)
            };
          })
      );

  // Set hub cells on grid
  initialHubs.forEach(hub => {
    if (grid[hub.position.x] && grid[hub.position.x][hub.position.y]) {
      grid[hub.position.x][hub.position.y].type = 'hub';
      grid[hub.position.x][hub.position.y].hubId = hub.id;
      grid[hub.position.x][hub.position.y].label = hub.name;
    }
  });

  const initialFinancials: Financials = {
    balance: level === 1 ? 100 : (level === 2 ? 260 : 600), // Progressive seed capital
    totalRevenue: 0,
    totalExpenses: 0,
    energyCosts: 0,
    mileageCosts: 0,
    maintenanceCosts: 0,
    hubRentCosts: 0,
    slaPenalties: 0
  };

  const initialMetrics: TelemetryMetrics = {
    totalOrdersSpawned: initialOrders.length,
    totalDelivered: 0,
    totalFailed: 0,
    inTransitCount: 0,
    pendingCount: initialOrders.filter(o => o.status === 'pending').length,
    onTimeDeliveryRate: 100,
    profitMargin: 0,
    averageDeliveryTicks: 0,
    totalTokensConsumed: 0,
    totalTravelTicks: 0,
    agentEfficiencyScore: 0,
    fleetUtilizationRate: 0
  };

  const welcomeLog: ThoughtStep = {
    id: 'welcome-log',
    type: 'observe',
    timestamp: 'D1 08:00',
    tick: 0,
    content: level === 1
      ? (city.id === 'singapore'
          ? '🌅【第 1 天 08:00 AM 开工前备战】今日全部 3 笔待送订单已显示在清单与地图上！请在左侧编写 System Prompt 并点击「执行调度」让 LLM 做好全天规划，随后点击下方「开始仿真」在 18:00 收工前送完所有包裹！'
          : '🌅 [DAY 1 • 08:00 AM PRE-SHIFT BRIEFING] All 3 daily orders are loaded! Write your System Prompt and click [EXECUTE DISPATCH] so the LLM plans your routes upfront, then press [SIMULATE] to deliver everything before 06:00 PM (18:00)!')
      : (level === 2
          ? '🌅【Level 2 • 08:00 AM 开工前备战】今日 8 笔同城订单已全部列出！开工前可先在科技商店购置新车或让 LLM 规划全天一车多单路线，按下「开始仿真」后须在 18:00 下班前全部送达！'
          : `🌅 [LEVEL 3 • DAY 1 • 08:00 AM] Today's metropolitan order manifest is ready! Use pre-shift planning to let your LLM orchestrate the entire day's routes before starting the 08:00 AM - 06:00 PM clock!`)
  };

  const levelProgression: LevelProgression = {
    currentLevel: level,
    levelDeliveriesCompleted: 0,
    levelTargetDeliveries: level === 1 ? 3 : (level === 2 ? 8 : 12),
    levelTargetCash: level === 1 ? 180 : (level === 2 ? 500 : 1000),
    isLevelUpModalOpen: false,
    unlockedFeatures: {
      robotShop: level >= 2,
      hubUpgrades: level >= 2,
      hubConstruction: level >= 2,
      multiOrderCarrying: level >= 2,
      cityDomination: level >= 3
    }
  };

  return {
    scenario,
    status: 'idle',
    tick: 0,
    speed: 1,
    financials: initialFinancials,
    metrics: initialMetrics,
    grid,
    hubs: initialHubs,
    robots: initialRobots,
    orders: initialOrders,
    activeActions: [],
    thoughtLogs: [welcomeLog],
    showTrafficHeatmap: true,
    language: 'en',
    showReportModal: false,
    currentCityId: city.id,
    mapStyle: 'dark',
    weather: 'clear',
    weatherDurationTicks: 35,
    rushHourActive: false,
    rushHourDurationTicks: 0,
    roadClosureNodeId: undefined,
    roadClosureDurationTicks: 0,
    levelProgression,
    currentDay: 1,
    dayTick: 0,
    isShiftEnded: false
  };
}

/**
 * Transitions the simulation to 08:00 AM of the next day (Day N+1) with a full pre-shift manifest of orders
 * and recharged robots stationed at their home hubs.
 */
export function startNextDayShift(state: SimulationState): SimulationState {
  const nextDay = (state.currentDay || 1) + 1;
  const dayStartTick = (nextDay - 1) * TICKS_PER_DAY;
  const dayEndTick = dayStartTick + TICKS_PER_DAY;
  const isZh = state.language === 'zh';
  const city = CITIES_DATA[state.currentCityId] || CITIES_DATA.singapore;
  const lvl = state.levelProgression?.currentLevel || 1;

  // Return all robots to their home hub at 100% battery for 08:00 AM start
  const readyRobots: DeliveryRobot[] = state.robots.map(bot => {
    const homeHub = state.hubs.find(h => h.id === bot.homeHubId) || state.hubs[0];
    return {
      ...bot,
      position: homeHub ? { ...homeHub.position } : { ...bot.position },
      batteryPct: 100,
      currentPayloadKg: 0,
      status: 'idle',
      currentOrderId: undefined,
      carriedOrderIds: [],
      missionQueue: [],
      pathQueue: [],
      targetDestination: undefined
    };
  });

  // Determine how many orders to generate for today's shift (all visible at 08:00 AM across unlocked sectors!)
  const sectorStatus = getCitySectorStatus(city, state.hubs);
  const activeSectorNodes = sectorStatus.unlockedNodes.length > 0 ? sectorStatus.unlockedNodes : city.roadNodes;
  const dailyOrderCount = lvl === 1 ? 3 : (lvl === 2 ? 6 : Math.min(12, 5 + readyRobots.length + sectorStatus.unlockedSector));
  const newDailyOrders: Order[] = Array.from({ length: dailyOrderCount }, (_, idx) => {
    const randomNode = activeSectorNodes[(nextDay * 3 + idx * 2) % activeSectorNodes.length];
    const assignedHub = state.hubs[(nextDay + idx) % state.hubs.length] || state.hubs[0];
    const reward = (lvl === 1 ? 55 : (lvl === 2 ? 70 : 85)) + (idx % 4) * 15;
    // SLA deadline is within today's 08:00 - 18:00 shift (tick dayStartTick + 55 .. dayEndTick)
    const deadlineOffset = Math.min(TICKS_PER_DAY, 55 + Math.floor((idx / Math.max(1, dailyOrderCount - 1)) * 45));
    return {
      id: `D${nextDay}-ORD-${idx + 101}`,
      sender: `${city.name} Express #${(nextDay * 10 + idx) % 89 + 10}`,
      recipientAddress: {
        x: Math.round(randomNode.lat * 100) % 18,
        y: Math.round(randomNode.lng * 100) % 18,
        lat: randomNode.lat,
        lng: randomNode.lng,
        zone: isZh ? randomNode.nameZh : randomNode.name
      },
      deadlineTick: dayStartTick + deadlineOffset,
      reward,
      weightKg: +((idx % 4) * 2.0 + 2.0).toFixed(1),
      status: 'pending' as const,
      createdAtTick: dayStartTick,
      pickupHubId: assignedHub.id
    };
  });

  const keptHistory = state.orders.filter(o => o.status === 'delivered' || o.status === 'failed');
  const combinedOrders = [...newDailyOrders, ...keptHistory];

  const morningLog: ThoughtStep = {
    id: `day-${nextDay}-start-${Date.now()}`,
    type: 'observe',
    timestamp: `D${nextDay} 08:00`,
    tick: dayStartTick,
    content: isZh
      ? `🌅【第 ${nextDay} 天 • 早上 08:00 开工前备战】全车队已满电就位，今日共有 ${dailyOrderCount} 笔待送包裹已全部公布！请先点击左下角「执行调度」让 LLM 规划今日全套派送路线，再点击「开始仿真」正式计时（18:00 收工）！`
      : `🌅 [DAY ${nextDay} • 08:00 AM PRE-SHIFT BRIEFING] All rovers charged to 100%. Today's ${dailyOrderCount} orders are now visible! Click [EXECUTE DISPATCH] to let your LLM plan the day's routes upfront, then press [SIMULATE] to start the 08:00 AM – 06:00 PM clock!`
  };

  return {
    ...state,
    status: 'idle',
    tick: dayStartTick,
    currentDay: nextDay,
    dayTick: 0,
    isShiftEnded: false,
    weather: 'clear',
    weatherDurationTicks: 30,
    rushHourActive: false,
    rushHourDurationTicks: 0,
    roadClosureNodeId: undefined,
    roadClosureDurationTicks: 0,
    robots: readyRobots,
    orders: combinedOrders,
    activeActions: [],
    metrics: {
      ...state.metrics,
      totalOrdersSpawned: combinedOrders.length,
      pendingCount: newDailyOrders.length,
      inTransitCount: 0
    },
    thoughtLogs: [morningLog, ...state.thoughtLogs].slice(0, 100)
  };
}

/**
 * Applies structured agent dispatch actions to robots and orders in simulation
 */
export function applyDispatchActionsToState(
  state: SimulationState,
  actions: AgentDispatchAction[] = []
): SimulationState {
  if (!Array.isArray(actions) || actions.length === 0) return state;
  console.log('[SIMULATION] applyDispatchActionsToState called with actions:', actions.map(a => a?.orderId).filter(Boolean));
  const nextRobots = state.robots.map(r => ({
    ...r,
    pathQueue: [...r.pathQueue],
    missionQueue: r.missionQueue ? [...r.missionQueue] : [],
    carriedOrderIds: r.carriedOrderIds ? [...r.carriedOrderIds] : []
  }));
  const nextOrders = state.orders.map(o => ({ ...o }));

  actions.forEach(action => {
    const robot = nextRobots.find(r => r.id === action.assignedRobotId);
    const order = nextOrders.find(o => o.id === action.orderId);

    if (robot && order && order.status === 'pending') {
      const maxOrders = robot.maxOrdersCapacity || (robot.archetype === 'heavy' ? 2 : 1);
      const carried = robot.carriedOrderIds || [];
      const hasCargoSlot = carried.length < maxOrders;
      const fitsWeight = (robot.currentPayloadKg + order.weightKg) <= robot.maxCapacityKg;

      const isCurrentlyIdleOrStarting = (robot.status === 'idle' || robot.status === 'charging') && (!robot.currentOrderId);

      if (isCurrentlyIdleOrStarting) {
        // Immediate active leg: first parcel loaded
        robot.carriedOrderIds = [...carried, order.id];
        robot.currentOrderId = order.id;
        robot.currentPayloadKg += order.weightKg;

        order.status = 'in_transit';
        order.assignedRobotId = robot.id;

        robot.targetDestination = {
          x: order.recipientAddress.x,
          y: order.recipientAddress.y,
          lat: order.recipientAddress.lat,
          lng: order.recipientAddress.lng,
          label: `Order #${order.id} (${order.recipientAddress.zone})`
        };

        if (action.routeWaypoints && action.routeWaypoints.length > 0) {
          // Skip current robot location if first waypoint matches current position
          const isSamePos = action.routeWaypoints.length > 0 && (
            (action.routeWaypoints[0].lat !== undefined && robot.position.lat !== undefined &&
             Math.abs(action.routeWaypoints[0].lat - robot.position.lat) < 0.0002 &&
             Math.abs((action.routeWaypoints[0].lng || 0) - (robot.position.lng || 0)) < 0.0002) ||
            (action.routeWaypoints[0].x === robot.position.x && action.routeWaypoints[0].y === robot.position.y)
          );
          const waypoints = isSamePos ? action.routeWaypoints.slice(1) : action.routeWaypoints;
          robot.pathQueue = waypoints;
          robot.status = 'delivering';
        }
      } else if (hasCargoSlot && fitsWeight && (robot.status === 'delivering' || robot.status === 'idle') && (!robot.missionQueue || robot.missionQueue.length === 0)) {
        // MULTI-DROP BATCH: Multi-capacity robot (e.g. Heavy Hauler / Cargo Expansion)
        // Concurrently batch loads secondary parcel at hub for sequential single-trip dropoffs!
        robot.carriedOrderIds = [...carried, order.id];
        robot.currentPayloadKg += order.weightKg;
        order.status = 'in_transit';
        order.assignedRobotId = robot.id;
        console.log(`[SIMULATION] Multi-drop batch loaded order #${order.id} onto ${robot.name}. Total in cargo bay:`, robot.carriedOrderIds);
      } else {
        // Sequential Mission Queue: Enqueued for continuous zero-idle execution
        const mission = {
          orderId: order.id,
          pickupHubId: order.pickupHubId,
          routeWaypoints: action.routeWaypoints,
          targetDestination: {
            x: order.recipientAddress.x,
            y: order.recipientAddress.y,
            lat: order.recipientAddress.lat,
            lng: order.recipientAddress.lng,
            label: `Order #${order.id} (${order.recipientAddress.zone})`
          },
          priorityReasoning: action.priorityReasoning
        };

        robot.missionQueue = [...(robot.missionQueue || []), mission];
        order.status = 'in_transit';
        order.assignedRobotId = robot.id;
        console.log(`[SIMULATION] Enqueued mission for order ${order.id}. Current missionQueue:`, robot.missionQueue.map(m => m.orderId));
      }
    }
  });

  return {
    ...state,
    robots: nextRobots,
    orders: nextOrders,
    activeActions: [...actions, ...state.activeActions].slice(0, 20)
  };
}

/**
 * Safely launches the next scheduled mission from a robot's sequential mission queue
 */
function launchMissionFromQueue(
  bot: DeliveryRobot,
  orders: Order[],
  state: SimulationState,
  directives: ReturnType<typeof parsePromptDirectives>,
  currentTick: number,
  isZh: boolean,
  logs: ThoughtStep[]
): boolean {
  if (!bot.missionQueue || bot.missionQueue.length === 0) return false;

  const nextMission = bot.missionQueue.shift()!;
  const nextOrder = orders.find(o => o.id === nextMission.orderId);

  if (nextOrder) {
    nextOrder.status = 'in_transit';
    nextOrder.assignedRobotId = bot.id;
    bot.currentPayloadKg = nextOrder.weightKg;
  }

  bot.currentOrderId = nextMission.orderId;
  bot.carriedOrderIds = [nextMission.orderId];
  bot.status = 'delivering';
  bot.targetDestination = nextMission.targetDestination;

  const activeCity = Object.values(CITIES_DATA).find(c => {
    if (bot.position.lat && Math.abs(bot.position.lat - c.center[0]) < 0.3) return true;
    return false;
  }) || CITIES_DATA.singapore;

  const pickupHub = state.hubs.find(h => h.id === nextOrder?.pickupHubId) || state.hubs[0];

  const isAtHub = (bot.position.lat !== undefined && pickupHub.position.lat !== undefined &&
    Math.abs(bot.position.lat - pickupHub.position.lat) < 0.003 &&
    Math.abs((bot.position.lng || 0) - (pickupHub.position.lng || 0)) < 0.003) ||
    (bot.position.x === pickupHub.position.x && bot.position.y === pickupHub.position.y);

  let plannedWaypoints: Position[] = [];

  if (nextOrder?.recipientAddress.lat) {
    if (isAtHub) {
      plannedWaypoints = findCityRoadPath(bot.position, nextOrder.recipientAddress, activeCity, {
        avoidHighTraffic: directives.avoidTraffic,
        closedNodeId: state.roadClosureNodeId,
        isRushHour: state.rushHourActive
      });
    } else {
      const pathToHub = findCityRoadPath(bot.position, pickupHub.position, activeCity, {
        avoidHighTraffic: directives.avoidTraffic,
        closedNodeId: state.roadClosureNodeId,
        isRushHour: state.rushHourActive
      });
      const pathToRecipient = findCityRoadPath(pickupHub.position, nextOrder.recipientAddress, activeCity, {
        avoidHighTraffic: directives.avoidTraffic,
        closedNodeId: state.roadClosureNodeId,
        isRushHour: state.rushHourActive
      });
      plannedWaypoints = [
        ...pathToHub,
        ...(pathToRecipient.length > 1 ? pathToRecipient.slice(1) : pathToRecipient)
      ];
    }
  } else {
    plannedWaypoints = nextMission.routeWaypoints;
  }

  // Remove duplicate start waypoint if robot is already at that location
  if (
    plannedWaypoints.length > 0 &&
    bot.position.lat !== undefined &&
    plannedWaypoints[0].lat !== undefined &&
    Math.abs(bot.position.lat - plannedWaypoints[0].lat) < 0.0005 &&
    Math.abs((bot.position.lng || 0) - (plannedWaypoints[0].lng || 0)) < 0.0005
  ) {
    plannedWaypoints = plannedWaypoints.slice(1);
  }

  bot.pathQueue = plannedWaypoints;

  logs.unshift({
    id: `mission-launch-${currentTick}-${bot.id}-${nextMission.orderId}`,
    type: 'observe',
    timestamp: formatSimTimestamp(currentTick),
    tick: currentTick,
    content: isZh
      ? `【任务队列启程】${bot.name} 立即启程执行排程派单：订单 #${nextMission.orderId} (前往 ${nextOrder?.recipientAddress.zone || '客户地址'})！`
      : `[MISSION QUEUE DEPARTURE] ${bot.name} embarking on queued delivery: Order #${nextMission.orderId} -> ${nextOrder?.recipientAddress.zone || 'Destination'}!`
  });

  return true;
}

/**
 * Advances the simulation by exactly one discrete game tick
 */
export function advanceTick(state: SimulationState, systemPrompt?: string): SimulationState {
  if (state.status === 'game_over' || state.status === 'victory') {
    return state;
  }

  const currentTick = state.tick + 1;
  const isZh = state.language === 'zh';
  const financials = { ...state.financials };
  const logs = [...state.thoughtLogs];
  const directives = parsePromptDirectives(systemPrompt || '');

  const robots = state.robots.map(r => ({
    ...r,
    pathQueue: [...r.pathQueue],
    missionQueue: r.missionQueue ? [...r.missionQueue] : [],
    carriedOrderIds: r.carriedOrderIds ? [...r.carriedOrderIds] : []
  }));
  const orders = state.orders.map(o => ({ ...o }));

  // Orphaned Order Recovery: If an order was marked in_transit but is NOT active in any robot's cargo or missionQueue,
  // revert it to pending so it can be dispatched cleanly and never permanently lost/missed.
  orders.forEach(ord => {
    if (ord.status === 'in_transit') {
      const isHandled = robots.some(
        r => r.currentOrderId === ord.id ||
             (r.carriedOrderIds && r.carriedOrderIds.includes(ord.id)) ||
             (r.missionQueue && r.missionQueue.some(m => m.orderId === ord.id))
      );
      if (!isHandled) {
        ord.status = 'pending';
        ord.assignedRobotId = undefined;
      }
    }
  });

  let onTimeDeliveriesCount = 0;
  let activeMovingRobots = 0;

  // Collaborative Fleet Load Balancing:
  // If an idle robot with healthy battery (>= 25%) has no missions queued,
  // but another robot has multiple queued missions, transfer a mission to the idle robot so both work in parallel!
  for (const idleBot of robots) {
    if (idleBot.status === 'idle' && (!idleBot.missionQueue || idleBot.missionQueue.length === 0) && idleBot.batteryPct >= 25) {
      const queuedBot = robots.find(r => r.id !== idleBot.id && r.missionQueue && r.missionQueue.length > 0);
      if (queuedBot && queuedBot.missionQueue && queuedBot.missionQueue.length > 0) {
        const transferredMission = queuedBot.missionQueue.pop()!;
        idleBot.missionQueue = [transferredMission];
        launchMissionFromQueue(idleBot, orders, state, directives, currentTick, isZh, logs);
        logs.unshift({
          id: `fleet-balance-${currentTick}-${idleBot.id}`,
          type: 'observe',
          timestamp: formatSimTimestamp(currentTick),
          tick: currentTick,
          content: isZh
            ? `【双车协同·智能分流】检测到 ${idleBot.name} 处于空闲状态，自主从 ${queuedBot.name} 队列分担订单 #${transferredMission.orderId}，双车并发派送！`
            : `[FLEET LOAD BALANCE] ${idleBot.name} relieved ${queuedBot.name} by claiming queued Order #${transferredMission.orderId} for parallel execution!`
        });
      }
    }
  }

  // 1. Process Robots
  for (const bot of robots) {
    // Base maintenance fee per tick
    financials.maintenanceCosts += COSTS.PER_TICK_MAINTENANCE;
    financials.totalExpenses += COSTS.PER_TICK_MAINTENANCE;
    financials.balance -= COSTS.PER_TICK_MAINTENANCE;

    if (bot.status === 'charging') {
      // Recharging logic (uses hub level and robot archetype multipliers)
      const hubObj = state.hubs.find(h => h.id === bot.homeHubId) || state.hubs[0];
      const baseHubRate = hubObj?.chargingRatePerTick || (hubObj?.level === 3 ? 14 : (hubObj?.level === 2 ? 9 : 6));
      const botChargeMultiplier = bot.chargingRateMultiplier || (bot.archetype === 'speedy' ? 1.5 : (bot.archetype === 'heavy' ? 0.75 : 1.0));
      const rechargeAmount = Math.min(baseHubRate * botChargeMultiplier, 100 - bot.batteryPct);
      bot.batteryPct = Math.min(100, bot.batteryPct + rechargeAmount);

      const energyCost = rechargeAmount * COSTS.CHARGING_PER_PCT;
      financials.energyCosts += energyCost;
      financials.totalExpenses += energyCost;
      financials.balance -= energyCost;

      const hasPendingOrders = orders.some(o => o.status === 'pending');
      const undockThreshold = (directives.chainDeliveries || hasPendingOrders)
        ? Math.max(directives.batteryThreshold, 30)
        : directives.rechargeTarget;

      if (bot.batteryPct >= undockThreshold) {
        bot.status = 'idle';
        bot.targetDestination = undefined;
        if (bot.missionQueue && bot.missionQueue.length > 0) {
          launchMissionFromQueue(bot, orders, state, directives, currentTick, isZh, logs);
        } else {
          logs.unshift({
            id: `charge-done-${currentTick}-${bot.id}`,
            type: 'observe',
            timestamp: formatSimTimestamp(currentTick),
            tick: currentTick,
            content: isZh
              ? `【充能达标·即刻接单】${bot.name} 电量已达到出车阈值 (${bot.batteryPct.toFixed(0)}% >= ${undockThreshold}%)。有待发包裹等待，立即脱离机位出车！`
              : `[READY FOR DISPATCH] ${bot.name} reached dispatch battery (${bot.batteryPct.toFixed(0)}% >= ${undockThreshold}%). Orders pending, ready for immediate dispatch!`
          });
        }
      }
    } else if (bot.status === 'moving' || bot.status === 'delivering' || bot.status === 'returning') {
      activeMovingRobots++;

      // Speed advancement: speedy bots or turbo-upgraded bots take additional road steps
      const stepsToTake = (bot.speedMultiplier && bot.speedMultiplier > 1.2) || bot.upgrades?.turboMotors
        ? (currentTick % 2 === 0 ? 2 : 1)
        : 1;

      for (let s = 0; s < stepsToTake; s++) {
        if (bot.pathQueue.length > 0) {
          const nextPos = bot.pathQueue.shift()!;
          bot.position = {
            x: nextPos.x,
            y: nextPos.y,
            lat: nextPos.lat !== undefined ? nextPos.lat : bot.position.lat,
            lng: nextPos.lng !== undefined ? nextPos.lng : bot.position.lng
          };
          bot.totalDistanceTraveled += 1;

          // Mileage operational cost
          financials.mileageCosts += COSTS.PER_STEP_TRAVEL;
          financials.totalExpenses += COSTS.PER_STEP_TRAVEL;
          financials.balance -= COSTS.PER_STEP_TRAVEL;

          // Battery consumption (augmented by dynamic real-world weather, archetype, and upgrades)
          const baseDrain = ROBOT_PARAMS.BATTERY_DRAIN_PER_STEP + (bot.currentPayloadKg * ROBOT_PARAMS.BATTERY_PAYLOAD_FACTOR);
          const weatherMultiplier = state.weather === 'typhoon' ? 1.75 : (state.weather === 'rain' ? 1.35 : 1.0);
          const robotDrainMultiplier = bot.batteryDrainMultiplier || (bot.archetype === 'heavy' ? 0.65 : (bot.archetype === 'speedy' ? 1.25 : 1.0));
          const upgradeDrainDiscount = bot.upgrades?.solidStateBattery ? 0.7 : 1.0;
          const drain = baseDrain * weatherMultiplier * robotDrainMultiplier * upgradeDrainDiscount;
          bot.batteryPct = Math.max(0, bot.batteryPct - drain);

          // Check if robot touched or is passing through any charging hub -> Instant automated battery swap!
          const hubAtPos = state.hubs.find(h =>
            (h.position.lat && bot.position.lat &&
             Math.hypot(h.position.lat - bot.position.lat, (h.position.lng || 0) - (bot.position.lng || 0)) < 0.0012) ||
            (h.position.x === bot.position.x && h.position.y === bot.position.y)
          );
          if (hubAtPos && bot.batteryPct < 85) {
            bot.batteryPct = 100; // Hub battery swap bay restores to 100%
            logs.unshift({
              id: `hub-swap-${currentTick}-${bot.id}`,
              type: 'observe',
              timestamp: formatSimTimestamp(currentTick),
              tick: currentTick,
              content: isZh
                ? `【站点极速换电】${bot.name} 经停 [${hubAtPos.name}] 取件，已完成自动化电池极速更换，电量满血恢复 100%！`
                : `[HUB BATTERY SWAP] ${bot.name} touched down at [${hubAtPos.name}], battery swapped to 100%! Ready for next delivery.`
            });
          }

          // Check if battery depleted completely
          if (bot.batteryPct <= 0) {
            bot.status = 'idle';
            bot.batteryPct = 100; // Emergency roadside recovery recharges unit
            bot.pathQueue = [];
            financials.totalExpenses += COSTS.LOW_BATTERY_RECOVERY_FEE;
            financials.balance -= COSTS.LOW_BATTERY_RECOVERY_FEE;
            logs.unshift({
              id: `battery-depleted-${currentTick}-${bot.id}`,
              type: 'error',
              timestamp: formatSimTimestamp(currentTick),
              tick: currentTick,
              content: isZh
                ? `严重警告：${bot.name} 耗尽电量抛锚！已派遣应急道路救援现场充能至 100%（扣除救援费：-$${COSTS.LOW_BATTERY_RECOVERY_FEE}）。`
                : `CRITICAL: ${bot.name} ran out of battery! Roadside recovery dispatched and recharged to 100% (Fee: -$${COSTS.LOW_BATTERY_RECOVERY_FEE}).`
            });
            break;
          }
        }
      }

      // If robot broke down or is not in active motion, skip destination delivery check
      if (bot.status === 'idle') {
        continue;
      }

      // Check if robot reached destination
      if (bot.pathQueue.length === 0) {
        // A. Delivered package to recipient customer!
        const targetDeliveringId = bot.currentOrderId || (bot.carriedOrderIds && bot.carriedOrderIds.length > 0 ? bot.carriedOrderIds[0] : undefined);
        if (targetDeliveringId) {
          const order = orders.find(o => o.id === targetDeliveringId);
          if (order && order.status === 'in_transit') {
            bot.totalDeliveriesCompleted += 1;
            bot.currentPayloadKg = Math.max(0, bot.currentPayloadKg - order.weightKg);
            if (bot.carriedOrderIds) {
              bot.carriedOrderIds = bot.carriedOrderIds.filter(id => id !== targetDeliveringId);
            }
            bot.currentOrderId = undefined;

            const isDeliveredOnTime = currentTick <= order.deadlineTick;

            if (isDeliveredOnTime) {
              order.status = 'delivered';
              order.deliveredAtTick = currentTick;
              const hazardBonus = state.weather === 'typhoon' ? Math.round(order.reward * 0.25) : 0;
              const finalPayout = order.reward + hazardBonus;
              financials.totalRevenue += finalPayout;
              financials.balance += finalPayout;

              logs.unshift({
                id: `delivered-${currentTick}-${order.id}`,
                type: 'observe',
                timestamp: formatSimTimestamp(currentTick),
                tick: currentTick,
                content: isZh
                  ? `【配送成功】订单 #${order.id} 已由 ${bot.name} 准时送达客户！运费收益：+$${order.reward}${hazardBonus > 0 ? ` (含强台风恶劣天气津贴 +$${hazardBonus})` : ''}。`
                  : `[DELIVERY SUCCESS] Order #${order.id} delivered by ${bot.name} on time! Earned: +$${order.reward}${hazardBonus > 0 ? ` (includes +$${hazardBonus} typhoon hazard pay)` : ''}.`
              });
            } else {
              // SLA Breach delivery
              order.status = 'failed';
              order.failedReason = `Delivered late at tick ${currentTick} (SLA expired on tick ${order.deadlineTick})`;
              financials.slaPenalties += COSTS.SLA_BREACH_PENALTY;
              financials.totalExpenses += COSTS.SLA_BREACH_PENALTY;
              financials.balance -= COSTS.SLA_BREACH_PENALTY;

              logs.unshift({
                id: `sla-breach-${currentTick}-${order.id}`,
                type: 'error',
                timestamp: formatSimTimestamp(currentTick),
                tick: currentTick,
                content: isZh
                  ? `【SLA超时违约】订单 #${order.id} 超时送达。扣除违约罚金：-$${COSTS.SLA_BREACH_PENALTY}。`
                  : `[SLA BREACH] Order #${order.id} delivered late. Penalty: -$${COSTS.SLA_BREACH_PENALTY}.`
              });
            }

            // MULTI-DROP CHECK: If there is another order remaining in the robot's cargo bay!
            if (bot.carriedOrderIds && bot.carriedOrderIds.length > 0) {
              const nextOrderId = bot.carriedOrderIds[0];
              const nextOrder = orders.find(o => o.id === nextOrderId);

              if (nextOrder && nextOrder.recipientAddress.lat) {
                const activeCity = Object.values(CITIES_DATA).find(c => {
                  if (bot.position.lat && Math.abs(bot.position.lat - c.center[0]) < 0.3) return true;
                  return false;
                }) || CITIES_DATA.singapore;

                const nextLegPath = findCityRoadPath(bot.position, nextOrder.recipientAddress, activeCity, {
                  avoidHighTraffic: directives.avoidTraffic,
                  closedNodeId: state.roadClosureNodeId,
                  isRushHour: state.rushHourActive
                });

                bot.currentOrderId = nextOrderId;
                bot.status = 'delivering';
                bot.targetDestination = {
                  x: nextOrder.recipientAddress.x,
                  y: nextOrder.recipientAddress.y,
                  lat: nextOrder.recipientAddress.lat,
                  lng: nextOrder.recipientAddress.lng,
                  label: isZh ? `一车多单·第二站 ➔ #${nextOrderId}` : `Multi-Drop Leg 2 ➔ #${nextOrderId}`
                };
                bot.pathQueue = nextLegPath.length > 1 ? nextLegPath.slice(1) : nextLegPath;

                logs.unshift({
                  id: `multidrop-${currentTick}-${bot.id}`,
                  type: 'observe',
                  timestamp: formatSimTimestamp(currentTick),
                  tick: currentTick,
                  content: isZh
                    ? `【一车多单·前往下一站】${bot.name} (重载猛犸) 顺利送达上一单，车厢内仍有包裹，立即前往送达订单 #${nextOrderId}！`
                    : `[MULTI-DROP NEXT LEG] ${bot.name} delivered first parcel, immediately proceeding to dropoff order #${nextOrderId}!`
                });

                continue;
              }
            }

            bot.currentPayloadKg = 0;

            // C. SEQUENTIAL MISSION QUEUE CHECK: Zero-Idle transition to next scheduled leg!
            if (bot.missionQueue && bot.missionQueue.length > 0) {
              if (bot.batteryPct >= directives.batteryThreshold) {
                launchMissionFromQueue(bot, orders, state, directives, currentTick, isZh, logs);
                continue;
              }
            }

            // Check if student's prompt instructs chained delivery / high throughput / low idle time
            const hasPendingOrders = orders.some(o => o.status === 'pending');
            const hasHealthyBattery = bot.batteryPct >= directives.batteryThreshold;
            const shouldChainDirectly = (directives.chainDeliveries || directives.prioritizeSLA) && hasPendingOrders && hasHealthyBattery;

            if (shouldChainDirectly) {
              // DIRECT CHAINED DISPATCH: Skip hub return! Immediately standby for the next assignment!
              bot.status = 'idle';
              bot.targetDestination = undefined;

              logs.unshift({
                id: `chain-order-${currentTick}-${bot.id}`,
                type: 'observe',
                timestamp: formatSimTimestamp(currentTick),
                tick: currentTick,
                content: isZh
                  ? `【连续派单调度】${bot.name} 执行系统提示词策略：剩余电量充裕 (${bot.batteryPct.toFixed(0)}% >= ${directives.batteryThreshold}%)，跳过返航，就地就绪接收下一单派送！`
                  : `[CHAINED DISPATCH] ${bot.name} executing prompt directive: healthy battery (${bot.batteryPct.toFixed(0)}% >= ${directives.batteryThreshold}%), skipping base return to immediately take next order!`
              });
            } else {
              // Standard Return to Base for recharge
              const nearestHub = findNearestHub(bot.position, state.hubs) || state.hubs[0];
              const activeCity = Object.values(CITIES_DATA).find(c => {
                if (bot.position.lat && Math.abs(bot.position.lat - c.center[0]) < 0.3) return true;
                return false;
              }) || CITIES_DATA.singapore;

              const returnPath = bot.position.lat && nearestHub.position.lat
                ? findCityRoadPath(bot.position, nearestHub.position, activeCity, {
                    avoidHighTraffic: directives.avoidTraffic,
                    closedNodeId: state.roadClosureNodeId,
                    isRushHour: state.rushHourActive
                  })
                : findPathAStar(bot.position, nearestHub.position, state.grid, { avoidHighTraffic: directives.avoidTraffic });

              bot.status = 'returning';
              bot.targetDestination = {
                x: nearestHub.position.x,
                y: nearestHub.position.y,
                lat: nearestHub.position.lat,
                lng: nearestHub.position.lng,
                label: isZh ? `自主返航 ➔ ${nearestHub.name}` : `Return to Base ➔ ${nearestHub.name}`
              };
              bot.pathQueue = returnPath.length > 1 ? returnPath.slice(1) : returnPath;

              logs.unshift({
                id: `return-start-${currentTick}-${bot.id}`,
                type: 'observe',
                timestamp: formatSimTimestamp(currentTick),
                tick: currentTick,
                content: isZh
                  ? `【自主返航】${bot.name} 配送完成，正在返回 ${nearestHub.name} 充电补能（目标阈值: ${directives.rechargeTarget}%）！`
                  : `[BASE RETURN] ${bot.name} completed delivery. Returning to ${nearestHub.name} to recharge (target: ${directives.rechargeTarget}%)!`
              });
            }
          }
        } else {
          // B. Arrived at charging hub or return base destination
          const hubAtPos = state.hubs.find(h =>
            (h.position.lat && bot.position.lat && Math.abs(h.position.lat - bot.position.lat) < 0.008) ||
            (h.position.x === bot.position.x && h.position.y === bot.position.y)
          ) || state.hubs[0];

          if (hubAtPos && bot.batteryPct < directives.rechargeTarget && (!bot.missionQueue || bot.missionQueue.length === 0 || bot.batteryPct < 25)) {
            bot.status = 'charging';
            bot.targetDestination = {
              x: hubAtPos.position.x,
              y: hubAtPos.position.y,
              lat: hubAtPos.position.lat,
              lng: hubAtPos.position.lng,
              label: isZh ? `充电机位 @ ${hubAtPos.name}` : `Charging Bay @ ${hubAtPos.name}`
            };
            logs.unshift({
              id: `charging-start-${currentTick}-${bot.id}`,
              type: 'observe',
              timestamp: formatSimTimestamp(currentTick),
              tick: currentTick,
              content: isZh
                ? `【充电机位对接】${bot.name} 已安全返回 ${hubAtPos.name} 公司机位，开始快速补能...`
                : `[BASE DOCKED] ${bot.name} docked at ${hubAtPos.name} company bay, rapid recharging started...`
            });
          } else if (bot.missionQueue && bot.missionQueue.length > 0 && bot.batteryPct >= 25) {
            launchMissionFromQueue(bot, orders, state, directives, currentTick, isZh, logs);
          } else {
            bot.status = 'idle';
            bot.targetDestination = undefined;
          }
        }
      }
    } else {
      // Idle standby
      if (bot.missionQueue && bot.missionQueue.length > 0 && bot.batteryPct >= 25) {
        launchMissionFromQueue(bot, orders, state, directives, currentTick, isZh, logs);
      } else {
        bot.batteryPct = Math.max(0, bot.batteryPct - ROBOT_PARAMS.BATTERY_STANDBY_DRAIN);
      }
    }
  }

  // 2. Check Orders for SLA Expiration while pending
  orders.forEach(order => {
    if (order.status === 'pending' && currentTick > order.deadlineTick + 5) {
      order.status = 'failed';
      order.failedReason = `SLA expired while pending dispatch (tick ${currentTick} > ${order.deadlineTick})`;
      financials.slaPenalties += COSTS.SLA_BREACH_PENALTY;
      financials.totalExpenses += COSTS.SLA_BREACH_PENALTY;
      financials.balance -= COSTS.SLA_BREACH_PENALTY;

      logs.unshift({
        id: `pending-expired-${currentTick}-${order.id}`,
        type: 'error',
        timestamp: formatSimTimestamp(currentTick),
        tick: currentTick,
        content: isZh
          ? `订单超时作废：待派发订单 #${order.id} 超过最后截止期限未分配。已扣除违约金：-$${COSTS.SLA_BREACH_PENALTY}。`
          : `ORDER EXPIRED: Pending Order #${order.id} reached SLA deadline without assignment. Penalty: -$${COSTS.SLA_BREACH_PENALTY}.`
      });
    }
  });

  // 2b. Daily Shift Clock Evaluation (08:00 AM to 06:00 PM / 18:00 = TICKS_PER_DAY ticks)
  const currentDay = state.currentDay || 1;
  const dayStartTick = (currentDay - 1) * TICKS_PER_DAY;
  const dayTick = currentTick - dayStartTick;
  let isShiftEnded = Boolean(state.isShiftEnded);

  // If 06:00 PM (18:00) closing time is reached, any remaining unfulfilled orders fail due to shift end
  if (dayTick >= TICKS_PER_DAY) {
    isShiftEnded = true;
    orders.forEach(order => {
      if (order.status === 'pending' || order.status === 'in_transit') {
        order.status = 'failed';
        order.failedReason = `Shift ended at 18:00 (Day ${currentDay}) before delivery completion`;
        financials.slaPenalties += COSTS.SLA_BREACH_PENALTY;
        financials.totalExpenses += COSTS.SLA_BREACH_PENALTY;
        financials.balance -= COSTS.SLA_BREACH_PENALTY;

        logs.unshift({
          id: `shift-end-expire-${currentTick}-${order.id}`,
          type: 'error',
          timestamp: `D${currentDay} 18:00`,
          tick: currentTick,
          content: isZh
            ? `⏰【18:00 收工超时】订单 #${order.id} 未能在下午 6:00 下班前送达！扣除违约金：-$${COSTS.SLA_BREACH_PENALTY}。`
            : `⏰ [18:00 SHIFT OVERTIME] Order #${order.id} was not delivered before 06:00 PM closing! Penalty: -$${COSTS.SLA_BREACH_PENALTY}.`
        });
      }
    });
  }

  // 2c. Living Economy: Periodic Operational Invoices every 20 ticks
  if (currentTick > 0 && currentTick % 20 === 0 && state.status === 'running') {
    const robotCount = robots.length;
    const robotMaintenanceTotal = +(robotCount * COSTS.PERIODIC_ROBOT_MAINTENANCE).toFixed(2);
    const hubCount = state.hubs.length;
    const hubRentTotal = +(hubCount * COSTS.PERIODIC_HUB_RENT).toFixed(2);
    const periodTotal = +(robotMaintenanceTotal + hubRentTotal).toFixed(2);
    const periodNum = Math.floor(currentTick / 20);

    financials.maintenanceCosts = +(financials.maintenanceCosts + robotMaintenanceTotal).toFixed(2);
    financials.hubRentCosts = +((financials.hubRentCosts || 0) + hubRentTotal).toFixed(2);
    financials.totalExpenses = +(financials.totalExpenses + periodTotal).toFixed(2);
    financials.balance = +(financials.balance - periodTotal).toFixed(2);

    financials.lastInvoice = {
      period: periodNum,
      tick: currentTick,
      robotCount,
      robotMaintenanceTotal,
      hubCount,
      hubRentTotal,
      totalInvoiceCost: periodTotal
    };

    logs.unshift({
      id: `operational-invoice-${currentTick}`,
      type: 'observe',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: isZh
        ? `🧾【周期运营账单·第 ${periodNum} 期】周期 20 Ticks 结算：车队维护折旧 -$${robotMaintenanceTotal.toFixed(2)} (${robotCount}台车) + 充电站点地租 -$${hubRentTotal.toFixed(2)} (${hubCount}座站点) = 本期总计扣除 -$${periodTotal.toFixed(2)}。当前财库储备: $${financials.balance.toFixed(2)}。`
        : `🧾 [OPERATIONAL INVOICE #${periodNum}] Cycle 20 Ticks: Fleet maintenance -$${robotMaintenanceTotal.toFixed(2)} (${robotCount} bots) + Hub lease -$${hubRentTotal.toFixed(2)} (${hubCount} hubs) = Period Total -$${periodTotal.toFixed(2)}. Net Treasury: $${financials.balance.toFixed(2)}.`
    });

    if (financials.balance <= 50 && financials.balance > 0) {
      logs.unshift({
        id: `warning-low-reserves-${currentTick}`,
        type: 'error',
        timestamp: formatSimTimestamp(currentTick),
        tick: currentTick,
        content: isZh
          ? `⚠️【财库告急预警】当前可用流动资金仅剩 $${financials.balance.toFixed(2)}！请调度车队加速接单赚取运费，避免在下期账单结算时触发破产停运！`
          : `⚠️ [CASH RESERVES LOW] Available treasury down to $${financials.balance.toFixed(2)}! Dispatch fleet to clear orders and earn fees before next billing cycle!`
      });
    }
  }

  // 2d. Autonomous Dynamic Weather & Real-World Traffic Simulation (Random events)
  let nextWeather = state.weather || 'clear';
  let weatherRemainingTicks = (state.weatherDurationTicks !== undefined ? state.weatherDurationTicks : 30) - 1;
  let nextRushHour = Boolean(state.rushHourActive);
  let rushHourRemainingTicks = (state.rushHourDurationTicks !== undefined ? state.rushHourDurationTicks : 0) - 1;
  let nextRoadClosure = state.roadClosureNodeId;
  let roadClosureRemainingTicks = (state.roadClosureDurationTicks !== undefined ? state.roadClosureDurationTicks : 0) - 1;

  if (state.status === 'running') {
    const lvl = state.levelProgression?.currentLevel || 1;
    const activeCity = CITIES_DATA[state.currentCityId] || CITIES_DATA.singapore;

    // 1. Dynamic Weather Evolution
    if (weatherRemainingTicks <= 0) {
      const roll = Math.random();
      let pickedWeather: CityWeather = 'clear';
      let duration = 30;

      if (lvl === 1) {
        // Level 1: Beginner apprentice - mostly clear skies, occasional brief light rain
        if (roll < 0.85) {
          pickedWeather = 'clear';
          duration = Math.floor(Math.random() * 20 + 35); // 35-55 ticks
        } else {
          pickedWeather = 'rain';
          duration = Math.floor(Math.random() * 8 + 15);  // 15-23 ticks
        }
      } else {
        // Level 2 & 3: Dynamic metropolis atmospheric simulation
        if (roll < 0.60) {
          pickedWeather = 'clear';
          duration = Math.floor(Math.random() * 15 + 30); // 30-45 ticks
        } else if (roll < 0.88) {
          pickedWeather = 'rain';
          duration = Math.floor(Math.random() * 10 + 18); // 18-28 ticks
        } else {
          pickedWeather = 'typhoon';
          duration = Math.floor(Math.random() * 8 + 12);  // 12-20 ticks
        }
      }

      if (pickedWeather !== nextWeather) {
        nextWeather = pickedWeather;
        const weatherName = pickedWeather === 'typhoon'
          ? (isZh ? '⚡ 强雷暴台风' : '⚡ Severe Typhoon')
          : (pickedWeather === 'rain' ? (isZh ? '🌧️ 热带暴雨' : '🌧️ Tropical Rainstorm') : (isZh ? '☀️ 晴天万里' : '☀️ Clear Skies'));

        const weatherDesc = pickedWeather === 'typhoon'
          ? (isZh ? '能耗剧增 +75%，路面湿滑，但每单享有 +25% 极端天气风险津贴！' : 'Energy drain +75%, road grip reduced, +25% hazard pay bonus awarded per delivery!')
          : (pickedWeather === 'rain'
            ? (isZh ? '路面湿滑，车队电池能耗增加 35%！' : 'Wet roads, fleet battery drain increased by 35%!')
            : (isZh ? '城市气象恢复常态，路面附着力与能耗恢复 1.0x 标准水平。' : 'Atmosphere normalized, standard 1.0x battery consumption resumed.'));

        logs.unshift({
          id: `weather-auto-${currentTick}`,
          type: 'observe',
          timestamp: formatSimTimestamp(currentTick),
          tick: currentTick,
          content: isZh
            ? `【气象随机突变】气象雷达显示城市上空突变：${weatherName}！${weatherDesc}`
            : `[DYNAMIC WEATHER] Radar scan detected atmospheric shift to ${weatherName}! ${weatherDesc}`
        });
      }

      weatherRemainingTicks = duration;
    }

    // 2. Dynamic Rush Hour Traffic (Daily afternoon/evening peak: ticks 65 - 88)
    const isEveningPeak = dayTick >= 65 && dayTick <= 88;
    if (isEveningPeak && !nextRushHour) {
      nextRushHour = true;
      logs.unshift({
        id: `rush-start-${currentTick}`,
        type: 'observe',
        timestamp: formatSimTimestamp(currentTick),
        tick: currentTick,
        content: isZh
          ? `🚦【晚高峰突发】城市进入晚高峰拥堵时段！主干道与跨区快速路延误飙升至 4.2x！智能体将自动评估拥堵绕行。`
          : `🚦 [TRAFFIC SURGE] Evening rush hour declared! Major avenues experience up to 4.2x travel delay. Fleet will evaluate detours.`
      });
    } else if (!isEveningPeak && nextRushHour && dayTick > 88) {
      nextRushHour = false;
      logs.unshift({
        id: `rush-end-${currentTick}`,
        type: 'observe',
        timestamp: formatSimTimestamp(currentTick),
        tick: currentTick,
        content: isZh
          ? `🚦【高峰回落】晚高峰车流消退，全市主要交通干道恢复常态通行。`
          : `🚦 [TRAFFIC NORMALIZED] Evening rush hour congestion subsided. Arterial roads returned to normal traffic flow.`
      });
    }

    // 3. Dynamic Emergency Roadblock / Municipal Construction Hazard (Level 2 & 3 only)
    if (lvl >= 2) {
      if (nextRoadClosure) {
        if (roadClosureRemainingTicks <= 0) {
          const closedNode = activeCity.roadNodes.find(n => n.id === nextRoadClosure);
          const nodeName = isZh ? (closedNode?.nameZh || nextRoadClosure) : (closedNode?.name || nextRoadClosure);
          logs.unshift({
            id: `roadblock-clear-${currentTick}`,
            type: 'observe',
            timestamp: formatSimTimestamp(currentTick),
            tick: currentTick,
            content: isZh
              ? `🚧【道路施工恢复】节点 [${nodeName}] 紧急市政抢修完工，封闭路段已解除管制，恢复双向通行！`
              : `🚧 [ROADBLOCK CLEARED] Emergency repairs completed at [${nodeName}]. Normal two-way traffic restored!`
          });
          nextRoadClosure = undefined;
          roadClosureRemainingTicks = 0;
        }
      } else {
        // Chance of spontaneous roadblock event: check every 15 ticks with 20% chance
        if (currentTick % 15 === 0 && Math.random() < 0.20) {
          const hubNodeIds = state.hubs.map(h => {
            const nearest = activeCity.roadNodes.find(n => Math.abs(n.lat - h.position.lat!) < 0.005);
            return nearest?.id;
          });
          const candidateNodes = activeCity.roadNodes.filter(n => !hubNodeIds.includes(n.id));
          if (candidateNodes.length > 0) {
            const chosen = candidateNodes[Math.floor(Math.random() * candidateNodes.length)];
            nextRoadClosure = chosen.id;
            roadClosureRemainingTicks = Math.floor(Math.random() * 12 + 16); // 16-28 ticks
            const nodeName = isZh ? chosen.nameZh : chosen.name;
            logs.unshift({
              id: `roadblock-start-${currentTick}`,
              type: 'observe',
              timestamp: formatSimTimestamp(currentTick),
              tick: currentTick,
              content: isZh
                ? `🚧【突发封路告警】紧急施工：节点 [${nodeName}] 突发市政水管抢修，路段双向紧急全封闭！路线算法将自动避障绕行！`
                : `🚧 [ROAD HAZARD] Emergency closure at [${nodeName}] due to utility repair! Fleet algorithms will calculate bypass detours.`
            });
          }
        }
      }
    }
  }

  // 3. Compute Metrics
  const totalDelivered = orders.filter(o => o.status === 'delivered').length;
  const totalFailed = orders.filter(o => o.status === 'failed').length;
  const inTransitCount = orders.filter(o => o.status === 'in_transit').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  const finishedOrders = totalDelivered + totalFailed;
  const onTimeDeliveryRate = finishedOrders > 0
    ? Math.round((totalDelivered / finishedOrders) * 100)
    : 100;

  const profitMargin = financials.totalRevenue > 0
    ? Math.round(((financials.totalRevenue - financials.totalExpenses) / financials.totalRevenue) * 100)
    : 0;

  const fleetUtilizationRate = robots.length > 0
    ? Math.round((activeMovingRobots / robots.length) * 100)
    : 0;

  const totalTravelTicks = (state.metrics.totalTravelTicks || 0) + activeMovingRobots;
  const rawEfficiency = totalTravelTicks > 0
    ? Math.round((totalDelivered / totalTravelTicks) * 100)
    : 0;

  const updatedMetrics: TelemetryMetrics = {
    totalOrdersSpawned: orders.length,
    totalDelivered,
    totalFailed,
    inTransitCount,
    pendingCount,
    onTimeDeliveryRate,
    profitMargin,
    averageDeliveryTicks: 0,
    totalTokensConsumed: state.metrics.totalTokensConsumed,
    totalTravelTicks,
    agentEfficiencyScore: rawEfficiency,
    fleetUtilizationRate
  };

  // 4. Level Progression & Daily Shift Completion Evaluation
  let status: SimulationStatus = state.status;
  let gameOverReason: string | undefined = undefined;
  let showReportModal = state.showReportModal;

  const nextLevelProgression: LevelProgression = state.levelProgression
    ? { ...state.levelProgression }
    : {
        currentLevel: 1,
        levelDeliveriesCompleted: 0,
        levelTargetDeliveries: 3,
        levelTargetCash: 180,
        isLevelUpModalOpen: false,
        unlockedFeatures: {
          robotShop: false,
          hubUpgrades: false,
          hubConstruction: false,
          multiOrderCarrying: false,
          cityDomination: false
        }
      };

  nextLevelProgression.levelDeliveriesCompleted = totalDelivered;

  // Check if all of today's orders have been cleared before 18:00
  if (pendingCount === 0 && inTransitCount === 0 && !isShiftEnded) {
    isShiftEnded = true;
    status = 'paused';
    logs.unshift({
      id: `day-${currentDay}-cleared-${currentTick}`,
      type: 'observe',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: isZh
        ? `🎉【第 ${currentDay} 天全部包裹提前送达！】当前时间 ${formatSimTimestamp(currentTick)}（赶在 18:00 收工前完成全部订单）！点击下方「🌅 开启第 ${currentDay + 1} 天 (08:00 AM)」获取明日订单并让 LLM 进行开工前规划！`
        : `🎉 [DAY ${currentDay} ORDERS CLEARED EARLY!] All parcels delivered at ${formatSimTimestamp(currentTick)} before 06:00 PM closing! Click [🌅 Start Day ${currentDay + 1} (08:00 AM)] below for tomorrow's pre-shift planning!`
    });
  } else if (dayTick >= TICKS_PER_DAY) {
    status = 'paused';
    logs.unshift({
      id: `day-${currentDay}-end-${currentTick}`,
      type: 'observe',
      timestamp: `D${currentDay} 18:00`,
      tick: currentTick,
      content: isZh
        ? `🌇【第 ${currentDay} 天 18:00 下班收工】今日 08:00 - 18:00 运营时段结束！点击下方「🌅 开启第 ${currentDay + 1} 天 (08:00 AM)」进入下一天开工前排程！`
        : `🌇 [DAY ${currentDay} • 06:00 PM SHIFT ENDED] Operating hours (08:00 AM – 06:00 PM) concluded! Click [🌅 Start Day ${currentDay + 1} (08:00 AM)] below to plan tomorrow's shift!`
    });
  }

  if (
    nextLevelProgression.currentLevel === 1 &&
    totalDelivered >= nextLevelProgression.levelTargetDeliveries &&
    !nextLevelProgression.isLevelUpModalOpen &&
    !nextLevelProgression.hasDismissedModal
  ) {
    nextLevelProgression.isLevelUpModalOpen = true;
    status = 'paused'; // Auto-pause so player can celebrate and inspect stats
    logs.unshift({
      id: `level-1-complete-${currentTick}`,
      type: 'observe',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: isZh
        ? `🎉【第一关完成！】已顺利完成全部 3 笔新手配送！当前财库资金：$${financials.balance.toFixed(2)}。恭喜解锁 Level 2【车队扩建、机型升级与智能建站】！`
        : `🎉 [LEVEL 1 COMPLETE!] Successfully delivered all 3 onboarding parcels! Bank capital: $${financials.balance.toFixed(2)}. Unlocked Level 2 [Fleet & Hub Tycoon]!`
    });
  } else if (
    nextLevelProgression.currentLevel === 2 &&
    totalDelivered >= nextLevelProgression.levelTargetDeliveries &&
    !nextLevelProgression.isLevelUpModalOpen &&
    !nextLevelProgression.hasDismissedModal
  ) {
    nextLevelProgression.isLevelUpModalOpen = true;
    status = 'paused'; // Auto-pause so player can celebrate Level 2 victory & advance to Level 3
    logs.unshift({
      id: `level-2-complete-${currentTick}`,
      type: 'observe',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: isZh
        ? `🏆【第 2 关大亨达成！】城际智能网络运营卓越，累计完成 ${totalDelivered} 笔派送！资金储备：$${financials.balance.toFixed(2)}。恭喜解锁 Level 3【全城物流霸主 · 进军东京/纽约全球大都会网络】！`
        : `🏆 [LEVEL 2 COMPLETE: TYCOON MASTER!] Network conquered with ${totalDelivered} deliveries! Bank capital: $${financials.balance.toFixed(2)}. Unlocked Level 3 [Metropolis Domination: Tokyo & New York]!`
    });
  }

  // 5. Game Over / Victory Evaluation

  if (financials.balance <= 0) {
    status = 'game_over';
    showReportModal = true;
    gameOverReason = isZh
      ? `破产警告：车队财库资金耗尽 ($${financials.balance.toFixed(2)} <= $0.00)。车队已全线停运。`
      : `Bankruptcy! Cash reserves depleted ($${financials.balance.toFixed(2)} <= $0.00). Fleet grounded.`;
    logs.unshift({
      id: `game-over-cash-${currentTick}`,
      type: 'error',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: gameOverReason
    });
  } else if (totalFailed >= state.scenario.slaBreachLimit) {
    status = 'game_over';
    showReportModal = true;
    gameOverReason = isZh
      ? `合同解除：SLA超时违约次数触发安全熔断阈值 (${totalFailed} >= ${state.scenario.slaBreachLimit})。`
      : `Contract Revoked: SLA failures reached threshold (${totalFailed} >= ${state.scenario.slaBreachLimit}).`;
    logs.unshift({
      id: `game-over-sla-${currentTick}`,
      type: 'error',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: gameOverReason
    });
  } else if (
    pendingCount === 0 &&
    inTransitCount === 0 &&
    totalDelivered >= nextLevelProgression.levelTargetDeliveries &&
    financials.balance >= nextLevelProgression.levelTargetCash &&
    nextLevelProgression.currentLevel >= 3 &&
    !nextLevelProgression.isEndlessMode
  ) {
    status = 'victory';
    showReportModal = true;
    logs.unshift({
      id: `victory-${currentTick}`,
      type: 'observe',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: isZh
        ? `🌟【最终大满贯达成】全球大都会物流网络全面称霸！最终净利润: $${(financials.totalRevenue - financials.totalExpenses).toFixed(2)}, 准时履约率: ${onTimeDeliveryRate}%。荣获顶级智能体总调度师勋章！`
        : `🌟 [GRAND VICTORY!] Global Metropolis Logistics Network Dominated! Final Profit: $${(financials.totalRevenue - financials.totalExpenses).toFixed(2)}, On-Time: ${onTimeDeliveryRate}%. Awarded Master Agent Architect Trophy!`
    });
  }

  return {
    ...state,
    tick: currentTick,
    currentDay,
    dayTick,
    isShiftEnded,
    status,
    gameOverReason,
    showReportModal,
    financials,
    metrics: updatedMetrics,
    robots,
    orders,
    thoughtLogs: logs.slice(0, 100), // Keep latest 100 logs
    levelProgression: nextLevelProgression,
    weather: nextWeather,
    weatherDurationTicks: weatherRemainingTicks,
    rushHourActive: nextRushHour,
    rushHourDurationTicks: rushHourRemainingTicks,
    roadClosureNodeId: nextRoadClosure,
    roadClosureDurationTicks: roadClosureRemainingTicks
  };
}
