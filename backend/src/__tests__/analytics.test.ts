import request from 'supertest';
import app from '../index';
import pool from '../database/connection';

describe('Analytics API', () => {
  let authToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Create a test platform admin user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified, credits_balance)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      'admin@test.com',
      'hashed_password',
      'Test',
      'Admin',
      'platform_admin',
      true,
      true,
      1000
    ]);
    
    adminUserId = result.rows[0].id;

    // Generate JWT token (simplified for testing)
    authToken = `Bearer test_token_${adminUserId}`;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE id = $1', [adminUserId]);
    // Note: pool.end() removed to prevent breaking other tests
    // Pool shutdown should be handled globally in Jest teardown
  });

  describe('GET /api/admin/analytics/dashboard', () => {
    it('should return dashboard metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/dashboard')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('alerts');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/admin/analytics/dashboard')
        .expect(401);
    });
  });

  describe('GET /api/admin/analytics/users/real-time', () => {
    it('should return user metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/users/real-time')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('by_role');
      expect(response.body.data).toHaveProperty('growth');
      expect(response.body.data).toHaveProperty('activity');
    });
  });

  describe('GET /api/admin/analytics/credits/real-time', () => {
    it('should return credit metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/credits/real-time')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_purchased');
      expect(response.body.data).toHaveProperty('total_used');
      expect(response.body.data).toHaveProperty('current_balance');
      expect(response.body.data).toHaveProperty('usage_trends');
      expect(response.body.data).toHaveProperty('revenue');
    });
  });

  describe('GET /api/admin/analytics/content/real-time', () => {
    it('should return content metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/content/real-time')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total_sessions');
      expect(response.body.data).toHaveProperty('total_messages');
      expect(response.body.data).toHaveProperty('total_files');
      expect(response.body.data).toHaveProperty('creation_trends');
      expect(response.body.data).toHaveProperty('by_type');
      expect(response.body.data).toHaveProperty('user_engagement');
    });
  });

  describe('GET /api/admin/analytics/system/performance', () => {
    it('should return system metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/system/performance')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('security');
    });
  });

  describe('GET /api/admin/analytics/revenue/real-time', () => {
    it('should return revenue metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/revenue/real-time')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('current_period');
      expect(response.body.data).toHaveProperty('previous_period');
      expect(response.body.data).toHaveProperty('growth_rate');
      expect(response.body.data).toHaveProperty('by_plan');
      expect(response.body.data).toHaveProperty('by_school');
      expect(response.body.data).toHaveProperty('projections');
    });
  });

  describe('GET /api/admin/analytics/alerts', () => {
    it('should return system alerts', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/alerts')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const alert = response.body.data[0];
        expect(alert).toHaveProperty('id');
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('triggered_at');
      }
    });
  });

  describe('GET /api/admin/analytics/enhanced', () => {
    it('should return all enhanced metrics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/enhanced')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('business');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('content');
      expect(response.body.data).toHaveProperty('alerts');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/admin/analytics/export', () => {
    it('should export analytics data in JSON format', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/export?type=users&format=json')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should export analytics data in CSV format', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/export?type=users&format=csv')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should reject invalid export type', async () => {
      await request(app)
        .get('/api/admin/analytics/export?type=invalid')
        .set('Authorization', authToken)
        .expect(400);
    });
  });

  describe('POST /api/admin/analytics/subscribe', () => {
    it('should subscribe to metrics updates', async () => {
      const response = await request(app)
        .post('/api/admin/analytics/subscribe')
        .set('Authorization', authToken)
        .send({ metrics: ['dashboard', 'users'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Successfully subscribed');
      expect(response.body.data.metrics).toEqual(['dashboard', 'users']);
    });

    it('should reject invalid metrics array', async () => {
      await request(app)
        .post('/api/admin/analytics/subscribe')
        .set('Authorization', authToken)
        .send({ metrics: 'invalid' })
        .expect(400);
    });
  });

  describe('POST /api/admin/analytics/unsubscribe', () => {
    it('should unsubscribe from metrics updates', async () => {
      const response = await request(app)
        .post('/api/admin/analytics/unsubscribe')
        .set('Authorization', authToken)
        .send({ metrics: ['dashboard'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Successfully unsubscribed');
      expect(response.body.data.metrics).toEqual(['dashboard']);
    });
  });

  describe('GET /api/admin/analytics/connection-stats', () => {
    it('should return connection statistics', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/connection-stats')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalConnections');
      expect(response.body.data).toHaveProperty('activeConnections');
      expect(response.body.data).toHaveProperty('connectionsByUser');
    });
  });
});
