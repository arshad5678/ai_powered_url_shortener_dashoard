export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'BookingJini URL Shortener API Documentation',
    version: '1.0.0',
    description:
      'Production-ready API endpoints for managing shortened links, capturing click telemetry, and requesting AI custom alias suggestions.',
  },
  servers: [
    {
      url: 'http://localhost:5050',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Detailed Health Status Check',
        description: 'Returns the health status of the application server and PostgreSQL database.',
        responses: {
          '200': {
            description: 'Application server is healthy and DB is connected.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'healthy' },
                        uptime: { type: 'number', example: 124.5 },
                        timestamp: { type: 'string', example: '2026-07-10T12:00:00.000Z' },
                        environment: { type: 'string', example: 'development' },
                        database: { type: 'string', example: 'up' },
                      },
                    },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Database connection failed or unhealthy status.',
          },
        },
      },
    },
    '/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness Probe Check',
        description: 'Checks database connection state for load balancers or orchestrators.',
        responses: {
          '200': {
            description: 'Database is up and ready to accept connections.',
          },
          '503': {
            description: 'Database is down or unreachable.',
          },
        },
      },
    },
    '/live': {
      get: {
        tags: ['Health'],
        summary: 'Liveness Probe Check',
        description: 'Confirms that the Node.js Express process is running.',
        responses: {
          '200': {
            description: 'Process is alive.',
          },
        },
      },
    },
    '/api/links': {
      post: {
        tags: ['Links'],
        summary: 'Create Shortened URL',
        description: 'Validates payload and registers a new shortened link inside PostgreSQL.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'originalUrl'],
                properties: {
                  title: {
                    type: 'string',
                    description: 'Descriptive title for the link (max 120 chars).',
                    example: 'Summer Sale',
                  },
                  originalUrl: {
                    type: 'string',
                    description: 'Destination URL (must start with http:// or https://).',
                    example: 'https://example.com/products/summer-sale',
                  },
                  shortCode: {
                    type: 'string',
                    description: 'Optional custom URL slug.',
                    example: 'sumsal',
                  },
                  customAlias: {
                    type: 'string',
                    description: 'Optional custom tracking alias.',
                    example: 'summer-sale',
                  },
                  expiresAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Optional expiry date (must be in the future).',
                    example: '2026-12-31T23:59:59.000Z',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Short link created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Short URL created successfully.' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'f5139be3-9122-4503-b5a5-2b598cfb4e8a' },
                        title: { type: 'string', example: 'Summer Sale' },
                        originalUrl: { type: 'string', example: 'https://example.com/summer-sale' },
                        shortCode: { type: 'string', example: 'sumsal' },
                        shortUrl: { type: 'string', example: 'http://localhost:5173/sumsal' },
                        customAlias: { type: 'string', example: 'summer-sale' },
                        isActive: { type: 'boolean', example: true },
                        expiresAt: { type: 'string', example: '2026-12-31T23:59:59.000Z' },
                        createdAt: { type: 'string', example: '2026-07-10T12:00:00.000Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error (e.g., past expiry date, invalid URL format).' },
          '409': { description: 'Conflict (shortCode or customAlias is already taken).' },
        },
      },
      get: {
        tags: ['Links'],
        summary: 'List Links',
        description: 'Returns a paginated list of non-deleted links.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Active links retrieved successfully.',
          },
        },
      },
    },
    '/api/links/check-alias': {
      get: {
        tags: ['Links'],
        summary: 'Check Custom Alias Availability',
        description: 'Checks if a custom alias slug is available or already taken.',
        parameters: [
          {
            name: 'customAlias',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            example: 'summer-sale',
          },
        ],
        responses: {
          '200': {
            description: 'Success status of custom alias availability.',
          },
        },
      },
    },
    '/api/links/{id}': {
      get: {
        tags: ['Links'],
        summary: 'Get Link Details',
        description: 'Retrieves link properties by its ID.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Link details retrieved successfully.' },
          '404': { description: 'Link not found or soft-deleted.' },
        },
      },
      put: {
        tags: ['Links'],
        summary: 'Update Link Metadata',
        description: 'Updates specific metadata properties of an active Link.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Winter Sale' },
                  originalUrl: { type: 'string', example: 'https://example.com/winter-sale' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Link updated successfully.' },
          '404': { description: 'Link not found.' },
        },
      },
      delete: {
        tags: ['Links'],
        summary: 'Soft Delete Link',
        description: 'Soft-deletes a link by setting the deletedAt timestamp.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Link deleted successfully.' },
          '404': { description: 'Link not found.' },
        },
      },
    },
    '/api/links/{id}/status': {
      patch: {
        tags: ['Links'],
        summary: 'Toggle Status',
        description: 'Enables or disables link routing redirect behaviors.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Link status toggled successfully.' },
        },
      },
    },
    '/r/{shortCode}': {
      get: {
        tags: ['Redirect'],
        summary: 'Execute Client Redirection',
        description:
          'Inspects Redis cache first. If a cache miss occurs, retrieves destination from DB, validates limits, stores in cache (1h TTL), logs click telemetry asynchronously, and redirects with HTTP 302.',
        parameters: [{ name: 'shortCode', in: 'path', required: true, schema: { type: 'string' }, example: 'sumsal' }],
        responses: {
          '302': { description: 'Redirecting to target destination URL.' },
          '403': { description: 'Link is disabled/inactive.' },
          '404': { description: 'Link not found.' },
          '410': { description: 'Link is expired.' },
        },
      },
    },
    '/api/analytics/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'System Dashboard Statistics',
        description: 'Returns overall links status aggregates and period-over-period click growth velocity.',
        responses: {
          '200': {
            description: 'Dashboard aggregates compiled successfully.',
          },
        },
      },
    },
    '/api/analytics/{linkId}': {
      get: {
        tags: ['Analytics'],
        summary: 'Unified Link Analytics breakdown',
        description: 'Returns total click counters and grouped telemetry breakdowns (countries, OS, browsers, referrers, timeline).',
        parameters: [
          { name: 'linkId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'rangeDays', in: 'query', schema: { type: 'integer', enum: [7, 30, 90], default: 7 } },
        ],
        responses: {
          '200': { description: 'Link analytics properties compiled successfully.' },
        },
      },
    },
    '/api/links/suggest-aliases': {
      post: {
        tags: ['AI Assistant'],
        summary: 'Request AI Alias Suggestions',
        description: 'Uses Gemini API to recommend exactly 3 URL-safe slugs. Implements exponential backoff retry and local fallbacks.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'originalUrl'],
                properties: {
                  title: { type: 'string', example: 'Winter Deals' },
                  originalUrl: { type: 'string', example: 'https://example.com/winter-deals' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'AI alias suggestions generated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        suggestions: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['winter-deals', 'winter-2026', 'best-sales'],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
export type SwaggerDocument = typeof swaggerDocument;
