/**
 * Tests for UI Manager module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ 
        id: 'mock-element',
        addEventListener: jest.fn(),
        style: {}
    }))
}));

jest.mock('../src/vanillaSlider.js', () => ({
    VanillaSlider: jest.fn(() => ({
        getValue: jest.fn(() => 50),
        setValue: jest.fn(),
        setOption: jest.fn(),
        destroy: jest.fn()
    }))
}));

import { initializeUI, getTimeSlider, getTimeSliderValue, updateTimeSlider } from '../src/uiManager.js';

describe('UI Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load UI manager module without errors', () => {
        expect(typeof initializeUI).toBe('function');
        expect(typeof getTimeSlider).toBe('function');
        expect(typeof getTimeSliderValue).toBe('function');
        expect(typeof updateTimeSlider).toBe('function');
    });

    test('should initialize UI components', () => {
        expect(() => {
            initializeUI();
        }).not.toThrow();
    });

    test('should handle time slider operations', () => {
        // Test getting time slider value
        const value = getTimeSliderValue();
        expect(typeof value).toBe('number');
        
        // Test updating time slider
        expect(() => {
            updateTimeSlider(100, 50);
        }).not.toThrow();
    });
});
