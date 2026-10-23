'use client';

import React, { useState } from 'react';
import {
  X,
  Truck,
  BatteryCharging,
  Zap,
  Building2,
  DollarSign,
  PlusCircle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { SimulationState, DeliveryRobot, Hub } from '../../lib/types';
import { ROBOT_SHOP_CONFIG, UPGRADE_PRICES } from '../../lib/constants';
import { CITIES_DATA, getCitySectorStatus } from '../../lib/cityData';
import { Language } from '../../lib/i18n';

interface FleetHubShopModalProps {
  state: SimulationState;
  isOpen: boolean;
  onClose: () => void;
  onBuyRobot: (archetype: 'speedy' | 'heavy' | 'standard') => void;
  onUpgradeRobot: (robotId: string, upgradeType: 'cargoExpanded' | 'solidStateBattery' | 'turboMotors') => void;
  onUpgradeHub: (hubId: string, targetLevel: 2 | 3) => void;
  onBuildHub: (name: string, lat: number, lng: number) => void;
  onSellHub: (hubId: string) => void;
  lang: Language;
}

export const FleetHubShopModal: React.FC<FleetHubShopModalProps> = ({
  state,
  isOpen,
  onClose,
  onBuyRobot,
  onUpgradeRobot,
  onUpgradeHub,
  onBuildHub,
  onSellHub,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'buy_robots' | 'upgrade_robots' | 'hubs'>('buy_robots');
  const [selectedRobotId, setSelectedRobotId] = useState<string>(state.robots[0]?.id || '');
  const [newHubName, setNewHubName] = useState<string>('');

  if (!isOpen) return null;

  const isZh = lang === 'zh';
  const cash = state.financials.balance;
  const currentCity = CITIES_DATA[state.currentCityId] || CITIES_DATA.singapore;
  const selectedRobot = state.robots.find(r => r.id === selectedRobotId) || state.robots[0];

  // Progressive Sector Candidates for building new hubs
  const sectorStatus = getCitySectorStatus(currentCity, state.hubs);
  const candidateNodes = sectorStatus.availableBuildNodes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] max-h-[90vh] flex flex-col overflow-hidden font-mono text-xs">
        {/* Header HUD */}
        <div className="px-6 py-4 border-b border-cyan-950/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 tracking-wider">
                  {isZh ? '车队与基建科技商店' : 'FLEET & INFRASTRUCTURE TECH SHOP'}
                </h2>
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800/40">
                  LEVEL 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isZh ? '购置新机型、改装升级车辆性能与拓建城市充电机位' : 'Purchase archetypes, tune vehicle mechanics, and expand hub infrastructure'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Current Balance Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-800/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 text-[10px]">{isZh ? '可用资金:' : 'Cash:'}</span>
              <span className="text-xs font-bold text-emerald-400">${cash.toFixed(2)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/30 px-6">
          <button
            onClick={() => setActiveTab('buy_robots')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'buy_robots'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isZh ? '购置新机型 (3款)' : 'Purchase Rovers (3)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('upgrade_robots')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'upgrade_robots'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isZh ? '改装现有车辆' : 'Tune Existing Fleet'}</span>
          </button>

          <button
            onClick={() => setActiveTab('hubs')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'hubs'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isZh ? '中心站点升级与新建' : 'Hub Infrastructure'}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: BUY NEW ROBOTS */}
          {activeTab === 'buy_robots' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. SPEEDY SCOUT */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                        {isZh ? '⚡ 极速冲刺型' : '⚡ SPEED SPRINT'}
                      </span>
                      <span className="text-sm font-black text-emerald-300">
                        ${ROBOT_SHOP_CONFIG.speedy.price}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm mb-1">
                      {isZh ? ROBOT_SHOP_CONFIG.speedy.nameZh : ROBOT_SHOP_CONFIG.speedy.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {isZh ? ROBOT_SHOP_CONFIG.speedy.descriptionZh : ROBOT_SHOP_CONFIG.speedy.descriptionEn}
                    </p>

                    <div className="space-y-1.5 text-[10px] border-t border-slate-800 pt-2 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '行驶航速:' : 'Road Speed:'}</span>
                        <span className="text-emerald-400 font-bold">1.4x (超快速)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '电池续航:' : 'Battery Range:'}</span>
                        <span className="text-amber-400 font-bold">70% (短程)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '快充倍率:' : 'Recharge Rate:'}</span>
                        <span className="text-emerald-400 font-bold">1.5x (极速回血)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '包裹载重:' : 'Parcel Capacity:'}</span>
                        <span className="text-slate-300 font-bold">1 单 (单件冲刺)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onBuyRobot('speedy')}
                    disabled={cash < ROBOT_SHOP_CONFIG.speedy.price}
                    className="w-full py-2 px-3 rounded-lg font-bold text-xs uppercase bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {cash < ROBOT_SHOP_CONFIG.speedy.price ? (isZh ? '资金不足' : 'Insufficient Cash') : (isZh ? '立即购入 (+$120)' : 'Deploy Scout ($120)')}
                  </button>
                </div>

                {/* 2. HEAVY HAULER */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/40 flex flex-col justify-between hover:border-amber-500/70 transition-all shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                        {isZh ? '🚚 一车双单·重载长途' : '🚚 MULTI-DROP HAULER'}
                      </span>
                      <span className="text-sm font-black text-amber-300">
                        ${ROBOT_SHOP_CONFIG.heavy.price}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm mb-1">
                      {isZh ? ROBOT_SHOP_CONFIG.heavy.nameZh : ROBOT_SHOP_CONFIG.heavy.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {isZh ? ROBOT_SHOP_CONFIG.heavy.descriptionZh : ROBOT_SHOP_CONFIG.heavy.descriptionEn}
                    </p>

                    <div className="space-y-1.5 text-[10px] border-t border-slate-800 pt-2 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '包裹载重:' : 'Order Capacity:'}</span>
                        <span className="text-amber-300 font-bold">2 笔订单 (一次出库送2单)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '电池续航:' : 'Battery Range:'}</span>
                        <span className="text-emerald-400 font-bold">160% (超大固态电池)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '行驶航速:' : 'Road Speed:'}</span>
                        <span className="text-slate-400 font-bold">0.8x (重载平稳)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '最大载重:' : 'Payload Limit:'}</span>
                        <span className="text-amber-400 font-bold">24.0 kg</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onBuyRobot('heavy')}
                    disabled={cash < ROBOT_SHOP_CONFIG.heavy.price}
                    className="w-full py-2 px-3 rounded-lg font-bold text-xs uppercase bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {cash < ROBOT_SHOP_CONFIG.heavy.price ? (isZh ? '资金不足' : 'Insufficient Cash') : (isZh ? '立即购入重载车 ($180)' : 'Deploy Hauler ($180)')}
                  </button>
                </div>

                {/* 3. STANDARD BALANCED */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-500/60 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold">
                        {isZh ? '🤖 全能主力型' : '🤖 BALANCED ALL-ROUNDER'}
                      </span>
                      <span className="text-sm font-black text-cyan-300">
                        ${ROBOT_SHOP_CONFIG.standard.price}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm mb-1">
                      {isZh ? ROBOT_SHOP_CONFIG.standard.nameZh : ROBOT_SHOP_CONFIG.standard.nameEn}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {isZh ? ROBOT_SHOP_CONFIG.standard.descriptionZh : ROBOT_SHOP_CONFIG.standard.descriptionEn}
                    </p>

                    <div className="space-y-1.5 text-[10px] border-t border-slate-800 pt-2 mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '行驶航速:' : 'Road Speed:'}</span>
                        <span className="text-cyan-300 font-bold">1.0x (标准)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '电池续航:' : 'Battery Range:'}</span>
                        <span className="text-cyan-300 font-bold">100% (标准)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '运维成本:' : 'Maintenance:'}</span>
                        <span className="text-slate-300 font-bold">经济实惠 ($0.15/t)</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{isZh ? '包裹载重:' : 'Capacity:'}</span>
                        <span className="text-slate-300 font-bold">1 单 (12kg)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onBuyRobot('standard')}
                    disabled={cash < ROBOT_SHOP_CONFIG.standard.price}
                    className="w-full py-2 px-3 rounded-lg font-bold text-xs uppercase bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {cash < ROBOT_SHOP_CONFIG.standard.price ? (isZh ? '资金不足' : 'Insufficient Cash') : (isZh ? '购入全能车 ($100)' : 'Deploy Rover ($100)')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPGRADE EXISTING ROBOTS */}
          {activeTab === 'upgrade_robots' && (
            <div className="space-y-4">
              {/* Select Robot to Tune */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-bold">{isZh ? '选择要改装的车辆:' : 'Select Target Robot:'}</span>
                <select
                  value={selectedRobot?.id}
                  onChange={(e) => setSelectedRobotId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-cyan-300 rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  {state.robots.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.archetype || 'standard'} &bull; {r.batteryPct.toFixed(0)}% bat)
                    </option>
                  ))}
                </select>
              </div>

              {selectedRobot && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Upgrade 1: Cargo Expansion */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          {isZh ? '货厢扩容升级' : 'Cargo Bay Expansion'}
                        </span>
                        <span className="font-bold text-slate-200">${UPGRADE_PRICES.CARGO_EXPANSION}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                        {isZh
                          ? '为底盘增加副载物箱，允许车辆同时携带额外 +1 笔订单执行连环派送。'
                          : 'Adds secondary cargo chassis, allowing rover to carry +1 additional order.'}
                      </p>
                      <div className="text-[10px] text-emerald-400 mb-4 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isZh ? '单次运力 +1 单，大幅降低空驶率' : 'Multi-drop enabled (+1 capacity)'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpgradeRobot(selectedRobot.id, 'cargoExpanded')}
                      disabled={cash < UPGRADE_PRICES.CARGO_EXPANSION || Boolean(selectedRobot.upgrades?.cargoExpanded)}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs uppercase transition-all ${
                        selectedRobot.upgrades?.cargoExpanded
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.3)] disabled:opacity-40'
                      }`}
                    >
                      {selectedRobot.upgrades?.cargoExpanded ? (isZh ? '已安装此模组' : 'Already Installed') : (isZh ? '安装货厢 ($60)' : 'Install Cargo ($60)')}
                    </button>
                  </div>

                  {/* Upgrade 2: Solid-State Battery */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                          <BatteryCharging className="w-4 h-4" />
                          {isZh ? '固态电池模组' : 'Solid-State Battery'}
                        </span>
                        <span className="font-bold text-slate-200">${UPGRADE_PRICES.SOLID_STATE_BATTERY}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                        {isZh
                          ? '替换为高密度固态锂电，行驶能耗降低 30%，雨雪恶劣天气抗衰减强。'
                          : 'Replaces cells with solid-state pack. Lowers travel drain by 30%.'}
                      </p>
                      <div className="text-[10px] text-cyan-300 mb-4 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isZh ? '能耗 -30%，台风暴雨电量抗性增强' : 'Drain -30%, weather resilient'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpgradeRobot(selectedRobot.id, 'solidStateBattery')}
                      disabled={cash < UPGRADE_PRICES.SOLID_STATE_BATTERY || Boolean(selectedRobot.upgrades?.solidStateBattery)}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs uppercase transition-all ${
                        selectedRobot.upgrades?.solidStateBattery
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-40'
                      }`}
                    >
                      {selectedRobot.upgrades?.solidStateBattery ? (isZh ? '已升级固态锂电' : 'Already Installed') : (isZh ? '加装固态电池 ($50)' : 'Install Battery ($50)')}
                    </button>
                  </div>

                  {/* Upgrade 3: Turbo Motors */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <Zap className="w-4 h-4" />
                          {isZh ? '高扭矩涡轮电机' : 'Turbo Thrusters'}
                        </span>
                        <span className="font-bold text-slate-200">${UPGRADE_PRICES.TURBO_MOTORS}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                        {isZh
                          ? '提升轮毂电机峰值扭矩，全路段行驶航速提升 +25%，紧急单履约神器。'
                          : 'Boosts hub torque, increasing road travel velocity by +25%.'}
                      </p>
                      <div className="text-[10px] text-emerald-300 mb-4 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isZh ? '路面航速 +25%，大幅缩短SLA用时' : 'Road speed +25% for tight SLAs'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onUpgradeRobot(selectedRobot.id, 'turboMotors')}
                      disabled={cash < UPGRADE_PRICES.TURBO_MOTORS || Boolean(selectedRobot.upgrades?.turboMotors)}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs uppercase transition-all ${
                        selectedRobot.upgrades?.turboMotors
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-40'
                      }`}
                    >
                      {selectedRobot.upgrades?.turboMotors ? (isZh ? '已安装涡轮电机' : 'Already Installed') : (isZh ? '升级电机 ($40)' : 'Install Motors ($40)')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HUBS INFRASTRUCTURE */}
          {activeTab === 'hubs' && (
            <div className="space-y-5">
              {/* Active Hubs Grid */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>{isZh ? '当前运营中的中心充电站点' : 'Active Logistics Hubs'}</span>
                  <span className="text-cyan-400">{state.hubs.length} {isZh ? '个机位站点' : 'Hubs Operational'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {state.hubs.map(hub => {
                    const currentLvl = hub.level || 1;
                    const isMaxLvl = currentLvl >= 3;
                    const nextLvl = currentLvl === 1 ? 2 : 3;
                    const upgradeCost = nextLvl === 2 ? UPGRADE_PRICES.HUB_LEVEL_2 : UPGRADE_PRICES.HUB_LEVEL_3;

                    return (
                      <div key={hub.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-100 flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-cyan-400" />
                              {hub.name}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800/40">
                              LEVEL {currentLvl}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 space-y-1 mb-3">
                            <div className="flex justify-between">
                              <span>{isZh ? '充电机位容量:' : 'Charging Bays:'}</span>
                              <span className="text-cyan-300 font-bold">{hub.chargingBays || 2} {isZh ? '台同时' : 'Concurrent'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isZh ? '回充速率:' : 'Charging Speed:'}</span>
                              <span className="text-emerald-400 font-bold">
                                +{hub.chargingRatePerTick || (currentLvl === 3 ? 14 : (currentLvl === 2 ? 9 : 6))}% / tick
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                          {!isMaxLvl ? (
                            <button
                              onClick={() => onUpgradeHub(hub.id, nextLvl as 2 | 3)}
                              disabled={cash < upgradeCost}
                              className="flex-1 py-1.5 px-3 rounded-lg font-bold text-[11px] bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)] disabled:opacity-40 transition-all"
                            >
                              {isZh ? `升级至 Lv.${nextLvl} ($${upgradeCost})` : `Upgrade Lv.${nextLvl} ($${upgradeCost})`}
                            </button>
                          ) : (
                            <div className="flex-1 text-center py-1 text-[10px] text-amber-400 font-bold bg-amber-950/40 border border-amber-800/30 rounded-lg">
                              ⚡ {isZh ? '超级快充旗舰顶配' : 'MAX LEVEL SUPERCHARGER'}
                            </div>
                          )}

                          {state.hubs.length > 1 && (
                            <button
                              onClick={() => onSellHub(hub.id)}
                              title={isZh ? '变卖此站点回收资金 (+$100)' : 'Decommission Hub (+$100)'}
                              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Build New Hub Section */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <PlusCircle className="w-4 h-4 text-purple-400" />
                    <span>{isZh ? '投资新建中心充电子站点' : 'Construct New Logistics Hub ($200)'}</span>
                  </div>
                  <span className="text-purple-300 font-bold">${UPGRADE_PRICES.NEW_HUB_CONSTRUCTION}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isZh
                    ? `当前开放：${sectorStatus.currentSectorNameZh}（本区进度 ${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal} 座）。建满当前区域全部站点后，将自动解锁下一扩张区域！`
                    : `Active: ${sectorStatus.currentSectorNameEn} (${sectorStatus.currentSectorBuilt}/${sectorStatus.currentSectorTotal} built). Complete all hubs in the current sector to unlock the next district!`}
                </p>

                {candidateNodes.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={newHubName}
                      onChange={(e) => setNewHubName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">{isZh ? '-- 选择当前已解锁区域的建站节点 --' : '-- Select Unlocked Sector Node --'}</option>
                      {candidateNodes.map(node => (
                        <option key={node.id} value={node.id}>
                          [{isZh ? `第${node.sector || 1}区` : `Sector ${node.sector || 1}`}] {isZh ? node.nameZh : node.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const targetNode = candidateNodes.find(n => n.id === newHubName);
                        if (targetNode) {
                          onBuildHub(isZh ? `${targetNode.nameZh}分部` : `${targetNode.name} Depot`, targetNode.lat, targetNode.lng);
                          setNewHubName('');
                        }
                      }}
                      disabled={!newHubName || cash < UPGRADE_PRICES.NEW_HUB_CONSTRUCTION}
                      className="py-2 px-4 rounded-lg font-bold text-xs uppercase bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {isZh ? '确认建站 ($200)' : 'Build Hub ($200)'}
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-400">
                    {isZh ? '全城所有核心节点均已覆盖运营站点！' : 'All major city corridors are already covered with hubs!'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isZh ? '所有升级立即生效并同步至智能体调度决策引擎' : 'All upgrades instantly sync with agent dispatch engine'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            {isZh ? '关闭商店' : 'Close Shop'}
          </button>
        </div>
      </div>
    </div>
  );
};
