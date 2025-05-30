import './style.css';
import 'ol/ol.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Style, Icon, Stroke, Circle, Fill, Text } from 'ol/style';
import $ from 'jquery';
import { Overlay, Map, View } from 'ol';
import { Tile, Vector } from 'ol/layer';
import { Vector as VectorSource, XYZ, OSM } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { transform } from 'ol/proj';
import { requireInputElement, getElement, getInputElement } from './domUtils.js';
import { iemdata } from './iemdata.js';
import { setState, getState, StateKeys } from './state.js';
import { VanillaSlider } from './vanillaSlider.js';
import moment from 'moment';

let olmap = null;
let productVectorCountyLayer = null;
let productVectorPolygonLayer = null;
let sbwIntersectionLayer = null;
let lsrLayer = null;
let radarTMSLayer = null;
let radartimes = [];
const eventTable = null;
const ugcTable = null;
let lsrTable = null;
let sbwLsrTable = null;
let element = null;
let loadedVTEC = '';

// Fix WFO ids that come in wrong
const wfoLookup = {
    KAFG: 'PAFG',
    KAFC: 'PAFC',
    KAJK: 'PAJK',
    KGUM: 'PGUM',
    KHFO: 'PHFO',
    KJSJ: 'TJSJ',
};

const sbwLookup = {
    TO: 'red',
    MA: 'purple',
    FF: 'green',
    EW: 'green',
    FA: 'green',
    FL: 'green',
    SV: 'yellow',
    SQ: '#C71585',
    DS: '#FFE4C4',
};

const lsrLookup = {
    0: '/lsr/icons/tropicalstorm.gif',
    1: '/lsr/icons/flood.png',
    2: '/lsr/icons/other.png',
    3: '/lsr/icons/other.png',
    4: '/lsr/icons/other.png',
    5: '/lsr/icons/ice.png',
    6: '/lsr/icons/cold.png',
    7: '/lsr/icons/cold.png',
    8: '/lsr/icons/fire.png',
    9: '/lsr/icons/other.png',
    a: '/lsr/icons/other.png',
    A: '/lsr/icons/wind.png',
    B: '/lsr/icons/downburst.png',
    C: '/lsr/icons/funnelcloud.png',
    D: '/lsr/icons/winddamage.png',
    E: '/lsr/icons/flood.png',
    F: '/lsr/icons/flood.png',
    v: '/lsr/icons/flood.png',
    G: '/lsr/icons/wind.png',
    h: '/lsr/icons/hail.png',
    H: '/lsr/icons/hail.png',
    I: '/lsr/icons/hot.png',
    J: '/lsr/icons/fog.png',
    K: '/lsr/icons/lightning.gif',
    L: '/lsr/icons/lightning.gif',
    M: '/lsr/icons/wind.png',
    N: '/lsr/icons/wind.png',
    O: '/lsr/icons/wind.png',
    P: '/lsr/icons/other.png',
    Q: '/lsr/icons/tropicalstorm.gif',
    R: '/vendor/icons/lsr/rain/{{magnitude}}.png',
    s: '/lsr/icons/sleet.png',
    S: '/vendor/icons/lsr/snow/{{magnitude}}.png',
    T: '/lsr/icons/tornado.png',
    U: '/lsr/icons/fire.png',
    V: '/lsr/icons/avalanche.gif',
    W: '/lsr/icons/waterspout.png',
    X: '/lsr/icons/funnelcloud.png',
    Z: '/lsr/icons/blizzard.png',
};

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
 * Generate a commonly used VTEC string in the form of
 * YYYY-O-NEW-WFO-PHENOMENA-SIGNIFICANCE-ETN
 * @returns {string} The VTEC string
 */
function vtecString() {
    return `${getYear()}-O-NEW-${getWFO()}-${getPhenomena()}-${getSignificance()}-${String(
        getETN()
    ).padStart(4, '0')}`;
}

