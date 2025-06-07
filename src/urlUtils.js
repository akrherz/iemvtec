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
    const params = new URLSearchParams();
    params.set('year', getYear());
    params.set('wfo', getWFO());
    params.set('phenomena', getPhenomena());
    params.set('significance', getSignificance());
    params.set('eventid', getETN().toString());
    
    const activeTab = getState(StateKeys.ACTIVE_TAB);
    if (activeTab) {
        params.set('tab', activeTab);
    }
    
    const radar_product_time = getState(StateKeys.RADAR_PRODUCT_TIME);
    const radarProduct = getState(StateKeys.RADAR_PRODUCT);
    const radar = getState(StateKeys.RADAR);
    if (radar_product_time !== null && radarProduct && radar) {
        params.set('radar', radar);
        params.set('radar_product', radarProduct);
        params.set('radar_time', /** @type {any} */ (radar_product_time).utc().format('YYYYMMDDHHmm'));
    }
    
    const activeUpdate = getState(StateKeys.ACTIVE_UPDATE);
    if (activeUpdate) {
        params.set('update', activeUpdate);
    }
    
    const url = `?${params.toString()}`;
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
 * Parse URL query parameters and update app state
 * @param {URLSearchParams} params - The URL search parameters
 * @param {Function} [loadTabsCallback] - Function to call when VTEC changes
 * @returns {void}
 */
function handleQueryParams(params, loadTabsCallback) {
    const year = params.get('year');
    const wfo = params.get('wfo');
    const phenomena = params.get('phenomena');
    const significance = params.get('significance');
    const eventid = params.get('eventid');
    
    if (year && wfo && phenomena && significance && eventid) {
        setYear(year);
        // Fix bad WFOs
        if (wfoLookup[wfo] !== undefined) {
            setWFO(wfoLookup[wfo]);
        } else {
            setWFO(wfo);
        }
        setPhenomena(phenomena);
        setSignificance(significance);
        setETN(eventid);
    }
    
    const radar = params.get('radar');
    const radarProduct = params.get('radar_product');
    const radarTime = params.get('radar_time');
    if (radar && radarProduct && radarTime) {
        setState(StateKeys.RADAR, escapeHTML(radar));
        setState(StateKeys.RADAR_PRODUCT, escapeHTML(radarProduct));
        setState(
            StateKeys.RADAR_PRODUCT_TIME,
            moment.utc(escapeHTML(radarTime), 'YYYYMMDDHHmm')
        );
    }
    
    const tab = params.get('tab');
    if (tab) {
        setActiveTab(tab);
    }
    
    const update = params.get('update');
    if (update) {
        setUpdateTab(update);
    }
    
    if (loadTabsCallback && loadedVTEC !== vtecString()) {
        loadTabsCallback();
    }
}

/**
 * Process the URL and update the app state
 * @param {String} url
 * @param {Function} [loadTabsCallback] - Function to call when VTEC changes
 * @returns {void}
 */
export function handleURLChange(url, loadTabsCallback) {
    // Check if this is a query parameter URL (new format)
    const urlObj = new URL(url, window.location.origin);
    if (urlObj.search) {
        handleQueryParams(urlObj.searchParams, loadTabsCallback);
        return;
    }
    
    // Handle legacy RESTish URLs
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
    
    // Migrate legacy URL to new format
    updateURL();
}

/**
 * Initialization time check of URI and consume what it sets
 * @param {Function} [loadTabsCallback] - Optional callback for tab loading
 * @returns {void}
 */
export function consumeInitialURL(loadTabsCallback) {
    // Check for query parameters first (new format)
    if (window.location.search) {
        handleURLChange(window.location.href, loadTabsCallback);
        return;
    }
    
    // Check for RESTish URLs (legacy format)
    if (window.location.pathname.startsWith('/event')) {
        handleURLChange(window.location.pathname, loadTabsCallback);
        return;
    }
    
    // Handle hash links (oldest legacy format)
    const tokens = window.location.href.split('#');
    if (tokens.length === 1) {
        // No URL parameters - this is a fresh visit to /vtec
        // Initialize the UI but don't load any specific event data
        // Check if we have valid form defaults and should load initial data
        if (loadTabsCallback && getYear() && getWFO() && getPhenomena() && getSignificance() && getETN()) {
            loadTabsCallback();
        }
        return;
    }
    const subtokens = tokens[1].split('/');
    
    // Parse the hash into query parameters and migrate
    const params = new URLSearchParams();
    const vtecTokens = subtokens[0].split('-');
    if (vtecTokens.length === 7) {
        params.set('year', vtecTokens[0]);
        params.set('wfo', vtecTokens[3]);
        params.set('phenomena', vtecTokens[4]);
        params.set('significance', vtecTokens[5]);
        params.set('eventid', vtecTokens[6]);
    }
    
    if (subtokens.length > 1) {
        // Handle radar info from hash
        const radarTokens = subtokens[1].split('-');
        if (radarTokens.length === 3) {
            params.set('radar', radarTokens[0]);
            params.set('radar_product', radarTokens[1]);
            params.set('radar_time', radarTokens[2]);
        }
    }
    
    params.set('tab', 'info');
    
    const migratedUrl = `?${params.toString()}`;
    navigateTo(migratedUrl);
}
