const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customConfig = {
  setupFilesAfterFramework: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customConfig);