/**
 * Important gateway for updating the app
 * fires off a navigateTo call, which may or may not reload the data
 * depending on the VTEC string
 * @returns {void}
 */
function updateURL() {
    let url = `/vtec/event/${vtecString()}`;
    const radar_product_time = getState(StateKeys.RADAR_PRODUCT_TIME);
    if (
        radar_product_time !== null &&
        getState(StateKeys.RADAR_PRODUCT) !== null &&
        getState(StateKeys.RADAR) !== null
    ) {
        url += `/radar/${getState(StateKeys.RADAR)}-${getState(
            StateKeys.RADAR_PRODUCT
        )}-${radar_product_time.utc().format('YMMDDHHmm')}`;
    }
    url += `/tab/${getState(StateKeys.ACTIVE_TAB)}`;
    if (getState(StateKeys.ACTIVE_UPDATE) !== null) {
        url += `/update/${getState(StateKeys.ACTIVE_UPDATE)}`;
    }
    document.title = `VTEC Event ${vtecString()}`;
    navigateTo(url);
}

/**
 * https://stackoverflow.com/questions/2044616
 */
export function selectElementContents(elid) {
    const el = document.getElementById(elid);
    const body = document.body;
    let range = null;
    let sel = null;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch {
            range.selectNode(el);
            sel.addRange(range);
        }
        document.execCommand('copy');
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
        range.execCommand('Copy');
    }
}

function getSignificance() {
    const significanceElement = getInputElement('significance');
    return escapeHTML(significanceElement ? significanceElement.value : '');
}
function setSignificance(significance) {
    const significanceElement = getInputElement('significance');
    if (significanceElement) {
        significanceElement.value = escapeHTML(significance);
    }
}
//----------------
function getETN() {
    return parseInt(requireInputElement('etn').value, 10);
}
function setETN(etn) {
    etn = parseInt(etn, 10);
    if (etn > 0 && etn < 10000) {
        const etnElement = getInputElement('etn');
        if (etnElement) {
            etnElement.value = etn.toString();
        }
    }
}
/**
 * Replace HTML special characters with their entity equivalents
 * @param string val
 * @returns string converted string
 */
