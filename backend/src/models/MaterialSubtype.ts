import { Pool } from 'pg';
import pool from '../database/connection';
import { MaterialType } from '../services/AssignmentAnalyzer';

export interface MaterialSubtypeData {
  id?: string;
  parentType: MaterialType;
  name: string;
  description?: string;
  specialFields?: TemplateField[];
  promptModifications?: PromptModification[];
  validationRules?: ValidationRules;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateField {
  name: string;
  type: 'text' | 'select' | 'multiselect' | 'boolean' | 'number';
  label: string;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
}

export interface PromptModification {
  type: 'prepend' | 'append' | 'replace' | 'inject';
  target?: string;
  content: string;
  condition?: string;
}

export interface ValidationRules {
  minFields?: number;
  maxFields?: number;
  requiredFields?: string[];
  customRules?: CustomRule[];
}

export interface CustomRule {
  field: string;
  rule: string;
  message: string;
}

export class MaterialSubtypeModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async findAll(): Promise<MaterialSubtypeData[]> {
    const query = `
      SELECT 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM material_subtypes 
      WHERE is_active = true
      ORDER BY parent_type, name
    `;

    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToSubtype(row));
  }

  async findByParentType(parentType: MaterialType): Promise<MaterialSubtypeData[]> {
    const query = `
      SELECT 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM material_subtypes 
      WHERE parent_type = $1 AND is_active = true
      ORDER BY name
    `;

    const result = await this.pool.query(query, [parentType]);
    return result.rows.map(row => this.mapRowToSubtype(row));
  }

  async findById(id: string): Promise<MaterialSubtypeData | null> {
    const query = `
      SELECT 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM material_subtypes 
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubtype(result.rows[0]);
  }

  async findByName(parentType: MaterialType, name: string): Promise<MaterialSubtypeData | null> {
    const query = `
      SELECT 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM material_subtypes 
      WHERE parent_type = $1 AND name = $2 AND is_active = true
    `;

    const result = await this.pool.query(query, [parentType, name]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubtype(result.rows[0]);
  }

  async create(subtypeData: Omit<MaterialSubtypeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaterialSubtypeData> {
    const query = `
      INSERT INTO material_subtypes (
        parent_type,
        name,
        description,
        special_fields,
        prompt_modifications,
        validation_rules,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const values = [
      subtypeData.parentType,
      subtypeData.name,
      subtypeData.description || null,
      JSON.stringify(subtypeData.specialFields || []),
      JSON.stringify(subtypeData.promptModifications || []),
      JSON.stringify(subtypeData.validationRules || {}),
      subtypeData.isActive !== false // Default to true
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToSubtype(result.rows[0]);
  }

  async update(id: string, subtypeData: Partial<Omit<MaterialSubtypeData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MaterialSubtypeData | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (subtypeData.parentType !== undefined) {
      fields.push(`parent_type = $${paramIndex++}`);
      values.push(subtypeData.parentType);
    }

    if (subtypeData.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(subtypeData.name);
    }

    if (subtypeData.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(subtypeData.description);
    }

    if (subtypeData.specialFields !== undefined) {
      fields.push(`special_fields = $${paramIndex++}`);
      values.push(JSON.stringify(subtypeData.specialFields));
    }

    if (subtypeData.promptModifications !== undefined) {
      fields.push(`prompt_modifications = $${paramIndex++}`);
      values.push(JSON.stringify(subtypeData.promptModifications));
    }

    if (subtypeData.validationRules !== undefined) {
      fields.push(`validation_rules = $${paramIndex++}`);
      values.push(JSON.stringify(subtypeData.validationRules));
    }

    if (subtypeData.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(subtypeData.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE material_subtypes 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSubtype(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete by setting is_active to false
    const query = `
      UPDATE material_subtypes 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    // Hard delete - only use if no references exist
    const query = `DELETE FROM material_subtypes WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async getSubtypesByMaterialType(): Promise<Record<MaterialType, MaterialSubtypeData[]>> {
    const subtypes = await this.findAll();
    const grouped: Record<string, MaterialSubtypeData[]> = {};

    for (const subtype of subtypes) {
      if (!grouped[subtype.parentType]) {
        grouped[subtype.parentType] = [];
      }
      grouped[subtype.parentType]!.push(subtype);
    }

    return grouped as Record<MaterialType, MaterialSubtypeData[]>;
  }

  async validateSubtypeExists(parentType: MaterialType, subtypeId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM material_subtypes 
      WHERE id = $1 AND parent_type = $2 AND is_active = true
    `;

    const result = await this.pool.query(query, [subtypeId, parentType]);
    return result.rows.length > 0;
  }

  async getDefaultSubtype(parentType: MaterialType): Promise<MaterialSubtypeData | null> {
    // Get the first active subtype for the given parent type
    const subtypes = await this.findByParentType(parentType);
    return subtypes.length > 0 ? subtypes[0]! : null;
  }

  async searchSubtypes(searchTerm: string, parentType?: MaterialType): Promise<MaterialSubtypeData[]> {
    let query = `
      SELECT 
        id,
        parent_type as "parentType",
        name,
        description,
        special_fields as "specialFields",
        prompt_modifications as "promptModifications",
        validation_rules as "validationRules",
        is_active as "isActive",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM material_subtypes 
      WHERE is_active = true 
        AND (name ILIKE $1 OR description ILIKE $1)
    `;

    const values: any[] = [`%${searchTerm}%`];

    if (parentType) {
      query += ` AND parent_type = $2`;
      values.push(parentType);
    }

    query += ` ORDER BY parent_type, name`;

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToSubtype(row));
  }

  async getUsageStats(): Promise<Record<string, number>> {
    const query = `
      SELECT 
        ms.name,
        COUNT(gf.id) as usage_count
      FROM material_subtypes ms
      LEFT JOIN generated_files gf ON ms.id = gf.material_subtype_id
      WHERE ms.is_active = true
      GROUP BY ms.id, ms.name
      ORDER BY usage_count DESC
    `;

    const result = await this.pool.query(query);
    const stats: Record<string, number> = {};
    
    for (const row of result.rows) {
      stats[row.name] = parseInt(row.usage_count, 10);
    }

    return stats;
  }

  private mapRowToSubtype(row: any): MaterialSubtypeData {
    return {
      id: row.id,
      parentType: row.parentType,
      name: row.name,
      description: row.description,
      specialFields: row.specialFields || [],
      promptModifications: row.promptModifications || [],
      validationRules: row.validationRules || {},
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  // Static helper methods
  static validateSpecialFields(fields: TemplateField[]): string[] {
    const errors: string[] = [];

    for (const field of fields) {
      if (!field.name || typeof field.name !== 'string') {
        errors.push('Field name is required and must be a string');
      }

      if (!field.type || !['text', 'select', 'multiselect', 'boolean', 'number'].includes(field.type)) {
        errors.push(`Invalid field type: ${field.type}`);
      }

      if (!field.label || typeof field.label !== 'string') {
        errors.push('Field label is required and must be a string');
      }

      if ((field.type === 'select' || field.type === 'multiselect') && (!field.options || !Array.isArray(field.options))) {
        errors.push(`Field ${field.name} of type ${field.type} must have options array`);
      }
    }

    return errors;
  }

  static validatePromptModifications(modifications: PromptModification[]): string[] {
    const errors: string[] = [];

    for (const mod of modifications) {
      if (!mod.type || !['prepend', 'append', 'replace', 'inject'].includes(mod.type)) {
        errors.push(`Invalid modification type: ${mod.type}`);
      }

      if (!mod.content || typeof mod.content !== 'string') {
        errors.push('Modification content is required and must be a string');
      }

      if ((mod.type === 'replace' || mod.type === 'inject') && !mod.target) {
        errors.push(`Modification type ${mod.type} requires a target`);
      }
    }

    return errors;
  }

  static getDefaultSubtypes(): Record<MaterialType, Partial<MaterialSubtypeData>[]> {
    return {
      'worksheet': [
        {
          name: 'Cvičné úlohy',
          description: 'Strukturované cvičení pro procvičování nových dovedností'
        },
        {
          name: 'Domácí úkol',
          description: 'Samostatná práce pro upevnění učiva doma'
        },
        {
          name: 'Kontrolní práce',
          description: 'Hodnotící worksheet pro ověření znalostí'
        }
      ],
      'quiz': [
        {
          name: 'Formativní hodnocení',
          description: 'Průběžné ověření porozumění během výuky'
        },
        {
          name: 'Sumativní test',
          description: 'Komplexní hodnocení na konci učební jednotky'
        }
      ],
      'lesson-plan': [
        {
          name: 'Úvodní hodina',
          description: 'Představení nového tématu nebo konceptu'
        },
        {
          name: 'Procvičovací hodina',
          description: 'Upevnění a procvičení nových dovedností'
        }
      ],
      'project': [
        {
          name: 'Výzkumný projekt',
          description: 'Samostatný výzkum na zvolené téma'
        },
        {
          name: 'Kreativní projekt',
          description: 'Tvůrčí práce s důrazem na originalitu'
        }
      ],
      'presentation': [
        {
          name: 'Výukové slidy',
          description: 'Prezentace pro výklad nového učiva'
        },
        {
          name: 'Studentská prezentace',
          description: 'Šablona pro prezentace žáků'
        }
      ],
      'activity': [
        {
          name: 'Zahřívací aktivita',
          description: 'Krátká aktivita na začátek hodiny'
        },
        {
          name: 'Skupinová práce',
          description: 'Kolaborativní aktivita pro týmovou práci'
        }
      ]
    };
  }
}

export default MaterialSubtypeModel;