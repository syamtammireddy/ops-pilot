import React, { useState } from 'react';
import { Play, Sparkles, AlertOctagon, ShieldAlert, CopyCheck, ArrowRight } from 'lucide-react';

interface TaskLauncherProps {
  onLaunchTask: (goal: string) => void;
  isRunning: boolean;
  onSelectScenario: (scenarioType: 'standard' | 'failure' | 'approval' | 'duplicate') => void;
}

export const TaskLauncher: React.FC<TaskLauncherProps> = ({
  onLaunchTask,
  isRunning,
  onSelectScenario
}) => {
  const [goal, setGoal] = useState<string>(
    "Process the latest unpaid vendor invoice. Verify that it isn't already recorded, follow company payment policy, and complete payment if authorized."
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim() && !isRunning) {
      onLaunchTask(goal.trim());
    }
  };

  const handleScenarioClick = (type: 'standard' | 'failure' | 'approval' | 'duplicate') => {
    if (type === 'standard') {
      setGoal("Process the latest unpaid vendor invoice. Verify that it isn't already recorded, follow company payment policy, and complete payment if authorized.");
    } else if (type === 'failure') {
      setGoal("Process the latest unpaid vendor invoice. Verify that it isn't already recorded, follow company payment policy, and complete payment if authorized.");
    } else if (type === 'approval') {
      setGoal("Process the Snowflake enterprise data platform annual license invoice for $12,500.00 and execute payment.");
    } else if (type === 'duplicate') {
      setGoal("Process the incoming invoice from Apex Logistics (INV-2024-002) and record it in finance.");
    }
    onSelectScenario(type);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--accent-blue)" />
          Task Objective
        </h2>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Natural Language Goal</span>
      </div>

      {/* Goal Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={isRunning}
          rows={3}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '10px 12px',
            color: 'var(--text-main)',
            fontSize: '13px',
            lineHeight: '1.4',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          placeholder="Describe the operational goal for the AI employee..."
        />

        <button
          type="submit"
          disabled={isRunning || !goal.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: isRunning ? 'var(--border-color)' : 'var(--accent-blue)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <Play size={15} fill="#fff" />
          <span>{isRunning ? 'Worker Executing...' : 'Run Autonomous Worker'}</span>
        </button>
      </form>

      {/* Preset Demo Scenarios */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
          Demonstration Scenarios
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Scenario 1: Standard Payment */}
          <button
            onClick={() => handleScenarioClick('standard')}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="var(--accent-green)" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  1. Standard Autonomous Invoice
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Acme Cloud ($4,200) &bull; Auto-allowed &bull; Verified
                </div>
              </div>
            </div>
            <ArrowRight size={13} color="var(--text-dim)" />
          </button>

          {/* Scenario 2: Failure Recovery */}
          <button
            onClick={() => handleScenarioClick('failure')}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={14} color="var(--accent-amber)" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  2. Failure Injection & Recovery
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  503 Gateway Timeout &bull; Observe &bull; Auto-retry
                </div>
              </div>
            </div>
            <ArrowRight size={13} color="var(--text-dim)" />
          </button>

          {/* Scenario 3: Human Approval Gate */}
          <button
            onClick={() => handleScenarioClick('approval')}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={14} color="#f43f5e" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  3. High-Value Approval Gate
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Snowflake ($12,500) &bull; &gt;$5k &bull; Human Sign-off
                </div>
              </div>
            </div>
            <ArrowRight size={13} color="var(--text-dim)" />
          </button>

          {/* Scenario 4: Duplicate Fraud Prevention */}
          <button
            onClick={() => handleScenarioClick('duplicate')}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CopyCheck size={14} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                  4. Duplicate Prevention
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Apex Logistics (INV-002) &bull; Already Paid &bull; Abort
                </div>
              </div>
            </div>
            <ArrowRight size={13} color="var(--text-dim)" />
          </button>
        </div>
      </div>
    </div>
  );
};
