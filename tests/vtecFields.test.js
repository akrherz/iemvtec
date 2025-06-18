/**
 * Tests for VTEC fields module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock iemjs/domUtils
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ value: 'mock-value' })),
    requireSelectElement: jest.fn(() => ({ value: '2024' })),
    requireInputElement: jest.fn(() => ({ value: 'mock-input-value' })),
    escapeHTML: jest.fn(str => str)
}));

import { 
    getYear, setYear,
    getWFO, setWFO,
    getPhenomena, setPhenomena,
    getSignificance, setSignificance,
    getETN, setETN
} from '../src/vtecFields.js';

describe('VTEC Fields', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load VTEC fields module without errors', () => {
        expect(typeof getYear).toBe('function');
        expect(typeof setYear).toBe('function');
        expect(typeof getWFO).toBe('function');
        expect(typeof setWFO).toBe('function');
        expect(typeof getPhenomena).toBe('function');
        expect(typeof setPhenomena).toBe('function');
        expect(typeof getSignificance).toBe('function');
        expect(typeof setSignificance).toBe('function');
        expect(typeof getETN).toBe('function');
        expect(typeof setETN).toBe('function');
    });

    test('should handle year operations', () => {
        expect(() => {
            setYear('2024');
        }).not.toThrow();
        
        const year = getYear();
        expect(typeof year).toBe('number');
        expect(year).toBe(2024);
    });

    test('should handle WFO operations', () => {
        expect(() => {
            setWFO('KDMX');
        }).not.toThrow();
        
        const wfo = getWFO();
        expect(typeof wfo).toBe('string');
    });

    test('should handle phenomena operations', () => {
        expect(() => {
            setPhenomena('TO');
        }).not.toThrow();
        
        const phenomena = getPhenomena();
        expect(typeof phenomena).toBe('string');
    });

    test('should handle significance operations', () => {
        expect(() => {
            setSignificance('W');
        }).not.toThrow();
        
        const significance = getSignificance();
        expect(typeof significance).toBe('string');
    });

    test('should handle ETN operations', () => {
        expect(() => {
            setETN(123);
        }).not.toThrow();
        
        const etn = getETN();
        expect(typeof etn).toBe('number');
    });
});
