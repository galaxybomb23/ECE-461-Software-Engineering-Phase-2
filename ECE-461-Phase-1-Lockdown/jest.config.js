module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true, // This enables coverage reporting
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    moduleFileExtensions: ['ts', 'js'], // Allow Jest to handle TypeScript files
    testMatch: ['**/__tests__/**/*.test.ts'],
  };