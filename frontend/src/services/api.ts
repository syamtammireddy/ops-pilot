import { Task, EnvironmentInfo } from '../types';

const API_BASE = '/api';

export async function createTask(goal: string, maxSteps: number = 15): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, maxSteps })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create task (HTTP ${res.status})`);
  }
  return res.json();
}

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch task ${id}`);
  }
  return res.json();
}

export async function approveTask(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tasks/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to approve task ${id}`);
  }
  return res.json();
}

export async function rejectTask(id: string, reason?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tasks/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to reject task ${id}`);
  }
  return res.json();
}

export async function getEnvironment(): Promise<EnvironmentInfo> {
  const res = await fetch(`${API_BASE}/environment`);
  if (!res.ok) {
    throw new Error(`Failed to fetch environment state`);
  }
  return res.json();
}

export async function resetEnvironment(): Promise<any> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error(`Failed to reset environment`);
  }
  return res.json();
}

export async function toggleFailureMode(enabled?: boolean): Promise<{ success: boolean; failureModeEnabled: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/demo/failure-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(typeof enabled === 'boolean' ? { enabled } : {})
  });
  if (!res.ok) {
    throw new Error(`Failed to toggle failure mode`);
  }
  return res.json();
}

export function subscribeToTaskEvents(taskId: string, onUpdate: (data: any) => void): () => void {
  const eventSource = new EventSource(`${API_BASE}/tasks/${taskId}/events`);

  eventSource.addEventListener('snapshot', (e) => {
    try {
      const data = JSON.parse(e.data);
      onUpdate({ type: 'SNAPSHOT', task: data });
    } catch (err) {
      console.error("Error parsing SSE snapshot:", err);
    }
  });

  eventSource.addEventListener('update', (e) => {
    try {
      const data = JSON.parse(e.data);
      onUpdate(data);
    } catch (err) {
      console.error("Error parsing SSE update:", err);
    }
  });

  eventSource.onerror = (err) => {
    console.warn("SSE connection error:", err);
  };

  return () => {
    eventSource.close();
  };
}
