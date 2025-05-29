// Vanilla JavaScript slider component to replace jQuery UI sliders
import { getElement } from './domUtils.js';

export class VanillaSlider {
    constructor(elementId, options = {}) {
        const container = getElement(elementId);
        if (!container) {
            throw new Error(`Slider container '${elementId}' not found`);
        }

        // Default options
        const defaults = {
            min: 0,
            max: 100,
            value: 0,
            step: 1,
            onChange: null,
            onSlide: null
        };

        const config = { ...defaults, ...options };
        
        // Create slider HTML structure
        container.innerHTML = `
            <div class="vanilla-slider-track">
                <div class="vanilla-slider-fill"></div>
                <div class="vanilla-slider-thumb" tabindex="0" role="slider" 
                     aria-valuemin="${config.min}" 
                     aria-valuemax="${config.max}" 
                     aria-valuenow="${config.value}"></div>
            </div>
        `;

        // Add CSS styles if not already added
        VanillaSlider.addStyles();

        // Get elements
        const track = container.querySelector('.vanilla-slider-track');
        const fill = container.querySelector('.vanilla-slider-fill');
        const thumb = container.querySelector('.vanilla-slider-thumb');

        // Store references and config
        const sliderData = {
            container,
            track,
            fill,
            thumb,
            config,
            isDragging: false,
            value: config.value
        };

        // Store instance data on the container (using non-standard property)
        container.vanillaSlider = sliderData;

        // Initialize position
        VanillaSlider.updateSliderPosition(sliderData);

        // Add event listeners
        VanillaSlider.addEventListeners(sliderData);
    }

