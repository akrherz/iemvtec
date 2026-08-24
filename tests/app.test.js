/**
 * Tests for app entry point module (development)
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('App (Development Entry Point)', () => {
    let originalConsoleLog;
    let originalFetch;

    beforeEach(async () => {
        jest.resetModules();
        originalConsoleLog = console.log;
        originalFetch = global.fetch;
        console.log = () => {};
        global.fetch = async () => ({
            ok: true,
            text: async () => '<div>Real content</div>',
            json: async () => ({ scans: [], products: [], radars: [] })
        });

        document.body.innerHTML = `
            <div id="vtec-content"></div>
            <a data-bs-toggle="tab"></a>
            <table id="ugctable"></table>
            <table id="eventtable"></table>
            <table id="lsrtable"></table>
            <table id="sbwlsrtable"></table>
            <div id="radaropacity"></div>
            <div id="timeslider"></div>
            <div id="radartime"></div>
            <button id="etn-prev"></button>
            <button id="etn-next"></button>
            <button id="myform-submit"></button>
            <button id="lsr_kml_button"></button>
            <button id="warn_kml_button"></button>
            <button id="ci_kml_button"></button>
            <button id="gr_button"></button>
            <button id="toolbar-print"></button>
            <div id="popup">
                <button id="popup-closer"></button>
                <div id="popup-content"></div>
            </div>
            <select id="radarsource"><option value=""></option></select>
            <select id="radarproduct"><option value=""></option></select>
            <div id="vtec_label"></div>
            <div id="info_event_found"></div>
            <div id="info_event_not_found"></div>
            <div id="textdata"><ul></ul><div class="tab-content"></div></div>
            <div id="radarmap"></div>
            <div id="sbwhistory"></div>
            <select id="wfo"><option value="KDMX">KDMX</option></select>
            <select id="phenomena"><option value="TO">TO</option></select>
            <select id="significance"><option value="W">W</option></select>
            <input id="etn" value="45" />
            <select id="year"><option value="2024">2024</option></select>
        `;

        await import('../src/app.js');
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        global.fetch = originalFetch;
        document.body.innerHTML = '';
        delete window.setUpdate;
        delete window.selectElementContents;
    });

    test('should be a development entry point', () => {
        expect(true).toBe(true);
    });

    test('should expose global functions', () => {
        expect(typeof window.setUpdate).toBe('function');
        expect(typeof window.selectElementContents).toBe('function');
    });
});
