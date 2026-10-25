import React from 'react';
import { Bot, RotateCcw, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';
import { EnvironmentInfo } from '../types';

interface HeaderProps {
  envInfo: EnvironmentInfo | null;
  onReset: () => void;
  onToggleFailure: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  envInfo,
  onReset,
  onToggleFailure,
  isResetting
}) => {
  const failureMode = envInfo?.environment.failureModeEnabled ?? false;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-secondary)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Brand & Mission */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Bot size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              OpsPilot
            </h1>
            <span className="badge badge-blue">Autonomous AI Worker</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            CentrAlign Evaluation: Goal &rarr; Understand &rarr; Plan &rarr; Execute &rarr; Observe &rarr; Adapt &rarr; Verify &rarr; Complete
          </p>
        </div>
      </div>

      {/* Environment Controls & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Active Model Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <Cpu size={14} color="var(--accent-blue)" />
          <span>Model: <strong style={{ color: 'var(--text-main)' }}>{envInfo?.llmModel || 'Loading...'}</strong></span>
        </div>

        {/* Company Sandbox Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} color="var(--accent-green)" />
          <span>Sandbox: <strong style={{ color: 'var(--text-main)' }}>Acme Global Enterprise</strong></span>
        </div>

        {/* Failure Mode Toggle */}
        <button
          onClick={onToggleFailure}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: failureMode ? 'var(--accent-amber-bg)' : 'var(--bg-primary)',
            color: failureMode ? 'var(--accent-amber)' : 'var(--text-muted)',
            border: `1px solid ${failureMode ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Toggle transient 503 bank gateway timeout to test agent adaptation and recovery"
        >
          <AlertTriangle size={14} />
          <span>Failure Mode: {failureMode ? 'INJECTED (503)' : 'OFF'}</span>
        </button>

        {/* Reset Environment */}
        <button
          onClick={onReset}
          disabled={isResetting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isResetting ? 'not-allowed' : 'pointer'
          }}
          title="Reset document vault, ERP ledger, and notifications to initial state"
        >
          <RotateCcw size={14} className={isResetting ? 'pulse' : ''} />
          <span>{isResetting ? 'Resetting...' : 'Reset Sandbox'}</span>
        </button>
      </div>
    </header>
  );
};
