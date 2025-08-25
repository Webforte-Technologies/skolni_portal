import { APIRequestContext } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance?: number;
}

export class TestDataSetup {
  private apiContext: APIRequestContext;
  private baseURL: string;

  constructor(apiContext: APIRequestContext, baseURL: string = 'http://localhost:3001') {
    this.apiContext = apiContext;
    this.baseURL = baseURL;
  }

  async createTestUser(userData: TestUser): Promise<{ id: string; token: string }> {
    try {
      // For platform_admin users, we need to create them differently
      if (userData.role === 'platform_admin') {
        // First create a regular user
        const createResponse = await this.apiContext.post(`${this.baseURL}/api/auth/register`, {
          data: {
            email: userData.email,
            password: userData.password,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: 'teacher_individual', // Start with regular role
            credits_balance: userData.credits_balance || 1000
          }
        });

        if (createResponse.ok()) {
          const createData = await createResponse.json();
          const userId = createData.data.user.id;
          
          // Now promote to platform_admin using direct database update
          // This bypasses the need for admin authentication
          await this.apiContext.post(`${this.baseURL}/api/admin/users/${userId}/promote`, {
            data: { role: 'platform_admin' }
          });
          
          return {
            id: userId,
            token: createData.data.token
          };
        }
      } else {
        // For regular users, use normal registration
        const createResponse = await this.apiContext.post(`${this.baseURL}/api/auth/register`, {
          data: {
            email: userData.email,
            password: userData.password,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
            school_id: userData.school_id,
            credits_balance: userData.credits_balance || 1000
          }
        });

        if (createResponse.ok()) {
          const createData = await createResponse.json();
          return {
            id: createData.data.user.id,
            token: createData.data.token
          };
        }
      }

      // If creation failed, try to login to get the token
      const loginResponse = await this.apiContext.post(`${this.baseURL}/api/auth/login`, {
        data: {
          email: userData.email,
          password: userData.password
        }
      });

      if (loginResponse.ok()) {
        const loginData = await loginResponse.json();
        return {
          id: loginData.data.user.id,
          token: loginData.data.token
        };
      }

      throw new Error(`Failed to create or login test user: ${userData.email}`);
    } catch (error) {
      console.error(`Error setting up test user ${userData.email}:`, error);
      throw error;
    }
  }

  async cleanupTestUser(email: string): Promise<void> {
    try {
      // Try to delete the test user
      await this.apiContext.delete(`${this.baseURL}/api/admin/users/${email}`);
    } catch (error) {
      // Ignore cleanup errors
      console.warn(`Warning: Could not cleanup test user ${email}:`, error);
    }
  }

  async setupAdminUser(): Promise<{ id: string; token: string }> {
    const adminUser: TestUser = {
      email: 'admin@eduai.cz',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'school_admin', // Use the actual role from the database
      credits_balance: 10000
    };

    return this.createTestUser(adminUser);
  }

  async setupTestUsers(): Promise<{
    admin: { id: string; token: string };
    teacher: { id: string; token: string };
  }> {
    const admin = await this.setupAdminUser();
    
    const teacherUser: TestUser = {
      email: 'teacher@eduai.cz',
      password: 'teacher123',
      first_name: 'Jan',
      last_name: 'Novák',
      role: 'teacher_school', // Use the actual role from the database
      credits_balance: 500
    };

    const teacher = await this.createTestUser(teacherUser);

    return { admin, teacher };
  }
}
