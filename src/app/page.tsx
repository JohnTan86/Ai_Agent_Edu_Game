'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSimulation } from '../hooks/useSimulation';
import { HeaderHUD } from '../components/layout/HeaderHUD';
import { HelpGuideModal } from '../components/layout/HelpGuideModal';
import { PerformanceReportModal } from '../components/layout/PerformanceReportModal';
import { LevelUpModal } from '../components/layout/LevelUpModal';
import { FleetHubShopModal } from '../components/shop/FleetHubShopModal';
import { AgentWorkspace } from '../components/workspace/AgentWorkspace';
import { PlaybackControls } from '../components/simulation/PlaybackControls';
import { TelemetryPanel } from '../components/telemetry/TelemetryPanel';
import { CITIES_DATA } from '../lib/cityData';
import { haversineDistance } from '../lib/pathfinding';

// Dynamically import Leaflet Real Life Map to avoid SSR window errors
const RealLifeCityMap = dynamic(
  () => import('../components/simulation/RealLifeCityMap').then(mod => mod.RealLifeCityMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-cyan-400 font-mono gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <span className="text-xs tracking-wider">LOADING REAL-WORLD CITY SATELLITE & ROAD MAP...</span>
      </div>
    )
  }
);

export default function RoboFlowApp() {
  const {
    state,
    agentConfig,
    setAgentConfig,
    isAgentExecuting,
    lang,
    toggleLang,
    isReportOpen,
    openReport,
    closeReport,
    togglePlay,
    setSpeed,
    stepForward,
    reset,
    selectScenario,
    runDispatchCycle,
    spawnTestOrder,
    toggleTrafficHeatmap,
    selectRobot,
    selectOrder,
    toggleTool,
    switchCity,
    setWeather,
    toggleRushHour,
    toggleRoadClosure,
    closeLevelUpModal,
    advanceToLevel2,
    advanceToLevel3,
    continueEndlessMode,
    isShopOpen,
    openShop,
    closeShop,
    buyRobot,
    upgradeRobot,
    upgradeHub,
    buildHub,
    sellHub
  } = useSimulation();

  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('roboflow_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (theme === 'light') {
      htmlEl.classList.add('light-theme');
      htmlEl.classList.remove('dark');
    } else {
      htmlEl.classList.remove('light-theme');
      htmlEl.classList.add('dark');
    }
    localStorage.setItem('roboflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Spacebar toggles Play/Pause (if not typing in textarea or input)
      if (
        e.code === 'Space' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA' &&
        (e.target as HTMLElement).tagName !== 'INPUT'
      ) {
        e.preventDefault();
        togglePlay();
      }
      // Ctrl+Enter or Cmd+Enter runs dispatch cycle
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runDispatchCycle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, runDispatchCycle]);

  // Compute live City Hub Coverage % across current city road network
  const cityCoveragePct = useMemo(() => {
    const city = CITIES_DATA[state.currentCityId];
    if (!city || !city.roadNodes || city.roadNodes.length === 0) return 0;
    let covered = 0;
    for (const node of city.roadNodes) {
      const isCovered = state.hubs.some(hub => {
        if (hub.position.lat && hub.position.lng) {
          return haversineDistance(hub.position.lat, hub.position.lng, node.lat, node.lng) <= 2200;
        }
        return false;
      });
      if (isCovered) covered++;
    }
    return Math.min(100, Math.round((covered / city.roadNodes.length) * 100));
  }, [state.currentCityId, state.hubs]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top HUD Header */}
      <HeaderHUD
        currentScenario={state.scenario}
        onSelectScenario={selectScenario}
        status={state.status}
        tick={state.tick}
        levelProgression={state.levelProgression}
        balance={state.financials.balance}
        cityCoveragePct={cityCoveragePct}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenReport={openReport}
        onOpenShop={openShop}
        onSpawnOrder={spawnTestOrder}
        showHeatmap={state.showTrafficHeatmap}
        onToggleHeatmap={toggleTrafficHeatmap}
        lang={lang}
        onToggleLang={toggleLang}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 2. Main 3-Column Single-Screen Dashboard */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Agent Workspace */}
        <AgentWorkspace
          config={agentConfig}
          onChangeConfig={setAgentConfig}
          onToggleTool={toggleTool}
          onRunDispatch={runDispatchCycle}
          isExecuting={isAgentExecuting}
          activeOrdersCount={state.metrics.pendingCount}
          lang={lang}
        />

        {/* Center Column: Live Real-Life City Map Simulation & Playback Controls */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/80 relative h-full">
          <div className="flex-1 relative overflow-hidden min-h-0 w-full h-full">
            <RealLifeCityMap
              state={state}
              onSelectRobot={selectRobot}
              onSelectOrder={selectOrder}
              onSwitchCity={switchCity}
              onSetWeather={setWeather}
              onToggleRushHour={toggleRushHour}
              onToggleRoadClosure={toggleRoadClosure}
              onBuildHub={buildHub}
              onUpgradeHub={upgradeHub}
              onSellHub={sellHub}
              lang={lang}
              theme={theme}
            />
          </div>

          {/* Bottom Center Playback Controls */}
          <PlaybackControls
            state={state}
            onTogglePlay={togglePlay}
            onSetSpeed={setSpeed}
            onStepForward={stepForward}
            onReset={() => reset()}
            lang={lang}
          />
        </div>

        {/* Right Column: Telemetry & Metrics & Thought Inspector */}
        <TelemetryPanel
          financials={state.financials}
          metrics={state.metrics}
          thoughtLogs={state.thoughtLogs}
          activeActions={state.activeActions}
          orders={state.orders}
          robots={state.robots}
          selectedRobotId={state.selectedRobotId}
          selectedOrderId={state.selectedOrderId}
          onClearSelection={() => {
            selectRobot(undefined);
            selectOrder(undefined);
          }}
          onSelectRobot={selectRobot}
          onSelectOrder={selectOrder}
          tick={state.tick}
          lang={lang}
        />
      </div>

      {/* 3. Educational Architect Briefing & Guide Modal */}
      <HelpGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        lang={lang}
      />

      {/* 4. Architect Performance Evaluation Report Modal */}
      <PerformanceReportModal
        state={state}
        isOpen={isReportOpen}
        onClose={closeReport}
        onRetry={() => reset()}
        onSelectScenario={selectScenario}
        onContinueEndless={continueEndlessMode}
        lang={lang}
      />

      {/* 5. Level 1 & Level 2 Progression Modals */}
      <LevelUpModal
        state={state}
        isOpen={Boolean(state.levelProgression?.isLevelUpModalOpen)}
        onProceedToLevel2={advanceToLevel2}
        onProceedToLevel3={advanceToLevel3}
        onClose={closeLevelUpModal}
        lang={lang}
      />

      {/* 6. Level 2 Fleet & Hub Upgrade Shop Modal */}
      <FleetHubShopModal
        state={state}
        isOpen={isShopOpen}
        onClose={closeShop}
        onBuyRobot={buyRobot}
        onUpgradeRobot={upgradeRobot}
        onUpgradeHub={upgradeHub}
        onBuildHub={buildHub}
        onSellHub={sellHub}
        lang={lang}
      />
    </div>
  );
}
