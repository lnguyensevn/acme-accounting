import { Logger } from '@nestjs/common';
import { cpus } from 'os';
import { Worker } from 'worker_threads';

export interface WorkerInfo {
  id: number;
  state: 'idle' | 'processing';
  worker: Worker;
  assignedTask: WorkerTask | null;
}

export interface WorkerTask {
  filePath: string;
  resolve?: () => void;
}

export type BalanceRecord = Record<
  string,
  {
    year: number;
    account: string;
    balance: number;
  }
>;

export interface SharedData {
  balances: BalanceRecord;
}

export class WorkerPool {
  private poolSize: number;
  private workerPath: string;
  private workers: Record<string, WorkerInfo> = {};
  private queue: WorkerTask[] = [];
  private shareData: SharedData = { balances: {} };

  constructor(
    workerPath: string,
    private size: number = cpus().length,
  ) {
    this.poolSize = this.size;
    this.workerPath = workerPath;
    setInterval(() => {
      const states = Object.entries(this.workers).map(([key, worker]) => ({
        name: key,
        state: worker.state,
      }));
      states.forEach((s) => {
        Logger.debug(`Worker ${s.name} is ${s.state}`);
      });
      Logger.log(`Queue length: ${this.queue.length}`);
    }, 5000);
  }

  init() {
    for (let i = 0; i < this.poolSize; i++) {
      this.addWorker(i, this.workerPath);
    }
  }

  addWorker(id: number, workerPath: string) {
    const worker = new Worker(workerPath);

    worker.on(
      'message',
      ({ status, balances }: { status: string; balances: BalanceRecord }) => {
        if (status === 'success') {
          this.workers[id].state = 'idle';
          this.workers[id].assignedTask?.resolve?.();
          this.workers[id].assignedTask = null;
          Object.entries(balances).forEach(([key, value]) => {
            if (this.shareData.balances[key]) {
              this.shareData.balances[key].balance += value.balance;
            } else {
              this.shareData.balances[key] = value;
            }
          });
          this.processQueue();
        }
      },
    );

    worker.on('error', (err: Error) => {
      this.workers[id].state = 'idle';
      this.workers[id].assignedTask = null;
      throw err;
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        Logger.warn(`Worker ${id} stopped with exit code ${code}`);
      }
      Logger.debug(
        `Worker ${id} restarted  ${Object.keys(this.workers).length}`,
      );

      this.addWorker(id, workerPath);
    });

    this.workers[id] = {
      id,
      state: 'idle',
      worker,
      assignedTask: null,
    };
  }

  async runTask(data: { filePath: string }): Promise<void> {
    return new Promise((resolve) => {
      this.queue.push({
        filePath: data.filePath,
        resolve,
      });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0) {
      return;
    }

    const idleWorker = Object.values(this.workers).find(
      (w) => w.state === 'idle',
    );

    if (!idleWorker) {
      return;
    }

    const task = this.queue.shift();
    if (!task) {
      return;
    }

    idleWorker.state = 'processing';
    idleWorker.assignedTask = task;
    idleWorker.worker.postMessage({
      filePath: task.filePath,
      shareData: this.shareData,
    });
  }

  getSharedData(): SharedData {
    return this.shareData;
  }

  destroy() {
    for (const worker of Object.values(this.workers)) {
      worker.worker.terminate();
    }
    this.workers = {};
  }
}
