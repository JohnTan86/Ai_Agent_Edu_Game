import React from 'react';
import { Award, RotateCcw, ArrowRight, CheckCircle2, AlertTriangle, X, Star } from 'lucide-react';
import { SushiScenario, SushiSimulationState } from '../../lib/sushi/types';
import { SUSHI_SCENARIOS } from '../../lib/sushi/defaultScenarios';

interface SushiReportModalProps {
  state: SushiSimulationState;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSelectScenario: (id: string) => void;
}

export const SushiReportModal: React.FC<SushiReportModalProps> = ({
  state,
  isOpen,
  onClose,
  onRetry,
  onSelectScenario
}) => {
  if (!isOpen) return null;

  const { financials, metrics, scenario, endReason, status } = state;

  // Compute Grade S, A, B, C, F
  let grade = 'B';
  let gradeColor = 'text-amber-400 border-amber-500/50 bg-amber-500/10';

  if (status === 'failed' || financials.balance < 0) {
    grade = 'F';
    gradeColor = 'text-rose-500 border-rose-500/50 bg-rose-500/10';
  } else if (metrics.customersServed >= scenario.targetServed && metrics.customersWalkout === 0) {
    grade = 'S';
    gradeColor = 'text-yellow-300 border-yellow-400/80 bg-yellow-500/20 shadow-lg shadow-yellow-500/20';
  } else if (metrics.customersServed >= scenario.targetServed * 0.8) {
    grade = 'A';
    gradeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
  } else if (metrics.customersServed >= scenario.targetServed * 0.5) {
    grade = 'B';
    gradeColor = 'text-amber-400 border-amber-500/50 bg-amber-500/10';
  } else {
    grade = 'C';
    gradeColor = 'text-slate-400 border-slate-600 bg-slate-800';
  }

  // Next scenario
  const currentIndex = SUSHI_SCENARIOS.findIndex(s => s.id === scenario.id);
  const nextScenario = currentIndex >= 0 && currentIndex < SUSHI_SCENARIOS.length - 1
    ? SUSHI_SCENARIOS[currentIndex + 1]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-900/40 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white">壽司物語 AI 營運總結報告 (Performance Review)</h2>
              <p className="text-[11px] text-slate-400">{scenario.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          {/* Top Grade Banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-mono">綜合經營評等 (Overall Grade)</span>
              <span className="text-sm font-bold text-white">
                {status === 'victory'
                  ? '🎉 順利達成關卡營運目標！'
                  : status === 'failed'
                  ? '💔 餐廳陷入經營危機破產'
                  : '本日營業已打烊核算'}
              </span>
              {endReason && <p className="text-xs text-amber-300/90 mt-1">{endReason}</p>}
            </div>

            {/* Big Grade Badge */}
            <div
              className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-4xl font-black font-mono ${gradeColor}`}
            >
              {grade}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">接待顧客數</span>
              <span className="text-base font-bold text-white font-mono mt-1">
                {metrics.customersServed}{' '}
                <span className="text-xs text-slate-500 font-normal">
                  / {scenario.targetServed}
                </span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">營業總收入</span>
              <span className="text-base font-bold text-emerald-400 font-mono mt-1">
                ${financials.totalRevenue.toFixed(0)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">淨結餘資金</span>
              <span
                className={`text-base font-bold font-mono mt-1 ${
                  financials.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                ${financials.balance.toFixed(0)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex flex-col">
              <span className="text-[10px] text-slate-400 font-mono">平均滿意度</span>
              <span className="text-base font-bold text-amber-300 font-mono mt-1 flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>
                  {metrics.customersServed > 0
                    ? Math.max(
                        1,
                        Math.min(
                          5,
                          (5 * metrics.customersServed - metrics.customersWalkout * 2) /
                            metrics.customersServed
                        )
                      ).toFixed(1)
                    : '5.0'}
                </span>
              </span>
            </div>
          </div>

          {/* AI Collaborative Assessment */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-200">🤖 多 Agent 協同表現診斷：</span>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>外場接待 阿葵：</strong>{' '}
                {metrics.customersWalkout > 0
                  ? `發生了 ${metrics.customersWalkout} 次顧客久候離店，建議優化接待提示詞，加快帶位或催促後廚出餐。`
                  : '迎賓與點餐節奏流暢，未發生顧客負氣離席，表現優異！'}
              </li>
              <li>
                <strong>料理大將 健次：</strong> 共完成 {metrics.dishesPreparedCount} 盤壽司製作，
                {metrics.stockoutIncidentsCount > 0
                  ? `期間因缺料停頓 ${metrics.stockoutIncidentsCount} 次，需加強與採購的庫存同步。`
                  : '出餐零缺料斷檔，刀工與節奏掌控得宜！'}
              </li>
              <li>
                <strong>供應鏈採購 蓮：</strong> 採購成本控制在 ${financials.procurementCosts.toFixed(0)}，
                {financials.balance < 50
                  ? '流動資金偏低，注意避免單次大批量囤積高單價食材。'
                  : '資金周轉健康，食材供應充沛。'}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重新挑戰本關</span>
          </button>

          {nextScenario ? (
            <button
              onClick={() => {
                onSelectScenario(nextScenario.id);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition"
            >
              <span>前往下一關：{nextScenario.title.split('：')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
            >
              完成檢閱
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
