import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { onValue, ref, set, update } from 'firebase/database';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

function HistoryCustomer(props) {

    const gridStyle = useMemo(() => ({ height: '600px', width: '750px' }), []);
    const gridRef = useRef();
    const [rowData, setRowData] = useState([]);

    const [columnDefs, setColumnDefs] = useState([
        { field: 'customer', headerName: '客戶編號' },
        { field: 'customerName', headerName: '客戶名稱' },
        { field: 'number', headerName: '統一編號' }
    ]);

    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
            enablePivot: true,
            resizable: true
        };
    }, []);

    const sizeToFit = useCallback(() => {
        gridRef.current.api.sizeColumnsToFit();
    }, []);

    // 取得客戶資訊
    useEffect(() => {
        props.setLoadingStatus(true);
        let startRef = ref(props.db, 'ACCOUNT/');
        onValue(startRef, (snapshot) => {
            let runValue = snapshot.val();
            if (runValue != null && runValue != undefined && runValue != '') {
                Object.keys(runValue).forEach(function (key) {
                    setRowData(oldArray => [...oldArray, {
                        customer: key,
                        customerName: runValue[key].customerName,
                        number: runValue[key].number
                    }]);
                });
            }
            props.setLoadingStatus(false);
        });
    }, []);

    const onFilterTextBoxChanged = useCallback(() => {
        gridRef.current.api.setQuickFilter(
            document.getElementById('filter-text-box').value
        );
    }, []);

    function editData(e) {
        props.setRowSelectData(e.data);
        props.editModalControl(true);
        props.modalControl(false);
    }
    return (
        <>
            <Modal.Header>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="ag-theme-alpine" style={gridStyle}>
                    <div className='allCenter'>
                        <input
                            style={{ borderRadius: 10, marginBottom: 10 }}
                            type="text"
                            id="filter-text-box"
                            placeholder="搜尋..."
                            onInput={onFilterTextBoxChanged}
                        />
                    </div>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowDragManaged={true}
                        animateRows={true}
                        pagination={true}
                        tooltipShowDelay={0}
                        paginationPageSize={10}
                        onGridReady={sizeToFit}
                        onRowDoubleClicked={(e) => editData(e)}
                    ></AgGridReact>
                </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </>
    )
}

export default HistoryCustomer;