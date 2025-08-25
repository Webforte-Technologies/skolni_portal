// TypeScript types and validation schemas for AI generators

export interface WorksheetQuestion {
  problem: string;
  answer: string;
}

export interface WorksheetData {
  title: string;
  instructions: string;
  questions: WorksheetQuestion[];
  subject?: string;
  grade_level?: string;
  tags?: string[];
}

export interface LessonPlanActivity {
  name: string;
  description: string;
  steps: string[];
  time: string; // e.g., "10 min"
}

export interface LessonPlanData {
  title: string;
  subject: string;
  grade_level: string;
  duration: string; // e.g., "45 min"
  objectives: string[];
  materials: string[];
  activities: LessonPlanActivity[];
  differentiation: string;
  homework: string;
  assessment: string;
  tags?: string[];
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[]; // for multiple_choice
  answer: string | boolean; // string for multiple_choice/short_answer, boolean for true_false
}

export interface QuizData {
  title: string;
  subject: string;
  grade_level: string;
  time_limit: string | number; // e.g., "20 min", "Bez limitu", or number of minutes
  questions: QuizQuestion[];
  tags?: string[];
}

export interface ProjectRubricCriteria {
  name: string;
  weight: number;
  levels: string[];
  descriptors: string[];
}

export interface ProjectRubric {
  criteria: ProjectRubricCriteria[];
}

export interface ProjectTimelineMilestone {
  week?: number;
  task: string;
  description?: string;
}

export interface ProjectTimeline {
  milestones: ProjectTimelineMilestone[];
}

export interface ProjectData {
  template: 'project';
  title: string;
  subject: string;
  grade_level: string;
  duration: string;
  project_type?: string;
  group_size?: number;
  objectives: string[];
  description: string;
  phases?: string[];
  deliverables: string[];
  rubric: ProjectRubric;
  timeline: ProjectTimeline;
  tags?: string[];
}

export interface PresentationSlide {
  heading: string;
  bullets: string[];
}

export interface PresentationData {
  template: 'presentation';
  title: string;
  subject: string;
  grade_level: string;
  slides: PresentationSlide[];
  tags?: string[];
}

export interface ActivityData {
  title: string;
  subject: string;
  grade_level: string;
  duration: string;
  goal: string;
  instructions: string[];
  materials: string[];
  variation: string;
  tags?: string[];
}

// SSE Message types
export interface SSEStartMessage {
  type: 'start';
  message: string;
  [key: string]: any; // Allow additional properties
}

export interface SSEChunkMessage {
  type: 'chunk';
  content: string;
}

export interface SSEEndMessage {
  type: 'end';
  file_id?: string;
  file_type?: string;
  credits_used: number;
  credits_balance: number;
  [key: string]: any; // For the actual generated content (worksheet, lesson_plan, etc.)
}

export interface SSEErrorMessage {
  type: 'error';
  message: string;
}

export interface SSEProgressMessage {
  type: 'progress';
  message: string;
  progress?: number;
  current_step?: number;
  total_steps?: number;
  phase?: string;
  current_material?: any;
  completed_material?: any;
}

export interface SSEConnectionMessage {
  type: 'connection';
  message: string;
}

export type SSEMessage = SSEStartMessage | SSEChunkMessage | SSEEndMessage | SSEErrorMessage | SSEProgressMessage | SSEConnectionMessage;

// Time parsing utilities
export const parseTimeToMinutes = (timeStr: string): number => {
  const match = /(\d+)\s*min/i.exec(timeStr);
  return match && match[1] ? parseInt(match[1], 10) : 0;
};

export const normalizeTimeLimit = (timeLimit: string | number): string | number => {
  if (typeof timeLimit === 'number') {
    return timeLimit;
  }
  
  const str = timeLimit.toLowerCase();
  if (str.includes('bez limitu') || str.includes('no limit') || str.includes('unlimited')) {
    return 'no_limit';
  }
  
  const minutes = parseTimeToMinutes(timeLimit);
  return minutes > 0 ? minutes : 'no_limit';
};

