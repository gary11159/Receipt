import React, { useMemo, useState } from 'react';
import Table from 'react-bootstrap/Table';

export default (props) => {
    const data = useMemo(
        () => props.api.getDisplayedRowAtIndex(props.rowIndex).data,
        []
    );

    let detailItem = [];
    if (data.detailDatas != null) {
        data.detailDatas.map((item, index) => {
            detailItem.push(
                <tr key={index}>
                    <td>{data.detailDatas[index].item}</td>
                    <td>{data.detailDatas[index].price}</td>
                    <td>{data.detailDatas[index].amount}</td>
                </tr>
            )
        });
    }

    return (

        <div
            className="custom-tooltip"
            style={{ backgroundColor: props.color || 'white', fontSize: '10px !important' }}
        >
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>品項</th>
                        <th>未稅單價</th>
                        <th>數量</th>
                    </tr>
                </thead>
                <tbody>
                    {detailItem}
                </tbody>

            </Table>

            <div>
                金額：
                <span id="finalPrice" style={{ color: 'black', paddingRight: 30 }}>{data.finalPrice}</span>
                稅金 :
                <span id="finalTax" style={{ color: 'black', paddingRight: 30 }}>{data.finalTax}</span>
                總金額：
                <span id="finalTotalPrice" style={{ color: 'black', paddingRight: 30, fontSize: 35 }}>
                    {data.finalTotalPrice}
                </span>
            </div>
        </div>
    )
};