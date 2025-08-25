/**
 * Data transformation utilities to handle inconsistencies between frontend and backend
 * Standardizes field naming conventions and data formats
 */

// Type definitions for consistent data structures
export interface StandardUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  isActive: boolean;
  status: string;
  schoolId?: string;
  schoolName?: string;
  creditsBalance: number;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastActivityAt?: string;
  emailVerified?: boolean;
}

export interface BackendUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  status: string;
  school_id?: string;
  school_name?: string;
  credits_balance: number;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
  last_activity_at?: string;
  email_verified?: boolean;
}

/**
 * Converts snake_case keys to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts camelCase keys to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively converts object keys from snake_case to camelCase
 */
export function keysToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const camelCaseObj: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key);
      camelCaseObj[camelKey] = keysToCamelCase(value);
    }
    
    return camelCaseObj;
  }

  return obj;
}

/**
 * Recursively converts object keys from camelCase to snake_case
 */
export function keysToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase) as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const snakeCaseObj: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = toSnakeCase(key);
      snakeCaseObj[snakeKey] = keysToSnakeCase(value);
    }
    
    return snakeCaseObj;
  }

  return obj;
}

/**
 * Transforms backend user data to frontend format
 */
export function transformUserFromBackend(backendUser: BackendUser): StandardUser {
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    role: backendUser.role as StandardUser['role'],
    isActive: backendUser.is_active,
    status: backendUser.status,
    schoolId: backendUser.school_id,
    schoolName: backendUser.school_name,
    creditsBalance: backendUser.credits_balance,
    createdAt: backendUser.created_at,
    updatedAt: backendUser.updated_at,
    lastLoginAt: backendUser.last_login_at,
    lastActivityAt: backendUser.last_activity_at,
    emailVerified: backendUser.email_verified
  };
}

/**
 * Transforms frontend user data to backend format
 */
export function transformUserToBackend(frontendUser: Partial<StandardUser>): Partial<BackendUser> {
  const backendUser: Partial<BackendUser> = {};

  if (frontendUser.id) backendUser.id = frontendUser.id;
  if (frontendUser.email) backendUser.email = frontendUser.email;
  if (frontendUser.firstName) backendUser.first_name = frontendUser.firstName;
  if (frontendUser.lastName) backendUser.last_name = frontendUser.lastName;
  if (frontendUser.role) backendUser.role = frontendUser.role;
  if (frontendUser.isActive !== undefined) backendUser.is_active = frontendUser.isActive;
  if (frontendUser.status) backendUser.status = frontendUser.status;
  if (frontendUser.schoolId) backendUser.school_id = frontendUser.schoolId;
  if (frontendUser.creditsBalance !== undefined) backendUser.credits_balance = frontendUser.creditsBalance;
  if (frontendUser.emailVerified !== undefined) backendUser.email_verified = frontendUser.emailVerified;

  return backendUser;
}

/**
 * Transforms array of backend users to frontend format
 */
export function transformUsersFromBackend(backendUsers: BackendUser[]): StandardUser[] {
  return backendUsers.map(transformUserFromBackend);
}

/**
 * Validates that required user fields are present
 */
export function validateUser(user: any): user is StandardUser {
  return (
    user &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.firstName === 'string' &&
    typeof user.lastName === 'string' &&
    typeof user.role === 'string' &&
    typeof user.isActive === 'boolean' &&
    typeof user.creditsBalance === 'number'
  );
}

/**
 * Safely extracts user data from API response
 */
export function extractUserFromResponse(response: any): StandardUser | null {
  try {
    const userData = response?.data?.data || response?.data;
    
    if (!userData) {
      return null;
    }

    // If data is already in camelCase format, validate and return
    if (validateUser(userData)) {
      return userData;
    }

    // If data is in snake_case format, transform it
    if (userData.first_name && userData.last_name) {
      return transformUserFromBackend(userData as BackendUser);
    }

    return null;
  } catch (error) {
    console.error('Error extracting user from response:', error);
    return null;
  }
}

/**
 * Safely extracts users array from API response
 */
export function extractUsersFromResponse(response: any): StandardUser[] {
  try {
    const usersData = response?.data?.data?.data || response?.data?.data || response?.data;
    
    if (!Array.isArray(usersData)) {
      return [];
    }

    return usersData.map((user: any) => {
      // If user is already in camelCase format
      if (validateUser(user)) {
        return user;
      }

      // If user is in snake_case format, transform it
      if (user.first_name && user.last_name) {
        return transformUserFromBackend(user as BackendUser);
      }

      // Fallback: try to transform keys automatically
      return keysToCamelCase<StandardUser>(user);
    }).filter(validateUser);
  } catch (error) {
    console.error('Error extracting users from response:', error);
    return [];
  }
}

/**
 * Formats date strings consistently
 */
export function formatDate(dateString: string | undefined, locale: string = 'cs-CZ'): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Formats date and time strings consistently
 */
export function formatDateTime(dateString: string | undefined, locale: string = 'cs-CZ'): string {
  if (!dateString) {
    return 'N/A';
  }

  try {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateString;
  }
}

/**
 * Gets user role label in Czech
 */
export function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    'platform_admin': 'Platform Admin',
    'school_admin': 'Správce školy',
    'teacher_school': 'Učitel školy',
    'teacher_individual': 'Individuální učitel'
  };
  
  return roleLabels[role] || role;
}

/**
 * Gets user status label in Czech
 */
export function getStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    'active': 'Aktivní',
    'inactive': 'Neaktivní',
    'suspended': 'Pozastaveno',
    'pending_verification': 'Čeká na ověření',
    'pending': 'Čeká na ověření'
  };
  
  return statusLabels[status] || status;
}
