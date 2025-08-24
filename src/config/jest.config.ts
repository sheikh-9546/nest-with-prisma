import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../', // Set to the root of your project relative to the config file
  roots: ['<rootDir>/tests/unit'], // Point to the new test directory
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/$1', // Handle path aliases
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.(t|j)s',
    '!<rootDir>/src/**/*.spec.ts',
    '!<rootDir>/src/**/*.interface.ts',
    '!<rootDir>/src/**/*.dto.ts',
    '!<rootDir>/src/**/*.enum.ts'
  ],
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'], // Match test files in new location
};

export default config;
