// DEVELOPMENT ONLY entry point for VTEC Browser
// This file contains development shims and should NOT be used in production
// Production builds use content.js instead

import './style.css';
import { main } from './main.js';
import { setUpdate, selectElementContents } from './appUtils.js';

// Expose functions globally for HTML onclick handlers
window.setUpdate = setUpdate;
window.selectElementContents = selectElementContents;

// Simple initialization
class VTECApp {
    constructor() {
        this.init();
    }

    async init() {
        // In development, load content dynamically
        await this.loadDevContent();
        // Initialize the main application logic
        // main() now handles waiting for DOM readiness internally
        main();
    }

    async loadDevContent() {
        try {
            // In development, load content directly from the src directory
            const response = await fetch('/_index_content.html');
            if (response.ok) {
                const content = await response.text();
                const contentEl = document.getElementById('vtec-content');
                if (contentEl) {
                    contentEl.innerHTML = content;
                    console.log('Development: Content loaded successfully');
                } else {
                    console.warn('Development: vtec-content element not found');
                    this.showDevPlaceholder();
                }
            } else {
                console.log('Development: Could not load content from file');
                this.showDevPlaceholder();
            }
        } catch (error) {
            console.log(`Development: Loading static content placeholder ${error.message}`);
            this.showDevPlaceholder();
        }
    }

    showDevPlaceholder() {
        const contentEl = document.getElementById('vtec-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div style="padding: 20px; background: #f8f9fa; border-radius: 5px; margin: 20px;">
                    <h2>VTEC Browser - Development Mode</h2>
                    <p>This is a development placeholder. In production, this content comes from your Python server.</p>
                    <p>To see the full app, make sure your Python server is running on port 8080.</p>
                    <div style="margin-top: 20px;">
                        <h3>Available endpoints:</h3>
                        <ul>
                            <li><code>/geojson/*</code> - GeoJSON data endpoints</li>
                            <li><code>/json/*</code> - JSON data endpoints</li>
                            <li><code>/vtec/_index_content.html</code> - Main content template</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }
}

window._app = new VTECApp(); 
