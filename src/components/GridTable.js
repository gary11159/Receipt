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
    const gridStyle = useMemo(() => ({ height: '500px', width: '627px' }), []);
    const [columnDefs, setColumnDefs] = useState([
        { field: 'item', rowDrag: true, headerName: '品項' },
        { field: 'price', headerName: '未稅單價' },
        { field: 'amount', headerName: '數量' }
    ]);
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
        };
    }, []);

    const [rowData, setRowData] = useState([
        { item: '貼紙', price: 38.1, amount: 100 },
        { item: '名片', price: 57.11, amount: 100 },
        { item: '條碼', price: 476.19, amount: 50 },
    ]);

    function addItem() {
        setRowData([...rowData, { item: '', price: 0, amount: 0 }]);
    }

    return (
        <>
            <Row>
                <Col>
                    <Button variant="primary" onClick={() => addItem()}>新增品項</Button>
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
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    rowDragManaged={true}
                    animateRows={true}
                ></AgGridReact>
            </Row>
            {/* <Row>
                <GoogleSheet/>
            </Row> */}
        </>
    );
};

export default GridTable;
