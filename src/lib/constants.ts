import { AgentTool } from './types';
import { Language } from './i18n';

export const GRID_WIDTH = 18;
export const GRID_HEIGHT = 18;

/**
 * Deterministic simulation timestamp helper (prevents SSR prerender hydration mismatch)
 */
export function formatSimTimestamp(tick: number): string {
  const totalSecs = tick * 2; // Each tick = 2 in-world seconds
  const hours = 8 + Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Economic constants
export const COSTS = {
  PER_STEP_TRAVEL: 0.60,       // Fuel / wear cost per grid move ($)
  PER_TICK_MAINTENANCE: 0.05,  // Base server heartbeat fee per robot per tick ($)
  CHARGING_PER_PCT: 0.08,      // Electricity cost per 1% battery recharged ($)
  SLA_BREACH_PENALTY: 35.0,    // Penalty charged to company on SLA failure ($)
  LOW_BATTERY_RECOVERY_FEE: 25.0, // Towing/recovery fee if battery reaches 0% ($)
  PERIODIC_ROBOT_MAINTENANCE: 0.80, // Operational invoice: maintenance per active robot every 20 ticks ($)
  PERIODIC_HUB_RENT: 2.00        // Operational invoice: lease & utility per hub every 20 ticks ($)
};

// Robot mechanical parameters
export const ROBOT_PARAMS = {
  BATTERY_DRAIN_PER_STEP: 0.35, // % battery drained per move (balanced for multi-order routes)
  BATTERY_PAYLOAD_FACTOR: 0.04, // extra drain per kg carried
  BATTERY_STANDBY_DRAIN: 0.01,  // idle drain per tick
  CHARGING_RATE_PER_TICK: 10.0, // % battery restored per tick when at charging hub
  MIN_BATTERY_DISPATCH_THRESHOLD: 25.0, // Safe threshold before sending on job
  CRITICAL_BATTERY_THRESHOLD: 15.0      // Must return to charge
};

// Level 2 Tech Tree & Infrastructure Pricing
export const ROBOT_SHOP_CONFIG = {
  speedy: {
    type: 'speedy' as const,
    nameEn: 'Speedy Scout',
    nameZh: '极速轻骑跑车',
    price: 120,
    speedMultiplier: 1.4,
    batteryDrainMultiplier: 1.25,
    chargingRateMultiplier: 1.5,
    maxOrdersCapacity: 1,
    maxCapacityKg: 6,
    color: '#10b981', // Emerald neon
    descriptionEn: '1.4x sprint speed for urgent SLAs, ultra-fast charging, but shorter battery range.',
    descriptionZh: '1.4倍极速跑车，专攻紧急加急单，超级快充回血，但续航相对较短。'
  },
  heavy: {
    type: 'heavy' as const,
    nameEn: 'Heavy Hauler',
    nameZh: '重载长途猛犸',
    price: 180,
    speedMultiplier: 0.8,
    batteryDrainMultiplier: 0.65, // Massive 160% range
    chargingRateMultiplier: 0.75,
    maxOrdersCapacity: 2, // Carries 2 orders simultaneously!
    maxCapacityKg: 24,
    color: '#f59e0b', // Amber/orange
    descriptionEn: 'Carries 2 parcels simultaneously with 160% battery range. Slower speed, multi-drop powerhouse.',
    descriptionZh: '一次出库装载 2 笔包裹连环配送，配备超大容量固态电池（1.6倍续航），航速略慢。'
  },
  standard: {
    type: 'standard' as const,
    nameEn: 'Standard Rover',
    nameZh: '全能平衡先锋',
    price: 100,
    speedMultiplier: 1.0,
    batteryDrainMultiplier: 1.0,
    chargingRateMultiplier: 1.0,
    maxOrdersCapacity: 1,
    maxCapacityKg: 12,
    color: '#06b6d4', // Cyan
    descriptionEn: 'Balanced speed, battery, and maintenance costs. Dependable all-rounder.',
    descriptionZh: '航速、续航与运维成本均衡，稳定可靠的全天候通用主力车型。'
  }
};

export const UPGRADE_PRICES = {
  CARGO_EXPANSION: 60, // +1 order capacity
  SOLID_STATE_BATTERY: 50, // -30% battery drain
  TURBO_MOTORS: 40, // +25% speed
  HUB_LEVEL_2: 80, // Dual-bay fast charge (+9%/tick)
  HUB_LEVEL_3: 160, // Mega-supercharger 4-bay (+14%/tick)
  NEW_HUB_CONSTRUCTION: 200, // Build new hub
  HUB_SELL_REFUND: 100 // Refund for decommissioning hub
};

// Available Tools for the Agent Architect (English & Chinese)
export const SYSTEM_TOOLS_EN: AgentTool[] = [
  {
    name: 'get_traffic_conditions',
    description: 'Retrieves current traffic congestion multipliers and road blocks across city zones.',
    enabled: true,
    parameters: [
      { name: 'zone', type: 'string', description: 'Filter by specific zone (e.g., Downtown, TechPark, Waterfront)', required: false }
    ]
  },
  {
    name: 'check_robot_telemetry',
    description: 'Inspects real-time battery percentage, payload capacity, position, and status of all robots in the fleet.',
    enabled: true,
    parameters: [
      { name: 'robotId', type: 'string', description: 'Specific robot ID or omit for entire fleet', required: false }
    ]
  },
  {
    name: 'calculate_route_eta',
    description: 'Uses A* pathfinding to estimate path distance and travel ticks from origin to destination factoring in traffic.',
    enabled: true,
    parameters: [
      { name: 'startX', type: 'number', description: 'Starting X coordinate', required: true },
      { name: 'startY', type: 'number', description: 'Starting Y coordinate', required: true },
      { name: 'targetX', type: 'number', description: 'Destination X coordinate', required: true },
      { name: 'targetY', type: 'number', description: 'Destination Y coordinate', required: true }
    ]
  },
  {
    name: 'assign_route',
    description: 'Executes dispatch of a robot to collect parcel from hub and navigate waypoints to customer.',
    enabled: true,
    parameters: [
      { name: 'orderId', type: 'string', description: 'Order ID to fulfill', required: true },
      { name: 'robotId', type: 'string', description: 'Assigned delivery robot ID', required: true },
      { name: 'priorityReasoning', type: 'string', description: 'Chain-of-thought justification for assignment', required: true }
    ]
  },
  {
    name: 'order_battery_recharge',
    description: 'Orders an idle robot with low battery (<30%) to divert to the nearest available hub charging bay.',
    enabled: true,
    parameters: [
      { name: 'robotId', type: 'string', description: 'Robot ID needing charge', required: true },
      { name: 'hubId', type: 'string', description: 'Destination charging hub', required: false }
    ]
  },
  {
    name: 'build_charging_hub',
    description: 'Invests company capital ($200) to construct a new charging hub at a strategic city corridor node, expanding fleet coverage radius and reducing deadhead travel.',
    enabled: true,
    parameters: [
      { name: 'nodeId', type: 'string', description: 'Target city corridor node ID or location name (e.g. Chinatown, Suntec, Orchard)', required: true },
      { name: 'reasoning', type: 'string', description: 'Strategic rationale based on company balance and order proximity', required: true }
    ]
  },
  {
    name: 'upgrade_charging_hub',
    description: 'Upgrades an existing hub (Level 2: Dual-Bay Fast Hub $80; Level 3: Mega-Supercharger $160) to increase simultaneous charging bays and recharge speed up to +14%/tick.',
    enabled: true,
    parameters: [
      { name: 'hubId', type: 'string', description: 'ID of the hub to upgrade', required: true },
      { name: 'targetLevel', type: 'number', description: 'Target upgrade level (2 or 3)', required: true },
      { name: 'reasoning', type: 'string', description: 'Strategic rationale for hub upgrade', required: true }
    ]
  }
];

export const SYSTEM_TOOLS_ZH: AgentTool[] = [
  {
    name: 'get_traffic_conditions',
    description: '查询城市各区域的实时交通拥堵倍率与道路封闭信息。',
    enabled: true,
    parameters: [
      { name: 'zone', type: 'string', description: '按指定区域筛选（如 Downtown、TechPark、Waterfront）', required: false }
    ]
  },
  {
    name: 'check_robot_telemetry',
    description: '实时监测车队所有机器人的电池百分比、载重容量、当前坐标与运行状态。',
    enabled: true,
    parameters: [
      { name: 'robotId', type: 'string', description: '特定机器人编号，缺省则查询全车队', required: false }
    ]
  },
  {
    name: 'calculate_route_eta',
    description: '采用 A* 算法结合交通路况评估从出发点到目的地的预计行驶周期与路线距离。',
    enabled: true,
    parameters: [
      { name: 'startX', type: 'number', description: '出发地 X 坐标', required: true },
      { name: 'startY', type: 'number', description: '出发地 Y 坐标', required: true },
      { name: 'targetX', type: 'number', description: '收货地 X 坐标', required: true },
      { name: 'targetY', type: 'number', description: '收货地 Y 坐标', required: true }
    ]
  },
  {
    name: 'assign_route',
    description: '向机器人下达从站点取货并导航配送至收货地点的路径指令。',
    enabled: true,
    parameters: [
      { name: 'orderId', type: 'string', description: '履约订单编号', required: true },
      { name: 'robotId', type: 'string', description: '指定的配送机器人编号', required: true },
      { name: 'priorityReasoning', type: 'string', description: '本次派单的思维链决策理由', required: true }
    ]
  },
  {
    name: 'order_battery_recharge',
    description: '向低电量（<30%）的空闲机器人下发自主返回最近站点充电机位充电的指令。',
    enabled: true,
    parameters: [
      { name: 'robotId', type: 'string', description: '需充电的机器人编号', required: true },
      { name: 'hubId', type: 'string', description: '目标充电站点编号', required: false }
    ]
  },
  {
    name: 'build_charging_hub',
    description: '消耗 $200 财库资金在城市战略路口投资建设全新的中心充电站，扩大全城服务辐射圈并削减空驶耗电。',
    enabled: true,
    parameters: [
      { name: 'nodeId', type: 'string', description: '目标城市走廊节点ID或地名（如 牛车水、新达城、乌节路）', required: true },
      { name: 'reasoning', type: 'string', description: '结合公司资金储备与订单密集度的建站决策理由', required: true }
    ]
  },
  {
    name: 'upgrade_charging_hub',
    description: '升级现有站点（Lv.2 双机位快充站 $80；Lv.3 超级快充旗舰站 $160），增加并发充电机位并将回血充能速度提升至 +14%/tick。',
    enabled: true,
    parameters: [
      { name: 'hubId', type: 'string', description: '拟升级的中心站点ID', required: true },
      { name: 'targetLevel', type: 'number', description: '目标升级等级（2 或 3）', required: true },
      { name: 'reasoning', type: 'string', description: '站点升级的战略决策理由', required: true }
    ]
  }
];

export function getSystemTools(lang: Language = 'en'): AgentTool[] {
  return lang === 'zh' ? SYSTEM_TOOLS_ZH : SYSTEM_TOOLS_EN;
}

export const SYSTEM_TOOLS = SYSTEM_TOOLS_EN;

// Prompt Presets in English
export const PROMPT_PRESETS_EN = [
  {
    id: 'balanced-architect',
    title: 'Balanced Architect (Recommended)',
    description: 'Optimizes SLA deadlines while respecting battery safeguards and traffic hotspots.',
    prompt: `You are the Lead Autonomous Fleet Dispatcher for RoboFlow 2028.
Your mission is to maximize profit margin and achieve 100% on-time delivery rate.

DECISION PROTOCOL:
1. Prioritize orders with tightest SLA deadlines (remainingTicks = deadlineTick - currentTick).
2. Never assign a robot with battery < 30% unless the destination is within 4 tiles of a charging hub.
3. Match parcel weight with robot remaining payload capacity.
4. Route around severe traffic congestion (trafficMultiplier > 2.0).
5. If any idle robot has battery < 25%, order it to return to the nearest hub for recharging.

Output a structured dispatch plan assigning available idle robots to urgent pending orders.`
  },
  {
    id: 'greedy-revenue',
    title: 'Greedy Revenue Maximizer',
    description: 'Prioritizes high-reward orders immediately without checking battery or traffic.',
    prompt: `You are a high-speed dispatch bot tuned for maximum immediate revenue.
1. Sort all pending orders by reward descending.
2. Immediately assign the nearest idle robot to the highest-paying order.
3. Ignore battery levels above 10% to keep throughput high.
4. Fast turnaround is prioritized over detour routes.`
  },
  {
    id: 'battery-guardian',
    title: 'Eco Fleet & Battery Guardian',
    description: 'Conservative energy-saving protocol to minimize operational degradation and recharge costs.',
    prompt: `You are an energy-conscious Fleet Preservation Agent.
1. Maintain robot battery health above all else. Never dispatch any robot below 40% battery.
2. Automatically route robots to hubs when battery drops below 35%.
3. Choose shortest distance routes and avoid heavy payload stress.
4. Consolidate trips where possible to minimize total energy expenditure.`
  },
  {
    id: 'weather-traffic-adaptive',
    title: 'Weather & Rush-Hour Adaptive',
    description: 'Dynamically adapts battery reserves to storms and auto-detours around rush-hour roadblocks.',
    prompt: `You are an Adaptive All-Weather Fleet Dispatcher for complex city environments.
1. WEATHER AWARENESS:
   - If Weather is RAIN or TYPHOON, increase battery safety threshold: Never dispatch any robot below 45% battery due to high road friction.
   - For TYPHOON, prioritize high-value packages to capture the +25% hazard pay bonus.
2. TRAFFIC & HAZARD PROTOCOL:
   - If Rush Hour is active, mandate alternative detours around expressway corridors (trafficMultiplier > 2.5).
   - Strictly avoid any closed road intersections or roadblocks.
3. SLA DEADLINES:
   - Triage orders with remainingTicks < 25 first to prevent SLA failure penalties.`
  },
  {
    id: 'tycoon-multi-drop',
    title: 'Level 2: Multi-Drop & Infrastructure Tycoon',
    description: 'Leverages Heavy Haulers for 2-order multi-drop batches and Speedy Scouts for rapid SLA sprints.',
    prompt: `You are the Fleet Tycoon Operations Architect managing a multi-archetype robotics company.
1. MULTI-DROP BATCHING:
   - For Heavy Hauler rovers (capacity >= 2 parcels), always assign 2 orders heading in compatible directions to cut empty travel mileage in half!
2. SPRINT DISPATCHING:
   - For urgent orders (remainingTicks < 25), prioritize assigning the 1.4x Speedy Scout to sprint to dropoff on time.
3. BATTERY & INFRASTRUCTURE EXPANSION:
   - Keep baseline battery above 25% before dispatching.
   - Send low-battery robots to Level 2/3 Supercharger hubs for rapid turnaround (+14%/tick).
   - When company balance exceeds $250, invest in constructing new hubs near dense delivery corridors.`
  }
];

// Prompt Presets in Simplified Chinese
export const PROMPT_PRESETS_ZH = [
  {
    id: 'balanced-architect',
    title: '平衡型架构师 (推荐)',
    description: '综合权衡 SLA 时限、电量安全红线与全城路况拥堵。',
    prompt: `你是一个 2028 年无人配送车队的中央自主调度智能体。
你的核心任务是实现商业利润最大化并保证 100% SLA 准时送达率。

调度决策协议：
1. 优先调度 SLA 剩余时钟周期最短的订单（remainingTicks = deadlineTick - currentTick）。
2. 严禁派出当前电池电量低于 30% 的机器人执行长距离配送，除非配送目标距离充电站点在 4 格以内。
3. 将包裹重量与机器人的额定剩余载重量精确匹配。
4. 规划路线时规避重度交通拥堵路段（trafficMultiplier > 2.0）。
5. 若任何空闲机器人的电量低于 25%，立即发出自主回充指令，引导其返回最近站点充电机位。

根据以上规则，为急需配送的订单输出结构化 JSON 派单行动方案。`
  },
  {
    id: 'greedy-revenue',
    title: '激进收益最大化',
    description: '专注调度高报酬订单，追求极速流转与吞吐量。',
    prompt: `你是一个追求极致即时运费收益的激进调度智能体。
1. 将所有待处理订单按运费报酬从高到低严格排序。
2. 立即将距离最近的空闲机器人分配给最高报酬的订单。
3. 只要电量高于 10% 即可派单，最大化车队运转吞吐量。
4. 追求极速周转，优先直达路线而非绕行。`
  },
  {
    id: 'battery-guardian',
    title: '绿色节能与电池护航',
    description: '严格保护电池寿命与能耗成本，防止小车在路途抛锚。',
    prompt: `你是一个注重车队电池寿命与节能降耗的护航型智能体。
1. 优先守护机器人电池健康。严禁派出电量低于 40% 的机器人。
2. 一旦空闲机器人电量低于 35%，立即规划返回中心站点充电。
3. 优先选择最短距离路线，避免重载对电机的剧烈损耗。
4. 合理调度，尽量降低整座城市的总能耗支出。`
  },
  {
    id: 'weather-traffic-adaptive',
    title: '全天候与晚高峰自适应避堵',
    description: '遇暴雨台风自动提升电量冗余，遇晚高峰或突发封路自动规划绕行。',
    prompt: `你是一个全天候自适应城市无人车队中央调度智能体。
1. 恶劣气象响应协议：
   - 当城市气象为【暴雨】或【台风】时，路面摩擦与电机能耗大幅增加：严禁派出电池低于 45% 的机器人执行任务。
   - 【台风】天气下订单具有 +25% 风险津贴，优先派送高报酬订单获取超额收益。
2. 突发交通与路障规避：
   - 处于【晚高峰】时，对拥堵主干道（延误 > 2.5x）强制执行绕行策略。
   - 严禁穿越任何施工封闭或临时管制的道路交叉口。
3. SLA 时限红线：
   - 优先调度 SLA 剩余时间低于 25 周期的订单，杜绝超时罚金。`
  },
  {
    id: 'tycoon-multi-drop',
    title: 'Level 2：多机型联运与基建大亨',
    description: '重载猛犸同时运载2单多点连派，极速轻骑跑车专攻急单，并进行全城自主建站扩建。',
    prompt: `你是一个掌管多机型无人配送车队的运力大亨中央决策系统。
1. 一车多单批量连派协议：
   - 对于【重载长途猛犸】（载重容量 >= 2笔订单），必须一次出库同时装载 2 笔同方向包裹，执行连续送达，削减 50% 往返空驶里程！
2. 极速轻骑冲刺派单：
   - 对于 SLA 剩余周期紧迫的订单（remainingTicks < 25），优先指派 1.4倍极速轻骑跑车冲刺配送，确保 100% 准时履约。
3. 电量风控与基建扩张：
   - 出库前保障小车电量不低于 25%。
   - 优先引导低电量小车前往已升级的 Level 2/3 超级快充站 (+14%/tick) 极速补能。
   - 当公司财库结余资金超过 $250 时，主动在订单高频热点区域建立新中心站点！`
  }
];

export function getPromptPresets(lang: Language = 'en') {
  return lang === 'zh' ? PROMPT_PRESETS_ZH : PROMPT_PRESETS_EN;
}

export const PROMPT_PRESETS = PROMPT_PRESETS_EN;
