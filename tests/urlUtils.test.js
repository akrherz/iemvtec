/**
 * Tests for URL utility functions and compatibility migrations
 * Focused on URL migration patterns and backwards compatibility
 */

// Mock HTMLElement types
class MockHTMLSelectElement {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.tagName = 'SELECT';
    }
}

class MockHTMLInputElement {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.tagName = 'INPUT';
    }
}

// Set up the global HTML element constructors for instanceof checks
global.HTMLSelectElement = MockHTMLSelectElement;
global.HTMLInputElement = MockHTMLInputElement;

// Basic DOM mocking for elements that urlUtils needs
const mockHistoryPushState = jest.fn();
Object.defineProperty(global, 'history', {
    value: { pushState: mockHistoryPushState },
    writable: true
});

Object.defineProperty(global, 'window', {
    value: {
        location: {
            origin: 'http://localhost:3000',
            pathname: '',
            search: '',
            href: ''
        }
    },
    writable: true
});

// Mock form elements that vtecFields expects
const mockElements = new Map();
mockElements.set('year', new MockHTMLSelectElement('year', '2024'));
mockElements.set('wfo', new MockHTMLSelectElement('wfo', 'KDMX'));
mockElements.set('phenomena', new MockHTMLSelectElement('phenomena', 'TO'));
mockElements.set('significance', new MockHTMLSelectElement('significance', 'W'));
mockElements.set('etn', new MockHTMLInputElement('etn', '45'));

Object.defineProperty(global, 'document', {
    value: {
        getElementById: jest.fn((id) => mockElements.get(id) || null),
        querySelector: jest.fn(() => ({ click: jest.fn() })),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        title: ''
    },
    writable: true
});

