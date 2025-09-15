import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { CacheState, ReportStatus, ReportType } from './libs/report.type';
import { WorkerPool } from './libs/worker-pool';

const metricsMock = {
  dataFetchingTimeTaken: 0.5,
  dataWriteTimeTaken: 0.2,
  totalTimeTaken: 0.7,
  generatedAt: new Date(2025, 1, 1),
};

const metricsExpected = {
  dataFetchingTimeTaken: 0.5,
  dataWriteTimeTaken: 0.2,
  totalTimeTaken: 0.7,
  generatedAt: new Date(2025, 1, 1),
};

describe('ReportsService', () => {
  let service: ReportService;
  let cacheState: CacheState;
  let workerPool: WorkerPool;

  beforeEach(async () => {
    workerPool = {
      init: jest.fn(),
      runTask: jest.fn(),
      getSharedData: jest.fn(),
      destroy: jest.fn(),
    } as unknown as WorkerPool;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ReportService,
          useFactory: () => {
            cacheState = new CacheState();
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

  describe('Get report', () => {
    it('Should return not started data for reports', () => {
      const reportData = service.get({
        types: [ReportType.accounts, ReportType.fs, ReportType.yearly],
      });

      expect(reportData).toBeDefined();
      expect(reportData).toMatchObject({
        accounts: { status: 'not_started' },
        fs: { status: 'not_started' },
        yearly: { status: 'not_started' },
      });
    });

    it('Should return generated data with matrics for reports', () => {
      cacheState.time = new Date();
      cacheState.setStates(ReportType.accounts, {
        status: ReportStatus.generated,
        metrics: metricsMock,
      });
      cacheState.setStates(ReportType.fs, {
        status: ReportStatus.generated,
        metrics: metricsMock,
      });
      cacheState.setStates(ReportType.yearly, {
        status: ReportStatus.generated,
        metrics: metricsMock,
      });
      const reportData = service.get({
        types: [ReportType.accounts, ReportType.fs, ReportType.yearly],
      });

      expect(reportData).toBeDefined();
      expect(reportData).toMatchObject({
        accounts: {
          status: 'generated',
          metrics: metricsExpected,
        },
        fs: { status: 'generated', metrics: metricsExpected },
        yearly: { status: 'generated', metrics: metricsExpected },
      });
    });
  });

  describe('Check status', () => {
    it('Should return not started status', () => {
      expect(service.checkStatus(ReportType.accounts)).toBe(
        ReportStatus.not_started,
      );
    });

    it('Should return data ready status', () => {
      cacheState.time = new Date();
      expect(service.checkStatus(ReportType.accounts)).toBe(
        ReportStatus.data_ready,
      );
    });

    it('Should return stale status', () => {
      const pastTime = new Date(new Date().getTime() - 20000);
      cacheState.time = pastTime;
      expect(service.checkStatus(ReportType.accounts)).toBe(ReportStatus.stale);
    });

    it('Should return generating status', () => {
      cacheState.setStates(ReportType.accounts, {
        status: ReportStatus.generateing,
      });
      expect(service.checkStatus(ReportType.accounts)).toBe(
        ReportStatus.generateing,
      );
    });

    it('Should return generated status', () => {
      cacheState.setStates(ReportType.accounts, {
        status: ReportStatus.generated,
      });
      expect(service.checkStatus(ReportType.accounts)).toBe(
        ReportStatus.generated,
      );
    });
  });

  describe('Generate function', () => {
    it('Should generate report successfully', async () => {
      jest.spyOn(workerPool, 'init');
      jest.spyOn(workerPool, 'getSharedData').mockReturnValue({ balances: {} });
      jest.spyOn(workerPool, 'runTask').mockResolvedValue();
      jest.spyOn(workerPool, 'destroy');
      jest.spyOn(workerPool, 'getSharedData').mockReturnValue({
        balances: { Cash: { year: 2025, balance: 1000, account: 'Cash' } },
      });

      await service.generate({ types: [ReportType.accounts] });

      expect(cacheState.states[ReportType.accounts]?.status).toBe(
        ReportStatus.generated,
      );
      expect(cacheState.states[ReportType.accounts]?.metrics).toBeDefined();
      expect(
        cacheState.states[ReportType.accounts]?.metrics?.dataFetchingTimeTaken,
      ).toBeGreaterThan(0);
      expect(
        cacheState.states[ReportType.accounts]?.metrics?.totalTimeTaken,
      ).toBeGreaterThan(0);
      expect(
        cacheState.states[ReportType.accounts]?.metrics?.generatedAt,
      ).toBeInstanceOf(Date);
    });

    it('Should generate report failed, set generating to fail', async () => {
      cacheState.clear();
      jest.spyOn(workerPool, 'init');
      jest.spyOn(workerPool, 'getSharedData').mockReturnValue({ balances: {} });
      jest
        .spyOn(workerPool, 'runTask')
        .mockRejectedValue(new Error('Read timeout'));

      const generate = service.generate({ types: [ReportType.accounts] });

      await expect(generate).rejects.toThrow(Error);
      await expect(generate).rejects.toMatchObject({ message: 'Read timeout' });
      expect(service['isGenerating']).toBe(false);
    });
  });
});
