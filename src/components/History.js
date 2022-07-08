import React, { useCallback, useMemo, useRef, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

function History(props) {

    const componentRef = React.useRef();
    const gridStyle = useMemo(() => ({ height: '500px', width: '1450px' }), []);
    const [columnDefs, setColumnDefs] = useState([
        { field: 'accountNum', headerName: '客戶編號'},
        { field: 'receipt', headerName: '發票號碼'},
        { field: 'accountName', headerName: '客戶名稱'},
        { field: 'num', headerName: '統一編號'},
        { field: 'date', headerName: '日期'},
        { field: 'price', headerName: '金額' },
        { field: 'tax', headerName: '稅額' },
        { field: 'totalPrice', headerName: '總額' },
        { field: 'memo', headerName: '備註' }
    ]);
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
            editable: true,
        };
    }, []);

    const [rowData, setRowData] = useState([
        { accountNum: '3897', receipt: 'BG12345567', price: 929000, tax: 5000 },
    ]);

    function addItem() {
        setRowData([...rowData, { item: '', price: 0, amount: 0 }]);
    }

    return (
        <>
            <Container>
                <Row>
                    <Col style={{ textAlign: 'left' }}>
                        查詢週期
                        <input type="text" id="startDate" name="startDate" style={{ borderRadius: 10, width: '10%' }}></input>
                        -
                        <input type="text" id="endDate" name="endDate" style={{ borderRadius: 10, width: '10%' }}></input>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ textAlign: 'left' }}>
                        查詢客編
                        <input type="text" id="findAccount" name="findAccount" style={{ borderRadius: 10, width: '25%' }}></input>
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                        總筆數: 6筆    總金額: 129,150元
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
            </Container>
        </>
    )
}

export default History;