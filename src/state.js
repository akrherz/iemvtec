export const StateKeys = {
    WFO: 'wfo',
    RADAR: 'radar',
    RADAR_PRODUCT: 'radar_product',
    RADAR_PRODUCT_TIME: 'radar_product_time',
    ISSUE: 'issue',
    EXPIRE: 'expire',
    ACTIVE_TAB: 'active_tab',
    ACTIVE_UPDATE: 'active_update',
};

const state = {
    [StateKeys.WFO]: null,
    [StateKeys.RADAR]: null,
    [StateKeys.RADAR_PRODUCT]: null,
    [StateKeys.RADAR_PRODUCT_TIME]: null,
    [StateKeys.ISSUE]: null,
    [StateKeys.EXPIRE]: null,
    [StateKeys.ACTIVE_TAB]: 'info',
    [StateKeys.ACTIVE_UPDATE]: null,
};

const subscribers = {};

export function getState(key) {
    return state[key];
}

export function setState(key, value) {
    // console.error(`Setting state: ${key} = ${value}`);
    if (!key) {
        return;
    }
    state[key] = value;
    notifySubscribers(key);
}

export function subscribeToState(key, callback) {
    if (!subscribers[key]) {
        subscribers[key] = [];
    }
    if (typeof callback === 'function') {
        subscribers[key].push(callback);
    }
}

function notifySubscribers(key) {
    if (subscribers[key]) {
        subscribers[key].forEach((callback) => callback(state[key]));
    }
}
