/**
 * Tests for app entry point module (development)
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

describe('App (Development Entry Point)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock fetch for content loading
        // @ts-ignore
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('<div>Mock content</div>')
            })
        );
        
        // Mock DOM elements
        // @ts-ignore
        document.getElementById = jest.fn((id) => {
            if (id === 'vtec-content') {
                return { innerHTML: '' };
            }
            return null;
        });
        
        // Import app to trigger global assignments
        require('../src/app.js');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should be a development entry point', () => {
        // This test verifies the module loads without errors
        // The actual VTECApp class is instantiated immediately on import
        expect(true).toBe(true);
    });

    test('should expose global functions', () => {
        // The global assignment happens on module load
        // @ts-ignore
        expect(typeof window.setUpdate).toBe('function');
        // @ts-ignore
        expect(typeof window.selectElementContents).toBe('function');
    });
});
