/**
 * Tests for UGC table module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

describe('UGC Table', () => {
    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = '<table id="test-table-id"></table>';
    });

    test('should load UGC table module without errors', async () => {
        const { makeUGCTable } = await import('../src/ugcTable.js');
        expect(typeof makeUGCTable).toBe('function');
    });

    test('should create UGC table', async () => {
        const { makeUGCTable } = await import('../src/ugcTable.js');
        expect(() => {
            makeUGCTable('test-table-id');
        }).not.toThrow();
    });

    test('should handle missing table element gracefully', async () => {
        const { makeUGCTable } = await import('../src/ugcTable.js');
        expect(() => {
            makeUGCTable('nonexistent-table');
        }).not.toThrow();
    });
});
