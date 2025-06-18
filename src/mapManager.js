import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import { Style, Icon, Stroke, Circle, Fill, Text } from 'ol/style';
import { Tile, Vector } from 'ol/layer';
import { Vector as VectorSource, OSM, XYZ } from 'ol/source';
import { Overlay, Map, View } from 'ol';
import { transform } from 'ol/proj';
import { GeoJSON } from 'ol/format';
import { requireSelectElement, escapeHTML } from 'iemjs/domUtils';
import { setState, getState, StateKeys } from './state.js';
import { populateSelectFromObjects } from './selectUtils.js';
import { updateTimeSlider } from './uiManager.js';
import LayerSwitcher from 'ol-layerswitcher';
import moment from 'moment';

let olmap = null;
let productVectorCountyLayer = null;
let productVectorPolygonLayer = null;
let sbwIntersectionLayer = null;
let lsrLayer = null;
let radarTMSLayer = null;
let radartimes = [];
let element = null;

export function getLSRLayer() {
    return lsrLayer;
}

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
    0: 'https://mesonet.agron.iastate.edu/lsr/icons/tropicalstorm.gif',
    1: 'https://mesonet.agron.iastate.edu/lsr/icons/flood.png',
    2: 'https://mesonet.agron.iastate.edu/lsr/icons/other.png',
    3: 'https://mesonet.agron.iastate.edu/lsr/icons/other.png',
    4: 'https://mesonet.agron.iastate.edu/lsr/icons/other.png',
    5: 'https://mesonet.agron.iastate.edu/lsr/icons/ice.png',
    6: 'https://mesonet.agron.iastate.edu/lsr/icons/cold.png',
    7: 'https://mesonet.agron.iastate.edu/lsr/icons/cold.png',
    8: 'https://mesonet.agron.iastate.edu/lsr/icons/fire.png',
    9: 'https://mesonet.agron.iastate.edu/lsr/icons/other.png',
    a: 'https://mesonet.agron.iastate.edu/lsr/icons/other.png',
    A: 'https://mesonet.agron.iastate.edu/lsr/icons/wind.png',
    B: 'https://mesonet.agron.iastate.edu/lsr/icons/downburst.png',
    C: 'https://mesonet.agron.iastate.edu/lsr/icons/funnelcloud.png',
    D: 'https://mesonet.agron.iastate.edu/lsr/icons/winddamage.png',
    E: 'https://mesonet.agron.iastate.edu/lsr/icons/flood.png',
    F: 'https://mesonet.agron.iastate.edu/lsr/icons/flood.png',
    v: 'https://mesonet.agron.iastate.edu/lsr/icons/flood.png',
    G: 'https://mesonet.agron.iastate.edu/lsr/icons/wind.png',
    h: 'https://mesonet.agron.iastate.edu/lsr/icons/hail.png',
    H: 'https://mesonet.agron.iastate.edu/lsr/icons/hail.png',
    I: 'https://mesonet.agron.iastate.edu/lsr/icons/hot.png',
    J: 'https://mesonet.agron.iastate.edu/lsr/icons/fog.png',
    K: 'https://mesonet.agron.iastate.edu/lsr/icons/lightning.gif',
    L: 'https://mesonet.agron.iastate.edu/lsr/icons/lightning.gif',
    M: 'https://mesonet.agron.iastate.edu/lsr/icons/wind.png',
    N: 'https://mesonet.agron.iastate.edu/lsr/icons/wind.png',
    O: 'https://mesonet.agron.iastate.edu/lsr/icons/wind.png',
    P: 'https://mesonet.agron.iastate.edu/lsr/icons/other.png',
    Q: 'https://mesonet.agron.iastate.edu/lsr/icons/tropicalstorm.gif',
    R: 'https://mesonet.agron.iastate.edu/lsr/rain/{{magnitude}}.png',
    s: 'https://mesonet.agron.iastate.edu/lsr/icons/sleet.png',
    S: 'https://mesonet.agron.iastate.edu/lsr/snow/{{magnitude}}.png',
    T: 'https://mesonet.agron.iastate.edu/lsr/icons/tornado.png',
    U: 'https://mesonet.agron.iastate.edu/lsr/icons/fire.png',
    V: 'https://mesonet.agron.iastate.edu/lsr/icons/avalanche.gif',
    W: 'https://mesonet.agron.iastate.edu/lsr/icons/waterspout.png',
    X: 'https://mesonet.agron.iastate.edu/lsr/icons/funnelcloud.png',
    Z: 'https://mesonet.agron.iastate.edu/lsr/icons/blizzard.png',
};

