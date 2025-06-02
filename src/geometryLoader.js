/**
 * VTEC geometry loading utilities for fetching and displaying various geometric data
 */
import { 
    getProductVectorCountyLayer, 
    getProductVectorPolygonLayer, 
    getSBWIntersectionLayer, 
    getLSRLayer,
    getMap,
    updateRADARSources 
} from './mapManager.js';
import { fetchWithParams, createGeoJSONVectorSource, getData } from './appUtils.js';

/**
 * Load all VTEC geometry data including county geometry, SBW polygons, intersections, and LSRs
 * @param {any} lsrTable - DataTable instance for LSR data
 * @param {any} sbwLsrTable - DataTable instance for SBW LSR data
 */
export function loadVTECGeometry(lsrTable, sbwLsrTable) {
    const basePayload = getData();
    
    // County geometry
    const countyPayload = { ...basePayload, sbw: 0, lsrs: 0 };
    fetchWithParams('/geojson/vtec_event.py', countyPayload)
        .then((geodata) => {
            getProductVectorCountyLayer().setSource(createGeoJSONVectorSource(geodata));
            const ee = getProductVectorCountyLayer().getSource().getExtent();
            const xx = (ee[2] + ee[0]) / 2.0;
            const yy = (ee[3] + ee[1]) / 2.0;
            getMap().getView().setCenter([xx, yy]);
            updateRADARSources();
        })
        .catch(error => {
            console.error('Error fetching VTEC geometry:', error);
        });
    
    const payload2 = getData();
    payload2.sbw = 1;
    payload2.lsrs = 0;
    fetchWithParams('/geojson/vtec_event.py', payload2)
        .then(geodata => {
            getProductVectorPolygonLayer().setSource(createGeoJSONVectorSource(geodata));
        })
        .catch(error => {
            console.error('Error fetching SBW polygon data:', error);
        });
    
    // Intersection data
    fetchWithParams('/geojson/sbw_county_intersect.geojson', basePayload)
        .then(geodata => {
            getSBWIntersectionLayer().setSource(createGeoJSONVectorSource(geodata));
        })
        .catch(error => {
            console.error('Error fetching intersection data:', error);
        });

    // All LSRs
    const payload3 = getData();
    payload3.sbw = 0;
    payload3.lsrs = 1;
    fetchWithParams('/geojson/vtec_event.py', payload3)
        .then(geodata => {
            getLSRLayer().setSource(createGeoJSONVectorSource(geodata));
            lsrTable.clear();
            geodata.features.forEach(feat => {
                const prop = feat.properties;
                lsrTable.row.add(prop);
            });
            lsrTable.draw();
        })
        .catch(error => {
            console.error('Error fetching LSR data:', error);
        });
    
    // SBW LSRs
    const sbwLsrPayload = { ...basePayload, sbw: 1, lsrs: 1 };
    fetchWithParams('/geojson/vtec_event.py', sbwLsrPayload)
        .then(geodata => {
            sbwLsrTable.clear();
            geodata.features.forEach(feat => {
                const prop = feat.properties;
                sbwLsrTable.row.add(prop);
            });
            sbwLsrTable.draw();
        })
        .catch(error => {
            console.error('Error fetching SBW LSR data:', error);
        });
}
