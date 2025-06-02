/**
 * Tab creation utility functions for building dynamic tabs and tab panes
 */

/**
 * Utility function to create tab element HTML
 * @param {string} href - The tab href
 * @param {string} dataUpdate - The data-update attribute
 * @param {string} label - The tab label
 * @param {boolean} isActive - Whether the tab is active
 * @returns {string} HTML string for the tab
 */
export function createTabHTML(href, dataUpdate, label, isActive = false) {
    const activeClass = isActive ? ' class="active"' : '';
    return `<li${activeClass}><a href="${href}" data-update="${dataUpdate}" onclick="setUpdate('${dataUpdate}');" data-toggle="tab">${label}</a></li>`;
}

/**
 * Utility function to create tab pane HTML
 * @param {string} id - The tab pane id
 * @param {string} content - The tab content
 * @param {boolean} isActive - Whether the tab pane is active
 * @returns {string} HTML string for the tab pane
 */
export function createTabPaneHTML(id, content, isActive = false) {
    const activeClass = isActive ? ' active' : '';
    return `<div class="tab-pane${activeClass}" id="${id}">${content}</div>`;
}
