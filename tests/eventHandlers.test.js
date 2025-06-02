/**
 * Tests for eventHandlers.js module
 */

import { setupEventHandlers } from '../src/eventHandlers.js';

describe('eventHandlers.js module', () => {
    test('should load without errors', () => {
        expect(setupEventHandlers).toBeDefined();
    });

    test('should export setupEventHandlers function', () => {
        expect(typeof setupEventHandlers).toBe('function');
    });
});
