/**
 * Tests for eventHandlers.js module
 */

import { jest } from '@jest/globals';

jest.mock('ol-layerswitcher', () => {
    return jest.fn().mockImplementation(() => ({}));
});

import { setupEventHandlers } from '../src/eventHandlers.js';

describe('eventHandlers.js module', () => {
    test('should load without errors', () => {
        expect(setupEventHandlers).toBeDefined();
    });

    test('should export setupEventHandlers function', () => {
        expect(typeof setupEventHandlers).toBe('function');
    });
});
