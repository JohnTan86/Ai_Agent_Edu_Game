'use client';

import React, { useState } from 'react';
import {
  Bot,
  Play,
  Wrench,
  Sparkles,
  Sliders,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Cpu,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';
import { AgentConfig, LLMProvider } from '../../lib/types';
import { getPromptPresets, getSystemTools } from '../../lib/constants';
import { translations, Language } from '../../lib/i18n';

interface AgentWorkspaceProps {
  config: AgentConfig;
  onChangeConfig: (newConfig: AgentConfig) => void;
  onToggleTool: (toolName: string) => void;
  onRunDispatch: () => void;
  isExecuting: boolean;
  activeOrdersCount: number;
  lang: Language;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  config,
  onChangeConfig,
  onToggleTool,
  onRunDispatch,
  isExecuting,
  activeOrdersCount,
  lang
}) => {
  const [showToolsDrawer, setShowToolsDrawer] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const t = translations[lang].workspace;
  const presets = getPromptPresets(lang);
  const tools = getSystemTools(lang);

  // Quick insertion helpers for prompt engineering
  const insertPromptSnippet = (snippet: string) => {
    onChangeConfig({
      ...config,
      systemPrompt: config.systemPrompt + '\n' + snippet
    });
  };

  const estimatedTokens = Math.round(config.systemPrompt.length / 3.8);

  // Detect active preset
  const matchedPreset = presets.find(p => p.prompt.trim() === config.systemPrompt.trim());

  return (
    <div className="w-80 lg:w-96 h-full flex flex-col bg-slate-950/95 border-r border-cyan-950/60 overflow-hidden text-xs font-mono select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-cyan-950/60 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-200 tracking-wider">
              {t.title}
            </div>
            <div className="text-[10px] text-slate-400">
              {t.subtitle}
            </div>
          </div>
        </div>

        {/* Active Provider Pill */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="uppercase">{config.provider === 'mock' ? 'MOCK' : config.provider}</span>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* 1. LLM Engine / Provider Switch */}
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            {t.providerSelect}
          </label>
          <select
            value={config.provider}
            onChange={(e) => {
              const p = e.target.value as LLMProvider;
              let defaultModel = 'local-mock-heuristic';
              if (p === 'gemini') defaultModel = 'gemini-2.0-flash';
              if (p === 'openai') defaultModel = 'gpt-4o-mini';
              if (p === 'deepseek') defaultModel = 'deepseek-chat';
              onChangeConfig({ ...config, provider: p, model: defaultModel });
            }}
            className="w-full bg-slate-950 border border-slate-800 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="mock">{t.mockEngine}</option>
            <option value="gemini">{t.geminiEngine}</option>
            <option value="openai">{t.openAiEngine}</option>
            <option value="deepseek">{t.deepseekEngine}</option>
          </select>

          {/* Model Sub-Variant Selector (for real LLMs) */}
          {config.provider === 'gemini' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
              <span className="text-slate-400 font-mono font-bold">MODEL:</span>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'gemini-2.0-flash' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'gemini-2.0-flash'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                2.0 Flash
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'gemini-1.5-flash' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'gemini-1.5-flash' || config.model === 'gemini-1.5-flash-latest'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                1.5 Flash
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'gemini-1.5-pro' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'gemini-1.5-pro'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                1.5 Pro
              </button>
              <span className="ml-auto text-[9px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                {config.model}
              </span>
            </div>
          )}

          {config.provider === 'openai' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
              <span className="text-slate-400 font-mono font-bold">MODEL:</span>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'gpt-4o-mini' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'gpt-4o-mini'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                GPT-4o mini
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'gpt-4o' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'gpt-4o'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                GPT-4o
              </button>
              <span className="ml-auto text-[9px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                {config.model}
              </span>
            </div>
          )}

          {config.provider === 'deepseek' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
              <span className="text-slate-400 font-mono font-bold">MODEL:</span>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'deepseek-chat' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'deepseek-chat'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                DeepSeek-V3
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, model: 'deepseek-reasoner' })}
                className={`px-2 py-0.5 rounded border transition-colors ${
                  config.model === 'deepseek-reasoner'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                DeepSeek-R1
              </button>
              <span className="ml-auto text-[9px] text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                {config.model}
              </span>
            </div>
          )}

          {/* Optional API Key Input */}
          {config.provider !== 'mock' && (
            <div className="pt-1.5 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-cyan-400" />
                  {t.apiKeyLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey || ''}
                onChange={(e) => onChangeConfig({ ...config, apiKey: e.target.value })}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* 2. Preset Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">{t.promptProtocol}</span>
            <span className="text-[10px] text-cyan-400">~{estimatedTokens} {t.tokensEst}</span>
          </div>

          <select
            value={!config.systemPrompt ? 'empty' : (matchedPreset?.id || 'custom')}
            onChange={(e) => {
              if (e.target.value === 'empty') {
                onChangeConfig({ ...config, systemPrompt: '' });
                return;
              }
              const preset = presets.find(p => p.id === e.target.value);
              if (preset) {
                onChangeConfig({ ...config, systemPrompt: preset.prompt });
              }
            }}
            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="empty">
              {lang === 'zh' ? '✨ [新手第1关] 从零自由编写 (自主提示词)' : '✨ [Level 1] Blank / Write From Scratch'}
            </option>
            {presets.map(preset => (
              <option key={preset.id} value={preset.id}>
                {t.presetLabel}: {preset.title}
              </option>
            ))}
            <option value="custom">{t.presetCustom}</option>
          </select>
        </div>

        {/* 3. System Prompt Text Editor */}
        <div className="space-y-1.5">
          {!config.systemPrompt && (
            <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-[10px] text-cyan-200 space-y-1 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{lang === 'zh' ? '第 1 关目标：用自然语言编写调度指令' : 'Level 1: Write instructions to dispatch your fleet'}</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                {lang === 'zh'
                  ? '告诉智能体：优先派送哪单、检查电量、何时返回站点充电。写完后点击下方【执行调度】。'
                  : 'Instruct the agent: which order to pick, battery checks, and when to recharge. Then click EXECUTE DISPATCH.'}
              </p>
            </div>
          )}

          <div className="relative">
            <textarea
              value={config.systemPrompt}
              onChange={(e) => onChangeConfig({ ...config, systemPrompt: e.target.value })}
              placeholder={
                lang === 'zh'
                  ? '【在此输入你的调度策略（支持中英文）】例如：\n1. 检查待配送订单，优先取件并送达距离最近的客户包裹。\n2. 出发前检查小车电量，确保能完成往返。\n3. 当电量低于25%时，命令小车自主返回中心站点充电。\n4. 完成配送后，若电量充足可就近继续配送下一单。'
                  : '[Type your instructions here in plain English or Chinese] Example:\n1. Check pending orders and dispatch the rover to deliver the closest parcel first.\n2. Ensure battery is sufficient before departure.\n3. Return to base to recharge if battery drops below 25%.\n4. Standby or chain next delivery if battery is healthy.'
              }
              rows={9}
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 text-[11px] font-mono text-cyan-100 placeholder-slate-500 focus:outline-none transition-colors leading-relaxed resize-none shadow-inner"
              spellCheck={false}
            />
          </div>

          {/* Quick Insert Prompt Directives */}
          <div className="pt-1">
            <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> {t.quickDirectives}
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => insertPromptSnippet(
                  lang === 'zh'
                    ? '• 优先调度 SLA 剩余时钟周期最短的订单 (remainingTicks < 25)。'
                    : '• Prioritize orders with tightest SLA deadlines (remainingTicks < 25).'
                )}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {t.directiveSla}
              </button>
              <button
                type="button"
                onClick={() => insertPromptSnippet(
                  lang === 'zh'
                    ? '• 严禁派出当前电池电量低于30%的机器人执行配送任务。'
                    : '• Never assign robots below 30% battery to long-distance jobs.'
                )}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {t.directiveBattery}
              </button>
              <button
                type="button"
                onClick={() => insertPromptSnippet(
                  lang === 'zh'
                    ? '• 当机器人电量低于25%时，强制引导其自主返回最近中心站点充电机位。'
                    : '• Automatically route robots with battery < 25% to nearest charging hub.'
                )}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {t.directiveRecharge}
              </button>
              <button
                type="button"
                onClick={() => insertPromptSnippet(
                  lang === 'zh'
                    ? '• 规划路线时必须绕开重度拥堵路段 (trafficMultiplier > 2.0)。'
                    : '• Route around severe traffic congestion (trafficMultiplier > 2.0).'
                )}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {t.directiveTraffic}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Tools & Parameter Schema Section */}
        <div className="border border-slate-800/80 rounded-lg bg-slate-900/50 overflow-hidden">
          <button
            onClick={() => setShowToolsDrawer(!showToolsDrawer)}
            className="w-full px-3 py-2 flex items-center justify-between text-left text-slate-300 hover:bg-slate-900/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-[11px]">{t.availableTools}</span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px]">
                {config.enabledTools.length}/{tools.length}
              </span>
            </div>
            {showToolsDrawer ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showToolsDrawer && (
            <div className="p-2.5 pt-1 space-y-2 border-t border-slate-800/80">
              {tools.map(tool => {
                const isEnabled = config.enabledTools.includes(tool.name);
                return (
                  <div
                    key={tool.name}
                    onClick={() => onToggleTool(tool.name)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      isEnabled
                        ? 'bg-slate-900/90 border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                        : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isEnabled ? (
                          <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="font-bold text-slate-200 text-[11px]">
                          {tool.name}()
                        </span>
                      </div>
                      <span className={`text-[9px] px-1 rounded ${isEnabled ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                        {isEnabled ? t.toolEnabled : t.toolOff}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Button */}
      <div className="p-3 border-t border-cyan-950/60 bg-slate-900/60 space-y-2">
        <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{lang === 'zh' ? '自主连续派单引擎' : 'AUTONOMOUS ORCHESTRATOR'}</span>
          </div>
          <span className="text-cyan-400 font-bold">
            {lang === 'zh' ? '由提示词驱动' : 'PROMPT-DRIVEN'}
          </span>
        </div>

        <button
          onClick={onRunDispatch}
          disabled={isExecuting}
          className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-wait active:scale-[0.98]"
        >
          {isExecuting ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
              <span>{t.agentThinking}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.runDispatch} ({activeOrdersCount} {t.pendingSuffix})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