function createLSRStyle() {
    return new Style({
        image: new Icon({ src: lsrLookup['9'] }),
    });
}

function createSBWStyle() {
    return [
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
}

function createSBWIntersectionStyle() {
    return [
        new Style({
            stroke: new Stroke({
                color: '#551A8B',
                width: 10,
            }),
        }),
    ];
}

function createTextStyle() {
    return new Style({
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
}

export function getProductVectorCountyLayer() {
    return productVectorCountyLayer;
}
export function getMap() {
    return olmap;
}
export function getRadarTMSLayer() {
    return radarTMSLayer;
}
export function getSBWIntersectionLayer() {
    return sbwIntersectionLayer;
}

export function getProductVectorPolygonLayer() {
    return productVectorPolygonLayer;
}

export function getRadarTimes() {
    return radartimes;
}

/**
 * Get the RADAR source for a specific time index
 * @param {number} timeIndex 
 * @returns {XYZ}
 */
export function getRADARSource(timeIndex = 0) {
    const radartimes = getRadarTimes();
    const dt = radartimes[timeIndex];
    if (!radartimes || !dt) {
        console.error(`FIXME: time: ${timeIndex} with radartimes:`, radartimes);
        const url = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png';
        return new XYZ({url});
    }
    radarTMSLayer.set('title', `@ ${dt.format()}`);
    const radarSourceElement = requireSelectElement('radarsource');
    const radarProductElement = requireSelectElement('radarproduct');
    const src = escapeHTML(radarSourceElement ? radarSourceElement.value : '');
    const prod = escapeHTML(radarProductElement ? radarProductElement.value : '');
    const url = `https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::${src}-${prod}-${dt
        .utc()
        .format('YMMDDHHmm')}/{z}/{x}/{y}.png`;
    return new XYZ({url});
}

/**
 * Updates the RADAR TMS source and UI elements relevant.
 * @param {number} timeIndex 
 */
export function updateRadarDisplay(timeIndex)  {
    const layer = getRadarTMSLayer();
    layer.setSource(getRADARSource(timeIndex));
}

function make_iem_tms(title, layername, visible, type) {
    return new Tile({
        // @ts-ignore
        title,
        visible,
        type,
        source: new XYZ({
            url: `https://mesonet.agron.iastate.edu/c/tile.py/1.0.0/${layername}/{z}/{x}/{y}.png`,
        }),
    });
}


export function buildMap() {
    element = document.getElementById('popup');
    if (!element) {
        console.error('Popup element with id "popup" not found in DOM');
        return;
    }
    
    // Set up close button handler
    const closer = document.getElementById('popup-closer');
    if (closer) {
        closer.onclick = function() {
            element.style.display = 'none';
            return false;
        };
    }
    // Build up the mapping
    radarTMSLayer = new Tile({
        // @ts-ignore
        title: 'NEXRAD Base Reflectivity',
        source: getRADARSource(),
    });
    productVectorCountyLayer = new Vector({
        // @ts-ignore
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
        // @ts-ignore
        title: 'SBW County Intersection',
        style: createSBWIntersectionStyle(),
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });

    productVectorPolygonLayer = new Vector({
        // @ts-ignore
        title: 'VTEC Product Polygon',
        style: (feature) => {
            const sbwStyle = createSBWStyle();
            sbwStyle[1]
                .getStroke()
                ?.setColor(sbwLookup[feature.get('phenomena')]);
            return sbwStyle;
        },
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });

    lsrLayer = new Vector({
        // @ts-ignore
        title: 'Local Storm Reports',
        visible: true, // Ensure the layer is visible by default
        zIndex: 1000, // Put LSR layer on top
        style: (feature) => {
            if (feature.get('type') === 'S' || feature.get('type') === 'R') {
                const textStyle = createTextStyle();
                textStyle
                    .getText()
                    ?.setText(feature.get('magnitude').toString());
                return textStyle;
            }
            const lsrStyle = createLSRStyle();
            let url = lsrLookup[feature.get('type')];
            if (url) {
                url = url.replace('{{magnitude}}', feature.get('magnitude'));
                const icon = new Icon({
                    src: url,
                    scale: 1,
                    anchor: [0.5, 0.5],
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
    console.log('lsrFeatureHTML', feature);
    const html = [
        '<div class="card">',
        '<div class="card-header">',
        '<h5 class="card-title mb-0">Local Storm Report</h5>',
        '</div>',
        '<div class="card-body">',
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
export function updateRADARTimeSlider() {
    const requestData = {
        radar: requireSelectElement('radarsource').value,
        product: requireSelectElement('radarproduct').value,
        // @ts-ignore
        start: getState(StateKeys.ISSUE).utc().format(),
        // @ts-ignore
        end: getState(StateKeys.EXPIRE).utc().format(),
        operation: 'list',
    };
    
    fetch('https://mesonet.agron.iastate.edu/json/radar.py?' + new URLSearchParams(requestData))
        .then(response => response.json())
        .then(data => {
            // remove previous options
            radartimes = [];
            data.scans.forEach(scan => {
                radartimes.push(moment.utc(scan.ts));
            });
            if (
                getState(StateKeys.RADAR_PRODUCT_TIME) === null &&
                radartimes.length > 0
            ) {
                setState(StateKeys.RADAR_PRODUCT_TIME, radartimes[0]);
            }
            let idx = 0;
            const radarProductTime = getState(StateKeys.RADAR_PRODUCT_TIME);
            radartimes.forEach((rt, i) => {
                if (rt.isSame(radarProductTime)) {
                    idx = i;
                }
            });
            updateTimeSlider(radartimes.length - 1, idx);
        });
}

/**
 * Query radar service for available RADAR products and update the UI
 */
export function updateRADARProducts() {
    const issue = getState(StateKeys.ISSUE);
    if (issue === null) {
        return;
    }
    
    const requestData = {
        radar: requireSelectElement('radarsource').value,
        // @ts-ignore
        start: issue.utc().format(),
        operation: 'products',
    };
    
    fetch('https://mesonet.agron.iastate.edu/json/radar.py?' + new URLSearchParams(requestData))
        .then(response => response.json())
        .then(data => {
            populateSelectFromObjects('radarproduct', data.products, undefined, 'id', 'name');
            const radarProduct = getState(StateKeys.RADAR_PRODUCT);
            if (radarProduct) {
                requireSelectElement('radarproduct').value = radarProduct;
            } else {
                setState(StateKeys.RADAR_PRODUCT, escapeHTML(requireSelectElement('radarproduct').value));
            }
            // step3
            updateRADARTimeSlider();
        });
}

/**
 * Query radar service for available RADARs and update the UI
 */
export function updateRADARSources() {
    // Use these x, y coordinates to drive our RADAR availablility work
    const center = transform(
        olmap.getView().getCenter(),
        'EPSG:3857',
        'EPSG:4326'
    );
    
    const requestData = {
        lat: center[1].toString(),
        lon: center[0].toString(),
        // @ts-ignore
        start: getState(StateKeys.ISSUE).utc().format(),
        operation: 'available',
    };
    
    fetch('https://mesonet.agron.iastate.edu/json/radar.py?' + new URLSearchParams(requestData))
        .then(response => response.json())
        .then(data => {
            populateSelectFromObjects('radarsource', data.radars, undefined, 'id', 'name');
            const radar = getState(StateKeys.RADAR);
            if (radar) {
                requireSelectElement('radarsource').value = radar;
            } else {
                setState(StateKeys.RADAR, escapeHTML(requireSelectElement('radarsource').value));
            }
            // step2
            updateRADARProducts();
        });
}

export function initMap() {
    olmap = new Map({
        target: 'map',
        view: new View({
            enableRotation: false,
            center: transform([-94.5, 42.1], 'EPSG:4326', 'EPSG:3857'),
            zoom: 7,
        }),
        layers: [
            new Tile({
                // @ts-ignore
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
    const layerSwitcher = new LayerSwitcher();
    olmap.addControl(layerSwitcher);

    // Add click handler for popup closer
    const popupCloser = document.getElementById('popup-closer');
    if (popupCloser) {
        popupCloser.onclick = function() {
            element.style.display = 'none';
            const popupContent = document.getElementById('popup-content');
            if (popupContent) {
                popupContent.innerHTML = '';
            }
            return false;
        };
    }

    olmap.on('moveend', () => {
        // Someday, we will hashlink this too
    });
    olmap.on('click', (evt) => {
        const feature = olmap.forEachFeatureAtPixel(evt.pixel, (feature2) => {
            return feature2;
        });
        if (feature) {
            // Check if this is an LSR feature (has 'type' property)
            if (!feature.get('type')) {
                return;
            }
            
            const coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            
            // Set the popup content in the popup-content div
            const popupContent = document.getElementById('popup-content');
            if (popupContent) {
                popupContent.innerHTML = lsrFeatureHTML(feature);
            }
            element.style.display = 'block';
        } else {
            // Hide the popup
            element.style.display = 'none';
            const popupContent = document.getElementById('popup-content');
            if (popupContent) {
                popupContent.innerHTML = '';
            }
        }
    });

}