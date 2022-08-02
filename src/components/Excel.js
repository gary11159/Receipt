import React from "react";
import ReactExport from "react-export-excel";
import Button from 'react-bootstrap/Button';


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function Excel(props) {

    // 是否要打開按鈕
    const [checkDisabled, setCheckDisabled] = React.useState(true);
    const [fileName, setFileName] = React.useState();
    const componentRef = React.useRef();

    React.useEffect(() => {
        if (props.rowData.length === 0) {
            setCheckDisabled(true);
        } else {
            let startDate = document.getElementById('startDate').value;
            let endDate = document.getElementById('endDate').value;
            setFileName(startDate + '到' + endDate + '匯出');
            setCheckDisabled(false);
        }
    }, [props.rowData]);

    function downloadExcel() {
        if (componentRef.current !== null) {
            componentRef.current.click();
        }
    }


    return (
        <>
            <ExcelFile filename={fileName} element={<Button ref={componentRef} style={{ display: "none" }}></Button>}>
                <ExcelSheet data={props.rowData} name="歷史資料">
                    <ExcelColumn label="客戶編號" value="accountNum" />
                    <ExcelColumn label="發票號碼" value="receipt" />
                    <ExcelColumn label="客戶名稱" value="accountName" />
                    <ExcelColumn label="統一編號" value="number" />
                    <ExcelColumn label="日期" value="date" />
                    <ExcelColumn label="備註1" value="memo1" />
                    <ExcelColumn label="備註2" value="memo2" />
                    <ExcelColumn label="賣方統一編號" value={() => "90323620"} />
                    <ExcelColumn label="賣方名稱" value={() => "金三久貿易有限公司"}/>
                    <ExcelColumn label="金額" value="finalPrice" />
                    <ExcelColumn label="稅金" value="finalTax" />
                    <ExcelColumn label="總金額" value="finalTotalPrice" />
                </ExcelSheet>
            </ExcelFile>
            <Button variant="warning"
                style={{ width: 150 }}
                disabled={checkDisabled}
                onClick={() => downloadExcel()}
                className={checkDisabled ? 'not-allow' : ''}
            >
                匯出檔案</Button>
        </>
    )

}

export default Excel;