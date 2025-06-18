/**
 * Tests for geometry loader module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock OpenLayers dependencies
jest.mock('ol/source', () => ({
    Vector: jest.fn()
}));

jest.mock('ol/layer', () => ({
    Vector: jest.fn()
}));

jest.mock('ol/style', () => ({
    Style: jest.fn(),
    Stroke: jest.fn(),
    Fill: jest.fn(),
    Icon: jest.fn(),
    Circle: jest.fn(),
    Text: jest.fn()
}));

jest.mock('../src/mapManager.js', () => ({
    getProductVectorCountyLayer: jest.fn(() => ({
        setSource: jest.fn(),
        getSource: jest.fn(() => ({
            getExtent: jest.fn(() => [0, 0, 100, 100])
        }))
    })),
    getProductVectorSBWLayer: jest.fn(() => ({
        setSource: jest.fn()
    })),
    getProductVectorLSRLayer: jest.fn(() => ({
        setSource: jest.fn()
    })),
    getMap: jest.fn(() => ({
        getView: jest.fn(() => ({
            fit: jest.fn()
        }))
    }))
}));

jest.mock('../src/appUtils.js', () => ({
    createGeoJSONVectorSource: jest.fn(() => ({})),
    getData: jest.fn(() => ({
        wfo: 'KDMX',
        phenomena: 'TO',
        significance: 'W',
        etn: 45,
        year: '2024'
    })),
    fetchWithParams: jest.fn(() => Promise.resolve({}))
}));

import { loadVTECGeometry } from '../src/geometryLoader.js';

describe('Geometry Loader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load geometry loader module without errors', () => {
        expect(typeof loadVTECGeometry).toBe('function');
    });

    test('should load VTEC geometry', () => {
        const mockLSRTable = { clear: jest.fn(), rows: { add: jest.fn() } };
        const mockSBWLSRTable = { clear: jest.fn(), rows: { add: jest.fn() } };
        
        expect(() => {
            loadVTECGeometry(mockLSRTable, mockSBWLSRTable);
        }).not.toThrow();
    });

    test('should handle missing tables gracefully', () => {
        expect(() => {
            loadVTECGeometry(null, null);
        }).not.toThrow();
    });
});
