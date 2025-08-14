import request from 'supertest';

describe('Rate limiting', () => {
  it('returns 429 Too Many Requests after exceeding a very low test limit', async () => {
    process.env['RATE_LIMIT_WINDOW_MS'] = '1000';
    process.env['RATE_LIMIT_MAX_REQUESTS'] = '2';

    jest.resetModules();
    const app = (await import('../../src/index')).default;

    const responses = await Promise.all([
      request(app).get('/api/health'),
      request(app).get('/api/health'),
      request(app).get('/api/health'),
      request(app).get('/api/health'),
    ]);

    const statuses = responses.map(r => r.status);
    // We only assert that at least one request was rate-limited.
    expect(statuses.includes(429)).toBe(true);
  });
});


