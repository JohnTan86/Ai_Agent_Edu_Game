'use client';

import React from 'react';
import { X, Bot, Wrench, DollarSign, BatteryCharging, AlertTriangle, CheckCircle, Terminal } from 'lucide-react';
import { translations, Language } from '../../lib/i18n';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const t = translations[lang].guide;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-slate-100">
                {t.title}
              </h2>
              <p className="text-xs text-slate-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 font-sans leading-relaxed">
          {/* Concept Overview */}
          <section className="space-y-2">
            <h3 className="text-cyan-400 font-mono font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {t.section1Title}
            </h3>
            <p className="text-xs text-slate-300">
              {t.section1Desc}
            </p>
          </section>

          {/* Core Game Loop */}
          <section className="space-y-2">
            <h3 className="text-emerald-400 font-mono font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              {t.section2Title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-mono text-cyan-300 font-semibold flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5" /> REVENUE / 运费营收
                </span>
                {t.revenueDesc}
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="font-mono text-rose-400 font-semibold flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> COSTS / 运营成本
                </span>
                {t.expensesDesc}
              </div>
            </div>
          </section>

          {/* Tools & Telemetry */}
          <section className="space-y-2">
            <h3 className="text-amber-400 font-mono font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-amber-400" />
              {t.section3Title}
            </h3>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-400 pl-1 font-mono">
              <li><code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">check_robot_telemetry</code>: Monitors battery %, payload weight, and idle status.</li>
              <li><code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">get_traffic_conditions</code>: Identifies congested road zones to calculate detours.</li>
              <li><code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">calculate_route_eta</code>: Uses A* pathfinding to predict travel ticks before assigning.</li>
              <li><code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">order_battery_recharge</code>: Directs low-battery rovers to the nearest charging hub.</li>
            </ul>
          </section>

          {/* Architect Strategy Tips */}
          <section className="space-y-2 bg-cyan-950/30 border border-cyan-800/40 p-3.5 rounded-lg">
            <h3 className="text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-cyan-400" /> {t.section4Title}
            </h3>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p>• {t.tip1}</p>
              <p>• {t.tip2}</p>
              <p>• {t.tip3}</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs transition-colors"
          >
            {t.ackBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