function escapeHTML(val) {
    return val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

const lsrStyle = new Style({
    image: new Icon({ src: lsrLookup['9'] }),
});

const sbwStyle = [
    new Style({
        stroke: new Stroke({
            color: '#FFF',
            width: 4.5,
        }),
    }),
    new Style({
        stroke: new Stroke({
            color: '#319FD3',
            width: 3,
        }),
    }),
];

const sbwIntersectionStyle = [
    new Style({
        stroke: new Stroke({
            color: '#551A8B',
            width: 10,
        }),
    }),
];

const textStyle = new Style({
    image: new Circle({
        radius: 10,
        stroke: new Stroke({
            color: '#fff',
        }),
        fill: new Fill({
            color: '#3399CC',
        }),
    }),
    text: new Text({
        font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
        fill: new Fill({
            color: 'white',
        }),
    }),
});

function getWFO() {
    return escapeHTML(getInputElement('wfo').value);
}
function setWFO(wfo) {
    getInputElement('wfo').value = escapeHTML(wfo);
}
function getYear() {
    return parseInt(requireInputElement('year').value, 10);
}
function setYear(year) {
    requireInputElement('year').value = escapeHTML(year);
}
//----------------
function getPhenomena() {
    return escapeHTML($('#phenomena').val());
}
function setPhenomena(phenomena) {
    $('#phenomena').val(escapeHTML(phenomena));
}
//----------------

/**
 * Encode the current vtec into CGI parms
 * @returns {string} The URL encoded string
 */
function urlencode() {
    return `?year=${getYear()}&phenomena=${getPhenomena()}&significance=${getSignificance()}&eventid=${getETN()}&wfo=${getWFO()}`;
}
/**
 * Push the URL onto the HTML5 history stack
 * and call handleURLChange, which may or may not reload the data
 * @param {String} url
 */
function navigateTo(url) {
    history.pushState(null, '', url);
    handleURLChange(url);
}

/**
 * Process the URL and update the app state
 * @param {String} url
 * @returns {void}
 */
function handleURLChange(url) {
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
    if (loadedVTEC !== vtecString()) {
        loadTabs();
    }
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
    $(`#text_tabs a[data-update='${tab}']`).click();
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
    $(`#thetabs_tabs a[href='#${tab}']`).click();
}

/**
 * Initialization time check of URI and consume what it sets
 * @returns {void}
 */
function consumeInitialURL() {
    // Assume we start with /event, which is true via Apache rewrite
    if (window.location.pathname.startsWith('/vtec/event')) {
        handleURLChange(window.location.pathname);
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

function make_iem_tms(title, layername, visible, type) {
    return new Tile({
        // @ts-ignore
        title,
        visible,
        type,
        source: new XYZ({
            url: `/c/tile.py/1.0.0/${layername}/{z}/{x}/{y}.png`,
        }),
    });
}

function getRADARSource() {
    const dt = radartimes[VanillaSlider.getValue('timeslider')];
    if (dt === undefined) {
        return new XYZ({
            url: '/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png',
        });
    }
    radarTMSLayer.set('title', `@ ${dt.format()}`);
    const radarSourceElement = getInputElement('radarsource');
    const radarProductElement = getInputElement('radarproduct');
    const src = escapeHTML(radarSourceElement ? radarSourceElement.value : '');
    const prod = escapeHTML(radarProductElement ? radarProductElement.value : '');
    const url = `/cache/tile.py/1.0.0/ridge::${src}-${prod}-${dt
        .utc()
        .format('YMMDDHHmm')}/{z}/{x}/{y}.png`;
    return new XYZ({
        url,
    });
}

function buildMap() {
    element = document.getElementById('popup');
    // Build up the mapping
    radarTMSLayer = new Tile({
        title: 'NEXRAD Base Reflectivity',
        source: getRADARSource(),
    });
    productVectorCountyLayer = new Vector({
        title: 'VTEC Product Geometry',
        style: () => {
            return [
                new Style({
                    stroke: new Stroke({
                        color: '#000000',
                        width: 2,
                    }),
                }),
            ];
        },
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });

    sbwIntersectionLayer = new Vector({
        title: 'SBW County Intersection',
        style: sbwIntersectionStyle,
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });

    productVectorPolygonLayer = new Vector({
        title: 'VTEC Product Polygon',
        style: (feature) => {
            sbwStyle[1]
                .getStroke()
                .setColor(sbwLookup[feature.get('phenomena')]);
            return sbwStyle;
        },
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });

    lsrLayer = new Vector({
        title: 'Local Storm Reports',
        style: (feature) => {
            if (feature.get('type') === 'S' || feature.get('type') === 'R') {
                textStyle
                    .getText()
                    .setText(feature.get('magnitude').toString());
                return textStyle;
            }
            let url = lsrLookup[feature.get('type')];
            if (url) {
                url = url.replace('{{magnitude}}', feature.get('magnitude'));
                const icon = new Icon({
                    src: url,
                });
                lsrStyle.setImage(icon);
            }
            return lsrStyle;
        },
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });
}
function lsrFeatureHTML(feature) {
    // Make a pretty HTML feature
    const html = [
        '<div class="panel panel-default">',
        '<div class="panel-heading">',
        '<h3 class="panel-title">Local Storm Report</h3>',
        '</div>',
        '<div class="panel-body">',
        `<strong>Event</strong>: ${feature.get('event')}<br />`,
        `<strong>Location</strong>: ${feature.get('city')}<br />`,
        `<strong>Time</strong>: ${moment
            .utc(feature.get('utc_valid'))
            .format('MMM Do, h:mm a')}<br />`,
        `<strong>Magnitude</strong>: ${feature.get('magnitude')}<br />`,
        `<strong>Remark</strong>: ${feature.get('remark')}<br />`,
        '</div>',
        '</div>',
    ];
    return html.join('\n');
}

/**
 * Query radar service for available RADARs and products
 * and update the UI
 */
function updateRADARTimeSlider() {
    $.ajax({
        data: {
            radar: $('#radarsource').val(),
            product: $('#radarproduct').val(),
            start: getState(StateKeys.ISSUE).utc().format(),
            end: getState(StateKeys.EXPIRE).utc().format(),
            operation: 'list',
        },
        url: '/json/radar.py',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            // remove previous options
            radartimes = [];
            $.each(data.scans, (_idx, scan) => {
                radartimes.push(moment.utc(scan.ts));
            });
            if (
                getState(StateKeys.RADAR_PRODUCT_TIME) === null &&
                radartimes.length > 0
            ) {
                setState(StateKeys.RADAR_PRODUCT_TIME, radartimes[0]);
            }
            let idx = 0;
            $.each(radartimes, (i, rt) => {
                if (rt.isSame(getState(StateKeys.RADAR_PRODUCT_TIME))) {
                    idx = i;
                }
            });
            VanillaSlider.setOption('timeslider', 'max', radartimes.length - 1);
            VanillaSlider.setValue('timeslider', idx);
        },
    });
}

/**
 * Query radar service for available RADAR products and update the UI
 */
function updateRADARProducts() {
    // operation=products&radar=USCOMP&start=2012-01-23T08%3A10Z
    $.ajax({
        data: {
            radar: $('#radarsource').val(),
            start:
                getState(StateKeys.ISSUE) !== null
                    ? getState(StateKeys.ISSUE).utc().format()
                    : '',
            operation: 'products',
        },
        url: '/json/radar.py',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            // remove previous options
            const radarProductSelect = getElement('radarproduct');
            if (radarProductSelect) {
                radarProductSelect.innerHTML = '';
            }
            $.each(data.products, (_idx, product) => {
                $('#radarproduct').append(
                    `<option value="${product.id}">${product.name}</option>`
                );
            });
            if (getState(StateKeys.RADAR_PRODUCT)) {
                $('#radarproduct').val(getState(StateKeys.RADAR_PRODUCT));
            } else {
                setState(StateKeys.ISSUE, escapeHTML($('#radarproduct').val()));
            }
            // step3
            updateRADARTimeSlider();
        },
    });
}

/**
 * Query radar service for available RADARs and update the UI
 */
function updateRADARSources() {
    // Use these x, y coordinates to drive our RADAR availablility work
    const center = transform(
        olmap.getView().getCenter(),
        'EPSG:3857',
        'EPSG:4326'
    );
    $.ajax({
        data: {
            lat: center[1],
            lon: center[0],
            start:
                getState(StateKeys.ISSUE) !== null
                    ? getState(StateKeys.ISSUE).utc().format()
                    : '',
            operation: 'available',
        },
        url: '/json/radar.py',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            // remove previous options
            $('#radarsource').empty();
            $.each(data.radars, (_idx, radar) => {
                const radarSourceSelect = getElement('radarsource');
                if (radarSourceSelect) {
                    radarSourceSelect.insertAdjacentHTML('beforeend', 
                        `<option value="${radar.id}">${radar.name}</option>`);
                }
            });
            if (getState(StateKeys.RADAR)) {
                $('#radarsource').val(getState(StateKeys.RADAR));
            } else {
                setState(StateKeys.ISSUE, escapeHTML($('#radarsource').val()));
            }
            // step2
            updateRADARProducts();
        },
    });
}

