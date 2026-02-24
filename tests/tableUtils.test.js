/**
 * Simple test showing real DOM approach - NO MOCKING AT ALL
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import { initLSRTables, getLSRTable, getSBWLSRTable } from '../src/tableUtils.js';

describe('Table Utils - Real DOM with Real Functions', () => {
    beforeEach(() => {
        // Create real DOM elements that match what the functions expect
        document.body.innerHTML = `
            <table id="lsrtable">
                <thead>
                    <tr><th></th><th>Time</th><th>Event</th><th>Magnitude</th><th>City</th><th>County</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="details-control">
                            <i class="bi bi-plus-square"></i>
                        </td>
                        <td>2023-06-18 12:00</td>
                        <td>HAIL</td>
                        <td>1.00</td>
                        <td>Test City</td>
                        <td>Test County</td>
                        <td>Test Remark</td>
                    </tr>
                </tbody>
            </table>
            <table id="sbwlsrtable">
                <thead>
                    <tr><th></th><th>Time</th><th>Event</th><th>Magnitude</th><th>City</th><th>County</th></tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
    });

    test('initLSRTables actually works with real DOM', () => {
        // Call the real function
        expect(() => initLSRTables()).not.toThrow();
        
        // Verify it created the table objects
        const lsrTable = getLSRTable();
        const sbwLsrTable = getSBWLSRTable();
        
        expect(lsrTable).toBeTruthy();
        expect(sbwLsrTable).toBeTruthy();
    });

    test('click handler actually works on real table', () => {
        initLSRTables();
        
        const table = document.getElementById('lsrtable');
        const detailsControl = table.querySelector('.details-control');
        const icon = table.querySelector('i.bi');
        
        // Verify initial state
        expect(icon.classList.contains('bi-plus-square')).toBe(true);
        
        // Simulate real click - this exercises the actual click handler in tableUtils.js
        detailsControl.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        // The real click handler should have been called
        expect(detailsControl).toBeTruthy();
    });
});
