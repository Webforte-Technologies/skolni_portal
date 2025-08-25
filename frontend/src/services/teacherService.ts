import { api } from './apiClient';
import { ApiResponse } from '../types';

// Teacher-specific types based on backend implementation
export interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance: number;
  is_active: boolean;
  email_verified: boolean;
  status: 'active' | 'suspended' | 'pending_verification' | 'inactive';
  last_login_at?: string;
  last_activity_at?: string;
  login_count: number;
  created_at: string;
  updated_at: string;
  // Additional fields from findTeachersWithSchools
  school_name?: string;
  school_city?: string;
}

export interface TeacherProfile extends Teacher {
  school_info?: {
    id: string;
    name: string;
    city?: string;
    address?: string;
  };
  usage_statistics: {
    total_logins: number;
    last_login?: string;
    total_activities: number;
    credits_used: number;
    credits_purchased: number;
    conversations_count: number;
    files_generated: number;
    average_session_duration: number;
    most_active_hours: number[];
    last_activity?: string;
  };
  recent_activities: TeacherActivity[];
  unread_notifications_count: number;
}

export interface TeacherActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
}

export interface TeacherActivityResponse {
  activities: TeacherActivity[];
  total: number;
  activity_stats: {
    total_activities: number;
    activities_by_type: Record<string, number>;
    most_active_hours: number[];
    last_activity?: string;
    first_activity?: string;
  };
  activity_trends: Array<{
    date: string;
    activity_count: number;
    unique_activities: number;
    credits_used: number;
  }>;
  performance_metrics: {
    daily_average_activities: number;
    most_productive_day?: string;
    total_credits_used_period: number;
    activity_consistency: number;
  };
  filters: any;
}

export interface TeacherFilters {
  limit?: number;
  offset?: number;
  school_id?: string;
  is_active?: boolean;
  status?: string;
  role?: 'teacher_school' | 'teacher_individual';
  q?: string;
  date_range_start?: string;
  date_range_end?: string;
  credit_range_min?: number;
  credit_range_max?: number;
  last_activity_start?: string;
  last_activity_end?: string;
  verification_status?: 'verified' | 'unverified';
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

export interface CreateTeacherRequest {
  email: string;
  first_name: string;
  last_name: string;
  role?: 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance?: number;
  is_active?: boolean;
}

export interface UpdateTeacherRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance?: number;
  is_active?: boolean;
  status?: 'active' | 'suspended' | 'pending_verification' | 'inactive';
}

export interface BulkTeacherOperation {
  action: 'activate' | 'deactivate' | 'addCredits' | 'deductCredits' | 'assignToSchool' | 'removeFromSchool' | 'delete';
  teacher_ids: string[];
  amount?: number;
  school_id?: string;
}

export interface SendNotificationRequest {
  title: string;
  message: string;
  notification_type?: string;
  priority?: 'low' | 'normal' | 'high';
  expires_at?: string;
}

export interface UpdateStatusRequest {
  status: 'active' | 'suspended' | 'pending_verification' | 'inactive';
  reason?: string;
  expires_at?: string;
}

export interface TeacherListResponse {
  data: Teacher[];
  total: number;
  limit: number;
  offset: number;
}

export interface BulkOperationResponse {
  processed: number;
}

class TeacherService {
  private readonly baseUrl = '/admin/teachers';

