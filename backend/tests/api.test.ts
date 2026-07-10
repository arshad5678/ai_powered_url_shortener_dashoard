import request from 'supertest';

import app from '../src/app.js';
import { prisma } from '../src/database/database.js';
import { redis } from '../src/database/redis.js';
import { decode, encode } from '../src/utils/base62.js';

// Mock DB and Redis singletons to guarantee isolated unit tests
jest.mock('../src/database/database.js', () => {
  const mockPrisma = {
    $executeRawUnsafe: jest.fn(),
    link: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    click: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };
  return {
    __esModule: true,
    prisma: mockPrisma,
    connectDatabase: jest.fn(),
    disconnectDatabase: jest.fn(),
  };
});

jest.mock('../src/database/redis.js', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
  };
  return {
    __esModule: true,
    redis: mockRedis,
    connectRedis: jest.fn(),
    disconnectRedis: jest.fn(),
  };
});

describe('BookingJini API Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // Base62 Utility Tests
  // ==========================================
  describe('Base62 Utility Unit Tests', () => {
    it('should encode base-10 integers correctly into Base62', () => {
      expect(encode(0)).toBe('0');
      expect(encode(125)).toBe('21');
    });

    it('should throw error when encoding negative values', () => {
      expect(() => encode(-10)).toThrow('Encoding value must be a non-negative integer.');
    });

    it('should throw error when encoding non-integers', () => {
      expect(() => encode(15.7)).toThrow('Encoding value must be a valid integer.');
    });

    it('should decode Base62 strings back into original integers', () => {
      expect(decode('21')).toBe(125);
      expect(decode('0')).toBe(0);
    });

    it('should throw error when decoding empty or invalid types', () => {
      expect(() => decode('')).toThrow('Decoding value must be a non-empty string.');
    });

    it('should throw error when decoding strings containing non-base62 characters', () => {
      expect(() => decode('abc-123')).toThrow('Invalid Base62 character found: "-"');
    });
  });

  // ==========================================
  // Health Probe Tests
  // ==========================================
  describe('Health Probes', () => {
    it('should return 200 for GET /health', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });

    it('should return 200 for GET /live', async () => {
      const res = await request(app).get('/live');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 200 for GET /ready when DB responds', async () => {
      (prisma.$executeRawUnsafe as jest.Mock).mockResolvedValue(1);
      const res = await request(app).get('/ready');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 503 for GET /ready when DB check fails', async () => {
      (prisma.$executeRawUnsafe as jest.Mock).mockRejectedValue(new Error('DB connection timeout'));
      const res = await request(app).get('/ready');
      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // Link Management Tests
  // ==========================================
  describe('Link Operations', () => {
    const mockLink = {
      id: 'f5139be3-9122-4503-b5a5-2b598cfb4e8a',
      title: 'Summer Sale',
      originalUrl: 'https://example.com/summer-sale',
      shortCode: 'sumsal',
      customAlias: 'summer-sale',
      isActive: true,
      expiresAt: new Date('2026-12-31T23:59:59.000Z'),
      createdAt: new Date('2026-07-10T12:00:00.000Z'),
      updatedAt: new Date('2026-07-10T12:00:00.000Z'),
      deletedAt: null,
    };

    it('should successfully create a new shortened link', async () => {
      (prisma.link.count as jest.Mock).mockResolvedValue(0);
      (prisma.link.create as jest.Mock).mockResolvedValue(mockLink);

      const res = await request(app)
        .post('/api/links')
        .send({
          title: 'Summer Sale',
          originalUrl: 'https://example.com/summer-sale',
          customAlias: 'summer-sale',
          expiresAt: '2026-12-31T23:59:59.000Z',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shortCode).toBe('sumsal');
      expect(res.body.data.shortUrl).toContain('sumsal');
    });

    it('should return 400 Bad Request if URL format is invalid', async () => {
      const res = await request(app).post('/api/links').send({
        title: 'Bad Link',
        originalUrl: 'not-a-valid-url',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 Conflict if custom alias exists', async () => {
      (prisma.link.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).post('/api/links').send({
        title: 'Duplicated Alias',
        originalUrl: 'https://example.com',
        customAlias: 'summer-sale',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for GET /api/links/:id when link not found', async () => {
      (prisma.link.findFirst as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/links/f5139be3-9122-4503-b5a5-2b598cfb4e89');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should successfully update link metadata', async () => {
      (prisma.link.findFirst as jest.Mock).mockResolvedValue(mockLink);
      (prisma.link.update as jest.Mock).mockResolvedValue({
        ...mockLink,
        title: 'New Title',
      });

      const res = await request(app)
        .put('/api/links/f5139be3-9122-4503-b5a5-2b598cfb4e8a')
        .send({
          title: 'New Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Title');
    });

    it('should successfully soft-delete a link', async () => {
      (prisma.link.findFirst as jest.Mock).mockResolvedValue(mockLink);
      (prisma.link.update as jest.Mock).mockResolvedValue({
        ...mockLink,
        deletedAt: new Date(),
      });

      const res = await request(app).delete('/api/links/f5139be3-9122-4503-b5a5-2b598cfb4e8a');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should check custom alias availability and return true if available', async () => {
      (prisma.link.count as jest.Mock).mockResolvedValue(0);
      const res = await request(app).get('/api/links/check-alias?customAlias=fresh-alias');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(true);
    });

    it('should toggle active status of a link', async () => {
      (prisma.link.findFirst as jest.Mock).mockResolvedValue(mockLink);
      (prisma.link.update as jest.Mock).mockResolvedValue({
        ...mockLink,
        isActive: false,
      });

      const res = await request(app).patch('/api/links/f5139be3-9122-4503-b5a5-2b598cfb4e8a/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should retrieve list of links', async () => {
      (prisma.link.findMany as jest.Mock).mockResolvedValue([mockLink]);
      (prisma.link.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/links?page=1&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toHaveLength(1);
    });
  });

  // ==========================================
  // Redirect Engine Tests
  // ==========================================
  describe('Redirect Engine', () => {
    const mockLink = {
      id: 'f5139be3-9122-4503-b5a5-2b598cfb4e8a',
      originalUrl: 'https://example.com/redirect-target',
      shortCode: 'target',
      isActive: true,
      expiresAt: null,
      deletedAt: null,
    };

    it('should redirect with 302 immediately on Redis Cache HIT', async () => {
      (redis.get as jest.Mock).mockResolvedValue(
        JSON.stringify({ id: mockLink.id, originalUrl: mockLink.originalUrl })
      );

      const res = await request(app).get('/r/target');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(mockLink.originalUrl);
      expect(prisma.link.findFirst).toHaveBeenCalled();
    });

    it('should query DB and redirect with 302 on Redis Cache MISS', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.link.findFirst as jest.Mock).mockResolvedValue(mockLink);

      const res = await request(app).get('/r/target');
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(mockLink.originalUrl);
      expect(redis.set).toHaveBeenCalled();
    });

    it('should return 403 Forbidden for inactive link redirect attempts', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.link.findFirst as jest.Mock).mockResolvedValue({
        ...mockLink,
        isActive: false,
      });

      const res = await request(app).get('/r/target');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 410 Gone for expired link redirect attempts', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      (prisma.link.findFirst as jest.Mock).mockResolvedValue({
        ...mockLink,
        expiresAt: new Date('2020-01-01'),
      });

      const res = await request(app).get('/r/target');
      expect(res.status).toBe(410);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // Analytics Engine Tests
  // ==========================================
  describe('Analytics Engine', () => {
    const linkId = 'f5139be3-9122-4503-b5a5-2b598cfb4e8a';

    beforeEach(() => {
      (prisma.link.findFirst as jest.Mock).mockResolvedValue({ id: linkId });
      (prisma.click.groupBy as jest.Mock).mockResolvedValue([
        { browser: 'Chrome', _count: { id: 5 } },
        { operatingSystem: 'MacOS', _count: { id: 5 } },
        { country: 'US', _count: { id: 5 } },
        { referrer: 'Direct', _count: { id: 5 } },
      ]);
      (prisma.click.findMany as jest.Mock).mockResolvedValue([
        { clickedAt: new Date() },
      ]);
    });

    it('should return system summary for GET /api/analytics/dashboard', async () => {
      (prisma.link.count as jest.Mock).mockResolvedValue(10);
      (prisma.click.count as jest.Mock).mockResolvedValue(100);

      const res = await request(app).get('/api/analytics/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.links.total).toBe(10);
      expect(res.body.data.clicks.total).toBe(100);
    });

    it('should return breakdowns for GET /api/analytics/:linkId', async () => {
      const res = await request(app).get(`/api/analytics/${linkId}?rangeDays=30`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalClicks).toBe(1);
    });

    it('should return browsers stats breakdown route', async () => {
      const res = await request(app).get(`/api/analytics/${linkId}/browsers`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return OS stats breakdown route', async () => {
      const res = await request(app).get(`/api/analytics/${linkId}/os`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return country stats breakdown route', async () => {
      const res = await request(app).get(`/api/analytics/${linkId}/countries`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return referrer stats breakdown route', async () => {
      const res = await request(app).get(`/api/analytics/${linkId}/referrers`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return timeline stats breakdown route', async () => {
      const res = await request(app).get(`/api/analytics/${linkId}/timeline`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // AI Alias Suggestions Tests
  // ==========================================
  describe('AI Alias Suggestions', () => {
    it('should fallback to local suggestions on Gemini API call failures', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));

      const res = await request(app).post('/api/links/suggest-aliases').send({
        title: 'New Deals',
        originalUrl: 'https://example.com/deals',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.suggestions).toHaveLength(3);
      expect(res.body.data.suggestions[0]).toBe('new-deals');

      global.fetch = originalFetch;
    });
  });
});
