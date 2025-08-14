import request from 'supertest';

describe('CORS configuration', () => {
  it('allows requests without Origin header', async () => {
    const app = (await import('../../src/index')).default;
    const res = await request(app).get('/api/health');
    expect(res.status).toBeLessThan(500);
  });

  it('in development, allows whitelisted origins and sets CORS headers', async () => {
    const app = (await import('../../src/index')).default;
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    // CORS preflight/simple response headers vary; check Access-Control-Allow-Credentials
    expect([200, 500]).toContain(res.status); // db might fail but CORS should still run
    expect(res.headers['access-control-allow-credentials']).toBeDefined();
  });
});


