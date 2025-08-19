import request from 'supertest';
import { GeneratedFileModel } from '../models/GeneratedFile';
import { UserModel } from '../models/User';
import { CreditTransactionModel } from '../models/CreditTransaction';

// Set environment variables before imports
process.env['OPENAI_API_KEY'] = 'test-api-key';
process.env['JWT_SECRET'] = 'test-jwt-secret';
process.env['NODE_ENV'] = 'test';

// Mock the dependencies
jest.mock('../models/GeneratedFile');
jest.mock('../models/User');
jest.mock('../models/CreditTransaction');
jest.mock('../database/connection', () => ({
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn()
}));
jest.mock('../middleware/auth', () => ({
  authenticateToken: (_req: any, _res: any, next: any) => {
    // Mock authenticated user
    _req.user = { id: 'user123', email: 'test@example.com' };
    next();
  },
  requireRole: (_roles: string[]) => (_req: any, _res: any, next: any) => {
    // Mock role check - always pass for tests
    next();
  },
  RequestWithUser: {}
}));
// Create a mock OpenAI instance
const mockOpenAICreate = jest.fn();
const mockOpenAI = {
  chat: {
    completions: {
      create: mockOpenAICreate
    }
  }
};

jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockOpenAI)
  };
});

const mockGeneratedFileModel = GeneratedFileModel as jest.Mocked<typeof GeneratedFileModel>;
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;
const mockCreditTransactionModel = CreditTransactionModel as jest.Mocked<typeof CreditTransactionModel>;

// Mock OpenAI streaming response
const createMockStream = (jsonResponse: any) => {
  const content = JSON.stringify(jsonResponse);
  return {
    [Symbol.asyncIterator]: async function* () {
      // Simulate streaming chunks
      for (let i = 0; i < content.length; i += 10) {
        yield {
          choices: [{ 
            delta: { 
              content: content.slice(i, i + 10) 
            } 
          }]
        };
      }
    }
  };
};