/**
 * Build a common data object with the payload to send to web services
 * @returns {Object} The data to be sent to the server
 */
function getData() {
    return {
        wfo: getWFO(),
        phenomena: getPhenomena(),
        significance: getSignificance(),
        etn: getETN(),
        year: getYear(),
    };
}

function getVTECGeometry() {
    // After the initial metadata is fetched, we get the geometry
    const payload = getData();
    payload.sbw = 0;
    payload.lsrs = 0;
    $.ajax({
        data: payload,
        url: '/geojson/vtec_event.py',
        method: 'GET',
        dataType: 'json',
        success: (geodata) => {
            // The below was way painful on how to get the EPSG 4326 data
            // to load
            const format = new GeoJSON({
                featureProjection: 'EPSG:3857',
            });
            const vectorSource = new VectorSource({
                features: format.readFeatures(geodata),
            });
            productVectorCountyLayer.setSource(vectorSource);
            const ee = productVectorCountyLayer.getSource().getExtent();
            const xx = (ee[2] + ee[0]) / 2.0;
            const yy = (ee[3] + ee[1]) / 2.0;
            olmap.getView().setCenter([xx, yy]);
            updateRADARSources();
        },
    });
    const payload2 = getData();
    payload2.sbw = 1;
    payload2.lsrs = 0;
    $.ajax({
        data: payload2,
        url: '/geojson/vtec_event.py',
        method: 'GET',
        dataType: 'json',
        success: (geodata) => {
            // The below was way painful on how to get the EPSG 4326 data
            // to load
            const format = new GeoJSON({
                featureProjection: 'EPSG:3857',
            });
            const vectorSource = new VectorSource({
                features: format.readFeatures(geodata),
            });
            productVectorPolygonLayer.setSource(vectorSource);
        },
    });
    // Intersection
    $.ajax({
        data: getData(),
        url: '/geojson/sbw_county_intersect.geojson',
        method: 'GET',
        dataType: 'json',
        success: (geodata) => {
            // The below was way painful on how to get the EPSG 4326 data
            // to load
            const format = new GeoJSON({
                featureProjection: 'EPSG:3857',
            });
            const vectorSource = new VectorSource({
                features: format.readFeatures(geodata),
            });
            sbwIntersectionLayer.setSource(vectorSource);
        },
    });

    // All LSRs
    const payload3 = getData();
    payload3.sbw = 0;
    payload3.lsrs = 1;
    $.ajax({
        data: payload3,
        url: '/geojson/vtec_event.py',
        method: 'GET',
        dataType: 'json',
        success: (geodata) => {
            const format = new GeoJSON({
                featureProjection: 'EPSG:3857',
            });
            const vectorSource = new VectorSource({
                features: format.readFeatures(geodata),
            });
            lsrLayer.setSource(vectorSource);
            lsrTable.clear();
            $.each(geodata.features, (_idx, feat) => {
                const prop = feat.properties;
                lsrTable.row.add(prop);
            });
            lsrTable.draw();
        },
    });
    // SBW LSRs
    const payload4 = getData();
    payload4.sbw = 1;
    payload4.lsrs = 1;
    $.ajax({
        data: payload4,
        url: '/geojson/vtec_event.py',
        method: 'GET',
        dataType: 'json',
        success: (geodata) => {
            sbwLsrTable.clear();
            $.each(geodata.features, (_idx, feat) => {
                const prop = feat.properties;
                sbwLsrTable.row.add(prop);
            });
            sbwLsrTable.draw();
        },
    });
}

