// DEVELOPMENT ONLY entry point for VTEC Browser
// This file contains development shims and should NOT be used in production
// Production builds use content.js instead

import './style.css';
import { main } from './main.js';

// Simple initialization
class VTECApp {
    constructor() {
        this.init();
    }

    async init() {
        // In development, load content dynamically
        await this.loadDevContent();
        // Initialize the main application logic
        main();
    }

    async loadDevContent() {
        try {
            // In development, try to load content from your existing server
            const response = await fetch('/vtec/_index_content.html');
            if (response.ok) {
                const content = await response.text();
                const contentEl = document.getElementById('vtec-content');
                if (contentEl) {
                    contentEl.innerHTML = content;
                }
            } else {
                console.log('Development: Could not load content from Python server');
                // Show development placeholder
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

// Initialize the app
window._app = new VTECApp();  // @ts-ignore
