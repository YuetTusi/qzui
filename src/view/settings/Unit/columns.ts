import { IDispatchFunc } from "@src/type/model";

export function getColumns(dispatch: IDispatchFunc) {
    let columns = [
        {
            title: '检验单位',
            dataIndex: 'm_strCheckOrganizationName',
            key: 'm_strCheckOrganizationName'
        },
        {
            title: '单位编号',
            dataIndex: 'm_strCheckOrganizationID',
            key: 'm_strCheckOrganizationID',
            width: 150,
        }
    ];
    return columns;
}