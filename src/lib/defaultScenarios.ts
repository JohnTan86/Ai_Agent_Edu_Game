import { GameScenario, Hub, DeliveryRobot, Order, GridCell } from './types';
import { GRID_WIDTH, GRID_HEIGHT } from './constants';

export function createEmptyGrid(width = GRID_WIDTH, height = GRID_HEIGHT): GridCell[][] {
  const grid: GridCell[][] = [];

  for (let x = 0; x < width; x++) {
    grid[x] = [];
    for (let y = 0; y < height; y++) {
      // Default to road/pavement
      grid[x][y] = {
        x,
        y,
        type: 'road',
        trafficMultiplier: 1.0
      };
    }
  }

  // Generate buildings / obstacles in city blocks
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      // Create urban block pattern with streets every 3-4 tiles
      const isRoadX = (x % 3 === 0);
      const isRoadY = (y % 3 === 0);

      if (!isRoadX && !isRoadY) {
        // City building cluster
        grid[x][y].type = 'building';
      }
    }
  }

  // Create a scenic park or water canal in the center
  for (let y = 8; y <= 9; y++) {
    for (let x = 7; x <= 10; x++) {
      if (grid[x] && grid[x][y]) {
        grid[x][y].type = 'park';
      }
    }
  }

  return grid;
}

export function applyTrafficHotspots(
  grid: GridCell[][],
  hotspots: Array<{ x: number; y: number; radius: number; multiplier: number }>
) {
  hotspots.forEach(spot => {
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        const dist = Math.hypot(x - spot.x, y - spot.y);
        if (dist <= spot.radius && grid[x][y].type === 'road') {
          grid[x][y].trafficMultiplier = Math.max(grid[x][y].trafficMultiplier, spot.multiplier);
        }
      }
    }
  });
}

// 1. Hubs Configuration
const HUBS: Hub[] = [
  {
    id: 'hub-alpha',
    name: 'Alpha Hub (Downtown)',
    position: { x: 3, y: 3 },
    chargingBays: 3,
    availableChargers: 3,
    zone: 'Downtown'
  },
  {
    id: 'hub-beta',
    name: 'Beta Hub (Tech Park)',
    position: { x: 15, y: 6 },
    chargingBays: 3,
    availableChargers: 3,
    zone: 'Tech Park'
  },
  {
    id: 'hub-gamma',
    name: 'Gamma Hub (Waterfront)',
    position: { x: 6, y: 15 },
    chargingBays: 2,
    availableChargers: 2,
    zone: 'Waterfront'
  }
];

// 2. Initial Delivery Robot Fleet
export function getInitialRobots(): DeliveryRobot[] {
  return [
    {
      id: 'bot-01',
      name: 'CyberRover-01',
      position: { x: 3, y: 3 },
      batteryPct: 95,
      maxCapacityKg: 10,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.15,
      status: 'idle',
      homeHubId: 'hub-alpha',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#06b6d4' // Cyan
    },
    {
      id: 'bot-02',
      name: 'AeroBot-02',
      position: { x: 3, y: 4 },
      batteryPct: 88,
      maxCapacityKg: 6,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.18,
      status: 'idle',
      homeHubId: 'hub-alpha',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#3b82f6' // Blue
    },
    {
      id: 'bot-03',
      name: 'HeavyHauler-X',
      position: { x: 15, y: 6 },
      batteryPct: 75,
      maxCapacityKg: 20,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.25,
      status: 'idle',
      homeHubId: 'hub-beta',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#10b981' // Emerald
    },
    {
      id: 'bot-04',
      name: 'SwiftPulse-04',
      position: { x: 6, y: 15 },
      batteryPct: 62,
      maxCapacityKg: 8,
      currentPayloadKg: 0,
      speed: 1,
      costPerTick: 0.14,
      status: 'idle',
      homeHubId: 'hub-gamma',
      pathQueue: [],
      totalDistanceTraveled: 0,
      totalDeliveriesCompleted: 0,
      color: '#f59e0b' // Amber
    }
  ];
}

