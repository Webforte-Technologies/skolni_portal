// Database entity types for EduAI-Asistent

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance: number;
  is_active: boolean;
  email_verified: boolean;
  status: 'active' | 'suspended' | 'pending_verification' | 'inactive';
  last_login_at?: Date;
  last_activity_at?: Date;
  login_count: number;
  failed_login_attempts: number;
  locked_until?: Date;
  email_verification_token?: string;
  email_verification_expires_at?: Date;
  password_reset_token?: string;
  password_reset_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  credits_per_month: number;
  price_per_month: number;
  start_date: Date;
  end_date?: Date;
  auto_renew: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'bonus';
  amount: number;
  balance_before: number;
  balance_after: number;
  description?: string;
  related_subscription_id?: string;
  created_at: Date;
}

export interface ChatSession {
  id: string;
  user_id: string;
  session_name?: string;
  total_messages: number;
  credits_used: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  message_type: 'user' | 'assistant';
  content: string;
  credits_cost: number;
  created_at: Date;
}

// Phase 8: Conversation History & Advanced File Generation Types
export interface Conversation {
  id: string;
  user_id: string;
  assistant_type: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

export interface GeneratedFile {
  id: string;
  user_id: string;
  title: string;
  content: any; // JSONB content
  file_type: string;
  folder_id?: string;
  created_at: Date;
}

export interface Folder {
  id: string;
  user_id: string;
  school_id?: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  is_shared: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SharedMaterial {
  id: string;
  material_id: string;
  shared_by_user_id: string;
  school_id: string;
  folder_id?: string;
  is_public: boolean;
  shared_at: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface CreateConversationRequest {
  user_id: string;
  assistant_type?: string;
  title: string;
}

export interface CreateMessageRequest {
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface CreateGeneratedFileRequest {
  user_id: string;
  title: string;
  content: any;
  file_type?: string;
  folder_id?: string;
}

export interface CreateFolderRequest {
  user_id: string;
  school_id?: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  is_shared?: boolean;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  parent_folder_id?: string;
  is_shared?: boolean;
}

export interface ShareMaterialRequest {
  material_id: string;
  school_id: string;
  folder_id?: string;
  is_public?: boolean;
}

// Request/Response types for API
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  school_id?: string;
  role?: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}

export interface CreateSchoolRequest {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface CreateSubscriptionRequest {
  user_id: string;
  plan_type: 'basic' | 'premium' | 'enterprise';
  credits_per_month: number;
  price_per_month: number;
  start_date: string;
  auto_renew?: boolean;
}

export interface CreateChatSessionRequest {
  user_id: string;
  session_name?: string;
}

export interface CreateChatMessageRequest {
  session_id: string;
  content: string;
  message_type: 'user' | 'assistant';
  credits_cost?: number;
}

// Admin-specific request types
export interface AdminCreateUserRequest extends Omit<CreateUserRequest, 'password'> {
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance?: number;
  is_active?: boolean;
}

export interface AdminUpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  is_active?: boolean;
  credits_balance?: number;
  status?: 'active' | 'suspended' | 'pending_verification' | 'inactive';
}

export interface AdminCreateSchoolRequest {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface AdminUpdateSchoolRequest extends Partial<AdminCreateSchoolRequest> {
  is_active?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Enhanced User CRUD Operations Types

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: 'login' | 'login_failed' | 'logout' | 'page_view' | 'api_call' | 'file_generated' | 
                 'conversation_started' | 'credits_used' | 'profile_updated' | 
                 'password_changed' | 'email_verified' | 'subscription_changed';
  activity_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  created_at: Date;
  // Additional fields from JOIN with users table
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  school_name?: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  notification_type: 'system' | 'admin_message' | 'credit_alert' | 'subscription_expiry' | 
                     'feature_update' | 'maintenance' | 'security_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  read_at?: Date;
  expires_at?: Date;
  action_url?: string;
  action_text?: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  email_notifications: {
    marketing: boolean;
    updates: boolean;
    security: boolean;
  };
  push_notifications: {
    enabled: boolean;
    sound: boolean;
  };
  dashboard_layout: Record<string, any>;
  ai_assistant_preferences: Record<string, any>;
  accessibility_settings: {
    high_contrast: boolean;
    font_size: 'small' | 'medium' | 'large';
  };
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile extends Omit<User, 'password_hash'> {
  school_name?: string;
  school_city?: string;
  activity_stats: {
    total_logins: number;
    last_login: Date;
    total_activities: number;
    credits_used: number;
    conversations_count: number;
    files_generated: number;
  };
  preferences?: UserPreferences;
  recent_activities: UserActivityLog[];
  unread_notifications_count: number;
}

export interface AdvancedUserFilters {
  role?: string;
  school_id?: string;
  is_active?: boolean;
  status?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  credit_range?: {
    min: number;
    max: number;
  };
  last_login_range?: {
    start_date: string;
    end_date: string;
  };
  search?: string;
  activity_type?: string;
}

export interface UserImportData {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  school_id?: string;
  credits_balance?: number;
  is_active?: boolean;
}

export interface UserExportOptions {
  format: 'csv' | 'excel';
  filters?: AdvancedUserFilters;
  include_activity?: boolean;
  include_preferences?: boolean;
  include_notifications?: boolean;
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  users_by_role: Record<string, number>;
  users_by_status: Record<string, number>;
  average_credits_balance: number;
  top_credit_users: Array<{
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    credits_balance: number;
  }>;
  recent_activity_summary: {
    logins_today: number;
    logins_this_week: number;
    logins_this_month: number;
  };
}

export interface CreateUserNotificationRequest {
  user_id: string;
  notification_type: UserNotification['notification_type'];
  title: string;
  message: string;
  severity?: UserNotification['severity'];
  expires_at?: string;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
}

export interface UpdateUserStatusRequest {
  status: User['status'];
  reason?: string;
  expires_at?: string;
}

export interface UserActivityStats {
  user_id: string;
  total_activities: number;
  activities_by_type: Record<string, number>;
  last_activity: Date;
  most_active_hours: number[];
  average_daily_activities: number;
} 