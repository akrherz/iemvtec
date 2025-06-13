/**
 * Event handlers setup module for IEM VTEC application
 * Centralizes all UI event listener configuration
 */

import { requireElement, requireSelectElement, escapeHTML } from 'iemjs/domUtils';
import { setState, StateKeys } from './state.js';
import { getETN, setETN } from './vtecFields.js';
import { updateURL, urlencode } from './urlUtils.js';
import { getMap, getRadarTMSLayer, updateRADARProducts, getRADARSource, getRadarTimes } from './mapManager.js';
import { VanillaSlider } from './vanillaSlider.js';

/**
 * Utility function to create a button click handler that blurs and updates URL
 * @param {Function} action - Function to execute on click
 * @returns {(this: HTMLElement) => void} Event handler function
 */
function createButtonHandler(action) {
    return function() {
        action();
        updateURL();
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
    // Bootstrap 5 tab shown event - let Bootstrap handle the tab switching
    document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tabElement => {
        // Listen for Bootstrap's tab shown event instead of click
        tabElement.addEventListener('shown.bs.tab', (e) => {
            const target = e.target;
            if (target instanceof HTMLLinkElement) {
                // Update our internal state when tab is shown
                const href = target.getAttribute('href');
                if (href) {
                    const tabId = href.substring(1); // Remove the # symbol
                    setState(StateKeys.ACTIVE_TAB, tabId);
                    updateURL();
                    
                    // Handle map resize for the map tab
                    if (href === '#themap') {
                        getMap().updateSize();
                    }
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
        const activeTab = document.querySelector('#textdata .nav-tabs li.active a');
        if (activeTab instanceof HTMLLinkElement) {
            const tabid = activeTab.getAttribute('href');
            if (tabid) {
                const divToPrint = document.querySelector(tabid);
                if (divToPrint) {
                    const newWin = window.open('', 'Print-Window');
                    if (newWin) {
                        newWin.document.open();
                        newWin.document.write(
                            `<html><body onload="window.print()">${divToPrint.innerHTML}</body></html>`
                        );
                        newWin.document.close();
                        setTimeout(() => {
                            if (newWin) {
                                newWin.close();
                            }
                        }, 10);
                    }
                }
            }
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
        createSelectHandler(StateKeys.RADAR_PRODUCT, () => requireSelectElement('radarproduct').value, () => {
            getRadarTMSLayer().setSource(getRADARSource());
        })
    );
}

/**
 * Setup slider controls for radar interface
 */
export function setupSliderHandlers() {
    // Initialize radar opacity slider
    new VanillaSlider('radaropacity', {
        min: 0,
        max: 100,
        value: 100,
        onSlide: (value) => {
            getRadarTMSLayer().setOpacity(parseInt(value) / 100.0);
        }
    });
    
    // Initialize time slider  
    new VanillaSlider('timeslider', {
        min: 0,
        max: 100,
        onChange: (value) => {
            const radartimes = getRadarTimes();
            if (radartimes[value] === undefined) {
                return;
            }
            setState(StateKeys.RADAR_PRODUCT_TIME, radartimes[value]);
            getRadarTMSLayer().setSource(getRADARSource());
            const label = radartimes[value]
                .local()
                .format('D MMM YYYY h:mm A');
            const radarTimeElement = requireElement('radartime');
            radarTimeElement.innerHTML = label;
            updateURL();
        },
        onSlide: (value) => {
            const radartimes = getRadarTimes();
            const label = radartimes[value]
                .local()
                .format('D MMM YYYY h:mm A');
            requireElement('radartime').innerHTML = label;
            updateURL();
        }
    });
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
    setupSliderHandlers();
    setupEventTableHandler(eventTable);
}
