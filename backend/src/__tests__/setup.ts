import * as dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set required environment variables for tests
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] || 'test-jwt-secret';
process.env['OPENAI_API_KEY'] = process.env['OPENAI_API_KEY'] || 'test-openai-api-key';
process.env['OPENAI_MODEL'] = process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
process.env['OPENAI_MAX_TOKENS'] = process.env['OPENAI_MAX_TOKENS'] || '2000';
process.env['OPENAI_TEMPERATURE_MATERIALS'] = process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3';

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};