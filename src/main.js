import './style.css';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'datatables.net-dt/css/dataTables.dataTables.css';

import { buildMap, initMap } from './mapManager.js';
import { initLSRTables, initEventTable, getEventTable } from './tableUtils.js';
import { handleURLChange, consumeInitialURL } from './urlUtils.js';
import { setupEventHandlers } from './eventHandlers.js';
import { initializeForm } from './formInit.js';
import { loadTabs } from './dataLoader.js';
import { makeUGCTable } from './ugcTable.js';

// Re-export function that's called from HTML
export { selectElementContents, setUpdate } from './appUtils.js';

/**
 * Entry point
 */
export function main() {
    // Step 1, activate UI components
    // Initialize form controls with default values
    initializeForm();
    makeUGCTable('ugctable');
    // Initialize tables using modern DataTable

    initLSRTables();
    initEventTable();

    // Setup all event handlers
    setupEventHandlers(getEventTable());
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
