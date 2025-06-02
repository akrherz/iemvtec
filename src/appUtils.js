/**
 * Common utility functions used throughout the application
 */

import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { requireElement } from './domUtils.js';
import { getWFO, getPhenomena, getSignificance, getETN, getYear } from './vtecFields.js';
import { setState, StateKeys } from './state.js';
import { updateURL } from './urlUtils.js';

/**
 * called from HTML tag
 * @param {String} val
 */
export function setUpdate(val) {
    // skipcq
    setState(StateKeys.ACTIVE_UPDATE, val);
    updateURL();
}


/**
 * Utility function to fetch JSON data with URLSearchParams
 * @param {string} url - The base URL
 * @param {Object} payload - The data payload to send as URL parameters
 * @returns {Promise<Object>} The JSON response
 */
export function fetchWithParams(url, payload) {
    const params = new URLSearchParams();
    Object.keys(payload).forEach(key => {
        params.append(key, String(payload[key]));
    });
    return fetch(`${url}?${params.toString()}`)
        .then(response => response.json());
}

/**
 * Utility function to create GeoJSON vector source
 * @param {Object} geodata - The GeoJSON data
 * @returns {VectorSource} The vector source
 */
export function createGeoJSONVectorSource(geodata) {
    const format = new GeoJSON({
        featureProjection: 'EPSG:3857',
    });
    return new VectorSource({
        features: format.readFeatures(geodata),
    });
}

/**
 * https://stackoverflow.com/questions/2044616
 * Select element contents for copying to clipboard
 * @param {string} elid - The element ID
 */
export function selectElementContents(elid) {
    const el = requireElement(elid);
    let range = null;
    let sel = null;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch {
                range.selectNode(el);
                sel.addRange(range);
            }
        }
        document.execCommand('copy');
    }
}

/**
 * Build a common data object with the payload to send to web services
 * @returns {Object} The data to be sent to the server
 */
export function getData() {
    return {
        wfo: getWFO(),
        phenomena: getPhenomena(),
        significance: getSignificance(),
        etn: getETN(),
        year: getYear(),
    };
}
