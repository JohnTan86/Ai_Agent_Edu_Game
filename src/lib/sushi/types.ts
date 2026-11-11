/**
 * SushiFlow: Multi-Agent AI Restaurant Simulation
 * Core Type Definitions & Interfaces
 */

export type SushiAgentRole = 'host' | 'chef' | 'inventory' | 'manager';

export type LLMProvider = 'mock' | 'gemini' | 'openai' | 'deepseek';

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  role: SushiAgentRole;
  parametersDescription: string;
}

export interface SushiAgentConfig {
  role: SushiAgentRole;
  name: string;
  title: string;
  avatar: string;
  color: string;
  systemPrompt: string;
  temperature: number;
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  enabledTools: string[];
  activeTask?: string;
  status: 'idle' | 'thinking' | 'working' | 'alert';
}

export type IngredientKey =
  | 'rice'
  | 'salmon'
  | 'tuna'
  | 'uni'
  | 'wagyu'
  | 'nori'
  | 'wasabi'
  | 'avocado';

export interface IngredientInfo {
  key: IngredientKey;
  name: string;
  unit: string;
  emoji: string;
  costPerUnit: number;
  marketPrice: number;
  reorderPackSize: number;
  currentStock: number;
  maxCapacity: number;
  reorderThreshold: number;
  freshnessPct: number; // 0 - 100%
  description: string;
}

export interface RecipeRequirement {
  ingredient: IngredientKey;
  amount: number;
}

export interface SushiRecipe {
  id: string;
  name: string;
  japaneseName: string;
  emoji: string;
  category: 'nigiri' | 'maki' | 'gunkan' | 'omakase';
  price: number;
  prepTicks: number;
  ingredients: RecipeRequirement[];
  description: string;
  isSpicy?: boolean;
  containsRawFish?: boolean;
}

export type SpecialDietaryTag =
  | 'none'
  | 'no_wasabi'
  | 'no_raw_fish'
  | 'vegetarian'
  | 'vip_critic'
  | 'rush_hurry'
  | 'extra_fresh';

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  arrivalTick: number;
  tableId?: string;
  status:
    | 'in_queue'
    | 'seated_ordering'
    | 'waiting_food'
    | 'eating'
    | 'paying'
    | 'finished'
    | 'walkout';
  orders: {
    recipeId: string;
    quantity: number;
    customNote?: string;
  }[];
  specialPreference: SpecialDietaryTag;
  specialNote: string;
  patienceMax: number;
  patienceRemaining: number;
  eatingTicksRemaining?: number;
  satisfactionStars: number; // 1 to 5
  isVip: boolean;
  billAmount: number;
  tipAmount: number;
  reviewComment?: string;
}

export interface DiningTable {
  id: string;
  name: string;
  type: 'counter' | 'booth';
  capacity: number;
  status: 'empty' | 'occupied' | 'dirty';
  assignedCustomerId?: string;
  cleanliness: number; // 0 to 100
}

export interface KitchenStation {
  id: string;
  name: string;
  emoji: string;
  status: 'idle' | 'prepping' | 'plated' | 'blocked';
  currentTicketId?: string;
  currentRecipeId?: string;
  prepProgress: number; // 0 - 100%
  totalPrepTicks: number;
  remainingPrepTicks: number;
  assignedChef: string;
}

export interface OrderTicket {
  id: string;
  tableId: string;
  customerId: string;
  customerName: string;
  recipeId: string;
  recipeName: string;
  recipeEmoji: string;
  price: number;
  status: 'pending' | 'in_prep' | 'ready_to_serve' | 'served' | 'cancelled';
  createdAtTick: number;
  startedAtTick?: number;
  servedAtTick?: number;
  customNote?: string;
  isSpecialDietary?: boolean;
  kitchenStationId?: string;
}

export interface InterAgentMessage {
  id: string;
  tick: number;
  timestamp: string;
  fromRole: SushiAgentRole;
  toRole: SushiAgentRole | 'all';
  channel: 'order_dispatch' | 'inventory_alert' | 'quality_check' | 'strategy_sync' | 'customer_feedback';
  content: string;
  structuredPayload?: any;
}

export interface AgentThoughtStep {
  id: string;
  agentRole: SushiAgentRole;
  agentName: string;
  tick: number;
  timestamp: string;
  type: 'observe' | 'thought' | 'tool_call' | 'tool_result' | 'message';
  content: string;
  payload?: any;
}

export interface RestaurantFinancials {
  balance: number;
  totalRevenue: number;
  totalExpenses: number;
  procurementCosts: number;
  staffWages: number;
  facilityRent: number;
  wastedSpoilageCosts: number;
  netProfit: number;
  tipsTotal: number;
}

export interface RestaurantMetrics {
  customersServed: number;
  customersWalkout: number;
  averageSatisfactionStars: number;
  averageWaitTicks: number;
  dishesPreparedCount: number;
  spoilageWasteUnits: number;
  vipCustomersServed: number;
  activeOrdersCount: number;
  stockoutIncidentsCount: number;
  agentMessagesSentCount: number;
  efficiencyScore: number; // 0 - 100
}

export type RestaurantStrategyMode = 'balanced' | 'fast_casual' | 'omakase_luxury' | 'budget_saver';

export interface SushiScenario {
  id: string;
  title: string;
  subtitle: string;
  difficulty: 'Novice' | 'Intermediate' | 'Master' | 'Sandbox';
  description: string;
  learningGoal: string;
  initialCash: number;
  maxTicks: number;
  targetServed: number;
  targetRevenue: number;
  targetSatisfaction: number;
  customerArrivalRate: number; // Probability per tick (0.05 to 0.4)
  specialRequestsFrequency: number; // 0.0 to 1.0
  initialStock: Partial<Record<IngredientKey, number>>;
  unlockedAgents: SushiAgentRole[];
}

export type SimulationSpeed = 1 | 2 | 5;

export interface SushiSimulationState {
  scenario: SushiScenario;
  status: 'idle' | 'running' | 'paused' | 'day_ended' | 'victory' | 'failed';
  tick: number;
  day: number;
  speed: SimulationSpeed;
  strategyMode: RestaurantStrategyMode;
  financials: RestaurantFinancials;
  metrics: RestaurantMetrics;
  inventory: Record<IngredientKey, IngredientInfo>;
  tables: DiningTable[];
  customersInQueue: Customer[];
  seatedCustomers: Customer[];
  kitchenStations: KitchenStation[];
  activeTickets: OrderTicket[];
  completedTickets: OrderTicket[];
  agentMessages: InterAgentMessage[];
  thoughtSteps: AgentThoughtStep[];
  rushHourActive: boolean;
  soundEnabled: boolean;
  selectedAgentRole: SushiAgentRole;
  selectedTableId?: string;
  selectedCustomerId?: string;
  selectedStationId?: string;
  selectedIngredientKey?: IngredientKey;
  endReason?: string;
}
