import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import CustomTooltip from './Tooltips';
import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { off, onValue, ref, set, update, child } from 'firebase/database';

function History(props) {

    const gridStyle = useMemo(() => ({ height: '600px', width: '1350px' }), []);
    const [startDate, setStartDate] = React.useState();
    const [endDate, setEndDate] = React.useState();
    const [customer, setCustomer] = React.useState();
    const [money, setMoney] = React.useState(0);
    const [rowCount, setRowCount] = React.useState(0);

    const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
    const locale = {
        localize: {
            month: n => months[n]
        },
        formatLong: {
            date: () => 'mm/dd/yyyy'
        }
    }
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'accountNum', headerName: '客戶編號',
        },
        {
            field: 'receipt', headerName: '發票號碼', tooltipField: 'accountNum',
            tooltipComponentParams: { color: '#ececec' }
        },
        { field: 'accountName', headerName: '客戶名稱' },
        { field: 'number', headerName: '統一編號' },
        { field: 'date', headerName: '日期' },
        { field: 'memo1', headerName: '備註1' },
        { field: 'memo2', headerName: '備註2' }
    ]);
    const defaultColDef = useMemo(() => {
        return {
            sortable: true,
            filter: true,
            editable: true,
            tooltipComponent: CustomTooltip,
        };
    }, []);

    const [rowData, setRowData] = useState([]);

    const sizeToFit = useCallback(() => {
        props.gridRef.current.api.sizeColumnsToFit();
    }, []);

    // 使用者輸入月份總表
    const [finalDateTime, setFinalDateTime] = React.useState([]);

    function againPostData(money, dataCount) {
        let dateTime = endDate.getFullYear() + '' + (endDate.getMonth() + 1);
        let startRef = ref(props.db, 'Receipt/' + dateTime);
        return onValue(startRef, (snapshot) => {
            let monthData = snapshot.val();
            if (monthData === undefined || monthData === null || monthData === '' || monthData.length === 0) {
                setRowCount(0);
                toast.error('查無資料');
                props.setLoadingStatus(false);
                return;
            } else {
                setRowCount(pre => pre + Object.keys(monthData).length);
                for (let data in monthData) {
                    console.log(monthData[data].customerID, customer)
                    if (monthData[data].customerID == customer) {
                        dataCount++;
                        money += parseInt(monthData[data].finalTotalPrice, 10);
                        setRowData(oldArray => [...oldArray, {
                            accountNum: monthData[data].customerID,
                            receipt: data,
                            accountName: monthData[data].customerName,
                            number: monthData[data].number,
                            date: monthData[data].dateTime.substring(0, 9),
                            memo1: monthData[data].memo1,
                            memo2: monthData[data].memo2,
                            detailDatas: monthData[data].detailDatas,
                            finalPrice: monthData[data].finalPrice,
                            finalTax: monthData[data].finalTax,
                            finalTotalPrice: monthData[data].finalTotalPrice
                        }])
                    }
                }

                if (dataCount === 0) {
                    setRowCount(0);
                    toast.error('查無資料');
                }
                setMoney(money);
                props.setLoadingStatus(false);
            }
        }, {
            onlyOnce: true
        });
    }

    // 處理後臺傳回的資料
    useEffect(() => {
        if (startDate === undefined) {
            return;
        }
        if (rowData === undefined || rowData === null || rowData === '' || rowData.length === 0) {
            props.setLoadingStatus(true);
            if (finalDateTime.length < 2) {
                toast.error('查詢發生問題，請再試一次');
                return;
            }

            let dateTime = startDate.getFullYear() + '' + (startDate.getMonth() + 1);
            let startRef = ref(props.db, 'Receipt/' + dateTime);
            return onValue(startRef, (snapshot) => {
                let monthData = snapshot.val();
                let money = 0;
                let dataCount = 0;
                if (monthData === undefined || monthData === null || monthData === '' || monthData.length === 0) {
                    againPostData(money, dataCount);
                } else {
                    setRowCount(pre => pre + Object.keys(monthData).length);
                    for (let data in monthData) {
                        if (monthData[data].customerID == customer) {
                            dataCount++;
                            money += parseInt(monthData[data].finalTotalPrice, 10);
                            setRowData(oldArray => [...oldArray, {
                                accountNum: monthData[data].customerID,
                                receipt: data,
                                accountName: monthData[data].customerName,
                                number: monthData[data].number,
                                date: monthData[data].dateTime.substring(0, 9),
                                memo1: monthData[data].memo1,
                                memo2: monthData[data].memo2,
                                detailDatas: monthData[data].detailDatas,
                                finalPrice: monthData[data].finalPrice,
                                finalTax: monthData[data].finalTax,
                                finalTotalPrice: monthData[data].finalTotalPrice
                            }])
                        }
                    }

                    againPostData(money, dataCount);
                }
            }, {
                onlyOnce: true
            });
        }
    }, [rowData])

    // 計算兩個月分相差多少個月
    function monthDayDiff() {
        let flag = [1, 3, 5, 7, 8, 10, 12, 4, 6, 9, 11, 2];
        let year = endDate.getFullYear() - startDate.getFullYear();
        let month = endDate.getMonth() - startDate.getMonth();
        let day = endDate.getDate() - startDate.getDate();
        if (month < 0) {
            year--;
            month = endDate.getMonth() + (12 - startDate.getMonth());
        }
        if (day < 0) {
            month--;
            let index = flag.findIndex((temp) => {
                return temp === startDate.getMonth() + 1
            });
            let monthLength;
            if (index <= 6) {
                monthLength = 31;
            } else if (index > 6 && index <= 10) {
                monthLength = 30;
            } else {
                monthLength = 28;
            }
            day = endDate.getDate() + (monthLength - startDate.getDate());
        }
        return (12 * year + month);
    }

    // 選完月份或客編
    function chooseDone() {
        if (startDate === undefined || startDate === null || startDate === '' ||
            endDate === undefined || endDate === null || endDate === '' ||
            customer === undefined || customer === null || customer === '') {
            toast.error('請輸入日期及客戶編號');
            return;
        }

        let monthCount = monthDayDiff();
        if (monthCount >= 3) {
            toast.error('月份相隔不得超過三個月');
            return;
        }
        let tempDate = new Date(startDate);
        finalDateTime.push(startDate.getFullYear() + '' + (startDate.getMonth() + 1));
        for (let i = 0; i < monthCount; i++) {
            tempDate.setMonth(tempDate.getMonth() + 1);
            finalDateTime.push(tempDate.getFullYear() + '' + (tempDate.getMonth() + 1));
        }

        setFinalDateTime(finalDateTime);
        setRowCount(0);
        setRowData(pre => []);

    }

    // 回傳有common的金額
    function moditfyMoney(number) {
        return new Intl.NumberFormat('en-IN').format(number);
    }

    // 查詢月份異動
    function dateChange(date) {
        let tempDate = new Date(date);
        tempDate.setMonth(tempDate.getMonth() + 1);
        setStartDate(date);
        setEndDate(tempDate);
    }

    return (
        <>
            <Container>
                <Row>
                    <Col style={{ textAlign: 'left', display: 'flex' }}>
                        查詢月份：
                        <DatePicker
                            selected={startDate}
                            locale={locale}
                            dateFormat="yyyy-MM"
                            showMonthYearPicker
                            onChange={(date) => dateChange(date)}
                        />-
                        <DatePicker
                            selected={endDate}
                            locale={locale}
                            dateFormat="yyyy-MM"
                            showMonthYearPicker
                            readOnly
                        />
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                        <Button variant="success" style={{ width: 150 }} onClick={() => chooseDone()}>查詢</Button>
                    </Col>
                </Row>
                <Row>
                    <Col style={{ textAlign: 'left' }}>
                        查詢客編：
                        <input type="text" id="findAccount" name="findAccount" style={{ borderRadius: 10, width: '25%' }}
                            onChange={(e) => setCustomer(e.target.value)}
                        ></input>
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                        總筆數: {rowCount}筆    總金額: {moditfyMoney(money)}元
                    </Col>
                </Row>
                <Row className="ag-theme-alpine" style={gridStyle}>
                    <AgGridReact
                        ref={props.gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        rowDragManaged={true}
                        animateRows={true}
                        tooltipShowDelay={0}
                        onGridReady={sizeToFit}
                    ></AgGridReact>
                </Row>
            </Container>
        </>
    )
}

export default History;