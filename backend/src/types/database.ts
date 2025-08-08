// Database entity types for EduAI-Asistent

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance: number;
  is_active: boolean;
  email_verified: boolean;
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
  created_at: Date;
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
}

// Request/Response types for API
export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  school_id?: string;
  role?: 'school_admin' | 'teacher_school' | 'teacher_individual';
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