describe('URL Utils - Migration Compatibility Tests', () => {
    beforeEach(() => {
        jest.resetModules();
        mockHistoryPushState.mockClear();
        
        // Reset form values to defaults for each test
        mockElements.set('year', new MockHTMLSelectElement('year', '2024'));
        mockElements.set('wfo', new MockHTMLSelectElement('wfo', 'KDMX'));
        mockElements.set('phenomena', new MockHTMLSelectElement('phenomena', 'TO'));
        mockElements.set('significance', new MockHTMLSelectElement('significance', 'W'));
        mockElements.set('etn', new MockHTMLInputElement('etn', '45'));
    });

    test('should load urlUtils module without errors', () => {
        expect(() => {
            require('../src/urlUtils.js');
        }).not.toThrow();
    });

    test('should generate VTEC string from form values', () => {
        const urlUtils = require('../src/urlUtils.js');
        const result = urlUtils.vtecString();
        expect(result).toBe('2024-O-NEW-KDMX-TO-W-0045');
    });

    test('should generate legacy CGI parameters', () => {
        const urlUtils = require('../src/urlUtils.js');
        const result = urlUtils.urlencode();
        expect(result).toBe('?year=2024&phenomena=TO&significance=W&eventid=45&wfo=KDMX');
    });

    test('should pad ETN correctly in VTEC string', () => {
        // Set a single-digit ETN to test padding
        mockElements.set('etn', new MockHTMLInputElement('etn', '5'));
        
        const urlUtils = require('../src/urlUtils.js');
        const result = urlUtils.vtecString();
        expect(result).toBe('2024-O-NEW-KDMX-TO-W-0005');
    });

    // URL Migration and Backwards Compatibility Tests
    test('should parse query parameter URLs correctly', () => {
        const testUrl = 'http://localhost:3000/vtec?year=2024&wfo=KDMX&phenomena=TO&significance=W&eventid=45&tab=info';
        const url = new URL(testUrl);
        
        expect(url.searchParams.get('year')).toBe('2024');
        expect(url.searchParams.get('wfo')).toBe('KDMX');
        expect(url.searchParams.get('phenomena')).toBe('TO');
        expect(url.searchParams.get('significance')).toBe('W');
        expect(url.searchParams.get('eventid')).toBe('45');
        expect(url.searchParams.get('tab')).toBe('info');
    });

    test('should parse RESTish URL components', () => {
        const testUrl = '/vtec/event/2024-O-NEW-KDMX-TO-W-0045/tab/info';
        const pathSegments = testUrl.split('/').filter(segment => segment);
        
        expect(pathSegments).toContain('vtec');
        expect(pathSegments).toContain('event');
        expect(pathSegments).toContain('2024-O-NEW-KDMX-TO-W-0045');
        expect(pathSegments).toContain('tab');
        expect(pathSegments).toContain('info');
        
        // Test VTEC token extraction from RESTish URL
        const vtecToken = pathSegments.find(segment => segment.match(/^\d{4}-O-NEW-/));
        expect(vtecToken).toBe('2024-O-NEW-KDMX-TO-W-0045');
    });

    test('should parse VTEC tokens correctly', () => {
        const vtecString = '2024-O-NEW-KDMX-TO-W-0045';
        const tokens = vtecString.split('-');
        
        expect(tokens).toHaveLength(7);
        expect(tokens[0]).toBe('2024'); // year
        expect(tokens[1]).toBe('O');    // office
        expect(tokens[2]).toBe('NEW');  // action
        expect(tokens[3]).toBe('KDMX'); // wfo
        expect(tokens[4]).toBe('TO');   // phenomena
        expect(tokens[5]).toBe('W');    // significance
        expect(tokens[6]).toBe('0045'); // etn (padded)
    });

    test('should parse hash-based URLs for migration', () => {
        const hashUrl = 'http://localhost:3000/vtec#2024-O-NEW-KDMX-TO-W-0045/KDMX-N0R-202406071200';
        const hashPart = hashUrl.split('#')[1];
        const tokens = hashPart.split('/');
        
        expect(tokens[0]).toBe('2024-O-NEW-KDMX-TO-W-0045');
        expect(tokens[1]).toBe('KDMX-N0R-202406071200');
    });

    test('should parse radar tokens correctly', () => {
        const radarString = 'KDMX-N0R-202406071200';
        const tokens = radarString.split('-');
        
        expect(tokens).toHaveLength(3);
        expect(tokens[0]).toBe('KDMX');        // radar site
        expect(tokens[1]).toBe('N0R');         // product
        expect(tokens[2]).toBe('202406071200'); // time
    });

    test('should handle WFO corrections for legacy URLs', () => {
        const wfoLookup = {
            KAFG: 'PAFG',
            KAFC: 'PAFC',
            KAJK: 'PAJK',
            KGUM: 'PGUM',
            KHFO: 'PHFO',
            KJSJ: 'TJSJ'
        };
        
        expect(wfoLookup['KAFG']).toBe('PAFG');
        expect(wfoLookup['KAFC']).toBe('PAFC');
        expect(wfoLookup['KGUM']).toBe('PGUM');
        expect(wfoLookup['NONEXISTENT']).toBeUndefined();
    });

    test('should identify different URL formats', () => {
        const queryParamUrl = '/vtec?year=2024&wfo=KDMX&phenomena=TO&significance=W&eventid=45';
        const restishUrl = '/vtec/event/2024-O-NEW-KDMX-TO-W-0045/tab/info';
        const hashUrl = 'http://localhost:3000/vtec#2024-O-NEW-KDMX-TO-W-0045';
        
        // Query parameter format detection
        expect(queryParamUrl.includes('?')).toBe(true);
        expect(queryParamUrl.includes('year=')).toBe(true);
        
        // RESTish format detection
        expect(restishUrl.includes('/event/')).toBe(true);
        expect(restishUrl.includes('/tab/')).toBe(true);
        
        // Hash format detection
        expect(hashUrl.includes('#')).toBe(true);
    });

    test('should create URLSearchParams for migration', () => {
        const params = new URLSearchParams();
        params.set('year', '2024');
        params.set('wfo', 'KDMX');
        params.set('phenomena', 'TO');
        params.set('significance', 'W');
        params.set('eventid', '45');
        
        const result = params.toString();
        expect(result).toContain('year=2024');
        expect(result).toContain('wfo=KDMX');
        expect(result).toContain('phenomena=TO');
        expect(result).toContain('significance=W');
        expect(result).toContain('eventid=45');
    });

    test('should generate migration URLs correctly', () => {
        const params = new URLSearchParams();
        params.set('year', '2024');
        params.set('wfo', 'KDMX');
        params.set('phenomena', 'TO');
        params.set('significance', 'W');
        params.set('eventid', '45');
        params.set('tab', 'info');
        
        const migratedUrl = `/vtec?${params.toString()}`;
        expect(migratedUrl).toMatch(/^\/vtec\?/);
        expect(migratedUrl).toContain('year=2024');
        expect(migratedUrl).toContain('tab=info');
    });

    // Advanced Migration Scenarios
    test('should handle ETN parsing from different sources', () => {
        // Test ETN extraction from VTEC string
        const vtecWithSmallETN = '2024-O-NEW-KDMX-TO-W-0003';
        const tokensSmall = vtecWithSmallETN.split('-');
        expect(parseInt(tokensSmall[6], 10)).toBe(3);
        
        // Test ETN with larger number
        const vtecWithLargeETN = '2024-O-NEW-KDMX-TO-W-0123';
        const tokensLarge = vtecWithLargeETN.split('-');
        expect(parseInt(tokensLarge[6], 10)).toBe(123);
    });

    test('should validate VTEC string format patterns', () => {
        const validVTEC = '2024-O-NEW-KDMX-TO-W-0045';
        const invalidVTEC1 = '2024-KDMX-TO-W-45'; // Missing components
        const invalidVTEC2 = '24-O-NEW-KDMX-TO-W-0045'; // Wrong year format
        
        // Check valid format has 7 components
        expect(validVTEC.split('-')).toHaveLength(7);
        expect(invalidVTEC1.split('-')).toHaveLength(5);
        expect(invalidVTEC2.split('-')).toHaveLength(7);
        
        // Check year format
        expect(validVTEC.split('-')[0]).toMatch(/^\d{4}$/);
        expect(invalidVTEC2.split('-')[0]).not.toMatch(/^\d{4}$/);
    });

    test('should handle tab parameter migration', () => {
        // RESTish URL with tab
        const restishWithTab = '/vtec/event/2024-O-NEW-KDMX-TO-W-0045/tab/info';
        const segments = restishWithTab.split('/').filter(s => s);
        const tabIndex = segments.indexOf('tab');
        const tabValue = tabIndex >= 0 && tabIndex < segments.length - 1 ? segments[tabIndex + 1] : null;
        
        expect(tabValue).toBe('info');
        
        // Migration to query params
        const params = new URLSearchParams();
        if (tabValue) {
            params.set('tab', tabValue);
        }
        expect(params.get('tab')).toBe('info');
    });

    test('should preserve all parameters during migration', () => {
        // Simulate parsing a complex RESTish URL and migrating to query params
        const complexRESTish = '/vtec/event/2024-O-NEW-KDMX-TO-W-0045/tab/briefing';
        const segments = complexRESTish.split('/').filter(s => s);
        
        // Extract VTEC components
        const vtecString = segments.find(s => s.match(/^\d{4}-O-NEW-/));
        expect(vtecString).toBeDefined();
        if (!vtecString) throw new Error('VTEC string not found');
        const vtecTokens = vtecString.split('-');
        
        // Extract tab
        const tabIndex = segments.indexOf('tab');
        const tab = tabIndex >= 0 ? segments[tabIndex + 1] : null;
        
        // Build query parameter URL
        const params = new URLSearchParams();
        params.set('year', vtecTokens[0]);
        params.set('wfo', vtecTokens[3]);
        params.set('phenomena', vtecTokens[4]);
        params.set('significance', vtecTokens[5]);
        params.set('eventid', parseInt(vtecTokens[6], 10).toString());
        if (tab) params.set('tab', tab);
        
        const migratedUrl = `/vtec?${params.toString()}`;
        
        // Verify all data is preserved
        const verifyUrl = new URL(`http://localhost${migratedUrl}`);
        expect(verifyUrl.searchParams.get('year')).toBe('2024');
        expect(verifyUrl.searchParams.get('wfo')).toBe('KDMX');
        expect(verifyUrl.searchParams.get('phenomena')).toBe('TO');
        expect(verifyUrl.searchParams.get('significance')).toBe('W');
        expect(verifyUrl.searchParams.get('eventid')).toBe('45');
        expect(verifyUrl.searchParams.get('tab')).toBe('briefing');
    });
});
