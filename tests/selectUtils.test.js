/**
 * Tests for select utilities module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock iemjs dependencies
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ innerHTML: '' })),
    requireSelectElement: jest.fn(() => ({ 
        innerHTML: '',
        value: 'test-value',
        querySelector: jest.fn()
    }))
}));

import { buildSelectOptions, populateSelect } from '../src/selectUtils.js';

describe('Select Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load select utils module without errors', () => {
        expect(typeof buildSelectOptions).toBe('function');
        expect(typeof populateSelect).toBe('function');
    });

    test('should build select options from array data', () => {
        const data = [['key1', 'Value 1'], ['key2', 'Value 2']];
        const options = buildSelectOptions(data);
        
        expect(typeof options).toBe('string');
        expect(options).toContain('Value 1');
        expect(options).toContain('Value 2');
        expect(options).toContain('key1');
        expect(options).toContain('key2');
    });

    test('should handle custom template', () => {
        const data = [['key1', 'Value 1']];
        const template = '<option value="{value}" class="custom">{text}</option>';
        const options = buildSelectOptions(data, template);
        
        expect(options).toContain('class="custom"');
        expect(options).toContain('Value 1');
    });

    test('should handle empty data', () => {
        const options = buildSelectOptions([]);
        expect(typeof options).toBe('string');
        expect(options).toBe('');
    });

    test('should populate select element', () => {
        const data = [['key1', 'Value 1']];
        
        expect(() => {
            populateSelect('test-select', data, 'key1');
        }).not.toThrow();
    });
});
