import React, { useState } from 'react';
import {
  AgentTool,
  LLMProvider,
  SushiAgentConfig,
  SushiAgentRole
} from '../../lib/sushi/types';
import { ALL_SUSHI_TOOLS, SUSHI_PROMPT_PRESETS } from '../../lib/sushi/defaultAgents';
import { parseSushiPrompt } from '../../lib/sushi/agentEngine';
import { useSushiI18n } from '../../lib/sushi/i18n';
import {
  Bot,
  Sliders,
  Wrench,
  Sparkles,
  Play,
  Key
} from 'lucide-react';

interface MultiAgentWorkspaceProps {
  agents: Record<SushiAgentRole, SushiAgentConfig>;
  selectedRole: SushiAgentRole;
  onSelectRole: (role: SushiAgentRole) => void;
  onUpdateAgentConfig: (role: SushiAgentRole, updates: Partial<SushiAgentConfig>) => void;
  onRunManualTurn: () => void;
  isExecuting: boolean;
  unlockedAgents: SushiAgentRole[];
  onToggleCollapse?: () => void;
}

export const MultiAgentWorkspace: React.FC<MultiAgentWorkspaceProps> = ({
  agents,
  selectedRole,
  onSelectRole,
  onUpdateAgentConfig,
  onRunManualTurn,
  isExecuting,
  unlockedAgents,
  onToggleCollapse
}) => {
  const { language, t, getToolTitleAndDesc, getPresetLocalization } = useSushiI18n();
  const [activeTab, setActiveTab] = useState<'prompt' | 'tools' | 'model'>('prompt');
  const agent = agents[selectedRole];
  const isEn = language === 'en';

  // Role metadata list
  const roles: { role: SushiAgentRole; name: string; avatar: string; color: string }[] = [
    { role: 'host', name: t('roleAoi'), avatar: '💁‍♀️', color: 'border-sky-400 text-sky-400' },
    { role: 'chef', name: t('roleKenji'), avatar: '👨‍🍳', color: 'border-orange-400 text-orange-400' },
    { role: 'inventory', name: t('roleRen'), avatar: '📦', color: 'border-emerald-400 text-emerald-400' },
    { role: 'manager', name: t('roleSakura'), avatar: '👩‍💼', color: 'border-purple-400 text-purple-400' }
  ];

  // Presets available for this agent
  const availablePresets = SUSHI_PROMPT_PRESETS.filter(p => p.role === selectedRole);

  // Tools available for this role
  const roleTools = ALL_SUSHI_TOOLS.filter(t => t.role === selectedRole);

  const handleToggleTool = (toolId: string) => {
    const currentTools = agent.enabledTools || [];
    let updated: string[];
    if (currentTools.includes(toolId)) {
      updated = currentTools.filter(t => t !== toolId);
    } else {
      updated = [...currentTools, toolId];
    }
    onUpdateAgentConfig(selectedRole, { enabledTools: updated });
  };

  return (
    <div className="w-60 lg:w-64 xl:w-72 2xl:w-80 h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none z-10 shrink-0">
      {/* 1. Agent Selector Tabs */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>{t('masConsole')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{t('architecture4')}</span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-mono transition"
                title={t('collapseLeft')}
              >
                ◀
              </button>
            )}
          </div>
        </div>

        {/* 4 Agent Badges */}
        <div className="grid grid-cols-4 gap-1.5">
          {roles.map(r => {
            const isUnlocked = unlockedAgents.includes(r.role);
            const isSelected = selectedRole === r.role;

            return (
              <button
                key={r.role}
                disabled={!isUnlocked}
                onClick={() => onSelectRole(r.role)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all relative ${
                  isSelected
                    ? 'bg-slate-800 border-2 border-amber-400 shadow-md text-white'
                    : isUnlocked
                    ? 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'opacity-30 cursor-not-allowed bg-slate-950/40 border border-slate-900'
                }`}
              >
                <span className="text-xl">{r.avatar}</span>
                <span className="text-xs font-bold truncate max-w-full">{r.name.split(' ')[0]}</span>
                {!isUnlocked && (
                  <span className="absolute top-1 right-1 text-[9px] bg-slate-800 text-slate-400 px-1 rounded">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Agent Banner Card */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-sm shrink-0">
            {agent.avatar}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">
              {selectedRole === 'host' ? t('roleAoi') : selectedRole === 'chef' ? t('roleKenji') : selectedRole === 'inventory' ? t('roleRen') : t('roleSakura')}
            </span>
            <span className="text-xs text-slate-400 truncate">
              {selectedRole === 'host' ? t('titleAoi') : selectedRole === 'chef' ? t('titleKenji') : selectedRole === 'inventory' ? t('titleRen') : t('titleSakura')}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* 3. Sub Tabs: Prompt / Tools / Model */}
      <div className="flex border-b border-slate-800 text-xs font-semibold bg-slate-950/60 shrink-0">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex-1 py-2.5 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'prompt'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{t('tabPrompt')}</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2.5 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'tools'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{t('tabTools', { count: agent.enabledTools?.length || 0 })}</span>
        </button>

        <button
          onClick={() => setActiveTab('model')}
          className={`flex-1 py-2.5 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'model'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{t('tabModel')}</span>
        </button>
      </div>

      {/* 4. Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
        {activeTab === 'prompt' && (
          <div className="flex-1 flex flex-col gap-3">
            {/* Quick Presets Dropdown */}
            {availablePresets.length > 0 && (
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-xs text-slate-400 font-mono">{t('quickPresets')}</span>
                <select
                  onChange={e => {
                    const preset = availablePresets.find(p => p.id === e.target.value);
                    if (preset) {
                      const loc = getPresetLocalization(preset.id);
                      onUpdateAgentConfig(selectedRole, { systemPrompt: loc?.prompt || preset.prompt });
                    }
                  }}
                  defaultValue=""
                  className="bg-slate-800 text-xs sm:text-sm text-amber-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium cursor-pointer"
                >
                  <option value="" disabled>
                    {isEn ? 'Select a strategy preset...' : '選擇 Prompt 調校預設...'}
                  </option>
                  {availablePresets.map(p => {
                    const loc = getPresetLocalization(p.id);
                    return (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {loc?.title || p.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Prompt Textarea */}
            <div className="flex-1 flex flex-col min-h-[180px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-mono">
                  {isEn ? 'System Prompt' : '角色提示詞 (System Prompt)'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {agent.systemPrompt.length} {isEn ? 'chars' : '字'}
                </span>
              </div>
              <textarea
                value={agent.systemPrompt}
                onChange={e => onUpdateAgentConfig(selectedRole, { systemPrompt: e.target.value })}
                className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed resize-none shadow-inner"
                placeholder={t('promptPlaceholder')}
              />
            </div>

            {/* Live Prompt Strategy Quality Checklist */}
            {(() => {
              const directives = parseSushiPrompt(agent.systemPrompt);
              const getRoleChecklist = () => {
                switch (selectedRole) {
                  case 'host':
                    return [
                      {
                        title: isEn ? 'Dietary Note' : '忌口備忘提取',
                        hint: isEn ? 'e.g. no wasabi, vegetarian' : '含「忌口/不要芥末/素食/備註」',
                        isActive: directives.recordDietaryNotes
                      },
                      {
                        title: isEn ? 'VIP Priority' : 'VIP 優先接待',
                        hint: isEn ? 'e.g. VIP, critic, express' : '含「VIP/貴賓/優先/米其林」',
                        isActive: directives.isVipFocused
                      },
                      {
                        title: isEn ? 'Turnover Speed' : '翻台效率推進',
                        hint: isEn ? 'e.g. fast, quick, turnover' : '含「效率/速/快速/翻台」',
                        isActive: directives.isAggressiveSpeed
                      }
                    ];
                  case 'chef':
                    return [
                      {
                        title: isEn ? 'Dietary Compliance' : '嚴守工單忌口',
                        hint: isEn ? 'e.g. no wasabi, strictly' : '含「遵守/不要芥末/嚴格/忌口」',
                        isActive: directives.honorDietaryStrictly
                      },
                      {
                        title: isEn ? 'VIP Rush' : 'VIP 工單插單',
                        hint: isEn ? 'e.g. VIP, urgent, priority' : '含「VIP/貴賓/加急/優先」',
                        isActive: directives.isVipFocused
                      },
                      {
                        title: isEn ? 'Batch Craft' : '批次合併製作',
                        hint: isEn ? 'e.g. batch, merge, combine' : '含「批次/合併/相同/集中」',
                        isActive: directives.batchCrafting
                      }
                    ];
                  case 'inventory':
                    return [
                      {
                        title: isEn ? 'Safe Threshold' : '安全庫存門檻',
                        hint: isEn ? `Restock when < ${directives.safetyStockThreshold}` : `低於 ${directives.safetyStockThreshold} 份時補貨`,
                        isActive: directives.safetyStockThreshold > 0
                      },
                      {
                        title: isEn ? 'Budget Control' : '預算防破產',
                        hint: isEn ? 'e.g. budget, bankrupt, frugal' : '含「預算/防破產/節儉/結餘」',
                        isActive: directives.budgetAwareProcurement
                      },
                      {
                        title: isEn ? 'Demand Agility' : '供需敏捷響應',
                        hint: isEn ? 'e.g. check stock, demand' : '含「盤點/補貨/需求/報警」',
                        isActive:
                          agent.systemPrompt.toLowerCase().includes('盤點') ||
                          agent.systemPrompt.toLowerCase().includes('check') ||
                          agent.systemPrompt.toLowerCase().includes('stock') ||
                          agent.systemPrompt.toLowerCase().includes('補貨')
                      }
                    ];
                  case 'manager':
                    return [
                      {
                        title: isEn ? 'Customer Remedy' : '主動客訴挽救',
                        hint: isEn ? 'e.g. remedy, drink, soothe' : '含「安撫/抹茶/甜品/客訴」',
                        isActive: directives.autoRemedyComplaints
                      },
                      {
                        title: isEn ? 'CSAT Defense' : '滿意度防禦',
                        hint: isEn ? 'e.g. csat, 3 stars, rating' : '含「滿意度/3顆星/口碑/星級」',
                        isActive:
                          agent.systemPrompt.includes('滿意度') ||
                          agent.systemPrompt.includes('3') ||
                          agent.systemPrompt.toLowerCase().includes('csat') ||
                          agent.systemPrompt.toLowerCase().includes('star')
                      },
                      {
                        title: isEn ? 'Team Directives' : '跨部門協調',
                        hint: isEn ? 'e.g. directive, broadcast' : '含「方針/協調/督促/全隊」',
                        isActive:
                          agent.systemPrompt.includes('方針') ||
                          agent.systemPrompt.includes('協調') ||
                          agent.systemPrompt.toLowerCase().includes('team') ||
                          agent.systemPrompt.toLowerCase().includes('broadcast')
                      }
                    ];
                }
              };

              const items = getRoleChecklist();
              const activeCount = items.filter(i => i.isActive).length;

              return (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">
                        {isEn ? 'Live Strategy Checklist' : '提示詞策略檢核 (Live Strategy)'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {isEn ? 'Active' : '已生效'}: {activeCount} / {items.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-1.5 rounded-lg border text-xs flex flex-col gap-0.5 transition-all ${
                          item.isActive
                            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] truncate">{item.title}</span>
                          <span className="text-[10px] font-mono shrink-0">
                            {item.isActive ? (isEn ? '✓ OK' : '✓ 生效') : '○'}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-75 truncate">{item.hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-slate-400 italic">
              {isEn
                ? '💡 Tip: Add strategy terms (e.g. "no wasabi", "budget", "VIP priority", "remedy") in the prompt, and the AI agent will follow in real-time!'
                : '💡 提示：在提示詞中加入關鍵策略詞（例如「忌口/不要芥末」、「預算/防破產」、「VIP優先」、「安撫/抹茶」），Agent 將實時遵循！'}
            </p>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {isEn ? 'Enabled Agent Tools' : '賦予此 Agent 的行動能力 (Tools)'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isEn ? 'Toggle' : '勾選啟用'}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {roleTools.map(tool => {
                const isEnabled = agent.enabledTools?.includes(tool.id);
                const toolInfo = getToolTitleAndDesc(tool.id, tool.name, tool.description);

                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToggleTool(tool.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-2.5 ${
                      isEnabled
                        ? 'bg-slate-800/80 border-amber-500/50 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold truncate">{toolInfo.name}</span>
                      <span className="text-xs text-slate-300 mt-0.5 leading-snug">
                        {toolInfo.desc}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                        {isEn ? 'Params:' : '參數:'} {tool.parametersDescription}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'model' && (
          <div className="flex-1 flex flex-col gap-4">
            {/* LLM Provider */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-mono">{t('llmProvider')}</span>
              <select
                value={agent.provider}
                onChange={e => {
                  const newProvider = e.target.value as LLMProvider;
                  let defaultModel = 'local-heuristic';
                  if (newProvider === 'deepseek') defaultModel = 'deepseek-chat';
                  else if (newProvider === 'gemini') defaultModel = 'gemini-2.5-flash';
                  else if (newProvider === 'openai') defaultModel = 'gpt-4o-mini';
                  onUpdateAgentConfig(selectedRole, {
                    provider: newProvider,
                    model: defaultModel
                  });
                }}
                className="bg-slate-800 text-xs sm:text-sm text-white border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
              >
                <option value="mock">
                  {isEn
                    ? '⚡ Local Heuristic Engine (Mock - Instant, Zero Latency)'
                    : '⚡ 本地智能啟發式引擎 (Mock - 免 API Key，即時無延遲)'}
                </option>
                <option value="deepseek">DeepSeek V3 / R1 (Official API)</option>
                <option value="gemini">Google Gemini 2.5 / 1.5</option>
                <option value="openai">OpenAI GPT-4o / Mini</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                <span>{t('temperature')}</span>
                <span className="text-amber-300 font-bold">{agent.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={agent.temperature}
                onChange={e =>
                  onUpdateAgentConfig(selectedRole, { temperature: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t('strictMode')}</span>
                <span>{t('creativeMode')}</span>
              </div>
            </div>

            {/* API Key (Optional) */}
            {agent.provider !== 'mock' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isEn ? `API Key (Enter your ${agent.provider.toUpperCase()} Key)` : `API 金鑰 (請輸入您的 ${agent.provider.toUpperCase()} API Key)`}
                  </span>
                </span>
                <input
                  type="password"
                  value={agent.apiKey || ''}
                  onChange={e => onUpdateAgentConfig(selectedRole, { apiKey: e.target.value })}
                  placeholder={isEn ? 'Enter sk-... API key' : '輸入 sk-... 金鑰以啟用真實大模型'}
                  className="bg-slate-800 text-xs sm:text-sm text-white border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Action Button: Run Manual Turn */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 shrink-0">
        <button
          onClick={onRunManualTurn}
          disabled={isExecuting}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>
            {isExecuting
              ? t('agentExecuting')
              : agent.provider === 'mock'
              ? (isEn ? 'Test Prompt [Local Engine]' : '測試 Prompt [本地啟發式]')
              : (isEn ? `Call LLM [${agent.provider.toUpperCase()}]` : `調用大模型 [${agent.provider.toUpperCase()}]`)}
          </span>
        </button>
      </div>
    </div>
  );
};
