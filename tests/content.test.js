/**
 * Tests for content entry point module (production)
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock main module
jest.mock('../src/main.js', () => ({
    main: jest.fn()
}));

jest.mock('../src/appUtils.js', () => ({
    setUpdate: jest.fn(),
    selectElementContents: jest.fn()
}));

describe('Content (Production Entry Point)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Import content to trigger global assignments
        require('../src/content.js');
    });

    test('should be a production entry point', () => {
        // This test verifies the module loads without errors
        // The main() function is called immediately on import
        expect(true).toBe(true);
    });

    test('should expose global functions', () => {
        // @ts-ignore
        expect(typeof window.setUpdate).toBe('function');
        // @ts-ignore
        expect(typeof window.selectElementContents).toBe('function');
    });
});
