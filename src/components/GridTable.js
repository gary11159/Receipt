import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ReactToPrint from 'react-to-print';
import useGoogleSheets from 'use-google-sheets';
import { toast } from 'react-toastify';
import { off, onValue, ref, set, update } from 'firebase/database';
import { setDefaultLocale } from 'react-datepicker';

const GridTable = (props) => {
    const gridStyle = useMemo(() => ({ height: '500px', width: '860px', marginLeft: '20%' }), []);
    const [itemInfo, setItemInfo] = useState();

    let nowYear = new Date().getFullYear() - 1911;
    let nowMonth = new Date().getMonth() + 1;
    let nowDate = new Date().getDate();
    // 當前發票
    const [numberReceipt, setNumberReceipt] = React.useState();

    // 讀取品項
    const { data, loading, error } = useGoogleSheets({
        apiKey: process.env.REACT_APP_API_KEY,
        sheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
    });

    // 品項放入state (Google Sheet)
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
            else if (event.keyCode === 107 || event.keyCode === 45) {
                addItem();
            }
        };

        document.addEventListener('keydown', handleClick);

        return () => {
            document.removeEventListener('keydown', handleClick);
        };
    }, []);

    // 發票放入state
    useEffect(() => {
        if ((numberReceipt === undefined || numberReceipt === null || numberReceipt === '') &&
            (props.db != null && props.db != undefined && props.db != '')) {
            let db = props.db;
            props.setLoadingStatus(true);
            let startRef = ref(db, 'NowReceipt');
            onValue(startRef, (snapshot) => {
                let receipt = snapshot.val();
                setNumberReceipt(receipt);
                props.setLoadingStatus(false);
            });
        }
    }, [props.db]);

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

        props.gridRef.current.api.setColumnDefs(columnDefs);
    }

    // 欄位設置
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
            {
                field: 'priceTax', headerName: '含稅價格', editable: false,
                valueGetter: 'data.price * 1.05',
            },
            { field: 'amount', headerName: '數量' }
        ]
    }

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            sortable: true,
            filter: true,
            editable: true,
            resizable: true
        };
    }, []);

    const [rowData, setRowData] = useState([]);

    //新增空白Row
    function addItem() {
        let rowCount = props.gridRef.current.api.getDisplayedRowCount();

        if (rowCount >= 6) {
            toast.error('品項最多6個!');
            return;
        }
        props.gridRef.current.api.updateRowData({
            add: [{ item: '', price: 0, priceTax: 0, amount: 0 }]
        });
        let rowData = [];
        props.gridRef.current.api.forEachNode(node => rowData.push(node.data));
        props.onchangePrintData('rowData', rowData);
        setRowData(rowData);
        calculateMoney();
    }

    // 刪除所選的Row
    function removeSelected() {
        let selectedNodes = props.gridRef.current.api.getSelectedRows();
        props.gridRef.current.api.applyTransaction({ remove: selectedNodes });
        let rowData = [];
        props.gridRef.current.api.forEachNode(node => rowData.push(node.data));
        props.onchangePrintData('rowData', rowData);
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
                    props.gridRef.current.api.applyTransaction({ update: changedData });
                    return;
                }

            });

            let rowDataNew = [];
            props.gridRef.current.api.forEachNode(node => rowDataNew.push(node.data));
            props.onchangePrintData('rowData', rowDataNew);
        }

        calculateMoney();
    }

    // 計算金額
    function calculateMoney() {
        // 總金額
        let totalPrice = 0.0;
        // 稅金
        let priceTax = 0.0;
        // 金額
        let withoutTax = 0.0;
        props.gridRef.current.api.forEachNode((node) => {
            withoutTax = withoutTax + parseFloat(node.data.price) * parseInt(node.data.amount, 10);
            priceTax = priceTax + (parseFloat(node.data.price) * 1.05 - parseFloat(node.data.price)) * parseInt(node.data.amount, 10);
            totalPrice = totalPrice + (parseFloat(node.data.price) * 1.05 * parseInt(node.data.amount, 10));
        });

        document.getElementById("finalPrice").textContent = withoutTax.toFixed(2);
        document.getElementById("finalTax").textContent = priceTax.toFixed(2);
        document.getElementById("finalTotalPrice").textContent = totalPrice;

        props.onchangePrintData('money', {
            finalPrice: document.getElementById("finalPrice").textContent,
            finalTax: document.getElementById("finalTax").textContent,
            finalTotalPrice: document.getElementById("finalTotalPrice").textContent
        });
    }

    // 現在時間
    function getNowDate() {
        let final = nowYear + '.' +
            (nowMonth < 10 ? '0' + nowMonth : nowMonth)
            + '.' + nowDate + ' ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
        return final;
    }

    // 儲存前檢查資料
    function checkSaveData(customerID, customerName, number) {
        if (checkReceiptNumber(numberReceipt)) {
            toast.error('該發票號碼已新增過，請換一個');
            return false;
        }

        if (rowData === undefined || rowData === null || rowData === '' || rowData.length === 0) {
            toast.error('並未新增品項');
            return false;
        }
        if (customerID === undefined || customerID === null || customerID === '') {
            toast.error('客戶編號尚未填寫');
            return false;
        }
        if (customerName === undefined || customerName === null || customerName === '') {
            toast.error('客戶名稱尚未填寫');
            return false;
        }
        if (number === undefined || number === null || number === '') {
            toast.error('統編尚未填寫');
            return false;
        }
        if (numberReceipt == undefined || numberReceipt === null || numberReceipt === '') {
            toast.error('發票號碼尚未填寫');
            return false;
        }
        return true;
    }

    // 儲存資料
    function saveData(e) {
        let customerID = document.getElementById('customer').value;
        let customerName = document.getElementById('customerName').value;
        let number = document.getElementById('number').value;

        let finalPrice = document.getElementById("finalPrice").textContent;
        let finalTax = document.getElementById("finalTax").textContent;
        let finalTotalPrice = document.getElementById("finalTotalPrice").textContent;

        let memo1 = document.getElementById("memo1").value;
        let memo2 = document.getElementById("memo2").value;
        // true代表檢驗成功
        if (checkSaveData(customerID, customerName, number)) {
            let rowDataNew = [];
            props.gridRef.current.api.forEachNode(node => rowDataNew.push(node.data));
            // 塞入資料庫內容
            let receiptPostData = {
                [numberReceipt]: {
                    customerID: customerID,
                    customerName: customerName,
                    number: number,
                    dateTime: getNowDate(),
                    detailDatas: rowDataNew,
                    finalPrice: finalPrice,
                    finalTax: finalTax,
                    finalTotalPrice: finalTotalPrice,
                    memo1: memo1,
                    memo2: memo2
                }
            };

            let accountPostData = {
                [customerID]: {
                    customerName: customerName,
                    number: number
                }
            }

            // 更新發票
            update(ref(props.db, 'Receipt/' + new Date().getFullYear() + '' + (parseInt(new Date().getMonth()) + 1) + '/'), receiptPostData).then(() => {
                console.log("更新發票明細成功");
                // 更新客戶
                update(ref(props.db, 'ACCOUNT/'), accountPostData).then(() => {
                    console.log("更新客戶資料明細成功");
                    // 新增純發票號碼
                    update(ref(props.db, 'ReceiptNumber/'), { [numberReceipt]: '' }).then(() => {
                        console.log("新增純發票號碼成功");
                        // 更新當前發票
                        let newNumberReceipt = getNewNumberReceipt();
                        update(ref(props.db, '/'), { 'NowReceipt': newNumberReceipt }).then(() => {
                            setNumberReceipt(newNumberReceipt);
                            console.log("更新當前發票細成功");
                            setDefault();
                        }).catch(() => {
                            toast.error('更新當前發票發生錯誤，請盡速通知管理員！');
                        });
                    }).catch(() => {
                        toast.error('新增純發票號碼發生錯誤，請盡速通知管理員！');
                    });
                }).catch(() => {
                    toast.error('新增客戶資料發生錯誤，請盡速通知管理員！');
                });
            }).catch(() => {
                toast.error('新增發票明細發生錯誤，請盡速通知管理員！');
            });

        } else {
            e.preventDefault();
        };
    }

    // 初始化
    function setDefault() {
        setRowData([]);
        document.getElementById("finalPrice").textContent = 0;
        document.getElementById("finalTax").textContent = 0;
        document.getElementById("finalTotalPrice").textContent = 0;
        document.getElementById('memo1').value = '';
        document.getElementById('memo2').value = '';
    }

    // 獲取新的發票號碼
    function getNewNumberReceipt() {
        let nowReceipt = numberReceipt;

        while (checkReceiptNumber(nowReceipt)) {
            let english = numberReceipt.substring(0, 2);
            let num = '' + (parseInt(nowReceipt.substring(2, nowReceipt.length)) + 1);
            let numLength = num.length;

            for (let i = 0; i < 8 - numLength; i++) {
                num = '0' + num;
            }

            nowReceipt = english + num;
        }
        return nowReceipt;
    }


    // 檢查發票號碼有無重複(true代表有重複)
    function checkReceiptNumber(r) {
        let startRef = ref(props.db, 'ReceiptNumber/');
        let check = false;
        onValue(startRef, (snapshot) => {
            let runValue = snapshot.val()
            if (runValue != null && runValue != undefined && runValue != '') {
                Object.keys(runValue).forEach(function (key) {
                    if (key === r) {
                        check = true;
                    }
                });

            }
        });

        return check;
    }

    // 使用者更動發票號碼
    function userChangeReceipt(e) {
        let value = e.target.value;
        setNumberReceipt(value);
    }

    return (
        <>
            <Row>
                <Col>
                    日期：
                    <input type="text" id="date" name="date" readOnly style={{ borderRadius: 10, width: '10%', marginRight: 10, fontSize: 25, marginRight: 20 }}
                        defaultValue={getNowDate().substring(0, 9)}></input>
                    發票號碼：
                    <input type="text" id="receiptNumber" name="receiptNumber" style={{ borderRadius: 10, width: '12%', fontSize: 25 }} value={numberReceipt === undefined ? '' : numberReceipt} onChange={(e) => userChangeReceipt(e)}></input>
                    <Button variant="primary" onClick={() => addItem()} style={{ marginLeft: 20 }}>新增品項</Button>
                    <Button variant="danger" onClick={() => removeSelected()} style={{ marginLeft: 20 }}>移除所選的品項</Button>
                    {/* <Button variant="warning" style={{ marginLeft: 20 }}>檢視客編</Button> */}
                </Col>
            </Row>
            {/* <Row> */}
            {/* <Col> */}
            {/* <Button variant="primary" onClick={() => addItem()}>新增品項</Button> */}
            {/* <Button variant="danger" onClick={() => removeSelected()}>移除所選品項</Button> */}

            {/* </Col> */}
            {/* </Row> */}
            <Row className="ag-theme-alpine container1" style={gridStyle}>
                <AgGridReact
                    stopEditingWhenCellsLoseFocus={true}
                    ref={props.gridRef}
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
                    備註1：
                    <input type="text" id="memo1" name="memo1" style={{ borderRadius: 10, width: '20%', marginRight: 10 }}></input>
                    備註2：
                    <input type="text" id="memo2" name="memo" style={{ borderRadius: 10, width: '20%' }}></input>
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
                            saveData(e);

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
