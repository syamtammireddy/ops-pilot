import { Task, TaskStatus, ExecutionStep, PendingApproval, EvidenceDossier } from '../agent/types';
import { eventBus } from './eventBus';

export class TaskStore {
  private tasks: Map<string, Task> = new Map();

  public createTask(id: string, goal: string, maxSteps: number = 15): Task {
    const task: Task = {
      id,
      goal,
      status: 'UNDERSTANDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      maxSteps
    };
    this.tasks.set(id, task);
    eventBus.emitTaskUpdate(id, { type: 'TASK_CREATED', task });
    return task;
  }

  public getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateStatus(id: string, status: TaskStatus, error?: string): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    task.status = status;
    task.updatedAt = new Date().toISOString();
    if (error) task.error = error;

    eventBus.emitTaskUpdate(id, { type: 'STATUS_CHANGED', status, error });
    return task;
  }

  public addStep(id: string, step: ExecutionStep): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    task.steps.push(step);
    task.updatedAt = new Date().toISOString();

    eventBus.emitTaskUpdate(id, { type: 'STEP_ADDED', step });
    return task;
  }

  public setPendingApproval(id: string, approval: PendingApproval): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    task.pendingApproval = approval;
    task.status = 'WAITING_FOR_APPROVAL';
    task.updatedAt = new Date().toISOString();

    eventBus.emitTaskUpdate(id, { type: 'APPROVAL_REQUESTED', approval });
    return task;
  }

  public clearPendingApproval(id: string): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    task.pendingApproval = undefined;
    task.updatedAt = new Date().toISOString();

    eventBus.emitTaskUpdate(id, { type: 'APPROVAL_RESOLVED' });
    return task;
  }

  public setEvidence(id: string, evidence: EvidenceDossier): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    task.evidence = evidence;
    task.status = evidence.status === 'VERIFIED' ? 'COMPLETED' : 'FAILED';
    task.updatedAt = new Date().toISOString();

    eventBus.emitTaskUpdate(id, { type: 'TASK_COMPLETED', evidence, status: task.status });
    return task;
  }
}

export const taskStoreInstance = new TaskStore();
