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
  RotateCcw,
  Play,
  Key,
  ShieldAlert,
  HelpCircle,
  Cpu,
  CheckCircle2
} from 'lucide-react';

interface MultiAgentWorkspaceProps {
  agents: Record<SushiAgentRole, SushiAgentConfig>;
  selectedRole: SushiAgentRole;
  onSelectRole: (role: SushiAgentRole) => void;
  onUpdateAgentConfig: (role: SushiAgentRole, updates: Partial<SushiAgentConfig>) => void;
  onRunManualTurn: () => void;
  isExecuting: boolean;
  unlockedAgents: SushiAgentRole[];
}

export const MultiAgentWorkspace: React.FC<MultiAgentWorkspaceProps> = ({
  agents,
  selectedRole,
  onSelectRole,
  onUpdateAgentConfig,
  onRunManualTurn,
  isExecuting,
  unlockedAgents
}) => {
  const { t } = useSushiI18n();
  const [activeTab, setActiveTab] = useState<'prompt' | 'tools' | 'model'>('prompt');
  const agent = agents[selectedRole];

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
    <div className="w-80 md:w-96 h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none z-10 shrink-0">
      {/* 1. Agent Selector Tabs */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Bot className="w-4 h-4 text-amber-400" />
            <span>{t('masConsole')}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">{t('architecture4')}</span>
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
                    ? 'bg-slate-800 border-2 border-amber-400/80 shadow-md text-white'
                    : isUnlocked
                    ? 'bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200'
                    : 'opacity-30 cursor-not-allowed bg-slate-950/40 border border-slate-900'
                }`}
              >
                <span className="text-xl">{r.avatar}</span>
                <span className="text-[10px] font-bold truncate max-w-full">{r.name.split(' ')[0]}</span>
                {!isUnlocked && (
                  <span className="absolute top-1 right-1 text-[8px] bg-slate-800 text-slate-400 px-1 rounded">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Agent Banner Card */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-sm">
            {agent.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">
              {selectedRole === 'host' ? t('roleAoi') : selectedRole === 'chef' ? t('roleKenji') : selectedRole === 'inventory' ? t('roleRen') : t('roleSakura')}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {selectedRole === 'host' ? t('titleAoi') : selectedRole === 'chef' ? t('titleKenji') : selectedRole === 'inventory' ? t('titleRen') : t('titleSakura')}
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* 3. Sub Tabs: Prompt / Tools / Model */}
      <div className="flex border-b border-slate-800 text-xs font-semibold bg-slate-950/60">
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
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400 font-mono">快速策略預設 (Quick Strategy)</span>
                <select
                  onChange={e => {
                    const preset = availablePresets.find(p => p.id === e.target.value);
                    if (preset) {
                      onUpdateAgentConfig(selectedRole, { systemPrompt: preset.prompt });
                    }
                  }}
                  defaultValue=""
                  className="bg-slate-800 text-sm text-amber-200 border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium cursor-pointer"
                >
                  <option value="" disabled>
                    選擇 Prompt 調校預設...
                  </option>
                  {availablePresets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Prompt Textarea */}
            <div className="flex-1 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-400 font-mono">角色提示詞 (System Prompt)</span>
                <span className="text-xs text-slate-400 font-mono">
                  {agent.systemPrompt.length} 字
                </span>
              </div>
              <textarea
                value={agent.systemPrompt}
                onChange={e => onUpdateAgentConfig(selectedRole, { systemPrompt: e.target.value })}
                className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed resize-none shadow-inner"
                placeholder="在此輸入或調整此 Agent 的行為準則與職責守則..."
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
                        title: '忌口備忘提取',
                        hint: '含「忌口/不要芥末/素食/備註」',
                        isActive: directives.recordDietaryNotes
                      },
                      {
                        title: 'VIP 優先接待',
                        hint: '含「VIP/貴賓/優先/米其林」',
                        isActive: directives.isVipFocused
                      },
                      {
                        title: '翻台效率推進',
                        hint: '含「效率/速/快速/翻台」',
                        isActive: directives.isAggressiveSpeed
                      }
                    ];
                  case 'chef':
                    return [
                      {
                        title: '嚴守工單忌口',
                        hint: '含「遵守/不要芥末/嚴格/忌口」',
                        isActive: directives.honorDietaryStrictly
                      },
                      {
                        title: 'VIP 工單插單',
                        hint: '含「VIP/貴賓/加急/優先」',
                        isActive: directives.isVipFocused
                      },
                      {
                        title: '批次合併製作',
                        hint: '含「批次/合併/相同/集中」',
                        isActive: directives.batchCrafting
                      }
                    ];
                  case 'inventory':
                    return [
                      {
                        title: '安全庫存門檻',
                        hint: `低於 ${directives.safetyStockThreshold} 份時補貨`,
                        isActive: directives.safetyStockThreshold > 0
                      },
                      {
                        title: '預算防破產',
                        hint: '含「預算/防破產/節儉/結餘」',
                        isActive: directives.budgetAwareProcurement
                      },
                      {
                        title: '供需敏捷響應',
                        hint: '含「盤點/補貨/需求/報警」',
                        isActive:
                          agent.systemPrompt.includes('盤點') ||
                          agent.systemPrompt.includes('補貨') ||
                          agent.systemPrompt.includes('需求') ||
                          agent.systemPrompt.includes('報警')
                      }
                    ];
                  case 'manager':
                    return [
                      {
                        title: '主動客訴挽救',
                        hint: '含「安撫/抹茶/甜品/客訴」',
                        isActive: directives.autoRemedyComplaints
                      },
                      {
                        title: '滿意度防禦',
                        hint: '含「滿意度/3顆星/口碑/星級」',
                        isActive:
                          agent.systemPrompt.includes('滿意度') ||
                          agent.systemPrompt.includes('3') ||
                          agent.systemPrompt.includes('口碑') ||
                          agent.systemPrompt.includes('星級')
                      },
                      {
                        title: '跨部門協調',
                        hint: '含「方針/協調/督促/全隊」',
                        isActive:
                          agent.systemPrompt.includes('方針') ||
                          agent.systemPrompt.includes('協調') ||
                          agent.systemPrompt.includes('督促') ||
                          agent.systemPrompt.includes('全隊')
                      }
                    ];
                }
              };

              const items = getRoleChecklist();
              const activeCount = items.filter(i => i.isActive).length;

              return (
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">
                        提示詞策略檢核 (Live Strategy Checklist)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      已生效: {activeCount} / {items.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex flex-col gap-0.5 transition-all ${
                          item.isActive
                            ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[11px]">{item.title}</span>
                          <span className="text-[10px] font-mono">
                            {item.isActive ? '✓ 已生效' : '○ 未啟動'}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80 leading-tight">{item.hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <p className="text-xs text-slate-400 italic">
              💡 提示：在提示詞中加入關鍵策略詞（例如「忌口/不要芥末」、「預算/防破產」、「VIP優先」、「安撫/抹茶」），Agent
              將在模擬中實時遵循！
            </p>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">賦予此 Agent 的行動能力 (Tools)</span>
              <span className="text-xs text-slate-400 font-mono">勾選啟用</span>
            </div>

            <div className="flex flex-col gap-2">
              {roleTools.map(tool => {
                const isEnabled = agent.enabledTools?.includes(tool.id);

                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToggleTool(tool.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      isEnabled
                        ? 'bg-slate-800/80 border-amber-500/50 text-white'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="mt-1 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{tool.name}</span>
                      <span className="text-xs text-slate-300 mt-0.5 leading-snug">
                        {tool.description}
                      </span>
                      <span className="text-xs font-mono text-slate-400 mt-1">
                        參數: {tool.parametersDescription}
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
              <span className="text-xs text-slate-400 font-mono">推論引擎提供商 (LLM Provider)</span>
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
                className="bg-slate-800 text-sm text-white border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 font-medium"
              >
                <option value="mock">⚡ 本地智能啟發式引擎 (Mock - 免 API Key，即時無延遲)</option>
                <option value="deepseek">DeepSeek V3 / R1 (官方 API)</option>
                <option value="gemini">Google Gemini 2.5 / 1.5</option>
                <option value="openai">OpenAI GPT-4o / Mini</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                <span>思考創意度 (Temperature)</span>
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
                <span>精準守紀 (0.0)</span>
                <span>靈活創新 (1.0)</span>
              </div>
            </div>

            {/* API Key (Optional) */}
            {agent.provider !== 'mock' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>API 金鑰 (請輸入您的 {agent.provider.toUpperCase()} API Key)</span>
                </span>
                <input
                  type="password"
                  value={agent.apiKey || ''}
                  onChange={e => onUpdateAgentConfig(selectedRole, { apiKey: e.target.value })}
                  placeholder="輸入 sk-... 金鑰以啟用真實大模型"
                  className="bg-slate-800 text-sm text-white border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Action Button: Run Manual Turn */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/70">
        <button
          onClick={onRunManualTurn}
          disabled={isExecuting}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isExecuting ? t('agentExecuting') : t('runManualTurn')}</span>
        </button>
      </div>
    </div>
  );
};
