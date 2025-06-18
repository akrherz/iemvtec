/**
 * Tests for table utilities module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('datatables.net-dt', () => jest.fn());
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ 
        id: 'mock-table',
        querySelector: jest.fn(() => null)
    }))
}));

jest.mock('../src/state.js', () => ({
    setState: jest.fn(),
    getState: jest.fn(),
    StateKeys: {
        ACTIVE_TAB: 'activeTab'
    }
}));

import { initLSRTables, initEventTable, getEventTable } from '../src/tableUtils.js';

describe('Table Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load table utils module without errors', () => {
        expect(typeof initLSRTables).toBe('function');
        expect(typeof initEventTable).toBe('function');
        expect(typeof getEventTable).toBe('function');
    });

    test('should initialize LSR tables', () => {
        expect(() => {
            initLSRTables();
        }).not.toThrow();
    });

    test('should initialize event table', () => {
        expect(() => {
            initEventTable();
        }).not.toThrow();
    });

    test('should get event table', () => {
        const eventTable = getEventTable();
        // Should not throw, may return null/undefined if not initialized
        expect(eventTable).toBeDefined();
    });
});
