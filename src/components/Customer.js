import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

function Customer(props) {

    const componentRef = React.useRef();

    return (
        <>
            <div className="row center">
                客戶編號：
                <div className="col-15">
                    <input type="text" id="customer" name="customer" style={{borderRadius: 10, width: '80%'}}></input>
                </div>
                客戶名稱：
                <div className="col-15" style={{textAlign: "left"}}>
                    <label htmlFor="fname">國泰人壽</label>
                </div>
                統一編號：
                <div className="col-15" style={{textAlign: "left"}}>
                    <label htmlFor="fname">123123</label>
                </div>
            </div>
        </>
    )
}

export default Customer;