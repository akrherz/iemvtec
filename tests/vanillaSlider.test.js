/**
 * Tests for VanillaSlider component
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Mock domUtils before importing VanillaSlider
jest.mock('iemjs/domUtils', () => ({
    getElement: jest.fn()
}));

import { VanillaSlider } from '../src/vanillaSlider.js';

describe('VanillaSlider', () => {
    let mockContainer;
    let mockGetElement;

    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '<div id="test-slider"></div>';
        
        mockContainer = document.getElementById('test-slider');
        mockGetElement = require('iemjs/domUtils').getElement;
        mockGetElement.mockReturnValue(mockContainer);

        global.getComputedStyle = jest.fn(() => ({
            getPropertyValue: jest.fn()
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create slider with default options', () => {
        new VanillaSlider('test-slider');
        
        expect(mockContainer.querySelector('.vanilla-slider-track')).toBeTruthy();
        expect(mockContainer.querySelector('.vanilla-slider-fill')).toBeTruthy();
        expect(mockContainer.querySelector('.vanilla-slider-thumb')).toBeTruthy();
    });

    test('should create slider with custom options', () => {
        const options = {
            min: 10,
            max: 90,
            value: 50,
            step: 5
        };
        
        new VanillaSlider('test-slider', options);
        
        const thumb = mockContainer.querySelector('.vanilla-slider-thumb');
        expect(thumb.getAttribute('aria-valuemin')).toBe('10');
        expect(thumb.getAttribute('aria-valuemax')).toBe('90');
        expect(thumb.getAttribute('aria-valuenow')).toBe('50');
    });

    test('should get slider value', () => {
        new VanillaSlider('test-slider', { value: 25 });
        
        const value = VanillaSlider.getValue('test-slider');
        expect(value).toBe(25);
    });

    test('should set slider value', () => {
        new VanillaSlider('test-slider');
        
        VanillaSlider.setValue('test-slider', 75);
        const value = VanillaSlider.getValue('test-slider');
        expect(value).toBe(75);
    });

    test('should clamp value to bounds', () => {
        new VanillaSlider('test-slider', { min: 0, max: 100 });
        
        VanillaSlider.setValue('test-slider', 150);
        expect(VanillaSlider.getValue('test-slider')).toBe(100);
        
        VanillaSlider.setValue('test-slider', -10);
        expect(VanillaSlider.getValue('test-slider')).toBe(0);
    });

    test('should respect step value', () => {
        new VanillaSlider('test-slider', { min: 0, max: 100, step: 10 });
        
        VanillaSlider.setValue('test-slider', 23);
        expect(VanillaSlider.getValue('test-slider')).toBe(20);
        
        VanillaSlider.setValue('test-slider', 27);
        expect(VanillaSlider.getValue('test-slider')).toBe(30);
    });

    test('should call onChange callback', () => {
        const onChangeMock = jest.fn();
        new VanillaSlider('test-slider', { onChange: onChangeMock });
        
        const sliderData = mockContainer['vanillaSlider'];
        VanillaSlider.triggerChange(sliderData);
        
        expect(onChangeMock).toHaveBeenCalled();
    });

    test('should call onSlide callback', () => {
        const onSlideMock = jest.fn();
        new VanillaSlider('test-slider', { onSlide: onSlideMock });
        
        const sliderData = mockContainer['vanillaSlider'];
        VanillaSlider.triggerSlide(sliderData);
        
        expect(onSlideMock).toHaveBeenCalled();
    });

    test('should update slider options', () => {
        new VanillaSlider('test-slider');
        
        VanillaSlider.setOption('test-slider', 'max', 200);
        const sliderData = mockContainer['vanillaSlider'];
        expect(sliderData.config.max).toBe(200);
    });

    test('should handle keyboard navigation', () => {
        new VanillaSlider('test-slider', { value: 50, step: 10 });
        
        const thumb = mockContainer.querySelector('.vanilla-slider-thumb');
        const sliderData = mockContainer['vanillaSlider'];
        
        const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        rightArrowEvent.preventDefault = jest.fn();
        
        VanillaSlider.handleKeyDown(rightArrowEvent, sliderData);
        expect(VanillaSlider.getValue('test-slider')).toBe(60);
        
        const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        leftArrowEvent.preventDefault = jest.fn();
        
        VanillaSlider.handleKeyDown(leftArrowEvent, sliderData);
        expect(VanillaSlider.getValue('test-slider')).toBe(50);
    });

    test('should destroy slider', () => {
        new VanillaSlider('test-slider');
        
        expect(mockContainer['vanillaSlider']).toBeTruthy();
        
        VanillaSlider.destroy('test-slider');
        expect(mockContainer['vanillaSlider']).toBeUndefined();
        expect(mockContainer.innerHTML).toBe('');
    });

    test('should add styles only once', () => {
        new VanillaSlider('test-slider');
        const stylesCount1 = document.querySelectorAll('#vanilla-slider-styles').length;
        
        new VanillaSlider('test-slider');
        const stylesCount2 = document.querySelectorAll('#vanilla-slider-styles').length;
        
        expect(stylesCount1).toBe(1);
        expect(stylesCount2).toBe(1);
    });

    test('should return 0 for non-existent slider', () => {
        mockGetElement.mockReturnValue(null);
        
        const value = VanillaSlider.getValue('non-existent');
        expect(value).toBe(0);
    });

    test('should handle mouse events', () => {
        new VanillaSlider('test-slider', { min: 0, max: 100 });
        
        const track = mockContainer.querySelector('.vanilla-slider-track');
        const thumb = mockContainer.querySelector('.vanilla-slider-thumb');
        const sliderData = mockContainer['vanillaSlider'];
        
        track.getBoundingClientRect = jest.fn(() => ({
            left: 0,
            width: 100
        }));
        
        const mouseDownEvent = { 
            clientX: 50, 
            preventDefault: jest.fn() 
        };
        
        VanillaSlider.handleMouseDown(mouseDownEvent, sliderData);
        expect(sliderData.isDragging).toBe(true);
        expect(thumb.classList.contains('dragging')).toBe(true);
        
        VanillaSlider.handleMouseUp(sliderData);
        expect(sliderData.isDragging).toBe(false);
        expect(thumb.classList.contains('dragging')).toBe(false);
    });
});
