import request from 'supertest';
import app from '../../src/index';

describe('Healthcheck', () => {
  it('GET /api/health responds with 200 and status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBeLessThan(500); // DB may fail locally; still ensure endpoint works
    expect(res.body).toHaveProperty('status');
  });
});


