/**
 * SushiFlow Simulation Time & Shift Constants
 * Business Operating Hours: 11:00 AM to 09:00 PM (21:00) = 10 hours = 600 mins
 * TICKS_PER_DAY = 100 ticks (each tick = 6 simulated minutes)
 */

export const TICKS_PER_DAY = 100;
export const OPEN_HOUR_24 = 11; // 11:00 AM
export const CLOSE_HOUR_24 = 21; // 09:00 PM (21:00)

export interface SushiClockInfo {
  day: number;
  dayTick: number;
  hours24: number;
  mins: number;
  time24: string;
  time12: string;
  progressPct: number;
  shiftPhase: 'pre_shift' | 'open' | 'lunch_rush' | 'afternoon_lull' | 'dinner_rush' | 'last_call' | 'closed';
  shiftPhaseLabel: string;
  shiftPhaseEmoji: string;
  arrivalMultiplier: number;
  isShiftEnd: boolean;
}

/**
 * Computes structured Day & Clock info for the 11:00 AM - 09:00 PM (21:00) shift
 */
export function getSushiClockInfo(
  tick: number,
  explicitDay?: number,
  isShiftEnded?: boolean,
  language: 'zh-TW' | 'en' | 'zh-CN' = 'zh-TW'
): SushiClockInfo {
  const day = explicitDay || Math.floor(Math.max(0, tick - 1) / TICKS_PER_DAY) + 1;
  const rawDayTick = tick === 0 ? 0 : (tick - 1) % TICKS_PER_DAY + 1;
  const dayTick = isShiftEnded && rawDayTick >= TICKS_PER_DAY ? TICKS_PER_DAY : Math.max(0, Math.min(TICKS_PER_DAY, rawDayTick));

  const totalMins = dayTick * 6; // 100 ticks * 6 mins = 600 mins = 10 hours
  const hours24 = OPEN_HOUR_24 + Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 > 12 ? hours24 - 12 : hours24;

  const time24 = `${hours24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  const time12 = `${hours12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${ampm}`;
  const progressPct = Math.min(100, Math.round((dayTick / TICKS_PER_DAY) * 100));

  let shiftPhase: SushiClockInfo['shiftPhase'] = 'open';
  let shiftPhaseEmoji = '🌅';
  let arrivalMultiplier = 1.0;

  if (dayTick === 0) {
    shiftPhase = 'pre_shift';
    shiftPhaseEmoji = '🍵';
    arrivalMultiplier = 0.5;
  } else if (dayTick >= 10 && dayTick <= 35) {
    // 12:00 - 14:30
    shiftPhase = 'lunch_rush';
    shiftPhaseEmoji = '🔥';
    arrivalMultiplier = 2.1;
  } else if (dayTick > 35 && dayTick < 65) {
    // 14:30 - 17:30
    shiftPhase = 'afternoon_lull';
    shiftPhaseEmoji = '🍵';
    arrivalMultiplier = 0.55;
  } else if (dayTick >= 65 && dayTick <= 85) {
    // 17:30 - 19:30
    shiftPhase = 'dinner_rush';
    shiftPhaseEmoji = '🏮';
    arrivalMultiplier = 2.3;
  } else if (dayTick > 85 && dayTick < 100) {
    // 19:30 - 21:00
    shiftPhase = 'last_call';
    shiftPhaseEmoji = '🛑';
    arrivalMultiplier = 0.3;
  } else if (dayTick >= TICKS_PER_DAY || isShiftEnded) {
    shiftPhase = 'closed';
    shiftPhaseEmoji = '🌇';
    arrivalMultiplier = 0;
  }

  const phaseLabels: Record<'zh-TW' | 'en' | 'zh-CN', Record<SushiClockInfo['shiftPhase'], string>> = {
    'zh-TW': {
      pre_shift: '開工前準備',
      open: '開店迎賓',
      lunch_rush: '午市高峰爆單',
      afternoon_lull: '午後平緩備料',
      dinner_rush: '晚市極品熱潮',
      last_call: '尾聲最後點餐',
      closed: '收工打烊結算'
    },
    'en': {
      pre_shift: 'Pre-Shift Prep',
      open: 'Doors Open',
      lunch_rush: 'Lunch Rush',
      afternoon_lull: 'Afternoon Lull',
      dinner_rush: 'Dinner Rush',
      last_call: 'Last Call',
      closed: 'Shift Ended'
    },
    'zh-CN': {
      pre_shift: '开工前准备',
      open: '开店迎宾',
      lunch_rush: '午市高峰爆单',
      afternoon_lull: '午后平缓备料',
      dinner_rush: '晚市极品热潮',
      last_call: '尾声最后点餐',
      closed: '收工打烊结算'
    }
  };

  const shiftPhaseLabel = phaseLabels[language]?.[shiftPhase] || phaseLabels['zh-TW'][shiftPhase];

  return {
    day,
    dayTick,
    hours24,
    mins,
    time24,
    time12,
    progressPct,
    shiftPhase,
    shiftPhaseLabel,
    shiftPhaseEmoji,
    arrivalMultiplier,
    isShiftEnd: dayTick >= TICKS_PER_DAY || Boolean(isShiftEnded)
  };
}

/**
 * Format clock string for display e.g. "D1 12:30 PM (午市高峰)"
 */
export function formatSushiShiftTime(tick: number, day: number, isShiftEnded?: boolean): string {
  const clock = getSushiClockInfo(tick, day, isShiftEnded);
  return `第 ${clock.day} 天 • ${clock.time12} [${clock.shiftPhaseEmoji} ${clock.shiftPhaseLabel}]`;
}
