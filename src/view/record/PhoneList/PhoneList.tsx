import React, { Component, ReactNode } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { IObject, StoreComponent } from '@src/type/model';
import Title from '@src/components/title/Title';
import Table from 'antd/lib/table';
import { getColumns } from './columns';
import { helper } from '@src/utils/helper';
import './PhoneList.less';

interface IProp extends StoreComponent {
    phoneList: IObject;
}
interface IState { }

/**
 * 某案件的手机列表
 */
class PhoneList extends Component<IProp, IState>{
    constructor(props: IProp) {
        super(props);
    }
    componentDidMount() {
        this.fetchPhoneListData();
    }
    fetchPhoneListData() {
        const { dispatch } = this.props;
        let data: any = [
            { col0: 'iPhone7 Plus', col1: '刘某某', col2: '刘警员', col3: '1', key: helper.getKey() },
            { col0: 'HUAWEI P30', col1: '刘某某', col2: '刘警员', col3: '1', key: helper.getKey() },
            { col0: 'SAMSUNG A90', col1: '张某某', col2: '刘警员', col3: '2', key: helper.getKey() }
        ];
        data = data.map((item: IObject) => {
            return { ...item, col3: ~~(Math.random() * 5) };
        });
        dispatch({ type: 'phoneList/setPhoneListData', payload: data });
    }
    render(): ReactNode {
        const { dispatch, phoneList: { phoneListData } } = this.props;
        return <div className="phone-list-root">
            <Title
                returnText="返回"
                onReturn={() => dispatch(routerRedux.push('/record'))}
                okText="确定"
                onOk={() => this.fetchPhoneListData()}>数据解析</Title>
            <div className="scroll-panel">
                <Table
                    columns={getColumns(dispatch)}
                    dataSource={phoneListData}>
                </Table>
            </div>
        </div>;
    }
}

export default connect((state: IObject) => ({ phoneList: state.phoneList }))(PhoneList);