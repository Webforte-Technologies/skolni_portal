// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
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
  role?: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
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
  mathTopic?: MathTopic;
  difficulty?: MathDifficulty;
  practiceMode?: boolean;
}

// Math Assistant Types for Phase 13.1
export type MathTopic = 
  | 'basic_math' 
  | 'algebra' 
  | 'geometry' 
  | 'calculus' 
  | 'statistics' 
  | 'discrete_math'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'history'
  | 'czech_language'
  | 'other';

export type MathDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface MathTopicInfo {
  id: MathTopic;
  name: string;
  description: string;
  icon: string;
  color: string;
  examples: string[];
}

export interface PracticeProblem {
  id: string;
  problem: string;
  answer: string;
  solution: string;
  topic: MathTopic;
  difficulty: MathDifficulty;
  hints: string[];
}

export interface PracticeSession {
  id: string;
  topic: MathTopic;
  difficulty: MathDifficulty;
  problems: PracticeProblem[];
  currentProblemIndex: number;
  score: number;
  totalProblems: number;
  startedAt: string;
  completedAt?: string;
}

export interface MathProgress {
  userId: string;
  topic: MathTopic;
  difficulty: MathDifficulty;
  problemsAttempted: number;
  problemsCorrect: number;
  averageTime: number;
  lastPracticed: string;
  masteryLevel: number; // 0-100
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
  folder_id?: string;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  school_id?: string;
  name: string;
  description?: string;
  parent_folder_id?: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface SharedMaterial {
  id: string;
  material_id: string;
  shared_by_user_id: string;
  school_id: string;
  folder_id?: string;
  is_public: boolean;
  shared_at: string;
  title?: string;
  content?: any;
  file_type?: string;
  material_created_at?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  folder_name?: string;
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
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  className?: string;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  helpText?: string;
  mobileLayout?: 'stacked' | 'inline';
  touchOptimized?: boolean;
  preventZoom?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

// Responsive Design Types
export interface ViewportState {
  width: number;
  height: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  touchTargetSize: number;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  gestures: {
    swipeThreshold: number;
    tapTimeout: number;
  };
}

export interface ResponsiveComponentState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  menuOpen: boolean;
  keyboardVisible: boolean;
} 