module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^ol/(.*)$': '<rootDir>/tests/__mocks__/ol.js',
    '^earcut$': '<rootDir>/tests/__mocks__/earcut.js'
  },
  transformIgnorePatterns: [
    'node_modules/'
  ]
};
