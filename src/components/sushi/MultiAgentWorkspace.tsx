import React, { useState } from 'react';
import {
  AgentTool,
  LLMProvider,
  SushiAgentConfig,
  SushiAgentRole
} from '../../lib/sushi/types';
import { ALL_SUSHI_TOOLS, SUSHI_PROMPT_PRESETS } from '../../lib/sushi/defaultAgents';
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
  Cpu
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
  const [activeTab, setActiveTab] = useState<'prompt' | 'tools' | 'model'>('prompt');
  const agent = agents[selectedRole];

  // Role metadata list
  const roles: { role: SushiAgentRole; name: string; avatar: string; color: string }[] = [
    { role: 'host', name: '阿葵 (Aoi)', avatar: '💁‍♀️', color: 'border-sky-400 text-sky-400' },
    { role: 'chef', name: '健次 (Kenji)', avatar: '👨‍🍳', color: 'border-orange-400 text-orange-400' },
    { role: 'inventory', name: '蓮 (Ren)', avatar: '📦', color: 'border-emerald-400 text-emerald-400' },
    { role: 'manager', name: '櫻 (Sakura)', avatar: '👩‍💼', color: 'border-purple-400 text-purple-400' }
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
            <span>AI Agent 控制中樞 (MAS Console)</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">4-Agent Architecture</span>
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
                    鎖定
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Agent Banner Card */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
            {agent.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">{agent.name}</span>
            <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{agent.title}</span>
          </div>
        </div>

        {/* Status Pill */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ONLINE
        </span>
      </div>

      {/* 3. Sub Tabs: Prompt / Tools / Model */}
      <div className="flex border-b border-slate-800 text-xs font-medium bg-slate-950/40">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex-1 py-2 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'prompt'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>System Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'tools'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>工具清單 ({agent.enabledTools?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('model')}
          className={`flex-1 py-2 text-center transition border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'model'
              ? 'border-amber-400 text-amber-300 font-bold bg-slate-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>模型與參數</span>
        </button>
      </div>

      {/* 4. Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0">
        {activeTab === 'prompt' && (
          <div className="flex-1 flex flex-col gap-3">
            {/* Quick Presets Dropdown */}
            {availablePresets.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-mono">快速策略預設 (Quick Strategy)</span>
                <select
                  onChange={e => {
                    const preset = availablePresets.find(p => p.id === e.target.value);
                    if (preset) {
                      onUpdateAgentConfig(selectedRole, { systemPrompt: preset.prompt });
                    }
                  }}
                  defaultValue=""
                  className="bg-slate-800 text-xs text-amber-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
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
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-mono">角色提示詞 (System Prompt)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {agent.systemPrompt.length} 字
                </span>
              </div>
              <textarea
                value={agent.systemPrompt}
                onChange={e => onUpdateAgentConfig(selectedRole, { systemPrompt: e.target.value })}
                className="flex-1 w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed resize-none shadow-inner"
                placeholder="在此輸入或調整此 Agent 的行為準則與職責守則..."
              />
            </div>

            <p className="text-[10px] text-slate-500 italic">
              💡 提示：在提示詞中加入特殊規則（例如「不要芥末」、「鮭魚低於6份採購」或「優先照顧VIP」），Agent
              將在模擬中實時遵循！
            </p>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">賦予此 Agent 的行動能力 (Tools)</span>
              <span className="text-[10px] text-slate-500 font-mono">勾選啟用</span>
            </div>

            <div className="flex flex-col gap-2">
              {roleTools.map(tool => {
                const isEnabled = agent.enabledTools?.includes(tool.id);

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
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{tool.name}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {tool.description}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 mt-1">
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
              <span className="text-[10px] text-slate-400 font-mono">推論引擎提供商 (LLM Provider)</span>
              <select
                value={agent.provider}
                onChange={e =>
                  onUpdateAgentConfig(selectedRole, { provider: e.target.value as LLMProvider })
                }
                className="bg-slate-800 text-xs text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="mock">⚡ 本地智能啟發式引擎 (Mock - 免 API Key，即時無延遲)</option>
                <option value="gemini">Google Gemini 2.0 / 1.5</option>
                <option value="openai">OpenAI GPT-4o / Mini</option>
                <option value="deepseek">DeepSeek V3 / R1</option>
              </select>
            </div>

            {/* Model Name */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono">模型名稱 (Model Identifier)</span>
              <input
                type="text"
                value={agent.model}
                onChange={e => onUpdateAgentConfig(selectedRole, { model: e.target.value })}
                className="bg-slate-800 text-xs text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              />
            </div>

            {/* Temperature Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
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
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>精準守紀 (0.0)</span>
                <span>靈活創新 (1.0)</span>
              </div>
            </div>

            {/* API Key (Optional) */}
            {agent.provider !== 'mock' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>API 金鑰 (自填或讀取 .env)</span>
                </span>
                <input
                  type="password"
                  value={agent.apiKey || ''}
                  onChange={e => onUpdateAgentConfig(selectedRole, { apiKey: e.target.value })}
                  placeholder="可選填入個人 API Key..."
                  className="bg-slate-800 text-xs text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Action Button: Run Manual Turn */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={onRunManualTurn}
          disabled={isExecuting}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isExecuting ? 'Agent 協同決策中...' : '單步驅動多 Agent 思考 (Run Turn)'}</span>
        </button>
      </div>
    </div>
  );
};
