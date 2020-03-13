import { ColumnProps } from "antd/lib/table";
import { Dispatch } from 'redux';
import { UIRetOneInfo } from '@src/schema/UIRetOneInfo';
import { helper } from '@utils/helper';

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
        key: 'caseName',
        render(text: string) {
            return text.split('_')[0];
        }
    }, {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 200,
        align: 'center',
        render(text: string, record: Case) {
            const { caseName } = record;
            const time = helper.parseDate(caseName.split('_')[1], 'YYYYMMDDHHmmss').format('YYYY年M月D日 HH:mm:ss');
            return time;
        }
    }];
    return columns;
}

export { Case, getColumns };