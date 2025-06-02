/**
 * URL and navigation utility functions for managing application routing
 */
import { setState, getState, StateKeys } from './state.js';
import { setYear, setWFO, setPhenomena, setSignificance, setETN, 
         getYear, getWFO, getPhenomena, getSignificance, getETN } from './vtecFields.js';
import { escapeHTML } from './domUtils.js';
import moment from 'moment';

// Track the last loaded VTEC to detect changes
let loadedVTEC = '';

/**
 * Get the currently loaded VTEC string for comparison
 * @returns {string} The last loaded VTEC string
 */
export function getLoadedVTEC() {
    return loadedVTEC;
}

/**
 * Set the loaded VTEC string to track changes
 * @param {string} vtec - The VTEC string to track
 */
export function setLoadedVTEC(vtec) {
    loadedVTEC = vtec;
}

// Fix WFO ids that come in wrong
const wfoLookup = {
    KAFG: 'PAFG',
    KAFC: 'PAFC',
    KAJK: 'PAJK',
    KGUM: 'PGUM',
    KHFO: 'PHFO',
    KJSJ: 'TJSJ',
};

/**
 * Generate a commonly used VTEC string in the form of
 * YYYY-O-NEW-WFO-PHENOMENA-SIGNIFICANCE-ETN
 * @returns {string} The VTEC string
 */
export function vtecString() {
    return `${getYear()}-O-NEW-${getWFO()}-${getPhenomena()}-${getSignificance()}-${String(
        getETN()
    ).padStart(4, '0')}`;
}

/**
 * Encode the current vtec into CGI parms
 * @returns {string} The URL encoded string
 */
export function urlencode() {
    return `?year=${getYear()}&phenomena=${getPhenomena()}&significance=${getSignificance()}&eventid=${getETN()}&wfo=${getWFO()}`;
}

/**
 * Important gateway for updating the app
 * fires off a navigateTo call, which may or may not reload the data
 * depending on the VTEC string
 * @returns {void}
 */
export function updateURL() {
    let url = `/vtec/event/${vtecString()}`;
    const radar_product_time = getState(StateKeys.RADAR_PRODUCT_TIME);
    if (
        radar_product_time !== null &&
        getState(StateKeys.RADAR_PRODUCT) !== null &&
        getState(StateKeys.RADAR) !== null
    ) {
        url += `/radar/${getState(StateKeys.RADAR)}-${getState(
            StateKeys.RADAR_PRODUCT
        )}-${/** @type {any} */ (radar_product_time).utc().format('YMMDDHHmm')}`;
    }
    url += `/tab/${getState(StateKeys.ACTIVE_TAB)}`;
    if (getState(StateKeys.ACTIVE_UPDATE) !== null) {
        url += `/update/${getState(StateKeys.ACTIVE_UPDATE)}`;
    }
    document.title = `VTEC Event ${vtecString()}`;
    navigateTo(url);
}

/**
 * Push the URL onto the HTML5 history stack
 * and call handleURLChange, which may or may not reload the data
 * @param {String} url
 */
export function navigateTo(url) {
    history.pushState(null, '', url);
    handleURLChange(url);
}

/**
 * Update the current active tab within the text tab
 * @param {String} tab
 * @returns {void}
 */
function setUpdateTab(tab) {
    if (tab === getState(StateKeys.ACTIVE_UPDATE)) {
        return;
    }
    setState(StateKeys.ACTIVE_UPDATE, escapeHTML(tab));
    const tabElement = document.querySelector(`#text_tabs a[data-update='${tab}']`);
    if (tabElement) {
        /** @type {HTMLElement} */ (tabElement).click();
    }
}

/**
 * Update the active main tab
 * @param {String} tab
 * @returns {void}
 */
function setActiveTab(tab) {
    if (tab === getState(StateKeys.ACTIVE_TAB)) {
        return;
    }
    setState(StateKeys.ACTIVE_TAB, escapeHTML(tab));
    const tabElement = document.querySelector(`#thetabs_tabs a[href='#${tab}']`);
    if (tabElement instanceof HTMLElement) {
        tabElement.click();
    }
}

/**
 * Process the URL and update the app state
 * @param {String} url
 * @param {Function} [loadTabsCallback] - Function to call when VTEC changes
 * @returns {void}
 */
export function handleURLChange(url, loadTabsCallback) {
    const pathSegments = url.split('/').filter((segment) => segment);
    if (pathSegments.length < 3) {
        return;
    }
    
    // We only need to reload if the event has changed
    for (let i = 1; i + 1 < pathSegments.length; i += 2) {
        if (pathSegments[i] === 'event') {
            const vtectokens = pathSegments[i + 1].split('-');
            if (vtectokens.length === 7) {
                setYear(vtectokens[0]);
                // Fix bad WFOs
                if (wfoLookup[vtectokens[3]] !== undefined) {
                    setWFO(wfoLookup[vtectokens[3]]);
                } else {
                    setWFO(vtectokens[3]);
                }
                setPhenomena(vtectokens[4]);
                setSignificance(vtectokens[5]);
                setETN(vtectokens[6]);
            }
        } else if (pathSegments[i] === 'radar') {
            const radartokens = pathSegments[i + 1].split('-');
            if (radartokens.length === 3) {
                setState(StateKeys.RADAR, escapeHTML(radartokens[0]));
                setState(StateKeys.RADAR_PRODUCT, escapeHTML(radartokens[1]));
                setState(
                    StateKeys.RADAR_PRODUCT_TIME,
                    moment.utc(escapeHTML(radartokens[2]), 'YYYYMMDDHHmm')
                );
            }
        } else if (pathSegments[i] === 'tab') {
            setActiveTab(pathSegments[i + 1]);
        } else if (pathSegments[i] === 'update') {
            setUpdateTab(pathSegments[i + 1]);
        }
    }
    
    if (loadTabsCallback && loadedVTEC !== vtecString()) {
        loadTabsCallback();
    }
}

/**
 * Initialization time check of URI and consume what it sets
 * @param {Function} [loadTabsCallback] - Optional callback for tab loading
 * @returns {void}
 */
export function consumeInitialURL(loadTabsCallback) {
    // Assume we start with /event, which is true via Apache rewrite
    if (window.location.pathname.startsWith('/vtec/event')) {
        handleURLChange(window.location.pathname, loadTabsCallback);
        return;
    }
    // Convert the hashlink to a URL
    const tokens = window.location.href.split('#');
    if (tokens.length === 1) {
        return;
    }
    const subtokens = tokens[1].split('/');
    let url = `/vtec/event/${subtokens[0]}`;
    if (subtokens.length > 1) {
        url += `/radar/${subtokens[1]}`;
    }
    url += '/tab/info';
    navigateTo(url);
}