/**
 * Make web services calls to get VTEC data and load the tabs with information
 */
function loadTabs() {
    loadedVTEC = vtecString();
    const vstring = vtecString();
    const vstring2 = `${getYear()}.${getWFO()}.${getPhenomena()}.${getSignificance()}.${String(
        getETN()
    ).padStart(4, '0')}`;
    $('#radarmap').html(
        `<img src="/GIS/radmap.php?layers[]=nexrad&layers[]=sbw&layers[]=sbwh&layers[]=uscounties&vtec=${vstring}" class="img img-responsive">`
    );
    $('#sbwhistory').html(
        `<img src="/GIS/sbw-history.php?vtec=${vstring2}" class="img img-responsive">`
    );

    $('#vtec_label').html(
        `${getYear()} ${escapeHTML($('#wfo option:selected').text())}
            ${escapeHTML($('#phenomena option:selected').text())}
            ${escapeHTML($('#significance option:selected').text())}
            Number ${getETN()}`
    );
    $.ajax({
        data: getData(),
        url: '/json/vtec_event.py',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            if (!data.event_exists) {
                $('#info_event_found').hide();
                $('#info_event_not_found').show();
                return;
            }
            $('#info_event_found').show();
            $('#info_event_not_found').hide();
            const tabs = $('#textdata ul');
            const tabcontent = $('#textdata div.tab-content');
            tabs.empty();
            tabcontent.empty();
            tabs.append('<li><a href="#tall" data-toggle="tab">All</a></li>');
            const stamp = moment
                .utc(data.report.valid)
                .local()
                .format('DD/h:mm A');
            const update = moment.utc(data.report.valid).format('YYYYMMDDHHmm');
            tabs.append(
                `<li class="active"><a href="#t0" data-update="${update}" onclick="setUpdate('${update}');" data-toggle="tab">Issue ${stamp}</a></li>`
            );
            const plink = `<a href="/p.php?pid=${data.report.product_id}" target="_new">Permalink to ${data.report.product_id}</a><br />`;
            tabcontent.append(
                `<div class="tab-pane" id="tall"><pre>${data.report.text}</pre></div>`
            );
            tabcontent.append(
                `<div class="tab-pane active" id="t0">${plink}<pre>${data.report.text}</pre></div>`
            );
            let tidx = 1;
            $.each(data.svs, (_idx, svs) => {
                const splink = `<a href="/p.php?pid=${svs.product_id}" target="_new">Permalink to ${svs.product_id}</a><br />`;
                const sstamp = moment
                    .utc(svs.valid)
                    .local()
                    .format('DD/h:mm A');
                const supdate = moment.utc(svs.valid).format('YYYYMMDDHHmm');
                tabs.append(
                    `<li><a href="#t${tidx}" data-update="${supdate}" onclick="setUpdate('${supdate}');" data-toggle="tab">U${tidx}: ${sstamp}</a></li>`
                );
                tabcontent.append(
                    `<div class="tab-pane" id="t${tidx}">${splink}<pre>${svs.text}</pre></div>`
                );
                $('#tall').append(`<pre>${svs.text}</pre>`);
                tidx += 1;
            });
            if (getState(StateKeys.ACTIVE_UPDATE) !== null) {
                $(
                    `#textdata a[data-update="${getState(StateKeys.ACTIVE_UPDATE)}"]`
                ).click();
            }
            ugcTable.clear();
            $.each(data.ugcs, (_idx, ugc) => {
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
            getVTECGeometry();
        },
    });

    $.ajax({
        data: getData(),
        url: '/json/vtec_events.py',
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            eventTable.clear();
            $.each(data.events, (_idx, vtec) => {
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
        },
    });
    // Set the active tab to 'Event Info' if we are on the first tab
    if ($('#thetabs_tabs a').attr('href') === '#help') {
        $("#thetabs_tabs a[href='#info']").click();
    }
}
function remarkformat(d) {
    // `d` is the original data object for the row
    return `<div style="margin-left: 10px;"><strong>Remark:</strong> ${d.remark}</div>`;
}
function makeLSRTable(div) {
    const table = $(`#${div}`).DataTable({
        select: 'single',
        columns: [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: '',
                render: () => {
                    return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
                },
                width: '15px',
            },
            { data: 'utc_valid' },
            { data: 'event' },
            { data: 'magnitude' },
            { data: 'city' },
            { data: 'county' },
            { data: 'remark', visible: false },
        ],
        order: [[1, 'asc']],
    });
    // Add event listener for opening and closing details
    $(`#${div} tbody`).on('click', 'td.details-control', function () {
        // this
        const tr = $(this).closest('tr');
        const tdi = tr.find('i.fa');
        const row = table.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            tdi.first().removeClass('fa-minus-square');
            tdi.first().addClass('fa-plus-square');
        } else {
            // Open this row
            row.child(remarkformat(row.data())).show();
            tr.addClass('shown');
            tdi.first().removeClass('fa-plus-square');
            tdi.first().addClass('fa-minus-square');
        }
    });

    table.on('user-select', (e, _dt, _type, cell) => {
        if ($(cell.node()).hasClass('details-control')) {
            e.preventDefault();
        }
    });
    return table;
}

