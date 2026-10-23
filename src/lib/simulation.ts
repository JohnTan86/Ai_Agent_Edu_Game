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
  Position
} from './types';
import { COSTS, ROBOT_PARAMS, formatSimTimestamp } from './constants';
import { createEmptyGrid, applyTrafficHotspots, DEFAULT_SCENARIOS } from './defaultScenarios';
import { CITIES_DATA } from './cityData';
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

  // Orders according to level
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
          deadlineTick: 75 + idx * 25, // generous SLA for learning
          status: 'pending' as const
        }))
    : (level === 2
        ? city.initialOrders.slice(0, 8).map((o, idx) => ({
            ...o,
            id: `L2-ORD-${idx + 101}`,
            status: 'pending' as const,
            reward: 65 + (idx % 4) * 15,
            deadlineTick: 85 + idx * 20
          }))
        : Array.from({ length: 12 }, (_, idx) => {
            const baseOrder = city.initialOrders[idx % city.initialOrders.length];
            const randomNode = city.roadNodes[(idx * 3 + 1) % city.roadNodes.length];
            const assignedHub = initialHubs[idx % initialHubs.length] || primaryHub;
            return {
              ...baseOrder,
              id: `L3-ORD-${idx + 201}`,
              status: 'pending' as const,
              sender: `${city.name} Express #${idx + 10}`,
              recipientAddress: {
                x: Math.round(randomNode.lat * 100) % 18,
                y: Math.round(randomNode.lng * 100) % 18,
                lat: randomNode.lat,
                lng: randomNode.lng,
                zone: randomNode.name
              },
              reward: 80 + (idx % 5) * 20,
              deadlineTick: 95 + idx * 18,
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
    timestamp: formatSimTimestamp(0),
    tick: 0,
    content: level === 1
      ? (city.id === 'singapore'
          ? '【新手学徒：第一阶段开启】欢迎指挥官！初始资产：1座滨海湾中心站点、1台全能配送小车与3笔同城配送单。在左侧编写你的系统提示词，引导机器人完成全部 3 笔订单并赚取 $180 资金以晋升 Level 2！'
          : '[LEVEL 1: THE FIRST MILE] Welcome Architect! You have 1 Central Hub, 1 Rover, and 3 Pending Orders. Write your system prompt to guide your fleet. Deliver all 3 orders and achieve $180 cash to unlock Level 2: Fleet & Hub Tycoon!')
      : (level === 2
          ? (city.id === 'singapore'
              ? '【第 2 关：车队扩建与枢纽大亨】欢迎来到大亨阶段！车队商城、多车型改装、站点快充升级与智能建站已全部解锁。完成 8 笔订单并累计 $500 资金以进军 Level 3 全球大都会！'
              : '[LEVEL 2: FLEET & HUB TYCOON] Welcome to the Tycoon phase! Vehicle store, multi-drop rovers, hub upgrades, and prompt-driven hub construction unlocked. Deliver 8 orders & reach $500 capital to advance to Level 3!')
          : (city.id === 'singapore'
              ? '【第 3 关：全球大都会全城霸主】全城覆盖雷达已激活。部署多中心站点覆盖全城路网，向全城覆盖率 ≥85% 与 $1,000 最终大奖发起总攻！'
              : `[LEVEL 3: METROPOLIS DOMINATION] Welcome to [${city.name}]! City coverage radar online. Build hubs across the metropolis and achieve >=85% city coverage with $1,000 cash reserves to win the Grand Architect Trophy!`))
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
    rushHourActive: false,
    roadClosureNodeId: undefined,
    levelProgression
  };
}

/**
 * Applies structured agent dispatch actions to robots and orders in simulation
 */
export function applyDispatchActionsToState(
  state: SimulationState,
  actions: AgentDispatchAction[]
): SimulationState {
  console.log('[SIMULATION] applyDispatchActionsToState called with actions:', actions.map(a => a.orderId));
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
              financials.totalRevenue += order.reward;
              financials.balance += order.reward;

              logs.unshift({
                id: `delivered-${currentTick}-${order.id}`,
                type: 'observe',
                timestamp: formatSimTimestamp(currentTick),
                tick: currentTick,
                content: isZh
                  ? `【配送成功】订单 #${order.id} 已由 ${bot.name} 准时送达客户！运费收益：+$${order.reward}。`
                  : `[DELIVERY SUCCESS] Order #${order.id} delivered by ${bot.name} on time! Earned: +$${order.reward}.`
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

  // 2b. Dynamic Living City Order Flow in Level 3 / Endless Tycoon Mode
  const isLevel3OrEndless = state.levelProgression?.currentLevel === 3 || Boolean(state.levelProgression?.isEndlessMode);
  if (
    isLevel3OrEndless &&
    state.status === 'running' &&
    currentTick > 0 &&
    currentTick % 16 === 0
  ) {
    const currentPending = orders.filter(o => o.status === 'pending').length;
    if (currentPending < 6) {
      const city = CITIES_DATA[state.currentCityId] || CITIES_DATA.tokyo;
      const randomNode = city.roadNodes[Math.floor(Math.random() * city.roadNodes.length)];
      const randomHub = state.hubs[Math.floor(Math.random() * state.hubs.length)] || state.hubs[0];
      const newOrderId = `ORD-${state.currentCityId.slice(0, 2).toUpperCase()}-${currentTick}-${Math.floor(Math.random() * 900 + 100)}`;
      const newReward = Math.floor(Math.random() * 50 + 60);
      const newOrder: Order = {
        id: newOrderId,
        sender: `${city.name} Express #${Math.floor(Math.random() * 90 + 10)}`,
        recipientAddress: {
          x: Math.round(randomNode.lat * 100) % 18,
          y: Math.round(randomNode.lng * 100) % 18,
          lat: randomNode.lat,
          lng: randomNode.lng,
          zone: isZh ? randomNode.nameZh : randomNode.name
        },
        deadlineTick: currentTick + Math.floor(Math.random() * 35 + 45),
        reward: newReward,
        weightKg: +(Math.random() * 6 + 1.5).toFixed(1),
        status: 'pending',
        createdAtTick: currentTick,
        pickupHubId: randomHub.id
      };
      orders.unshift(newOrder);
      logs.unshift({
        id: `live-order-${newOrderId}`,
        type: 'observe',
        timestamp: formatSimTimestamp(currentTick),
        tick: currentTick,
        content: isZh
          ? `📦【都会新单到达】[${randomHub.name}] ➔ [${newOrder.recipientAddress.zone}]，报酬: +$${newReward}，SLA限时: ${newOrder.deadlineTick - currentTick} 周期。`
          : `📦 [NEW ORDER ARRIVED] [${randomHub.name}] ➔ [${newOrder.recipientAddress.zone}], Reward: +$${newReward}, SLA: ${newOrder.deadlineTick - currentTick} ticks.`
      });
    }
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

  // 4. Level Progression Evaluation
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

  if (
    nextLevelProgression.currentLevel === 1 &&
    totalDelivered >= nextLevelProgression.levelTargetDeliveries &&
    !nextLevelProgression.isLevelUpModalOpen
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
    (totalDelivered >= nextLevelProgression.levelTargetDeliveries || (pendingCount === 0 && inTransitCount === 0 && totalDelivered >= 6)) &&
    !nextLevelProgression.isLevelUpModalOpen
  ) {
    nextLevelProgression.isLevelUpModalOpen = true;
    status = 'paused'; // Auto-pause so player can celebrate Level 2 victory & advance to Level 3
    logs.unshift({
      id: `level-2-complete-${currentTick}`,
      type: 'observe',
      timestamp: formatSimTimestamp(currentTick),
      tick: currentTick,
      content: isZh
        ? `🏆【第 2 关大亨达成！】新加坡城际智能网络运营卓越，累计完成 ${totalDelivered} 笔派送！资金储备：$${financials.balance.toFixed(2)}。恭喜解锁 Level 3【全城物流霸主 · 进军东京/纽约全球大都会网络】！`
        : `🏆 [LEVEL 2 COMPLETE: TYCOON MASTER!] Singapore network conquered with ${totalDelivered} deliveries! Bank capital: $${financials.balance.toFixed(2)}. Unlocked Level 3 [Metropolis Domination: Tokyo & New York]!`
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
    totalDelivered > 0 &&
    currentTick >= 30 &&
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
    status,
    gameOverReason,
    showReportModal,
    financials,
    metrics: updatedMetrics,
    robots,
    orders,
    thoughtLogs: logs.slice(0, 100), // Keep latest 100 logs
    levelProgression: nextLevelProgression
  };
}
