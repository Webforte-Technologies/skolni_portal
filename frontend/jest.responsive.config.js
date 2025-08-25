/**
 * Jest configuration for responsive testing
 * Specialized configuration for testing responsive components
 */

import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  displayName: 'Responsive Tests',
  testMatch: [
    '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/', // Exclude the tests directory which contains Playwright tests
    '\\.spec\\.ts$' // Exclude .spec.ts files which are typically Playwright tests
  ],
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv
  ],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@/utils/testing$': '<rootDir>/src/utils/testing/index.ts'
  },
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    '!src/components/**/*.stories.{js,jsx,ts,tsx}',
    '!src/utils/testing/examples/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  // Ensure ES module handling is properly configured
  transform: {
    ...baseConfig.transform,
  },
  transformIgnorePatterns: [
    ...baseConfig.transformIgnorePatterns,
  ],
  globals: {
    ...baseConfig.globals,
  },
};