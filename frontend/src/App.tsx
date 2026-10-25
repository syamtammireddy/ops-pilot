import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TaskLauncher } from './components/TaskLauncher';
import { ExecutionTrace } from './components/ExecutionTrace';
import { ApprovalModal } from './components/ApprovalModal';
import { EvidenceDossier } from './components/EvidenceDossier';
import { CompanyStatePanel } from './components/CompanyStatePanel';
import { 
  Task, 
  EnvironmentInfo 
} from './types';
import { 
  createTask, 
  approveTask, 
  rejectTask, 
  getEnvironment, 
  resetEnvironment, 
  toggleFailureMode, 
  subscribeToTaskEvents 
} from './services/api';

export const App: React.FC = () => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const fetchEnv = useCallback(async () => {
    try {
      const data = await getEnvironment();
      setEnvInfo(data);
    } catch (err) {
      console.warn("Could not fetch environment info:", err);
    }
  }, []);

  useEffect(() => {
    fetchEnv();
    const interval = setInterval(fetchEnv, 3000);
    return () => clearInterval(interval);
  }, [fetchEnv]);

  // Subscribe to SSE updates when activeTask changes
  useEffect(() => {
    if (!activeTask?.id) return;

    const unsubscribe = subscribeToTaskEvents(activeTask.id, (payload) => {
      if (payload.type === 'SNAPSHOT') {
        setActiveTask(payload.task);
        if (payload.task.status === 'COMPLETED' || payload.task.status === 'FAILED') {
          setIsRunning(false);
          fetchEnv();
        } else if (payload.task.status === 'WAITING_FOR_APPROVAL') {
          setIsRunning(false);
          fetchEnv();
        } else {
          setIsRunning(true);
        }
      } else if (payload.type === 'STEP_ADDED') {
        setActiveTask(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            steps: [...prev.steps, payload.step]
          };
        });
        fetchEnv();
      } else if (payload.type === 'STATUS_CHANGED') {
        setActiveTask(prev => prev ? { ...prev, status: payload.status, error: payload.error } : prev);
        if (payload.status === 'COMPLETED' || payload.status === 'FAILED' || payload.status === 'WAITING_FOR_APPROVAL') {
          setIsRunning(false);
        }
        fetchEnv();
      } else if (payload.type === 'APPROVAL_REQUESTED') {
        setActiveTask(prev => prev ? { ...prev, pendingApproval: payload.approval, status: 'WAITING_FOR_APPROVAL' } : prev);
        setIsRunning(false);
        fetchEnv();
      } else if (payload.type === 'APPROVAL_RESOLVED') {
        setActiveTask(prev => prev ? { ...prev, pendingApproval: undefined } : prev);
        fetchEnv();
      } else if (payload.type === 'TASK_COMPLETED') {
        setActiveTask(prev => prev ? { ...prev, evidence: payload.evidence, status: payload.status } : prev);
        setIsRunning(false);
        fetchEnv();
      }
    });

    return () => unsubscribe();
  }, [activeTask?.id, fetchEnv]);

  const handleLaunchTask = async (goal: string) => {
    try {
      setIsRunning(true);
      const task = await createTask(goal);
      setActiveTask(task);
      fetchEnv();
    } catch (err: any) {
      alert(`Failed to launch task: ${err.message}`);
      setIsRunning(false);
    }
  };

  const handleSelectScenario = async (type: 'standard' | 'failure' | 'approval' | 'duplicate') => {
    if (type === 'failure') {
      // Ensure failure injection is enabled for failure scenario
      if (!envInfo?.environment.failureModeEnabled) {
        await toggleFailureMode(true);
        fetchEnv();
      }
    } else {
      // Disable failure injection for standard / approval / duplicate scenarios
      if (envInfo?.environment.failureModeEnabled) {
        await toggleFailureMode(false);
        fetchEnv();
      }
    }
  };

  const handleApprove = async () => {
    if (!activeTask?.id) return;
    try {
      setIsRunning(true);
      await approveTask(activeTask.id);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
      setIsRunning(false);
    }
  };

  const handleReject = async (reason?: string) => {
    if (!activeTask?.id) return;
    try {
      setIsRunning(true);
      await rejectTask(activeTask.id, reason);
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
      setIsRunning(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetEnvironment();
      setActiveTask(null);
      setIsRunning(false);
      await fetchEnv();
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleFailure = async () => {
    try {
      const res = await toggleFailureMode();
      setEnvInfo(prev => prev ? {
        ...prev,
        environment: {
          ...prev.environment,
          failureModeEnabled: res.failureModeEnabled
        }
      } : prev);
    } catch (err: any) {
      alert(`Toggle failure mode error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <Header 
        envInfo={envInfo}
        onReset={handleReset}
        onToggleFailure={handleToggleFailure}
        isResetting={isResetting}
      />

      {/* Main 3-Column Layout */}
      <main style={{
        flex: 1,
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: '320px 1fr 380px',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* Left Column: Task Launcher */}
        <div>
          <TaskLauncher
            onLaunchTask={handleLaunchTask}
            isRunning={isRunning}
            onSelectScenario={handleSelectScenario}
          />
        </div>

        {/* Center Column: Execution Trace */}
        <div style={{ height: 'calc(100vh - 100px)' }}>
          <ExecutionTrace 
            task={activeTask}
            isRunning={isRunning}
          />
        </div>

        {/* Right Column: Approval Banner + Evidence + Company State */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Approval Banner if waiting */}
          {activeTask?.pendingApproval && (
            <ApprovalModal
              approval={activeTask.pendingApproval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {/* Independent Verification Evidence Dossier if completed */}
          {activeTask?.evidence && (
            <EvidenceDossier evidence={activeTask.evidence} />
          )}

          {/* Real-time Company Sandbox State */}
          <CompanyStatePanel
            state={envInfo?.environment || null}
            onRefresh={fetchEnv}
          />
        </div>
      </main>
    </div>
  );
};