// 3. Initial Queued Orders
export function getInitialOrders(): Order[] {
  return [
    {
      id: '101',
      sender: 'NeuroMed Corp',
      recipientAddress: { x: 9, y: 3, zone: 'Central Labs' },
      deadlineTick: 38,
      reward: 48,
      weightKg: 3.5,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'hub-alpha'
    },
    {
      id: '102',
      sender: 'Quantum Silicon Ltd',
      recipientAddress: { x: 12, y: 12, zone: 'Silicon Ridge' },
      deadlineTick: 45,
      reward: 65,
      weightKg: 8.0,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'hub-beta'
    },
    {
      id: '103',
      sender: 'FreshBento Express',
      recipientAddress: { x: 3, y: 12, zone: 'Residences' },
      deadlineTick: 28,
      reward: 35,
      weightKg: 2.0,
      status: 'pending',
      createdAtTick: 1,
      pickupHubId: 'hub-alpha'
    },
    {
      id: '104',
      sender: 'Industrial RoboTech',
      recipientAddress: { x: 15, y: 15, zone: 'Harbor Gate' },
      deadlineTick: 60,
      reward: 90,
      weightKg: 14.0,
      status: 'pending',
      createdAtTick: 4,
      pickupHubId: 'hub-gamma'
    },
    {
      id: '105',
      sender: 'OpticFiber Core',
      recipientAddress: { x: 9, y: 15, zone: 'South Marina' },
      deadlineTick: 40,
      reward: 52,
      weightKg: 4.2,
      status: 'pending',
      createdAtTick: 8,
      pickupHubId: 'hub-gamma'
    },
    {
      id: '106',
      sender: 'BioSyn Vaccine Labs',
      recipientAddress: { x: 0, y: 6, zone: 'West Hospital' },
      deadlineTick: 32,
      reward: 70,
      weightKg: 1.8,
      status: 'pending',
      createdAtTick: 12,
      pickupHubId: 'hub-alpha'
    }
  ];
}

// 4. Scenarios
export const DEFAULT_SCENARIOS: GameScenario[] = [
  {
    id: 'scenario-1-metro',
    title: 'Neo-Singapore 2028: Downtown Grid',
    subtitle: 'Phase 1 Training Grounds',
    difficulty: 'Novice',
    description: 'Learn the fundamentals of prompt design, tool selection, and basic fleet routing across three interconnected city logistics hubs.',
    learningGoal: 'Design a system prompt that balances SLA deadlines with basic payload capacity to ensure high on-time delivery.',
    gridSize: { width: GRID_WIDTH, height: GRID_HEIGHT },
    hubs: HUBS,
    initialRobots: getInitialRobots(),
    initialBalance: 1200,
    maxTicks: 120,
    slaBreachLimit: 3,
    targetProfitMargin: 40,
    ordersQueue: getInitialOrders(),
    trafficHotspots: [
      { x: 9, y: 6, radius: 2.5, multiplier: 2.2 } // Moderate Downtown congestion
    ]
  },
  {
    id: 'scenario-2-rush-hour',
    title: 'Central Artery Rush Hour',
    subtitle: 'Traffic Jam & Fast Detours',
    difficulty: 'Architect',
    description: 'Heavy traffic snarls the central corridor. Agents that fail to query traffic telemetry will face severe delivery delays and SLA penalties.',
    learningGoal: 'Enable traffic tools and instruct the agent to evaluate congested zones before finalizing waypoints.',
    gridSize: { width: GRID_WIDTH, height: GRID_HEIGHT },
    hubs: HUBS,
    initialRobots: getInitialRobots(),
    initialBalance: 1000,
    maxTicks: 140,
    slaBreachLimit: 2,
    targetProfitMargin: 45,
    ordersQueue: getInitialOrders(),
    trafficHotspots: [
      { x: 6, y: 6, radius: 3.5, multiplier: 3.5 },
      { x: 12, y: 9, radius: 2.5, multiplier: 3.0 }
    ]
  },
  {
    id: 'scenario-3-battery-crunch',
    title: 'Tropical Storm: Battery Crisis',
    subtitle: 'Energy Safeguards & Charging Protocols',
    difficulty: 'Master',
    description: 'High winds deplete robot batteries rapidly. The agent must orchestrate autonomous returns to charging hubs before robots run out of juice mid-route.',
    learningGoal: 'Implement battery reserve thresholds in your system prompt and utilize the order_battery_recharge tool.',
    gridSize: { width: GRID_WIDTH, height: GRID_HEIGHT },
    hubs: HUBS,
    initialRobots: getInitialRobots().map(r => ({ ...r, batteryPct: Math.max(30, r.batteryPct - 35) })),
    initialBalance: 800,
    maxTicks: 150,
    slaBreachLimit: 2,
    targetProfitMargin: 35,
    ordersQueue: getInitialOrders(),
    trafficHotspots: [
      { x: 3, y: 9, radius: 3.0, multiplier: 2.8 },
      { x: 15, y: 12, radius: 3.0, multiplier: 2.8 }
    ]
  }
];
