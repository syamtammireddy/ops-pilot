import React, { useEffect, useRef, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Shield, 
  Terminal, 
  Layers
} from 'lucide-react';
import { Task, ExecutionStep } from '../types';

interface ExecutionTraceProps {
  task: Task | null;
  isRunning: boolean;
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({ task, isRunning }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [task?.steps.length, task?.status]);

  const toggleExpand = (stepNumber: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'UNDERSTANDING':
        return <span className="badge badge-blue">Understanding Goal</span>;
      case 'EXECUTING':
        return <span className="badge badge-blue pulse">Executing Loop</span>;
      case 'WAITING_FOR_APPROVAL':
        return <span className="badge badge-approval pulse">Awaiting Approval</span>;
      case 'VERIFYING':
        return <span className="badge badge-approval pulse">Verifying State</span>;
      case 'COMPLETED':
        return <span className="badge badge-success">Completed & Verified</span>;
      case 'FAILED':
        return <span className="badge badge-failed">Failed / Escalated</span>;
      default:
        return <span className="badge badge-blue">Idle</span>;
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '600px'
    }}>
      {/* Trace Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={17} color="var(--accent-blue)" />
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>Autonomous Execution Trace</h2>
          {task && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ({task.steps.length} {task.steps.length === 1 ? 'step' : 'steps'})
            </span>
          )}
        </div>
        <div>
          {getStatusBadge(task?.status)}
        </div>
      </div>

      {/* Trace Body */}
      <div 
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {!task || task.steps.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '300px',
            color: 'var(--text-dim)',
            textAlign: 'center',
            gap: '12px'
          }}>
            <Terminal size={36} strokeWidth={1.5} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
                No Active Execution Trace
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Select a scenario or enter an operational goal on the left to launch the AI employee.
              </div>
            </div>
          </div>
        ) : (
          task.steps.map((step: ExecutionStep) => {
            const isExpanded = expandedSteps[step.stepNumber] ?? true;

            return (
              <div
                key={step.stepNumber}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: `1px solid ${
                    step.status === 'FAILED' 
                      ? 'rgba(239, 68, 68, 0.4)' 
                      : step.status === 'PENDING_APPROVAL' 
                      ? 'rgba(245, 158, 11, 0.4)' 
                      : 'var(--border-color)'
                  }`,
                  borderRadius: '6px',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s'
                }}
              >
                {/* Step Top Bar */}
                <div 
                  onClick={() => toggleExpand(step.stepNumber)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-muted)'
                    }}>
                      {step.stepNumber}
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--accent-blue)'
                    }}>
                      {step.tool}
                    </span>

                    {/* Policy Badge */}
                    <span className={`badge ${
                      step.policyDecision === 'ALLOW' ? 'badge-allow' :
                      step.policyDecision === 'REQUIRE_APPROVAL' ? 'badge-approval' : 'badge-deny'
                    }`}>
                      <Shield size={10} />
                      {step.policyDecision}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {step.status === 'SUCCESS' && (
                      <span className="badge badge-success">
                        <CheckCircle2 size={11} /> SUCCESS
                      </span>
                    )}
                    {step.status === 'FAILED' && (
                      <span className="badge badge-failed">
                        <XCircle size={11} /> FAILED
                      </span>
                    )}
                    {step.status === 'PENDING_APPROVAL' && (
                      <span className="badge badge-approval">
                        <Clock size={11} /> AWAITING APPROVAL
                      </span>
                    )}

                    <div style={{ color: 'var(--text-dim)' }}>
                      {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                {isExpanded && (
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Concise Decision Summary */}
                    <div style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      borderLeft: '3px solid var(--accent-blue)',
                      padding: '8px 12px',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '2px' }}>
                        Agent Decision
                      </div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        {step.decisionSummary}
                      </div>
                    </div>

                    {/* Action Arguments */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Arguments
                      </div>
                      <pre style={{
                        backgroundColor: 'var(--bg-secondary)',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#cbd5e1',
                        overflowX: 'auto',
                        border: '1px solid var(--border-color)'
                      }}>
                        {JSON.stringify(step.arguments, null, 2)}
                      </pre>
                    </div>

                    {/* Observation / Environment Feedback */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Observation from Sandbox
                      </div>
                      <pre style={{
                        backgroundColor: step.status === 'FAILED' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: step.status === 'FAILED' ? '#fca5a5' : '#a7f3d0',
                        overflowX: 'auto',
                        border: `1px solid ${step.status === 'FAILED' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)'}`
                      }}>
                        {JSON.stringify(step.observation, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Processing Indicator */}
        {isRunning && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px dashed var(--accent-blue)',
            color: 'var(--accent-blue)',
            fontSize: '12px'
          }}>
            <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
            <span>AI worker observing environment and planning next action...</span>
          </div>
        )}
      </div>
    </div>
  );
};
