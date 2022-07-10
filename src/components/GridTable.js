import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ReactToPrint from 'react-to-print';
import useGoogleSheets from 'use-google-sheets';
import { Store } from 'react-notifications-component';
import { ReactNotifications } from 'react-notifications-component'
import { toast } from 'react-toastify';

const GridTable = (props) => {
    const gridRef = useRef(null);
    const gridStyle = useMemo(() => ({ height: '500px', width: '860px', marginLeft: '20%' }), []);
    const [itemInfo, setItemInfo] = useState();

    // 讀取品項
    const { data, loading, error } = useGoogleSheets({
        apiKey: process.env.REACT_APP_API_KEY,
        sheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
    });

    // 品項放入state
    useEffect(() => {
        if (loading) {
            props.setLoadingStatus(true);
        } else if (error) {
            props.setLoadingStatus(false);
            toast.error("讀取品項失敗！請重新讀取頁面或是通知管理者");
        } else {
            props.setLoadingStatus(false);
            setItemInfo(data[0].data);
            toast.success("讀取品項成功！");
        }
    }, [loading]);

    // 選項塞入column
    useEffect(() => {
        if (itemInfo != null && itemInfo != undefined && itemInfo != '') {
            settingColumnDefs();
        }

    }, [itemInfo]);



    // 監聽按鍵
    useEffect(() => {
        const handleClick = event => {
            // delete按鍵
            if (event.keyCode === 46) {
                removeSelected();
            }
            // +按鍵
            else if (event.keyCode === 107) {
                addItem();
            }
        };

        document.addEventListener('keydown', handleClick);

        return () => {
            document.removeEventListener('keydown', handleClick);
        };
    }, []);

    // update品項至table
    function settingColumnDefs() {
        let columnDefs = getColumnDefs();
        columnDefs.forEach(function (colDef, index) {
            if (colDef.field === 'item') {
                itemInfo.map((item) => {
                    colDef.cellEditorParams.values.push(item.item);
                });

            }
        });

        gridRef.current.api.setColumnDefs(columnDefs);
    }

    function getColumnDefs() {
        return [
            {
                field: 'item', rowDrag: true, headerName: '品項',
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                    values: [],
                },
            },
            { field: 'price', headerName: '未稅單價' },
            { field: 'priceTax', headerName: '含稅價格' },
            { field: 'amount', headerName: '數量' }
        ]
    }

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
        };
    }, []);

    const [rowData, setRowData] = useState([
        { item: '貼紙', price: 38.1, priceTax: 40, amount: 100 },
        { item: '名片', price: 57.11, priceTax: 60, amount: 100 },
        { item: '條碼', price: 476.19, priceTax: 500, amount: 50 },
    ]);

    //新增空白Row
    function addItem() {
        gridRef.current.api.updateRowData({
            add: [{ item: '', price: 0, priceTax: 0, amount: 0 }]
        });
        let rowData = [];
        gridRef.current.api.forEachNode(node => rowData.push(node.data));
        setRowData(rowData);
        calculateMoney();
    }

    // 刪除所選的Row
    function removeSelected() {
        let selectedNodes = gridRef.current.api.getSelectedRows();
        gridRef.current.api.applyTransaction({ remove: selectedNodes });
        let rowData = [];
        gridRef.current.api.forEachNode(node => rowData.push(node.data));
        setRowData(rowData);
        calculateMoney();
    }

    // Table的cell有變動時
    function onCellValueChanged(params) {
        if (params.colDef.field === 'item') {
            let changedData = [params.data];
            itemInfo.map((item) => {
                if (changedData[0].item === item.item) {
                    changedData[0].price = item.price;
                    changedData[0].priceTax = item.priceTax;
                    gridRef.current.api.applyTransaction({ update: changedData });
                    return;
                }

            });
        }

        calculateMoney();
    }

    // 計算金額
    function calculateMoney() {
        // 總金額
        let totalPrice = 0;
        // 稅金
        let priceTax = 0;
        // 金額
        let withoutTax = 0;
        gridRef.current.api.forEachNode((node) => {
            withoutTax = withoutTax + parseInt(node.data.price, 10) * parseInt(node.data.amount, 10) ;
            priceTax = priceTax + (parseInt(node.data.priceTax, 10) - parseInt(node.data.price, 10)) * parseInt(node.data.amount, 10) ;
            totalPrice = totalPrice + ( parseInt(node.data.priceTax, 10) * parseInt(node.data.amount, 10));
        });

        document.getElementById("finalPrice").textContent = withoutTax;
        document.getElementById("finalTax").textContent = priceTax;
        document.getElementById("finalTotalPrice").textContent = totalPrice;
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
            {/* <Row> */}
            {/* <Col> */}
            {/* <Button variant="primary" onClick={() => addItem()}>新增品項</Button> */}
            {/* <Button variant="danger" onClick={() => removeSelected()}>移除所選品項</Button> */}

            {/* </Col> */}
            {/* </Row> */}
            <Row className="ag-theme-alpine" style={gridStyle}>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    rowDragManaged={true}
                    animateRows={true}
                    rowSelection={'multiple'}
                    rowMultiSelectWithClick={true}
                    onCellValueChanged={(params) => onCellValueChanged(params)}
                ></AgGridReact>
            </Row>
            <Row>
                <Col>
                    備註：
                    <input type="text" id="memo" name="memo" style={{ borderRadius: 10, width: '20%' }}></input>
                </Col>
            </Row>
            <Row style={{ paddingBottom: 0 }}>
                <Col>
                    金額：
                    <span id="finalPrice" style={{ color: 'yellow', paddingRight: 30 }}>0</span>
                    稅金 :
                    <span id="finalTax" style={{ color: 'yellow', paddingRight: 30 }}>0</span>
                    總金額：
                    <span id="finalTotalPrice" style={{ color: 'yellow', paddingRight: 30, fontSize: 35 }}>
                        0
                    </span>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ReactToPrint
                        onBeforePrint={(e) => {
                        }}
                        trigger={() =>
                            <Button variant="success">列印發票</Button>

                        }
                        content={() => props.componentRef.current}
                    />
                </Col>
            </Row>
        </>
    );
};

export default GridTable;
