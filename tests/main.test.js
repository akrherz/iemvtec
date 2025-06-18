/**
 * Tests for main entry point module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock all dependencies
jest.mock('../src/mapManager.js', () => ({
    buildMap: jest.fn(),
    initMap: jest.fn()
}));

jest.mock('../src/tableUtils.js', () => ({
    initLSRTables: jest.fn(),
    initEventTable: jest.fn(),
    getEventTable: jest.fn(() => ({}))
}));

jest.mock('../src/eventHandlers.js', () => ({
    setupEventHandlers: jest.fn()
}));

jest.mock('../src/formInit.js', () => ({
    initializeForm: jest.fn()
}));

jest.mock('../src/dataLoader.js', () => ({
    loadTabs: jest.fn()
}));

jest.mock('../src/ugcTable.js', () => ({
    makeUGCTable: jest.fn()
}));

jest.mock('../src/uiManager.js', () => ({
    initializeUI: jest.fn()
}));

jest.mock('../src/urlUtils.js', () => ({
    consumeInitialURL: jest.fn(),
    handleURLChange: jest.fn()
}));

jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ id: 'mock' }))
}));

import { main } from '../src/main.js';

describe('Main', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock DOM elements that main() checks for
        // @ts-ignore
        document.querySelectorAll = jest.fn((selector) => {
            if (selector === 'a[data-bs-toggle="tab"]') {
                return [{ id: 'mock-tab' }];
            }
            if (selector === '#ugctable') {
                return [{ id: 'ugctable' }];
            }
            if (selector === '#eventtable') {
                return [{ id: 'eventtable' }];
            }
            if (selector === '#lsrtable') {
                return [{ id: 'lsrtable' }];
            }
            return [];
        });
    });

    test('should load main module without errors', () => {
        expect(typeof main).toBe('function');
    });

    test('should initialize application', async () => {
        expect(() => {
            main();
        }).not.toThrow();
    });
});
