// UGC Table
import DataTable from 'datatables.net-dt';


let ugcTable = null;
export function getUGCTable() {
    return ugcTable;
}

/**
 * Create a UGC DataTable with expandable row details
 * @param {string} div - The ID of the table element
 */
export function makeUGCTable(div) {
    const ugcTableElement = document.getElementById(div);
    if (ugcTableElement) {
        ugcTable = new DataTable(ugcTableElement, {
            columns: [
                { data: 0 }, // UGC
                { data: 1 }, // Name
                { data: 2 }, // Status
                { data: 3 }, // Issuance
                { data: 4 }, // Issue
                { data: 5 }, // Initial Expire
                { data: 6 }  // Expire
            ]
        });
    }

    return ugcTable;
}