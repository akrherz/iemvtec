// Production entry point for VTEC Browser
// This file is used for production builds - no development shims

import './style.css';
import { main } from './main.js';
import { setUpdate, selectElementContents } from './appUtils.js';

// Expose functions globally for HTML onclick handlers
// @ts-ignore
window.setUpdate = setUpdate;
// @ts-ignore
window.selectElementContents = selectElementContents;

// Simple production initialization
// In production, the content is already rendered by Python
main();
