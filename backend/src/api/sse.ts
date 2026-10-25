import { Request, Response } from 'express';
import { eventBus } from '../state/eventBus';
import { taskStoreInstance } from '../state/taskStore';

export function handleTaskEventsSSE(req: Request, res: Response) {
  const { id } = req.params;
  const task = taskStoreInstance.getTask(id);

  if (!task) {
    res.status(404).json({ error: `Task '${id}' not found` });
    return;
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial task snapshot
  res.write(`event: snapshot\ndata: ${JSON.stringify(task)}\n\n`);

  // Subscribe to live task updates
  const unsubscribe = eventBus.subscribeToTask(id, (payload) => {
    res.write(`event: update\ndata: ${JSON.stringify(payload)}\n\n`);
  });

  // Keep-alive heartbeat every 15 seconds
  const heartbeat = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
}
