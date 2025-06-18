/**
 * Tests for tab utilities module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

import { createTabHTML, createTabPaneHTML } from '../src/tabUtils.js';

describe('Tab Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load tab utils module without errors', () => {
        expect(typeof createTabHTML).toBe('function');
        expect(typeof createTabPaneHTML).toBe('function');
    });

    test('should create tab HTML', () => {
        const html = createTabHTML('#test', 'data-value', 'Test Tab');
        
        expect(typeof html).toBe('string');
        expect(html).toContain('Test Tab');
        expect(html).toContain('#test');
        expect(html).toContain('data-value');
        expect(html).toContain('nav-link');
    });

    test('should create active tab HTML', () => {
        const html = createTabHTML('#test', 'data-value', 'Test Tab', true);
        
        expect(html).toContain('active');
        expect(html).toContain('Test Tab');
    });

    test('should create tab pane HTML', () => {
        const html = createTabPaneHTML('test-id', 'Test content');
        
        expect(typeof html).toBe('string');
        expect(html).toContain('Test content');
        expect(html).toContain('test-id');
        expect(html).toContain('tab-pane');
    });

    test('should create active tab pane HTML', () => {
        const html = createTabPaneHTML('test-id', 'Test content', true);
        
        expect(html).toContain('active');
        expect(html).toContain('show');
        expect(html).toContain('Test content');
    });

    test('should handle empty content', () => {
        const html = createTabPaneHTML('test-id', '');
        expect(html).toContain('test-id');
        expect(typeof html).toBe('string');
    });
});
