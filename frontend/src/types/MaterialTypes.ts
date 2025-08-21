// Enhanced Material Generation Types

export interface AssignmentAnalysis {
  suggestedMaterialTypes: MaterialType[];
  extractedObjectives: string[];
  detectedDifficulty: string;
  subjectArea: string;
  estimatedDuration: string;
  keyTopics: string[];
  confidence: number;
}

export interface MaterialSubtype {
  id: string;
  name: string;
  description: string;
  parentType: MaterialType;
  specialFields: TemplateField[];
  promptModifications: string[];
  examples?: string[];
}

export interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'boolean';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export type MaterialType = 'worksheet' | 'lesson-plan' | 'quiz' | 'project' | 'presentation' | 'activity';

export interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  subject: string;
  difficulty: string;
  gradeLevel: string;
  estimatedTime: string;
  fields: TemplateField[];
  color?: string;
  subtypes?: MaterialSubtype[];
}

export interface EnhancedMaterialCreatorProps {
  assignmentMode?: boolean;
  batchMode?: boolean;
  onAssignmentAnalysis?: (analysis: AssignmentAnalysis) => void;
  onSubtypeSelect?: (subtype: MaterialSubtype) => void;
}

export interface AssignmentAnalysisRequest {
  description: string;
}

export interface AssignmentAnalysisResponse {
  analysis: AssignmentAnalysis;
  suggestions: MaterialTypeSuggestion[];
}

export interface MaterialTypeSuggestion {
  materialType: MaterialType;
  confidence: number;
  reasoning: string;
  recommendedSubtype?: string;
}

export interface QualityLevel {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface GenerationParameters {
  materialType: MaterialType;
  subtype?: MaterialSubtype;
  assignment?: AssignmentAnalysis;
  userInputs: Record<string, any>;
  qualityLevel?: QualityLevel;
  customInstructions?: string;
}

// Subtype definitions for each material type
export interface WorksheetSubtype extends MaterialSubtype {
  parentType: 'worksheet';
}

export interface QuizSubtype extends MaterialSubtype {
  parentType: 'quiz';
}

export interface LessonPlanSubtype extends MaterialSubtype {
  parentType: 'lesson-plan';
}

export interface ProjectSubtype extends MaterialSubtype {
  parentType: 'project';
}

export interface PresentationSubtype extends MaterialSubtype {
  parentType: 'presentation';
}

export interface ActivitySubtype extends MaterialSubtype {
  parentType: 'activity';
}