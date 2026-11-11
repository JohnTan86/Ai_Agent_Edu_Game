import React from 'react';
import { X, BookOpen, Bot, Sparkles, Network, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface SushiHelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SushiHelpGuideModal: React.FC<SushiHelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-900/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🍣
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                壽司物語 AI：多 Agent 協同教學指南
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                  STUDENT GUIDE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                學習如何設計、調校並控制多個各司其職的 AI Agent 經營一家壽司餐廳
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: What is Multi-Agent System */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Network className="w-4 h-4 text-amber-400" />
              <span>什麼是多 Agent 協同系統 (Multi-Agent System, MAS)？</span>
            </h3>
            <p className="text-xs text-slate-300">
              在傳統程式或單一 Prompt 中，如果讓一個 AI 既要招呼客人、又要算庫存、又要炒菜，很容易造成「注意力分散與指令衝突」。
              <br />
              <strong>多 Agent 架構</strong>將複雜的企業業務拆解為多個<strong>專精角色</strong>，每個 Agent 擁有獨立的提示詞（System Prompt）、專屬工具庫（Tools）與狀態空間，彼此透過「訊息總線（Message Bus）」進行非同步合作！
            </p>
          </div>

          {/* Section 2: Four Core Roles */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-400" />
              <span>壽司店四大 Agent 職責分工</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Host */}
              <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💁‍♀️</span>
                  <div>
                    <span className="text-xs font-bold text-sky-300">服務接待員 阿葵 (Host)</span>
                    <p className="text-[10px] text-slate-400">外場門面・意圖理解・工單發布</p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>引導隊列客人入座空席。</li>
                  <li>精準識別客人忌口（如「不要芥末」、「素食」）。</li>
                  <li>格式化生成點餐工單傳送給後廚。</li>
                  <li>及時端菜上桌與收取餐費與小費。</li>
                </ul>
              </div>

              {/* Chef */}
              <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👨‍🍳</span>
                  <div>
                    <span className="text-xs font-bold text-orange-300">料理長健次 (Executive Chef)</span>
                    <p className="text-[10px] text-slate-400">核心產能・匠人精神・批次優化</p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>審核待辦工單與特殊忌口備註。</li>
                  <li>檢查食材庫存，缺料時立即通報採購。</li>
                  <li>捏製握壽司、軍艦卷與炙燒和牛。</li>
                  <li>料理擺盤出餐，通知外場取餐。</li>
                </ul>
              </div>

              {/* Inventory */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <span className="text-xs font-bold text-emerald-300">採購部長蓮 (Inventory Manager)</span>
                    <p className="text-[10px] text-slate-400">供應鏈防禦・安全庫存・抗缺貨</p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>實時盤點越光米、鮭魚、金槍魚儲備。</li>
                  <li>設定安全庫存門檻（如低於 6 份補貨）。</li>
                  <li>平衡現金流，避免採購過度導致破產。</li>
                  <li>午餐高峰期前提早進行產能備貨。</li>
                </ul>
              </div>

              {/* Manager */}
              <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👩‍💼</span>
                  <div>
                    <span className="text-xs font-bold text-purple-300">總店長櫻 (General Manager)</span>
                    <p className="text-[10px] text-slate-400">全域審計・瓶頸解決・顧客關懷</p>
                  </div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>監控滿意度（CSAT）與營業利潤率。</li>
                  <li>發現顧客等待超時，主動發放甜品撫慰。</li>
                  <li>發布全店方針（如極速翻台流 vs 米其林高品質流）。</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Prompt Engineering Tips */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Prompt 調校實戰技巧 (Prompt Engineering)</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
          >
            我瞭解了，開始經營！
          </button>
        </div>
      </div>
    </div>
  );
};
