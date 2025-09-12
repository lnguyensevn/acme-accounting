import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { CacheState } from './libs/report.type';
import { WorkerPool } from './libs/worker-pool';
import { resolve as resolvePath } from 'path';

describe('ReportsService', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