// Validation functions
export const validateWorksheet = (data: any): WorksheetData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid worksheet data: must be an object');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid worksheet.title: must be a non-empty string');
  }
  
  if (!data.instructions || typeof data.instructions !== 'string') {
    throw new Error('Invalid worksheet.instructions: must be a non-empty string');
  }
  
  if (!Array.isArray(data.questions) || data.questions.length < 1) {
    throw new Error('Invalid worksheet.questions: must be a non-empty array');
  }
  
  for (const [index, question] of data.questions.entries()) {
    if (!question || typeof question.problem !== 'string' || typeof question.answer !== 'string') {
      throw new Error(`Invalid worksheet question at index ${index}: must have problem and answer as strings`);
    }
  }
  
  return data as WorksheetData;
};

export const validateLessonPlan = (data: any): LessonPlanData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid lesson plan data: must be an object');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid lesson_plan.title: must be a non-empty string');
  }
  
  if (!Array.isArray(data.activities)) {
    throw new Error('Invalid lesson_plan.activities: must be an array');
  }
  
  for (const [index, activity] of data.activities.entries()) {
    if (!activity || typeof activity.name !== 'string' || typeof activity.time !== 'string') {
      throw new Error(`Invalid lesson plan activity at index ${index}: must have name and time as strings`);
    }
  }
  
  // Validate duration sum
  const durationStr: string = data.duration || '45 min';
  const targetMinutes = parseTimeToMinutes(durationStr);
  const sumMinutes = data.activities.reduce((sum: number, activity: any) => {
    return sum + parseTimeToMinutes(activity.time || '0');
  }, 0);
  
  if (sumMinutes !== targetMinutes) {
    throw new Error(`Duration mismatch: activities total ${sumMinutes} min != duration ${targetMinutes} min`);
  }
  
  return data as LessonPlanData;
};

export const validateQuiz = (data: any): QuizData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid quiz data: must be an object');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid quiz.title: must be a non-empty string');
  }
  
  if (data.time_limit === undefined || (typeof data.time_limit !== 'string' && typeof data.time_limit !== 'number')) {
    throw new Error('Invalid quiz.time_limit: must be a string or number');
  }
  
  if (!Array.isArray(data.questions) || data.questions.length < 1) {
    throw new Error('Invalid quiz.questions: must be a non-empty array');
  }
  
  for (const [index, question] of data.questions.entries()) {
    if (!question || typeof question.question !== 'string') {
      throw new Error(`Invalid quiz question at index ${index}: must have question as string`);
    }
    
    if (!question.type || typeof question.type !== 'string') {
      throw new Error(`Invalid quiz question type at index ${index}: must be a string`);
    }
    
    const type = question.type;
    
    // Debug: Log question details for troubleshooting
    console.log(`Validating question ${index}: type=${type}, answer=${JSON.stringify(question.answer)}`);
    if (type === 'multiple_choice') {
      if (!Array.isArray(question.options) || question.options.length < 2) {
        throw new Error(`Invalid quiz question options at index ${index}: must be array with at least 2 items`);
      }
      if (typeof question.answer !== 'string') {
        throw new Error(`Invalid quiz question answer at index ${index}: must be string for multiple choice`);
      }
      if (!question.options.includes(question.answer)) {
        throw new Error(`Invalid quiz question answer at index ${index}: answer must be one of the options`);
      }
    } else if (type === 'true_false') {
      // Handle boolean, English, and Czech representations of true/false
      if (typeof question.answer === 'string') {
        const lowerAnswer = question.answer.toLowerCase();
        // English representations
        if (lowerAnswer === 'true' || lowerAnswer === 'false') {
          question.answer = lowerAnswer === 'true';
        }
        // Czech representations
        else if (lowerAnswer === 'pravda' || lowerAnswer === 'ano' || lowerAnswer === 'správně' || lowerAnswer === 'správné' || lowerAnswer === 'platí') {
          question.answer = true;
        }
        else if (lowerAnswer === 'nepravda' || lowerAnswer === 'ne' || lowerAnswer === 'nesprávně' || lowerAnswer === 'nesprávné' || lowerAnswer === 'neplatí') {
          question.answer = false;
        }
        else {
          throw new Error(`Invalid quiz question answer at index ${index}: must be boolean, English 'true'/'false', or Czech 'pravda'/'nepravda' for true/false`);
        }
      } else if (typeof question.answer !== 'boolean') {
        throw new Error(`Invalid quiz question answer at index ${index}: must be boolean, English 'true'/'false', or Czech 'pravda'/'nepravda' for true/false`);
      }
    } else if (type === 'short_answer') {
      if (typeof question.answer !== 'string') {
        throw new Error(`Invalid quiz question answer at index ${index}: must be string for short answer`);
      }
    } else {
      throw new Error(`Invalid quiz question type at index ${index}: must be multiple_choice, true_false, or short_answer`);
    }
  }
  
  // Normalize time_limit
  data.time_limit = normalizeTimeLimit(data.time_limit);
  
  return data as QuizData;
};

