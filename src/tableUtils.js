/**
 * Table utility functions for DataTable creation and management
 */
import DataTable from 'datatables.net-dt';

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
        eventTable = new DataTable(eventTableElement);
    }
}

/**
 * Format function for displaying LSR remark details
 * @param {Object} d - The original data object for the row
 * @returns {string} HTML string for the remark display
 */
function remarkformat(d) {
    return `<div style="margin-left: 10px;"><strong>Remark:</strong> ${d.remark}</div>`;
}

/**
 * Create an LSR DataTable with expandable row details
 * @param {string} div - The ID of the table element
 */
function makeLSRTable(div) {
    const tableElement = document.getElementById(div);
    if (!tableElement) {
        console.error(`Table element with id ${div} not found`);
        return null;
    }
    
    const table = new DataTable(tableElement, {
        select: 'single',
        columns: [
            {
                className: 'details-control',
                orderable: false,
                data: null,
                defaultContent: '',
                render: () => {
                    return '<i class="fa fa-plus-square" aria-hidden="true"></i>';
                },
                width: '15px',
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
        
        const td = target.closest('td.details-control');
        if (!td) {
            return;
        }
        
        const tr = td.closest('tr');
        if (!tr) {
            return;
        }
        
        const icon = tr.querySelector('i.fa');
        if (!icon) {
            return;
        }
        
        const row = lsrTable.row(tr);

        if (row.child.isShown()) {
            // This row is already open - close it
            row.child.hide();
            tr.classList.remove('shown');
            icon.classList.remove('fa-minus-square');
            icon.classList.add('fa-plus-square');
        } else {
            // Open this row
            row.child(remarkformat(row.data())).show();
            tr.classList.add('shown');
            icon.classList.remove('fa-plus-square');
            icon.classList.add('fa-minus-square');
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