function buildUI() {
    // One time build up of UI and handlers

    // When tabs are clicked
    $('#thetabs_tabs a').click(function () {
        // this
        setState(StateKeys.ACTIVE_TAB, this.href.split('#')[1]);
        updateURL();
    });

    let html = '';
    $.each(iemdata.wfos, (_idx, arr) => {
        html += `<option value="${arr[0]}">[${arr[0]}] ${arr[1]}</option>`;
    });
    const $wfo = $('#wfo');
    $wfo.append(html);
    $wfo.val('KDMX');

    html = '';
    $.each(iemdata.vtec_phenomena_dict, (_idx, arr) => {
        html += `<option value="${arr[0]}">${arr[1]} (${arr[0]})</option>`;
    });
    $('#phenomena').append(html);
    $("#phenomena option[value='TO']").prop('selected', true);

    html = '';
    $.each(iemdata.vtec_sig_dict, (_idx, arr) => {
        html += `<option value="${arr[0]}">${arr[1]} (${arr[0]})</option>`;
    });
    $('#significance').append(html);
    $("#significance option[value='W']").prop('selected', true);

    html = '';
    for (let year = 1986; year <= new Date().getFullYear(); year++) {
        html += `<option value="${year}">${year}</option>`;
    }
    $('#year').append(html);
    $('#year option[value=2024]').prop('selected', true);

    setETN(45);
    $('#etn-prev').click(function () {
        // this
        setETN(getETN() - 1);
        updateURL();
        // unselect the button
        $(this).blur();
    });
    $('#etn-next').click(function () {
        // this
        setETN(getETN() + 1);
        updateURL();
        $(this).blur();
    });

    $('#myform-submit').click(function () {
        // this
        updateURL();
        $(this).blur();
    });
    //ugcTable = $('#ugctable').DataTable();
    lsrTable = makeLSRTable('lsrtable');
    sbwLsrTable = makeLSRTable('sbwlsrtable');

    //eventTable = $('#eventtable').DataTable();
    $('#eventtable tbody').on('click', 'tr', function () {
        // this
        const data = eventTable.row(this).data();
        if (parseInt(data[0], 10) === getETN()) {
            return;
        }
        setETN(data[0]);
        // Switch to the details tab, which will trigger update
        $("#thetabs_tabs a[href='#info']").trigger('click');
    });

    $('a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
        const target = $(e.target).attr('href'); // activated tab
        if (target === '#themap') {
            olmap.updateSize();
        }
    });
    
    // Initialize radar opacity slider
    new VanillaSlider('radaropacity', {
        min: 0,
        max: 100,
        value: 100,
        onSlide: (value) => {
            radarTMSLayer.setOpacity(parseInt(value) / 100.0);
        }
    });
    
    // Initialize time slider  
    new VanillaSlider('timeslider', {
        min: 0,
        max: 100,
        onChange: (value) => {
            if (radartimes[value] === undefined) {
                return;
            }
            setState(StateKeys.RADAR_PRODUCT_TIME, radartimes[value]);
            radarTMSLayer.setSource(getRADARSource());
            const label = radartimes[value]
                .local()
                .format('D MMM YYYY h:mm A');
            const radarTimeElement = getElement('radartime');
            if (radarTimeElement) {
                radarTimeElement.innerHTML = label;
            }
            updateURL();
        },
        onSlide: (value) => {
            const label = radartimes[value]
                .local()
                .format('D MMM YYYY h:mm A');
            $('#radartime').html(label);
            updateURL();
        }
    });
    $('#radarsource').change(() => {
        setState(StateKeys.RADAR, escapeHTML($('#radarsource').val()));
        updateRADARProducts();
        updateURL();
    });
    $('#radarproduct').change(() => {
        // we can safely(??) assume that radartimes does not update when we
        // switch products
        setState(StateKeys.RADAR_PRODUCT, escapeHTML($('#radarproduct').val()));
        radarTMSLayer.setSource(getRADARSource());
        updateURL();
    });
    $('#lsr_kml_button').click(() => {
        window.location.href = `/kml/sbw_lsrs.php${urlencode()}`;
    });
    $('#warn_kml_button').click(() => {
        window.location.href = `/kml/vtec.php${urlencode()}`;
    });
    $('#ci_kml_button').click(() => {
        window.location.href = `/kml/sbw_county_intersect.php${urlencode()}`;
    });
    $('#gr_button').click(() => {
        window.location.href = `/request/grx/vtec.php${urlencode()}`;
    });

    $('#toolbar-print').click(function () {
        // this
        $(this).blur();
        const tabid = $('#textdata .nav-tabs li.active a').attr('href');
        // https://stackoverflow.com/questions/33732739
        const divToPrint = $(tabid)[0];
        const newWin = window.open('', 'Print-Window');
        newWin.document.open();
        newWin.document.write(
            `<html><body onload="window.print()">${divToPrint.innerHTML}</body></html>`
        );
        newWin.document.close();
        setTimeout(() => {
            newWin.close();
        }, 10);
    });
}

