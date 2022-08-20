import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { onValue, ref, set, update, remove } from 'firebase/database';
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function EditCustomer(props) {

    // 檢查統一編號
    function check_tax_number(value) {
        const gui_number = value // 取欄位內容
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
            return false;
        }
        cnum.forEach((item, index) => {
            if (gui_number.charCodeAt() < 48 || gui_number.charCodeAt() > 57) {
                toast.error('統編錯誤，要有 8 個 0-9 數字組合');
                return false;
            }
            sum += cc(item * cx[index]);
        });
        if (sum % 10 === 0) {
            // 統編正確
        } else if (cnum[6] === '7' && (sum + 1) % 10 === 0) {
            // 統編正確
        } else {
            toast.error('統編錯誤');
            return false;
        }

        return true;
    }

    // 檢查資料
    function checkData() {
        let customer = document.getElementById('formCustomer').value;
        let customerName = document.getElementById('formName').value;
        let number = document.getElementById('formNum').value;

        if (customer != '' && customerName != '' && check_tax_number(number)) {
            return true;
        }
        if (customer == '') {
            toast.error('請輸入客戶編號');
            return false;
        }
        if (customerName == '') {
            toast.error('請輸入客戶名稱');
            return false;
        }

        return false;
    }

    // 修改資料
    function edit() {
        if (!checkData()) {
            return;
        }
        let customer = document.getElementById('formCustomer').value;
        let customerName = document.getElementById('formName').value;
        let number = document.getElementById('formNum').value;
        // 塞入資料庫內容
        let postData = {
            customerName: customerName,
            number: number
        };

        props.setLoadingStatus(true);
        remove(ref(props.db, 'ACCOUNT/' + customer)).then(() => {
            update(ref(props.db, 'ACCOUNT/' + customer), postData).then(() => {
                props.setLoadingStatus(false);
                toast.success('修改成功！');
                props.modalControl(true);
                props.editModalControl(false);

            }).catch(() => {
                props.setLoadingStatus(false);
                toast.error('修改客戶資料發生錯誤，請重新試試！');
            });
        }).catch(() => {
            props.setLoadingStatus(false);
            toast.error('修改客戶資料發生錯誤，請重新試試！');
        });
    }

    return (
        <>
            <Modal.Header>
                <Modal.Title></Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ backgroundColor: 'white', padding: 20, fontSize: 20 }}>
                    <div>
                        <Form>
                            <Form.Group className="mb-3" controlId="formCustomer">
                                <Form.Label>客戶編號</Form.Label>
                                <Form.Control type="customer" placeholder="請輸入客戶編號" defaultValue={props.rowSelectData.customer} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formName">
                                <Form.Label>客戶名稱</Form.Label>
                                <Form.Control type="name" placeholder="請輸入客戶名稱" defaultValue={props.rowSelectData.customerName} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formNum">
                                <Form.Label>統一編號</Form.Label>
                                <Form.Control type="num" placeholder="請輸入統一編號" defaultValue={props.rowSelectData.number} />
                            </Form.Group>
                            <Button variant="primary" onClick={() => edit()}>
                                修改
                            </Button>
                        </Form>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </>
    )
}


export default EditCustomer;