describe('AI Generator Routes', () => {
  let app: any;

  beforeAll(async () => {
    app = (await import('../index')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockUserModel.findById.mockResolvedValue({
      id: 'user123',
      credits_balance: 10,
      email: 'test@example.com'
    } as any);

    mockCreditTransactionModel.deductCredits.mockResolvedValue({} as any);
    
    mockGeneratedFileModel.create.mockResolvedValue({
      id: 'file123',
      user_id: 'user123',
      title: 'Test File',
      content: '{}',
      file_type: 'quiz'
    } as any);

    mockGeneratedFileModel.updateAIMetadata.mockResolvedValue({} as any);
  });

  describe('POST /api/ai/generate-quiz', () => {
    it('should successfully parse and save a valid quiz', async () => {
      const validQuiz = {
        title: 'Test Quiz',
        subject: 'Matematika',
        grade_level: '7. třída',
        time_limit: '20 min',
        questions: [
          {
            type: 'multiple_choice',
            question: 'Co je 2 + 2?',
            options: ['3', '4', '5', '6'],
            answer: '4'
          },
          {
            type: 'true_false',
            question: 'Země je plochá.',
            answer: false
          },
          {
            type: 'short_answer',
            question: 'Jaká je hlavní město České republiky?',
            answer: 'Praha'
          }
        ]
      };

      // Mock OpenAI to return valid quiz JSON
      mockOpenAICreate.mockResolvedValue(createMockStream(validQuiz));

      const response = await request(app)
        .post('/api/ai/generate-quiz')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Quiz',
          subject: 'Matematika',
          grade_level: '7 trida',
          question_count: 3
        });

      // Should not get immediate JSON response due to streaming
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');

      // Verify that the file would be created and credits deducted
      expect(mockGeneratedFileModel.create).toHaveBeenCalledWith({
        user_id: 'user123',
        title: validQuiz.title,
        content: JSON.stringify(validQuiz),
        file_type: 'quiz'
      });
      expect(mockCreditTransactionModel.deductCredits).toHaveBeenCalledWith(
        'user123',
        2,
        'Quiz generation'
      );
    });

    it('should handle quiz time_limit normalization correctly', async () => {
      const quizWithNumericTimeLimit = {
        title: 'Test Quiz',
        subject: 'Matematika',
        grade_level: '7. třída',
        time_limit: 30, // numeric instead of string
        questions: [
          {
            type: 'multiple_choice',
            question: 'Test question?',
            options: ['A', 'B', 'C', 'D'],
            answer: 'A'
          }
        ]
      };

      mockOpenAICreate.mockResolvedValue(createMockStream(quizWithNumericTimeLimit));

      const response = await request(app)
        .post('/api/ai/generate-quiz')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Quiz',
          time_limit: '30 min'
        });

      expect(response.status).toBe(200);
      expect(mockGeneratedFileModel.create).toHaveBeenCalled();
    });

    it('should fail validation for invalid quiz structure', async () => {
      const invalidQuiz = {
        title: 'Test Quiz',
        // Missing required fields like questions
        invalid_field: 'should not be here'
      };

      mockOpenAICreate.mockResolvedValue(createMockStream(invalidQuiz));

      const response = await request(app)
        .post('/api/ai/generate-quiz')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Quiz'
        });

      expect(response.status).toBe(200);
      // The error would be sent through the stream, not as HTTP status
      // Credits should not be deducted for failed parsing
      expect(mockCreditTransactionModel.deductCredits).not.toHaveBeenCalled();
    });

    it('should fail validation for insufficient credits', async () => {
      mockUserModel.findById.mockResolvedValue({
        id: 'user123',
        credits_balance: 1, // Less than required 2 credits
        email: 'test@example.com'
      } as any);

      const response = await request(app)
        .post('/api/ai/generate-quiz')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Quiz'
        });

      expect(response.status).toBe(402);
      expect(response.body.error).toBe('Insufficient credits');
      expect(mockGeneratedFileModel.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/ai/generate-lesson-plan', () => {
    it('should successfully parse and save a valid lesson plan', async () => {
      const validLessonPlan = {
        title: 'Úvod do zlomků',
        subject: 'Matematika',
        grade_level: '6. třída',
        duration: '45 min',
        objectives: ['Pochopit koncept zlomků', 'Umět základní operace se zlomky'],
        materials: ['Tabule', 'Učebnice', 'Pracovní listy'],
        activities: [
          {
            name: 'Úvod',
            description: 'Představení tématu',
            steps: ['Přivítání', 'Představení cílů'],
            time: '5 min'
          },
          {
            name: 'Hlavní část',
            description: 'Výklad zlomků',
            steps: ['Vysvětlení', 'Příklady'],
            time: '30 min'
          },
          {
            name: 'Závěr',
            description: 'Shrnutí a otázky',
            steps: ['Shrnutí', 'Dotazy'],
            time: '10 min'
          }
        ],
        differentiation: 'Úpravy pro různé úrovně žáků',
        homework: 'Cvičení na stránce 45',
        assessment: 'Ústní zkoušení'
      };

      mockOpenAICreate.mockResolvedValue(createMockStream(validLessonPlan));

      const response = await request(app)
        .post('/api/ai/generate-lesson-plan')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Úvod do zlomků',
          subject: 'Matematika',
          grade_level: '6. třída'
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');

      expect(mockGeneratedFileModel.create).toHaveBeenCalledWith({
        user_id: 'user123',
        title: validLessonPlan.title,
        content: JSON.stringify(validLessonPlan),
        file_type: 'lesson_plan'
      });
      expect(mockCreditTransactionModel.deductCredits).toHaveBeenCalledWith(
        'user123',
        2,
        'Lesson plan generation'
      );
    });

    it('should fail validation for duration mismatch', async () => {
      const lessonPlanWithBadDuration = {
        title: 'Test Lesson',
        subject: 'Matematika',
        grade_level: '6. třída',
        duration: '45 min',
        objectives: ['Test objective'],
        materials: ['Test material'],
        activities: [
          {
            name: 'Activity 1',
            description: 'Test activity',
            steps: ['Step 1'],
            time: '30 min' // Only 30 min, but duration says 45 min
          }
        ],
        differentiation: 'Test',
        homework: 'Test',
        assessment: 'Test'
      };

      mockOpenAICreate.mockResolvedValue(createMockStream(lessonPlanWithBadDuration));

      const response = await request(app)
        .post('/api/ai/generate-lesson-plan')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Lesson'
        });

      expect(response.status).toBe(200);
      // Error would be sent through stream due to duration mismatch
      expect(mockCreditTransactionModel.deductCredits).not.toHaveBeenCalled();
    });

    it('should fail validation for missing required fields', async () => {
      const invalidLessonPlan = {
        title: 'Test Lesson',
        // Missing activities array
        duration: '45 min'
      };

      mockOpenAICreate.mockResolvedValue(createMockStream(invalidLessonPlan));

      const response = await request(app)
        .post('/api/ai/generate-lesson-plan')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Test Lesson'
        });

      expect(response.status).toBe(200);
      // Should not deduct credits for failed parsing
      expect(mockCreditTransactionModel.deductCredits).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/ai/generate-worksheet', () => {
    it('should successfully parse and save a valid worksheet', async () => {
      const validWorksheet = {
        title: 'Cvičení na zlomky',
        instructions: 'Vyřešte následující příklady se zlomky',
        questions: [
          {
            problem: '1/2 + 1/3 = ?',
            answer: '5/6'
          },
          {
            problem: '2/4 - 1/4 = ?',
            answer: '1/4'
          }
        ]
      };

      mockOpenAICreate.mockResolvedValue(createMockStream(validWorksheet));

      const response = await request(app)
        .post('/api/ai/generate-worksheet')
        .set('Authorization', 'Bearer test-token')
        .send({
          topic: 'Zlomky a zakladni operace',
          question_count: 2
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/event-stream');

      expect(mockGeneratedFileModel.create).toHaveBeenCalledWith({
        user_id: 'user123',
        title: validWorksheet.title,
        content: JSON.stringify(validWorksheet),
        file_type: 'worksheet'
      });
      expect(mockCreditTransactionModel.deductCredits).toHaveBeenCalledWith(
        'user123',
        2,
        'Worksheet generation: "Zlomky"'
      );
    });

    it('should fail validation for topic too short', async () => {
      const response = await request(app)
        .post('/api/ai/generate-worksheet')
        .set('Authorization', 'Bearer test-token')
        .send({
          topic: 'AB' // Only 2 characters, minimum is 3
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(mockGeneratedFileModel.create).not.toHaveBeenCalled();
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for all generator endpoints', async () => {
      // Temporarily remove the auth mock to test real auth behavior
      jest.resetModules();
      const appWithoutAuth = (await import('../index')).default;
      
      const endpoints = [
        '/api/ai/generate-quiz',
        '/api/ai/generate-lesson-plan',
        '/api/ai/generate-worksheet'
      ];

      for (const endpoint of endpoints) {
        const response = await request(appWithoutAuth)
          .post(endpoint)
          .send({ title: 'Test' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Access token required');
      }
    });

    it('should handle user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/ai/generate-quiz')
        .set('Authorization', 'Bearer test-token')
        .send({ title: 'Test Quiz' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });

});
