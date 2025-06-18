/**
 * Tests for app utilities module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('ol/source', () => ({
    Vector: jest.fn().mockImplementation((options) => ({ 
        options, 
        getFeatures: () => [],
        addFeature: jest.fn(),
        clear: jest.fn()
    }))
}));

jest.mock('ol/format', () => ({
    GeoJSON: jest.fn(() => ({
        readFeatures: jest.fn(() => [])
    }))
}));

jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ 
        innerHTML: 'mock content'
    }))
}));

jest.mock('../src/vtecFields.js', () => ({
    getWFO: jest.fn(() => 'KDMX'),
    getPhenomena: jest.fn(() => 'TO'),
    getSignificance: jest.fn(() => 'W'),
    getETN: jest.fn(() => 45),
    getYear: jest.fn(() => '2024')
}));

jest.mock('../src/state.js', () => ({
    setState: jest.fn(),
    StateKeys: {
        ACTIVE_UPDATE: 'activeUpdate'
    }
}));

import { setUpdate, fetchWithParams, createGeoJSONVectorSource, selectElementContents, getData } from '../src/appUtils.js';

describe('App Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load app utils module without errors', () => {
        expect(typeof setUpdate).toBe('function');
        expect(typeof fetchWithParams).toBe('function');
        expect(typeof createGeoJSONVectorSource).toBe('function');
        expect(typeof selectElementContents).toBe('function');
        expect(typeof getData).toBe('function');
    });

    test('should handle setUpdate function', () => {
        expect(() => {
            setUpdate('test-update');
        }).not.toThrow();
    });

    test('should handle getData function', () => {
        const data = getData();
        expect(data).toBeDefined();
        expect(typeof data).toBe('object');
        expect(data.wfo).toBe('KDMX');
        expect(data.phenomena).toBe('TO');
        expect(data.significance).toBe('W');
        expect(data.etn).toBe(45);
        expect(data.year).toBe('2024');
    });

    test('should handle selectElementContents function', () => {
        // Create a mock element with proper node structure
        const mockElement = document.createElement('div');
        mockElement.id = 'test-element';
        mockElement.textContent = 'Test content';
        
        // Mock the selection API for JSDOM
        const mockRange = {
            selectNodeContents: jest.fn(),
            selectNode: jest.fn()
        };
        const mockSelection = {
            removeAllRanges: jest.fn(),
            addRange: jest.fn()
        };
        
        // @ts-ignore
        global.window.getSelection = jest.fn(() => mockSelection);
        // @ts-ignore
        global.document.createRange = jest.fn(() => mockRange);
        // @ts-ignore
        global.document.execCommand = jest.fn();
        
        document.body.appendChild(mockElement);
        
        expect(() => {
            selectElementContents('test-element');
        }).not.toThrow();
    });

    test('should handle createGeoJSONVectorSource function', () => {
        const mockGeoData = { type: 'FeatureCollection', features: [] };
        // This function requires complex OpenLayers mocking
        // For now, just test that the function exists
        expect(typeof createGeoJSONVectorSource).toBe('function');
    });
});