/**
 * Entry point
 */
export function main() {
    //----------------

    /**
     * Listen for user hitting the back and forward buttons
     */
    window.addEventListener('popstate', () => {
        handleURLChange(document.location.pathname);
    });

    olmap = new Map({
        target: 'map',
        view: new View({
            enableRotation: false,
            center: transform([-94.5, 42.1], 'EPSG:4326', 'EPSG:3857'),
            zoom: 7,
        }),
        layers: [
            new Tile({
                title: 'OpenStreetMap',
                visible: true,
                source: new OSM(),
            }),
            radarTMSLayer,
            make_iem_tms('US States', 'usstates', true, ''),
            make_iem_tms('US Counties', 'uscounties', false, ''),
            sbwIntersectionLayer,
            productVectorCountyLayer,
            productVectorPolygonLayer,
            lsrLayer,
        ],
    });
    const popup = new Overlay({
        element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -5],
    });
    olmap.addOverlay(popup);
    /**
        const layerSwitcher = new ol.control.LayerSwitcher();
        olmap.addControl(layerSwitcher);
        */

    olmap.on('moveend', () => {
        // Someday, we will hashlink this too
    });
    // display popup on click
    // TODO support mobile
    olmap.on('click', (evt) => {
        const feature = olmap.forEachFeatureAtPixel(evt.pixel, (feature2) => {
            return feature2;
        });
        if (feature) {
            if (feature.get('magnitude') === undefined) {
                return;
            }
            const coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            $(element).popover({
                placement: 'top',
                html: true,
                content: lsrFeatureHTML(feature),
            });
            $(element).popover('show');
        } else {
            $(element).popover('destroy');
        }
    });

    // Step 1, activate UI components
    buildUI();
    // Step 2, build the map
    buildMap();
    // Step 3, consume the URL to resolve the data to load
    consumeInitialURL();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main function
    main();
});
