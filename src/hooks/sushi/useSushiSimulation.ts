import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Customer,
  DiningTable,
  IngredientKey,
  KitchenStation,
  SimulationSpeed,
  SpecialDietaryTag,
  SushiAgentConfig,
  SushiAgentRole,
  SushiScenario,
  SushiSimulationState,
  SushiBranch,
  AgentThoughtStep,
  InterAgentMessage
} from '../../lib/sushi/types';
import { INITIAL_INGREDIENTS, SUSHI_RECIPES } from '../../lib/sushi/recipes';
import { DEFAULT_SUSHI_AGENTS } from '../../lib/sushi/defaultAgents';
import { SUSHI_SCENARIOS } from '../../lib/sushi/defaultScenarios';
import { executeMultiAgentCycle, executeDirectSushiDispatch } from '../../lib/sushi/agentEngine';
import { sushiAudio } from '../../lib/sushi/audio';
import { AVAILABLE_STAFF_CANDIDATES, DAILY_MARKET_CONDITIONS, MarketCondition, StaffCandidate } from '../../lib/sushi/staffConfig';
import { getSushiClockInfo, TICKS_PER_DAY } from '../../lib/sushi/timeConstants';
import { BranchLocationCandidate, spawnCustomerForBranch } from '../../lib/sushi/branchConfig';

const INITIAL_TABLES: DiningTable[] = [
  { id: 'T1', name: '吧台 1 號席', type: 'counter', capacity: 1, status: 'empty', cleanliness: 100 },
  { id: 'T2', name: '吧台 2 號席', type: 'counter', capacity: 1, status: 'empty', cleanliness: 100 },
  { id: 'T3', name: '吧台 3 號席', type: 'counter', capacity: 1, status: 'empty', cleanliness: 100 },
  { id: 'T4', name: '庭園 4 號桌', type: 'booth', capacity: 2, status: 'empty', cleanliness: 100 },
  { id: 'T5', name: '櫻花 5 號桌', type: 'booth', capacity: 4, status: 'empty', cleanliness: 100 },
  { id: 'T6', name: '松木 6 號桌', type: 'booth', capacity: 4, status: 'empty', cleanliness: 100 }
];

const INITIAL_STATIONS: KitchenStation[] = [
  { id: 'ST1', name: '一號 握壽司台', emoji: '🍣', status: 'idle', prepProgress: 0, totalPrepTicks: 4, remainingPrepTicks: 0, assignedChef: '健次' },
  { id: 'ST2', name: '二號 軍艦卷物台', emoji: '🍱', status: 'idle', prepProgress: 0, totalPrepTicks: 5, remainingPrepTicks: 0, assignedChef: '健次' },
  { id: 'ST3', name: '三號 特選炙燒台', emoji: '🔥', status: 'idle', prepProgress: 0, totalPrepTicks: 6, remainingPrepTicks: 0, assignedChef: '健次' }
];

const SAMPLE_NAMES = [
  '佐藤 健一', '田中 美咲', '高橋 雄大', '鈴木 蓮', '渡邊 結衣',
  '伊藤 拓真', '中村 櫻花', '小林 義雄', '加藤 玲奈', '松本 準一郎',
  'David (美食探店)', 'Sophia (外籍留學生)', '山本 教授 (素食學者)'
];

