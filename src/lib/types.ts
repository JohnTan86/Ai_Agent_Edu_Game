/**
 * RoboFlow 2028 - AI Agent Architect Learning Game
 * Core TypeScript Definitions & Interfaces
 */

export type Position = { x: number; y: number; lat?: number; lng?: number; zone?: string };

// 1. Core Order Model (as required by specification)
export interface Order {
  id: string;
  sender: string;
  recipientAddress: { x: number; y: number; zone: string; lat?: number; lng?: number };
  deadlineTick: number; // SLA in game ticks
  reward: number;
  weightKg: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  // Additional simulation metadata
  createdAtTick: number;
  pickupHubId: string;
  assignedRobotId?: string;
  deliveredAtTick?: number;
  failedReason?: string;
}

export type RobotArchetype = 'standard' | 'speedy' | 'heavy';

export interface RobotUpgrades {
  cargoExpanded?: boolean;
  solidStateBattery?: boolean;
  turboMotors?: boolean;
}

export interface PlannedMission {
  orderId: string;
  pickupHubId: string;
  routeWaypoints: Array<{ x: number; y: number; lat?: number; lng?: number }>;
  targetDestination: { x: number; y: number; label: string; lat?: number; lng?: number };
  priorityReasoning?: string;
}

// 2. Core Delivery Robot Model (as required by specification)
export interface DeliveryRobot {
  id: string;
  name: string;
  position: { x: number; y: number; lat?: number; lng?: number };
  batteryPct: number; // 0 - 100%
  maxCapacityKg: number;
  currentPayloadKg: number;
  speed: number; // cells per tick
  costPerTick: number; // operational cost per active tick
  status: 'idle' | 'moving' | 'delivering' | 'charging' | 'returning';
  // Additional navigation & state
  homeHubId: string;
  currentOrderId?: string;
  carriedOrderIds?: string[]; // Multiple orders support for Heavy Hauler
  missionQueue?: PlannedMission[]; // Sequential delivery missions queue (zero-idle continuous execution)
  maxOrdersCapacity?: number; // 1 for standard/speedy, 2 for heavy hauler
  archetype?: RobotArchetype;
  speedMultiplier?: number; // 1.4 for speedy, 0.8 for heavy
  batteryDrainMultiplier?: number; // 0.65 for heavy (long range), 1.3 for speedy
  chargingRateMultiplier?: number; // 1.5 for speedy (fast charge), 0.75 for heavy
  upgrades?: RobotUpgrades;
  targetDestination?: { x: number; y: number; label: string; lat?: number; lng?: number };
  pathQueue: Array<{ x: number; y: number; lat?: number; lng?: number }>;
  totalDistanceTraveled: number;
  totalDeliveriesCompleted: number;
  color: string;
}

// 3. Core Agent Dispatch Action (as required by specification)
export interface AgentDispatchAction {
  orderId: string;
  assignedRobotId: string;
  routeWaypoints: Array<{ x: number; y: number; lat?: number; lng?: number }>;
  priorityReasoning: string;
}

// 4. City Hub & Infrastructure
export interface Hub {
  id: string;
  name: string;
  position: { x: number; y: number; lat?: number; lng?: number };
  chargingBays: number;
  availableChargers: number;
  zone: string;
  level?: number; // 1 = Standard, 2 = Dual-bay fast, 3 = Supercharger
  chargingRatePerTick?: number; // % per tick restored
}

// 5. Grid Cell & Traffic Heatmap
export type CellType = 'road' | 'building' | 'hub' | 'charging_pad' | 'water' | 'park';

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  trafficMultiplier: number; // 1.0 = normal, 2.0 = congestion, 3.5 = severe jam
  hubId?: string;
  label?: string;
}

// 6. Agent Configuration & Tools
export type LLMProvider = 'mock' | 'gemini' | 'openai' | 'deepseek';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

export interface AgentTool {
  name: string;
  description: string;
  enabled: boolean;
  parameters: ToolParameter[];
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  temperature: number;
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  enabledTools: string[];
}

// 7. Reasoning & Log Traces
export interface ThoughtStep {
  id: string;
  type: 'observe' | 'tool_call' | 'tool_result' | 'reasoning' | 'dispatch_plan' | 'error';
  timestamp: string;
  tick: number;
  content: string;
  payload?: any;
}

export interface InfrastructureAction {
  action: 'build_hub' | 'upgrade_hub' | 'sell_hub';
  hubId?: string;
  targetLevel?: 2 | 3;
  nodeId?: string;
  hubName?: string;
  lat?: number;
  lng?: number;
  reasoning?: string;
}

