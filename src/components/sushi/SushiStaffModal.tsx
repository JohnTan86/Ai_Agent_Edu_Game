import React from 'react';
import { X, UserPlus, Users, Check, Trash2 } from 'lucide-react';
import { StaffCandidate, AVAILABLE_STAFF_CANDIDATES } from '../../lib/sushi/staffConfig';
import { RestaurantFinancials } from '../../lib/sushi/types';
import { useSushiI18n } from '../../lib/sushi/i18n';

interface SushiStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  hiredStaff: StaffCandidate[];
  onHireStaff: (candidate: StaffCandidate) => void;
  onFireStaff: (staffId: string) => void;
  financials: RestaurantFinancials;
  currentBranchName?: string;
}

export const SushiStaffModal: React.FC<SushiStaffModalProps> = ({
  isOpen,
  onClose,
  hiredStaff,
  onHireStaff,
  onFireStaff,
  financials,
  currentBranchName
}) => {
  const { language, t } = useSushiI18n();
  const isEn = language === 'en';

  if (!isOpen) return null;

  const currentWagesEvery10Ticks = hiredStaff.reduce((sum, s) => sum + s.wagePer10Ticks, 0);

  const getCandidateName = (id: string, def: string) => {
    if (!isEn) return def;
    switch (id) {
      case 'staff_waiter_1': return 'Yuki (Senior Waitress)';
      case 'staff_waiter_2': return 'Taro (Junior Waiter)';
      case 'staff_chef_1': return 'Chef Daiki (Tempura & Nigiri)';
      case 'staff_chef_2': return 'Apprentice Ken (Prep Assistant)';
      default: return def;
    }
  };

  const getCandidateRole = (role: string, def: string) => {
    if (!isEn) return def;
    return role === 'waiter' ? 'Front-of-House Waiter' : 'Kitchen Sous Chef';
  };

  const getCandidatePerks = (id: string, def: string) => {
    if (!isEn) return def;
    switch (id) {
      case 'staff_waiter_1': return 'Seating & Cashier speed +35%';
      case 'staff_waiter_2': return 'Seating speed +20%';
      case 'staff_chef_1': return 'All sushi prep speed +30%';
      case 'staff_chef_2': return 'Dish plating & prep speed +15%';
      default: return def;
    }
  };

  const getCandidateDesc = (id: string, def: string) => {
    if (!isEn) return def;
    switch (id) {
      case 'staff_waiter_1': return 'Experienced hospitality pro. Accelerates guest turnaround significantly.';
      case 'staff_waiter_2': return 'Energetic young runner. Helps Aoi guide queuing guests quickly.';
      case 'staff_chef_1': return 'Skilled culinary artisan. Assists Chef Kenji in high-volume crafting.';
      case 'staff_chef_2': return 'Hardworking apprentice. Prepares ingredients and plates sushi rapidly.';
      default: return def;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-amber-600/40 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-amber-950/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {t('staffModalTitle')}
                </h2>
                {currentBranchName && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-200 border border-amber-500/40 font-bold">
                    🏢 {currentBranchName}
                  </span>
                )}
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {isEn ? `Hired: ${hiredStaff.length}` : `已聘用 ${hiredStaff.length} 人`}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {currentBranchName ? (isEn ? `Recruiting and managing dedicated staff for [${currentBranchName}]. Each branch maintains independent staff.` : `為【${currentBranchName}】招募與管理專屬員工，各分店人事營運獨立獨立計薪。`) : t('staffModalSub')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Payroll Summary Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">{isEn ? 'Available Cash:' : '可用資金:'}</span>
              <span className={`font-mono font-bold ${financials.balance < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                ${financials.balance.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">{isEn ? 'Current Wages:' : '當前薪資開銷:'}</span>
              <span className="font-mono font-bold text-amber-300">
                -${currentWagesEvery10Ticks} / {isEn ? '10 ticks' : '10刻度'}
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 italic">
            {isEn
              ? '⚠️ Warning: If revenues cannot cover payroll, negative balance triggers Bankruptcy Game Over!'
              : '⚠️ 提示：若營業額無法覆蓋員工薪水，資金赤字將引發【破產 Game Over】！'}
          </span>
        </div>

        {/* Staff List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-3">
          {AVAILABLE_STAFF_CANDIDATES.map(candidate => {
            const isHired = hiredStaff.some(s => s.id === candidate.id);
            const canAfford = financials.balance >= candidate.hireCost;
            const name = getCandidateName(candidate.id, candidate.name);
            const role = getCandidateRole(candidate.role, candidate.roleTitle);
            const perks = getCandidatePerks(candidate.id, candidate.perks);
            const desc = getCandidateDesc(candidate.id, candidate.description);

            return (
              <div
                key={candidate.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isHired
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                {/* Left: Avatar & Info */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {candidate.avatar}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 font-mono">
                        {role}
                      </span>
                      {isHired && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> {isEn ? 'On Duty' : '在崗在職'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-amber-300 font-medium mt-0.5">
                      ✨ {isEn ? 'Perk: ' : '特長：'}{perks}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5 leading-snug">
                      {desc}
                    </span>
                  </div>
                </div>

                {/* Right: Cost & Hire / Fire Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-750">
                  <div className="flex flex-col sm:items-end text-xs font-mono">
                    <span className="text-slate-400">
                      {isEn ? 'Fee: ' : '簽約費: '}<strong className="text-white">${candidate.hireCost}</strong>
                    </span>
                    <span className="text-slate-400 text-xs">
                      {isEn ? 'Wage: ' : '薪資: '}<strong className="text-amber-400">${candidate.wagePer10Ticks}</strong> / {isEn ? '10 ticks' : '10刻度'}
                    </span>
                  </div>

                  {isHired ? (
                    <button
                      onClick={() => onFireStaff(candidate.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 transition flex items-center gap-1 active:scale-95"
                      title="Dismiss staff"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t('dismissBtn')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onHireStaff(candidate)}
                      disabled={!canAfford}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 shadow-md shadow-amber-950 active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('hireBtn')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isEn
              ? 'Strategy: Scale up staff during rushes to accelerate turnover; trim payroll during quiet hours!'
              : '經營心法：高峰時段加派人手衝刺翻台，客流平緩時及時精簡人事成本！'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            {isEn ? 'Return to Floor' : '返回餐廳'}
          </button>
        </div>
      </div>
    </div>
  );
};
