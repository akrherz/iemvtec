/**
 * Table utility functions for DataTable creation and management
 */
import DataTable from 'datatables.net-dt';
import { requireElement } from 'iemjs/domUtils';

let lsrTable = null;
let sbwLsrTable = null;
let eventTable = null;

export function getEventTable() {
    return eventTable;
}
export function getLSRTable() {
    return lsrTable;
}
export function getSBWLSRTable() {
    return sbwLsrTable;
}

export function initEventTable() {
    const eventTableElement = document.getElementById('eventtable');
    if (eventTableElement) {
        eventTable = new DataTable(eventTableElement, {
            columns: [
                { data: 'id' },
                { data: 'product_issued' },
                { data: 'vtec_issued' },
                { data: 'initial_expire' },
                { data: 'vtec_expire' },
                { data: 'area_km2' },
                { data: 'locations' },
                { data: 'signature' }
            ],
            data: []
        });
    }
}

/**
 * Format function for displaying LSR remark details
 * @param {Object} d - The original data object for the row
 * @returns {string} HTML string for the remark display
 */
function remarkformat(d, idx) {
    return `<div id="lsr-detail-panel-${idx}" role="region" aria-label="Report details" style="margin-left: 10px;">` +
        '<strong>NWS Product:</strong>' +
        `<a target="_new" href="/p.php?pid=${d.product_id}">LSR Link</a> ` +
        `<strong>Remark:</strong> ${d.remark}</div>`;
}

/**
 * Create an LSR DataTable with expandable row details
 * @param {string} div - The ID of the table element
 */
function makeLSRTable(div) {
    const tableElement = requireElement(div);
    const table = new DataTable(tableElement, {
        select: 'single',
        columns: [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: '',
                render: (_data, _type, _row, meta) => {
                    const id = `lsr-detail-btn-${meta.row}`;
                    const panelId = `lsr-detail-panel-${meta.row}`;
                    return `<button type="button" id="${id}" class="btn btn-sm p-0 details-toggle" aria-expanded="false" aria-controls="${panelId}" aria-label="Show report details"><i class="bi bi-plus-square" aria-hidden="true"></i><span class="visually-hidden">Toggle details</span></button>`;
                },
                width: '28px',
            },
            { data: 'utc_valid' },
            { data: 'event' },
            { data: 'magnitude' },
            { data: 'city' },
            { data: 'county' },
            { data: 'remark', visible: false },
        ],
        order: [[1, 'asc']],
    });
    
    // Add event listener for opening and closing details
    tableElement.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        // Allow button or its icon child
        const btn = target.closest('button.details-toggle');
        if (!btn) {
            return;
        }
    const tr = btn.closest('tr');
        if (!tr) {
            return;
        }
        const icon = btn.querySelector('i.bi');
        if (!icon) {
            return;
        }

    const row = table.row(tr);
    const rowIdx = row.index();

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.classList.remove('shown');
            icon.classList.remove('bi-dash-square');
            icon.classList.add('bi-plus-square');
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-label', 'Show report details');
            const status = document.getElementById('map-status');
            if (status) {
                status.textContent = 'Collapsed report details';
            }
        } else {
            // Open this row
            row.child(remarkformat(row.data(), rowIdx)).show();
            tr.classList.add('shown');
            icon.classList.remove('bi-plus-square');
            icon.classList.add('bi-dash-square');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Hide report details');
            const status = document.getElementById('map-status');
            if (status) {
                status.textContent = 'Expanded report details';
            }
        }
    });

    table.on('user-select', (e, _dt, _type, cell) => {
        if (cell.node().classList.contains('details-control')) {
            e.preventDefault();
        }
    });
    return table;
}

export function initLSRTables(){
    lsrTable = makeLSRTable('lsrtable');
    sbwLsrTable = makeLSRTable('sbwlsrtable');
}