  /**
   * Get list of teachers with optional filters
   */
  async getTeachers(filters: TeacherFilters = {}): Promise<TeacherListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<TeacherListResponse>(`${this.baseUrl}?${params.toString()}`);
    return response.data.data!;
  }

  /**
   * Get teacher by ID
   */
  async getTeacher(id: string): Promise<Teacher> {
    const response = await api.get<Teacher>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * Get detailed teacher profile with usage statistics
   */
  async getTeacherProfile(id: string): Promise<TeacherProfile> {
    const response = await api.get<TeacherProfile>(`${this.baseUrl}/${id}/profile`);
    return response.data.data!;
  }

  /**
   * Get teacher activity logs and analytics
   */
  async getTeacherActivity(
    id: string, 
    filters: {
      limit?: number;
      offset?: number;
      activity_type?: string;
      start_date?: string;
      end_date?: string;
      time_range?: '7d' | '30d' | '90d';
    } = {}
  ): Promise<TeacherActivityResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get<TeacherActivityResponse>(`${this.baseUrl}/${id}/activity?${params.toString()}`);
    return response.data.data!;
  }

  /**
   * Create new teacher
   */
  async createTeacher(teacherData: CreateTeacherRequest): Promise<Teacher> {
    const response = await api.post<Teacher>(this.baseUrl, teacherData);
    return response.data.data!;
  }

  /**
   * Update teacher
   */
  async updateTeacher(id: string, updateData: UpdateTeacherRequest): Promise<Teacher> {
    const response = await api.put<Teacher>(`${this.baseUrl}/${id}`, updateData);
    return response.data.data!;
  }

  /**
   * Delete teacher (soft delete)
   */
  async deleteTeacher(id: string): Promise<{ deleted: boolean; message: string }> {
    const response = await api.delete<{ deleted: boolean; message: string }>(`${this.baseUrl}/${id}`);
    return response.data.data!;
  }

  /**
   * Assign teacher to school
   */
  async assignToSchool(id: string, schoolId: string): Promise<Teacher> {
    const response = await api.post<Teacher>(`${this.baseUrl}/${id}/assign-school`, { school_id: schoolId });
    return response.data.data!;
  }

  /**
   * Remove teacher from school
   */
  async removeFromSchool(id: string): Promise<Teacher> {
    const response = await api.delete<Teacher>(`${this.baseUrl}/${id}/unassign-school`);
    return response.data.data!;
  }

  /**
   * Perform bulk operations on teachers
   */
  async bulkOperation(operation: BulkTeacherOperation): Promise<BulkOperationResponse> {
    const response = await api.post<BulkOperationResponse>(`${this.baseUrl}/bulk`, operation);
    return response.data.data!;
  }

  /**
   * Send notification to teacher
   */
  async sendNotification(id: string, notification: SendNotificationRequest): Promise<any> {
    const response = await api.post(`${this.baseUrl}/${id}/send-notification`, notification);
    return response.data.data!;
  }

  /**
   * Update teacher status
   */
  async updateStatus(id: string, statusUpdate: UpdateStatusRequest): Promise<{
    teacher: Teacher;
    message: string;
    status_change: {
      from: string;
      to: string;
      reason?: string;
      changed_by?: string;
      changed_at: string;
    };
  }> {
    const response = await api.put(`${this.baseUrl}/${id}/status`, statusUpdate);
    return response.data.data!;
  }

  /**
   * Get teacher statistics for dashboard with optional filters
   */
  async getTeacherStats(filters: Omit<TeacherFilters, 'limit' | 'offset'> = {}): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    inactive: number;
    individual: number;
    school: number;
    unverified: number;
    active_accounts: number;
    avg_credits: number;
    total_credits: number;
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await api.get(`${this.baseUrl}/stats?${params.toString()}`);
    return response.data;
  }

  /**
   * Search teachers with advanced filters
   */
  async searchTeachers(searchTerm: string, filters: TeacherFilters = {}): Promise<TeacherListResponse> {
    return this.getTeachers({
      ...filters,
      q: searchTerm,
    });
  }

  /**
   * Get teachers by school
   */
  async getTeachersBySchool(schoolId: string, filters: Omit<TeacherFilters, 'school_id'> = {}): Promise<TeacherListResponse> {
    return this.getTeachers({
      ...filters,
      school_id: schoolId,
    });
  }

  /**
   * Get pending teachers (awaiting verification)
   */
  async getPendingTeachers(filters: Omit<TeacherFilters, 'status'> = {}): Promise<TeacherListResponse> {
    return this.getTeachers({
      ...filters,
      status: 'pending_verification',
    });
  }

  /**
   * Activate multiple teachers
   */
  async activateTeachers(teacherIds: string[]): Promise<BulkOperationResponse> {
    return this.bulkOperation({
      action: 'activate',
      teacher_ids: teacherIds,
    });
  }

  /**
   * Deactivate multiple teachers
   */
  async deactivateTeachers(teacherIds: string[]): Promise<BulkOperationResponse> {
    return this.bulkOperation({
      action: 'deactivate',
      teacher_ids: teacherIds,
    });
  }

  /**
   * Add credits to multiple teachers
   */
  async addCreditsToTeachers(teacherIds: string[], amount: number): Promise<BulkOperationResponse> {
    return this.bulkOperation({
      action: 'addCredits',
      teacher_ids: teacherIds,
      amount,
    });
  }

  /**
   * Assign multiple teachers to school
   */
  async assignTeachersToSchool(teacherIds: string[], schoolId: string): Promise<BulkOperationResponse> {
    return this.bulkOperation({
      action: 'assignToSchool',
      teacher_ids: teacherIds,
      school_id: schoolId,
    });
  }
}

export const teacherService = new TeacherService();
export default teacherService;
