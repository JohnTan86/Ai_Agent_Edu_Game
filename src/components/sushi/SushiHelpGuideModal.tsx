'use client';

import React from 'react';
import { X, Bot, Network, Sparkles } from 'lucide-react';
import { useSushiI18n } from '../../lib/sushi/i18n';

interface SushiHelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SushiHelpGuideModal: React.FC<SushiHelpGuideModalProps> = ({ isOpen, onClose }) => {
  const { language } = useSushiI18n();
  const isEn = language === 'en';
  const isCn = language === 'zh-CN';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-900/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
              🍣
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                {isEn
                  ? 'SushiFlow AI: Multi-Agent Collaboration Student Guide'
                  : isCn
                  ? '寿司物语 AI：多 Agent 协同教学指南'
                  : '壽司物語 AI：多 Agent 協同教學指南'}
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  STUDENT GUIDE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'Learn how to design, prompt, and coordinate specialized AI agents to run a high-turnover sushi restaurant'
                  : isCn
                  ? '学习如何设计、调校并控制多个各司其职的 AI Agent 经营一家寿司餐厅'
                  : '學習如何設計、調校並控制多個各司其職的 AI Agent 經營一家壽司餐廳'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1: What is Multi-Agent System */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isEn
                  ? 'What is a Multi-Agent System (MAS)?'
                  : isCn
                  ? '什么是多 Agent 协同系统 (Multi-Agent System, MAS)？'
                  : '什麼是多 Agent 協同系統 (Multi-Agent System, MAS)？'}
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              {isEn ? (
                <>
                  In traditional prompts, asking a single AI to handle customer hospitality, inventory calculations, and cooking simultaneously leads to instruction interference and hallucination.
                  <br />
                  A <strong>Multi-Agent System</strong> decouples complex operations into specialized roles. Each agent possesses an independent <strong>System Prompt</strong>, dedicated <strong>Tool library</strong>, and state perception, cooperating asynchronously over a shared <strong>Message Event Bus</strong>!
                </>
              ) : isCn ? (
                <>
                  在传统单 Prompt 中，让一个 AI 既招呼客人、算库存又烹调，容易造成注意力分散与指令冲突。
                  <br />
                  <strong>多 Agent 架构</strong>将复杂业务拆解为专精角色，每个 Agent 拥有独立系统提示词、专属工具库与状态感知，通过“消息总线”异步协同！
                </>
              ) : (
                <>
                  在傳統單一 Prompt 中，讓一個 AI 既招呼客人、算庫存又炒菜，容易造成注意力分散與指令衝突。
                  <br />
                  <strong>多 Agent 架構</strong>將複雜業務拆解為專精角色，每個 Agent 擁有獨立系統提示詞、專屬工具庫與狀態感知，透過「訊息總線」非同步協同！
                </>
              )}
            </p>
          </div>

          {/* Section 2: Four Core Roles */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                {isEn ? 'Four Core Restaurant Agent Roles' : isCn ? '寿司店四大 Agent 职责分工' : '壽司店四大 Agent 職責分工'}
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Host */}
              <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💁‍♀️</span>
                  <div>
                    <span className="text-xs font-bold text-sky-300">
                      {isEn ? 'Aoi (Chief Host & Front-of-House)' : '服務接待員 阿葵 (Host)'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isEn ? 'Hospitality • Dietary Notes • Ticket Generation' : '外場門面・意圖理解・工單發布'}
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {isEn ? (
                    <>
                      <li>Guides queued guests to available dining tables.</li>
                      <li>Accurately parses dietary notes (e.g. "No Wasabi", "Vegan").</li>
                      <li>Creates structured kitchen tickets for the chef.</li>
                      <li>Delivers plated dishes and collects cash bills & tips.</li>
                    </>
                  ) : (
                    <>
                      <li>引導隊列客人入座空席。</li>
                      <li>精準識別客人忌口（如「不要芥末」、「素食」）。</li>
                      <li>格式化生成點餐工單傳送給後廚。</li>
                      <li>及時端菜上桌與收取餐費與小費。</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Chef */}
              <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🍳</span>
                  <div>
                    <span className="text-xs font-bold text-orange-300">
                      {isEn ? 'Kenji (Executive Chef)' : '料理長 健次 (Executive Chef)'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isEn ? 'Kitchen Capacity • Craftsmanship • Batch Cooking' : '核心產能・匠人精神・批次優化'}
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {isEn ? (
                    <>
                      <li>Reviews pending tickets and strictly enforces dietary notes.</li>
                      <li>Checks ingredient levels, alerting inventory if out of stock.</li>
                      <li>Crafts nigiri, gunkan rolls, and seared aburi dishes.</li>
                      <li>Plates dishes at the pickup pass, notifying the host.</li>
                    </>
                  ) : (
                    <>
                      <li>審核待辦工單與特殊忌口備註。</li>
                      <li>檢查食材庫存，缺料時立即通報採購。</li>
                      <li>捏製握壽司、軍艦卷與炙燒和牛。</li>
                      <li>料理擺盤出餐，通知外場取餐。</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Inventory */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-300">
                      {isEn ? 'Ren (Inventory & Supply Chain Manager)' : '採購部長 蓮 (Inventory Manager)'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isEn ? 'Safety Stock • Cash Flow Defense • Anti-Stockout' : '供應鏈防禦・安全庫存・抗缺貨'}
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {isEn ? (
                    <>
                      <li>Real-time stock counting for rice, salmon, tuna, etc.</li>
                      <li>Configures reorder thresholds (e.g. reorder if &lt; 6 portions).</li>
                      <li>Guards cash flow to prevent bankruptcy from over-procuring.</li>
                      <li>Pre-stocks inventory ahead of lunch and dinner rush hours.</li>
                    </>
                  ) : (
                    <>
                      <li>實時盤點越光米、鮭魚、金槍魚儲備。</li>
                      <li>設定安全庫存門檻（如低於 6 份補貨）。</li>
                      <li>平衡現金流，避免採購過度導致破產。</li>
                      <li>午餐高峰期前提早進行產能備貨。</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Manager */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👩‍💼</span>
                  <div>
                    <span className="text-xs font-bold text-purple-300">
                      {isEn ? 'Sakura (General Manager)' : '總店長 櫻 (General Manager)'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {isEn ? 'Global Audit • Complaint Remedy • Team Direction' : '全域審計・瓶頸解決・顧客關懷'}
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {isEn ? (
                    <>
                      <li>Monitors customer satisfaction (CSAT) and operating margins.</li>
                      <li>Detects impatient waiting guests and provides complimentary matcha.</li>
                      <li>Issues restaurant-wide strategy (High Turnover vs Michelin Omakase).</li>
                      <li>Plans table expansions and chain branch opening.</li>
                    </>
                  ) : (
                    <>
                      <li>監控滿意度（CSAT）與營業利潤率。</li>
                      <li>發現顧客等待超時，主動發放甜品撫慰。</li>
                      <li>發布全店方針（如極速翻台流 vs 米其林高品質流）。</li>
                      <li>規劃擴建餐桌與開設連鎖分店。</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Prompt Engineering Tips */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isEn
                  ? 'Prompt Engineering Tips for Students'
                  : isCn
                  ? 'Prompt 编写实战技巧 (Prompt Engineering)'
                  : 'Prompt 調校實戰技巧 (Prompt Engineering)'}
              </span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              {isEn ? (
                <>
                  <div>
                    <strong className="text-white">1. Thresholds & Quantitative Bounds:</strong> In Ren&apos;s prompt, explicitly instruct:
                    <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono ml-1">
                      When salmon &lt; 6 or rice &lt; 10, immediately order from market
                    </code>
                    . The agent will parse and execute this heuristic rule!
                  </div>
                  <div>
                    <strong className="text-white">2. Dietary Exceptions & Safety:</strong> In Aoi and Kenji&apos;s prompts, emphasize:
                    <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono ml-1">
                      Carefully check customer notes for &quot;no wasabi&quot; and never add wasabi
                    </code>
                    . This avoids harsh 1-star reviews from allergic customers!
                  </div>
                  <div>
                    <strong className="text-white">3. VIP Priority:</strong> When Michelin VIP critics dine, instruct host and chef to give top priority, earning +25% generous tips!
                  </div>
                  <div>
                    <strong className="text-white">4. Cash Flow Defense:</strong> Instruct Ren not to order expensive Wagyu when cash falls below $150 to prevent immediate bankruptcy.
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong className="text-white">1. 門檻與數值約束：</strong> 在蓮（採購）的提示詞中明確寫入：
                    <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono ml-1">
                      當鮭魚低於 6 份或醋飯低於 10 份時，立即向市場採購
                    </code>
                    ，Agent 會智能解析並自動執行！
                  </div>
                  <div>
                    <strong className="text-white">2. 忌口與例外處理：</strong> 在阿葵與健次的提示詞中加強：
                    <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono ml-1">
                      特別注意顧客備註不要芥末，切勿放入山葵
                    </code>
                    ，可防止客人因吃進芥末而大扣滿意度。
                  </div>
                  <div>
                    <strong className="text-white">3. VIP 優先級：</strong> 當有米其林 VIP 評論家進店時，提示接待與廚師給予最優先順序，能獲得高達 25% 的高額小費！
                  </div>
                  <div>
                    <strong className="text-white">4. 現金流防線：</strong> 在蓮的提示詞中加入結餘低於 $150 時暫緩高價和牛採購，避免立即破產 Game Over！
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            {isEn ? 'I Understand, Let&apos;s Play!' : isCn ? '我了解了，开始经营！' : '我瞭解了，開始經營！'}
          </button>
        </div>
      </div>
    </div>
  );
};
