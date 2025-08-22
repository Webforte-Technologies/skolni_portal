import {
  validateWorksheet,
  validateLessonPlan,
  validateQuiz,
  validateProject,
  validatePresentation,
  validateActivity,
  parseTimeToMinutes,
  normalizeTimeLimit
} from '../types/ai-generators';

describe('AI Generator Type Validations', () => {
  describe('parseTimeToMinutes', () => {
    it('should parse minutes from time strings', () => {
      expect(parseTimeToMinutes('10 min')).toBe(10);
      expect(parseTimeToMinutes('45 min')).toBe(45);
      expect(parseTimeToMinutes('5min')).toBe(5);
      expect(parseTimeToMinutes('120 MIN')).toBe(120);
    });

    it('should return 0 for invalid time strings', () => {
      expect(parseTimeToMinutes('invalid')).toBe(0);
      expect(parseTimeToMinutes('no numbers')).toBe(0);
      expect(parseTimeToMinutes('')).toBe(0);
    });
  });

  describe('normalizeTimeLimit', () => {
    it('should return numbers as-is', () => {
      expect(normalizeTimeLimit(20)).toBe(20);
      expect(normalizeTimeLimit(0)).toBe(0);
    });

    it('should normalize unlimited time strings', () => {
      expect(normalizeTimeLimit('Bez limitu')).toBe('no_limit');
      expect(normalizeTimeLimit('no limit')).toBe('no_limit');
      expect(normalizeTimeLimit('unlimited')).toBe('no_limit');
      expect(normalizeTimeLimit('BEZ LIMITU')).toBe('no_limit');
    });

    it('should parse time strings to minutes', () => {
      expect(normalizeTimeLimit('20 min')).toBe(20);
      expect(normalizeTimeLimit('45 min')).toBe(45);
    });

    it('should return no_limit for invalid strings', () => {
      expect(normalizeTimeLimit('invalid')).toBe('no_limit');
      expect(normalizeTimeLimit('')).toBe('no_limit');
    });
  });

  describe('validateWorksheet', () => {
    const validWorksheet = {
      title: 'Math Worksheet',
      instructions: 'Complete all problems',
      questions: [
        { problem: 'What is 2+2?', answer: '4' },
        { problem: 'What is 3+3?', answer: '6' }
      ]
    };

    it('should validate correct worksheet data', () => {
      expect(() => validateWorksheet(validWorksheet)).not.toThrow();
      const result = validateWorksheet(validWorksheet);
      expect(result.title).toBe('Math Worksheet');
      expect(result.questions).toHaveLength(2);
    });

    it('should reject invalid worksheet data', () => {
      expect(() => validateWorksheet(null)).toThrow('must be an object');
      expect(() => validateWorksheet({})).toThrow('Invalid worksheet.title');
      expect(() => validateWorksheet({ title: 'Test' })).toThrow('Invalid worksheet.instructions');
      expect(() => validateWorksheet({ 
        title: 'Test', 
        instructions: 'Test' 
      })).toThrow('Invalid worksheet.questions');
      expect(() => validateWorksheet({ 
        title: 'Test', 
        instructions: 'Test',
        questions: []
      })).toThrow('must be a non-empty array');
    });

    it('should reject invalid question format', () => {
      expect(() => validateWorksheet({
        title: 'Test',
        instructions: 'Test',
        questions: [{ problem: 'Test?' }] // missing answer
      })).toThrow('must have problem and answer as strings');

      expect(() => validateWorksheet({
        title: 'Test',
        instructions: 'Test',
        questions: [{ problem: 123, answer: 'Test' }] // problem not string
      })).toThrow('must have problem and answer as strings');
    });
  });

  describe('validateLessonPlan', () => {
    const validLessonPlan = {
      title: 'Math Lesson',
      subject: 'Mathematics',
      grade_level: '5th Grade',
      duration: '45 min',
      objectives: ['Learn addition'],
      materials: ['Worksheets'],
      activities: [
        { name: 'Warm-up', description: 'Review', steps: ['Step 1'], time: '15 min' },
        { name: 'Main', description: 'Practice', steps: ['Step 1'], time: '30 min' }
      ],
      differentiation: 'Adjust difficulty',
      homework: 'Practice',
      assessment: 'Quiz'
    };

    it('should validate correct lesson plan data', () => {
      expect(() => validateLessonPlan(validLessonPlan)).not.toThrow();
      const result = validateLessonPlan(validLessonPlan);
      expect(result.title).toBe('Math Lesson');
      expect(result.activities).toHaveLength(2);
    });

    it('should reject invalid lesson plan data', () => {
      expect(() => validateLessonPlan(null)).toThrow('must be an object');
      expect(() => validateLessonPlan({})).toThrow('Invalid lesson_plan.title');
      expect(() => validateLessonPlan({ title: 'Test' })).toThrow('Invalid lesson_plan.activities');
    });

    it('should validate duration matches activity times', () => {
      const invalidDuration = {
        ...validLessonPlan,
        duration: '60 min', // Total activities only add up to 45 min
      };
      expect(() => validateLessonPlan(invalidDuration)).toThrow('Duration mismatch: activities total 45 min != duration 60 min');
    });

    it('should reject invalid activity format', () => {
      const invalidActivity = {
        ...validLessonPlan,
        activities: [{ name: 'Test' }] // missing time
      };
      expect(() => validateLessonPlan(invalidActivity)).toThrow('must have name and time as strings');
    });
  });

  describe('validateQuiz', () => {
    const validQuiz = {
      title: 'Math Quiz',
      subject: 'Mathematics',
      grade_level: '5th Grade',
      time_limit: '20 min',
      questions: [
        {
          type: 'multiple_choice',
          question: 'What is 2+2?',
          options: ['3', '4', '5'],
          answer: '4'
        },
        {
          type: 'true_false',
          question: '2+2=4',
          answer: true
        },
        {
          type: 'short_answer',
          question: 'What is 3+3?',
          answer: '6'
        }
      ]
    };

    it('should validate correct quiz data', () => {
      expect(() => validateQuiz(validQuiz)).not.toThrow();
      const result = validateQuiz(validQuiz);
      expect(result.title).toBe('Math Quiz');
      expect(result.time_limit).toBe(20); // Should be normalized
    });

    it('should normalize time_limit', () => {
      const quizWithUnlimited = { ...validQuiz, time_limit: 'Bez limitu' };
      const result = validateQuiz(quizWithUnlimited);
      expect(result.time_limit).toBe('no_limit');
    });

    it('should reject invalid quiz data', () => {
      expect(() => validateQuiz(null)).toThrow('must be an object');
      expect(() => validateQuiz({})).toThrow('Invalid quiz.title');
      expect(() => validateQuiz({ title: 'Test' })).toThrow('Invalid quiz.time_limit');
    });

    it('should validate question types correctly', () => {
      // Invalid multiple choice - answer not in options
      const invalidMC = {
        ...validQuiz,
        questions: [{
          type: 'multiple_choice',
          question: 'Test?',
          options: ['A', 'B'],
          answer: 'C' // Not in options
        }]
      };
      expect(() => validateQuiz(invalidMC)).toThrow('answer must be one of the options');

      // Invalid true/false - answer not boolean or valid string
      const invalidTF = {
        ...validQuiz,
        questions: [{
          type: 'true_false',
          question: 'Test?',
          answer: 'invalid_string' // Should be boolean or valid true/false string
        }]
      };
      expect(() => validateQuiz(invalidTF)).toThrow('must be boolean, English');

      // Invalid short answer - answer not string
      const invalidSA = {
        ...validQuiz,
        questions: [{
          type: 'short_answer',
          question: 'Test?',
          answer: 123 // Should be string
        }]
      };
      expect(() => validateQuiz(invalidSA)).toThrow('must be string for short answer');
    });
  });

  describe('validateProject', () => {
    const validProject = {
      template: 'project',
      title: 'Science Project',
      subject: 'Science',
      grade_level: '6th Grade',
      duration: '2 weeks',
      objectives: ['Learn method'],
      description: 'Create experiment',
      deliverables: ['Report'],
      phases: ['Preparation', 'Implementation', 'Presentation'],
      rubric: {
        criteria: [
          {
            name: 'Quality',
            weight: 0.4,
            levels: ['Good', 'Fair', 'Poor'],
            descriptors: [
              'Excellent quality work',
              'Good quality work',
              'Poor quality work'
            ]
          }
        ]
      },
      timeline: {
        milestones: [
          { week: 1, task: 'Planning' },
          { week: 2, task: 'Implementation' }
        ]
      }
    };

    it('should validate correct project data', () => {
      expect(() => validateProject(validProject)).not.toThrow();
      const result = validateProject(validProject);
      expect(result.title).toBe('Science Project');
      expect(result.rubric.criteria).toHaveLength(1);
      expect(result.timeline.milestones).toHaveLength(2);
    });

    it('should reject invalid project data', () => {
      expect(() => validateProject(null)).toThrow('must be an object');
      expect(() => validateProject({})).toThrow('Invalid project.title');
      expect(() => validateProject({ title: 'Test' })).toThrow('Invalid project.description');
    });

    it('should validate rubric format', () => {
      const invalidRubric = {
        ...validProject,
        rubric: { criteria: [{ name: 'Test' }] } // missing levels
      };
      expect(() => validateProject(invalidRubric)).toThrow('must have name as string and levels as non-empty array');
    });
  });

  describe('validatePresentation', () => {
    const validPresentation = {
      template: 'presentation',
      title: 'History Presentation',
      subject: 'History',
      grade_level: '7th Grade',
      slides: [
        { heading: 'Introduction', bullets: ['Point 1', 'Point 2'] }
      ]
    };

    it('should validate correct presentation data', () => {
      expect(() => validatePresentation(validPresentation)).not.toThrow();
      const result = validatePresentation(validPresentation);
      expect(result.title).toBe('History Presentation');
      expect(result.slides).toHaveLength(1);
    });

    it('should reject invalid presentation data', () => {
      expect(() => validatePresentation(null)).toThrow('must be an object');
      expect(() => validatePresentation({})).toThrow('Invalid presentation.title');
      expect(() => validatePresentation({ title: 'Test' })).toThrow('Invalid presentation.slides');
    });

    it('should validate slide format', () => {
      const invalidSlide = {
        ...validPresentation,
        slides: [{ heading: 'Test' }] // missing bullets
      };
      expect(() => validatePresentation(invalidSlide)).toThrow('must have heading as string and bullets as array');
    });
  });

  describe('validateActivity', () => {
    const validActivity = {
      title: 'Group Activity',
      subject: 'English',
      grade_level: '8th Grade',
      duration: '15 min',
      goal: 'Practice vocabulary',
      instructions: ['Step 1', 'Step 2'],
      materials: ['Cards'],
      variation: 'Individual work'
    };

    it('should validate correct activity data', () => {
      expect(() => validateActivity(validActivity)).not.toThrow();
      const result = validateActivity(validActivity);
      expect(result.title).toBe('Group Activity');
      expect(result.instructions).toHaveLength(2);
    });

    it('should reject invalid activity data', () => {
      expect(() => validateActivity(null)).toThrow('must be an object');
      expect(() => validateActivity({})).toThrow('Invalid activity.title');
      expect(() => validateActivity({ title: 'Test' })).toThrow('Invalid activity.duration');
      expect(() => validateActivity({ 
        title: 'Test', 
        duration: '10 min' 
      })).toThrow('Invalid activity.instructions');
    });

    it('should validate arrays are properly formatted', () => {
      const invalidInstructions = {
        ...validActivity,
        instructions: 'Not an array' // Should be array
      };
      expect(() => validateActivity(invalidInstructions)).toThrow('Invalid activity.instructions');

      const invalidMaterials = {
        ...validActivity,
        materials: 'Not an array' // Should be array
      };
      expect(() => validateActivity(invalidMaterials)).toThrow('Invalid activity.materials');
    });
  });
});

