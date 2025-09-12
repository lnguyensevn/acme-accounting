import { parentPort } from 'node:worker_threads';
import { BalanceRecord } from './worker-pool';
import { createInterface, Interface } from 'node:readline';
import { createReadStream } from 'node:fs';
import { Logger } from '@nestjs/common';

export interface WorkerPayload {
  filePath: string;
}

let rl: Interface;

parentPort?.on('message', (payload: WorkerPayload) => {
  rl = createInterface({
    input: createReadStream(payload.filePath),
    crlfDelay: Infinity,
  });
  Logger.debug(`Worker started processing file: ${payload.filePath}`);

  const balances: BalanceRecord = {};
  rl.on('line', (line) => {
    const [date, account, , debit, credit] = line.split(',');
    const year = new Date(date).getFullYear();
    const key = `${year}-${account}`;
    const balance =
      parseFloat(String(debit || 0)) - parseFloat(String(credit || 0));
    if (balances[key]) {
      balances[key].balance = balances[key].balance + balance;
    } else {
      balances[key] = {
        year,
        account,
        balance: balance,
      };
    }
  });

  rl.on('close', () => {
    Logger.debug(`Worker finished processing file: ${payload.filePath}`);
    parentPort?.postMessage({ status: 'success', balances });
  });

  rl.on('error', (err: Error) => {
    Logger.error(`Worker error processing file: ${payload.filePath}`, err);
    parentPort?.postMessage({ status: 'error' });
  });
});

process.on('uncaughtException', (err) => {
  Logger.error('Uncaught exception in worker:', err);
  parentPort?.postMessage({ status: 'error' });
  process.exit(1);
});
