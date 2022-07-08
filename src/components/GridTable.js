import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import GoogleSheet from '../API/GoogleSheet';
import ReactToPrint from 'react-to-print';

const GridTable = (props) => {
    const gridRef = useRef(null);
    const gridStyle = useMemo(() => ({ height: '500px', width: '860px', marginLeft: '20%' }), []);

    const cellEditorSelector = (params) => {
        return {
            component: 'agRichSelectCellEditor',
            params: {
                values: ['Male', 'Female'],
            },
            popup: true,
        };
    };

    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'item', rowDrag: true, headerName: '品項',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: ['11', '22'],
            },
        },
        { field: 'price', headerName: '未稅單價' },
        { field: 'priceTax', headerName: '含稅價格' },
        { field: 'amount', headerName: '數量' }
    ]);
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
        };
    }, []);

    const [rowData, setRowData] = useState([
        { item: '貼紙', price: 38.1, amount: 100 },
        { item: '名片', price: 57.11, amount: 100 },
        { item: '條碼', price: 476.19, amount: 50 },
    ]);

    //新增空白Row
    function addItem() {
        setRowData([...rowData, { item: '', price: 0, amount: 0 }]);
    }

    // 刪除所選的Row
    function removeSelected() {
        let selectedNodes = gridRef.current.api.getSelectedRows();
        gridRef.current.api.applyTransaction({ remove: selectedNodes });
        let rowData = [];
        gridRef.current.api.forEachNode(node => rowData.push(node.data));
        setRowData(rowData);
    }

    return (
        <>
            <Row>
                <Col>
                    日期：
                    <input type="text" id="date" name="date" style={{ borderRadius: 10, width: '10%', marginRight: 10 }}></input>
                    發票號碼：
                    <input type="text" id="number" name="number" style={{ borderRadius: 10, width: '12%' }}></input>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button variant="primary" onClick={() => addItem()}>新增品項</Button>
                    <Button variant="danger" onClick={() => removeSelected()}>移除所選品項</Button>
                    <ReactToPrint
                        onBeforePrint={(e) => {
                        }}
                        trigger={() =>
                            <Button variant="success">列印</Button>

                        }
                        content={() => props.componentRef.current}
                    />
                </Col>
            </Row>
            <Row className="ag-theme-alpine" style={gridStyle}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowDragManaged={true}
                    animateRows={true}
                    rowSelection={'multiple'}
                ></AgGridReact>
            </Row>
            <Row>
                <Col>
                    備註：
                    <input type="text" id="memo" name="memo" style={{ borderRadius: 10, width: '20%' }}></input>
                </Col>
            </Row>
            {/* <Row>
                <GoogleSheet/>
            </Row> */}
        </>
    );
};

export default GridTable;
