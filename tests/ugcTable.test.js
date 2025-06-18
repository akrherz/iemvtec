/**
 * Tests for UGC table module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('datatables.net-dt', () => jest.fn());
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ 
        id: 'mock-table'
    }))
}));

import { makeUGCTable } from '../src/ugcTable.js';

describe('UGC Table', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load UGC table module without errors', () => {
        expect(typeof makeUGCTable).toBe('function');
    });

    test('should create UGC table', () => {
        expect(() => {
            makeUGCTable('test-table-id');
        }).not.toThrow();
    });

    test('should handle missing table element gracefully', () => {
        expect(() => {
            makeUGCTable('nonexistent-table');
        }).not.toThrow();
    });
});
