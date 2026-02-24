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
    getEventTable: jest.fn(() => ({
        clear: jest.fn(),
        row: { add: jest.fn() },
        draw: jest.fn()
    })),
    getLSRTable: jest.fn(() => ({
        clear: jest.fn(),
        row: { add: jest.fn() },
        draw: jest.fn()
    })),
    getSBWLSRTable: jest.fn(() => ({
        clear: jest.fn(),
        row: { add: jest.fn() },
        draw: jest.fn()
    }))
}));

jest.mock('../src/ugcTable.js', () => ({
    getUGCTable: jest.fn(() => ({
        clear: jest.fn(),
        row: { add: jest.fn() },
        draw: jest.fn()
    }))
}));

jest.mock('../src/tabUtils.js', () => ({
    createTabHTML: jest.fn(() => '<li>mock tab</li>'),
    createTabPaneHTML: jest.fn(() => '<div>mock pane</div>')
}));

jest.mock('../src/appUtils.js', () => ({
    fetchWithParams: jest.fn((url) => {
        if (url.includes('vtec_events.py')) {
            return Promise.resolve({ events: [] });
        }
        return Promise.resolve({
            event_exists: true,
            report: {
                valid: '2024-05-21T21:03:00Z',
                product_id: 'TEST123',
                text: 'Test VTEC text'
            },
            svs: [],
            ugcs: [],
            lsrs: [],
            geo: { type: 'FeatureCollection', features: [] },
            utc_issue: '2024-05-21T21:03:00Z',
            utc_expire: '2024-05-21T22:03:00Z'
        });
    }),
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
    setState: jest.fn(),
    getState: jest.fn(),
    StateKeys: {
        ISSUE: 'issue',
        EXPIRE: 'expire',
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
        await Promise.resolve();
    });

    test('should handle fetch errors gracefully', async () => {
        const { fetchWithParams } = await import('../src/appUtils.js');
        fetchWithParams.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
        const originalConsoleError = console.error;
        console.error = () => {};
        try {
            expect(() => {
                loadTabs();
            }).not.toThrow();
            await new Promise((resolve) => setTimeout(resolve, 0));
        } finally {
            console.error = originalConsoleError;
        }
    });
});
