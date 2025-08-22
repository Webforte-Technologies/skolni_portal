import { MaterialSubtypeModel, MaterialSubtypeData, TemplateField, PromptModification } from '../models/MaterialSubtype';
import pool from '../database/connection';

// Mock the database connection
jest.mock('../database/connection', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));

describe('MaterialSubtypeModel', () => {
  let model: MaterialSubtypeModel;
  let mockPool: any;

  beforeEach(() => {
    model = new MaterialSubtypeModel();
    mockPool = pool;
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active subtypes', async () => {
      const mockRows = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          parentType: 'worksheet',
          name: 'Cvičné úlohy',
          description: 'Test description',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockRows } as any);

      const result = await model.findAll();

      expect(mockPool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'));
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].name).toBe('Cvičné úlohy');
        expect(result[0].parentType).toBe('worksheet');
      }
    });

    it('should return empty array when no subtypes exist', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await model.findAll();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByParentType', () => {
    it('should return subtypes for specific parent type', async () => {
      const mockRows = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          parentType: 'worksheet',
          name: 'Cvičné úlohy',
          description: 'Test description',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockRows } as any);

      const result = await model.findByParentType('worksheet');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE parent_type = $1'),
        ['worksheet']
      );
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].parentType).toBe('worksheet');
      }
    });
  });

  describe('findById', () => {
    it('should return subtype by id', async () => {
      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        parentType: 'worksheet',
        name: 'Cvičné úlohy',
        description: 'Test description',
        specialFields: [],
        promptModifications: [],
        validationRules: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await model.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).not.toBeNull();
      expect(result!.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should return null when subtype not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await model.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should return subtype by parent type and name', async () => {
      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        parentType: 'worksheet',
        name: 'Cvičné úlohy',
        description: 'Test description',
        specialFields: [],
        promptModifications: [],
        validationRules: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await model.findByName('worksheet', 'Cvičné úlohy');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE parent_type = $1 AND name = $2'),
        ['worksheet', 'Cvičné úlohy']
      );
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Cvičné úlohy');
    });
  });

  describe('create', () => {
    it('should create new subtype', async () => {
      const subtypeData: Omit<MaterialSubtypeData, 'id' | 'createdAt' | 'updatedAt'> = {
        parentType: 'worksheet',
        name: 'New Subtype',
        description: 'Test description',
        specialFields: [],
        promptModifications: [],
        validationRules: {},
        isActive: true
      };

      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...subtypeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await model.create(subtypeData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO material_subtypes'),
        expect.arrayContaining([
          'worksheet',
          'New Subtype',
          'Test description',
          '[]',
          '[]',
          '{}',
          true
        ])
      );
      expect(result.name).toBe('New Subtype');
    });

    it('should create subtype with default values', async () => {
      const subtypeData: Omit<MaterialSubtypeData, 'id' | 'createdAt' | 'updatedAt'> = {
        parentType: 'quiz',
        name: 'Simple Quiz'
      };

      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        parentType: 'quiz',
        name: 'Simple Quiz',
        description: null,
        specialFields: [],
        promptModifications: [],
        validationRules: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await model.create(subtypeData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO material_subtypes'),
        expect.arrayContaining([
          'quiz',
          'Simple Quiz',
          null,
          '[]',
          '[]',
          '{}',
          true
        ])
      );
      expect(result.name).toBe('Simple Quiz');
    });
  });

  describe('update', () => {
    it('should update subtype fields', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description'
      };

      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        parentType: 'worksheet',
        name: 'Updated Name',
        description: 'Updated description',
        specialFields: [],
        promptModifications: [],
        validationRules: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPool.query.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await model.update('123e4567-e89b-12d3-a456-426614174000', updateData);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE material_subtypes'),
        expect.arrayContaining(['Updated Name', 'Updated description', '123e4567-e89b-12d3-a456-426614174000'])
      );
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated Name');
    });

    it('should return existing data when no fields to update', async () => {
      const mockRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        parentType: 'worksheet',
        name: 'Existing Name',
        description: 'Existing description',
        specialFields: [],
        promptModifications: [],
        validationRules: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock findById call
      mockPool.query.mockResolvedValue({ rows: [mockRow] } as any);

      const result = await model.update('123e4567-e89b-12d3-a456-426614174000', {});

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Existing Name');
    });

    it('should return null when subtype not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await model.update('nonexistent-id', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should soft delete subtype', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 } as any);

      const result = await model.delete('123e4567-e89b-12d3-a456-426614174000');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE material_subtypes'),
        ['123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toBe(true);
    });

    it('should return false when subtype not found', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 0 } as any);

      const result = await model.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete subtype', async () => {
      mockPool.query.mockResolvedValue({ rowCount: 1 } as any);

      const result = await model.hardDelete('123e4567-e89b-12d3-a456-426614174000');

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM material_subtypes WHERE id = $1',
        ['123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toBe(true);
    });
  });

  describe('getSubtypesByMaterialType', () => {
    it('should group subtypes by material type', async () => {
      const mockRows = [
        {
          id: '1',
          parentType: 'worksheet',
          name: 'Worksheet Subtype 1',
          description: 'Description 1',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          parentType: 'worksheet',
          name: 'Worksheet Subtype 2',
          description: 'Description 2',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          parentType: 'quiz',
          name: 'Quiz Subtype 1',
          description: 'Description 3',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockRows } as any);

      const result = await model.getSubtypesByMaterialType();

      expect(result.worksheet).toHaveLength(2);
      expect(result.quiz).toHaveLength(1);
      if (result.worksheet[0] && result.quiz[0]) {
        expect(result.worksheet[0].name).toBe('Worksheet Subtype 1');
        expect(result.quiz[0].name).toBe('Quiz Subtype 1');
      }
    });
  });

  describe('validateSubtypeExists', () => {
    it('should return true when subtype exists', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ exists: true }] } as any);

      const result = await model.validateSubtypeExists('worksheet', '123e4567-e89b-12d3-a456-426614174000');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1 FROM material_subtypes'),
        ['123e4567-e89b-12d3-a456-426614174000', 'worksheet']
      );
      expect(result).toBe(true);
    });

    it('should return false when subtype does not exist', async () => {
      mockPool.query.mockResolvedValue({ rows: [] } as any);

      const result = await model.validateSubtypeExists('worksheet', 'nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('searchSubtypes', () => {
    it('should search subtypes by name and description', async () => {
      const mockRows = [
        {
          id: '1',
          parentType: 'worksheet',
          name: 'Practice Problems',
          description: 'Practice exercises',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockRows } as any);

      const result = await model.searchSubtypes('practice');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('name ILIKE $1 OR description ILIKE $1'),
        ['%practice%']
      );
      expect(result).toHaveLength(1);
      if (result[0]) {
        expect(result[0].name).toBe('Practice Problems');
      }
    });

    it('should search subtypes with parent type filter', async () => {
      const mockRows = [
        {
          id: '1',
          parentType: 'worksheet',
          name: 'Practice Problems',
          description: 'Practice exercises',
          specialFields: [],
          promptModifications: [],
          validationRules: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPool.query.mockResolvedValue({ rows: mockRows } as any);

      const result = await model.searchSubtypes('practice', 'worksheet');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND parent_type = $2'),
        ['%practice%', 'worksheet']
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('static validation methods', () => {
    describe('validateSpecialFields', () => {
      it('should validate correct special fields', () => {
        const validFields: TemplateField[] = [
          {
            name: 'testField',
            type: 'text',
            label: 'Test Field',
            required: false
          },
          {
            name: 'selectField',
            type: 'select',
            label: 'Select Field',
            options: ['option1', 'option2'],
            required: true
          }
        ];

        const errors = MaterialSubtypeModel.validateSpecialFields(validFields);

        expect(errors).toHaveLength(0);
      });

      it('should detect invalid field structure', () => {
        const invalidFields: TemplateField[] = [
          {
            name: '',
            type: 'text',
            label: 'Test Field'
          } as TemplateField,
          {
            name: 'selectField',
            type: 'invalid' as any,
            label: 'Select Field'
          },
          {
            name: 'selectWithoutOptions',
            type: 'select',
            label: 'Select Field'
            // Missing options
          } as TemplateField
        ];

        const errors = MaterialSubtypeModel.validateSpecialFields(invalidFields);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(error => error.includes('Field name is required'))).toBe(true);
        expect(errors.some(error => error.includes('Invalid field type'))).toBe(true);
        expect(errors.some(error => error.includes('must have options array'))).toBe(true);
      });
    });

    describe('validatePromptModifications', () => {
      it('should validate correct prompt modifications', () => {
        const validModifications: PromptModification[] = [
          {
            type: 'prepend',
            content: 'Prepend this content'
          },
          {
            type: 'replace',
            target: 'old text',
            content: 'new text'
          }
        ];

        const errors = MaterialSubtypeModel.validatePromptModifications(validModifications);

        expect(errors).toHaveLength(0);
      });

      it('should detect invalid prompt modifications', () => {
        const invalidModifications: PromptModification[] = [
          {
            type: 'invalid' as any,
            content: 'Some content'
          },
          {
            type: 'replace',
            content: 'Missing target'
            // Missing target for replace type
          } as PromptModification,
          {
            type: 'prepend',
            content: ''
          }
        ];

        const errors = MaterialSubtypeModel.validatePromptModifications(invalidModifications);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(error => error.includes('Invalid modification type'))).toBe(true);
        expect(errors.some(error => error.includes('requires a target'))).toBe(true);
        expect(errors.some(error => error.includes('content is required'))).toBe(true);
      });
    });
  });

  describe('getDefaultSubtypes', () => {
    it('should return default subtypes for all material types', () => {
      const defaults = MaterialSubtypeModel.getDefaultSubtypes();

      expect(defaults.worksheet).toBeDefined();
      expect(defaults.quiz).toBeDefined();
      expect(defaults['lesson-plan']).toBeDefined();
      expect(defaults.project).toBeDefined();
      expect(defaults.presentation).toBeDefined();
      expect(defaults.activity).toBeDefined();

      expect(defaults.worksheet.length).toBeGreaterThan(0);
      if (defaults.worksheet[0]) {
        expect(defaults.worksheet[0].name).toBeDefined();
        expect(defaults.worksheet[0].description).toBeDefined();
      }
    });
  });
});