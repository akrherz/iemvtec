/**
 * VTEC form field getter and setter utilities
 */
import { requireInputElement, requireSelectElement, escapeHTML } from './domUtils.js';

/**
 * Get the significance value from the form
 * @returns {string} The escaped significance value
 */
export function getSignificance() {
    const significanceElement = requireSelectElement('significance');
    return escapeHTML(significanceElement ? significanceElement.value : '');
}

/**
 * Set the significance value in the form
 * @param {string} significance - The significance value to set
 */
export function setSignificance(significance) {
    const significanceElement = requireSelectElement('significance');
    significanceElement.value = escapeHTML(significance);
}

/**
 * Get the ETN (Event Tracking Number) from the form
 * @returns {number} The ETN as an integer
 */
export function getETN() {
    return parseInt(requireInputElement('etn').value, 10);
}

/**
 * Set the ETN (Event Tracking Number) in the form
 * @param {number|string} etn - The ETN value to set
 */
export function setETN(etn) {
    etn = parseInt(String(etn), 10);
    if (etn > 0 && etn < 10000) {
        const etnElement = requireInputElement('etn');
        etnElement.value = etn.toString();
    }
}

/**
 * Get the WFO (Weather Forecast Office) from the form
 * @returns {string} The escaped WFO value
 */
export function getWFO() {
    return escapeHTML(requireSelectElement('wfo').value);
}

/**
 * Set the WFO (Weather Forecast Office) in the form
 * @param {string} wfo - The WFO value to set
 */
export function setWFO(wfo) {
    requireSelectElement('wfo').value = escapeHTML(wfo);
}

/**
 * Get the year from the form
 * @returns {number} The year as an integer
 */
export function getYear() {
    return parseInt(requireSelectElement('year').value, 10);
}

/**
 * Set the year in the form
 * @param {number|string} year - The year value to set
 */
export function setYear(year) {
    requireSelectElement('year').value = escapeHTML(String(year));
}

/**
 * Get the phenomena from the form
 * @returns {string} The escaped phenomena value
 */
export function getPhenomena() {
    return escapeHTML(requireSelectElement('phenomena').value);
}

/**
 * Set the phenomena in the form
 * @param {string} phenomena - The phenomena value to set
 */
export function setPhenomena(phenomena) {
    requireSelectElement('phenomena').value = escapeHTML(phenomena);
}
