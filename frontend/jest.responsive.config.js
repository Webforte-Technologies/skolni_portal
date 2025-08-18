/**
 * Jest configuration for responsive testing
 * Specialized configuration for testing responsive components
 */

const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  displayName: 'Responsive Tests',
  testMatch: [
    '<rootDir>/src/**/*.responsive.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/utils/testing/**/*.test.{js,jsx,ts,tsx}'
  ],
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    '<rootDir>/src/utils/testing/setup/responsiveTestSetup.ts'
  ],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  moduleNameMapping: {
    ...baseConfig.moduleNameMapping,
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
  }
};