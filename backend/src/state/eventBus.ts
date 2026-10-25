import { EventEmitter } from 'events';

class TaskEventBus extends EventEmitter {
  public emitTaskUpdate(taskId: string, payload: any) {
    this.emit(`task:${taskId}`, payload);
    this.emit('task:any', { taskId, ...payload });
  }

  public subscribeToTask(taskId: string, callback: (payload: any) => void) {
    const eventName = `task:${taskId}`;
    this.on(eventName, callback);
    return () => this.off(eventName, callback);
  }
}

export const eventBus = new TaskEventBus();
