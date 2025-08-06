// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  school_id?: string;
  credits_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  created_at: string;
}

export interface UserWithSchool extends User {
  school?: School;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  school_id?: string;
}

export interface AuthResponse {
  user: UserWithSchool;
  token: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any[];
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  session_id?: string;
}

// Phase 8: Conversation History Types
export interface Conversation {
  id: string;
  user_id: string;
  assistant_type: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface GeneratedFile {
  id: string;
  user_id: string;
  title: string;
  content: any; // JSONB content
  file_type: string;
  created_at: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  credits_used: number;
  credits_balance: number;
  session_id?: string;
}

// Credit types
export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'deduction';
  description: string;
  created_at: string;
}

// AI Assistant types
export interface AIFeature {
  id: string;
  name: string;
  description: string;
  credits_per_use: number;
  available: boolean;
}

export interface AIStats {
  total_messages: number;
  total_credits_purchased: number;
  current_balance: number;
  average_cost_per_message: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  placeholder?: string;
  validation?: any;
}

// Component props
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
} 