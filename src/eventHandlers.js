/**
 * Event handlers setup module for IEM VTEC application
 * Centralizes all UI event listener configuration
 */

import { requireElement, requireSelectElement, escapeHTML } from 'iemjs/domUtils';
import { setState, StateKeys, subscribeToState } from './state.js';
import { getETN, setETN } from './vtecFields.js';
import { updateURL, urlencode } from './urlUtils.js';
import { updateRADARProducts, updateRADARTimeSlider } from './mapManager.js';
import { loadTabs } from './dataLoader.js';

/**
 * Create state subscribers for the application
 */
function createStateSubscribers() {
    subscribeToState(StateKeys.RADAR, () => {
        updateURL(false);
    });
    subscribeToState(StateKeys.RADAR_PRODUCT, () => {
        updateURL(false);
    });
    subscribeToState(StateKeys.RADAR_PRODUCT_TIME, () => {
        updateURL(false);
    });
    subscribeToState(StateKeys.ACTIVE_TAB, () => {
        updateURL(false);
    });
}

/**
 * Utility function to create a button click handler that blurs and updates URL
 * @param {Function} action - Function to execute on click
 * @returns {(this: HTMLElement) => void} Event handler function
 */
function createButtonHandler(action) {
    return function() {
        action();
        loadTabs();
        /** @type {HTMLElement} */ (this).blur();
    };
}

/**
 * Utility function to create a button click handler that redirects to a URL
 * @param {Function} urlGenerator - Function that returns the URL to navigate to
 * @returns {(this: HTMLElement) => void} Event handler function
 */
function createRedirectHandler(urlGenerator) {
    return function() {
        window.location.href = urlGenerator();
        /** @type {HTMLElement} */ (this).blur();
    };
}

/**
 * Utility function to create a select change handler that updates state and URL
 * @param {string} stateKey - State key to update
 * @param {Function} valueExtractor - Function to extract value from select element
 * @param {Function} [additionalAction] - Optional additional action to perform
 * @returns {() => void} Event handler function
 */
function createSelectHandler(stateKey, valueExtractor, additionalAction) {
    return () => {
        const value = valueExtractor();
        setState(stateKey, escapeHTML(value));
        if (additionalAction) {
            additionalAction();
        }
        updateURL();
    };
}

/**
 * Setup tab navigation event handlers
 */
export function setupTabHandlers() {
    const tabElements = document.querySelectorAll('a[data-bs-toggle="tab"]');
    
    tabElements.forEach(tabElement => {
        
        // Fallback: Listen for click events in case Bootstrap events don't fire
        tabElement.addEventListener('click', (e) => {
            const target = e.currentTarget;
            if (target instanceof HTMLElement) {
                const href = target.getAttribute('href');
                if (href) {
                    const tabId = href.substring(1);
                    setState(StateKeys.ACTIVE_TAB, tabId);
                }
            }
        });
    });
}

/**
 * Setup button event handlers
 */
