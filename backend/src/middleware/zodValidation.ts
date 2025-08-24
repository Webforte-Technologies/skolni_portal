import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

/**
 * Zod validation middleware for Express.js
 * Replaces express-validator with type-safe Zod validation
 */

interface ValidationError {
  field: string;
  message: string;
  code: string;
  received?: any;
}

interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
  data?: any;
}

/**
 * Transforms Zod errors into a consistent format
 */
function transformZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
    received: (err as any).received // Type assertion for backward compatibility
  }));
}

/**
 * Validates request body using a Zod schema
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = transformZodErrors(error);
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
        return;
      }
      
      // Handle unexpected errors
      console.error('Unexpected validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
      return;
    }
  };
}

/**
 * Validates request parameters using a Zod schema
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = transformZodErrors(error);
        res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: validationErrors
        });
        return;
      }
      
      console.error('Unexpected parameter validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
      return;
    }
  };
}

/**
 * Validates request query parameters using a Zod schema
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = transformZodErrors(error);
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: validationErrors
        });
        return;
      }
      
      console.error('Unexpected query validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
      return;
    }
  };
}

/**
 * Combined validation for body, params, and query
 */
export function validate<T extends Record<string, ZodSchema>>(schemas: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];
    
    try {
      // Validate body if schema provided
      if ('body' in schemas && schemas['body']) {
        try {
          req.body = schemas['body'].parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...transformZodErrors(error));
          }
        }
      }
      
      // Validate params if schema provided
      if ('params' in schemas && schemas['params']) {
        try {
          req.params = schemas['params'].parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...transformZodErrors(error));
          }
        }
      }
      
      // Validate query if schema provided
      if ('query' in schemas && schemas['query']) {
        try {
          req.query = schemas['query'].parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(...transformZodErrors(error));
          }
        }
      }
      
      // If there are validation errors, return them
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Unexpected validation error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal validation error'
      });
      return;
    }
  };
}

/**
 * Utility function to safely validate data without throwing
 */
export function safeValidate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: transformZodErrors(error)
      };
    }
    
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Unexpected validation error',
        code: 'custom'
      }]
    };
  }
}

/**
 * Middleware to validate file uploads
 */
export function validateFile(options: {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { required = false, maxSize, allowedTypes, maxFiles = 1 } = options;
    
    // Check if file is required but missing
    if (required && (!req.file && !req.files)) {
      res.status(400).json({
        success: false,
        error: 'File is required'
      });
      return;
    }
    
    // Get files array (handle both single file and multiple files)
    const files = req.files ? 
      (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : 
      (req.file ? [req.file] : []);
    
    // Check file count
    if (files.length > maxFiles) {
      res.status(400).json({
        success: false,
        error: `Too many files. Maximum allowed: ${maxFiles}`
      });
      return;
    }
    
    // Validate each file
    for (const file of files) {
      // Check file size
      if (maxSize && file.size > maxSize) {
        res.status(400).json({
          success: false,
          error: `File too large. Maximum size: ${maxSize} bytes`
        });
        return;
      }
      
      // Check file type
      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
        return;
      }
    }
    
    next();
  };
}

// Export types for TypeScript usage
export type { ValidationError, ValidationResult };
