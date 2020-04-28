import React, { FC, useEffect } from 'react';
import { connect } from 'dva';
import Empty from 'antd/lib/empty';
import Table from 'antd/lib/table';
import { helper } from '@utils/helper';
import { CaseDataModel, ExtendMyPhoneInfo } from '@src/model/case/CaseData/innerPhoneTable';
import { Prop } from './componentTyps';
import { getColumns } from './columns';
import './InnerPhoneTable.less';

const InnerPhoneTable: FC<Prop> = (props) => {

    const { caseData, loading } = props.innerPhoneTable;

    useEffect(() => {
        const { dispatch } = props;
        dispatch({ type: 'innerPhoneTable/fetchPhoneDataByCase', payload: props.caseName });
    }, []);

    let data: ExtendMyPhoneInfo[] = [];
    let temp = caseData.find((item: CaseDataModel) => item.caseName === props.caseName);
    if (temp !== undefined) {
        data = temp.phoneDataList;
    }

    return <div className="case-inner-table">
        <Table<ExtendMyPhoneInfo>
            columns={getColumns(props, props.caseName)}
            dataSource={data}
            loading={loading}
            pagination={false}
            size="middle"
            locale={{ emptyText: <Empty description="无取证数据" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            rowClassName={(record: ExtendMyPhoneInfo, index: number) => index % 2 === 0 ? 'even-row' : 'odd-row'}
            rowKey={(record: ExtendMyPhoneInfo) => helper.getKey()}>
        </Table>
    </div>;
};

export default connect((state: any) => ({ innerPhoneTable: state.innerPhoneTable }))(InnerPhoneTable);