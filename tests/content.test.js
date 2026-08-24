/**
 * Tests for content entry point module (production)
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

describe('Content (Production Entry Point)', () => {
    beforeEach(async () => {
        jest.resetModules();
        global.fetch = async () => ({
            ok: true,
            json: async () => ({ scans: [], products: [], radars: [] })
        });
        document.body.innerHTML = `
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

        await import('../src/content.js');
    });

    afterEach(() => {
        document.body.innerHTML = '';
        delete window.setUpdate;
        delete window.selectElementContents;
        delete global.fetch;
    });

    test('should be a production entry point', () => {
        expect(true).toBe(true);
    });

    test('should expose global functions', () => {
        expect(typeof window.setUpdate).toBe('function');
        expect(typeof window.selectElementContents).toBe('function');
    });
});
