import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { onValue, ref, set, update, remove } from 'firebase/database';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { confirmAlert } from 'react-confirm-alert'; // Import

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

    // 刪除資料
    function deleteData() {
        let selectRowCustom = gridRef.current.api.getSelectedRows()[0].customer;
        props.setLoadingStatus(true);
        remove(ref(props.db, 'ACCOUNT/' + selectRowCustom)).then(() => {
            props.setLoadingStatus(false);
            props.modalControl(false);
        }).catch(() => {
            props.setLoadingStatus(false);
            props.modalControl(false);
            toast.error('刪除客戶資料發生錯誤，請重新試試！');
        });
    }

    const handleClickCustomUI = useCallback(() => {
        if (gridRef.current.api.getSelectedRows().length == 0) {
            toast.error('請選擇資料');
            return;
        }
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h1 style={{ fontWeight: 'bold' }}>確認刪除</h1>
                        <Button onClick={onClose} variant='secondary'>取消</Button>
                        <Button onClick={() => {
                            deleteData();
                            onClose();
                        }} variant='danger'>刪除</Button>
                    </div>
                )
            }
        })
    })

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
                        <Button variant='danger' onClick={() =>
                            handleClickCustomUI()
                        }>刪除所選</Button>
                    </div>
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        pagination={true}
                        tooltipShowDelay={0}
                        paginationPageSize={10}
                        onGridReady={sizeToFit}
                        onRowDoubleClicked={(e) => editData(e)}
                        rowSelection='single'
                    ></AgGridReact>
                </div>

            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>

        </>
    )
}

export default HistoryCustomer;