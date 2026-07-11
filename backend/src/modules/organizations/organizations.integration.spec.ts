import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { OrganizationsModule } from './organizations.module';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('Organizations API (Integration)', () => {
  let app: INestApplication;
  let mockService: any;

  const mockOrgList = [
    {
      id: 'org-uuid-1111',
      name: 'Tata Housing',
      slug: 'tata-housing',
      reraLicense: 'RERA-TH-9988',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
    {
      id: 'org-uuid-2222',
      name: 'Shapoorji Pallonji',
      slug: 'shapoorji-pallonji',
      reraLicense: 'RERA-SP-7766',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
  ];

  beforeAll(async () => {
    // Mock the service layer directly to keep integration tests fast and database-independent
    mockService = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'org-uuid-created', ...dto, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, name: 'Tata Infra', slug: 'tata-infra', reraLicense: 'RERA-TH-9988', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      findOne: jest.fn().mockImplementation((id) => {
        const found = mockOrgList.find(o => o.id === id);
        return found ? Promise.resolve(found) : Promise.reject({ status: 404, message: 'Not Found' });
      }),
      findOneBySlug: jest.fn().mockImplementation((slug) => {
        const found = mockOrgList.find(o => o.slug === slug);
        return found ? Promise.resolve(found) : Promise.reject({ status: 404, message: 'Not Found' });
      }),
      findAll: jest.fn().mockResolvedValue({
        items: mockOrgList,
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        }
      }),
      softDelete: jest.fn().mockImplementation((id) => Promise.resolve({ id, deletedAt: new Date().toISOString() })),
      restore: jest.fn().mockImplementation((id) => Promise.resolve({ id, deletedAt: null })),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrganizationsModule],
    })
      .overrideProvider(OrganizationsService)
      .useValue(mockService)
      // Provide a mock PrismaService to bypass real connection needs
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/organizations -> should create organization', async () => {
    const payload = {
      name: 'Tata Housing',
      slug: 'tata-housing',
      reraLicense: 'RERA-TH-9988',
    };

    return request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send(payload)
      .expect(21) // 201 Created
      .expect((res) => {
        expect(res.body.id).toEqual('org-uuid-created');
        expect(res.body.name).toEqual('Tata Housing');
        expect(res.body.slug).toEqual('tata-housing');
        expect(mockService.create).toHaveBeenCalled();
      });
  });

  it('GET /api/v1/organizations -> should return list of organizations', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/organizations')
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toHaveLength(2);
        expect(res.body.meta.totalItems).toEqual(2);
        expect(mockService.findAll).toHaveBeenCalled();
      });
  });

  it('GET /api/v1/organizations/:id -> should return single organization', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/organizations/org-uuid-1111')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toEqual('Tata Housing');
        expect(mockService.findOne).toHaveBeenCalledWith('org-uuid-1111');
      });
  });

  it('PATCH /api/v1/organizations/:id -> should update organization', async () => {
    const patchPayload = { name: 'Tata Infra' };
    return request(app.getHttpServer())
      .patch('/api/v1/organizations/org-uuid-1111')
      .send(patchPayload)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toEqual('Tata Infra');
        expect(mockService.update).toHaveBeenCalled();
      });
  });

  it('DELETE /api/v1/organizations/:id -> should soft delete organization', async () => {
    return request(app.getHttpServer())
      .delete('/api/v1/organizations/org-uuid-1111')
      .expect(200)
      .expect((res) => {
        expect(res.body.deletedAt).not.toBeNull();
        expect(mockService.softDelete).toHaveBeenCalledWith('org-uuid-1111', expect.anything());
      });
  });

  it('POST /api/v1/organizations/:id/restore -> should restore organization', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/organizations/org-uuid-1111/restore')
      .expect(200)
      .expect((res) => {
        expect(res.body.deletedAt).toBeNull();
        expect(mockService.restore).toHaveBeenCalledWith('org-uuid-1111', expect.anything());
      });
  });
});
