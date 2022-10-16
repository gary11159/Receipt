import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import GridTable from './GridTable';
import Customer from './Customer';
import Spinner from './Spinner';
import History from './History';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ToastContainer, toast } from 'react-toastify';
import { db } from './firebase';
import { onValue, ref, set, update } from 'firebase/database';


class ComponentToPrint extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let data = [];
        let dateTime = "";

        if (this.props.rowData !== null && this.props.rowData !== undefined && this.props.rowData !== '') {
            let dataCount = this.props.rowData.rowData.length;
            let px = 0;
            this.props.rowData.rowData.map((dataMap, index) => {
                if (px != 0) {
                    px += 5;
                }
                data.push(
                    <div style={{ paddingLeft: 30, textAlign: 'left', fontSize: 24, position: 'relative', bottom: px }}>
                        {dataMap.item}
                    </div>
                );

                px += 8;
                data.push(
                    <Row style={{ padding: 0, fontSize: 24, position: 'relative', bottom: px }}>
                        <Col style={{ textAlign: 'left', paddingLeft: 60, maxWidth: 237, whiteSpace: 'nowrap' }}>
                            <span>單價:$ {dataMap.price}</span>
                        </Col>
                        <Col style={{ textAlign: 'left', paddingLeft: 30, maxWidth: 237, whiteSpace: 'nowrap' }}>
                            <span>數量: {dataMap.amount}</span>
                        </Col>
                    </Row>
                );
            });

            // 處理西元年轉民國
            dateTime = new Date(this.props.rowData.date);
            dateTime = (dateTime.getFullYear() - 1911) + '.' +
                ((dateTime.getMonth() + 1) < 10 ? '0' + (dateTime.getMonth() + 1) : (dateTime.getMonth() + 1)) + '.' + 
                ((dateTime.getDate()) < 10 ? '0' + dateTime.getDate() : dateTime.getDate());
        }
        return (
            <div style={{ fontSize: '20px', marginTop: 100 }} className="printFont">
                <div style={{ display: 'flex', justifyContent: 'start' }}>
                </div>
                <table className='print allCenter' border="0" cellSpacing="0" cellPadding="0" style={{ margin: '0 auto', marginTop: '8px', width: 450, maxHeight: 200, minHeight: 200 }}>
                    <tbody>
                        <tr>
                            <td colSpan={3} >金三久貿易有限公司</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>新北市新店區中央七街89號3樓</td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={{ paddingRight: 5 }}>統編:90323620 電話:(02)2812-8989</td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ textAlign: 'center' }}>日期：{dateTime}</td>
                            <td colSpan={1} style={{ textAlign: 'left' }}>{this.props.customerData != null ? this.props.customerData.number : ''}</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ height: 370 }}>
                    {data}
                </div>
                <div className='allCenter'>
                    <span style={{ fontSize: 20 }}>{this.props.money == null ? '' :
                        this.props.money.finalPrice
                    }</span>
                </div>
                <div className='allCenter'>
                    <span style={{ fontSize: 20, position: 'relative', bottom: 8 }}>{this.props.money == null ? '' :
                        this.props.money.finalTax
                    }</span>
                </div>
                <div className='allCenter'>
                    <span style={{ fontSize: 20, position: 'relative', bottom: 16 }}>{this.props.money == null ? '' :
                        this.props.money.finalTotalPrice
                    }</span>
                </div>
            </div>
        )
    }
}

function Print(props) {

    const componentRef = React.useRef();
    const [loadingStatus, setLoadingStatus] = React.useState(false);
    const [curTab, setCurTab] = React.useState("tab1");
    const [database, setDatabase] = React.useState();

    // 客戶資料
    const [customerData, setCustomerData] = React.useState();
    // 品項等資料
    const [rowData, setRowData] = React.useState();
    // 金額
    const [money, setMoney] = React.useState();

    // 當前列印table
    const gridRef = useRef(null);

    // History Table
    const gridRef2 = useRef(null);

    useEffect(() => {
        // 讀取資料庫
        setDatabase(pre => db);
        setLoadingStatus(true);

        onValue(ref(db), snapshot => {
            setLoadingStatus(false);
        });



    }, []);

    // 列印資料欄位有異動
    function onchangePrintData(type, data) {
        // 客戶資料
        if (type === 'custom') {
            setCustomerData(() => ({
                customer: document.getElementById('customer').value,
                customerName: document.getElementById('customerName').value,
                number: document.getElementById('number').value
            }));
        }

        // 日期 品項等
        else if (type === 'rowData') {
            setRowData(() => ({
                rowData: data,
                date: document.getElementById('date').value
            }));
        }

        //算金額
        else if (type === 'money') {
            setMoney(pre => data);
        }
    }

    return (
        <>
            {loadingStatus &&
                <Spinner />
            }

            <div className="tabs" style={{ width: '70%', paddingTop: 20 }}>
                <div className="tab-2" style={curTab === 'tab1' ? { zIndex: 9 } : null}>
                    <label htmlFor="tab2-1">當前列印</label>
                    <input id="tab2-1" name="tabs-two" type="radio" defaultChecked onClick={() => setCurTab("tab1")} />
                    <div style={{ paddingTop: 0 }}>
                        <Customer
                            db={db}
                            setLoadingStatus={(status) => setLoadingStatus(status)}
                            onchangePrintData={() => onchangePrintData('custom', '')}
                        />
                        <GridTable
                            gridRef={gridRef}
                            componentRef={componentRef}
                            setLoadingStatus={(status) => setLoadingStatus(status)}
                            onchangePrintData={(type, data) => onchangePrintData(type, data)}
                            db={db}
                        />
                    </div>
                </div>
                <div className="tab-2" style={curTab === 'tab2' ? { zIndex: 9 } : null}>
                    <label htmlFor="tab2-2">歷史資料</label>
                    <input id="tab2-2" name="tabs-two" type="radio" onClick={() => setCurTab("tab2")} />

                    <History
                        gridRef={gridRef2}
                        style={{ fontSize: 10 }}
                        setLoadingStatus={(status) => setLoadingStatus(status)}
                        db={db}
                    />
                </div>
            </div>
            <Row style={{ display: 'none' }}>
                {/* <Row > */}
                <Col>
                    <ComponentToPrint
                        ref={el => (componentRef.current = el)}
                        customerData={customerData}
                        rowData={rowData}
                        money={money}
                    />

                </Col>
            </Row>
            <ToastContainer autoClose={2000} />

        </>
    )
}

export default Print;