'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SimulationState,
  AgentConfig,
  GameScenario,
  CityWeather,
  DeliveryRobot,
  Hub,
  InfrastructureAction,
  StudentUser
} from '../lib/types';
import { DEFAULT_SCENARIOS } from '../lib/defaultScenarios';
import {
  SYSTEM_TOOLS,
  PROMPT_PRESETS_EN,
  PROMPT_PRESETS_ZH,
  getPromptPresets,
  formatSimTimestamp,
  TICKS_PER_DAY,
  ROBOT_SHOP_CONFIG,
  UPGRADE_PRICES
} from '../lib/constants';
import { initializeSimulationState, advanceTick, applyDispatchActionsToState, startNextDayShift } from '../lib/simulation';
import { runAgentDispatchCycle } from '../lib/agentEngine';
import { Language } from '../lib/i18n';
import { CITIES_DATA, getCitySectorStatus } from '../lib/cityData';

function applyInfrastructureActions(state: SimulationState, actions?: InfrastructureAction[]): SimulationState {
  if (!actions || actions.length === 0) return state;
  let nextState = { ...state };
  let balance = nextState.financials.balance;
  let totalExpenses = nextState.financials.totalExpenses;
  let totalRevenue = nextState.financials.totalRevenue;
  let nextHubs = [...nextState.hubs];
  let nextLogs = [...nextState.thoughtLogs];
  const isZh = nextState.language === 'zh';

  for (const act of actions) {
    if (act.action === 'build_hub' && act.lat && act.lng) {
      const price = UPGRADE_PRICES.NEW_HUB_CONSTRUCTION;
      if (balance >= price) {
        balance -= price;
        totalExpenses += price;
        const newHubId = `${nextState.currentCityId}-hub-${Date.now().toString(36).slice(-4)}`;
        const newHub: Hub = {
          id: newHubId,
          name: act.hubName || (isZh ? '新拓建中心站' : 'New Logistics Hub'),
          position: { x: 8, y: 8, lat: act.lat, lng: act.lng },
          chargingBays: 2,
          availableChargers: 2,
          zone: act.hubName || 'City Corridor',
          level: 1,
          chargingRatePerTick: 7.0
        };
        nextHubs.push(newHub);
        nextLogs.unshift({
          id: `infra-build-${nextState.tick}-${Date.now()}`,
          type: 'observe',
          timestamp: formatSimTimestamp(nextState.tick),
          tick: nextState.tick,
          content: isZh
            ? `【自主基建·投资建站】大模型执行建站指令：全新充电站点 [${newHub.name}] 正式竣工通电！耗资: -$${price}。`
            : `[AUTONOMOUS INFRASTRUCTURE] LLM constructed new hub: [${newHub.name}]! Cost: -$${price}.`
        });
      }
    } else if (act.action === 'upgrade_hub' && act.hubId) {
      const targetLevel = act.targetLevel === 3 ? 3 : 2;
      const price = targetLevel === 3 ? UPGRADE_PRICES.HUB_LEVEL_3 : UPGRADE_PRICES.HUB_LEVEL_2;
      const hubIdx = nextHubs.findIndex(h => h.id === act.hubId);
      if (hubIdx >= 0 && balance >= price) {
        balance -= price;
        totalExpenses += price;
        const oldHub = nextHubs[hubIdx];
        nextHubs[hubIdx] = {
          ...oldHub,
          level: targetLevel,
          chargingBays: targetLevel === 3 ? 4 : 2,
          chargingRatePerTick: targetLevel === 3 ? 14.0 : 9.0
        };
        nextLogs.unshift({
          id: `infra-upgrade-${nextState.tick}-${Date.now()}`,
          type: 'observe',
          timestamp: formatSimTimestamp(nextState.tick),
          tick: nextState.tick,
          content: isZh
            ? `【自主基建·站点升级】大模型指令生效：[${oldHub.name}] 成功升级至 Lv.${targetLevel} 快充站！耗资: -$${price}。`
            : `[AUTONOMOUS UPGRADE] LLM upgraded [${oldHub.name}] to Level ${targetLevel}! Cost: -$${price}.`
        });
      }
    }
  }

  return {
    ...nextState,
    financials: {
      ...nextState.financials,
      balance,
      totalExpenses,
      totalRevenue
    },
    hubs: nextHubs,
    thoughtLogs: nextLogs
  };
}

