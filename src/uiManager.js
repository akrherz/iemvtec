/**
 * UI Manager - Centralized UI element creation and management
 * This module handles creation, configuration, and lifecycle of all UI elements
 */
import { VanillaSlider } from './vanillaSlider.js';
import { getRadarTimes, getRadarTMSLayer, updateRadarDisplay } from './mapManager.js';
import { requireElement } from 'iemjs/domUtils';

const uiElements = {
    sliders: {},
    tables: {},
    forms: {}
};

/**
 * Initialize all UI sliders
 */
export function initializeSliders() {
    uiElements.sliders.radarOpacity = new VanillaSlider('radaropacity', {
        min: 0,
        max: 100,
        value: 100,
        onSlide: (value) => {
            const layer = getRadarTMSLayer();
            if (layer) {
                layer.setOpacity(parseInt(value) / 100.0);
            }
        }
    });

    uiElements.sliders.timeSlider = new VanillaSlider('timeslider', {
        min: 0,
        max: 100,
        onChange: (value) => {
            const radartimes = getRadarTimes();
            console.error(`Time slider changed to ${value} with radartimes:`, radartimes);
            if (radartimes && radartimes[value] !== undefined) {
                updateRadarDisplay(value);
                updateTimeLabel(radartimes[value]);
            }
        }
    });
}


/**
 * Update the radar time label display
 * @param {*} datetime - Moment datetime object
 */
export function updateTimeLabel(datetime) {
    const label = datetime.local().format('D MMM YYYY h:mm A');
    const radarTimeElement = requireElement('radartime');
    radarTimeElement.innerHTML = label;
}

/**
 * Get reference to a UI element
 * @param {string} category - Category of UI element (sliders, tables, forms)
 * @param {string} name - Name of the UI element
 * @returns {*} The UI element instance or null
 */
export function getUIElement(category, name) {
    return uiElements[category]?.[name] || null;
}

/**
 * Get the radar opacity slider
 * @returns {VanillaSlider|null}
 */
export function getRadarOpacitySlider() {
    return uiElements.sliders.radarOpacity || null;
}

/**
 * Get the time slider
 * @returns {VanillaSlider|null}
 */
export function getTimeSlider() {
    return uiElements.sliders.timeSlider || null;
}

/**
 * Update time slider configuration
 * @param {number} max - Maximum value for the slider
 * @param {number} value - Current value to set
 */
export function updateTimeSlider(max, value) {
    const slider = getTimeSlider();
    if (slider) {
        slider.setOption('max', max);
        slider.setValue(value);
    }
}

/**
 * Get current time slider value
 * @returns {number} Current slider value
 */
export function getTimeSliderValue() {
    const slider = getTimeSlider();
    return slider ? slider.getValue() : 0;
}

/**
 * Cleanup all UI elements
 */
export function cleanup() {
    Object.values(uiElements.sliders).forEach(slider => {
        if (slider && typeof slider.destroy === 'function') {
            slider.destroy();
        }
    });
    
    Object.keys(uiElements).forEach(category => {
        uiElements[category] = {};
    });
}

/**
 * Initialize all UI elements
 */
export function initializeUI() {
    initializeSliders();
}
