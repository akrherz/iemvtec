/**
 * Select element utility functions for building options and populating selects
 */
import { requireElement, requireSelectElement } from 'iemjs/domUtils';

/**
 * Utility function to build HTML options for select elements
 * @param {Array} data - Array of [value, text] pairs
 * @param {string} template - Template string with {value} and {text} placeholders
 * @returns {string} HTML options string
 */
export function buildSelectOptions(data, template = '<option value="{value}">{text}</option>') {
    return data.map(([value, text]) => 
        template.replaceAll('{value}', value).replaceAll('{text}', text)
    ).join('');
}

/**
 * Utility function to populate a select element with options and set a default selection
 * @param {string} selectId - The select element ID
 * @param {Array} data - Array of [value, text] pairs
 * @param {string} [defaultValue] - Default value to select
 * @param {string} [template] - Option template string
 */
export function populateSelect(selectId, data, defaultValue, template = '<option value="{value}">{text}</option>') {
    const selectElement = requireSelectElement(selectId);
    const options = buildSelectOptions(data, template);
    selectElement.innerHTML += options;
    
    if (defaultValue) {
        const defaultOption = selectElement.querySelector(`option[value='${defaultValue}']`);
        if (defaultOption instanceof HTMLOptionElement) {
            defaultOption.selected = true;
        }
    }
}

/**
 * Utility function to populate select element with options for dynamic data
 * @param {string} selectId - The select element ID  
 * @param {Array} data - Array of objects with id and name/text properties
 * @param {string} [defaultValue] - Default value to select
 * @param {string} [valueKey='id'] - Key for option value
 * @param {string} [textKey='name'] - Key for option text
 */
export function populateSelectFromObjects(selectId, data, defaultValue, valueKey = 'id', textKey = 'name') {
    const selectElement = requireElement(selectId);
    selectElement.innerHTML = '';
    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        selectElement.appendChild(option);
    });
    
    if (defaultValue) {
        /** @type {HTMLSelectElement} */ (selectElement).value = defaultValue;
    }
}
