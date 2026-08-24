/**
 * Tests for app utilities module
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

import { setUpdate, fetchWithParams, createGeoJSONVectorSource, selectElementContents, getData } from '../src/appUtils.js';

describe('App Utils', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        document.body.innerHTML = `
            <select id="wfo"><option value="KDMX">KDMX</option></select>
            <select id="phenomena"><option value="TO">TO</option></select>
            <select id="significance"><option value="W">W</option></select>
            <input id="etn" value="45" />
            <select id="year"><option value="2024">2024</option></select>
        `;
        global.fetch = (url) => Promise.resolve({
            json: () => Promise.resolve({ ok: true }),
            ok: true,
            url
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        document.body.innerHTML = '';
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
        expect(data.year).toBe(2024);
    });

    test('should handle selectElementContents function', () => {
        const target = document.createElement('div');
        target.id = 'test-element';
        target.textContent = 'Test content';
        document.body.appendChild(target);

        expect(() => {
            selectElementContents('test-element');
        }).not.toThrow();
    });

    test('should handle createGeoJSONVectorSource function', () => {
        const source = createGeoJSONVectorSource({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [0, 0] },
                properties: {}
            }]
        });
        expect(source).toBeTruthy();
        expect(source.getFeatures()).toHaveLength(1);
    });

    test('should omit nullish and NaN query values in fetchWithParams', async () => {
        let requestedUrl = '';
        global.fetch = (url) => {
            requestedUrl = url;
            return Promise.resolve({
                json: () => Promise.resolve({ ok: true })
            });
        };

        await fetchWithParams('https://example.com/service', {
            wfo: 'KDMX',
            etn: Number.NaN,
            year: undefined,
            significance: null,
            phenomena: 'TO'
        });

        expect(requestedUrl).toBe('https://example.com/service?wfo=KDMX&phenomena=TO');
    });

    test('should still expose raw NaN values in getData for current field state', () => {
        const etn = document.getElementById('etn');
        etn.value = 'NaN';
        const year = document.getElementById('year');
        year.value = 'NaN';

        const data = getData();
        expect(Number.isNaN(data.etn)).toBe(true);
        expect(Number.isNaN(data.year)).toBe(true);
    });
});
