/**
 * Tests for map manager module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock OpenLayers dependencies first, before any imports
jest.mock('ol', () => ({
    Overlay: jest.fn().mockImplementation(() => ({})),
    Map: jest.fn().mockImplementation(() => ({
        getView: jest.fn(() => ({
            setCenter: jest.fn(),
            getCenter: jest.fn(),
            getZoom: jest.fn(),
            setZoom: jest.fn()
        })),
        addLayer: jest.fn(),
        removeLayer: jest.fn(),
        getLayers: jest.fn(() => ({
            getArray: jest.fn(() => [])
        })),
        addInteraction: jest.fn(),
        removeInteraction: jest.fn(),
        addOverlay: jest.fn(),
        removeOverlay: jest.fn()
    })),
    View: jest.fn().mockImplementation(() => ({
        setCenter: jest.fn(),
        getCenter: jest.fn(),
        getZoom: jest.fn(),
        setZoom: jest.fn()
    }))
}));

jest.mock('ol/Map', () => jest.fn().mockImplementation(() => ({
    getView: jest.fn(() => ({
        setCenter: jest.fn(),
        getCenter: jest.fn(),
        getZoom: jest.fn(),
        setZoom: jest.fn()
    })),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    getLayers: jest.fn(() => ({
        getArray: jest.fn(() => [])
    })),
    addInteraction: jest.fn(),
    removeInteraction: jest.fn(),
    addOverlay: jest.fn(),
    removeOverlay: jest.fn()
})));

jest.mock('ol/View', () => jest.fn().mockImplementation(() => ({
    setCenter: jest.fn(),
    getCenter: jest.fn(),
    getZoom: jest.fn(),
    setZoom: jest.fn()
})));

jest.mock('ol/layer', () => ({
    Tile: jest.fn().mockImplementation(() => ({
        setSource: jest.fn(),
        getSource: jest.fn(),
        setVisible: jest.fn(),
        getVisible: jest.fn()
    })),
    Vector: jest.fn().mockImplementation(() => ({
        setSource: jest.fn(),
        getSource: jest.fn(() => ({
            clear: jest.fn(),
            addFeatures: jest.fn(),
            getFeatures: jest.fn(() => [])
        })),
        setStyle: jest.fn(),
        setVisible: jest.fn(),
        getVisible: jest.fn()
    }))
}));

jest.mock('ol/source', () => {
    const MockXYZ = function(options) {
        this.options = options;
        return this;
    };
    
    const MockVector = function() {
        this.clear = jest.fn();
        this.addFeatures = jest.fn();
        this.getFeatures = jest.fn(() => []);
        return this;
    };
    
    const MockOSM = function() {
        return this;
    };
    
    return {
        OSM: MockOSM,
        XYZ: MockXYZ,
        Vector: MockVector
    };
});

jest.mock('ol/style', () => ({
    Style: jest.fn().mockImplementation(() => ({})),
    Stroke: jest.fn().mockImplementation(() => ({})),
    Fill: jest.fn().mockImplementation(() => ({})),
    Icon: jest.fn().mockImplementation(() => ({})),
    Circle: jest.fn().mockImplementation(() => ({})),
    Text: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('ol/proj', () => ({
    transform: jest.fn().mockImplementation((coords) => coords)
}));

jest.mock('ol/format', () => ({
    GeoJSON: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('ol-layerswitcher', () => {
    return jest.fn().mockImplementation(() => ({}));
});

// Mock other dependencies
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ 
        id: 'mock-map',
        style: {}
    })),
    requireSelectElement: jest.fn(() => ({ value: 'KDMX' }))
}));

jest.mock('../src/state.js', () => ({
    getState: jest.fn(),
    setState: jest.fn(),
    StateKeys: {
        RADAR: 'radar',
        RADAR_PRODUCT: 'radarProduct'
    }
}));

// Now import the module under test
import { buildMap, initMap, getMap } from '../src/mapManager.js';

describe('Map Manager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should load map manager module without errors', () => {
        // The main achievement here is that the module loads without the Icon constructor error
        expect(typeof buildMap).toBe('function');
        expect(typeof initMap).toBe('function');
        expect(typeof getMap).toBe('function');
    });
});
