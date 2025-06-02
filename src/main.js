import './style.css';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { buildMap, initMap } from './mapManager.js';

import { requireElement, requireSelectElement, escapeHTML } from './domUtils.js';
import { getETN, getYear } from './vtecFields.js';
import { setState, StateKeys } from './state.js';
import { makeLSRTable } from './tableUtils.js';
import { vtecString, updateURL, handleURLChange, consumeInitialURL, setLoadedVTEC } from './urlUtils.js';
import { setupEventHandlers } from './eventHandlers.js';
import { initializeForm } from './formInit.js';
import { loadVTECEventData, loadVTECEventsData, setupImageDisplays } from './dataLoader.js';
import DataTable from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';

// Re-export function that's called from HTML
export { selectElementContents } from './appUtils.js';

let eventTable = null;
let ugcTable = null;
let lsrTable = null;
let sbwLsrTable = null;

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
 * Make web services calls to get VTEC data and load the tabs with information
 */
function loadTabs() {
    setLoadedVTEC(vtecString());
    
    // Setup image displays
    setupImageDisplays();
    
    // Setup VTEC label
    const wfoSelect = requireSelectElement('wfo');
    const phenomenaSelect = requireSelectElement('phenomena');
    const significanceSelect = requireSelectElement('significance');
    
    requireElement('vtec_label').innerHTML =
        `${getYear()} ${escapeHTML(wfoSelect.selectedOptions[0].text)}
            ${escapeHTML(phenomenaSelect.selectedOptions[0].text)}
            ${escapeHTML(significanceSelect.selectedOptions[0].text)}
            Number ${getETN()}`;
    
    // Load VTEC event data and populate tabs
    loadVTECEventData(ugcTable, lsrTable, sbwLsrTable);
    
    // Load VTEC events table data
    loadVTECEventsData(eventTable);
    
    // Set the active tab to 'Event Info' if we are on the first tab
    const firstTab = document.querySelector('#thetabs_tabs a');
    if (firstTab && firstTab.getAttribute('href') === '#help') {
        const infoTab = document.querySelector("#thetabs_tabs a[href='#info']");
        if (infoTab instanceof HTMLElement) {
            infoTab.click();
        }
    }
}
function buildUI() {
    // One time build up of UI and handlers

    // Initialize form controls with default values
    initializeForm();
    
    // Initialize tables using modern DataTable
    const ugcTableElement = document.getElementById('ugctable');
    if (ugcTableElement) {
        ugcTable = new DataTable(ugcTableElement);
    }
    
    lsrTable = makeLSRTable('lsrtable');
    sbwLsrTable = makeLSRTable('sbwlsrtable');

    const eventTableElement = document.getElementById('eventtable');
    if (eventTableElement) {
        eventTable = new DataTable(eventTableElement);
    }

    // Setup all event handlers
    setupEventHandlers(eventTable);
}

/**
 * Entry point
 */
export function main() {
    // Step 1, activate UI components
    buildUI();
    // Step 2, build the map
    buildMap();
    // Step 3, consume the URL to resolve the data to load
    consumeInitialURL(loadTabs);

    /**
     * Listen for user hitting the back and forward buttons
     */
    window.addEventListener('popstate', () => {
        handleURLChange(document.location.pathname, loadTabs);
    });

    initMap();

}
