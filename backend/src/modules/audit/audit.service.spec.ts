import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { AuditService as CommonAuditService } from '../../common/audit/audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

describe('AuditService', () => {
  let service: AuditService;
  let repository: AuditRepository;
  let commonAudit: CommonAuditService;

  const mockAuditRepository = {
    findMany: jest.fn().mockImplementation((query) => {
      return Promise.resolve({ items: [], total: 0 });
    }),
    findOne: jest.fn().mockImplementation((id) => {
      return Promise.resolve(null);
    }),
    findHistory: jest.fn().mockImplementation((tableName, recordId) => {
      return Promise.resolve([]);
    }),
    findAiJobs: jest.fn().mockImplementation((query) => {
      return Promise.resolve({ items: [], total: 0 });
    }),
    findReports: jest.fn().mockImplementation((query) => {
      return Promise.resolve({ items: [], total: 0 });
    }),
    restoreState: jest.fn().mockImplementation((tableName, recordId, state) => {
      return Promise.resolve({ id: recordId, ...state });
    }),
  };

  const mockCommonAuditService = {
    log: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditRepository, useValue: mockAuditRepository },
        { provide: CommonAuditService, useValue: mockCommonAuditService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<AuditRepository>(AuditRepository);
    commonAudit = module.get<CommonAuditService>(CommonAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLogs', () => {
    it('should call repository.findMany and return mock items if db is empty', async () => {
      const query: AuditQueryDto = { limit: 10, offset: 0 };
      const result = await service.getLogs(query);
      
      expect(repository.findMany).toHaveBeenCalledWith(query);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total).toBe(5); // Length of generated mock array
    });
  });

  describe('getHistory', () => {
    it('should call repository.findHistory and fallback if empty', async () => {
      const result = await service.getHistory('Project', 'proj-blr-02');
      expect(repository.findHistory).toHaveBeenCalledWith('Project', 'proj-blr-02');
      expect(result.length).toBe(2);
    });
  });

  describe('restoreLog', () => {
    it('should trigger state restore on repository and log the event', async () => {
      const mockLog = {
        id: 'aud-test-id',
        tableName: 'Project',
        recordId: 'proj-blr-02',
        oldValues: { name: 'Prior State' },
        newValues: { name: 'Active State' },
        organizationId: 'org-123',
      };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockLog as any);

      const result = await service.restoreLog('aud-test-id', 'usr-admin-01');

      expect(repository.findOne).toHaveBeenCalledWith('aud-test-id');
      expect(repository.restoreState).toHaveBeenCalledWith('Project', 'proj-blr-02', { name: 'Prior State' });
      expect(commonAudit.log).toHaveBeenCalledWith({
        action: 'RESTORE',
        tableName: 'Project',
        recordId: 'proj-blr-02',
        oldValues: { name: 'Active State' },
        newValues: { name: 'Prior State' },
        userId: 'usr-admin-01',
        organizationId: 'org-123',
      });
      expect(result.success).toBe(true);
    });
  });
});
