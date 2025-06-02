/**
 * Tests for formInit.js module
 */

describe('formInit.js module', () => {
    test('should load without errors', () => {
        expect(() => {
            require('../src/formInit.js');
        }).not.toThrow();
    });

    test('should export expected functions', () => {
        const formInit = require('../src/formInit.js');
        
        expect(typeof formInit.initializeWFOSelect).toBe('function');
        expect(typeof formInit.initializePhenomenaSelect).toBe('function');
        expect(typeof formInit.initializeSignificanceSelect).toBe('function');
        expect(typeof formInit.initializeYearSelect).toBe('function');
        expect(typeof formInit.initializeETN).toBe('function');
        expect(typeof formInit.initializeForm).toBe('function');
    });
});
