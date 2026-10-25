import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { agentLoopInstance } from '../agent/agentLoop';
import { taskStoreInstance } from '../state/taskStore';
import { sandboxInstance } from '../environment/sandboxEnvironment';
import { handleTaskEventsSSE } from './sse';
import { llmProviderInstance } from '../agent/llmProvider';

export const apiRouter = Router();

// Create and trigger a new autonomous task
apiRouter.post('/tasks', async (req: Request, res: Response) => {
  const schema = z.object({
    goal: z.string().min(1, 'Goal is required'),
    maxSteps: z.number().int().positive().optional().default(15)
  });

  try {
    const { goal, maxSteps } = schema.parse(req.body);
    const task = await agentLoopInstance.startTask(goal, maxSteps);
    res.status(201).json(task);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Invalid task request' });
  }
});

// List all tasks
apiRouter.get('/tasks', (_req: Request, res: Response) => {
  const tasks = taskStoreInstance.getAllTasks();
  res.json({ tasks });
});

// Get task details by ID
apiRouter.get('/tasks/:id', (req: Request, res: Response) => {
  const task = taskStoreInstance.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ error: `Task '${req.params.id}' not found` });
    return;
  }
  res.json(task);
});

// Human Approval endpoint
apiRouter.post('/tasks/:id/approve', async (req: Request, res: Response) => {
  const task = await agentLoopInstance.approveTask(req.params.id);
  if (!task) {
    res.status(400).json({ error: `Task '${req.params.id}' is not currently awaiting approval` });
    return;
  }
  res.json({ success: true, message: "Human approval granted. Task resumed.", task });
});

// Human Rejection endpoint
apiRouter.post('/tasks/:id/reject', async (req: Request, res: Response) => {
  const reason = req.body?.reason;
  const task = await agentLoopInstance.rejectTask(req.params.id, reason);
  if (!task) {
    res.status(400).json({ error: `Task '${req.params.id}' is not currently awaiting approval` });
    return;
  }
  res.json({ success: true, message: "Proposed action rejected by human manager.", task });
});

// Server-Sent Events stream for a specific task
apiRouter.get('/tasks/:id/events', handleTaskEventsSSE);

// Get current live Sandbox Environment state
apiRouter.get('/environment', (_req: Request, res: Response) => {
  res.json({
    environment: sandboxInstance.getState(),
    llmModel: llmProviderInstance.getModelName(),
    isMockMode: llmProviderInstance.isMockMode()
  });
});

// Reset Sandbox Environment
apiRouter.post('/demo/reset', (_req: Request, res: Response) => {
  sandboxInstance.reset();
  res.json({
    success: true,
    message: "Sandbox company environment reset to initial baseline state.",
    environment: sandboxInstance.getState()
  });
});

// Toggle Failure Mode
apiRouter.post('/demo/failure-mode', (req: Request, res: Response) => {
  const enabled = typeof req.body?.enabled === 'boolean' ? req.body.enabled : undefined;
  const newState = sandboxInstance.toggleFailureMode(enabled);
  res.json({
    success: true,
    failureModeEnabled: newState,
    message: newState 
      ? "Failure injection ENABLED: Next payment settlement attempt will trigger a 503 Gateway Timeout."
      : "Failure injection DISABLED: Normal settlement operation restored."
  });
});
