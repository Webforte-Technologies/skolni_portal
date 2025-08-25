// Centralized status validation utility
// Provides consistent status transition rules across the application

export type SchoolStatus = 'active' | 'suspended' | 'pending_verification' | 'inactive';

export interface StatusTransitionRules {
  [status: string]: SchoolStatus[];
}

// Define valid status transitions
export const SCHOOL_STATUS_TRANSITIONS: StatusTransitionRules = {
  'active': ['suspended', 'inactive', 'pending_verification'],
  'suspended': ['active', 'inactive'],
  'pending_verification': ['active', 'inactive'],
  'inactive': ['active', 'pending_verification']
};

/**
 * Validates if a status transition is allowed
 * @param currentStatus - The current status
 * @param newStatus - The desired new status
 * @returns boolean indicating if transition is valid
 */
export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const allowedTransitions = SCHOOL_STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions ? allowedTransitions.includes(newStatus as SchoolStatus) : false;
}

/**
 * Gets all valid transitions from a given status
 * @param currentStatus - The current status
 * @returns Array of valid status transitions
 */
export function getValidTransitions(currentStatus: string): SchoolStatus[] {
  return SCHOOL_STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Gets human-readable status labels in Czech
 * @param status - The status to get label for
 * @returns Czech label for the status
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'active': 'Aktivní',
    'suspended': 'Pozastavené',
    'pending_verification': 'Čekající na ověření',
    'inactive': 'Neaktivní'
  };
  
  return labels[status] || status;
}

/**
 * Gets status description in Czech
 * @param status - The status to get description for
 * @returns Czech description for the status
 */
export function getStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'active': 'Škola je plně funkční a může používat všechny služby',
    'suspended': 'Škola je dočasně pozastavena, uživatelé nemohou přistupovat k službám',
    'pending_verification': 'Škola čeká na ověření dokumentů nebo informací',
    'inactive': 'Škola je neaktivní, ale data jsou zachována'
  };
  
  return descriptions[status] || 'Neznámý stav';
}

/**
 * Validates status transition with detailed error messages
 * @param currentStatus - The current status
 * @param newStatus - The desired new status
 * @returns Object with validation result and error message if invalid
 */
export function validateStatusTransition(currentStatus: string, newStatus: string): {
  isValid: boolean;
  error?: string;
} {
  if (!currentStatus || !newStatus) {
    return {
      isValid: false,
      error: 'Aktuální i nový stav musí být definován'
    };
  }

  if (currentStatus === newStatus) {
    return {
      isValid: false,
      error: 'Nový stav musí být odlišný od aktuálního stavu'
    };
  }

  if (!Object.keys(SCHOOL_STATUS_TRANSITIONS).includes(currentStatus)) {
    return {
      isValid: false,
      error: `Neplatný aktuální stav: ${currentStatus}`
    };
  }

  if (!isValidStatusTransition(currentStatus, newStatus)) {
    const validTransitions = getValidTransitions(currentStatus);
    const validLabels = validTransitions.map(getStatusLabel).join(', ');
    return {
      isValid: false,
      error: `Neplatný přechod z '${getStatusLabel(currentStatus)}' na '${getStatusLabel(newStatus)}'. Platné přechody: ${validLabels}`
    };
  }

  return { isValid: true };
}
