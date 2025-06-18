/**
 * Tests for data loader module
 */

import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('iemjs/domUtils', () => ({
    requireElement: jest.fn(() => ({ 
        style: {},
        querySelector: jest.fn(() => ({ innerHTML: '' })),
        innerHTML: ''
    })),
    requireSelectElement: jest.fn(() => ({ 
        value: '2024',
        selectedOptions: [{ text: 'Mock Option' }]
    })),
    requireInputElement: jest.fn(() => ({ value: '45' })),
    escapeHTML: jest.fn(str => str)
}));

jest.mock('../src/tableUtils.js', () => ({
    initLSRTables: jest.fn(),
    initEventTable: jest.fn(),
    getEventTable: jest.fn(() => null),
    getLSRTable: jest.fn(() => null),
    getSBWLSRTable: jest.fn(() => null)
}));

jest.mock('../src/ugcTable.js', () => ({
    getUGCTable: jest.fn(() => null)
}));

jest.mock('../src/tabUtils.js', () => ({
    createTabHTML: jest.fn(() => '<li>mock tab</li>'),
    createTabPaneHTML: jest.fn(() => '<div>mock pane</div>')
}));

jest.mock('../src/appUtils.js', () => ({
    fetchWithParams: jest.fn(() => Promise.resolve({})),
    getData: jest.fn(() => ({ wfo: 'KDMX', year: '2024' }))
}));

jest.mock('../src/geometryLoader.js', () => ({
    loadVTECGeometry: jest.fn()
}));

jest.mock('../src/urlUtils.js', () => ({
    setLoadedVTEC: jest.fn(),
    vtecString: jest.fn(() => 'KDMX.TO.W.2024.1')
}));

jest.mock('../src/state.js', () => ({
    getState: jest.fn(),
    StateKeys: {
        ACTIVE_UPDATE: 'activeUpdate'
    }
}));

jest.mock('moment', () => {
    const mockMoment = {
        utc: jest.fn(() => ({
            local: jest.fn(() => ({
                format: jest.fn(() => '21/4:03 PM')
            })),
            format: jest.fn(() => '202405212103')
        }))
    };
    return mockMoment;
});

import { loadTabs } from '../src/dataLoader.js';

describe('Data Loader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock fetch
        // @ts-ignore
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    event_exists: true,
                    report: {
                        valid: '2024-05-21T21:03:00Z',
                        product_id: 'TEST123',
                        text: 'Test VTEC text'
                    },
                    svs: [],
                    lsrs: [],
                    geo: { type: 'FeatureCollection', features: [] }
                })
            })
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should load data loader module without errors', () => {
        expect(typeof loadTabs).toBe('function');
    });

    test('should handle loadTabs function', async () => {
        expect(() => {
            loadTabs();
        }).not.toThrow();
    });

    test('should handle fetch errors gracefully', async () => {
        // @ts-ignore
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        
        expect(() => {
            loadTabs();
        }).not.toThrow();
    });
});
