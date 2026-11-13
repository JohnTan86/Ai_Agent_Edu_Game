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

export default function SushiApp() {
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
    hireStaff,
    fireStaff,
    startNextDay
  } = useSushiSimulation();

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

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
      />

      {/* 2. Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Column: Multi-Agent Workspace (Prompt, Tools, Parameters) */}
        <MultiAgentWorkspace
          agents={agents}
          selectedRole={state.selectedAgentRole}
          onSelectRole={selectAgent}
          onUpdateAgentConfig={updateAgentConfig}
          onRunManualTurn={runManualAgentTurn}
          isExecuting={isAgentExecuting}
          unlockedAgents={currentScenario.unlockedAgents}
        />

        {/* Center Column: Interactive 2D Sushi Restaurant Simulation */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950/80 relative h-full">
          <SushiRestaurantView
            state={state}
            onAddTable={addTable}
            onReset={() => reset()}
            onOpenStaffModal={() => setIsStaffModalOpen(true)}
          />
        </div>

        {/* Right Column: Multi-Agent Telemetry, Comms Stream, Thought Trace */}
        <MultiAgentTelemetry
          financials={state.financials}
          metrics={state.metrics}
          messages={state.agentMessages}
          thoughtSteps={state.thoughtSteps}
          activeTickets={state.activeTickets}
          completedTickets={state.completedTickets}
          selectedRole={state.selectedAgentRole}
          tick={state.tick}
        />
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
      />
    </div>
  );
}
