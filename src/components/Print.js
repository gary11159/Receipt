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
    render() {
        return (
            <div style={{ fontSize: '20px', marginTop: 50 }} className="printFont">
                <div style={{ display: 'flex', justifyContent: 'start' }}>
                </div>
                <table className='print' border="0" cellSpacing="0" cellPadding="0" style={{ margin: '0 auto', marginTop: '10px', width: 450 }}>
                    <tbody>
                        <tr>
                            <td colSpan={3} >金牛科技有限公司</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>新北市三重區溪尾街108巷34號</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>統編:16981021  電話:(02)-22868488</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'right' }}>日期</td>
                            <td colSpan={1}>111/03/08</td>
                            <td colSpan={1} style={{ textAlign: 'left' }}>12345678</td>
                        </tr>

                        {/* 兩個br */}
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>

                        <tr style={{ borderBottom: '2px solid' }}>
                            <td colSpan={1} style={{ textAlign: 'center' }}>品名</td>
                            <td colSpan={1}>未稅單價</td>
                            <td colSpan={1} style={{ textAlign: 'center' }}>數量</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'center' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1} style={{ textAlign: 'center' }}>100</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'center' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1} style={{ textAlign: 'center' }}>100</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'center' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1} style={{ textAlign: 'center' }}>100</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'center' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1} style={{ textAlign: 'center' }}>100</td>
                        </tr>


                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>
                        <tr>
                            <td></td>
                            <td colSpan={1}>34933.33</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colSpan={1}>1746.67</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td colSpan={1}>36680.00</td>
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

    const [customerData, setCustomerData] = React.useState();

    useEffect(() => {
        // 讀取資料庫
        setDatabase(pre => db);
        setLoadingStatus(true);

        onValue(ref(db), snapshot => {
            setLoadingStatus(false);
            toast.success("讀取資料成功！");
        });

        

    }, []);


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
                        />
                        <GridTable
                            componentRef={componentRef}
                            setLoadingStatus={(status) => setLoadingStatus(status)}
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
            <Row style={{ display: 'none' }}>
                <Col>
                    <ComponentToPrint
                        ref={el => (componentRef.current = el)}
                    />

                </Col>
            </Row>
            <ToastContainer autoClose={2000} />
        </>
    )
}

export default Print;