export const validateProject = (data: any): ProjectData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid project data: must be an object');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid project.title: must be a non-empty string');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    throw new Error('Invalid project.description: must be a non-empty string');
  }
  
  if (!Array.isArray(data.objectives)) {
    throw new Error('Invalid project.objectives: must be an array');
  }
  
  if (!Array.isArray(data.deliverables)) {
    throw new Error('Invalid project.deliverables: must be an array');
  }
  
  // Validate new rubric structure
  if (!data.rubric || typeof data.rubric !== 'object') {
    throw new Error('Invalid project.rubric: must be an object');
  }
  
  if (!Array.isArray(data.rubric.criteria)) {
    throw new Error('Invalid project.rubric.criteria: must be an array');
  }
  
  for (const [index, rubricItem] of data.rubric.criteria.entries()) {
    if (!rubricItem || typeof rubricItem.name !== 'string' || !Array.isArray(rubricItem.levels) || rubricItem.levels.length === 0) {
      throw new Error(`Invalid project rubric criteria at index ${index}: must have name as string and levels as non-empty array`);
    }
    
    // Validate weight if present
    if (rubricItem.weight !== undefined && (typeof rubricItem.weight !== 'number' || rubricItem.weight < 0 || rubricItem.weight > 1)) {
      throw new Error(`Invalid project rubric criteria weight at index ${index}: must be a number between 0 and 1`);
    }
    
    // Validate descriptors if present
    if (rubricItem.descriptors && (!Array.isArray(rubricItem.descriptors) || rubricItem.descriptors.length !== rubricItem.levels.length)) {
      throw new Error(`Invalid project rubric criteria descriptors at index ${index}: must be an array with same length as levels`);
    }
  }
  
  // Validate timeline if present
  if (data.timeline) {
    if (typeof data.timeline !== 'object') {
      throw new Error('Invalid project.timeline: must be an object');
    }
    
    if (data.timeline.milestones && !Array.isArray(data.timeline.milestones)) {
      throw new Error('Invalid project.timeline.milestones: must be an array');
    }
    
    if (data.timeline.milestones) {
      for (const [index, milestone] of data.timeline.milestones.entries()) {
        if (!milestone || typeof milestone.task !== 'string' || typeof milestone.week !== 'number') {
          throw new Error(`Invalid project timeline milestone at index ${index}: must have task as string and week as number`);
        }
      }
    }
  }
  
  // Validate phases if present
  if (data.phases && !Array.isArray(data.phases)) {
    throw new Error('Invalid project.phases: must be an array');
  }
  
  return data as ProjectData;
};

export const validatePresentation = (data: any): PresentationData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid presentation data: must be an object');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid presentation.title: must be a non-empty string');
  }
  
  if (!Array.isArray(data.slides) || data.slides.length < 1) {
    throw new Error('Invalid presentation.slides: must be a non-empty array');
  }
  
  for (const [index, slide] of data.slides.entries()) {
    if (!slide || typeof slide.heading !== 'string' || !Array.isArray(slide.bullets)) {
      throw new Error(`Invalid presentation slide at index ${index}: must have heading as string and bullets as array`);
    }
  }
  
  return data as PresentationData;
};

export const validateActivity = (data: any): ActivityData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid activity data: must be an object');
  }
  
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid activity.title: must be a non-empty string');
  }
  
  if (!data.duration || typeof data.duration !== 'string') {
    throw new Error('Invalid activity.duration: must be a non-empty string');
  }
  
  if (!Array.isArray(data.instructions)) {
    throw new Error('Invalid activity.instructions: must be an array');
  }
  
  if (!Array.isArray(data.materials)) {
    throw new Error('Invalid activity.materials: must be an array');
  }
  
  return data as ActivityData;

};
