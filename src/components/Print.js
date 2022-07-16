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

        if (this.props.rowData !== null && this.props.rowData !== undefined && this.props.rowData !== '') {
            let dataCount = this.props.rowData.rowData.length;
            this.props.rowData.rowData.map((dataMap, index) => {
                data.push(
                    <tr key={index}>
                        <td colSpan={1} style={{ textAlign: 'center' }}>{dataMap.item}</td>
                        <td colSpan={1}>{dataMap.price}</td>
                        <td colSpan={1} style={{ textAlign: 'center' }}>{dataMap.amount}</td>
                    </tr>
                );
            });

            // 補填空格
            for (let i = 0; i < 14 - dataCount; i++) {
                data.push(
                    <tr key={i+100}><td>&nbsp;</td></tr>
                );
            }
        }
        return (
            <div style={{ fontSize: '20px', marginTop: 50 }} className="printFont">
                <div style={{ display: 'flex', justifyContent: 'start' }}>
                </div>
                <table className='print' border="0" cellSpacing="0" cellPadding="0" style={{ margin: '0 auto', marginTop: '10px', width: 450 }}>
                    <tbody>
                        <tr>
                            <td colSpan={3} >{this.props.customerData != null ? this.props.customerData.customerName : ''}</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>新北市三重區溪尾街108巷34號</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>統編:{this.props.customerData != null ? this.props.customerData.number : ''}  電話:(02)-22868488</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'right' }}>日期</td>
                            <td colSpan={1}>{this.props.rowData != null ? this.props.rowData.date : ''}</td>
                            <td colSpan={1} style={{ textAlign: 'left' }}>{this.props.customerData != null ? this.props.customerData.customer : ''}</td>
                        </tr>

                        {/* 兩個br */}
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>

                        <tr style={{ borderBottom: '2px solid' }}>
                            <td colSpan={1} style={{ textAlign: 'center' }}>品名</td>
                            <td colSpan={1}>未稅單價</td>
                            <td colSpan={1} style={{ textAlign: 'center' }}>數量</td>
                        </tr>

                        {data}
                        <tr>
                            <td></td>
                            <td colSpan={1}>{this.props.money == null ? '' :
                                this.props.money.finalPrice
                            }</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colSpan={1}>{this.props.money == null ? '' :
                                this.props.money.finalTax
                            }</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colSpan={1}>{this.props.money == null ? '' :
                                this.props.money.finalTotalPrice
                            }</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
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

    const gridRef = useRef(null);

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

                    <History />
                </div>
            </div>
            <Row style={{display: 'none'}}>
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