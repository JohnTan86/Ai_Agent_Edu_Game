'use client';

import React, { useState, useEffect } from 'react';
import { useSushiSimulation } from '../../hooks/sushi/useSushiSimulation';
import { SushiHeaderHUD } from '../../components/sushi/SushiHeaderHUD';
import { SushiRestaurantView } from '../../components/sushi/SushiRestaurantView';
import { MultiAgentWorkspace } from '../../components/sushi/MultiAgentWorkspace';
import { MultiAgentTelemetry } from '../../components/sushi/MultiAgentTelemetry';
import { SushiHelpGuideModal } from '../../components/sushi/SushiHelpGuideModal';
import { SushiReportModal } from '../../components/sushi/SushiReportModal';
import { SushiStaffModal } from '../../components/sushi/SushiStaffModal';
import { SushiBranchMapModal } from '../../components/sushi/SushiBranchMapModal';
import { SushiI18nProvider, useSushiI18n } from '../../lib/sushi/i18n';

function SushiAppContent() {
  const { language, t } = useSushiI18n();
  const isEn = language === 'en';
  const {
    state,
    agents,
    currentScenario,
    isReportOpen,
    isHelpOpen,
    isAgentExecuting,
    setIsReportOpen,
    setIsHelpOpen,
    togglePlay,
    setSpeed,
    stepForward,
    reset,
    selectScenario,
    spawnCustomerManually,
    toggleRushHour,
    toggleSound,
    updateAgentConfig,
    selectAgent,
    runManualAgentTurn,
    addTable,
    openNewBranch,
    selectBranch,
    hireStaff,
    fireStaff,
    startNextDay
  } = useSushiSimulation();

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isBranchMapModalOpen, setIsBranchMapModalOpen] = useState(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

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
      // Ctrl+Enter or Cmd+Enter runs manual agent turn
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runManualAgentTurn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, runManualAgentTurn]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top HUD Header */}
      <SushiHeaderHUD
        state={state}
        currentScenario={currentScenario}
        onSelectScenario={selectScenario}
        onTogglePlay={togglePlay}
        onSetSpeed={setSpeed}
        onStepForward={stepForward}
        onReset={() => reset()}
        onSpawnCustomer={spawnCustomerManually}
        onToggleRushHour={toggleRushHour}
        onToggleSound={toggleSound}
        onOpenGuide={() => setIsHelpOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onAddTable={addTable}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onStartNextDay={startNextDay}
        onOpenBranchMapModal={() => setIsBranchMapModalOpen(true)}
        onSelectBranch={selectBranch}
      />

      {/* 2. Main 3-Column Layout with Collapsible Sidebars */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Multi-Agent Workspace (Prompt, Tools, Parameters) */}
        {isLeftCollapsed ? (
          <div
            onClick={() => setIsLeftCollapsed(false)}
            className="w-9 bg-slate-900 hover:bg-slate-800 border-r border-slate-800 flex flex-col items-center py-3 gap-3 cursor-pointer transition select-none shrink-0 text-slate-400 hover:text-amber-300"
            title={t('expandLeft')}
          >
            <span className="text-base">🤖</span>
            <span className="[writing-mode:vertical-lr] text-[11px] font-bold tracking-widest uppercase">
              {isEn ? 'Prompt & Tools' : 'Agent 設定'}
            </span>
            <span className="text-xs">▶</span>
          </div>
        ) : (
          <MultiAgentWorkspace
            agents={agents}
            selectedRole={state.selectedAgentRole}
            onSelectRole={selectAgent}
            onUpdateAgentConfig={updateAgentConfig}
            onRunManualTurn={runManualAgentTurn}
            isExecuting={isAgentExecuting}
            unlockedAgents={currentScenario.unlockedAgents}
            onToggleCollapse={() => setIsLeftCollapsed(true)}
          />
        )}

        {/* Center Column: Interactive 2D Sushi Restaurant Simulation */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/80 relative h-full">
          <SushiRestaurantView
            state={state}
            onAddTable={addTable}
            onReset={() => reset()}
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
            onOpenBranchMapModal={() => setIsBranchMapModalOpen(true)}
            onSelectBranch={selectBranch}
          />
        </div>

        {/* Right Column: Multi-Agent Telemetry, Comms Stream, Thought Trace */}
        {isRightCollapsed ? (
          <div
            onClick={() => setIsRightCollapsed(false)}
            className="w-9 bg-slate-900 hover:bg-slate-800 border-l border-slate-800 flex flex-col items-center py-3 gap-3 cursor-pointer transition select-none shrink-0 text-slate-400 hover:text-sky-300"
            title={t('expandRight')}
          >
            <span className="text-base">📊</span>
            <span className="[writing-mode:vertical-lr] text-[11px] font-bold tracking-widest uppercase">
              {isEn ? 'Telemetry & Comms' : '通訊與審計'}
            </span>
            <span className="text-xs">◀</span>
          </div>
        ) : (
          <MultiAgentTelemetry
            financials={state.financials}
            metrics={state.metrics}
            messages={state.agentMessages}
            thoughtSteps={state.thoughtSteps}
            activeTickets={state.activeTickets}
            completedTickets={state.completedTickets}
            selectedRole={state.selectedAgentRole}
            tick={state.tick}
            onToggleCollapse={() => setIsRightCollapsed(true)}
          />
        )}
      </div>

      {/* 3. Help & Student Guide Modal */}
      <SushiHelpGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* 4. Scenario Evaluation Report Modal */}
      <SushiReportModal
        state={state}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onRetry={() => reset()}
        onSelectScenario={selectScenario}
        onStartNextDay={startNextDay}
      />

      {/* 5. Staff Recruitment & Payroll Modal */}
      <SushiStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        hiredStaff={state.hiredStaff || []}
        onHireStaff={hireStaff}
        onFireStaff={fireStaff}
        financials={state.financials}
        currentBranchName={state.branches?.find(b => b.id === state.activeBranchId)?.name}
      />

      {/* 6. Google Map Branch Expansion & Multi-Branch Management Modal */}
      <SushiBranchMapModal
        isOpen={isBranchMapModalOpen}
        onClose={() => setIsBranchMapModalOpen(false)}
        branches={state.branches || []}
        activeBranchId={state.activeBranchId}
        hasReachedMaxTables={state.hasReachedMaxTables || state.tables.length >= 16}
        financials={state.financials}
        onSelectBranch={selectBranch}
        onOpenNewBranch={openNewBranch}
      />
    </div>
  );
}

export default function SushiApp() {
  return (
    <SushiI18nProvider>
      <SushiAppContent />
    </SushiI18nProvider>
  );
}
