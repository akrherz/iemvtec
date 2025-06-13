/**
 * Form initialization module for IEM VTEC application
 * Handles populating form controls with initial data and values
 */

import { requireSelectElement } from 'iemjs/domUtils';
import { vtec_phenomena, wfos, vtec_significance } from 'iemjs/iemdata';
import { setETN } from './vtecFields.js';
import { buildSelectOptions, populateSelect } from './selectUtils.js';

/**
 * Initialize the WFO (Weather Forecast Office) select element
 */
export function initializeWFOSelect() {
    const wfoSelect = requireSelectElement('wfo');
    const options = buildSelectOptions(wfos, '<option value="{value}">[{value}] {text}</option>');
    wfoSelect.innerHTML += options;
    wfoSelect.value = 'KDMX';
}

/**
 * Initialize the phenomena select element
 */
export function initializePhenomenaSelect() {
    populateSelect('phenomena', vtec_phenomena, 'TO', '<option value="{value}">{text} ({value})</option>');
}

/**
 * Initialize the significance select element
 */
export function initializeSignificanceSelect() {
    populateSelect('significance', vtec_significance, 'W', '<option value="{value}">{text} ({value})</option>');
}

/**
 * Initialize the year select element with years from 1986 to current year
 */
export function initializeYearSelect() {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({length: currentYear - 1985}, (_, i) => 1986 + i)
        .map(year => [year.toString(), year.toString()]);
    populateSelect('year', yearOptions, '2024');
}

/**
 * Set the initial ETN (Event Tracking Number) value
 */
export function initializeETN() {
    setETN(45);
}

/**
 * Initialize all form controls with their default values and options
 */
export function initializeForm() {
    initializeWFOSelect();
    initializePhenomenaSelect();
    initializeSignificanceSelect();
    initializeYearSelect();
    initializeETN();
}
