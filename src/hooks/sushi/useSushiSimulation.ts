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
  SushiSimulationState
} from '../../lib/sushi/types';
import { INITIAL_INGREDIENTS, SUSHI_RECIPES } from '../../lib/sushi/recipes';
import { DEFAULT_SUSHI_AGENTS } from '../../lib/sushi/defaultAgents';
import { SUSHI_SCENARIOS } from '../../lib/sushi/defaultScenarios';
import { executeMultiAgentCycle, executeDirectSushiDispatch } from '../../lib/sushi/agentEngine';
import { sushiAudio } from '../../lib/sushi/audio';

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
      tables: JSON.parse(JSON.stringify(INITIAL_TABLES)),
      customersInQueue: [],
      seatedCustomers: [],
      kitchenStations: JSON.parse(JSON.stringify(INITIAL_STATIONS)),
      activeTickets: [],
      completedTickets: [],
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
      selectedAgentRole: 'host'
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
   * Spawn a customer with random or special order
   */
  const spawnCustomer = useCallback((isRush: boolean = false, forceVip: boolean = false): Customer => {
    const custId = `CUST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const avatars = ['🧑‍💼', '👩‍💻', '👨‍🎨', '👵', '👴', '👱‍♂️', '👩‍🦰', '🧔'];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    const specialChance = forceVip ? 1.0 : currentScenario.specialRequestsFrequency;
    const isSpecial = Math.random() < specialChance;

    let specialPreference: SpecialDietaryTag = 'none';
    let specialNote = '';
    let isVip = forceVip || Math.random() < 0.15;

    if (isVip) {
      specialPreference = 'vip_critic';
      specialNote = '米其林指南秘密稽查員，對鮮度要求極高！';
    } else if (isSpecial) {
      const roll = Math.random();
      if (roll < 0.35) {
        specialPreference = 'no_wasabi';
        specialNote = '對芥末辛辣敏感，要求【不要放山葵/芥末】';
      } else if (roll < 0.65) {
        specialPreference = 'vegetarian';
        specialNote = '嚴格素食主義者，【僅食用酪梨蔬食卷】';
      } else {
        specialPreference = 'rush_hurry';
        specialNote = '趕搭高鐵班次，要求出餐必須極速！';
      }
    }

    // Select recipes based on preference
    const recipeKeys = Object.keys(SUSHI_RECIPES);
    const orders: { recipeId: string; quantity: number }[] = [];

    if (specialPreference === 'vegetarian') {
      orders.push({ recipeId: 'veggie_roll', quantity: 1 });
    } else if (isVip) {
      orders.push({ recipeId: 'omakase_supreme', quantity: 1 });
    } else {
      // 1-2 random items
      const pick1 = recipeKeys[Math.floor(Math.random() * (recipeKeys.length - 1))];
      orders.push({ recipeId: pick1, quantity: 1 });
      if (Math.random() < 0.4) {
        const pick2 = recipeKeys[Math.floor(Math.random() * (recipeKeys.length - 1))];
        orders.push({ recipeId: pick2, quantity: 1 });
      }
    }

    const billAmount = orders.reduce((acc, o) => acc + (SUSHI_RECIPES[o.recipeId]?.price || 15) * o.quantity, 0);
    const patienceMax = isVip ? 70 : (specialPreference === 'rush_hurry' ? 45 : 80);

    return {
      id: custId,
      name: isVip ? `【VIP】${name}` : name,
      avatar,
      arrivalTick: stateRef.current.tick,
      status: 'in_queue',
      orders,
      specialPreference,
      specialNote,
      patienceMax,
      patienceRemaining: patienceMax,
      satisfactionStars: 5,
      isVip,
      billAmount,
      tipAmount: 0
    };
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

    // 2. Customer spawning probability
    const arrivalRate = s.rushHourActive ? s.scenario.customerArrivalRate * 2.2 : s.scenario.customerArrivalRate;
    if (Math.random() < arrivalRate && updatedQueue.length < 8) {
      const newCust = spawnCustomer(s.rushHourActive);
      updatedQueue.push(newCust);
    }

    // 3. Multi-Agent Decision Loop
    const draftState: SushiSimulationState = {
      ...s,
      tick: nextTick,
      customersInQueue: updatedQueue,
      seatedCustomers: updatedSeated,
      metrics: {
        ...s.metrics,
        customersWalkout: s.metrics.customersWalkout + walkoutsThisTick
      }
    };

    const result = await executeMultiAgentCycle(draftState, agentsRef.current);

    // 4. Check Scenario End Conditions
    let newStatus: SushiSimulationState['status'] = s.status;
    let endReason: string | undefined = undefined;

    if (result.updatedMetrics.customersServed >= s.scenario.targetServed && s.scenario.difficulty !== 'Sandbox') {
      newStatus = 'victory';
      endReason = `恭喜達成營運目標！共成功接待 ${result.updatedMetrics.customersServed} 位客人，總營收 $${result.updatedFinancials.totalRevenue.toFixed(0)}！`;
      sushiAudio.playFanfare();
      setIsReportOpen(true);
    } else if (nextTick >= s.scenario.maxTicks && s.scenario.difficulty !== 'Sandbox') {
      newStatus = 'day_ended';
      endReason = `本日營業時間已結束（已達 ${s.scenario.maxTicks} 刻度）。`;
      setIsReportOpen(true);
    } else if (result.updatedFinancials.balance < -100) {
      newStatus = 'failed';
      endReason = '現金流枯竭破產！請優化採購與支出策略。';
      sushiAudio.playAlert();
      setIsReportOpen(true);
    }

    setState(prev => ({
      ...prev,
      tick: nextTick,
      status: newStatus,
      endReason,
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

  const spawnCustomerManually = (forceVip: boolean = false) => {
    const newCust = spawnCustomer(state.rushHourActive, forceVip);
    setState(prev => ({
      ...prev,
      customersInQueue: [...prev.customersInQueue, newCust]
    }));
  };

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
    runManualAgentTurn
  };
}
