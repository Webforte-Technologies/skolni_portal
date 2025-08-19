// Set up environment variables for tests
process.env['OPENAI_API_KEY'] = 'test-api-key';
process.env['JWT_SECRET'] = 'test-jwt-secret';

import {
  validateWorksheet,
  validateLessonPlan,
  validateQuiz,
  validateProject,
  validatePresentation,
  validateActivity,
  normalizeTimeLimit
} from '../types/ai-generators';

describe('AI Generators - Core Functionality', () => {
  describe('Worksheet Validation', () => {
    const validWorksheet = {
      title: 'Math Worksheet',
      instructions: 'Complete all problems',
      questions: [
        { problem: 'What is 2+2?', answer: '4' },
        { problem: 'What is 3+3?', answer: '6' }
      ]
    };

    it('should validate correct worksheet structure', () => {
      expect(() => validateWorksheet(validWorksheet)).not.toThrow();
      const result = validateWorksheet(validWorksheet);
      expect(result.title).toBe('Math Worksheet');
      expect(result.questions).toHaveLength(2);
    });

    it('should reject invalid worksheet structure', () => {
      expect(() => validateWorksheet({})).toThrow();
      expect(() => validateWorksheet({ title: 'Test' })).toThrow();
      expect(() => validateWorksheet({ 
        title: 'Test', 
        instructions: 'Test',
        questions: []
      })).toThrow('must be a non-empty array');
    });
  });

  describe('Lesson Plan Validation with Duration Checking', () => {
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

    it('should validate lesson plan with correct duration sum', () => {
      expect(() => validateLessonPlan(validLessonPlan)).not.toThrow();
      const result = validateLessonPlan(validLessonPlan);
      expect(result.title).toBe('Math Lesson');
      expect(result.activities).toHaveLength(2);
    });

    it('should reject lesson plan with duration mismatch', () => {
      const invalidDuration = {
        ...validLessonPlan,
        duration: '60 min', // Activities only add up to 45 min
      };
      expect(() => validateLessonPlan(invalidDuration)).toThrow('Duration mismatch: activities total 45 min != duration 60 min');
    });

    it('should handle activities with different time formats', () => {
      const mixedTimeFormats = {
        ...validLessonPlan,
        activities: [
          { name: 'Activity 1', description: 'Test', steps: ['Step'], time: '20min' },
          { name: 'Activity 2', description: 'Test', steps: ['Step'], time: '25 MIN' }
        ]
      };
      expect(() => validateLessonPlan(mixedTimeFormats)).not.toThrow();
    });
  });

  describe('Quiz Validation with Time Limit Normalization', () => {
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
        }
      ]
    };

    it('should normalize time_limit from string to number', () => {
      const result = validateQuiz(validQuiz);
      expect(result.time_limit).toBe(20);
    });

    it('should normalize unlimited time limits', () => {
      const unlimitedQuiz = { ...validQuiz, time_limit: 'Bez limitu' };
      const result = validateQuiz(unlimitedQuiz);
      expect(result.time_limit).toBe('no_limit');
    });

    it('should handle numeric time limits', () => {
      const numericQuiz = { ...validQuiz, time_limit: 30 };
      const result = validateQuiz(numericQuiz);
      expect(result.time_limit).toBe(30);
    });

    it('should validate different question types', () => {
      const multiTypeQuiz = {
        ...validQuiz,
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
      expect(() => validateQuiz(multiTypeQuiz)).not.toThrow();
    });

    it('should reject invalid question formats', () => {
      const invalidMCQuiz = {
        ...validQuiz,
        questions: [{
          type: 'multiple_choice',
          question: 'Test?',
          options: ['A', 'B'],
          answer: 'C' // Not in options
        }]
      };
      expect(() => validateQuiz(invalidMCQuiz)).toThrow('answer must be one of the options');
    });
  });

  describe('Project Validation', () => {
    const validProject = {
      template: 'project',
      title: 'Science Project',
      subject: 'Science',
      grade_level: '6th Grade',
      duration: '2 weeks',
      objectives: ['Learn method'],
      description: 'Create experiment',
      deliverables: ['Report'],
      rubric: [
        { criteria: 'Quality', levels: ['Good', 'Fair'] }
      ]
    };

    it('should validate correct project structure', () => {
      expect(() => validateProject(validProject)).not.toThrow();
      const result = validateProject(validProject);
      expect(result.title).toBe('Science Project');
      expect(result.rubric).toHaveLength(1);
    });

    it('should validate rubric structure', () => {
      const invalidRubric = {
        ...validProject,
        rubric: [{ criteria: 'Test' }] // missing levels
      };
      expect(() => validateProject(invalidRubric)).toThrow('must have criteria as string and levels as non-empty array');
    });
  });

  describe('Presentation Validation', () => {
    const validPresentation = {
      template: 'presentation',
      title: 'History Presentation',
      subject: 'History',
      grade_level: '7th Grade',
      slides: [
        { heading: 'Introduction', bullets: ['Point 1', 'Point 2'] }
      ]
    };

    it('should validate correct presentation structure', () => {
      expect(() => validatePresentation(validPresentation)).not.toThrow();
      const result = validatePresentation(validPresentation);
      expect(result.title).toBe('History Presentation');
      expect(result.slides).toHaveLength(1);
    });

    it('should validate slide structure', () => {
      const invalidSlide = {
        ...validPresentation,
        slides: [{ heading: 'Test' }] // missing bullets
      };
      expect(() => validatePresentation(invalidSlide)).toThrow('must have heading as string and bullets as array');
    });
  });

  describe('Activity Validation', () => {
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

    it('should validate correct activity structure', () => {
      expect(() => validateActivity(validActivity)).not.toThrow();
      const result = validateActivity(validActivity);
      expect(result.title).toBe('Group Activity');
      expect(result.instructions).toHaveLength(2);
    });

    it('should require essential fields', () => {
      expect(() => validateActivity({})).toThrow('Invalid activity.title');
      expect(() => validateActivity({ title: 'Test' })).toThrow('Invalid activity.duration');
    });
  });

  describe('Time Limit Normalization Edge Cases', () => {
    it('should handle various unlimited formats', () => {
      expect(normalizeTimeLimit('Bez limitu')).toBe('no_limit');
      expect(normalizeTimeLimit('NO LIMIT')).toBe('no_limit');
      expect(normalizeTimeLimit('unlimited')).toBe('no_limit');
      expect(normalizeTimeLimit('UNLIMITED')).toBe('no_limit');
    });

    it('should handle various time formats', () => {
      expect(normalizeTimeLimit('20 min')).toBe(20);
      expect(normalizeTimeLimit('45min')).toBe(45);
      expect(normalizeTimeLimit('120 MIN')).toBe(120);
    });

    it('should handle edge cases', () => {
      expect(normalizeTimeLimit('')).toBe('no_limit');
      expect(normalizeTimeLimit('invalid')).toBe('no_limit');
      expect(normalizeTimeLimit(0)).toBe(0);
      expect(normalizeTimeLimit(30)).toBe(30);
    });
  });

  describe('Error Handling', () => {
    it('should provide descriptive error messages', () => {
      try {
        validateWorksheet({ title: 'Test', instructions: 'Test', questions: [] });
      } catch (error: any) {
        expect(error.message).toContain('must be a non-empty array');
      }

      try {
        validateLessonPlan({ title: 'Test', activities: [{ name: 'Test' }] });
      } catch (error: any) {
        expect(error.message).toContain('must have name and time as strings');
      }

      try {
        validateQuiz({ 
          title: 'Test', 
          time_limit: '20 min', 
          questions: [{ type: 'multiple_choice', question: 'Test?', options: ['A', 'B'], answer: 'C' }] 
        });
      } catch (error: any) {
        expect(error.message).toContain('answer must be one of the options');
      }
    });
  });
});