export interface DispatchCycleResult {
  cycleId: string;
  tick: number;
  ordersEvaluated: number;
  robotsEvaluated: number;
  actions: AgentDispatchAction[];
  infrastructureActions?: InfrastructureAction[];
  reasoningTrace: ThoughtStep[];
  tokensUsed: number;
  executionTimeMs: number;
}

// 8. Economics & Performance Metrics
export interface PeriodicInvoice {
  period: number;
  tick: number;
  robotCount: number;
  robotMaintenanceTotal: number;
  hubCount: number;
  hubRentTotal: number;
  totalInvoiceCost: number;
}

export interface Financials {
  balance: number; // Current cash ($)
  totalRevenue: number; // Earned from deliveries ($)
  totalExpenses: number; // Mileage + maintenance + energy + SLA penalties ($)
  energyCosts: number;
  mileageCosts: number;
  maintenanceCosts: number;
  hubRentCosts: number;
  slaPenalties: number;
  lastInvoice?: PeriodicInvoice;
}

export interface TelemetryMetrics {
  totalOrdersSpawned: number;
  totalDelivered: number;
  totalFailed: number;
  inTransitCount: number;
  pendingCount: number;
  onTimeDeliveryRate: number; // %
  profitMargin: number; // %
  averageDeliveryTicks: number;
  totalTokensConsumed: number;
  totalTravelTicks: number; // Total ticks spent by moving robots
  agentEfficiencyScore: number; // Formula: (totalDelivered / Math.max(1, totalTravelTicks)) * 100
  fleetUtilizationRate: number; // %
}

// 9. Game State & Scenarios
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'game_over' | 'victory';

export interface GameScenario {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Novice' | 'Architect' | 'Master';
  description: string;
  learningGoal: string;
  gridSize: { width: number; height: number };
  hubs: Hub[];
  initialRobots: DeliveryRobot[];
  initialBalance: number;
  maxTicks: number;
  slaBreachLimit: number; // game over if failed orders reach this
  targetProfitMargin: number;
  ordersQueue: Order[];
  trafficHotspots: Array<{ x: number; y: number; radius: number; multiplier: number }>;
}

export type CityWeather = 'clear' | 'rain' | 'typhoon';

export interface LevelProgression {
  currentLevel: 1 | 2 | 3;
  levelDeliveriesCompleted: number;
  levelTargetDeliveries: number;
  levelTargetCash: number;
  isLevelUpModalOpen: boolean;
  hasDismissedModal?: boolean;
  isEndlessMode?: boolean;
  unlockedFeatures: {
    robotShop: boolean;
    hubUpgrades: boolean;
    hubConstruction: boolean;
    multiOrderCarrying: boolean;
    cityDomination: boolean;
  };
}

export interface SimulationState {
  scenario: GameScenario;
  status: SimulationStatus;
  tick: number;
  speed: 1 | 2 | 5;
  financials: Financials;
  metrics: TelemetryMetrics;
  grid: GridCell[][];
  hubs: Hub[];
  robots: DeliveryRobot[];
  orders: Order[];
  activeActions: AgentDispatchAction[];
  thoughtLogs: ThoughtStep[];
  lastCycleResult?: DispatchCycleResult;
  selectedRobotId?: string;
  selectedOrderId?: string;
  showTrafficHeatmap: boolean;
  gameOverReason?: string;
  language: 'en' | 'zh';
  showReportModal: boolean;
  currentCityId: string;
  mapStyle: 'dark' | 'satellite' | 'streets';
  weather: CityWeather;
  weatherDurationTicks?: number;
  rushHourActive: boolean;
  rushHourDurationTicks?: number;
  roadClosureNodeId?: string;
  roadClosureDurationTicks?: number;
  levelProgression: LevelProgression;
  currentDay?: number;
  dayTick?: number;
  isShiftEnded?: boolean;
  isTournamentMode?: boolean;
  tournamentTargetOrders?: number; // Standard: 100 orders
  tournamentDeliveredCount?: number;
  tournamentFinished?: boolean;
  tournamentResult?: LeaderboardEntry;
}

export interface StudentUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  schoolClass?: string;
  loginType: 'google' | 'classroom';
  loggedInAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  user_id?: string;
  name: string;
  email?: string;
  avatar?: string;
  school_class?: string;
  net_profit: number;
  total_revenue: number;
  total_expenses: number;
  on_time_rate: number;
  orders_delivered: number;
  target_orders: number;
  duration_ticks: number;
  city_id: string;
  prompt_snippet?: string;
  created_at: string;
}

