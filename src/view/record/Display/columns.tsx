import { ColumnProps } from "antd/lib/table";
import { Dispatch } from 'redux';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';


/**
 * 案件
 */
interface Case {
    /**
     * 案件名称
     */
    caseName: string;
    /**
     * 手机列表
     */
    phone: UIRetOneInfo[];
}

/**
 * 表头定义
 * @param dispatch 派发方法
 */
function getColumns(dispatch: Dispatch<any>): ColumnProps<Case>[] {

    const columns: ColumnProps<any>[] = [{
        title: '案件名称',
        dataIndex: 'caseName',
        key: 'caseName'
    }];
    return columns;
}

export { Case, getColumns };