import { IDispatchFunc } from "@src/type/model";

export function getColumns(dispatch: IDispatchFunc) {
    let columns = [
        {
            title: '检验单位',
            dataIndex: 'm_strName',
            key: 'm_strName'
        },
        {
            title: '单位编号',
            dataIndex: 'm_strID',
            key: 'm_strID',
            width: 150,
        }
    ];
    return columns;
}