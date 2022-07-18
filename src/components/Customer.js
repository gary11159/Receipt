import React from 'react';
import { onValue, ref, set, update } from 'firebase/database';
import { toast } from 'react-toastify';

function Customer(props) {

    const componentRef = React.useRef();

    // 查看有無客戶資料
    function onBlurID(e) {
        let account = e.target.value;
        if (account == '') {
            return;
        }
        let db = props.db;
        props.setLoadingStatus(true);
        let startRef = ref(db, 'ACCOUNT/' + account);
        onValue(startRef, (snapshot) => {
            let accountInfo = snapshot.val();
            if (accountInfo != null && accountInfo != undefined && accountInfo != '') {
                document.getElementById('customerName').value = accountInfo.customerName;
                document.getElementById('number').value = accountInfo.number;
            } else {
                document.getElementById('customerName').value = '';
                document.getElementById('number').value = '';
            }
            props.setLoadingStatus(false);
            props.onchangePrintData();
        });


    }

    // 檢查統一編號
    function check_tax_number(e) {
        const gui_number = e.target.value // 取欄位內容
        const cx = [1, 2, 1, 2, 1, 2, 4, 1];
        const cnum = gui_number.split('');
        let sum = 0;
        function cc(num) {
            let total = num;
            if (total > 9) {
                let s = total.toString();
                const n1 = s.substring(0, 1) * 1;
                const n2 = s.substring(1, 2) * 1;
                total = n1 + n2;
            }
            return total;
        }
        if (gui_number.length !== 8) {
            toast.error('統編錯誤，要有 8 個數字');
            document.getElementById('number').value = '';
            props.onchangePrintData();
            return;
        }
        cnum.forEach((item, index) => {
            if (gui_number.charCodeAt() < 48 || gui_number.charCodeAt() > 57) {
                toast.error('統編錯誤，要有 8 個 0-9 數字組合');
                document.getElementById('number').value = '';
                props.onchangePrintData();
                return;
            }
            sum += cc(item * cx[index]);
        });
        if (sum % 10 === 0) {
            // 統編正確
        } else if (cnum[6] === '7' && (sum + 1) % 10 === 0) {
            // 統編正確
        } else {
            toast.error('統編錯誤');
            document.getElementById('number').value = '';
            props.onchangePrintData();
        }

        props.onchangePrintData();
    }
    return (
        <>
            <div className="row center">
                客戶編號：
                <div className="col-15">
                    <input type="text" id="customer" name="customer" style={{ borderRadius: 10, width: '80%' }} onBlur={(e) => onBlurID(e)} onChange={() => props.onchangePrintData()}></input>
                </div>
                客戶名稱：
                <div className="col-15" style={{ textAlign: "left" }}>
                    <input type="text" id="customerName" name="customerName" style={{ borderRadius: 10, width: '100%' }} onChange={() => props.onchangePrintData()}></input>
                </div>
                統一編號：
                <div className="col-15" style={{ textAlign: "left" }}>
                    <input type="text" id="number" name="number" style={{ borderRadius: 10, width: '80%' }} onBlur={(e) => check_tax_number(e)} maxLength={8}></input>
                </div>
            </div>
        </>
    )
}

export default Customer;