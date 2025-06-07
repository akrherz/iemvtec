/**
 * Data loading utilities for populating tables with VTEC-related data
 */
import { getLSRTable, getSBWLSRTable, getEventTable } from './tableUtils.js';
import { fetchWithParams, getData } from './appUtils.js';
import { createTabHTML, createTabPaneHTML } from './tabUtils.js';
import { requireElement, requireSelectElement, escapeHTML } from './domUtils.js';
import { setState, getState, StateKeys } from './state.js';
import { loadVTECGeometry } from './geometryLoader.js';
import { getSignificance, getETN, getWFO, getYear, getPhenomena } from './vtecFields.js';
import moment from 'moment';
import { setLoadedVTEC, vtecString } from './urlUtils.js';
import { getUGCTable } from './ugcTable.js';

/**
 * Make web services calls to get VTEC data and load the tabs with information
 */
export function loadTabs() {
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
    loadVTECEventData(getUGCTable(), getLSRTable(), getSBWLSRTable());
    
    // Load VTEC events table data
    loadVTECEventsData(getEventTable());
    
    // Set the active tab to 'Event Info' if we are on the first tab
    const firstTab = document.querySelector('#thetabs_tabs a');
    if (firstTab && firstTab.getAttribute('href') === '#help') {
        const infoTab = document.querySelector("#thetabs_tabs a[href='#info']");
        if (infoTab instanceof HTMLElement) {
            infoTab.click();
        }
    }
}

/**
 * Load VTEC event data and populate the dynamic tabs interface
 * @param {any} ugcTable - DataTable instance for UGC data
 * @param {any} lsrTable - DataTable instance for LSR data  
 * @param {any} sbwLsrTable - DataTable instance for SBW LSR data
 */
export function loadVTECEventData(ugcTable, lsrTable, sbwLsrTable) {
    fetchWithParams('https://mesonet.agron.iastate.edu/json/vtec_event.py', getData())
        .then((data) => {
            if (!data.event_exists) {
                requireElement('info_event_found').style.display = 'none';
                requireElement('info_event_not_found').style.display = 'block';
                return;
            }
            requireElement('info_event_found').style.display = 'block';
            requireElement('info_event_not_found').style.display = 'none';
            const tabs = requireElement('textdata').querySelector('ul');
            const tabcontent = requireElement('textdata').querySelector('div.tab-content');
            if (tabs && tabcontent) {
                tabs.innerHTML = '';
                tabcontent.innerHTML = '';
                tabs.innerHTML = '<li><a href="#tall" data-toggle="tab">All</a></li>';
                
                const stamp = moment.utc(data.report.valid).local().format('DD/h:mm A');
                const update = moment.utc(data.report.valid).format('YYYYMMDDHHmm');
                const plink = `<a href="/p.php?pid=${data.report.product_id}" target="_new">Permalink to ${data.report.product_id}</a><br />`;
                
                tabs.innerHTML += createTabHTML('#t0', update, `Issue ${stamp}`, true);
                tabcontent.innerHTML = createTabPaneHTML('tall', `<pre>${data.report.text}</pre>`) +
                                      createTabPaneHTML('t0', `${plink}<pre>${data.report.text}</pre>`, true);
                
                let tidx = 1;
                data.svs.forEach((_idx, svs) => {
                    const splink = `<a href="/p.php?pid=${svs.product_id}" target="_new">Permalink to ${svs.product_id}</a><br />`;
                    const sstamp = moment.utc(svs.valid).local().format('DD/h:mm A');
                    const supdate = moment.utc(svs.valid).format('YYYYMMDDHHmm');
                    
                    tabs.innerHTML += createTabHTML(`#t${tidx}`, supdate, `U${tidx}: ${sstamp}`);
                    tabcontent.innerHTML += createTabPaneHTML(`t${tidx}`, `${splink}<pre>${svs.text}</pre>`);
                    requireElement('tall').innerHTML += `<pre>${svs.text}</pre>`;
                    tidx += 1;
                });
                if (getState(StateKeys.ACTIVE_UPDATE) !== null) {
                    const updateTabElement = document.querySelector(
                        `#textdata a[data-update="${getState(StateKeys.ACTIVE_UPDATE)}"]`
                    );
                    if (updateTabElement instanceof HTMLElement) {
                        updateTabElement.click();
                    }
                }
            }
            ugcTable.clear();
            data.ugcs.forEach((_idx, ugc) => {
                ugcTable.row.add([
                    ugc.ugc,
                    ugc.name,
                    ugc.status,
                    ugc.utc_product_issue,
                    ugc.utc_issue,
                    ugc.utc_init_expire,
                    ugc.utc_expire,
                ]);
            });
            ugcTable.draw();
            setState(StateKeys.ISSUE, moment.utc(data.utc_issue));
            setState(StateKeys.EXPIRE, moment.utc(data.utc_expire));
            loadVTECGeometry(lsrTable, sbwLsrTable);
        })
        .catch(error => {
            console.error('Error fetching VTEC event data:', error);
        });
}

/**
 * Load VTEC events data and populate the events table
 * @param {any} eventTable - DataTable instance for events data
 */
export function loadVTECEventsData(eventTable) {
    fetchWithParams('https://mesonet.agron.iastate.edu/json/vtec_events.py', getData())
        .then((data) => {
            eventTable.clear();
            data.events.forEach((_idx, vtec) => {
                eventTable.row.add([
                    vtec.eventid,
                    vtec.product_issue,
                    vtec.issue,
                    vtec.init_expire,
                    vtec.expire,
                    vtec.area,
                    vtec.locations,
                    vtec.fcster,
                ]);
            });
            eventTable.draw();
        })
        .catch(error => {
            console.error('Error fetching VTEC events data:', error);
        });
}

/**
 * Set up radar map and SBW history images
 */
export function setupImageDisplays() {
    const vstring = `${getYear()}.${getWFO()}.${getPhenomena()}.${getSignificance()}.${String(
        getETN()
    ).padStart(4, '0')}`;
    
    requireElement('radarmap').innerHTML = 
        `<img src="/GIS/radmap.php?layers[]=nexrad&layers[]=sbw&layers[]=sbwh&layers[]=uscounties&vtec=${vstring}" class="img img-responsive">`;
    requireElement('sbwhistory').innerHTML = 
        `<img src="/GIS/sbw-history.php?vtec=${vstring}" class="img img-responsive">`;
}