    static addStyles() {
        if (document.getElementById('vanilla-slider-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'vanilla-slider-styles';
        styles.textContent = `
            .vanilla-slider-track {
                position: relative;
                height: 20px;
                background: #e0e0e0;
                border-radius: 10px;
                margin: 10px 0;
                cursor: pointer;
            }
            .vanilla-slider-fill {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                background: #007cba;
                border-radius: 10px;
                pointer-events: none;
            }
            .vanilla-slider-thumb {
                position: absolute;
                top: 50%;
                width: 20px;
                height: 20px;
                background: #007cba;
                border: 2px solid #fff;
                border-radius: 50%;
                cursor: grab;
                transform: translate(-50%, -50%);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                outline: none;
            }
            .vanilla-slider-thumb:hover {
                background: #005a8a;
            }
            .vanilla-slider-thumb:active,
            .vanilla-slider-thumb.dragging {
                cursor: grabbing;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            .vanilla-slider-thumb:focus {
                box-shadow: 0 0 0 3px rgba(0, 124, 186, 0.3);
            }
        `;
        document.head.appendChild(styles);
    }

    static addEventListeners(sliderData) {
        const { track, thumb } = sliderData;

        // Mouse events
        track.addEventListener('mousedown', (e) => VanillaSlider.handleMouseDown(e, sliderData));
        document.addEventListener('mousemove', (e) => VanillaSlider.handleMouseMove(e, sliderData));
        document.addEventListener('mouseup', () => VanillaSlider.handleMouseUp(sliderData));

        // Touch events for mobile
        track.addEventListener('touchstart', (e) => VanillaSlider.handleTouchStart(e, sliderData));
        document.addEventListener('touchmove', (e) => VanillaSlider.handleTouchMove(e, sliderData));
        document.addEventListener('touchend', () => VanillaSlider.handleTouchEnd(sliderData));

        // Keyboard events
        thumb.addEventListener('keydown', (e) => VanillaSlider.handleKeyDown(e, sliderData));
    }

    static handleMouseDown(e, sliderData) {
        e.preventDefault();
        sliderData.isDragging = true;
        sliderData.thumb.classList.add('dragging');
        VanillaSlider.updateValueFromEvent(e, sliderData, true);
    }

    static handleMouseMove(e, sliderData) {
        if (!sliderData.isDragging) {
            return;
        }
        e.preventDefault();
        VanillaSlider.updateValueFromEvent(e, sliderData, false);
    }

    static handleMouseUp(sliderData) {
        if (!sliderData.isDragging) {
            return;
        }
        sliderData.isDragging = false;
        sliderData.thumb.classList.remove('dragging');
        VanillaSlider.triggerChange(sliderData);
    }

    static handleTouchStart(e, sliderData) {
        e.preventDefault();
        sliderData.isDragging = true;
        sliderData.thumb.classList.add('dragging');
        VanillaSlider.updateValueFromEvent(e.touches[0], sliderData, true);
    }

    static handleTouchMove(e, sliderData) {
        if (!sliderData.isDragging) {
            return;
        }
        e.preventDefault();
        VanillaSlider.updateValueFromEvent(e.touches[0], sliderData, false);
    }

    static handleTouchEnd(sliderData) {
        if (!sliderData.isDragging) {
            return;
        }
        sliderData.isDragging = false;
        sliderData.thumb.classList.remove('dragging');
        VanillaSlider.triggerChange(sliderData);
    }

    static handleKeyDown(e, sliderData) {
        let newValue = sliderData.value;
        const step = sliderData.config.step;

        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
                newValue -= step;
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                newValue += step;
                break;
            case 'Home':
                newValue = sliderData.config.min;
                break;
            case 'End':
                newValue = sliderData.config.max;
                break;
            default:
                return;
        }

        e.preventDefault();
        VanillaSlider.setSliderValue(sliderData, newValue);
        VanillaSlider.triggerChange(sliderData);
    }

    static updateValueFromEvent(e, sliderData, isStart) {
        const rect = sliderData.track.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        const range = sliderData.config.max - sliderData.config.min;
        const newValue = sliderData.config.min + (position * range);
        
        VanillaSlider.setSliderValue(sliderData, newValue);
        
        if (isStart || sliderData.config.onSlide) {
            VanillaSlider.triggerSlide(sliderData);
        }
    }

    static setSliderValue(sliderData, value) {
        const { config } = sliderData;
        
        // Clamp value to bounds
        value = Math.max(config.min, Math.min(config.max, value));
        
        // Round to step
        if (config.step > 0) {
            value = Math.round((value - config.min) / config.step) * config.step + config.min;
        }
        
        sliderData.value = value;
        VanillaSlider.updateSliderPosition(sliderData);
        
        // Update ARIA attribute
        sliderData.thumb.setAttribute('aria-valuenow', value);
    }

    static updateSliderPosition(sliderData) {
        const { config, fill, thumb } = sliderData;
        const percentage = (sliderData.value - config.min) / (config.max - config.min) * 100;
        
        fill.style.width = `${percentage}%`;
        thumb.style.left = `${percentage}%`;
    }

    static triggerSlide(sliderData) {
        if (sliderData.config.onSlide) {
            sliderData.config.onSlide(sliderData.value);
        }
    }

    static triggerChange(sliderData) {
        if (sliderData.config.onChange) {
            sliderData.config.onChange(sliderData.value);
        }
    }

    // Public API methods
    static getValue(elementId) {
        const container = getElement(elementId);
        return container && container.vanillaSlider ? container.vanillaSlider.value : 0;
    }

    static setValue(elementId, value) {
        const container = getElement(elementId);
        if (container && container.vanillaSlider) {
            VanillaSlider.setSliderValue(container.vanillaSlider, value);
        }
    }

    static setOption(elementId, option, value) {
        const container = getElement(elementId);
        if (container && container.vanillaSlider) {
            const sliderData = container.vanillaSlider;
            sliderData.config[option] = value;
            
            if (option === 'min' || option === 'max') {
                sliderData.thumb.setAttribute(`aria-value${option}`, value);
                VanillaSlider.updateSliderPosition(sliderData);
            }
        }
    }

    static destroy(elementId) {
        const container = getElement(elementId);
        if (container && container.vanillaSlider) {
            container.innerHTML = '';
            delete container.vanillaSlider;
        }
    }
}
