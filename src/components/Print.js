import ReactToPrint from 'react-to-print';
import React from 'react';
import GridTable from './GridTable';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
class ComponentToPrint extends React.Component {
    render() {
        return (
            <div style={{ fontSize: '30px' }} className="printFont">
                <div style={{ display: 'flex', justifyContent: 'start' }}>
                </div>
                <table className='print' style={{ margin: '0 auto', marginTop: '10px' }}>
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
                            <td colSpan={1} style={{ textAlign: 'left' }}>日期</td>
                            <td colSpan={1}>111/03/08</td>
                            <td colSpan={1}>12345678</td>
                        </tr>

                        {/* 兩個br */}
                        <tr><td>&nbsp;</td></tr>
                        <tr><td>&nbsp;</td></tr>

                        <tr style={{ borderBottom: '2px solid' }}>
                            <td colSpan={1} style={{ textAlign: 'left' }}>品名</td>
                            <td colSpan={1}>未稅單價</td>
                            <td colSpan={1}>數量</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'left' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1}>100</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'left' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1}>100</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'left' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1}>100</td>
                        </tr>
                        <tr>
                            <td colSpan={1} style={{ textAlign: 'left' }}>貼紙</td>
                            <td colSpan={1}>38.1</td>
                            <td colSpan={1}>100</td>
                        </tr>


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

    return (
        <>
            <Row style={{ display: 'none' }}>
                <Col>
                    <ComponentToPrint
                        ref={el => (componentRef.current = el)}
                    />
                    <ReactToPrint
                        onBeforePrint={(e) => {
                        }}
                        trigger={() =>
                            <button>儲存並列印</button>

                        }
                        content={() => componentRef.current}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    <GridTable />
                </Col>
            </Row>
        </>
    )
}

export default Print;