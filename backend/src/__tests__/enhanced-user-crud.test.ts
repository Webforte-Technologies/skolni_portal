import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { UserActivityModel } from '../models/UserActivity';
import { UserNotificationModel } from '../models/UserNotification';
import { UserPreferencesModel } from '../models/UserPreferences';
import { SchoolModel } from '../models/School';
import pool from '../database/connection';

// Import the admin router
import adminRouter from '../routes/admin';

const app = express();
app.use(express.json());
app.use('/admin', adminRouter);

describe('Enhanced User CRUD Operations - Phase 3 Testing', () => {
  let adminToken: string;
  let testUserId: string;
  let testSchoolId: string;

  beforeAll(async () => {
    // Create admin user for testing
    const adminUser = await UserModel.createAdmin({
      email: 'admin@test.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'platform_admin',
      credits_balance: 1000
    });

    // Create test school
    const testSchool = await SchoolModel.create({
      name: 'Test School',
      address: 'Test Address',
      city: 'Test City',
      contact_phone: '+420123456789',
      contact_email: 'school@test.com'
    });
    testSchoolId = testSchool.id;

    // Create test user
    const testUser = await UserModel.createAdmin({
      email: 'testuser@test.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'teacher_school',
      school_id: testSchoolId,
      credits_balance: 500
    });
    testUserId = testUser.id;

    // Generate admin token
    adminToken = jwt.sign(
      { userId: adminUser.id, role: 'platform_admin' },
      process.env['JWT_SECRET'] || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM user_activity_logs WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM user_notifications WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [testUserId]);
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', ['admin@test.com', 'testuser@test.com']);
    await pool.query('DELETE FROM schools WHERE id = $1', [testSchoolId]);
  });

  describe('User Activity Tracking', () => {
    beforeEach(async () => {
      // Clean activity logs before each test
      await pool.query('DELETE FROM user_activity_logs WHERE user_id = $1', [testUserId]);
    });

    test('should log user activity', async () => {
      const activityData = {
        user_id: testUserId,
        activity_type: 'login' as const,
        activity_data: { browser: 'Chrome', platform: 'Windows' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 Test Agent',
        session_id: 'test-session-123'
      };

      const activity = await UserActivityModel.logActivity(activityData);
      
      expect(activity).toBeDefined();
      expect(activity.user_id).toBe(testUserId);
      expect(activity.activity_type).toBe('login');
      expect(activity.ip_address).toBe('192.168.1.1');
    });

    test('should get user activities with filters', async () => {
      // Log some test activities
      await UserActivityModel.logActivity({
        user_id: testUserId,
        activity_type: 'login',
        activity_data: {},
        ip_address: '192.168.1.1'
      });

      await UserActivityModel.logActivity({
        user_id: testUserId,
        activity_type: 'page_view',
        activity_data: { page: '/dashboard' },
        ip_address: '192.168.1.1'
      });

      const result = await UserActivityModel.getUserActivities({
        user_id: testUserId,
        limit: 10,
        offset: 0
      });

      expect(result.activities).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.activities?.[0]?.activity_type).toMatch(/login|page_view/);
    });

    test('should get user activity statistics', async () => {
      // Log some activities
      await UserActivityModel.logActivity({
        user_id: testUserId,
        activity_type: 'login',
        activity_data: {},
        ip_address: '192.168.1.1'
      });

      const stats = await UserActivityModel.getUserActivityStats(testUserId);
      
      expect(stats).toBeDefined();
      expect(stats.total_activities).toBeGreaterThan(0);
      expect(stats.activities_by_type).toBeDefined();
    });

    test('GET /admin/users/:id/activity should return user activities', async () => {
      // Log a test activity
      await UserActivityModel.logActivity({
        user_id: testUserId,
        activity_type: 'api_call',
        activity_data: { endpoint: '/test' },
        ip_address: '192.168.1.1'
      });

      const response = await request(app)
        .get(`/admin/users/${testUserId}/activity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.total).toBeGreaterThan(0);
    });
  });

  describe('User Notifications', () => {
    beforeEach(async () => {
      // Clean notifications before each test
      await pool.query('DELETE FROM user_notifications WHERE user_id = $1', [testUserId]);
    });

    test('should create user notification', async () => {
      const notificationData = {
        user_id: testUserId,
        notification_type: 'admin_message' as const,
        title: 'Test Notification',
        message: 'This is a test notification',
        severity: 'info' as const
      };

      const notification = await UserNotificationModel.create(notificationData);
      
      expect(notification).toBeDefined();
      expect(notification.title).toBe('Test Notification');
      expect(notification.message).toBe('This is a test notification');
      expect(notification.is_read).toBe(false);
    });

    test('should get user notifications', async () => {
      // Create test notifications
      await UserNotificationModel.create({
        user_id: testUserId,
        notification_type: 'system',
        title: 'System Alert',
        message: 'System maintenance',
        severity: 'warning'
      });

      const notifications = await UserNotificationModel.getUserNotifications({
        user_id: testUserId,
        limit: 10,
        offset: 0
      });

      expect(notifications.notifications).toHaveLength(1);
      expect(notifications.total).toBe(1);
      expect(notifications.notifications?.[0]?.title).toBe('System Alert');
    });

    test('should mark notification as read', async () => {
      const notification = await UserNotificationModel.create({
        user_id: testUserId,
        notification_type: 'system',
        title: 'Test Read',
        message: 'Test marking as read',
        severity: 'info'
      });

      const marked = await UserNotificationModel.markAsRead(notification.id);
      expect(marked).toBe(true);

      // Verify it's marked as read
      const updated = await pool.query(
        'SELECT is_read, read_at FROM user_notifications WHERE id = $1',
        [notification.id]
      );
      expect(updated.rows[0].is_read).toBe(true);
      expect(updated.rows[0].read_at).toBeDefined();
    });

    test('should get unread count', async () => {
      // Create multiple notifications
      await UserNotificationModel.create({
        user_id: testUserId,
        notification_type: 'system',
        title: 'Unread 1',
        message: 'Message 1',
        severity: 'info'
      });

      await UserNotificationModel.create({
        user_id: testUserId,
        notification_type: 'system',
        title: 'Unread 2',
        message: 'Message 2',
        severity: 'info'
      });

      const unreadCount = await UserNotificationModel.getUnreadCount(testUserId);
      expect(unreadCount).toBe(2);
    });

    test('POST /admin/users/:id/send-notification should send notification', async () => {
      const notificationData = {
        notification_type: 'admin_message',
        title: 'Admin Test',
        message: 'Test from admin panel',
        severity: 'info'
      };

      const response = await request(app)
        .post(`/admin/users/${testUserId}/send-notification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Admin Test');
      expect(response.body.data.user_id).toBe(testUserId);
    });
  });

  describe('User Preferences', () => {
    beforeEach(async () => {
      // Clean preferences before each test
      await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [testUserId]);
    });

    test('should create default user preferences', async () => {
      const preferences = await UserPreferencesModel.initializeDefaults(testUserId);
      
      expect(preferences).toBeDefined();
      expect(preferences.user_id).toBe(testUserId);
      expect(preferences.language).toBe('cs-CZ');
      expect(preferences.theme).toBe('light');
      expect(preferences.email_notifications).toBeDefined();
    });

    test('should get user preferences', async () => {
      // Initialize defaults first
      await UserPreferencesModel.initializeDefaults(testUserId);
      
      const preferences = await UserPreferencesModel.getByUserId(testUserId);
      
      expect(preferences).toBeDefined();
      expect(preferences?.user_id).toBe(testUserId);
      expect(preferences?.language).toBe('cs-CZ');
    });

    test('should update user preferences', async () => {
      // Initialize defaults first
      await UserPreferencesModel.initializeDefaults(testUserId);
      
      const updatedPrefs = await UserPreferencesModel.upsert(testUserId, {
        theme: 'dark',
        language: 'en-US',
        email_notifications: { marketing: false, updates: true, security: true }
      });

      expect(updatedPrefs.theme).toBe('dark');
      expect(updatedPrefs.language).toBe('en-US');
      expect(updatedPrefs.email_notifications.marketing).toBe(false);
    });

    test('should update specific preference fields', async () => {
      // Initialize defaults first
      await UserPreferencesModel.initializeDefaults(testUserId);
      
      const updated = await UserPreferencesModel.updateFields(testUserId, {
        theme: 'dark'
      });

      expect(updated?.theme).toBe('dark');
      expect(updated?.language).toBe('cs-CZ'); // Should remain unchanged
    });
  });

  describe('Enhanced User Management', () => {
    test('should get detailed user profile', async () => {
      // Add some activity data
      await UserActivityModel.logActivity({
        user_id: testUserId,
        activity_type: 'login',
        activity_data: {},
        ip_address: '192.168.1.1'
      });

      const response = await request(app)
        .get(`/admin/users/${testUserId}/profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUserId);
      expect(response.body.data.email).toBe('testuser@test.com');
      expect(response.body.data.activity_stats).toBeDefined();
      expect(response.body.data.recent_activities).toBeDefined();
    });

    test('should perform advanced user search', async () => {
      const response = await request(app)
        .get('/admin/users/search/advanced')
        .query({
          role: 'teacher',
          limit: 10,
          offset: 0
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeDefined();
      expect(response.body.data.total).toBeGreaterThan(0);
    });

    test('should update user status', async () => {
      const response = await request(app)
        .put(`/admin/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'suspended',
          reason: 'Test suspension'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('suspended');
    });

    test('should get user analytics', async () => {
      const response = await request(app)
        .get('/admin/users/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user_analytics).toBeDefined();
      expect(response.body.data.activity_summary).toBeDefined();
      expect(response.body.data.notification_stats).toBeDefined();
    });
  });

  describe('Data Validation and Security', () => {
    test('should accept valid activity types including login_failed', async () => {
      const result = await UserActivityModel.logActivity({
        user_id: testUserId,
        activity_type: 'login_failed',
        activity_data: { reason: 'invalid_password' },
        ip_address: '192.168.1.1'
      });
      
      expect(result).toBeDefined();
      expect(result.activity_type).toBe('login_failed');
    });

    test('should reject invalid activity type', async () => {
      await expect(
        UserActivityModel.logActivity({
          user_id: testUserId,
          activity_type: 'invalid_type' as any,
          activity_data: {},
          ip_address: '192.168.1.1'
        })
      ).rejects.toThrow();
    });

    test('should reject invalid notification type', async () => {
      const response = await request(app)
        .post(`/admin/users/${testUserId}/send-notification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          notification_type: 'invalid_type',
          title: 'Test',
          message: 'Test message'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid user status', async () => {
      const response = await request(app)
        .put(`/admin/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'invalid_status'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid status');
    });

    test('should require admin role for all endpoints', async () => {
      // Create regular user token
      const regularToken = jwt.sign(
        { userId: testUserId, role: 'teacher_school' },
        process.env['JWT_SECRET'] || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get(`/admin/users/${testUserId}/activity`)
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance and Pagination', () => {
    test('should handle pagination for activity logs', async () => {
      // Create multiple activities
      for (let i = 0; i < 25; i++) {
        await UserActivityModel.logActivity({
          user_id: testUserId,
          activity_type: 'page_view',
          activity_data: { page: `/page-${i}` },
          ip_address: '192.168.1.1'
        });
      }

      // Test first page
      const page1 = await request(app)
        .get(`/admin/users/${testUserId}/activity`)
        .query({ limit: 10, offset: 0 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(page1.body.data.activities).toHaveLength(10);
      expect(page1.body.data.total).toBe(25);

      // Test second page
      const page2 = await request(app)
        .get(`/admin/users/${testUserId}/activity`)
        .query({ limit: 10, offset: 10 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(page2.body.data.activities).toHaveLength(10);
      expect(page2.body.data.total).toBe(25);
    });

    test('should limit maximum page size', async () => {
      const response = await request(app)
        .get(`/admin/users/${testUserId}/activity`)
        .query({ limit: 1000 }) // Should be capped
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Implementation should cap the limit to a reasonable maximum
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent user activity request', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/admin/users/${fakeUserId}/activity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activities).toHaveLength(0);
      expect(response.body.data.total).toBe(0);
    });

    test('should handle non-existent user profile request', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/admin/users/${fakeUserId}/profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User not found');
    });

    test('should handle malformed request data', async () => {
      const response = await request(app)
        .post(`/admin/users/${testUserId}/send-notification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // Missing required fields
          title: 'Test'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });
});
