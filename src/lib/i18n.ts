/**
 * RoboFlow 2028 - Internationalization (i18n) Dictionary
 * English and Simplified Chinese (简体中文)
 */

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Top HUD
    appTitle: 'ROBOFLOW',
    appSubtitle: 'AI Agent Architect Lab',
    scenarioLabel: 'SCENARIO',
    tickLabel: 'TICK',
    liveSimulation: 'LIVE SIMULATION',
    paused: 'PAUSED',
    fleetCritical: 'FLEET CRITICAL / GAME OVER',
    missionAccomplished: 'MISSION ACCOMPLISHED',
    standby: 'STANDBY',
    trafficBtn: 'TRAFFIC',
    addOrderBtn: '+ ORDER',
    guideBtn: 'GUIDE',
    reportBtn: 'REPORT',
    langToggle: '中文',

    // Scenarios
    scenarios: {
      'scenario-1-metro': {
        title: 'Neo-Singapore 2028: Downtown Grid',
        subtitle: 'Phase 1 Training Grounds',
        difficulty: 'Novice',
        description: 'Learn the fundamentals of prompt design, tool selection, and basic fleet routing across three interconnected city logistics hubs.',
        learningGoal: 'Design a system prompt that balances SLA deadlines with basic payload capacity to ensure high on-time delivery.'
      },
      'scenario-2-rush-hour': {
        title: 'Central Artery Rush Hour',
        subtitle: 'Traffic Jam & Fast Detours',
        difficulty: 'Architect',
        description: 'Heavy traffic snarls the central corridor. Agents that fail to query traffic telemetry will face severe delivery delays and SLA penalties.',
        learningGoal: 'Enable traffic tools and instruct the agent to evaluate congested zones before finalizing waypoints.'
      },
      'scenario-3-battery-crunch': {
        title: 'Tropical Storm: Battery Crisis',
        subtitle: 'Energy Safeguards & Charging Protocols',
        difficulty: 'Master',
        description: 'High winds deplete robot batteries rapidly. The agent must orchestrate autonomous returns to charging hubs before robots run out of juice mid-route.',
        learningGoal: 'Implement battery reserve thresholds in your system prompt and utilize the order_battery_recharge tool.'
      }
    },

    // Agent Workspace
    workspace: {
      title: 'AGENT WORKSPACE',
      subtitle: 'DISPATCHER & ROUTING BRAIN',
      providerSelect: 'ENGINE / PROVIDER',
      mockEngine: 'Local Mock Engine (Free & Instant)',
      geminiEngine: 'Google Gemini (AI Studio)',
      gemini2Engine: 'Google Gemini 2.0 Flash',
      openAiEngine: 'OpenAI (ChatGPT API)',
      deepseekEngine: 'DeepSeek API',
      apiKeyLabel: 'API KEY (OPTIONAL)',
      apiKeyPlaceholder: 'Enter API key or leave blank for server/mock...',
      promptProtocol: 'SYSTEM PROMPT PROTOCOL',
      tokensEst: 'tokens',
      presetLabel: 'Preset',
      presetCustom: 'Custom Architect Prompt',
      quickDirectives: 'QUICK DIRECTIVES:',
      directiveSla: '+ SLA Priority',
      directiveBattery: '+ Battery 30%',
      directiveRecharge: '+ Auto-Recharge',
      directiveTraffic: '+ Avoid Traffic',
      availableTools: 'AVAILABLE AGENT TOOLS',
      toolEnabled: 'ENABLED',
      toolOff: 'OFF',
      runDispatch: 'RUN DISPATCH CYCLE',
      agentThinking: 'AGENT REASONING & ROUTING...',
      pendingSuffix: 'PENDING'
    },

    // Playback Controls
    playback: {
      simulate: 'SIMULATE',
      pause: 'PAUSE',
      step: 'STEP (+1T)',
      reset: 'RESET',
      speed: 'SPEED:'
    },

    // Telemetry & Metrics
    telemetry: {
      title: 'TELEMETRY & FINANCIALS',
      treasuryBalance: 'Fleet Treasury Balance',
      netMargin: 'Net',
      revenue: 'TOTAL REVENUE',
      expenses: 'OPERATIONAL EXPENSES',
      onTimeSla: 'ON-TIME SLA',
      delivered: 'DELIVERED',
      slaBreached: 'SLA BREACHED',
      tabs: {
        thoughts: 'THOUGHTS',
        actions: 'ACTIONS',
        orders: 'ORDERS',
        fleet: 'FLEET'
      },
      selectedRobot: 'SELECTED ROBOT TELEMETRY',
      selectedOrder: 'SELECTED ORDER DETAILS',
      close: '[CLOSE]',
      name: 'Name:',
      battery: 'Battery:',
      statusPayload: 'Status / Payload:',
      waypointsLeft: 'Waypoints Remaining:',
      orderId: 'Order ID:',
      destination: 'Destination:',
      rewardSla: 'Reward / SLA:',
      ticksLeft: 'left',
      awaitingThoughts: 'Awaiting agent dispatch cycle...',
      noActions: 'No active dispatch assignments recorded.'
    },

    // Performance Report Modal
    report: {
      title: 'ARCHITECT PERFORMANCE EVALUATION',
      subtitle: 'RoboFlow Autonomous Dispatch Assessment',
      victoryTitle: 'MISSION ACCOMPLISHED // OUTSTANDING EFFICIENCY',
      defeatTitle: 'MISSION TERMINATED // OPERATIONAL DEFICIT',
      victoryDesc: 'Your Autonomous Dispatcher met delivery standards and preserved fleet capital.',
      defeatDesc: 'Operating costs or customer SLA breaches exceeded critical thresholds.',
      efficiencyScore: 'Fleet Efficiency Score',
      profitMargin: 'Net Profit Margin',
      onTimeRate: 'SLA On-Time Rate',
      ordersDelivered: 'Parcels Delivered',
      netTreasury: 'Ending Cash Balance',
      totalExpenses: 'Total Operating Costs',
      promptCritiqueTitle: 'AGENT PROMPT CRITIQUE & ARCHITECT HINTS',
      playAgain: 'RETRY SCENARIO',
      closeModal: 'RETURN TO WORKSPACE'
    },

    // Guide Modal
    guide: {
      title: 'ROBOFLOW 2028 // ARCHITECT BRIEFING',
      subtitle: 'Autonomous Fleet Dispatch & LLM Agent Engineering Manual',
      section1Title: '1. Your Role as an AI Agent Architect',
      section1Desc: 'In the year 2028, autonomous ground rovers fulfill urban parcel deliveries. As the Lead Agent Architect, you do not control individual robots manually. Instead, you design the Dispatcher Agent—its System Prompt, available Tool Schemas, and decision rules. The Agent evaluates order requests and fleet telemetry to autonomously generate structured JSON dispatch commands.',
      section2Title: '2. Core Dispatch Loop & Economics',
      revenueDesc: 'Earned when an order is safely delivered to the customer destination before the SLA deadline tick expires.',
      expensesDesc: 'Mileage wear ($0.60/step), Battery recharging ($0.08/%), Server maintenance ($0.15/bot/tick), SLA Breach penalty ($35.00/failed order).',
      section3Title: '3. Tool Calling & Agentic Directives',
      section4Title: '4. Architect Strategy Tips',
      tip1: 'Prevent Dead Battery Towing: If a robot hits 0% battery mid-street, a $25 recovery fee is incurred. Add a strict rule like "Never assign rovers below 30% battery" in your prompt.',
      tip2: 'SLA Triage: Prioritize orders with fewer remaining ticks. A missed deadline costs $35 in breach penalties!',
      tip3: 'Observe the Thought Inspector: Watch the agent\'s real-time reasoning trace in the right panel to understand why it made each assignment.',
      ackBtn: 'ACKNOWLEDGE & INITIALIZE'
    }
  },

  zh: {
    // Top HUD
    appTitle: 'ROBOFLOW',
    appSubtitle: 'AI智能体架构师特训舱',
    scenarioLabel: '仿真关卡',
    tickLabel: '时钟周期',
    liveSimulation: '运行仿真中',
    paused: '已暂停',
    fleetCritical: '车队告急 / 仿真失败',
    missionAccomplished: '任务圆满达成',
    standby: '就绪待命',
    trafficBtn: '交通热力',
    addOrderBtn: '+ 注入订单',
    guideBtn: '架构指南',
    reportBtn: '评估报告',
    langToggle: 'English',

    // Scenarios
    scenarios: {
      'scenario-1-metro': {
        title: '新新加坡 2028: 市中心物流网',
        subtitle: '第一阶段 基础特训场地',
        difficulty: '入门 (Novice)',
        description: '掌握系统提示词设计、工具集配置以及跨三个城市中心站点的机器人基础路径调度逻辑。',
        learningGoal: '设计兼顾订单时效SLA与小车额定载重的调度提示词，确保100%按时准点送达。'
      },
      'scenario-2-rush-hour': {
        title: '主干动脉高峰大拥堵',
        subtitle: '交通拥堵与智能绕行',
        difficulty: '进阶 (Architect)',
        description: '中央主干道陷入重度拥堵。未启用交通感知工具的Agent将导致机器人延误并承担高额违约金。',
        learningGoal: '启用交通感知工具，引导Agent在规划路径前评估拥堵因子，实现动态智能绕行。'
      },
      'scenario-3-battery-crunch': {
        title: '热带暴雨：电量危机',
        subtitle: '能耗保护与自主回充协议',
        difficulty: '大师 (Master)',
        description: '逆风暴雨使机器人电量消耗倍增。Agent必须在机器人半路抛锚前，自主调度低电量车返回充电机位。',
        learningGoal: '在提示词中制定最低电量安全红线，并深度结合自主回充指令工具。'
      }
    },

    // Agent Workspace
    workspace: {
      title: '智能体工作台 (WORKSPACE)',
      subtitle: '自主调度与路径规划大脑',
      providerSelect: '驱动引擎 / 模型厂商',
      mockEngine: '本地模拟引擎 (免费·零延迟)',
      geminiEngine: 'Google Gemini (谷歌原生大模型)',
      gemini2Engine: 'Google Gemini 2.0 Flash',
      openAiEngine: 'OpenAI (ChatGPT API)',
      deepseekEngine: 'DeepSeek 深度求索 (API)',
      apiKeyLabel: 'API KEY (选填)',
      apiKeyPlaceholder: '输入个人API Key或留空使用内置/模拟...',
      promptProtocol: '系统提示词协议 (SYSTEM PROMPT)',
      tokensEst: '估算Token',
      presetLabel: '模版预设',
      presetCustom: '自定义架构师提示词',
      quickDirectives: '快速策略指令注入:',
      directiveSla: '+ SLA时效优先',
      directiveBattery: '+ 30%电量红线',
      directiveRecharge: '+ 智能回充',
      directiveTraffic: '+ 规避拥堵路段',
      availableTools: '可用工具集 (TOOLS SCHEMA)',
      toolEnabled: '已启用',
      toolOff: '停用',
      runDispatch: '执行调度决策周期',
      agentThinking: '智能体深度思考与规划中...',
      pendingSuffix: '待分配'
    },

    // Playback Controls
    playback: {
      simulate: '开始推演',
      pause: '暂停',
      step: '单步 (+1T)',
      reset: '重置仿真',
      speed: '推演倍速:'
    },

    // Telemetry & Metrics
    telemetry: {
      title: '遥测遥控与财务看板',
      treasuryBalance: '车队财库资金',
      netMargin: '净利润率',
      revenue: '累计营收',
      expenses: '累计运营支出',
      onTimeSla: 'SLA准时送达率',
      delivered: '已成功送达',
      slaBreached: '超时违约单',
      tabs: {
        thoughts: '思考流',
        actions: '调度指令',
        orders: '订单队列',
        fleet: '车队遥测'
      },
      selectedRobot: '选中机器人实时遥测',
      selectedOrder: '选中订单履约详情',
      close: '[关闭]',
      name: '代号:',
      battery: '电池电量:',
      statusPayload: '状态 / 当前负重:',
      waypointsLeft: '剩余规划路径:',
      orderId: '订单编号:',
      destination: '配送目标坐标:',
      rewardSla: '运费收益 / SLA截止:',
      ticksLeft: '周期剩余',
      awaitingThoughts: '等待智能体发起下一轮调度推演...',
      noActions: '暂无当前活跃的调度分配指令。'
    },

    // Performance Report Modal
    report: {
      title: 'AI 架构师能力评估报告',
      subtitle: 'RoboFlow 2028 自主调度综合考核',
      victoryTitle: '任务圆满达成 // 卓越调度效率',
      defeatTitle: '任务终止 // 运营资金破产或违约超标',
      victoryDesc: '恭喜！您设计的智能体调度大脑成功达成准时送达标准并守住了车队利润。',
      defeatDesc: '调度成本失控或SLA超时违约次数触发安全熔断阈值。',
      efficiencyScore: '车队综合能效得分',
      profitMargin: '商业净利润率',
      onTimeRate: 'SLA 准时履约率',
      ordersDelivered: '成功送达包裹数',
      netTreasury: '期末财库净资金',
      totalExpenses: '累计运营支出',
      promptCritiqueTitle: '架构师提示词智能诊断与优化建议',
      playAgain: '重新挑战本关',
      closeModal: '返回工作台调优'
    },

    // Guide Modal
    guide: {
      title: 'ROBOFLOW 2028 // 架构师战略简报',
      subtitle: '无人配送车队调度与多智能体编排开发手册',
      section1Title: '1. 您的角色：AI 智能体架构师',
      section1Desc: '在2028年，无人轮式机器人承担了全城包裹即时配送任务。作为首席智能体架构师，您不再手动操控单台机器人，而是设计中央调度智能体（Dispatcher Agent）的系统提示词（System Prompt）、可用工具集与决策权重。智能体将自主读取订单与车队遥测，生成结构化 JSON 派单行动方案。',
      section2Title: '2. 核心调度闭环与商业经济学',
      revenueDesc: '在SLA到期前将包裹送达收货点可获得对应丰厚运费。',
      expensesDesc: '行驶损耗 ($0.60/步)，充电成本 ($0.08/1%)，车队服务器维护费 ($0.15/台/周期)，超时违约罚款 ($35.00/单)。',
      section3Title: '3. 工具调用与行动规范',
      section4Title: '4. 提示词工程高分秘籍',
      tip1: '预防抛锚拖车：小车在马路上耗尽0%电量将触发$25高额拖车施救费。请务必在提示词中写明：“严禁派出电量低于30%的机器人”。',
      tip2: 'SLA紧急度排序：优先调度剩余时限紧迫的订单，超时罚款将严重蚕食你的利润！',
      tip3: '观察思考流检查器：右侧面板可实时追踪智能体的思维链（Chain-of-Thought），助你发现提示词决策盲区。',
      ackBtn: '领命就绪·启动仿真'
    }
  }
};
