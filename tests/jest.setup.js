import { TextEncoder, TextDecoder } from 'util';

class ResizeObserverPolyfill {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ResizeObserver = ResizeObserverPolyfill;
global.ShadowRoot = window.ShadowRoot;
global.getComputedStyle = window.getComputedStyle;
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;
