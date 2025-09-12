import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { CacheState } from './libs/report.type';
import { WorkerPool } from './libs/worker-pool';
import { resolve as resolvePath } from 'path';

@Module({
  providers: [
    {
      provide: ReportService,
      useFactory: () => {
        const cacheState = new CacheState();
        const workerPool = new WorkerPool(
          resolvePath(__dirname, 'libs/worker.js'),
        );
        const staleTimeout = 10000;
        return new ReportService(cacheState, workerPool, staleTimeout);
      },
    },
  ],
  exports: [ReportService],
})
export class ReportModule {}
