module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    "^src/environments/environment$": "<rootDir>/src/environments/environment.ts"
  },
  maxWorkers: 1,
  collectCoverage: true
};
