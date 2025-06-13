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
                { data: 'ugc' },
                { data: 'name' },
                { data: 'status' },
                { data: 'utc_product_issue' },
                { data: 'utc_issue' },
                { data: 'utc_init_expire' },
                { data: 'utc_expire' }
            ]
        });
    }

    return ugcTable;
}