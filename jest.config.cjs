module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/tests/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^iemjs/iemdata$': '<rootDir>/node_modules/iemjs/src/iemdata.js',
    '^iemjs/domUtils$': '<rootDir>/node_modules/iemjs/src/domUtils.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(ol|ol-layerswitcher|rbush|quickselect|quick-lru|geotiff|flatgeobuf|pbf|color-space|@shoelace-style|@lit|lit|lit-html|lit-element|iemjs)/).*'
  ]

};
