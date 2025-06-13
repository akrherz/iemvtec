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
    //setState(StateKeys.RADAR_PRODUCT_TIME, dt);
    //updateTimeLabel(dt);
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
        style: sbwIntersectionStyle,
        source: new VectorSource({
            format: new GeoJSON(),
        }),
    });

    productVectorPolygonLayer = new Vector({
        // @ts-ignore
        title: 'VTEC Product Polygon',
        style: (feature) => {
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
        style: (feature) => {
            if (feature.get('type') === 'S' || feature.get('type') === 'R') {
                textStyle
                    .getText()
                    ?.setText(feature.get('magnitude').toString());
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
            
            // Create popover content without jQuery
            element.setAttribute('data-bs-placement', 'top');
            element.setAttribute('data-bs-html', 'true');
            element.setAttribute('data-bs-content', lsrFeatureHTML(feature));
            element.setAttribute('title', '');
            
            // Show the popup by making it visible
            element.style.display = 'block';
        } else {
            // Hide the popup
            element.style.display = 'none';
            element.removeAttribute('data-bs-placement');
            element.removeAttribute('data-bs-html');
            element.removeAttribute('data-bs-content');
            element.removeAttribute('title');
        }
    });

}