import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../', // Set to the root of your project relative to the config file
  roots: ['<rootDir>/src'], // Correctly resolve the `src` directory
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/$1', // Handle path aliases
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  testMatch: ['**/*.spec.ts'], // Match test files
};

export default config;
