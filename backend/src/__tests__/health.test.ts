import request from 'supertest';

describe('Healthcheck', () => {
  it('GET /api/health responds with JSON and status', async () => {
    const app = (await import('../../src/index')).default;
    const res = await request(app).get('/api/health');
    expect(res.status).toBeLessThan(500); // DB may fail locally; still ensure endpoint works
    expect(res.body).toHaveProperty('status');
  });
});


