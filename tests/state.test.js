/**
 * Tests for state management module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock iemjs/domUtils
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(),
    requireSelectElement: jest.fn(),
    requireInputElement: jest.fn()
}));

import { setState, getState, StateKeys, subscribeToState } from '../src/state.js';

describe('State Management', () => {
    beforeEach(() => {
        // Reset state before each test
        jest.clearAllMocks();
    });

    test('should load state module without errors', () => {
        expect(StateKeys).toBeDefined();
        expect(typeof setState).toBe('function');
        expect(typeof getState).toBe('function');
        expect(typeof subscribeToState).toBe('function');
    });

    test('should have defined state keys', () => {
        expect(StateKeys.WFO).toBeDefined();
        expect(StateKeys.RADAR).toBeDefined();
        expect(StateKeys.ISSUE).toBeDefined();
        expect(StateKeys.EXPIRE).toBeDefined();
        expect(StateKeys.ACTIVE_TAB).toBeDefined();
    });

    test('should set and get state values', () => {
        setState(StateKeys.WFO, 'KDMX');
        expect(getState(StateKeys.WFO)).toBe('KDMX');
    });

    test('should handle state subscription', () => {
        const callback = jest.fn();
        subscribeToState(StateKeys.WFO, callback);
        
        setState(StateKeys.WFO, 'KDSM');
        expect(callback).toHaveBeenCalled();
    });
});