export function setupButtonHandlers() {
    // ETN navigation buttons
    requireElement('etn-prev').addEventListener('click', createButtonHandler(() => setETN(getETN() - 1)));
    requireElement('etn-next').addEventListener('click', createButtonHandler(() => setETN(getETN() + 1)));
    requireElement('myform-submit').addEventListener('click', createButtonHandler(() => {}));
    
    // KML and export buttons
    requireElement('lsr_kml_button').addEventListener('click', 
        createRedirectHandler(() => `/kml/sbw_lsrs.php${urlencode()}`)
    );
    requireElement('warn_kml_button').addEventListener('click', 
        createRedirectHandler(() => `/kml/vtec.php${urlencode()}`)
    );
    requireElement('ci_kml_button').addEventListener('click', 
        createRedirectHandler(() => `/kml/sbw_county_intersect.php${urlencode()}`)
    );
    requireElement('gr_button').addEventListener('click', 
        createRedirectHandler(() => `/request/grx/vtec.php${urlencode()}`)
    );

    // Print button
    requireElement('toolbar-print').addEventListener('click', function () {
        this.blur();
        
        // Find the active tab in the text data section
        const activeTab = document.querySelector('#textdata .nav-tabs .nav-link.active');
        
        if (activeTab && activeTab.tagName === 'A') {
            const tabid = activeTab.getAttribute('href') || activeTab.getAttribute('data-bs-target');
            
            if (tabid) {
                const divToPrint = document.querySelector(tabid);
                
                if (divToPrint) {
                    const content = divToPrint.innerHTML;
                    if (content && content.trim() !== '' && content !== 'Text Product Issuance') {
                        try {
                            // Try to open popup window for printing
                            const newWin = window.open('', 'Print-Window', 'width=800,height=600,scrollbars=yes');
                            if (newWin) {
                                newWin.document.open();
                                newWin.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                        <head>
                                            <title>Print - VTEC Text Data</title>
                                            <style>
                                                body { 
                                                    font-family: monospace; 
                                                    margin: 20px; 
                                                    line-height: 1.4;
                                                }
                                                pre { 
                                                    white-space: pre-wrap; 
                                                    word-wrap: break-word; 
                                                    font-size: 12px;
                                                }
                                                @media print {
                                                    body { margin: 0.5in; }
                                                }
                                            </style>
                                        </head>
                                        <body>
                                            <h2>VTEC Text Data</h2>
                                            ${content}
                                            <script>
                                                window.onload = function() {
                                                    window.print();
                                                    // Close after a delay to allow printing
                                                    setTimeout(function() {
                                                        window.close();
                                                    }, 1000);
                                                };
                                            </script>
                                        </body>
                                    </html>
                                `);
                                newWin.document.close();
                                newWin.focus();
                            } else {
                                // Popup was blocked, inform user
                                alert('Print popup was blocked by your browser. Please allow popups for this site and try again.');
                            }
                        } catch (error) {
                            alert('Unable to open print dialog. Error: ' + error.message);
                        }
                    } else {
                        alert('No content available to print. Please select an event first.');
                    }
                } else {
                    alert('Could not find content to print.');
                }
            } else {
                alert('Could not determine what to print.');
            }
        } else {
            alert('No active tab found to print.');
        }
    });
}

/**
 * Setup select element event handlers
 */
export function setupSelectHandlers() {
    requireSelectElement('radarsource').addEventListener('change', 
        createSelectHandler(StateKeys.RADAR, () => requireSelectElement('radarsource').value, updateRADARProducts)
    );
    requireSelectElement('radarproduct').addEventListener('change', 
        createSelectHandler(StateKeys.RADAR_PRODUCT, () => requireSelectElement('radarproduct').value, updateRADARTimeSlider)
    );
}


/**
 * Setup event table row click handler
 * @param {any} eventTable - The DataTable instance for events
 */
export function setupEventTableHandler(eventTable) {
    const eventTableElement = document.getElementById('eventtable');
    if (eventTableElement) {
        // Add click handler for event table rows
        eventTableElement.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }
            
            const tr = target.closest('tr');
            if (!tr || !eventTable) {
                return;
            }
            
            const data = eventTable.row(tr).data();
            if (parseInt(data.id, 10) === getETN()) {
                return;
            }
            setETN(data.id);
            // Switch to the details tab, which will trigger update
            const infoTab = document.querySelector("#thetabs_tabs a[href='#info']");
            if (infoTab instanceof HTMLElement) {
                infoTab.click();
            }
        });
    }
}

/**
 * Setup all UI event handlers
 * @param {any} eventTable - The DataTable instance for events
 */
export function setupEventHandlers(eventTable) {
    setupTabHandlers();
    setupButtonHandlers();
    setupSelectHandlers();
    setupEventTableHandler(eventTable);
    createStateSubscribers();
}