export function useSimulation(initialScenario: GameScenario = DEFAULT_SCENARIOS[0]) {
  // 1. Simulation Game State
  const [state, setState] = useState<SimulationState>(() => initializeSimulationState(initialScenario));

  // 2. Language State
  const [lang, setLang] = useState<Language>('en');
  const toggleLang = useCallback(() => {
    setLang(prevLang => {
      const nextLang: Language = prevLang === 'en' ? 'zh' : 'en';

      // Automatically switch system prompt if it matches a preset
      setAgentConfig(prevConfig => {
        const presetsOld = getPromptPresets(prevLang);
        const presetsNew = getPromptPresets(nextLang);

        const matchedIndex = presetsOld.findIndex(
          p => p.prompt.trim() === prevConfig.systemPrompt.trim()
        );

        if (matchedIndex !== -1) {
          return {
            ...prevConfig,
            systemPrompt: presetsNew[matchedIndex].prompt
          };
        } else if (
          prevConfig.systemPrompt.trim() === PROMPT_PRESETS_EN[0].prompt.trim() ||
          prevConfig.systemPrompt.trim() === PROMPT_PRESETS_ZH[0].prompt.trim()
        ) {
          return {
            ...prevConfig,
            systemPrompt: presetsNew[0].prompt
          };
        }
        return prevConfig;
      });

      setState(prevState => ({ ...prevState, language: nextLang }));
      return nextLang;
    });
  }, []);

  // 3. Evaluation Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const openReport = useCallback(() => setIsReportOpen(true), []);
  const closeReport = useCallback(() => setIsReportOpen(false), []);

  useEffect(() => {
    if (state.showReportModal) {
      setIsReportOpen(true);
    }
  }, [state.showReportModal]);

  // Tournament, Leaderboard & Student Profile States
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTournamentFinishOpen, setIsTournamentFinishOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('roboflow_student_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load student user profile:', e);
    }
  }, []);

  const saveStudentUser = useCallback((user: StudentUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('roboflow_student_user', JSON.stringify(user));
    } catch (e) {}
  }, []);

  const logoutStudentUser = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('roboflow_student_user');
    } catch (e) {}
  }, []);

  const openLeaderboard = useCallback(() => setIsLeaderboardOpen(true), []);
  const closeLeaderboard = useCallback(() => setIsLeaderboardOpen(false), []);
  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);
  const openTournamentFinishModal = useCallback(() => setIsTournamentFinishOpen(true), []);
  const closeTournamentFinishModal = useCallback(() => setIsTournamentFinishOpen(false), []);

  // When 100 orders are completed in Tournament mode, auto-open TournamentFinishModal
  useEffect(() => {
    if (state.isTournamentMode && state.tournamentFinished) {
      setIsTournamentFinishOpen(true);
    }
  }, [state.isTournamentMode, state.tournamentFinished]);

  const startTournamentMode = useCallback((cityId?: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    isAgentExecutingRef.current = false;
    setIsAgentExecuting(false);
    const targetCity = cityId || stateRef.current.currentCityId || 'singapore';
    setState(prev => {
      const next = initializeSimulationState(prev.scenario, targetCity, 2, {
        isTournamentMode: true,
        tournamentTargetOrders: 100
      });
      stateRef.current = next;
      return next;
    });
  }, []);

  const exitTournamentMode = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    isAgentExecutingRef.current = false;
    setIsAgentExecuting(false);
    setState(prev => {
      const next = initializeSimulationState(prev.scenario, prev.currentCityId, 1);
      stateRef.current = next;
      return next;
    });
  }, []);

  // 4. Agent Workspace Config
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: 'Dispatcher-Alpha',
    systemPrompt: '', // Empty by default in Level 1 so player learns to prompt from scratch
    temperature: 0.2,
    provider: 'mock',
    model: 'local-mock-heuristic',
    apiKey: '',
    enabledTools: SYSTEM_TOOLS.filter(t => t.enabled).map(t => t.name)
  });

  const [isAgentExecuting, setIsAgentExecuting] = useState(false);

  // 5. Playback Loop Timer & Mutable State Synchronization Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const agentConfigRef = useRef(agentConfig);
  agentConfigRef.current = agentConfig;
  const isAgentExecutingRef = useRef(isAgentExecuting);
  isAgentExecutingRef.current = isAgentExecuting;
  const dispatchCooldownTicksRef = useRef<number>(0);
  const promptIterationsRef = useRef<number>(1);

  const getIntervalMs = (speed: 1 | 2 | 5) => {
    switch (speed) {
      case 5: return 200;
      case 2: return 500;
      case 1:
      default: return 1000;
    }
  };

  const play = useCallback(() => {
    setState(prev => {
      if (prev.status === 'game_over') return prev;
      return { ...prev, status: 'running' };
    });
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  // 6. Run Agent Dispatch Cycle (Pre-Shift 08:00 AM Planning or Manual Re-Dispatch)
  const runDispatchCycle = useCallback(async () => {
    if (isAgentExecutingRef.current) return;
    isAgentExecutingRef.current = true;
    setIsAgentExecuting(true);
    promptIterationsRef.current += 1;

    try {
      const current = stateRef.current;
      const result = await runAgentDispatchCycle(
        agentConfigRef.current,
        current.tick,
        current.orders,
        current.robots,
        current.grid,
        current.hubs,
        {
          weather: current.weather,
          rushHourActive: current.rushHourActive,
          roadClosureNodeId: current.roadClosureNodeId,
          financials: current.financials
        }
      );

      setState(prev => {
        const stateWithInfra = applyInfrastructureActions(prev, result.infrastructureActions);
        const updated = applyDispatchActionsToState(stateWithInfra, result.actions);
        stateRef.current = updated;
        return {
          ...updated,
          lastCycleResult: result,
          thoughtLogs: [...result.reasoningTrace, ...updated.thoughtLogs].slice(0, 100),
          metrics: {
            ...updated.metrics,
            totalTokensConsumed: updated.metrics.totalTokensConsumed + result.tokensUsed
          }
        };
      });
    } catch (err: any) {
      console.error('Dispatch cycle error:', err);
    } finally {
      isAgentExecutingRef.current = false;
      setIsAgentExecuting(false);
    }
  }, []);

  const startNextDay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    isAgentExecutingRef.current = false;
    setIsAgentExecuting(false);
    setState(prev => {
      const next = startNextDayShift(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const togglePlay = useCallback(async () => {
    const current = stateRef.current;
    if (current.status === 'game_over') return;

    if (current.status === 'running') {
      setState(prev => ({ ...prev, status: 'paused' }));
      return;
    }

    // If the day's 08:00-18:00 shift already ended, transition to 08:00 AM of the next day first
    if (current.isShiftEnded) {
      startNextDay();
      return;
    }

    // If at 08:00 AM pre-shift and orders haven't been planned yet, run LLM Pre-Shift Planning FIRST while clock stays at 08:00 AM!
    const hasPending = current.orders.some(o => o.status === 'pending');
    const hasInTransit = current.orders.some(o => o.status === 'in_transit');
    if (hasPending && !hasInTransit && !isAgentExecutingRef.current) {
      await runDispatchCycle();
    }

    setState(prev => {
      if (prev.status === 'game_over') return prev;
      return { ...prev, status: 'running' };
    });
  }, [runDispatchCycle, startNextDay]);

  const setSpeed = useCallback((speed: 1 | 2 | 5) => {
    setState(prev => ({ ...prev, speed }));
  }, []);

  const stepForward = useCallback(() => {
    setState(prev => advanceTick(prev, agentConfig.systemPrompt));
  }, [agentConfig.systemPrompt]);

  const reset = useCallback((scenario?: GameScenario, targetLevel?: 1 | 2 | 3) => {
    if (timerRef.current) clearInterval(timerRef.current);
    isAgentExecutingRef.current = false;
    setIsAgentExecuting(false);
    setIsReportOpen(false);
    promptIterationsRef.current = 1;
    setState(prev => {
      const lvl = targetLevel ?? prev.levelProgression?.currentLevel ?? 1;
      return initializeSimulationState(scenario || prev.scenario, prev.currentCityId, lvl);
    });
  }, []);

  const selectScenario = useCallback((scenario: GameScenario) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsReportOpen(false);
    setState(prev => {
      const lvl = prev.levelProgression?.currentLevel ?? 1;
      return initializeSimulationState(scenario, prev.currentCityId, lvl);
    });
  }, []);

  // 7. Spawn dynamic test order
  const spawnTestOrder = useCallback(() => {
    setState(prev => {
      const randomHub = prev.hubs[Math.floor(Math.random() * prev.hubs.length)];
      const city = CITIES_DATA[prev.currentCityId] || CITIES_DATA.singapore;
      const randomNode = city.roadNodes[Math.floor(Math.random() * city.roadNodes.length)];

      const newId = (prev.orders.length + 101).toString();
      const newOrder = {
        id: newId,
        sender: `${city.name} Express #${Math.floor(Math.random() * 90 + 10)}`,
        recipientAddress: {
          x: Math.round(randomNode.lat * 100) % 18,
          y: Math.round(randomNode.lng * 100) % 18,
          lat: randomNode.lat,
          lng: randomNode.lng,
          zone: lang === 'zh' ? randomNode.nameZh : randomNode.name
        },
        deadlineTick: prev.tick + Math.floor(Math.random() * 30 + 35),
        reward: Math.floor(Math.random() * 50 + 40),
        weightKg: +(Math.random() * 6 + 1).toFixed(1),
        status: 'pending' as const,
        createdAtTick: prev.tick,
        pickupHubId: randomHub.id
      };

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        metrics: {
          ...prev.metrics,
          totalOrdersSpawned: prev.metrics.totalOrdersSpawned + 1,
          pendingCount: prev.metrics.pendingCount + 1
        },
        thoughtLogs: [
          {
            id: `new-order-${newId}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: `INCOMING ORDER: #${newId} from ${newOrder.sender} ($${newOrder.reward}, SLA: ${newOrder.deadlineTick} ticks).`
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const toggleTrafficHeatmap = useCallback(() => {
    setState(prev => ({ ...prev, showTrafficHeatmap: !prev.showTrafficHeatmap }));
  }, []);

  const selectRobot = useCallback((robotId?: string) => {
    setState(prev => ({ ...prev, selectedRobotId: robotId, selectedOrderId: undefined }));
  }, []);

  const selectOrder = useCallback((orderId?: string) => {
    setState(prev => ({ ...prev, selectedOrderId: orderId, selectedRobotId: undefined }));
  }, []);

  const toggleTool = useCallback((toolName: string) => {
    setAgentConfig(prev => {
      const exists = prev.enabledTools.includes(toolName);
      return {
        ...prev,
        enabledTools: exists
          ? prev.enabledTools.filter(t => t !== toolName)
          : [...prev.enabledTools, toolName]
      };
    });
  }, []);

  const switchCity = useCallback((cityId: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsReportOpen(false);
    setState(prev => {
      const nextState = initializeSimulationState(prev.scenario, cityId);
      const isZh = lang === 'zh';
      const cityName = CITIES_DATA[cityId]?.name || cityId;
      nextState.thoughtLogs = [
        {
          id: `city-switch-${Date.now()}`,
          type: 'observe',
          timestamp: formatSimTimestamp(0),
          tick: 0,
          content: isZh
            ? `已切换至仿真城市：【${CITIES_DATA[cityId]?.nameZh || cityName}】。加载实时路网、站点与交通拥堵数据。`
            : `Switched simulation city to [${cityName}]. Loaded real street network, logistics hubs, and live traffic data.`
        },
        ...nextState.thoughtLogs
      ];
      return nextState;
    });
  }, [lang]);

  // Dynamic Weather & Traffic Hazard Triggers
  const setWeather = useCallback((weather: CityWeather) => {
    setState(prev => {
      const isZh = prev.language === 'zh';
      const weatherName = weather === 'typhoon'
        ? (isZh ? '⚡ 暴风台风' : '⚡ Severe Typhoon')
        : (weather === 'rain' ? (isZh ? '🌧️ 热带暴雨' : '🌧️ Tropical Rainstorm') : (isZh ? '☀️ 晴天万里' : '☀️ Clear Skies'));

      const logMsg = isZh
        ? `【实时气象变更】城市上空气象突变：${weatherName}！车辆摩擦与电池衰减已动态调整。`
        : `[WEATHER EVENT] Atmospheric conditions updated to ${weatherName}! Fleet traction and energy drain adjusted.`;

      return {
        ...prev,
        weather,
        thoughtLogs: [
          {
            id: `weather-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const toggleRushHour = useCallback(() => {
    setState(prev => {
      const nextRush = !prev.rushHourActive;
      const isZh = prev.language === 'zh';
      const logMsg = nextRush
        ? (isZh ? '【晚高峰拥堵突发】全市主干道与跨海/跨区高速进入晚高峰状态，拥堵延迟飙升至 4.2x！' : '[TRAFFIC SPIKE] Evening rush hour declared across main city arteries (delays up to 4.2x)!')
        : (isZh ? '【高峰回落】晚高峰交通管制解除，干线车流恢复常态通行。' : '[TRAFFIC CLEARED] Rush hour congestion cleared. Standard traffic flow resumed.');

      return {
        ...prev,
        rushHourActive: nextRush,
        thoughtLogs: [
          {
            id: `rush-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const toggleRoadClosure = useCallback((nodeId?: string) => {
    setState(prev => {
      const city = CITIES_DATA[prev.currentCityId] || CITIES_DATA.singapore;
      const targetNodeId = nodeId || (prev.currentCityId === 'tokyo' ? 'ty-n5' : (prev.currentCityId === 'newyork' ? 'ny-n1' : 'sg-n10'));
      const isClosing = prev.roadClosureNodeId !== targetNodeId;
      const nextClosure = isClosing ? targetNodeId : undefined;
      const nodeObj = city.roadNodes.find(n => n.id === targetNodeId);
      const isZh = prev.language === 'zh';

      const logMsg = isClosing
        ? (isZh
            ? `【道路施工封路】紧急封控警告：节点 [${nodeObj ? nodeObj.nameZh : targetNodeId}] 发生紧急施工，道路双向全封闭！智能体必须执行避障绕行！`
            : `[ROAD HAZARD] Critical blockage: Node [${nodeObj ? nodeObj.name : targetNodeId}] closed for emergency repairs! Fleet must detour.`)
        : (isZh
            ? `【道路恢复畅通】节点 [${nodeObj ? nodeObj.nameZh : targetNodeId}] 紧急施工完毕，路段已恢复正常通车！`
            : `[ROAD REOPENED] Emergency repairs completed at [${nodeObj ? nodeObj.name : targetNodeId}]. Normal traffic restored.`);

      return {
        ...prev,
        roadClosureNodeId: nextClosure,
        thoughtLogs: [
          {
            id: `roadblock-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const closeLevelUpModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      levelProgression: {
        ...prev.levelProgression,
        isLevelUpModalOpen: false,
        hasDismissedModal: true
      }
    }));
  }, []);

  const advanceToLevel2 = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => {
      const isZh = prev.language === 'zh';
      const upgradedLevelState: SimulationState = {
        ...prev,
        levelProgression: {
          currentLevel: 2,
          levelDeliveriesCompleted: prev.levelProgression.levelDeliveriesCompleted,
          levelTargetDeliveries: 8,
          levelTargetCash: 500,
          isLevelUpModalOpen: false,
          hasDismissedModal: false,
          unlockedFeatures: {
            robotShop: true,
            hubUpgrades: true,
            hubConstruction: true,
            multiOrderCarrying: true,
            cityDomination: false
          }
        }
      };

      const nextDayState = startNextDayShift(upgradedLevelState);
      const logMsg = isZh
        ? `🚀【晋升 Level 2 • 第 ${nextDayState.currentDay} 天 08:00 AM 开工前备战】车队科技商店已解锁！今日待送订单已全部列出，可先买车/改装并点击「执行调度」让 LLM 做好全天规划，再点击「开始仿真」正式计时（18:00 收工）！`
        : `🚀 [PROMOTED TO LEVEL 2 • DAY ${nextDayState.currentDay} • 08:00 AM PRE-SHIFT] Tech Shop unlocked! Today's orders are visible—upgrade your fleet, click [EXECUTE DISPATCH] for LLM planning, then press [SIMULATE] to start the 08:00 AM - 06:00 PM shift!`;

      const finalState: SimulationState = {
        ...nextDayState,
        thoughtLogs: [
          {
            id: `lvl2-welcome-${nextDayState.tick}-${Date.now()}`,
            type: 'observe' as const,
            timestamp: `D${nextDayState.currentDay} 08:00`,
            tick: nextDayState.tick,
            content: logMsg
          },
          ...nextDayState.thoughtLogs
        ].slice(0, 100)
      };
      stateRef.current = finalState;
      return finalState;
    });
  }, []);

  const advanceToLevel3 = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState(prev => {
      const city = CITIES_DATA[prev.currentCityId] || CITIES_DATA.singapore;
      const isZh = prev.language === 'zh';
      const cityName = isZh ? city.nameZh : city.name;

      const upgradedLevelState: SimulationState = {
        ...prev,
        levelProgression: {
          currentLevel: 3,
          levelDeliveriesCompleted: prev.levelProgression.levelDeliveriesCompleted,
          levelTargetDeliveries: 14,
          levelTargetCash: 1000,
          isLevelUpModalOpen: false,
          hasDismissedModal: false,
          unlockedFeatures: {
            robotShop: true,
            hubUpgrades: true,
            hubConstruction: true,
            multiOrderCarrying: true,
            cityDomination: true
          }
        }
      };

      const nextDayState = startNextDayShift(upgradedLevelState);
      const logMsg = isZh
        ? `👑【晋升 Level 3 • 第 ${nextDayState.currentDay} 天 08:00 AM 开工前备战】欢迎统治【${cityName}】！今日全城待送订单已全部公布在地图上。请先让 LLM 完成开工前路线与建站规划，再点击「开始仿真」在 18:00 收工前完成派送！`
        : `👑 [PROMOTED TO LEVEL 3 • DAY ${nextDayState.currentDay} • 08:00 AM PRE-SHIFT] Metropolis radar online in ${city.name}! Today's full order manifest is displayed. Run LLM Pre-Shift Planning first, then press [SIMULATE] to start the 08:00 AM - 06:00 PM clock!`;

      const finalState: SimulationState = {
        ...nextDayState,
        thoughtLogs: [
          {
            id: `lvl3-welcome-${nextDayState.tick}-${Date.now()}`,
            type: 'observe' as const,
            timestamp: `D${nextDayState.currentDay} 08:00`,
            tick: nextDayState.tick,
            content: logMsg
          },
          ...nextDayState.thoughtLogs
        ].slice(0, 100)
      };
      stateRef.current = finalState;
      return finalState;
    });
  }, []);

  const continueEndlessMode = useCallback(() => {
    setIsReportOpen(false);
    setState(prev => {
      const endlessBase: SimulationState = {
        ...prev,
        levelProgression: {
          ...prev.levelProgression,
          isEndlessMode: true
        }
      };
      const nextDayState = startNextDayShift(endlessBase);
      stateRef.current = nextDayState;
      return nextDayState;
    });
  }, []);

  // Shop modal state and fleet/infrastructure actions
  const [isShopOpen, setIsShopOpen] = useState(false);
  const openShop = useCallback(() => setIsShopOpen(true), []);
  const closeShop = useCallback(() => setIsShopOpen(false), []);

  const buyRobot = useCallback((archetype: 'speedy' | 'heavy' | 'standard') => {
    setState(prev => {
      const config = ROBOT_SHOP_CONFIG[archetype];
      if (prev.financials.balance < config.price) return prev;

      const isZh = prev.language === 'zh';
      const homeHub = prev.hubs[0] || { position: { x: 5, y: 5, lat: 1.2805, lng: 103.8540 }, id: 'hub-0' };
      const newBotId = `${prev.currentCityId}-${archetype}-${Date.now().toString(36).slice(-4)}`;
      const newBotName = isZh
        ? `${config.nameZh}-${prev.robots.length + 1}`
        : `${config.nameEn}-${prev.robots.length + 1}`;

      const newBot: DeliveryRobot = {
        id: newBotId,
        name: newBotName,
        position: { ...homeHub.position },
        batteryPct: 100,
        maxCapacityKg: config.maxCapacityKg,
        currentPayloadKg: 0,
        speed: 1,
        costPerTick: archetype === 'heavy' ? 0.20 : (archetype === 'speedy' ? 0.18 : 0.15),
        status: 'idle',
        homeHubId: homeHub.id,
        pathQueue: [],
        totalDistanceTraveled: 0,
        totalDeliveriesCompleted: 0,
        color: config.color,
        archetype,
        carriedOrderIds: [],
        maxOrdersCapacity: config.maxOrdersCapacity,
        speedMultiplier: config.speedMultiplier,
        batteryDrainMultiplier: config.batteryDrainMultiplier,
        chargingRateMultiplier: config.chargingRateMultiplier
      };

      const logMsg = isZh
        ? `【车队扩建·购入新车】成功购入 [${newBotName}]！支出: -$${config.price}。新车已在 [${homeHub.name || '中心站'}] 部署就绪！`
        : `[FLEET EXPANSION] Deployed new [${newBotName}]! Spent: -$${config.price}. Stationed at [${homeHub.name || 'Central Hub'}].`;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          balance: prev.financials.balance - config.price,
          totalExpenses: prev.financials.totalExpenses + config.price
        },
        robots: [...prev.robots, newBot],
        thoughtLogs: [
          {
            id: `buybot-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const upgradeRobot = useCallback((robotId: string, upgradeType: 'cargoExpanded' | 'solidStateBattery' | 'turboMotors') => {
    setState(prev => {
      const price = upgradeType === 'cargoExpanded'
        ? UPGRADE_PRICES.CARGO_EXPANSION
        : (upgradeType === 'solidStateBattery' ? UPGRADE_PRICES.SOLID_STATE_BATTERY : UPGRADE_PRICES.TURBO_MOTORS);

      if (prev.financials.balance < price) return prev;
      const isZh = prev.language === 'zh';

      const updatedRobots = prev.robots.map(bot => {
        if (bot.id !== robotId) return bot;
        const currentUpgrades = bot.upgrades || {};
        if (currentUpgrades[upgradeType]) return bot;

        const nextUpgrades = { ...currentUpgrades, [upgradeType]: true };
        const maxOrdersCapacity = upgradeType === 'cargoExpanded' ? (bot.maxOrdersCapacity || 1) + 1 : bot.maxOrdersCapacity;
        const maxCapacityKg = upgradeType === 'cargoExpanded' ? bot.maxCapacityKg + 10 : bot.maxCapacityKg;
        const batteryDrainMultiplier = upgradeType === 'solidStateBattery' ? (bot.batteryDrainMultiplier || 1.0) * 0.7 : bot.batteryDrainMultiplier;
        const speedMultiplier = upgradeType === 'turboMotors' ? (bot.speedMultiplier || 1.0) * 1.25 : bot.speedMultiplier;

        return {
          ...bot,
          upgrades: nextUpgrades,
          maxOrdersCapacity,
          maxCapacityKg,
          batteryDrainMultiplier,
          speedMultiplier
        };
      });

      const targetBot = prev.robots.find(r => r.id === robotId);
      const upgradeLabel = upgradeType === 'cargoExpanded'
        ? (isZh ? '副货厢扩容(+1单)' : 'Cargo Bay Expansion (+1 Order)')
        : (upgradeType === 'solidStateBattery' ? (isZh ? '固态锂电池(-30%能耗)' : 'Solid-State Battery (-30% Drain)') : (isZh ? '涡轮高速电机(+25%航速)' : 'Turbo Motors (+25% Speed)'));

      const logMsg = isZh
        ? `【车辆改装】${targetBot?.name || robotId} 成功加装 [${upgradeLabel}]！改装费用: -$${price}。`
        : `[VEHICLE UPGRADE] Installed [${upgradeLabel}] on ${targetBot?.name || robotId}! Cost: -$${price}.`;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          balance: prev.financials.balance - price,
          totalExpenses: prev.financials.totalExpenses + price
        },
        robots: updatedRobots,
        thoughtLogs: [
          {
            id: `upgbot-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const upgradeHub = useCallback((hubId: string, targetLevel: 2 | 3) => {
    setState(prev => {
      const price = targetLevel === 2 ? UPGRADE_PRICES.HUB_LEVEL_2 : UPGRADE_PRICES.HUB_LEVEL_3;
      if (prev.financials.balance < price) return prev;
      const isZh = prev.language === 'zh';

      const updatedHubs = prev.hubs.map(hub => {
        if (hub.id !== hubId) return hub;
        return {
          ...hub,
          level: targetLevel,
          chargingBays: targetLevel === 3 ? 4 : 2,
          chargingRatePerTick: targetLevel === 3 ? 14.0 : 9.0
        };
      });

      const targetHub = prev.hubs.find(h => h.id === hubId);
      const logMsg = isZh
        ? `【基建升级】[${targetHub?.name || hubId}] 成功升级至 Level ${targetLevel} ${targetLevel === 3 ? '超级快充旗舰站 (4机位)' : '双机位快充站'}！耗资: -$${price}。`
        : `[HUB UPGRADED] [${targetHub?.name || hubId}] upgraded to Level ${targetLevel} ${targetLevel === 3 ? 'Mega-Supercharger (4 Bays)' : 'Dual-Bay Fast Hub'}! Cost: -$${price}.`;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          balance: prev.financials.balance - price,
          totalExpenses: prev.financials.totalExpenses + price
        },
        hubs: updatedHubs,
        thoughtLogs: [
          {
            id: `upghub-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  const buildHub = useCallback((name: string, lat: number, lng: number) => {
    setState(prev => {
      const price = UPGRADE_PRICES.NEW_HUB_CONSTRUCTION;
      if (prev.financials.balance < price) return prev;
      const isZh = prev.language === 'zh';

      const newHubId = `${prev.currentCityId}-hub-${Date.now().toString(36).slice(-4)}`;
      const newHub: Hub = {
        id: newHubId,
        name,
        position: { x: 8, y: 8, lat, lng },
        chargingBays: 2,
        availableChargers: 2,
        zone: name,
        level: 1,
        chargingRatePerTick: 7.0
      };

      const city = CITIES_DATA[prev.currentCityId] || CITIES_DATA.singapore;
      const prevSectorStatus = getCitySectorStatus(city, prev.hubs);
      const nextHubs = [...prev.hubs, newHub];
      const nextSectorStatus = getCitySectorStatus(city, nextHubs);

      const logMsg = isZh
        ? `【投资建站】全城新网点 [${name}] 正式竣工通电运营！耗资: -$${price}。有效辐射周边区域配送！`
        : `[NEW HUB CONSTRUCTED] [${name}] completed and energized! Cost: -$${price}. Network radius expanded!`;

      const newLogs = [
        {
          id: `buildhub-${prev.tick}-${Date.now()}`,
          type: 'observe' as const,
          timestamp: formatSimTimestamp(prev.tick),
          tick: prev.tick,
          content: logMsg
        }
      ];

      if (nextSectorStatus.unlockedSector > prevSectorStatus.unlockedSector) {
        newLogs.unshift({
          id: `sector-unlock-${prev.tick}-${Date.now()}`,
          type: 'observe' as const,
          timestamp: formatSimTimestamp(prev.tick),
          tick: prev.tick,
          content: isZh
            ? `🗺️🎉【城市版图扩张·第 ${nextSectorStatus.unlockedSector} 区已解锁！】恭喜！第 ${prevSectorStatus.unlockedSector} 区的全部枢纽已建满，正式解锁「${nextSectorStatus.currentSectorNameZh}」！地图已自动推开并标出新区域的 ➕ 建站点 位置！`
            : `🗺️🎉 [CITY SECTOR ${nextSectorStatus.unlockedSector} UNLOCKED!] All hubs in Sector ${prevSectorStatus.unlockedSector} completed! Unlocked [${nextSectorStatus.currentSectorNameEn}] with ${nextSectorStatus.availableBuildNodes.length} new ➕ BUILD HUB sites on the map!`
        });
      }

      return {
        ...prev,
        financials: {
          ...prev.financials,
          balance: prev.financials.balance - price,
          totalExpenses: prev.financials.totalExpenses + price
        },
        hubs: nextHubs,
        thoughtLogs: [...newLogs, ...prev.thoughtLogs]
      };
    });
  }, []);

  const sellHub = useCallback((hubId: string) => {
    setState(prev => {
      if (prev.hubs.length <= 1) return prev;
      const refund = UPGRADE_PRICES.HUB_SELL_REFUND;
      const isZh = prev.language === 'zh';

      const targetHub = prev.hubs.find(h => h.id === hubId);
      const remainingHubs = prev.hubs.filter(h => h.id !== hubId);

      // Reassign any robot using this hub to first remaining hub
      const updatedRobots = prev.robots.map(bot => {
        if (bot.homeHubId === hubId) {
          return { ...bot, homeHubId: remainingHubs[0].id };
        }
        return bot;
      });

      const logMsg = isZh
        ? `【站点撤并变卖】[${targetHub?.name || hubId}] 已成功拆除并回收变现！回收资金: +$${refund}。`
        : `[HUB DECOMMISSIONED] [${targetHub?.name || hubId}] decommissioned! Reclaimed: +$${refund}.`;

      return {
        ...prev,
        financials: {
          ...prev.financials,
          balance: prev.financials.balance + refund,
          totalRevenue: prev.financials.totalRevenue + refund
        },
        hubs: remainingHubs,
        robots: updatedRobots,
        thoughtLogs: [
          {
            id: `sellhub-${prev.tick}-${Date.now()}`,
            type: 'observe',
            timestamp: formatSimTimestamp(prev.tick),
            tick: prev.tick,
            content: logMsg
          },
          ...prev.thoughtLogs
        ]
      };
    });
  }, []);

  // 8. Simulation Timer Loop & Continuous Autonomous Agent Dispatch
  useEffect(() => {
    if (state.status === 'running') {
      timerRef.current = setInterval(async () => {
        // Freeze simulation clock while LLM is thinking so network latency never eats into daily shift hours
        if (isAgentExecutingRef.current) return;

        // Step 1: Advance simulation state by 1 tick using prompt directives
        let nextTickState = stateRef.current;
        setState(prev => {
          nextTickState = advanceTick(prev, agentConfigRef.current.systemPrompt);
          stateRef.current = nextTickState;
          return nextTickState;
        });

        if (dispatchCooldownTicksRef.current > 0) {
          dispatchCooldownTicksRef.current -= 1;
        }

        // Step 2: Autonomous Dispatch Orchestration (if any order remains unassigned and a robot is idle)
        const current = nextTickState || stateRef.current;
        if (current.isShiftEnded || current.status !== 'running') return;

        const hasPending = current.orders.some(o => o.status === 'pending');
        const hasAvailableBot = current.robots.some(
          r => r.status === 'idle' && (!r.missionQueue || r.missionQueue.length === 0)
        );

        if (hasPending && hasAvailableBot && !isAgentExecutingRef.current && dispatchCooldownTicksRef.current <= 0) {
          isAgentExecutingRef.current = true;
          setIsAgentExecuting(true);
          try {
            const result = await runAgentDispatchCycle(
              agentConfigRef.current,
              current.tick,
              current.orders,
              current.robots,
              current.grid,
              current.hubs,
              {
                weather: current.weather,
                rushHourActive: current.rushHourActive,
                roadClosureNodeId: current.roadClosureNodeId,
                financials: current.financials
              }
            );

            // If no actions could be dispatched (e.g. low battery safeguard or unreachable orders),
            // cooldown for 8 ticks instead of rapidly hammering the engine/LLM API every tick!
            if (!result.actions || result.actions.length === 0) {
              dispatchCooldownTicksRef.current = 8;
            } else {
              dispatchCooldownTicksRef.current = 0;
            }

            setState(prev => {
              const stateWithInfra = applyInfrastructureActions(prev, result.infrastructureActions);
              const updated = applyDispatchActionsToState(stateWithInfra, result.actions);
              stateRef.current = updated;
              return {
                ...updated,
                lastCycleResult: result,
                thoughtLogs: [...result.reasoningTrace, ...updated.thoughtLogs].slice(0, 100),
                metrics: {
                  ...updated.metrics,
                  totalTokensConsumed: updated.metrics.totalTokensConsumed + result.tokensUsed
                }
              };
            });
          } catch (err: any) {
            console.error('Autonomous dispatch loop error:', err);
          } finally {
            isAgentExecutingRef.current = false;
            setIsAgentExecuting(false);
          }
        }
      }, getIntervalMs(state.speed));
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.status, state.speed]);

  return {
    state,
    agentConfig,
    setAgentConfig,
    isAgentExecuting,
    lang,
    toggleLang,
    isReportOpen,
    openReport,
    closeReport,
    play,
    pause,
    togglePlay,
    setSpeed,
    stepForward,
    reset,
    selectScenario,
    runDispatchCycle,
    startNextDay,
    spawnTestOrder,
    toggleTrafficHeatmap,
    selectRobot,
    selectOrder,
    toggleTool,
    switchCity,
    setWeather,
    toggleRushHour,
    toggleRoadClosure,
    closeLevelUpModal,
    advanceToLevel2,
    advanceToLevel3,
    continueEndlessMode,
    promptIterations: promptIterationsRef.current,
    isShopOpen,
    openShop,
    closeShop,
    buyRobot,
    upgradeRobot,
    upgradeHub,
    buildHub,
    sellHub,
    // Tournament & Leaderboard & Student Profile
    currentUser,
    saveStudentUser,
    logoutStudentUser,
    isLeaderboardOpen,
    openLeaderboard,
    closeLeaderboard,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    isTournamentFinishOpen,
    openTournamentFinishModal,
    closeTournamentFinishModal,
    startTournamentMode,
    exitTournamentMode
  };
}