export function useSushiSimulation(initialScenarioId: string = 'scenario_level_1') {
  const [currentScenario, setCurrentScenario] = useState<SushiScenario>(() => {
    return SUSHI_SCENARIOS.find(s => s.id === initialScenarioId) || SUSHI_SCENARIOS[0];
  });

  const [agents, setAgents] = useState<Record<SushiAgentRole, SushiAgentConfig>>(() => {
    return JSON.parse(JSON.stringify(DEFAULT_SUSHI_AGENTS));
  });

  // Sync API Key from Global Portal Hub if available
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('eduagent_gemini_key') || localStorage.getItem('eduagent_api_key');
      const savedProvider = (localStorage.getItem('eduagent_provider') as any) || (savedKey ? 'gemini' : null);
      if (savedKey) {
        setAgents(prev => {
          const next = { ...prev };
          let changed = false;
          for (const role of Object.keys(next) as SushiAgentRole[]) {
            if (!next[role].apiKey) {
              next[role] = {
                ...next[role],
                apiKey: savedKey,
                provider: (savedProvider === 'openai' || savedProvider === 'deepseek' || savedProvider === 'gemini') ? savedProvider : 'gemini',
                model: next[role].model === 'local-heuristic' ? 'gemini-2.5-flash' : next[role].model
              };
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const createInitialState = (scenario: SushiScenario): SushiSimulationState => {
    const inv = JSON.parse(JSON.stringify(INITIAL_INGREDIENTS));
    if (scenario.initialStock) {
      for (const [k, v] of Object.entries(scenario.initialStock)) {
        if (inv[k as IngredientKey]) {
          inv[k as IngredientKey].currentStock = v;
        }
      }
    }

    const initialTables = JSON.parse(JSON.stringify(INITIAL_TABLES));
    const initialStations = JSON.parse(JSON.stringify(INITIAL_STATIONS));
    const initialBranch: SushiBranch = {
      id: 'branch_ginza',
      name: '江戶前・銀座旗艦總店',
      districtName: '東京都 中央區 銀座',
      lat: 35.6719,
      lng: 139.7648,
      emoji: '⛩️',
      establishedAtDay: 1,
      tables: initialTables,
      customersInQueue: [],
      seatedCustomers: [],
      kitchenStations: initialStations,
      activeTickets: [],
      completedTickets: [],
      hiredStaff: [],
      metrics: {
        customersServed: 0,
        customersWalkout: 0,
        revenue: 0,
        satisfaction: 5.0
      }
    };

    return {
      scenario,
      status: 'idle',
      tick: 0,
      day: 1,
      speed: 1,
      strategyMode: 'balanced',
      financials: {
        balance: scenario.initialCash,
        totalRevenue: 0,
        totalExpenses: 0,
        procurementCosts: 0,
        staffWages: 0,
        facilityRent: 0,
        wastedSpoilageCosts: 0,
        netProfit: 0,
        tipsTotal: 0
      },
      metrics: {
        customersServed: 0,
        customersWalkout: 0,
        averageSatisfactionStars: 5.0,
        cumulativeSatisfactionStars: 25,
        averageWaitTicks: 0,
        dishesPreparedCount: 0,
        spoilageWasteUnits: 0,
        vipCustomersServed: 0,
        activeOrdersCount: 0,
        stockoutIncidentsCount: 0,
        agentMessagesSentCount: 0,
        efficiencyScore: 100
      },
      inventory: inv,
      tables: initialTables,
      customersInQueue: [],
      seatedCustomers: [],
      kitchenStations: JSON.parse(JSON.stringify(INITIAL_STATIONS)),
      activeTickets: [],
      completedTickets: [],
      branches: [initialBranch],
      activeBranchId: 'branch_ginza',
      hasReachedMaxTables: false,
      agentMessages: [
        {
          id: 'welcome_msg',
          tick: 0,
          timestamp: '11:00:00',
          fromRole: 'manager',
          toRole: 'all',
          channel: 'strategy_sync',
          content: '【開店早會】各位夥伴好！今天壽司店正式營業，請各位 Agent 緊密配合，全力以赴！'
        }
      ],
      thoughtSteps: [],
      rushHourActive: false,
      soundEnabled: true,
      selectedAgentRole: 'host',
      hiredStaff: [],
      isShiftEnded: false,
      marketCondition: DAILY_MARKET_CONDITIONS[0],
      dailySettlements: []
    };
  };

  const [state, setState] = useState<SushiSimulationState>(() => createInitialState(currentScenario));
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAgentExecuting, setIsAgentExecuting] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  /**
   * Spawn a customer customized to the specific branch's district, clientele and tastes
   */
  const spawnCustomer = useCallback((isRush: boolean = false, forceVip: boolean = false, targetBranchId?: string): Customer => {
    const branchId = targetBranchId || stateRef.current.activeBranchId || 'branch_ginza';
    const currentMarket = stateRef.current.marketCondition || DAILY_MARKET_CONDITIONS[0];
    const vipBonus = currentMarket.vipChanceBonus || 0;
    const freq = currentScenario.specialRequestsFrequency || 0.25;

    return spawnCustomerForBranch(
      branchId,
      stateRef.current.tick,
      isRush,
      forceVip,
      vipBonus,
      freq
    );
  }, [currentScenario]);

  /**
   * Main simulation tick execution
   */
  const stepSimulation = useCallback(async () => {
    const s = stateRef.current;
    if (s.status !== 'running' && s.status !== 'idle') return;

    const nextTick = s.tick + 1;

    // 1. Check customer patience and handle walkouts
    let updatedQueue = [...s.customersInQueue];
    let updatedSeated = [...s.seatedCustomers];
    let walkoutsThisTick = 0;

    // Decay queue patience
    updatedQueue = updatedQueue.filter(c => {
      c.patienceRemaining -= 1;
      if (c.patienceRemaining <= 0) {
        walkoutsThisTick += 1;
        s.thoughtSteps.push({
          id: `walkout_queue_${c.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          agentRole: 'host',
          agentName: agentsRef.current.host.name,
          tick: nextTick,
          timestamp: new Date().toLocaleTimeString(),
          type: 'observe',
          content: `【顧客離去】隊列中的顧客【${c.name}】因久候不耐離店！`
        });
        return false;
      }
      return true;
    });

    // Decay waiting food patience
    updatedSeated = updatedSeated.filter(c => {
      if (c.status === 'waiting_food') {
        c.patienceRemaining -= 1;
        if (c.patienceRemaining <= 0) {
          walkoutsThisTick += 1;
          const tbl = s.tables.find(t => t.id === c.tableId);
          if (tbl) {
            tbl.status = 'empty';
            tbl.assignedCustomerId = undefined;
          }
          s.thoughtSteps.push({
            id: `walkout_seat_${c.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            agentRole: 'host',
            agentName: agentsRef.current.host.name,
            tick: nextTick,
            timestamp: new Date().toLocaleTimeString(),
            type: 'observe',
            content: `【客訴離席】已入座的顧客【${c.name}】因後廚出餐過慢憤而離席！`
          });
          return false;
        }
      }
      return true;
    });

    const currentDay = s.day || 1;
    const clockInfo = getSushiClockInfo(nextTick, currentDay, s.isShiftEnded);

    // 2. Customer spawning with irregular arrival rate & market trends
    const baseArrivalRate = s.scenario.customerArrivalRate;
    const clockMultiplier = clockInfo.arrivalMultiplier;
    const marketMultiplier = s.marketCondition?.arrivalMultiplier || 1.0;
    const rushMultiplier = s.rushHourActive ? 2.0 : 1.0;
    const effectiveArrival = baseArrivalRate * clockMultiplier * marketMultiplier * rushMultiplier;

    // During open business hours (before last call / closing), spawn customers for active branch
    if (clockInfo.shiftPhase !== 'closed' && clockInfo.shiftPhase !== 'last_call') {
      if (Math.random() < effectiveArrival && updatedQueue.length < 10) {
        const newCust = spawnCustomer(s.rushHourActive, false, s.activeBranchId);
        updatedQueue.push(newCust);
      }
    }

    // 3. Update walkout metrics and satisfaction score
    const currentStars = s.metrics.cumulativeSatisfactionStars ?? 25;
    const newCumulativeStars = currentStars + (walkoutsThisTick * 1.0); // each walkout counts as 1 star
    const newWalkouts = s.metrics.customersWalkout + walkoutsThisTick;
    const totalReviews = 5 + s.metrics.customersServed + newWalkouts;
    const computedSatisfaction = Math.max(1.0, Math.min(5.0, Number((newCumulativeStars / totalReviews).toFixed(1))));

    // Deduct periodic facility rent and staff payroll overhead every 10 ticks
    const currentFinancials = { ...s.financials };
    const currentThoughts = [...s.thoughtSteps];
    if (nextTick > 0 && nextTick % 10 === 0 && s.scenario.difficulty !== 'Sandbox') {
      const rentAmount = 8;
      const staffPayroll = (s.hiredStaff || []).reduce((acc, st) => acc + st.wagePer10Ticks, 0);
      const totalPeriodicExpense = rentAmount + staffPayroll;

      currentFinancials.balance -= totalPeriodicExpense;
      currentFinancials.totalExpenses += totalPeriodicExpense;
      currentFinancials.facilityRent += rentAmount;
      currentFinancials.staffWages += staffPayroll;

      currentThoughts.push({
        id: `overhead_deduct_${nextTick}_${Date.now()}`,
        agentRole: 'manager',
        agentName: agentsRef.current.manager?.name || '櫻 (Sakura)',
        tick: nextTick,
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
        type: 'observe',
        content: `【定期營運成本結算】店租水電 -$${rentAmount}，發放 ${(s.hiredStaff || []).length} 位員工工資 -$${staffPayroll}（總支出: -$${totalPeriodicExpense}，當前可用結餘: $${currentFinancials.balance.toFixed(0)}）。`
      });
    }

    // Multi-Agent Decision Loop for Active Branch
    const draftState: SushiSimulationState = {
      ...s,
      tick: nextTick,
      financials: currentFinancials,
      thoughtSteps: currentThoughts,
      customersInQueue: updatedQueue,
      seatedCustomers: updatedSeated,
      metrics: {
        ...s.metrics,
        customersWalkout: newWalkouts,
        cumulativeSatisfactionStars: newCumulativeStars,
        averageSatisfactionStars: computedSatisfaction
      }
    };

    const result = await executeMultiAgentCycle(draftState, agentsRef.current);

    // 4. Simulate Background Non-Active Branches independently
    let extraBgRevenue = 0;
    let extraBgServed = 0;
    let extraBgExpenses = 0;

    const updatedBranches = (s.branches || []).map(b => {
      if (b.id === s.activeBranchId) {
        return {
          ...b,
          tables: result.updatedTables,
          customersInQueue: result.updatedCustomersInQueue,
          seatedCustomers: result.updatedSeatedCustomers,
          kitchenStations: result.updatedKitchenStations,
          activeTickets: result.updatedActiveTickets,
          completedTickets: result.updatedCompletedTickets,
          hiredStaff: s.hiredStaff || [],
          metrics: {
            customersServed: result.updatedMetrics.customersServed,
            customersWalkout: result.updatedMetrics.customersWalkout,
            revenue: result.updatedFinancials.totalRevenue,
            satisfaction: result.updatedMetrics.averageSatisfactionStars
          }
        };
      }

      // Autonomous independent simulation for background branches
      let bgQueue = [...(b.customersInQueue || [])];
      let bgSeated = [...(b.seatedCustomers || [])];
      let bgTables = [...(b.tables || [])];
      let bgStations = JSON.parse(JSON.stringify(b.kitchenStations && b.kitchenStations.length > 0 ? b.kitchenStations : INITIAL_STATIONS));
      let bgTickets = [...(b.activeTickets || [])];
      let bgCompleted = [...(b.completedTickets || [])];
      const bgStaff = b.hiredStaff || [];
      const bgMetrics = { ...(b.metrics || { customersServed: 0, customersWalkout: 0, revenue: 0, satisfaction: 5.0 }) };

      // Background branch periodic expenses (rent + its own staff wages)
      if (nextTick > 0 && nextTick % 10 === 0 && s.scenario.difficulty !== 'Sandbox') {
        const bgStaffPayroll = bgStaff.reduce((sum, st) => sum + st.wagePer10Ticks, 0);
        const bgRent = 8;
        extraBgExpenses += (bgStaffPayroll + bgRent);
      }

      // Background branch customer patience decay
      bgQueue = bgQueue.filter(c => {
        c.patienceRemaining -= 1;
        if (c.patienceRemaining <= 0) {
          bgMetrics.customersWalkout += 1;
          return false;
        }
        return true;
      });

      // Background branch seated diners progress
      bgSeated = bgSeated.filter(c => {
        if (c.status === 'eating') {
          if (!c.eatingTicksRemaining) c.eatingTicksRemaining = 5;
          c.eatingTicksRemaining -= 1;
          if (c.eatingTicksRemaining <= 0) {
            const earned = c.billAmount + (c.tipAmount || 0);
            bgMetrics.revenue += earned;
            bgMetrics.customersServed += 1;
            extraBgRevenue += earned;
            extraBgServed += 1;

            const tbl = bgTables.find(t => t.id === c.tableId);
            if (tbl) {
              tbl.status = 'empty';
              tbl.assignedCustomerId = undefined;
            }
            return false;
          }
        } else if (c.status === 'waiting_food') {
          c.patienceRemaining -= 1;
          if (c.patienceRemaining <= 0) {
            bgMetrics.customersWalkout += 1;
            const tbl = bgTables.find(t => t.id === c.tableId);
            if (tbl) {
              tbl.status = 'empty';
              tbl.assignedCustomerId = undefined;
            }
            return false;
          }
        }
        return true;
      });

      // Background branch kitchen station progress
      bgStations.forEach((st: KitchenStation) => {
        if (st.status === 'prepping') {
          st.remainingPrepTicks = Math.max(0, st.remainingPrepTicks - 1);
          if (st.remainingPrepTicks <= 0) {
            st.status = 'idle';
            const waitingDiner = bgSeated.find(c => c.status === 'waiting_food');
            if (waitingDiner) {
              waitingDiner.status = 'eating';
              waitingDiner.eatingTicksRemaining = 5;
            }
          }
        }
      });

      // Start cooking for waiting diners if station idle
      const waitingForFood = bgSeated.filter(c => c.status === 'waiting_food');
      if (waitingForFood.length > 0) {
        const idleStation = bgStations.find((st: KitchenStation) => st.status === 'idle');
        if (idleStation) {
          idleStation.status = 'prepping';
          idleStation.remainingPrepTicks = 4;
        }
      }

      // Seat queuing customers into empty tables
      const emptyTable = bgTables.find(t => t.status === 'empty');
      if (emptyTable && bgQueue.length > 0) {
        const guest = bgQueue.shift()!;
        guest.status = 'waiting_food';
        guest.tableId = emptyTable.id;
        emptyTable.status = 'occupied';
        emptyTable.assignedCustomerId = guest.id;
        bgSeated.push(guest);
      }

      // Background customer spawning
      if (clockInfo.shiftPhase !== 'closed' && clockInfo.shiftPhase !== 'last_call') {
        if (Math.random() < 0.25 && bgQueue.length < 6) {
          const bgCust = spawnCustomerForBranch(b.id, nextTick, false, false, 0, 0.2);
          bgQueue.push(bgCust);
        }
      }

      return {
        ...b,
        tables: bgTables,
        customersInQueue: bgQueue,
        seatedCustomers: bgSeated,
        kitchenStations: bgStations,
        activeTickets: bgTickets,
        completedTickets: bgCompleted,
        hiredStaff: bgStaff,
        metrics: bgMetrics
      };
    });

    if (extraBgRevenue > 0 || extraBgExpenses > 0) {
      result.updatedFinancials.balance += (extraBgRevenue - extraBgExpenses);
      result.updatedFinancials.totalRevenue += extraBgRevenue;
      result.updatedFinancials.totalExpenses += extraBgExpenses;
    }

    // 5. Check Scenario End Conditions (Bankruptcy < 0, Satisfaction <= 3.0, Victory, MaxTicks)
    let newStatus: SushiSimulationState['status'] = s.status;
    let endReason: string | undefined = undefined;

    // Check if shift reached 21:00 closing (100 ticks per day)
    let isDayShiftEnded = s.isShiftEnded;
    if (clockInfo.dayTick >= TICKS_PER_DAY && !isDayShiftEnded) {
      isDayShiftEnded = true;
      sushiAudio.playFanfare();
      currentThoughts.push({
        id: `shift_end_${currentDay}_${Date.now()}`,
        agentRole: 'manager',
        agentName: agentsRef.current.manager?.name || '櫻 (Sakura)',
        tick: nextTick,
        timestamp: '21:00:00',
        type: 'observe',
        content: `🌇【第 ${currentDay} 天 21:00 打烊收工】今日營業時段圓滿結束！請檢閱今日收支結算，並點擊「🌅 進入第 ${currentDay + 1} 天」準備明日開工！`
      });
      newStatus = 'paused';
      setIsReportOpen(true);
    }

    if (result.updatedFinancials.balance < 0) {
      newStatus = 'failed';
      endReason = `【餐廳破產 Game Over】資金赤字已達 $${result.updatedFinancials.balance.toFixed(0)}（小於 $0），現金流斷裂無法繼續營運！請優化食材採購與員工薪資支出。`;
      sushiAudio.playAlert();
      setIsReportOpen(true);
    } else if (result.updatedMetrics.averageSatisfactionStars <= 3.0) {
      newStatus = 'failed';
      endReason = `【口碑崩盤 Game Over】顧客平均滿意度已跌至 ${result.updatedMetrics.averageSatisfactionStars.toFixed(1)} 顆星（下滑至 3.0 顆星門檻），食客紛紛留下負評抵制，餐廳被迫歇業！`;
      sushiAudio.playAlert();
      setIsReportOpen(true);
    } else if (result.updatedMetrics.customersServed >= s.scenario.targetServed && s.scenario.difficulty !== 'Sandbox') {
      newStatus = 'victory';
      endReason = `🎉 恭喜達成營運目標！共成功接待 ${result.updatedMetrics.customersServed} 位客人，總營收 $${result.updatedFinancials.totalRevenue.toFixed(0)}！`;
      sushiAudio.playFanfare();
      setIsReportOpen(true);
    } else if (nextTick >= s.scenario.maxTicks && s.scenario.difficulty !== 'Sandbox') {
      newStatus = 'day_ended';
      endReason = `營業總週期已達上限（已達 ${s.scenario.maxTicks} 刻度）。`;
      setIsReportOpen(true);
    }

    setState(prev => ({
      ...prev,
      tick: nextTick,
      status: newStatus,
      isShiftEnded: isDayShiftEnded,
      endReason,
      branches: updatedBranches,
      inventory: result.updatedInventory,
      financials: result.updatedFinancials,
      metrics: result.updatedMetrics,
      tables: result.updatedTables,
      customersInQueue: result.updatedCustomersInQueue,
      seatedCustomers: result.updatedSeatedCustomers,
      kitchenStations: result.updatedKitchenStations,
      activeTickets: result.updatedActiveTickets,
      completedTickets: result.updatedCompletedTickets,
      agentMessages: [...result.newMessages, ...prev.agentMessages].slice(0, 50),
      thoughtSteps: [...result.thoughtSteps, ...prev.thoughtSteps].slice(0, 60)
    }));
  }, [spawnCustomer]);

  // Timer reference for simulation loop
  useEffect(() => {
    if (state.status !== 'running') return;

    const intervalMs = state.speed === 1 ? 900 : (state.speed === 2 ? 450 : 180);
    const timer = setInterval(() => {
      stepSimulation();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [state.status, state.speed, stepSimulation]);

  /** Controls */
  const togglePlay = () => {
    setState(prev => ({
      ...prev,
      status: prev.status === 'running' ? 'paused' : 'running'
    }));
  };

  const setSpeed = (spd: SimulationSpeed) => {
    setState(prev => ({ ...prev, speed: spd }));
  };

  const stepForward = () => {
    stepSimulation();
  };

  const reset = (scenarioId?: string) => {
    const sc = scenarioId ? SUSHI_SCENARIOS.find(s => s.id === scenarioId) || currentScenario : currentScenario;
    if (scenarioId && sc) {
      setCurrentScenario(sc);
    }
    setState(createInitialState(sc));
    setIsReportOpen(false);
  };

  const selectScenario = (id: string) => {
    const sc = SUSHI_SCENARIOS.find(s => s.id === id);
    if (sc) {
      setCurrentScenario(sc);
      reset(sc.id);
    }
  };

  const spawnCustomerManually = (forceVip: boolean = false, burstCount: number = 1) => {
    const newCusts: Customer[] = [];
    for (let i = 0; i < burstCount; i++) {
      newCusts.push(spawnCustomer(state.rushHourActive, forceVip, state.activeBranchId));
    }

    setState(prev => {
      const updatedQueue = [...prev.customersInQueue, ...newCusts];
      const isDanger = updatedQueue.length >= 6;
      const newThoughts = [...prev.thoughtSteps];

      const updatedBranches = (prev.branches || []).map(b => {
        if (b.id === prev.activeBranchId) {
          return {
            ...b,
            customersInQueue: updatedQueue
          };
        }
        return b;
      });

      if (isDanger) {
        newThoughts.unshift({
          id: `th_burst_warn_${Date.now()}`,
          agentRole: 'host',
          agentName: agentsRef.current.host.name,
          tick: prev.tick,
          timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
          type: 'observe',
          content: `⚠️【排隊告急預警】手動攬客使候位隊列膨脹至 ${updatedQueue.length} 人！顧客耐心消耗極快，後廚出餐不及將引發大量客訴離店（滿意度跌破 3.0 即 Game Over）！`
        });
      } else {
        newThoughts.unshift({
          id: `th_burst_${Date.now()}`,
          agentRole: 'host',
          agentName: agentsRef.current.host.name,
          tick: prev.tick,
          timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
          type: 'tool_call',
          content: forceVip
            ? `👑【手動邀約 VIP】米其林神秘客進店！請阿葵優先接待、健次嚴守忌口！`
            : burstCount > 1
            ? `🎉【發動街頭吸客潮】吸引 ${burstCount} 位新顧客湧入！考驗產能與翻台平衡！`
            : `📢【外場主動攬客】引導 1 位新顧客進入候位排隊。`
        });
      }

      return {
        ...prev,
        branches: updatedBranches,
        customersInQueue: updatedQueue,
        thoughtSteps: newThoughts
      };
    });

    sushiAudio.playOrderTaken();
  };

  /**
   * Hire a staff assistant member for the active branch
   */
  const hireStaff = useCallback((candidate: StaffCandidate): boolean => {
    const s = stateRef.current;
    if (s.hiredStaff?.some(st => st.id === candidate.id)) return false;
    if (s.financials.balance < candidate.hireCost) {
      alert(`資金不足！聘用【${candidate.name}】需要簽約金 $${candidate.hireCost}，當前結餘僅 $${s.financials.balance.toFixed(0)}。`);
      return false;
    }

    setState(prev => {
      const updatedBalance = prev.financials.balance - candidate.hireCost;
      const updatedExpenses = prev.financials.totalExpenses + candidate.hireCost;
      const updatedStaffWages = prev.financials.staffWages + candidate.hireCost;
      const updatedHired = [...(prev.hiredStaff || []), candidate];

      const updatedBranches = (prev.branches || []).map(b => {
        if (b.id === prev.activeBranchId) {
          return {
            ...b,
            hiredStaff: updatedHired
          };
        }
        return b;
      });

      const activeBranchName = prev.branches?.find(b => b.id === prev.activeBranchId)?.name || '分店';

      sushiAudio.playPayment();

      return {
        ...prev,
        hiredStaff: updatedHired,
        branches: updatedBranches,
        financials: {
          ...prev.financials,
          balance: updatedBalance,
          totalExpenses: updatedExpenses,
          staffWages: updatedStaffWages
        },
        thoughtSteps: [
          {
            id: `th_hire_${candidate.id}_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager?.name || '櫻 (Sakura)',
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'tool_call',
            content: `🤝【招聘新員工入職】成功為【${activeBranchName}】聘用【${candidate.name}】擔任【${candidate.roleTitle}】！支付簽約金 $${candidate.hireCost}，每期工資 $${candidate.wagePer10Ticks}。特長：${candidate.perks}`
          },
          ...prev.thoughtSteps
        ]
      };
    });
    return true;
  }, []);

  /**
   * Dismiss/fire a staff member from active branch
   */
  const fireStaff = useCallback((staffId: string) => {
    setState(prev => {
      const target = prev.hiredStaff?.find(s => s.id === staffId);
      if (!target) return prev;

      const updatedHired = (prev.hiredStaff || []).filter(s => s.id !== staffId);
      const updatedBranches = (prev.branches || []).map(b => {
        if (b.id === prev.activeBranchId) {
          return {
            ...b,
            hiredStaff: updatedHired
          };
        }
        return b;
      });

      const activeBranchName = prev.branches?.find(b => b.id === prev.activeBranchId)?.name || '分店';

      return {
        ...prev,
        hiredStaff: updatedHired,
        branches: updatedBranches,
        thoughtSteps: [
          {
            id: `th_fire_${staffId}_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager?.name || '櫻 (Sakura)',
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'tool_call',
            content: `👋【員工解聘資遣】店長為【${activeBranchName}】辦理解聘【${target.name}】（${target.roleTitle}），停止計發後續每期工資 $${target.wagePer10Ticks}，以降低固定營運成本。`
          },
          ...prev.thoughtSteps
        ]
      };
    });
  }, []);

  /**
   * Transition to next day shift (08:00/11:00 AM Open) like RoboFlow
   */
  const startNextDay = useCallback(() => {
    setState(prev => {
      const nextDay = (prev.day || 1) + 1;
      const nextTick = (nextDay - 1) * TICKS_PER_DAY;
      const nextMarket = DAILY_MARKET_CONDITIONS[(nextDay - 1) % DAILY_MARKET_CONDITIONS.length];

      sushiAudio.playFanfare();

      return {
        ...prev,
        day: nextDay,
        tick: nextTick,
        isShiftEnded: false,
        status: 'idle',
        marketCondition: nextMarket,
        customersInQueue: [],
        thoughtSteps: [
          {
            id: `th_day_start_${nextDay}_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager?.name || '櫻 (Sakura)',
            tick: nextTick,
            timestamp: '11:00:00',
            type: 'observe',
            content: `🌅【第 ${nextDay} 天 開工營業 (11:00 AM)】今日市況：${nextMarket.emoji}【${nextMarket.title}】— ${nextMarket.description} 全體員工已就位！請點擊「開始運行」開門迎賓！`
          },
          ...prev.thoughtSteps
        ]
      };
    });
    setIsReportOpen(false);
  }, []);

  const toggleRushHour = () => {
    setState(prev => ({
      ...prev,
      rushHourActive: !prev.rushHourActive
    }));
  };

  const toggleSound = () => {
    const nextVal = !state.soundEnabled;
    sushiAudio.setEnabled(nextVal);
    setState(prev => ({ ...prev, soundEnabled: nextVal }));
  };

  /**
   * Expand restaurant capacity by adding a new dining table ($150)
   * Maximum capacity: 16 tables per branch.
   * Upon reaching 16 tables, unlocks opening new branches on Google Map!
   */
  const addTable = useCallback((customType?: 'counter' | 'booth'): boolean => {
    const s = stateRef.current;
    const cost = 150;

    if (s.tables.length >= 16) {
      setState(prev => ({
        ...prev,
        hasReachedMaxTables: true,
        thoughtSteps: [
          {
            id: `th_max_tables_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager.name,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'thought',
            content: `⚠️【席位已達上限】本店空間已擴展至最高容量 16 席！已解鎖「🗺️ 開設新分店」功能！請點擊頂部或地圖按鈕，選擇新的商圈開設全新分店！`
          },
          ...prev.thoughtSteps
        ]
      }));
      return false;
    }

    if (s.financials.balance < cost) {
      sushiAudio.playAlert();
      setState(prev => ({
        ...prev,
        thoughtSteps: [
          {
            id: `th_err_funds_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager.name,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'thought',
            content: `❌【擴建失敗】資金不足！增設一張餐桌需要 $${cost}，目前結餘僅有 $${prev.financials.balance.toFixed(0)}。`
          },
          ...prev.thoughtSteps
        ]
      }));
      return false;
    }

    const existingIds = new Set(s.tables.map(t => t.id));
    const candidateOrder = ['T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16'];
    const nextId = candidateOrder.find(id => !existingIds.has(id)) || `T${s.tables.length + 1}`;

    const tableDefs: Record<string, { name: string; type: 'counter' | 'booth'; capacity: number }> = {
      T7: { name: '吧台 7 號席', type: 'counter', capacity: 1 },
      T8: { name: '楓葉 8 號桌', type: 'booth', capacity: 2 },
      T9: { name: '特等 9 號席', type: 'counter', capacity: 1 },
      T10: { name: '富士 10 號桌', type: 'booth', capacity: 4 },
      T11: { name: '板前 11 號席', type: 'counter', capacity: 1 },
      T12: { name: '竹林 12 號桌', type: 'booth', capacity: 2 },
      T13: { name: '茶室 13 號桌', type: 'booth', capacity: 2 },
      T14: { name: '枯山 14 號桌', type: 'booth', capacity: 2 },
      T15: { name: '鶴羽 15 號桌', type: 'booth', capacity: 4 },
      T16: { name: '御所 16 號桌', type: 'booth', capacity: 4 }
    };

    const def = tableDefs[nextId] || {
      name: `雅座 ${nextId}`,
      type: customType || 'counter',
      capacity: (customType || 'counter') === 'counter' ? 1 : 2
    };

    const newTable: DiningTable = {
      id: nextId,
      name: def.name,
      type: def.type,
      capacity: def.capacity,
      status: 'empty',
      cleanliness: 100
    };

    sushiAudio.playPayment();

    setState(prev => {
      const nextTables = [...prev.tables, newTable];
      const reachedMax = nextTables.length >= 16;
      const updatedBranches = (prev.branches || []).map(b => {
        if (b.id === prev.activeBranchId) {
          return {
            ...b,
            tables: nextTables
          };
        }
        return b;
      });

      return {
        ...prev,
        financials: {
          ...prev.financials,
          balance: prev.financials.balance - cost,
          totalExpenses: prev.financials.totalExpenses + cost,
          facilityRent: prev.financials.facilityRent + cost
        },
        branches: updatedBranches,
        tables: nextTables,
        hasReachedMaxTables: reachedMax,
        thoughtSteps: [
          {
            id: `th_add_table_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager.name,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'observe',
            content: reachedMax
              ? `🎊【席位達最高上限 (16席)！】投資 $${cost} 成功添置【${newTable.name}】！本店席位已達到最高 16 席滿座容量，正式解鎖「🗺️ 開設新分店」連鎖特許經營模式！可隨時點擊 Google Map 開設下一個商圈分店！`
              : `🎉【店面擴建】投資 $${cost} 成功添置【${newTable.name}】（${newTable.type === 'counter' ? '吧台單人席' : `${newTable.capacity}人雅座`}）！目前總席位擴增至 ${nextTables.length}/16 席！`
          },
          ...prev.thoughtSteps
        ]
      };
    });

    return true;
  }, []);

  /**
   * Open a new branch location on the Google Map
   */
  const openNewBranch = useCallback((candidate: BranchLocationCandidate): boolean => {
    const s = stateRef.current;
    const cost = candidate.openingCost;

    if (s.financials.balance < cost) {
      sushiAudio.playAlert();
      setState(prev => ({
        ...prev,
        thoughtSteps: [
          {
            id: `th_err_branch_funds_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager.name,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'thought',
            content: `❌【開設分店失敗】資金不足！開設【${candidate.name}】需要開辦金 $${cost}，目前結餘僅有 $${prev.financials.balance.toFixed(0)}。`
          },
          ...prev.thoughtSteps
        ]
      }));
      return false;
    }

    const newBranchId = `branch_${Date.now()}`;
    const initialTablesForBranch: DiningTable[] = JSON.parse(JSON.stringify(INITIAL_TABLES));
    const initialStationsForBranch: KitchenStation[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));

    const newBranch: SushiBranch = {
      id: newBranchId,
      name: candidate.name,
      districtName: candidate.districtName || '日本 (Japan)',
      lat: candidate.lat,
      lng: candidate.lng,
      emoji: candidate.emoji || '🍣',
      establishedAtDay: s.day,
      tables: initialTablesForBranch,
      customersInQueue: [],
      seatedCustomers: [],
      kitchenStations: initialStationsForBranch,
      activeTickets: [],
      completedTickets: [],
      hiredStaff: [],
      metrics: {
        customersServed: 0,
        customersWalkout: 0,
        revenue: 0,
        satisfaction: 5.0
      }
    };

    // Also sync the current branch's full operational state before switching
    const updatedBranches = (s.branches || []).map(b => {
      if (b.id === s.activeBranchId) {
        return {
          ...b,
          tables: s.tables,
          customersInQueue: s.customersInQueue,
          seatedCustomers: s.seatedCustomers,
          kitchenStations: s.kitchenStations,
          activeTickets: s.activeTickets,
          completedTickets: s.completedTickets,
          hiredStaff: s.hiredStaff,
          metrics: {
            customersServed: s.metrics.customersServed,
            customersWalkout: s.metrics.customersWalkout,
            revenue: s.financials.totalRevenue,
            satisfaction: s.metrics.averageSatisfactionStars
          }
        };
      }
      return b;
    });
    updatedBranches.push(newBranch);

    sushiAudio.playFanfare();

    setState(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        balance: prev.financials.balance - cost,
        totalExpenses: prev.financials.totalExpenses + cost,
        facilityRent: prev.financials.facilityRent + cost
      },
      branches: updatedBranches,
      activeBranchId: newBranchId,
      tables: initialTablesForBranch,
      customersInQueue: [],
      seatedCustomers: [],
      kitchenStations: initialStationsForBranch,
      activeTickets: [],
      completedTickets: [],
      hiredStaff: [],
      hasReachedMaxTables: initialTablesForBranch.length >= 16,
      thoughtSteps: [
        {
          id: `th_branch_opened_${Date.now()}`,
          agentRole: 'manager',
          agentName: agentsRef.current.manager.name,
          tick: prev.tick,
          timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
          type: 'observe',
          content: `🏢🎉【全新分店正式開幕！】壽司物語【${newBranch.name}】（${candidate.districtName}）盛大開業！獨立配置專屬商圈客群、6張精緻餐桌與獨立後廚，實景動畫已切換至新分行！`
        },
        ...prev.thoughtSteps
      ]
    }));

    return true;
  }, []);

  /**
   * Switch the active branch view and simulation tables
   */
  const selectBranch = useCallback((branchId: string) => {
    setState(prev => {
      if (prev.activeBranchId === branchId) return prev;
      const targetBranch = (prev.branches || []).find(b => b.id === branchId);
      if (!targetBranch) return prev;

      // Update currently active branch with all current operational state
      const updatedBranches = (prev.branches || []).map(b => {
        if (b.id === prev.activeBranchId) {
          return {
            ...b,
            tables: prev.tables,
            customersInQueue: prev.customersInQueue,
            seatedCustomers: prev.seatedCustomers,
            kitchenStations: prev.kitchenStations,
            activeTickets: prev.activeTickets,
            completedTickets: prev.completedTickets,
            hiredStaff: prev.hiredStaff,
            metrics: {
              customersServed: prev.metrics.customersServed,
              customersWalkout: prev.metrics.customersWalkout,
              revenue: prev.financials.totalRevenue,
              satisfaction: prev.metrics.averageSatisfactionStars
            }
          };
        }
        return b;
      });

      sushiAudio.playOrderTaken();

      const nextTables = targetBranch.tables && targetBranch.tables.length > 0
        ? targetBranch.tables
        : JSON.parse(JSON.stringify(INITIAL_TABLES));

      const nextStations = targetBranch.kitchenStations && targetBranch.kitchenStations.length > 0
        ? targetBranch.kitchenStations
        : JSON.parse(JSON.stringify(INITIAL_STATIONS));

      const validTableIds = new Set((nextTables as DiningTable[]).map(t => t.id));
      const cleanSeated = (targetBranch.seatedCustomers || []).filter(c => c.tableId && validTableIds.has(c.tableId));

      return {
        ...prev,
        branches: updatedBranches,
        activeBranchId: branchId,
        tables: nextTables,
        customersInQueue: targetBranch.customersInQueue || [],
        seatedCustomers: cleanSeated,
        kitchenStations: nextStations,
        activeTickets: targetBranch.activeTickets || [],
        completedTickets: targetBranch.completedTickets || [],
        hiredStaff: targetBranch.hiredStaff || [],
        hasReachedMaxTables: (nextTables.length ?? 6) >= 16,
        thoughtSteps: [
          {
            id: `th_branch_switch_${Date.now()}`,
            agentRole: 'manager',
            agentName: agentsRef.current.manager.name,
            tick: prev.tick,
            timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
            type: 'observe',
            content: `🔀【分行視角切換】切換監控分行至【${targetBranch.name}】。獨立候位隊列 (${(targetBranch.customersInQueue || []).length}人)、就座食客 (${(targetBranch.seatedCustomers || []).length}人)、員工陣容 (${(targetBranch.hiredStaff || []).length}人) 與實景餐桌席位已就緒！`
          },
          ...prev.thoughtSteps
        ]
      };
    });
  }, []);

  const updateAgentConfig = (role: SushiAgentRole, updates: Partial<SushiAgentConfig>) => {
    setAgents(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...updates
      }
    }));
  };

  const selectAgent = (role: SushiAgentRole) => {
    setState(prev => ({ ...prev, selectedAgentRole: role }));
  };

  const runManualAgentTurn = async () => {
    setIsAgentExecuting(true);
    const selectedRole = state.selectedAgentRole;
    const currentAgent = agentsRef.current[selectedRole];

    if (currentAgent && currentAgent.provider !== 'mock') {
      const requestPayload = {
        role: selectedRole,
        provider: currentAgent.provider,
        model: currentAgent.model,
        apiKey: currentAgent.apiKey,
        systemPrompt: currentAgent.systemPrompt,
        currentTick: state.tick,
        tables: state.tables,
        customersInQueue: state.customersInQueue,
        seatedCustomers: state.seatedCustomers,
        kitchenStations: state.kitchenStations,
        activeTickets: state.activeTickets,
        inventory: state.inventory,
        financials: state.financials,
        enabledTools: currentAgent.enabledTools
      };

      try {
        let data: any = null;
        try {
          const res = await fetch('/api/sushi-dispatch', {
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
            // Static hosting fallback to direct client LLM call
            data = await executeDirectSushiDispatch(requestPayload);
          }
        } catch (fetchErr: any) {
          if (data && data.error) {
            throw fetchErr;
          }
          data = await executeDirectSushiDispatch(requestPayload);
        }

        const timestamp = new Date().toLocaleTimeString('zh-TW', { hour12: false });

        if (data.error) {
          const errText = data.error;
          setState(prev => ({
            ...prev,
            thoughtSteps: [
              {
                id: `th_err_${Date.now()}`,
                agentRole: selectedRole,
                agentName: `${currentAgent.name} [${currentAgent.provider.toUpperCase()}]`,
                tick: prev.tick,
                timestamp,
                type: 'thought',
                content: `❌【${currentAgent.provider.toUpperCase()} 呼叫異常】${errText}`
              },
              ...prev.thoughtSteps
            ]
          }));
          sushiAudio.playAlert();
        } else {
          const llmResult = data.result || {};
          const thoughtContent = llmResult.thought || llmResult.rawText || '已完成即時分析';
          const newThoughtSteps: AgentThoughtStep[] = [
            {
              id: `th_llm_${Date.now()}_1`,
              agentRole: selectedRole,
              agentName: `${currentAgent.name} [${currentAgent.provider.toUpperCase()}]`,
              tick: state.tick,
              timestamp,
              type: 'thought',
              content: `🧠【${currentAgent.provider.toUpperCase()} 原生推理】${thoughtContent}`
            }
          ];

          if (llmResult.toolCall?.name) {
            newThoughtSteps.push({
              id: `th_llm_${Date.now()}_2`,
              agentRole: selectedRole,
              agentName: `${currentAgent.name} [${currentAgent.provider.toUpperCase()}]`,
              tick: state.tick,
              timestamp,
              type: 'tool_call',
              content: `執行工具 ${llmResult.toolCall.name}(${JSON.stringify(llmResult.toolCall.params || {})})`
            });
          }

          const newMessages: InterAgentMessage[] = [];
          if (llmResult.messageToTeam) {
            newMessages.push({
              id: `msg_llm_${Date.now()}`,
              tick: state.tick,
              timestamp,
              fromRole: selectedRole,
              toRole: 'all',
              channel: 'strategy_sync',
              content: `【${currentAgent.provider.toUpperCase()} 廣播】${llmResult.messageToTeam}`
            });
          }

          setState(prev => ({
            ...prev,
            thoughtSteps: [...newThoughtSteps, ...prev.thoughtSteps],
            agentMessages: [...newMessages, ...prev.agentMessages]
          }));

          sushiAudio.playOrderTaken();
        }
      } catch (e: any) {
        setState(prev => ({
          ...prev,
          thoughtSteps: [
            {
              id: `th_err_${Date.now()}`,
              agentRole: selectedRole,
              agentName: `${currentAgent.name} [${currentAgent.provider.toUpperCase()}]`,
              tick: prev.tick,
              timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false }),
              type: 'thought',
              content: `❌【網路連線異常】無法發送請求至 /api/sushi-dispatch: ${e?.message || e}`
            },
            ...prev.thoughtSteps
          ]
        }));
      }
    }

    await stepSimulation();
    setIsAgentExecuting(false);
  };

  return {
    state,
    agents,
    currentScenario,
    isReportOpen,
    isHelpOpen,
    isAgentExecuting,
    setIsReportOpen,
    setIsHelpOpen,
    togglePlay,
    setSpeed,
    stepForward,
    reset,
    selectScenario,
    spawnCustomerManually,
    toggleRushHour,
    toggleSound,
    updateAgentConfig,
    selectAgent,
    runManualAgentTurn,
    addTable,
    openNewBranch,
    selectBranch,
    hireStaff,
    fireStaff,
    startNextDay
  };
}
