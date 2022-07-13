import React from 'react';
import { onValue, ref, set, update } from 'firebase/database';

function Customer(props) {

    const componentRef = React.useRef();
    
    // 查看有無客戶資料
    function onBlurID(e) {
        props.setLoadingStatus(true);
        let account = e.target.value;
        let db = props.db;
        let startRef = ref(db, 'ACCOUNT/' + account);
        onValue(startRef, (snapshot) => {
            let accountInfo = snapshot.val();
            if( accountInfo != null && accountInfo != undefined && accountInfo != '' ) {
                document.getElementById('customerName').value = accountInfo.accountName;
                document.getElementById('number').value = accountInfo.number;
            } else {
                document.getElementById('customerName').value = '';
                document.getElementById('number').value = '';
            }
            props.setLoadingStatus(false);
        });
    }

    return (
        <>
            <div className="row center">
                客戶編號：
                <div className="col-15">
                    <input type="text" id="customer" name="customer" style={{ borderRadius: 10, width: '80%' }}  onBlur={(e) => onBlurID(e)}></input>
                </div>
                客戶名稱：
                <div className="col-15" style={{ textAlign: "left" }}>
                    <input type="text" id="customerName" name="customerName" style={{ borderRadius: 10, width: '100%' }}></input>
                </div>
                統一編號：
                <div className="col-15" style={{ textAlign: "left" }}>
                    <input type="text" id="number" name="number" style={{ borderRadius: 10, width: '80%' }}></input>
                </div>
            </div>
        </>
    )
}

export default Customer;