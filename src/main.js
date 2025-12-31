import './style.css';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'tom-select/dist/css/tom-select.bootstrap5.css';

import { buildMap, initMap } from './mapManager.js';
import { initLSRTables, initEventTable, getEventTable } from './tableUtils.js';
import { handleURLChange, consumeInitialURL } from './urlUtils.js';
import { setupEventHandlers } from './eventHandlers.js';
import { initializeForm } from './formInit.js';
import { makeUGCTable } from './ugcTable.js';
import { initializeUI } from './uiManager.js';
import TomSelect from 'tom-select/dist/js/tom-select.complete.js';

/**
 * Check if essential DOM elements are available
 * @returns {boolean} True if DOM is ready for initialization
 */
function isDOMReady() {
    const essentialElements = [
        'a[data-bs-toggle="tab"]', // Tab elements
        '#ugctable',              // UGC table
        '#eventtable',            // Event table
        '#lsrtable'               // LSR table
    ];
    
    for (const selector of essentialElements) {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.debug(`DOM not ready: Missing elements for selector "${selector}"`);
            return false;
        }
    }
    
    return true;
}

/**
 * Wait for DOM to be ready with essential elements
 * @returns {Promise<void>}
 */
function waitForDOMReady() {
    return new Promise((resolve) => {
        const checkReady = () => {
            if (isDOMReady()) {
                resolve();
            } else {
                // Use requestAnimationFrame for non-blocking polling
                requestAnimationFrame(checkReady);
            }
        };
        checkReady();
    });
}

/**
 * Initialize the application after DOM is ready
 */
async function initializeApp() {
    
    // Step 1, activate UI components
    // Initialize form controls with default values
    initializeForm();
    makeUGCTable('ugctable');
    // Initialize tables using modern DataTable

    initLSRTables();
    initEventTable();
    initializeUI();

    // Setup all event handlers
    setupEventHandlers(getEventTable());
    // Step 2, build the map
    buildMap();
    // Step 3, consume the URL to resolve the data to load
    consumeInitialURL();

    /**
     * Listen for user hitting the back and forward buttons
     */
    window.addEventListener('popstate', () => {
        handleURLChange(document.location.pathname);
    });

    initMap();
    
    // Enable Tom Select for WFO select if present
    const wfoEl = document.getElementById('wfo');
    if (wfoEl) {
        new TomSelect('#wfo', {
            create: false,
            sortField: 'text',
            allowEmptyOption: false,
            maxOptions: 100,
            placeholder: 'Type to search...'
        });
    }
    // Enable Tom Select for Phenomena select if present
    const phenEl = document.getElementById('phenomena');
    if (phenEl) {
        new TomSelect('#phenomena', {
            create: false,
            sortField: 'text',
            allowEmptyOption: false,
            maxOptions: 100,
            placeholder: 'Type to search...'
        });
    }
    // Enable Tom Select for Significance select if present
    const sigEl = document.getElementById('significance');
    if (sigEl) {
        new TomSelect('#significance', {
            create: false,
            sortField: 'text',
            allowEmptyOption: false,
            maxOptions: 100,
            placeholder: 'Type to search...'
        });
    }
}

/**
 * Entry point - ensures DOM is ready before initialization
 */
export async function main() {
    await waitForDOMReady();
    await initializeApp();
}
