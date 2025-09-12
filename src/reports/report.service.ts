import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { WorkerPool } from './libs/worker-pool';
import {
  AccountsReportGenerationStrategy,
  FSReportGenerationStrategy,
  ReportWriteStrategy,
  YearlyReportGenerationStrategy,
} from './report.writer';
import {
  CacheState,
  ReportStateMap,
  ReportStatus,
  ReportType,
} from './libs/report.type';

@Injectable()
export class ReportService {
  private readonly wokerPool: WorkerPool;
  private readonly staleTimeout: number;
  private readonly cache: CacheState;
  private isGenerating = false;

  constructor(
    protected cacheState: CacheState,
    protected pool: WorkerPool,
    protected staleTime = 10000,
  ) {
    this.cache = cacheState;
    this.wokerPool = pool;
    this.staleTimeout = staleTime;
  }

  checkStatus(reportType: ReportType): ReportStatus {
    if (
      this.cache.states[reportType] &&
      [ReportStatus.generateing, ReportStatus.generated].includes(
        this.cache.states[reportType].status,
      )
    ) {
      return this.cache.states[reportType].status;
    }

    if (!this.cache || !this.cache?.time) return ReportStatus.not_started;

    if (new Date().getTime() - this.cache.time.getTime() < this.staleTimeout) {
      return ReportStatus.data_ready;
    }

    if (new Date().getTime() - this.cache.time.getTime() >= this.staleTimeout) {
      return ReportStatus.stale;
    }

    return this.cache.states[reportType]?.status || ReportStatus.not_started;
  }

  get(filter: { types: ReportType[] }): ReportStateMap {
    const result: ReportStateMap = {};

    if (filter.types.includes(ReportType.accounts)) {
      result[ReportType.accounts] = {
        status: this.checkStatus(ReportType.accounts),
        metrics: this.cache.states[ReportType.accounts]?.metrics,
      };
    }

    if (filter.types.includes(ReportType.yearly)) {
      result[ReportType.yearly] = {
        status: this.checkStatus(ReportType.yearly),
        metrics: this.cache.states[ReportType.yearly]?.metrics,
      };
    }

    if (filter.types.includes(ReportType.fs)) {
      result[ReportType.fs] = {
        status: this.checkStatus(ReportType.fs),
        metrics: this.cache.states[ReportType.fs]?.metrics,
      };
    }

    return result;
  }

  async generate(filter: { types: ReportType[] }): Promise<void> {
    if (filter.types.length === 0) {
      throw new Error('No report types specified');
    }
    if (this.isGenerating) {
      throw new Error('Report generation is already in progress');
    }
    this.isGenerating = true;
    this.wokerPool.init();

    const files = await fs.promises.readdir('tmp');

    const start = performance.now();
    const isStale =
      this.cache?.time &&
      new Date().getTime() - this.cache.time.getTime() > this.staleTimeout
        ? true
        : false;

    if (isStale) {
      this.cache.clear();
    }

    this.cache.setData(this.wokerPool.getSharedData());
    filter.types.forEach((type) => {
      this.cache.setStates(type, { status: ReportStatus.generateing });
    });

    if (!this.cache?.time) {
      await Promise.all(
        files
          .filter((f) => f.endsWith('.csv'))
          .map((file) =>
            this.wokerPool.runTask({ filePath: path.resolve('tmp', file) }),
          ),
      );
    }
    const dataFetchTimeTaken = (performance.now() - start) / 1000;

    this.wokerPool.destroy();

    this.cache.setData(this.wokerPool.getSharedData());

    const reportWritter: Record<ReportType, ReportWriteStrategy> = {
      [ReportType.accounts]: new AccountsReportGenerationStrategy(
        ReportType.accounts,
        this.cache,
      ),
      [ReportType.yearly]: new YearlyReportGenerationStrategy(
        ReportType.yearly,
        this.cache,
      ),
      [ReportType.fs]: new FSReportGenerationStrategy(
        ReportType.fs,
        this.cache,
      ),
    };

    if (filter.types.includes(ReportType.accounts)) {
      const accountReport = reportWritter[ReportType.accounts].write();
      this.cache.setStates(ReportType.accounts, {
        status: ReportStatus.generated,
        metrics: {
          dataFetchingTimeTaken: dataFetchTimeTaken,
          dataWriteTimeTake: accountReport.writeTimeTaken,
          totalTimeTaken: dataFetchTimeTaken + accountReport.writeTimeTaken,
          generatedAt: new Date(),
        },
      });
    }

    if (filter.types.includes(ReportType.yearly)) {
      const yearlyReport = reportWritter[ReportType.yearly].write();
      this.cache.setStates(ReportType.yearly, {
        status: ReportStatus.generated,
        metrics: {
          dataFetchingTimeTaken: dataFetchTimeTaken,
          dataWriteTimeTake: yearlyReport.writeTimeTaken,
          totalTimeTaken: dataFetchTimeTaken + yearlyReport.writeTimeTaken,
          generatedAt: new Date(),
        },
      });
    }

    if (filter.types.includes(ReportType.fs)) {
      const fs = reportWritter[ReportType.fs].write();
      this.cache.setStates(ReportType.fs, {
        status: ReportStatus.generated,
        metrics: {
          dataFetchingTimeTaken: dataFetchTimeTaken,
          dataWriteTimeTake: fs.writeTimeTaken,
          totalTimeTaken: dataFetchTimeTaken + fs.writeTimeTaken,
          generatedAt: new Date(),
        },
      });
    }

    this.isGenerating = true;
    setTimeout(() => {
      this.isGenerating = false;
      this.cache.clear();
    }, this.staleTimeout);
  }
}
